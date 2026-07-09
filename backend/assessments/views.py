# backend/assessments/views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from users.models import Learner
from .models import AssessmentQuestion, AssessmentAttempt, AssessmentResponse, LiteracyProfile
from .serializers import QuestionSerializer, LiteracyProfileSerializer


@api_view(['GET'])
def get_questions(request):
    """
    GET /api/assessments/questions?type=reading&language=hi
    Returns that assessment's questions in the requested language,
    WITHOUT the correct_answer field.
    """
    assessment_type = request.query_params.get('type')
    language = request.query_params.get('language', 'en')

    if assessment_type not in ['reading', 'writing', 'comprehension']:
        return Response(
            {'error': 'type must be one of: reading, writing, comprehension'},
            status=status.HTTP_400_BAD_REQUEST
        )

    questions = AssessmentQuestion.objects.filter(
        assessment_type=assessment_type,
        language=language
    ).order_by('order')

    # Fallback: if no questions exist yet in that language, use English
    # rather than showing the learner a blank assessment.
    if not questions.exists():
        questions = AssessmentQuestion.objects.filter(
            assessment_type=assessment_type,
            language='en'
        ).order_by('order')

    serializer = QuestionSerializer(questions, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


def _score_writing_answer(text, min_words):
    """
    Heuristic writing score (0.0 to 1.0). NOT true content/grammar grading —
    that requires an NLP/AI model, which is out of scope for this milestone.
    This catches obvious junk (keyboard mashing, repeated words, empty gibberish)
    and rewards longer, more varied text with partial credit instead of a
    blunt pass/fail.
    """
    words = [w for w in text.strip().split() if w]
    word_count = len(words)
    if word_count == 0:
        return 0.0

    lower_words = [w.lower() for w in words]
    unique_ratio = len(set(lower_words)) / word_count
    avg_len = sum(len(w) for w in words) / word_count

    def is_gibberish(word):
        # Flags things like "aaaaa" or "zzzzzz" — a real word rarely repeats
        # the same character for its entire length.
        return len(word) >= 2 and len(set(word.lower())) == 1

    gibberish_ratio = sum(1 for w in words if is_gibberish(w)) / word_count

    score = 1.0

    # Not enough words yet — scale down proportionally rather than zero it out
    if word_count < min_words:
        score *= word_count / min_words

    # Same word(s) repeated over and over (e.g. "good good good good")
    if unique_ratio < 0.5:
        score *= 0.4 + unique_ratio

    # Words suspiciously short on average (e.g. "a a a a a a")
    if avg_len < 2:
        score *= 0.5

    # Penalize proportion of gibberish "words"
    score *= (1 - gibberish_ratio)

    return round(max(0.0, min(1.0, score)), 2)


def _score_answer(question, learner_answer):
    """Returns a 0.0–1.0 correctness fraction for any question type."""
    if question.question_type == 'mcq':
        is_correct = learner_answer.strip().upper() == question.correct_answer.strip().upper()
        return 1.0 if is_correct else 0.0
    else:  # text_input
        min_words = int(question.correct_answer)
        return _score_writing_answer(learner_answer, min_words)

@api_view(['POST'])
def submit_assessment(request):
    """
    POST /api/assessments/submit
    Body: {
      "learner_id": "MG000001",
      "assessment_type": "reading",
      "language": "hi",
      "answers": [{ "question_id": 3, "answer": "A" }, ...]
    }
    """
    learner_id = request.data.get('learner_id')
    assessment_type = request.data.get('assessment_type')
    language = request.data.get('language', 'en')
    answers = request.data.get('answers', [])

    try:
        learner = Learner.objects.get(learner_id__iexact=learner_id)
    except Learner.DoesNotExist:
        return Response({'error': 'Learner not found.'}, status=status.HTTP_404_NOT_FOUND)

    if not answers:
        return Response({'error': 'No answers submitted.'}, status=status.HTTP_400_BAD_REQUEST)

    total_fraction = 0.0
    correct_count = 0  # kept as a whole-number count for display ("2 out of 3")
    response_records = []

    for answer_item in answers:
        try:
            question = AssessmentQuestion.objects.get(id=answer_item['question_id'])
        except AssessmentQuestion.DoesNotExist:
            continue

        learner_answer = str(answer_item.get('answer', ''))
        fraction = _score_answer(question, learner_answer)
        total_fraction += fraction

        is_correct = fraction >= 0.6  # threshold for "counts as correct" in the display
        if is_correct:
            correct_count += 1

        response_records.append(
            AssessmentResponse(
                question=question,
                learner_answer=learner_answer,
                is_correct=is_correct,
            )
        )

    total_questions = len(answers)
    score = round((total_fraction / total_questions) * 100, 1) if total_questions else 0

    attempt = AssessmentAttempt.objects.create(
        learner=learner,
        assessment_type=assessment_type,
        language=language,
        score=score,
        total_questions=total_questions,
        correct_count=correct_count,
    )
    for record in response_records:
        record.attempt = attempt
        record.save()

    # Update the learner's aggregate literacy profile
    profile, _ = LiteracyProfile.objects.get_or_create(learner=learner)
    if assessment_type == 'reading':
        profile.reading_score = score
    elif assessment_type == 'writing':
        profile.writing_score = score
    elif assessment_type == 'comprehension':
        profile.comprehension_score = score
    profile.recalculate()  # also saves

    return Response({
        'score': score,
        'correct_count': correct_count,
        'total_questions': total_questions,
        'literacy_profile': LiteracyProfileSerializer(profile).data,
    }, status=status.HTTP_201_CREATED)