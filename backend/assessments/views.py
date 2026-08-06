# backend/assessments/views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from users.models import Learner
from .models import AssessmentQuestion, AssessmentAttempt, AssessmentResponse, LiteracyProfile
from .serializers import QuestionSerializer, LiteracyProfileSerializer
import random
from .models import AssessmentQuestion, AssessmentAttempt, AssessmentResponse, LiteracyProfile, SeenQuestion
from .models import AssessmentQuestion, AssessmentAttempt, AssessmentResponse, LiteracyProfile, SkillBreakdown
from .prediction import predict_learner_trajectory

QUESTIONS_PER_ATTEMPT = {
    'reading': 3,
    'comprehension': 3,
    'writing': 1,
}


@api_view(['GET'])
def get_questions(request):
    assessment_type = request.query_params.get('type')
    language = request.query_params.get('language', 'en')
    learner_id = request.query_params.get('learner_id')

    if assessment_type not in QUESTIONS_PER_ATTEMPT:
        return Response(
            {'error': 'type must be one of: reading, writing, comprehension'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if learner_id:
        learner = Learner.objects.filter(learner_id__iexact=learner_id).first()
        if learner and AssessmentAttempt.objects.filter(
            learner=learner, assessment_type=assessment_type, is_initial=True
        ).exists():
            return Response(
                {'error': 'already_completed', 'message': 'Initial assessment already completed for this section.'},
                status=status.HTTP_403_FORBIDDEN
            )

    needed = QUESTIONS_PER_ATTEMPT[assessment_type]

    all_questions = AssessmentQuestion.objects.filter(assessment_type=assessment_type, language=language)
    if not all_questions.exists():
        all_questions = AssessmentQuestion.objects.filter(assessment_type=assessment_type, language='en')

    all_ids = list(all_questions.values_list('id', flat=True))

    learner = None
    if learner_id:
        learner = Learner.objects.filter(learner_id__iexact=learner_id).first()

    if learner:
        seen_ids = set(
            SeenQuestion.objects.filter(learner=learner, question__in=all_ids).values_list('question_id', flat=True)
        )
        unseen_ids = [qid for qid in all_ids if qid not in seen_ids]
        if len(unseen_ids) < needed:
            SeenQuestion.objects.filter(learner=learner, question__in=all_ids).delete()
            unseen_ids = all_ids
    else:
        unseen_ids = all_ids

    sample_size = min(needed, len(unseen_ids))
    chosen_ids = random.sample(unseen_ids, sample_size) if unseen_ids else []

    questions = AssessmentQuestion.objects.filter(id__in=chosen_ids).order_by('order')

    if learner:
        SeenQuestion.objects.bulk_create(
            [SeenQuestion(learner=learner, question_id=qid) for qid in chosen_ids],
            ignore_conflicts=True,
        )

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
    learner_id = request.data.get('learner_id')
    assessment_type = request.data.get('assessment_type')
    language = request.data.get('language', 'en')
    answers = request.data.get('answers', [])

    try:
        learner = Learner.objects.get(learner_id__iexact=learner_id)
    except Learner.DoesNotExist:
        return Response({'error': 'Learner not found.'}, status=status.HTTP_404_NOT_FOUND)

    already_done = AssessmentAttempt.objects.filter(
        learner=learner, assessment_type=assessment_type, is_initial=True
    ).exists()
    if already_done:
        return Response(
            {'error': 'already_completed', 'message': 'Initial assessment already completed for this section.'},
            status=status.HTTP_403_FORBIDDEN
        )

    if not answers:
        return Response({'error': 'No answers submitted.'}, status=status.HTTP_400_BAD_REQUEST)

    total_fraction = 0.0
    correct_count = 0
    response_records = []
    skill_totals = {}

    for answer_item in answers:
        try:
            question = AssessmentQuestion.objects.get(id=answer_item['question_id'])
        except AssessmentQuestion.DoesNotExist:
            continue

        learner_answer = str(answer_item.get('answer', ''))
        fraction = _score_answer(question, learner_answer)
        total_fraction += fraction

        is_correct = fraction >= 0.6
        if is_correct:
            correct_count += 1

        if question.skill_tag:
            bucket = skill_totals.setdefault(question.skill_tag, {'sum': 0.0, 'count': 0})
            bucket['sum'] += fraction
            bucket['count'] += 1

        response_records.append(
            AssessmentResponse(question=question, learner_answer=learner_answer, is_correct=is_correct)
        )

    total_questions = len(answers)
    score = round((total_fraction / total_questions) * 100, 1) if total_questions else 0

    attempt = AssessmentAttempt.objects.create(
        learner=learner, assessment_type=assessment_type, language=language,
        is_initial=True,
        score=score, total_questions=total_questions, correct_count=correct_count,
    )
    for record in response_records:
        record.attempt = attempt
        record.save()

    skill_breakdown_result = []

    if assessment_type == 'writing':
        answer_text = str(answers[0].get('answer', ''))
        fluency_score, vocab_score = _writing_skill_scores(answer_text)
        for tag, val in [('writing_fluency', fluency_score), ('writing_vocabulary', vocab_score)]:
            sb, _ = SkillBreakdown.objects.get_or_create(learner=learner, skill_tag=tag, defaults={'score': 0, 'band': 'weak'})
            sb.update_with(val)
            skill_breakdown_result.append({'skill_tag': tag, 'score': sb.score, 'band': sb.band})
    else:
        for tag, totals in skill_totals.items():
            avg = round((totals['sum'] / totals['count']) * 100, 1)
            sb, _ = SkillBreakdown.objects.get_or_create(learner=learner, skill_tag=tag, defaults={'score': 0, 'band': 'weak'})
            sb.update_with(avg)
            skill_breakdown_result.append({'skill_tag': tag, 'score': sb.score, 'band': sb.band})

    profile, _ = LiteracyProfile.objects.get_or_create(learner=learner)
    profile.recalculate_from_skills()

    return Response({
        'score': score,
        'correct_count': correct_count,
        'total_questions': total_questions,
        'literacy_profile': LiteracyProfileSerializer(profile).data,
        'skill_breakdown': skill_breakdown_result,
    }, status=status.HTTP_201_CREATED)


def _writing_skill_scores(text):
    words = [w for w in text.strip().split() if w]
    word_count = len(words)
    if word_count == 0:
        return 0.0, 0.0
    lower_words = [w.lower() for w in words]
    unique_ratio = len(set(lower_words)) / word_count
    fluency_score = round(min(1.0, word_count / 10) * 100, 1)
    vocabulary_score = round(unique_ratio * 100, 1)
    return fluency_score, vocabulary_score


@api_view(['GET'])
def get_prediction(request):
    """GET /api/assessments/prediction?learner_id=MG000001&study_duration_seconds=1200"""
    learner_id = request.query_params.get('learner_id', '').strip()
    study_duration_seconds = request.query_params.get('study_duration_seconds', '0.0').strip()

    try:
        study_secs = float(study_duration_seconds)
    except ValueError:
        study_secs = 0.0

    try:
        learner = Learner.objects.get(learner_id__iexact=learner_id)
    except Learner.DoesNotExist:
        return Response({'error': 'Learner not found.'}, status=status.HTTP_404_NOT_FOUND)

    prediction = predict_learner_trajectory(learner, study_secs)
    return Response(prediction, status=status.HTTP_200_OK)