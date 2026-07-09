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


def _score_answer(question, learner_answer):
    """Returns True/False depending on question_type's grading rule."""
    if question.question_type == 'mcq':
        return learner_answer.strip().upper() == question.correct_answer.strip().upper()
    else:  # text_input — heuristic word-count check (see limitation noted above)
        min_words = int(question.correct_answer)
        word_count = len([w for w in learner_answer.strip().split() if w])
        return word_count >= min_words


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

    correct_count = 0
    response_records = []

    for answer_item in answers:
        try:
            question = AssessmentQuestion.objects.get(id=answer_item['question_id'])
        except AssessmentQuestion.DoesNotExist:
            continue

        learner_answer = str(answer_item.get('answer', ''))
        is_correct = _score_answer(question, learner_answer)
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
    score = round((correct_count / total_questions) * 100, 1) if total_questions else 0

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