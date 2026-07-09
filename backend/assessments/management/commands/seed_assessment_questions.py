# backend/assessments/management/commands/seed_assessment_questions.py
from django.core.management.base import BaseCommand
from assessments.models import AssessmentQuestion


class Command(BaseCommand):
    help = 'Seeds initial multilingual assessment questions (Reading, Writing, Comprehension)'

    def handle(self, *args, **options):
        self.stdout.write('Seeding assessment questions...')

        # ============ READING (word recognition, MCQ) ============
        reading_data = [
            {
                'group_key': 'reading_word_1', 'order': 1,
                'texts': {
                    'en': 'Cat', 'hi': 'बिल्ली', 'kn': 'ಬೆಕ್ಕು', 'ta': 'பூனை',
                },
                'options': ['🐱', '🐶', '☀️', '🍎'], 'correct': 'A',
            },
            {
                'group_key': 'reading_word_2', 'order': 2,
                'texts': {
                    'en': 'Dog', 'hi': 'कुत्ता', 'kn': 'ನಾಯಿ', 'ta': 'நாய்',
                },
                'options': ['🍎', '🐶', '⭐', '🌸'], 'correct': 'B',
            },
            {
                'group_key': 'reading_word_3', 'order': 3,
                'texts': {
                    'en': 'Sun', 'hi': 'सूरज', 'kn': 'ಸೂರ್ಯ', 'ta': 'சூரியன்',
                },
                'options': ['🐱', '🌸', '☀️', '⭐'], 'correct': 'C',
            },
        ]

        for item in reading_data:
            for lang, word in item['texts'].items():
                AssessmentQuestion.objects.get_or_create(
                    group_key=item['group_key'], language=lang,
                    defaults={
                        'assessment_type': 'reading',
                        'question_text': f"Which picture matches: {word}",
                        'question_type': 'mcq',
                        'option_a': item['options'][0], 'option_b': item['options'][1],
                        'option_c': item['options'][2], 'option_d': item['options'][3],
                        'correct_answer': item['correct'],
                        'order': item['order'],
                    }
                )

        # ============ COMPREHENSION (passage + MCQ) ============
        passages = {
            'en': "Riya has a small garden. She grows flowers and vegetables. Every morning she waters the plants.",
            'hi': "रिया के पास एक छोटा बगीचा है। वह फूल और सब्जियाँ उगाती है। हर सुबह वह पौधों को पानी देती है।",
            'kn': "ರಿಯಾಳ ಬಳಿ ಒಂದು ಸಣ್ಣ ತೋಟವಿದೆ. ಅವಳು ಹೂವುಗಳು ಮತ್ತು ತರಕಾರಿಗಳನ್ನು ಬೆಳೆಯುತ್ತಾಳೆ. ಪ್ರತಿ ಬೆಳಿಗ್ಗೆ ಅವಳು ಗಿಡಗಳಿಗೆ ನೀರು ಹಾಕುತ್ತಾಳೆ.",
            'ta': "ரியாவிடம் ஒரு சிறிய தோட்டம் உள்ளது. அவள் பூக்கள் மற்றும் காய்கறிகள் வளர்க்கிறாள். ஒவ்வொரு காலையிலும் அவள் செடிகளுக்கு தண்ணீர் ஊற்றுகிறாள்.",
        }
        comp_q1 = {
            'en': "What does Riya have?", 'hi': "रिया के पास क्या है?",
            'kn': "ರಿಯಾಳ ಬಳಿ ಏನಿದೆ?", 'ta': "ரியாவிடம் என்ன உள்ளது?",
        }
        comp_q1_opts = {
            'en': ['Garden', 'Car', 'Shop', 'School'],
            'hi': ['बगीचा', 'कार', 'दुकान', 'स्कूल'],
            'kn': ['ತೋಟ', 'ಕಾರು', 'ಅಂಗಡಿ', 'ಶಾಲೆ'],
            'ta': ['தோட்டம்', 'கார்', 'கடை', 'பள்ளி'],
        }
        comp_q2 = {
            'en': "When does she water the plants?", 'hi': "वह पौधों को कब पानी देती है?",
            'kn': "ಅವಳು ಗಿಡಗಳಿಗೆ ಯಾವಾಗ ನೀರು ಹಾಕುತ್ತಾಳೆ?", 'ta': "அவள் எப்போது செடிகளுக்கு தண்ணீர் ஊற்றுகிறாள்?",
        }
        comp_q2_opts = {
            'en': ['At night', 'Every morning', 'Never', 'Only Sunday'],
            'hi': ['रात में', 'हर सुबह', 'कभी नहीं', 'केवल रविवार'],
            'kn': ['ರಾತ್ರಿ', 'ಪ್ರತಿ ಬೆಳಿಗ್ಗೆ', 'ಎಂದಿಗೂ ಇಲ್ಲ', 'ಭಾನುವಾರ ಮಾತ್ರ'],
            'ta': ['இரவில்', 'ஒவ்வொரு காலையிலும்', 'ஒருபோதும் இல்லை', 'ஞாயிறு மட்டும்'],
        }

        for lang in ['en', 'hi', 'kn', 'ta']:
            AssessmentQuestion.objects.get_or_create(
                group_key='comprehension_q1', language=lang,
                defaults={
                    'assessment_type': 'comprehension',
                    'passage_text': passages[lang],
                    'question_text': comp_q1[lang],
                    'question_type': 'mcq',
                    'option_a': comp_q1_opts[lang][0], 'option_b': comp_q1_opts[lang][1],
                    'option_c': comp_q1_opts[lang][2], 'option_d': comp_q1_opts[lang][3],
                    'correct_answer': 'A',
                    'order': 1,
                }
            )
            AssessmentQuestion.objects.get_or_create(
                group_key='comprehension_q2', language=lang,
                defaults={
                    'assessment_type': 'comprehension',
                    'passage_text': passages[lang],
                    'question_text': comp_q2[lang],
                    'question_type': 'mcq',
                    'option_a': comp_q2_opts[lang][0], 'option_b': comp_q2_opts[lang][1],
                    'option_c': comp_q2_opts[lang][2], 'option_d': comp_q2_opts[lang][3],
                    'correct_answer': 'B',
                    'order': 2,
                }
            )

        # ============ WRITING (free text prompt) ============
        writing_prompts = {
            'en': "Write one sentence about your family.",
            'hi': "अपने परिवार के बारे में एक वाक्य लिखें।",
            'kn': "ನಿಮ್ಮ ಕುಟುಂಬದ ಬಗ್ಗೆ ಒಂದು ವಾಕ್ಯ ಬರೆಯಿರಿ.",
            'ta': "உங்கள் குடும்பத்தைப் பற்றி ஒரு வாக்கியம் எழுதுங்கள்.",
        }
        for lang, prompt in writing_prompts.items():
            AssessmentQuestion.objects.get_or_create(
                group_key='writing_prompt_1', language=lang,
                defaults={
                    'assessment_type': 'writing',
                    'question_text': prompt,
                    'question_type': 'text_input',
                    'correct_answer': '3',  # minimum 3 words to count as "correct" (heuristic)
                    'order': 1,
                }
            )

        self.stdout.write(self.style.SUCCESS('Assessment questions seeded successfully.'))