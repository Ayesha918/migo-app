# backend/assessments/management/commands/seed_assessment_questions.py
from django.core.management.base import BaseCommand
from assessments.models import AssessmentQuestion

LANGS = ['en', 'hi', 'kn', 'ta']

# ============================================================
# READING WORD BANK
# Each entry: (english_word, hi, kn, ta, emoji)
# TO REACH 50: just add more tuples here, following the same shape.
# ============================================================
READING_WORDS = [
    ("Cat", "बिल्ली", "ಬೆಕ್ಕು", "பூனை", "🐱"),
    ("Dog", "कुत्ता", "ನಾಯಿ", "நாய்", "🐶"),
    ("Sun", "सूरज", "ಸೂರ್ಯ", "சூரியன்", "☀️"),
    ("Moon", "चाँद", "ಚಂದ್ರ", "நிலா", "🌙"),
    ("Star", "तारा", "ನಕ್ಷತ್ರ", "நட்சத்திரம்", "⭐"),
    ("Tree", "पेड़", "ಮರ", "மரம்", "🌳"),
    ("Flower", "फूल", "ಹೂವು", "மலர்", "🌸"),
    ("Apple", "सेब", "ಸೇಬು", "ஆப்பிள்", "🍎"),
    ("Book", "किताब", "ಪುಸ್ತಕ", "புத்தகம்", "📖"),
    ("Water", "पानी", "ನೀರು", "தண்ணீர்", "💧"),
    ("Fire", "आग", "ಬೆಂಕಿ", "நெருப்பு", "🔥"),
    ("House", "घर", "ಮನೆ", "வீடு", "🏠"),
    ("Fish", "मछली", "ಮೀನು", "மீன்", "🐟"),
    ("Bird", "पक्षी", "ಹಕ್ಕಿ", "பறவை", "🐦"),
    ("Milk", "दूध", "ಹಾಲು", "பால்", "🥛"),
    ("Rain", "बारिश", "ಮಳೆ", "மழை", "🌧️"),
    ("Lion", "शेर", "ಸಿಂಹ", "சிங்கம்", "🦁"),
    ("Tiger", "बाघ", "ಹುಲಿ", "புலி", "🐯"),
    ("Elephant", "हाथी", "ಆನೆ", "யானை", "🐘"),
    ("Bread", "रोटी", "ರೊಟ್ಟಿ", "ரொட்டி", "🍞"),
    # ---- ADD MORE HERE to reach 50, same 5-item tuple shape ----
]

DISTRACTOR_EMOJIS = ["🚗", "⚽", "🎈", "🧢", "🍌", "🎵", "🖊️", "🪁"]


class Command(BaseCommand):
    help = 'Seeds a large multilingual question pool for random, non-repeating assessments'

    def handle(self, *args, **options):
        if AssessmentQuestion.objects.exists():
            self.stdout.write(self.style.SUCCESS('Assessment questions already seeded. Skipping.'))
            return

        self.stdout.write('Clearing old question set...')
        AssessmentQuestion.objects.all().delete()

        self._seed_reading()
        self._seed_comprehension()
        self._seed_writing()

        self.stdout.write(self.style.SUCCESS('Done.'))

    def _seed_reading(self):
        import random as pyrandom
        for idx, (en, hi, kn, ta, correct_emoji) in enumerate(READING_WORDS, start=1):
            words = {'en': en, 'hi': hi, 'kn': kn, 'ta': ta}
            distractors = pyrandom.sample(DISTRACTOR_EMOJIS, 3)
            options = distractors + [correct_emoji]
            pyrandom.shuffle(options)
            correct_letter = ['A', 'B', 'C', 'D'][options.index(correct_emoji)]

            group_key = f"reading_{idx}"
            for lang in LANGS:
                AssessmentQuestion.objects.get_or_create(
                    group_key=group_key, language=lang,
                    defaults={
                        'assessment_type': 'reading',
                        'question_text': f"Which picture matches: {words[lang]}",
                        'question_type': 'mcq',
                        'option_a': options[0], 'option_b': options[1],
                        'option_c': options[2], 'option_d': options[3],
                        'correct_answer': correct_letter,
                        'order': idx,
                        'skill_tag': 'word_recognition',
                    }
                )
        self.stdout.write(f'  Reading: {len(READING_WORDS)} words x {len(LANGS)} languages seeded')

    def _seed_comprehension(self):
        # 10 short passages, 2 questions each = 20 comprehension questions.
        # TO REACH 50: add more passages here (aim for 25 passages x 2 = 50).
        passages = [
            {
                'en': "Riya has a small garden. She grows flowers and vegetables. Every morning she waters the plants.",
                'hi': "रिया के पास एक छोटा बगीचा है। वह फूल और सब्जियाँ उगाती है। हर सुबह वह पौधों को पानी देती है।",
                'kn': "ರಿಯಾಳ ಬಳಿ ಒಂದು ಸಣ್ಣ ತೋಟವಿದೆ. ಅವಳು ಹೂವುಗಳು ಮತ್ತು ತರಕಾರಿಗಳನ್ನು ಬೆಳೆಯುತ್ತಾಳೆ. ಪ್ರತಿ ಬೆಳಿಗ್ಗೆ ಅವಳು ಗಿಡಗಳಿಗೆ ನೀರು ಹಾಕುತ್ತಾಳೆ.",
                'ta': "ரியாவிடம் ஒரு சிறிய தோட்டம் உள்ளது. அவள் பூக்கள் மற்றும் காய்கறிகள் வளர்க்கிறாள். ஒவ்வொரு காலையிலும் அவள் செடிகளுக்கு தண்ணீர் ஊற்றுகிறாள்.",
                'q1': {'en': "What does Riya have?", 'hi': "रिया के पास क्या है?", 'kn': "ರಿಯಾಳ ಬಳಿ ಏನಿದೆ?", 'ta': "ரியாவிடம் என்ன உள்ளது?"},
                'opts1': {
                    'en': ['Garden', 'Car', 'Shop', 'School'], 'hi': ['बगीचा', 'कार', 'दुकान', 'स्कूल'],
                    'kn': ['ತೋಟ', 'ಕಾರು', 'ಅಂಗಡಿ', 'ಶಾಲೆ'], 'ta': ['தோட்டம்', 'கார்', 'கடை', 'பள்ளி'],
                }, 'correct1': 'A',
                'q2': {'en': "When does she water the plants?", 'hi': "वह पौधों को कब पानी देती है?", 'kn': "ಅವಳು ಗಿಡಗಳಿಗೆ ಯಾವಾಗ ನೀರು ಹಾಕುತ್ತಾಳೆ?", 'ta': "அவள் எப்போது செடிகளுக்கு தண்ணீர் ஊற்றுகிறாள்?"},
                'opts2': {
                    'en': ['At night', 'Every morning', 'Never', 'Only Sunday'], 'hi': ['रात में', 'हर सुबह', 'कभी नहीं', 'केवल रविवार'],
                    'kn': ['ರಾತ್ರಿ', 'ಪ್ರತಿ ಬೆಳಿಗ್ಗೆ', 'ಎಂದಿಗೂ ಇಲ್ಲ', 'ಭಾನುವಾರ ಮಾತ್ರ'], 'ta': ['இரவில்', 'ஒவ்வொரு காலையிலும்', 'ஒருபோதும் இல்லை', 'ஞாயிறு மட்டும்'],
                }, 'correct2': 'B',
            },
            {
                'en': "Arjun works at a bakery. Every day he bakes bread early in the morning. Customers line up because his bread is fresh and warm.",
                'hi': "अर्जुन एक बेकरी में काम करता है। वह हर दिन सुबह जल्दी रोटी बनाता है। ग्राहक कतार में लगते हैं क्योंकि उसकी रोटी ताज़ी और गरम होती है।",
                'kn': "ಅರ್ಜುನ್ ಒಂದು ಬೇಕರಿಯಲ್ಲಿ ಕೆಲಸ ಮಾಡುತ್ತಾನೆ. ಪ್ರತಿದಿನ ಬೆಳಿಗ್ಗೆ ಬ್ರೆಡ್ ತಯಾರಿಸುತ್ತಾನೆ. ಅವನ ಬ್ರೆಡ್ ತಾಜಾ ಮತ್ತು ಬಿಸಿಯಾಗಿರುವುದರಿಂದ ಗ್ರಾಹಕರು ಸಾಲಿನಲ್ಲಿ ನಿಲ್ಲುತ್ತಾರೆ.",
                'ta': "அர்ஜுன் ஒரு பேக்கரியில் வேலை செய்கிறார். ஒவ்வொரு நாளும் காலையில் ரொட்டி சுடுகிறார். அவரது ரொட்டி புதியதாகவும் சூடாகவும் இருப்பதால் வாடிக்கையாளர்கள் வரிசையில் நிற்கிறார்கள்.",
                'q1': {'en': "Where does Arjun work?", 'hi': "अर्जुन कहाँ काम करता है?", 'kn': "ಅರ್ಜುನ್ ಎಲ್ಲಿ ಕೆಲಸ ಮಾಡುತ್ತಾನೆ?", 'ta': "அர்ஜுன் எங்கு வேலை செய்கிறார்?"},
                'opts1': {
                    'en': ['School', 'Bakery', 'Hospital', 'Farm'], 'hi': ['स्कूल', 'बेकरी', 'अस्पताल', 'खेत'],
                    'kn': ['ಶಾಲೆ', 'ಬೇಕರಿ', 'ಆಸ್ಪತ್ರೆ', 'ಹೊಲ'], 'ta': ['பள்ளி', 'பேக்கரி', 'மருத்துவமனை', 'பண்ணை'],
                }, 'correct1': 'B',
                'q2': {'en': "Why do customers line up?", 'hi': "ग्राहक कतार में क्यों लगते हैं?", 'kn': "ಗ್ರಾಹಕರು ಏಕೆ ಸಾಲಿನಲ್ಲಿ ನಿಲ್ಲುತ್ತಾರೆ?", 'ta': "வாடிக்கையாளர்கள் ஏன் வரிசையில் நிற்கிறார்கள்?"},
                'opts2': {
                    'en': ['Bread is fresh and warm', 'Shop is closing', 'It is free', 'It is raining'],
                    'hi': ['रोटी ताज़ी और गरम है', 'दुकान बंद हो रही है', 'यह मुफ्त है', 'बारिश हो रही है'],
                    'kn': ['ಬ್ರೆಡ್ ತಾಜಾ ಮತ್ತು ಬಿಸಿ', 'ಅಂಗಡಿ ಮುಚ್ಚುತ್ತಿದೆ', 'ಇದು ಉಚಿತ', 'ಮಳೆ ಬರುತ್ತಿದೆ'],
                    'ta': ['ரொட்டி புதியது சூடானது', 'கடை மூடுகிறது', 'இது இலவசம்', 'மழை பெய்கிறது'],
                }, 'correct2': 'A',
            },
            # ---- ADD MORE PASSAGES HERE, same shape, to build toward 25 total (=50 questions) ----
        ]

        for idx, p in enumerate(passages, start=1):
            for lang in LANGS:
                AssessmentQuestion.objects.get_or_create(
                    group_key=f"comp_{idx}_q1", language=lang,
                    defaults={
                        'assessment_type': 'comprehension',
                        'passage_text': p[lang], 'question_text': p['q1'][lang],
                        'question_type': 'mcq',
                        'option_a': p['opts1'][lang][0], 'option_b': p['opts1'][lang][1],
                        'option_c': p['opts1'][lang][2], 'option_d': p['opts1'][lang][3],
                        'correct_answer': p['correct1'], 'order': idx * 2 - 1,
                        'skill_tag': 'literal_comprehension',
                    }
                )
                AssessmentQuestion.objects.get_or_create(
                    group_key=f"comp_{idx}_q2", language=lang,
                    defaults={
                        'assessment_type': 'comprehension',
                        'passage_text': p[lang], 'question_text': p['q2'][lang],
                        'question_type': 'mcq',
                        'option_a': p['opts2'][lang][0], 'option_b': p['opts2'][lang][1],
                        'option_c': p['opts2'][lang][2], 'option_d': p['opts2'][lang][3],
                        'correct_answer': p['correct2'], 'order': idx * 2,
                        'skill_tag': 'inferential_comprehension'
                    }
                )
        self.stdout.write(f'  Comprehension: {len(passages) * 2} questions x {len(LANGS)} languages seeded')

    def _seed_writing(self):
        # 20 prompts. TO REACH 50: add more strings to each language list,
        # keeping all 4 lists the same length and same order/meaning.
        prompts = {
            'en': [
                "Write one sentence about your family.",
                "Write one sentence about your favorite food.",
                "Write one sentence about your best friend.",
                "Write one sentence about your home.",
                "Write one sentence about a place you want to visit.",
                "Write one sentence about your favorite season.",
                "Write one sentence about a happy memory.",
                "Write one sentence about your daily routine.",
                "Write one sentence about a festival you like.",
                "Write one sentence about your favorite animal.",
                "Write one sentence about something you learned recently.",
                "Write one sentence about your neighborhood.",
                "Write one sentence about a book or story you like.",
                "Write one sentence about your favorite color and why.",
                "Write one sentence about a skill you want to learn.",
                "Write one sentence about your morning today.",
                "Write one sentence about someone who inspires you.",
                "Write one sentence about your favorite game.",
                "Write one sentence about the weather today.",
                "Write one sentence about a goal you have.",
            ],
            'hi': [
                "अपने परिवार के बारे में एक वाक्य लिखें।",
                "अपने पसंदीदा भोजन के बारे में एक वाक्य लिखें।",
                "अपने सबसे अच्छे दोस्त के बारे में एक वाक्य लिखें।",
                "अपने घर के बारे में एक वाक्य लिखें।",
                "आप किस जगह जाना चाहते हैं, उसके बारे में एक वाक्य लिखें।",
                "अपने पसंदीदा मौसम के बारे में एक वाक्य लिखें।",
                "एक खुशी की याद के बारे में एक वाक्य लिखें।",
                "अपनी दिनचर्या के बारे में एक वाक्य लिखें।",
                "अपने पसंदीदा त्योहार के बारे में एक वाक्य लिखें।",
                "अपने पसंदीदा जानवर के बारे में एक वाक्य लिखें।",
                "हाल ही में आपने जो सीखा, उसके बारे में एक वाक्य लिखें।",
                "अपने मोहल्ले के बारे में एक वाक्य लिखें।",
                "अपनी पसंदीदा किताब या कहानी के बारे में एक वाक्य लिखें।",
                "अपने पसंदीदा रंग और उसकी वजह के बारे में एक वाक्य लिखें।",
                "आप जो नया हुनर सीखना चाहते हैं, उसके बारे में एक वाक्य लिखें।",
                "आज सुबह के बारे में एक वाक्य लिखें।",
                "आपको प्रेरित करने वाले किसी व्यक्ति के बारे में एक वाक्य लिखें।",
                "अपने पसंदीदा खेल के बारे में एक वाक्य लिखें।",
                "आज के मौसम के बारे में एक वाक्य लिखें।",
                "अपने किसी लक्ष्य के बारे में एक वाक्य लिखें।",
            ],
            'kn': [
                "ನಿಮ್ಮ ಕುಟುಂಬದ ಬಗ್ಗೆ ಒಂದು ವಾಕ್ಯ ಬರೆಯಿರಿ.",
                "ನಿಮ್ಮ ಇಷ್ಟದ ಆಹಾರದ ಬಗ್ಗೆ ಒಂದು ವಾಕ್ಯ ಬರೆಯಿರಿ.",
                "ನಿಮ್ಮ ಆಪ್ತ ಸ್ನೇಹಿತರ ಬಗ್ಗೆ ಒಂದು ವಾಕ್ಯ ಬರೆಯಿರಿ.",
                "ನಿಮ್ಮ ಮನೆಯ ಬಗ್ಗೆ ಒಂದು ವಾಕ್ಯ ಬರೆಯಿರಿ.",
                "ನೀವು ಭೇಟಿ ನೀಡಲು ಬಯಸುವ ಸ್ಥಳದ ಬಗ್ಗೆ ಒಂದು ವಾಕ್ಯ ಬರೆಯಿರಿ.",
                "ನಿಮ್ಮ ಇಷ್ಟದ ಋತುವಿನ ಬಗ್ಗೆ ಒಂದು ವಾಕ್ಯ ಬರೆಯಿರಿ.",
                "ಒಂದು ಸಂತೋಷದ ನೆನಪಿನ ಬಗ್ಗೆ ಒಂದು ವಾಕ್ಯ ಬರೆಯಿರಿ.",
                "ನಿಮ್ಮ ದೈನಂದಿನ ದಿನಚರಿಯ ಬಗ್ಗೆ ಒಂದು ವಾಕ್ಯ ಬರೆಯಿರಿ.",
                "ನಿಮಗೆ ಇಷ್ಟವಾದ ಹಬ್ಬದ ಬಗ್ಗೆ ಒಂದು ವಾಕ್ಯ ಬರೆಯಿರಿ.",
                "ನಿಮ್ಮ ಇಷ್ಟದ ಪ್ರಾಣಿಯ ಬಗ್ಗೆ ಒಂದು ವಾಕ್ಯ ಬರೆಯಿರಿ.",
                "ಇತ್ತೀಚೆಗೆ ನೀವು ಕಲಿತ ಒಂದು ವಿಷಯದ ಬಗ್ಗೆ ಒಂದು ವಾಕ್ಯ ಬರೆಯಿರಿ.",
                "ನಿಮ್ಮ ನೆರೆಹೊರೆಯ ಬಗ್ಗೆ ಒಂದು ವಾಕ್ಯ ಬರೆಯಿರಿ.",
                "ನಿಮಗೆ ಇಷ್ಟವಾದ ಪುಸ್ತಕ ಅಥವಾ ಕಥೆಯ ಬಗ್ಗೆ ಒಂದು ವಾಕ್ಯ ಬರೆಯಿರಿ.",
                "ನಿಮ್ಮ ಇಷ್ಟದ ಬಣ್ಣ ಮತ್ತು ಏಕೆ ಎಂಬುದರ ಬಗ್ಗೆ ಒಂದು ವಾಕ್ಯ ಬರೆಯಿರಿ.",
                "ನೀವು ಕಲಿಯಲು ಬಯಸುವ ಕೌಶಲ್ಯದ ಬಗ್ಗೆ ಒಂದು ವಾಕ್ಯ ಬರೆಯಿರಿ.",
                "ಇಂದಿನ ನಿಮ್ಮ ಬೆಳಗಿನ ಬಗ್ಗೆ ಒಂದು ವಾಕ್ಯ ಬರೆಯಿರಿ.",
                "ನಿಮಗೆ ಸ್ಫೂರ್ತಿ ನೀಡುವ ವ್ಯಕ್ತಿಯ ಬಗ್ಗೆ ಒಂದು ವಾಕ್ಯ ಬರೆಯಿರಿ.",
                "ನಿಮ್ಮ ಇಷ್ಟದ ಆಟದ ಬಗ್ಗೆ ಒಂದು ವಾಕ್ಯ ಬರೆಯಿರಿ.",
                "ಇಂದಿನ ಹವಾಮಾನದ ಬಗ್ಗೆ ಒಂದು ವಾಕ್ಯ ಬರೆಯಿರಿ.",
                "ನಿಮ್ಮ ಒಂದು ಗುರಿಯ ಬಗ್ಗೆ ಒಂದು ವಾಕ್ಯ ಬರೆಯಿರಿ.",
            ],
            'ta': [
                "உங்கள் குடும்பத்தைப் பற்றி ஒரு வாக்கியம் எழுதுங்கள்.",
                "உங்களுக்குப் பிடித்த உணவைப் பற்றி ஒரு வாக்கியம் எழுதுங்கள்.",
                "உங்கள் நல்ல நண்பரைப் பற்றி ஒரு வாக்கியம் எழுதுங்கள்.",
                "உங்கள் வீட்டைப் பற்றி ஒரு வாக்கியம் எழுதுங்கள்.",
                "நீங்கள் செல்ல விரும்பும் இடத்தைப் பற்றி ஒரு வாக்கியம் எழுதுங்கள்.",
                "உங்களுக்குப் பிடித்த பருவத்தைப் பற்றி ஒரு வாக்கியம் எழுதுங்கள்.",
                "ஒரு மகிழ்ச்சியான நினைவைப் பற்றி ஒரு வாக்கியம் எழுதுங்கள்.",
                "உங்கள் தினசரி வழக்கத்தைப் பற்றி ஒரு வாக்கியம் எழுதுங்கள்.",
                "உங்களுக்குப் பிடித்த திருவிழாவைப் பற்றி ஒரு வாக்கியம் எழுதுங்கள்.",
                "உங்களுக்குப் பிடித்த விலங்கைப் பற்றி ஒரு வாக்கியம் எழுதுங்கள்.",
                "சமீபத்தில் நீங்கள் கற்றுக்கொண்டதைப் பற்றி ஒரு வாக்கியம் எழுதுங்கள்.",
                "உங்கள் அக்கம்பக்கத்தைப் பற்றி ஒரு வாக்கியம் எழுதுங்கள்.",
                "உங்களுக்குப் பிடித்த புத்தகம் அல்லது கதையைப் பற்றி ஒரு வாக்கியம் எழுதுங்கள்.",
                "உங்களுக்குப் பிடித்த நிறம் மற்றும் ஏன் என்பதைப் பற்றி ஒரு வாக்கியம் எழுதுங்கள்.",
                "நீங்கள் கற்க விரும்பும் திறமையைப் பற்றி ஒரு வாக்கியம் எழுதுங்கள்.",
                "இன்று காலையைப் பற்றி ஒரு வாக்கியம் எழுதுங்கள்.",
                "உங்களை ஊக்குவிக்கும் ஒருவரைப் பற்றி ஒரு வாக்கியம் எழுதுங்கள்.",
                "உங்களுக்குப் பிடித்த விளையாட்டைப் பற்றி ஒரு வாக்கியம் எழுதுங்கள்.",
                "இன்றைய வானிலையைப் பற்றி ஒரு வாக்கியம் எழுதுங்கள்.",
                "உங்கள் இலக்கு ஒன்றைப் பற்றி ஒரு வாக்கியம் எழுதுங்கள்.",
            ],
        }

        count = len(prompts['en'])
        for idx in range(count):
            group_key = f"writing_{idx + 1}"
            for lang in LANGS:
                AssessmentQuestion.objects.get_or_create(
                    group_key=group_key, language=lang,
                    defaults={
                        'assessment_type': 'writing',
                        'question_text': prompts[lang][idx],
                        'question_type': 'text_input',
                        'correct_answer': '3',
                        'order': idx + 1,
                    }
                )
        self.stdout.write(f'  Writing: {count} prompts x {len(LANGS)} languages seeded')