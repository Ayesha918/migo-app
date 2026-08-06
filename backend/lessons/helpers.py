import random
from .models import Lesson

BEGINNER_SIMPLE_QUIZZES = {
    'en': [
        {'question': 'What letter does this start with? 🍎', 'options': ['A', 'B', 'C', 'D'], 'correct_index': 0, 'explanation': 'Apple starts with the letter A.'},
        {'question': 'Identify the correct word for: 🐱', 'options': ['Cat', 'Dog', 'Pen', 'Bus'], 'correct_index': 0, 'explanation': 'The picture shows a Cat.'},
        {'question': 'Fill in the missing letter: C _ T', 'options': ['A', 'O', 'U', 'E'], 'correct_index': 0, 'explanation': 'CAT spelling is C-A-T.'},
        {'question': 'What letter does this start with? 🐶', 'options': ['P', 'D', 'B', 'Q'], 'correct_index': 1, 'explanation': 'Dog starts with the letter D.'},
        {'question': 'Identify the correct word for: 🖊️', 'options': ['Bus', 'Cup', 'Pen', 'Sun'], 'correct_index': 2, 'explanation': 'The picture shows a Pen.'},
        {'question': 'Fill in the missing letter: B _ S', 'options': ['I', 'E', 'U', 'O'], 'correct_index': 2, 'explanation': 'BUS spelling is B-U-S.'},
        {'question': 'What letter does this start with? 🏠', 'options': ['N', 'M', 'H', 'U'], 'correct_index': 2, 'explanation': 'Home starts with the letter H.'},
        {'question': 'Identify the correct word for: 🍲', 'options': ['Food', 'Shop', 'Road', 'Walk'], 'correct_index': 0, 'explanation': 'The picture shows Food.'},
        {'question': 'Fill in the missing letter: S _ N', 'options': ['U', 'O', 'A', 'E'], 'correct_index': 0, 'explanation': 'SUN spelling is S-U-N.'},
        {'question': 'Identify the correct word for: 💧', 'options': ['Food', 'Water', 'Shop', 'Road'], 'correct_index': 1, 'explanation': 'The picture shows Water.'}
    ],
    'hi': [
        {'question': 'यह चित्र किस अक्षर से शुरू होता है? 🍎', 'options': ['अ', 'क', 'ग', 'म'], 'correct_index': 0, 'explanation': 'अमरूद/अनार/अंगूर/आम (अ से अनार).'},
        {'question': 'इस चित्र का सही नाम चुनें: 🐱', 'options': ['बिल्ली', 'कुत्ता', 'कलम', 'बस'], 'correct_index': 0, 'explanation': 'यह बिल्ली का चित्र है।'},
        {'question': 'खाली स्थान भरें: घ _', 'options': ['र', 'ल', 'म', 'न'], 'correct_index': 0, 'explanation': 'घर का शब्द घ-र है।'},
        {'question': 'यह चित्र किस अक्षर से शुरू होता है? 🐶', 'options': ['क', 'ख', 'ग', 'घ'], 'correct_index': 0, 'explanation': 'कुत्ता क अक्षर से शुरू होता है।'},
        {'question': 'इस चित्र का सही नाम चुनें: 🖊️', 'options': ['बस', 'कप', 'कलम', 'सूरज'], 'correct_index': 2, 'explanation': 'यह कलम का चित्र है।'},
        {'question': 'खाली स्थान भरें: ब _', 'options': ['स', 'क', 'थ', 'ध'], 'correct_index': 0, 'explanation': 'बस का शब्द ब-स है।'},
        {'question': 'यह चित्र किस अक्षर से शुरू होता है? 🏠', 'options': ['घ', 'म', 'न', 'प'], 'correct_index': 0, 'explanation': 'घर घ अक्षर से शुरू होता है।'},
        {'question': 'इस चित्र का सही नाम चुनें: 🍲', 'options': ['खाना', 'दुकान', 'सड़क', 'चलो'], 'correct_index': 0, 'explanation': 'यह खाने का चित्र है।'},
        {'question': 'खाली स्थान भरें: ज _', 'options': ['ल', 'न', 'म', 'क'], 'correct_index': 0, 'explanation': 'जल का शब्द ज-ल है।'},
        {'question': 'इस चित्र का सही नाम चुनें: 💧', 'options': ['खाना', 'पानी', 'दुकान', 'सड़क'], 'correct_index': 1, 'explanation': 'यह पानी का चित्र है।'}
    ],
    'kn': [
        {'question': 'ಈ ಚಿತ್ರ ಯಾವ ಅಕ್ಷರದಿಂದ ಶುರುವಾಗುತ್ತದೆ? 🍎', 'options': ['ಅ', 'ಕ', 'ಗ', 'ಮ'], 'correct_index': 0, 'explanation': 'ಆಪಲ್/ಸೇಬು ಅ ಇಂದ ಶುರುವಾಗುತ್ತದೆ.'},
        {'question': 'ಈ ಚಿತ್ರದ ಸರಿಯಾದ ಹೆಸರನ್ನು ಆರಿಸಿ: 🐱', 'options': ['ಬೆಕ್ಕು', 'ನಾಯಿ', 'ಪೇನಾ', 'ಬಸ್'], 'correct_index': 0, 'explanation': 'ಇದು ಬೆಕ್ಕಿನ ಚಿತ್ರ.'},
        {'question': 'ಖಾಲಿ ಜಾಗ ತುಂಬಿ: ಮ _', 'options': ['ನೆ', 'ರ', 'ಲ', 'ನ'], 'correct_index': 0, 'explanation': 'ಮನೆ ಪದ ಮ-ನೆ.'},
        {'question': 'ಈ ಚಿತ್ರ ಯಾವ ಅಕ್ಷರದಿಂದ ಶುರುವಾಗುತ್ತದೆ? 🐶', 'options': ['ನ', 'ಖ', 'ಗ', 'ಘ'], 'correct_index': 0, 'explanation': 'ನಾಯಿ ನ ಅಕ್ಷರದಿಂದ ಶುರುವಾಗುತ್ತದೆ.'},
        {'question': 'ಈ ಚಿತ್ರದ ಸರಿಯಾದ ಹೆಸರನ್ನು ಆರಿಸಿ: 🖊️', 'options': ['ಬಸ್', 'ಕಪ್', 'ಪೇನಾ', 'ಸೂರ್ಯ'], 'correct_index': 2, 'explanation': 'ಇದು ಪೇನಾ ಚಿತ್ರ.'},
        {'question': 'ಖಾಲಿ ಜಾಗ ತುಂಬಿ: ಬ _', 'options': ['ಸ್', 'ಕ', 'ತ', 'ದ'], 'correct_index': 0, 'explanation': 'ಬಸ್ ಪದ ಬ-ಸ್.'},
        {'question': 'ಈ ಚಿತ್ರ ಯಾವ ಅಕ್ಷರದಿಂದ ಶುರುವಾಗುತ್ತದೆ? 🏠', 'options': ['ಮ', 'ರ', 'ಲ', 'ನ'], 'correct_index': 0, 'explanation': 'ಮನೆ ಮ ಅಕ್ಷರದಿಂದ ಶುರುವಾಗುತ್ತದೆ.'},
        {'question': 'ಈ ಚಿತ್ರದ ಸರಿಯಾದ ಹೆಸರನ್ನು ಆರಿಸಿ: 🍲', 'options': ['ಊಟ', 'ಅಂಗಡಿ', 'ರಸ್ತೆ', 'ನಡೆ'], 'correct_index': 0, 'explanation': 'ಇದು ಊಟದ ಚಿತ್ರ.'},
        {'question': 'ಖಾಲಿ ಜಾಗ ತುಂಬಿ: ನೀ _', 'options': ['ರು', 'ಲ', 'ನ', 'ಕ'], 'correct_index': 0, 'explanation': 'ನೀರು ಪದ ನೀ-ರು.'},
        {'question': 'ಈ ಚಿತ್ರದ ಸರಿಯಾದ ಹೆಸರನ್ನು ಆರಿಸಿ: 💧', 'options': ['ಊಟ', 'ನೀರು', 'ಅಂಗಡಿ', 'ರಸ್ತೆ'], 'correct_index': 1, 'explanation': 'ಇದು ನೀರಿನ ಚಿತ್ರ.'}
    ],
    'ta': [
        {'question': 'இந்த படம் எந்த எழுத்தில் தொடங்குகிறது? 🍎', 'options': ['அ', 'க', 'ச', 'ம'], 'correct_index': 0, 'explanation': 'ஆப்பிள் அ எழுத்தில் தொடங்குகிறது.'},
        {'question': 'இந்த படத்தின் சரியான பெயரைத் தேர்ந்தெடுக்கவும்: 🐱', 'options': ['பூனை', 'நாய்', 'பேனா', 'பேருந்து'], 'correct_index': 0, 'explanation': 'இது பூனையின் படம்.'},
        {'question': 'விடுபட்ட எழுத்தை நிரப்புக: ப _', 'options': ['டம்', 'னை', 'சு', 'து'], 'correct_index': 2, 'explanation': 'பசு சொல் ப-சு.'},
        {'question': 'இந்த படம் எந்த எழுத்தில் தொடங்குகிறது? 🐶', 'options': ['ந', 'ப', 'ம', 'ய'], 'correct_index': 0, 'explanation': 'நாய் ந எழுத்தில் தொடங்குகிறது.'},
        {'question': 'இந்த படத்தின் சரியான பெயரைத் தேர்ந்தெடுக்கவும்: 🖊️', 'options': ['பேருந்து', 'கோப்பை', 'பேனா', 'சூரியன்'], 'correct_index': 2, 'explanation': 'இது பேனாவின் படம்.'},
        {'question': 'விடுபட்ட எழுத்தை நிரப்புக: ப _ ்', 'options': ['ல்', 'ன்', 'க்', 'சு'], 'correct_index': 0, 'explanation': 'பல் சொல் ப-ல்.'},
        {'question': 'இந்த படம் எந்த எழுத்தில் தொடங்குகிறது? 🏠', 'options': ['வ', 'ம', 'ந', 'த'], 'correct_index': 0, 'explanation': 'வீடு வ எழுத்தில் தொடங்குகிறது.'},
        {'question': 'இந்த படத்தின் சரியான பெயரைத் தேர்ந்தெடுக்கவும்: 🍲', 'options': ['உணவு', 'கடை', 'சாலை', 'நட'], 'correct_index': 0, 'explanation': 'இது உணவின் படம்.'},
        {'question': 'விடுபட்ட எழுத்தை நிரப்புக: நீ _ ்', 'options': ['ர்', 'ல்', 'ன்', 'க்'], 'correct_index': 0, 'explanation': 'நீர் சொல் நீ-ர்.'},
        {'question': 'இந்த படத்தின் சரியான பெயரைத் தேர்ந்தெடுக்கவும்: 💧', 'options': ['உணவு', 'தண்ணீர்', 'கடை', 'சாலை'], 'correct_index': 1, 'explanation': 'இது தண்ணீரின் படம்.'}
    ]
}

def generate_dynamic_assessment_quiz(level, language):
    """
    Combines quiz questions from all learnt lessons of a level in the database.
    Selects at least 10 questions.
    For Beginner, returns 10 extremely simple alphabet/matching/missing questions.
    """
    if level == 'beginner':
        lang_code = language.lower() if language else 'en'
        return BEGINNER_SIMPLE_QUIZZES.get(lang_code, BEGINNER_SIMPLE_QUIZZES['en'])

    exclude_ids = [
        'BEG-ASSESS-EN', 'BEG-ASSESS-HI', 'BEG-ASSESS-KN', 'BEG-ASSESS-TA',
        'INT-ASSESS-EN', 'INT-ASSESS-HI', 'INT-ASSESS-KN', 'INT-ASSESS-TA',
        'ADV-ASSESS-EN', 'ADV-ASSESS-HI', 'ADV-ASSESS-KN', 'ADV-ASSESS-TA'
    ]
    # Fetch all lessons for this level and language, excluding the assessments themselves
    lessons = Lesson.objects.filter(
        difficulty=level,
        language=language
    ).exclude(
        lesson_id__in=exclude_ids
    )
    
    questions_pool = []
    for l in lessons:
        # Parse activities if quiz_bank is empty (e.g. for beginner lessons)
        if isinstance(l.activities, list):
            for act in l.activities:
                if isinstance(act, dict) and act.get('type') == 'practice_missing':
                    q_text = act.get('questionText') or act.get('question') or 'Select the correct answer.'
                    prompt = act.get('equation') or act.get('displaySequence') or ''
                    full_q = f"{q_text} : {prompt}" if prompt else q_text
                    
                    target = act.get('target')
                    options = act.get('options', [])
                    if target and options:
                        try:
                            correct_idx = options.index(target)
                        except ValueError:
                            correct_idx = 0
                        questions_pool.append({
                            'question': full_q,
                            'options': options,
                            'correct_index': correct_idx,
                            'explanation': f"The correct answer is {target}."
                        })

        quiz_items = []
        if isinstance(l.quiz_bank, list) and len(l.quiz_bank) > 0:
            quiz_items = l.quiz_bank
        elif isinstance(l.quiz_data, dict):
            # Parse dict items if they exist
            for key in ['recognition', 'understanding', 'application']:
                if key in l.quiz_data and isinstance(l.quiz_data[key], list):
                    quiz_items.extend(l.quiz_data[key])
        
        for item in quiz_items:
            if isinstance(item, dict) and 'question' in item and 'options' in item:
                questions_pool.append({
                    'question': item['question'],
                    'options': item.get('options', []),
                    'correct_index': item.get('correct_index', 0),
                    'explanation': item.get('explanation', 'Select the correct answer.')
                })

    # If pool is smaller than 10, add default questions to reach 10
    if len(questions_pool) < 10:
        default_items = [
            {
                'question': 'Identify the correct letter sound: /ah/',
                'options': ['A', 'B', 'C', 'D'],
                'correct_index': 0,
                'explanation': 'A makes the /ah/ sound.'
            },
            {
                'question': 'Which word starts with the letter sound /b/?',
                'options': ['Apple', 'Ball', 'Cat', 'Dog'],
                'correct_index': 1,
                'explanation': 'Ball starts with /b/.'
            },
            {
                'question': 'Read: The cat sat on the mat.',
                'options': ['True', 'False'],
                'correct_index': 0,
                'explanation': 'Simple reading comprehension.'
            }
        ]
        while len(questions_pool) < 10:
            questions_pool.append(random.choice(default_items))

    # Shuffle the pool and take 10
    random.shuffle(questions_pool)
    return questions_pool[:10]
