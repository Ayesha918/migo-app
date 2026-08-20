# backend/lessons/management/commands/seed_progressive_writing.py
from django.core.management.base import BaseCommand
from lessons.models import Lesson
import json

class Command(BaseCommand):
    help = "Seed highly localized, level-appropriate, distinct writing lessons for all 4 languages."

    def handle(self, *args, **options):
        self.stdout.write("Deleting existing writing lessons...")
        Lesson.objects.filter(skill='writing').delete()

        languages = ['en', 'hi', 'kn', 'ta']
        seeded_count = 0

        # =====================================================================
        # 1. BEGINNER WRITING DATA
        # =====================================================================
        beginner_data = {
            'en': {
                1: {'trace': 'A', 'trace_sub': 'Trace capital letter A.', 'missing_eq': 'c _ t', 'missing_target': 'a', 'missing_opts': ['a', 'e', 'o'], 'word': 'cat', 'word_image': 'cat', 'sentence': 'The cat is fat.'},
                2: {'trace': 'B', 'trace_sub': 'Trace capital letter B.', 'missing_eq': 'b _ t', 'missing_target': 'a', 'missing_opts': ['a', 'i', 'u'], 'word': 'bat', 'word_image': 'sports', 'sentence': 'This is my bat.'},
                3: {'trace': 'C', 'trace_sub': 'Trace capital letter C.', 'missing_eq': 'c _ p', 'missing_target': 'u', 'missing_opts': ['u', 'a', 'e'], 'word': 'cup', 'word_image': 'cup', 'sentence': 'Fill the cup.'},
                4: {'trace': '1', 'trace_sub': 'Trace number 1.', 'missing_eq': '1 _ 3', 'missing_target': '2', 'missing_opts': ['2', '4', '5'], 'word': 'one', 'word_image': 'number', 'sentence': 'I see one sun.'},
                5: {'trace': 'D', 'trace_sub': 'Trace capital letter D.', 'missing_eq': 'd _ g', 'missing_target': 'o', 'missing_opts': ['o', 'u', 'a'], 'word': 'dog', 'word_image': 'dog', 'sentence': 'The dog can run.'},
                6: {'trace': 'E', 'trace_sub': 'Trace capital letter E.', 'missing_eq': 'e _ g', 'missing_target': 'g', 'missing_opts': ['g', 't', 'p'], 'word': 'egg', 'word_image': 'egg', 'sentence': 'Eat a fresh egg.'},
                7: {'trace': 'F', 'trace_sub': 'Trace capital letter F.', 'missing_eq': 'f _ n', 'missing_target': 'a', 'missing_opts': ['a', 'o', 'i'], 'word': 'fan', 'word_image': 'fan', 'sentence': 'Turn on the fan.'},
                8: {'trace': 'G', 'trace_sub': 'Trace capital letter G.', 'missing_eq': 'g _ n', 'missing_target': 'u', 'missing_opts': ['u', 'a', 'e'], 'word': 'gum', 'word_image': 'sticky', 'sentence': 'Use some sticky gum.'}
            },
            'hi': {
                1: {'trace': 'अ', 'trace_sub': 'स्वर अ का अभ्यास करें।', 'missing_eq': 'अ _ ार', 'missing_target': 'न', 'missing_opts': ['न', 'म', 'त'], 'word': 'अनार', 'word_image': 'fruit', 'sentence': 'अनार बहुत मीठा है।'},
                2: {'trace': 'आ', 'trace_sub': 'स्वर आ का अभ्यास करें।', 'missing_eq': 'आ _', 'missing_target': 'म', 'missing_opts': ['म', 'न', 'क'], 'word': 'आम', 'word_image': 'fruit', 'sentence': 'आम मीठा फल है।'},
                3: {'trace': '१', 'trace_sub': 'संख्या १ का अभ्यास करें।', 'missing_eq': '१ _ ३', 'missing_target': '२', 'missing_opts': ['२', '४', '५'], 'word': 'एक', 'word_image': 'number', 'sentence': 'यहाँ एक फल है।'},
                4: {'trace': 'क', 'trace_sub': 'व्यंजन क का अभ्यास करें।', 'missing_eq': 'क _ ल', 'missing_target': 'म', 'missing_opts': ['म', 'न', 'त'], 'word': 'कमल', 'word_image': 'flower', 'sentence': 'कमल सुंदर फूल है।'},
                5: {'trace': 'म', 'trace_sub': 'व्यंजन म का अभ्यास करें।', 'missing_eq': 'म _ र', 'missing_target': 'ग', 'missing_opts': ['ग', 'च', 'त'], 'word': 'मगर', 'word_image': 'animal', 'sentence': 'मगर बड़ा जानवर है।'},
                6: {'trace': 'र', 'trace_sub': 'व्यंजन र का अभ्यास करें।', 'missing_eq': 'र _ थ', 'missing_target': 'थ', 'missing_opts': ['थ', 'त', 'म'], 'word': 'रथ', 'word_image': 'vehicle', 'sentence': 'रथ पुराना है।'},
                7: {'trace': 'स', 'trace_sub': 'व्यंजन स का अभ्यास करें।', 'missing_eq': 'स _ क', 'missing_target': 'ड़', 'missing_opts': ['ड़', 'क', 'न'], 'word': 'सड़क', 'word_image': 'road', 'sentence': 'सड़क साफ है।'},
                8: {'trace': 'ह', 'trace_sub': 'व्यंजन ह का अभ्यास करें।', 'missing_eq': 'ह _', 'missing_target': 'ल', 'missing_opts': ['ल', 'न', 'म'], 'word': 'हल', 'word_image': 'tool', 'sentence': 'हल मजबूत है।'}
            },
            'kn': {
                1: {'trace': 'ಅ', 'trace_sub': "ಸ್ವರ 'ಅ' ಬರೆಯಲು ಕಲಿಯೋಣ.", 'missing_eq': 'ಅ _ ಸ', 'missing_target': 'ರ', 'missing_opts': ['ರ', 'ಮ', 'ನ'], 'word': 'ಅರಸ', 'word_image': 'person', 'sentence': 'ಅರಸನು ತುಂಬಾ ಒಳ್ಳೆಯವನು.'},
                2: {'trace': 'ಆ', 'trace_sub': "ಸ್ವರ 'ಆ' ಬರೆಯಲು ಕಲಿಯೋಣ.", 'missing_eq': 'ಆ _ ೆ', 'missing_target': 'ನ', 'missing_opts': ['ನೆ', 'ಮೆ', 'ಕೆ'], 'word': 'ಆನೆ', 'word_image': 'animal', 'sentence': 'ಆನೆಯು ದೊಡ್ಡದಾಗಿದೆ.'},
                3: {'trace': '೧', 'trace_sub': "ಸಂಖ್ಯೆ '೧' ಬರೆಯಲು ಕಲಿಯೋಣ.", 'missing_eq': '೧ _ ೩', 'missing_target': '೨', 'missing_opts': ['೨', '೪', '೫'], 'word': 'ಒಂದು', 'word_image': 'number', 'sentence': 'ನನಗೆ ಒಂದು ಹಣ್ಣು ಕೊಡು.'},
                4: {'trace': 'ಕ', 'trace_sub': "ವ್ಯಂಜನ 'ಕ' ಬರೆಯಲು ಕಲಿಯೋಣ.", 'missing_eq': 'ಕ _ ಲ', 'missing_target': 'ಮ', 'missing_opts': ['ಮ', 'ನ', 'ತ'], 'word': 'ಕಮಲ', 'word_image': 'flower', 'sentence': 'ಕಮಲ ಕೆರೆಯಲ್ಲಿ ಅರಳುತ್ತದೆ.'},
                5: {'trace': 'ಮ', 'trace_sub': "ವ್ಯಂಜನ 'ಮ' ಬರೆಯಲು ಕಲಿಯೋಣ.", 'missing_eq': 'ಮ _ ೆ', 'missing_target': 'ನ', 'missing_opts': ['ನೆ', 'ಗೆ', 'ಚೆ'], 'word': 'ಮನೆ', 'word_image': 'home', 'sentence': 'ನನ್ನ ಮನೆ ಸುಂದರವಾಗಿದೆ.'},
                6: {'trace': 'ರ', 'trace_sub': "ವ್ಯಂಜನ 'ರ' ಬರೆಯಲು ಕಲಿಯೋಣ.", 'missing_eq': 'ರ _ ಿ', 'missing_target': 'ವ', 'missing_opts': ['ವಿ', 'ಕಿ', 'ನಿ'], 'word': 'ರವಿ', 'word_image': 'sun', 'sentence': 'ರವಿ ಬೆಳಕು ನೀಡುತ್ತಾನೆ.'},
                7: {'trace': 'ಸ', 'trace_sub': "ವ್ಯಂಜನ 'ಸ' ಬರೆಯಲು ಕಲಿಯೋಣ.", 'missing_eq': 'ಸ _ ಿ', 'missing_target': 'ಭ', 'missing_opts': ['ಭೆ', 'ಹೆ', 'ಕೆ'], 'word': 'ಸಭೆ', 'word_image': 'meeting', 'sentence': 'ಸಭೆಯು ಪ್ರಾರಂಭವಾಯಿತು.'},
                8: {'trace': 'ಹ', 'trace_sub': "ವ್ಯಂಜನ 'ಹ' ಬರೆಯಲು ಕಲಿಯೋಣ.", 'missing_eq': 'ಹ _ ು', 'missing_target': 'ಣ್ಣ', 'missing_opts': ['ಣ್ಣು', 'ನ್ನು', 'ಮ್ಮು'], 'word': 'ಹಣ್ಣು', 'word_image': 'fruit', 'sentence': 'ಹಣ್ಣು ರುಚಿಯಾಗಿದೆ.'}
            },
            'ta': {
                1: {'trace': 'அ', 'trace_sub': "உยிரெழுத்து 'அ' எழுதக் கற்றுக்கொள்வோம்.", 'missing_eq': 'அ _ ்மா', 'missing_target': 'ம', 'missing_opts': ['ம', 'த', 'ந'], 'word': 'அಮ್ಮா', 'word_image': 'mother', 'sentence': 'அம்மா என் தெய்வம்.'},
                2: {'trace': 'ஆ', 'trace_sub': "உยிரெழுத்து 'ஆ' எழுதக் கற்றுக்கொள்வோம்.", 'missing_eq': 'ஆ _ ு', 'missing_target': 'டு', 'missing_opts': ['டு', 'மு', 'கு'], 'word': 'ஆடு', 'word_image': 'animal', 'sentence': 'ஆடு புல் தின்னும்.'},
                3: {'trace': '௧', 'trace_sub': "தமிழ் எண் '௧' எழுதக் கற்றுக்கொள்வோம்.", 'missing_eq': '௧ _ ௨', 'missing_target': 'உ', 'missing_opts': ['உ', 'ங', 'ச'], 'word': 'ஒன்று', 'word_image': 'number', 'sentence': 'என்னிடம் ஒரு பேனா உள்ளது.'},
                4: {'trace': 'க', 'trace_sub': "மெய்யெழுத்து 'க' எழுதக் கற்றுக்கொள்வோம்.", 'missing_eq': 'க _ ்', 'missing_target': 'ல்', 'missing_opts': ['ல்', 'ண்', 'ம்'], 'word': 'கல்', 'word_image': 'stone', 'sentence': 'கல் பெரியதாக உள்ளது.'},
                5: {'trace': 'ம', 'trace_sub': "மெய்யெழுத்து 'ம' எழுதக் கற்றுக்கொள்வோம்.", 'missing_eq': 'ம _ ம்', 'missing_target': 'ர', 'missing_opts': ['ர', 'ன', 'ல'], 'word': 'மரம்', 'word_image': 'tree', 'sentence': 'மரம் நிழல் தரும்.'},
                6: {'trace': 'வ', 'trace_sub': "மெய்யெழுத்து 'வ' எழுதக் கற்றுக்கொள்வோம்.", 'missing_eq': 'வ _ ி', 'missing_target': 'ழ', 'missing_opts': ['ழி', 'டி', 'லி'], 'word': 'வழி', 'word_image': 'road', 'sentence': 'இது நல்ல வழி.'},
                7: {'trace': 'ப', 'trace_sub': "மெய்யெழுத்து 'ப' எழுதக் கற்றுக்கொள்வோம்.", 'missing_eq': 'ப _ ்', 'missing_target': 'ல்', 'missing_opts': ['ல்', 'ண்', 'ம்'], 'word': 'பல்', 'word_image': 'tooth', 'sentence': 'பற்கள் சுத்தமாக உள்ளன.'},
                8: {'trace': 'அ', 'trace_sub': "உยிரெழுத்து 'அ' எழுதக் கற்றுக்கொள்வோம்.", 'missing_eq': 'அ _ ்', 'missing_target': 'ன்பು', 'missing_opts': ['ன்பು', 'றிவை', 'ழகை'], 'word': 'அன்பು', 'word_image': 'heart', 'sentence': 'அன்பு மிகச் சிறந்தது.'}
            }
        }

        # =====================================================================
        # 2. INTERMEDIATE WRITING DATA
        # =====================================================================
        intermediate_data = {
            'en': {
                1: {
                    'type': 'unscramble_words',
                    'unscramble_title': 'Word Building',
                    'unscramble_subtitle': 'Unscramble the letters to make words.',
                    'unscramble_instruction': 'Drag and drop the letters in the right order.',
                    'items': [
                        {'id': 1, 'clue': 'A person', 'image': 'man', 'tokens': ['u', 'n', 'm', 'h', 'a'], 'target': 'human'},
                        {'id': 2, 'clue': 'A place to buy things', 'image': 'shop', 'tokens': ['e', 't', 'k', 'r', 'a', 'm'], 'target': 'market'}
                    ]
                },
                2: {
                    'type': 'unscramble_sentence',
                    'title': 'Sentence Building',
                    'subtitle': 'Arrange the words to form a correct sentence.',
                    'instruction': 'Tap the scrambled word tokens in the correct order.',
                    'tokens': ['the', 'park', 'children', 'in', 'play'],
                    'target': 'The children play in the park.'
                },
                3: {
                    'type': 'paragraph_writing',
                    'title': 'Paragraph Writing',
                    'subtitle': 'Write a short paragraph about your school.',
                    'topic': 'My School',
                    'instruction': 'Write at least 10 words. Describe your school, teachers, and friends.'
                },
                4: [
                    {'questionNumber': 1, 'questionText': 'Add the correct punctuation.', 'equation': 'Where are you going', 'target': 'Where are you going ?', 'options': ['Where are you going.', 'Where are you going ?', 'Where are you going !']},
                    {'questionNumber': 2, 'questionText': 'Add the correct punctuation.', 'equation': 'Stop the car', 'target': 'Stop the car !', 'options': ['Stop the car ?', 'Stop the car ,', 'Stop the car !']}
                ],
                5: [
                    {'questionNumber': 1, 'questionText': 'Use capital letters correctly.', 'equation': 'my name is ayesha', 'target': 'My name is Ayesha.', 'options': ['my name is ayesha.', 'My name is ayesha.', 'My name is Ayesha.']},
                    {'questionNumber': 2, 'questionText': 'Use capital letters correctly.', 'equation': 'we live in india', 'target': 'We live in India.', 'options': ['we live in india.', 'We live in india.', 'We live in India.']}
                ],
                6: {
                    'type': 'paragraph_writing',
                    'title': 'Creative Writing',
                    'subtitle': 'Write a short paragraph about your favorite animal.',
                    'topic': 'My Favorite Animal',
                    'instruction': 'Write at least 10 words. Explain why you like this animal and what it does.'
                },
                7: {
                    'type': 'paragraph_writing',
                    'title': 'Describing a Topic',
                    'subtitle': 'Write a brief description of your daily routine.',
                    'topic': 'My Daily Routine',
                    'instruction': 'Write at least 10 words about what you do from morning to night.'
                },
                8: [
                    {'type': 'unscramble_words', 'title': 'Review spelling words', 'subtitle': 'Unscramble the letters.', 'instruction': 'Drag and drop the letters.', 'items': [{'id': 1, 'clue': 'A person', 'image': 'man', 'tokens': ['u', 'n', 'm', 'h', 'a'], 'target': 'human'}]},
                    {'type': 'unscramble_sentence', 'title': 'Sentence Review', 'subtitle': 'Arrange the words to form a sentence.', 'instruction': 'Tap tokens in the correct order.', 'tokens': ['makes', 'us', 'smart', 'reading'], 'target': 'Reading makes us smart.'}
                ]
            },
            'hi': {
                1: {
                    'type': 'unscramble_words',
                    'unscramble_title': 'शब्द निर्माण',
                    'unscramble_subtitle': 'सार्थक शब्द बनाने के लिए अक्षरों को सुलझाएं।',
                    'unscramble_instruction': 'अक्षरों को सही क्रम में व्यवस्थित करें।',
                    'items': [
                        {'id': 1, 'clue': 'एक मनुष्य/व्यक्ति', 'image': 'man', 'tokens': ['म', 'ा', 'न', 'व'], 'target': 'मानव'},
                        {'id': 2, 'clue': 'सामान खरीदने की जगह', 'image': 'shop', 'tokens': ['ब', 'ा', 'ज', 'ा', 'र'], 'target': 'बाजार'}
                    ]
                },
                2: {
                    'type': 'unscramble_sentence',
                    'title': 'वाक्य निर्माण',
                    'subtitle': 'सही वाक्य बनाने के लिए शब्दों को व्यवस्थित करें।',
                    'instruction': 'दिए गए शब्दों को सही क्रम में टैप करें।',
                    'tokens': ['खेलते', 'पार्क', 'बच्चे', 'हैं।', 'में'],
                    'target': 'बच्चे पार्क में खेलते हैं।'
                },
                3: {
                    'type': 'paragraph_writing',
                    'title': 'अनुच्छेद लेखन',
                    'subtitle': 'दिए गए विषय पर एक संक्षिप्त अनुच्छेद लिखें।',
                    'topic': 'मेरा विद्यालय',
                    'instruction': 'कम से कम १० शब्द लिखें। अपने विद्यालय, शिक्षकों और दोस्तों के बारे में बताएं।'
                },
                4: [
                    {'questionNumber': 1, 'questionText': 'सही विराम चिह्न जोड़ें।', 'equation': 'आप कहाँ जा रहे हैं', 'target': 'आप कहाँ जा रहे हैं?', 'options': ['आप कहाँ जा रहे हैं।', 'आप कहाँ जा रहे हैं?', 'आप कहाँ जा रहे हैं!']},
                    {'questionNumber': 2, 'questionText': 'सही विराम चिह्न जोड़ें।', 'equation': 'गाड़ी रोको', 'target': 'गाड़ी रोको!', 'options': ['गाड़ी रोको?', 'गाड़ी रोको,', 'गाड़ी रोको!']}
                ],
                5: [
                    {'questionNumber': 1, 'questionText': 'सही वर्तनी चुनें।', 'equation': 'मेरा नाम आयशा है', 'target': 'मेरा नाम आयशा है।', 'options': ['मेरा नाम आयशा है', 'मेरा नाम आयषा है।', 'मेरा नाम आयशा है।']},
                    {'questionNumber': 2, 'questionText': 'सही वर्तनी चुनें।', 'equation': 'हम भारत में रहते हैं', 'target': 'हम भारत में रहते हैं।', 'options': ['हम भारत में रहते हैं', 'हम भारत में रह्ते हैं।', 'हम भारत में रहते हैं।']}
                ],
                6: {
                    'type': 'paragraph_writing',
                    'title': 'सृजनात्मक लेखन',
                    'subtitle': 'अपने पसंदीदा जानवर के बारे में एक संक्षिप्त अनुच्छेद लिखें।',
                    'topic': 'मेरा पसंदीदा जानवर',
                    'instruction': 'कम से कम १० शब्द लिखें। समझाएं कि आप इस जानवर को क्यों पसंद करते हैं।'
                },
                7: {
                    'type': 'paragraph_writing',
                    'title': 'विषय का विवरण',
                    'subtitle': 'अपनी दिनचर्या के बारे में एक छोटा अनुच्छेद लिखें।',
                    'topic': 'मेरी दिनचर्या',
                    'instruction': 'कम से कम १० शब्द लिखें कि आप सुबह से रात तक क्या करते हैं।'
                },
                8: [
                    {'type': 'unscramble_words', 'title': 'वर्तनी शब्दों की समीक्षा', 'subtitle': 'अक्षरों को सुलझाएं।', 'instruction': 'अक्षरों को सही क्रम में रखें।', 'items': [{'id': 1, 'clue': 'एक मनुष्य/व्यक्ति', 'image': 'man', 'tokens': ['म', 'ा', 'न', 'व'], 'target': 'मानव'}]},
                    {'type': 'unscramble_sentence', 'title': 'वाक्य समीक्षा', 'subtitle': 'सही वाक्य बनाने के लिए शब्दों को व्यवस्थित करें।', 'instruction': 'दिए गए शब्दों को सही क्रम में टैप करें।', 'tokens': ['बनाता', 'हमें', 'समझदार', 'है।', 'पढ़ना'], 'target': 'पढ़ना हमें समझदार बनाता है।'}
                ]
            },
            'kn': {
                1: {
                    'type': 'unscramble_words',
                    'unscramble_title': 'ಪದ ರಚನೆ',
                    'unscramble_subtitle': 'ಸಾರ್ಥಕ ಪದಗಳನ್ನು ರಚಿಸಲು ಅಕ್ಷರಗಳನ್ನು ಜೋಡಿಸಿ.',
                    'unscramble_instruction': 'ಅಕ್ಷರಗಳನ್ನು ಸರಿಯಾದ ಕ್ರಮದಲ್ಲಿ ಇರಿಸಿ.',
                    'items': [
                        {'id': 1, 'clue': 'ಒಬ್ಬ ಮನುಷ್ಯ', 'image': 'man', 'tokens': ['ಮಾ', 'ನ', 'ವ'], 'target': 'ಮಾನವ'},
                        {'id': 2, 'clue': 'ವಸ್ತುಗಳನ್ನು ಖರೀದಿಸುವ ಸ್ಥಳ', 'image': 'shop', 'tokens': ['ಮಾ', 'ರು', 'ಕ', 'ಟ್ಟೆ'], 'target': 'ಮಾರುಕಟ್ಟೆ'}
                    ]
                },
                2: {
                    'type': 'unscramble_sentence',
                    'title': 'ವಾಕ್ಯ ರಚನೆ',
                    'subtitle': 'ಸರಿಯಾದ ವಾಕ್ಯವನ್ನು ರೂಪಿಸಲು ಪದಗಳನ್ನು ಜೋಡಿಸಿ.',
                    'instruction': 'ಕೊಟ್ಟಿರುವ ಪದಗಳನ್ನು ಸರಿಯಾದ ಕ್ರಮದಲ್ಲಿ ಸ್ಪರ್ಶಿಸಿ.',
                    'tokens': ['ಆಟವಾಡುತ್ತಾರೆ.', 'ಉದ್ಯಾನವನದಲ್ಲಿ', 'ಮಕ್ಕಳು'],
                    'target': 'ಮಕ್ಕಳು ಉದ್ಯಾನವನದಲ್ಲಿ ಆಟವಾಡುತ್ತಾರೆ.'
                },
                3: {
                    'type': 'paragraph_writing',
                    'title': 'ಪ್ಯಾರಾಗ್ರಾಫ್ ಬರವಣಿಗೆ',
                    'subtitle': 'ಕೊಟ್ಟಿರುವ ವಿಷಯದ ಬಗ್ಗೆ ಒಂದು ಸಣ್ಣ ಪ್ಯಾರಾಗ್ರಾಫ್ ಬರೆಯಿರಿ.',
                    'topic': 'ನನ್ನ ಶಾಲೆ',
                    'instruction': 'ಕನಿಷ್ಠ ೧೦ ಪದಗಳನ್ನು ಬರೆಯಿರಿ. ನಿಮ್ಮ ಶಾಲೆ, ಶಿಕ್ಷಕರು ಮತ್ತು ಸ್ನೇಹಿತರನ್ನು ವಿವರಿಸಿ.'
                },
                4: [
                    {'questionNumber': 1, 'questionText': 'ಸರಿಯಾದ ವಿರಾಮ ಚಿಹ್ನೆಯನ್ನು ಸೇರಿಸಿ.', 'equation': 'ನೀವು ಎಲ್ಲಿಗೆ ಹೋಗುತ್ತಿದ್ದೀರಿ', 'target': 'ನೀವು ಎಲ್ಲಿಗೆ ಹೋಗುತ್ತಿದ್ದೀರಿ?', 'options': ['ನೀವು ಎಲ್ಲಿಗೆ ಹೋಗುತ್ತಿದ್ದೀರಿ.', 'ನೀವು ಎಲ್ಲಿಗೆ ಹೋಗುತ್ತಿದ್ದೀರಿ?', 'ನೀವು ಎಲ್ಲಿಗೆ ಹೋಗುತ್ತಿದ್ದೀರಿ!']},
                    {'questionNumber': 2, 'questionText': 'ಸರಿಯಾದ ವಿರಾಮ ಚಿಹ್ನೆಯನ್ನು ಸೇರಿಸಿ.', 'equation': 'ಗಾಡಿಯನ್ನು ನಿಲ್ಲಿಸು', 'target': 'ಗಾಡಿಯನ್ನು ನಿಲ್ಲಿಸು!', 'options': ['ಗಾಡಿಯನ್ನು ನಿಲ್ಲಿಸು?', 'ಗಾಡಿಯನ್ನು ನಿಲ್ಲಿಸು,', 'ಗಾಡಿಯನ್ನು ನಿಲ್ಲಿಸು!']}
                ],
                5: [
                    {'questionNumber': 1, 'questionText': 'ಸರಿಯಾದ ಕಾಗುಣಿತ ಆರಿಸಿ.', 'equation': 'ನನ್ನ ದೇಶ ಭಾರತ', 'target': 'ನನ್ನ ದೇಶ ಭಾರತ.', 'options': ['ನನ್ನ ದೇಶ ಭಾರತ', 'ನನ್ನ ದೇಶ ಬಾರತ.', 'ನನ್ನ ದೇಶ ಭಾರತ.']},
                    {'questionNumber': 2, 'questionText': 'ಸರಿಯಾದ ಕಾಗುಣಿತ ಆರಿಸಿ.', 'equation': 'ಸೂರ್ಯನು ಬೆಳಕು ನೀಡುತ್ತಾನೆ', 'target': 'ಸೂರ್ಯನು ಬೆಳಕು ನೀಡುತ್ತಾನೆ.', 'options': ['ಸೂರ್ಯನು ಬೆಳಕು ನೀಡುತ್ತಾನೆ', 'ಸೂರ‍್ಯನು ಬೆಳಕು ನೀಡುತ್ತಾನೆ.', 'ಸೂರ್ಯನು ಬೆಳಕು ನೀಡುತ್ತಾನೆ.']}
                ],
                6: {
                    'type': 'paragraph_writing',
                    'title': 'ಸೃಜನಶೀಲ ಬರವಣಿಗೆ',
                    'subtitle': 'ನಿಮಗೆ ಇಷ್ಟವಾದ ಪ್ರಾಣಿಯ ಬಗ್ಗೆ ಒಂದು ಸಣ್ಣ ಪ್ಯಾರಾಗ್ರಾಫ್ ಬರೆಯಿರಿ.',
                    'topic': 'ನನ್ನ ಪ್ರೀತಿಯ ಪ್ರಾಣಿ',
                    'instruction': 'ಕನಿಷ್ಠ ೧೦ ಪದಗಳನ್ನು ಬರೆಯಿರಿ. ನೀವು ಆ ಪ್ರಾಣಿಯನ್ನು ಏಕೆ ಇಷ್ಟಪಡುತ್ತೀರಿ ಎಂದು ವಿವರಿಸಿ.'
                },
                7: {
                    'type': 'paragraph_writing',
                    'title': 'ದಿನಚರಿಯ ವಿವರಣೆ',
                    'subtitle': 'ನಿಮ್ಮ ದಿನಚರಿಯ ಬಗ್ಗೆ ಒಂದು ಸಣ್ಣ ಪ್ಯಾರಾಗ್ರಾಫ್ ಬರೆಯಿರಿ.',
                    'topic': 'ನನ್ನ ದಿನಚರಿ',
                    'instruction': 'ಕನಿಷ್ಠ ೧೦ ಪದಗಳನ್ನು ಬರೆಯಿರಿ. ಬೆಳಗ್ಗಿನಿಂದ ರಾತ್ರಿಯವರೆಗೆ ನೀವು ಏನು ಮಾಡುತ್ತೀರಿ ಎಂದು ವಿವರಿಸಿ.'
                },
                8: [
                    {'type': 'unscramble_words', 'title': 'ಪದಗಳ ಪುನರಾವರ್ತನೆ', 'subtitle': 'ಅಕ್ಷರಗಳನ್ನು ಜೋಡಿಸಿ.', 'instruction': 'ಅಕ್ಷರಗಳನ್ನು ಸರಿಯಾದ ಕ್ರಮದಲ್ಲಿ ಇರಿಸಿ.', 'items': [{'id': 1, 'clue': 'ಒಬ್ಬ ಮನುಷ್ಯ', 'image': 'man', 'tokens': ['ಮಾ', 'ನ', 'ವ'], 'target': 'ಮಾನವ'}]},
                    {'type': 'unscramble_sentence', 'title': 'ವಾಕ್ಯದ ಪುನರಾವರ್ತನೆ', 'subtitle': 'ಸರಿಯಾದ ವಾಕ್यವನ್ನು ರೂಪಿಸಲು ಪದಗಳನ್ನು ಜೋಡಿಸಿ.', 'instruction': 'ಕೊಟ್ಟಿರುವ ಪದಗಳನ್ನು ಸರಿಯಾದ ಕ್ರಮದಲ್ಲಿ ಸ್ಪರ್ಶಿಸಿ.', 'tokens': ['ನಮ್ಮನ್ನು', 'ಜ್ಞಾನಿಗಳನ್ನಾಗಿ', 'ಮಾಡುತ್ತದೆ.', 'ಓದು'], 'target': 'ಓದು ನಮ್ಮನ್ನು ಜ್ಞಾನಿಗಳನ್ನಾಗಿ ಮಾಡುತ್ತದೆ.'}
                ]
            },
            'ta': {
                1: {
                    'type': 'unscramble_words',
                    'unscramble_title': 'சொல் உருவாக்கம்',
                    'unscramble_subtitle': 'சரியான சொல்லை உருவாக்க எழுத்துக்களை வரிசைப்படுத்துங்கள்.',
                    'unscramble_instruction': 'எழுத்துக்களை இழுத்து சரியான இடத்தில் வைக்கவும்.',
                    'items': [
                        {'id': 1, 'clue': 'ஒரு மனிதன்', 'image': 'man', 'tokens': ['ம', 'னி', 'த', 'ன்'], 'target': 'மனிதன்'},
                        {'id': 2, 'clue': 'பொருட்கள் வாங்கும் இடம்', 'image': 'shop', 'tokens': ['ச', 'ந்', 'தை'], 'target': 'சந்தை'}
                    ]
                },
                2: {
                    'type': 'unscramble_sentence',
                    'title': 'வாக்கிய உருவாக்கம்',
                    'subtitle': 'சரியான வாக்கியத்தை அமைக்க சொற்களை வரிசைப்படுத்துங்கள்.',
                    'instruction': 'கொடுக்கப்பட்ட சொற்களை சரியான வரிசையில் தட்டவும்.',
                    'tokens': ['விளையாடுகிறார்கள்.', 'மைதானத்தில்', 'குழந்தைகள்'],
                    'target': 'குழந்தைகள் மைதானத்தில் விளையாடுகிறார்கள்.'
                },
                3: {
                    'type': 'paragraph_writing',
                    'title': 'பத்தி எழுதுதல்',
                    'subtitle': 'உங்கள் பள்ளியைப் பற்றி ஒரு சிறு பத்தி எழுதுங்கள்.',
                    'topic': 'என் பள்ளி',
                    'instruction': 'குறைந்தது 10 சொற்கள் எழுதவும். உங்கள் பள்ளி, ஆசிரியர்கள் மற்றும் நண்பர்களைப் பற்றி விவரிக்கவும்.'
                },
                4: [
                    {'questionNumber': 1, 'questionText': 'சரியான நிறுத்தற்குறியைச் சேர்க்கவும்.', 'equation': 'நீங்கள் எங்கே செல்கிறீர்கள்', 'target': 'நீங்கள் எங்கே செல்கிறீர்கள்?', 'options': ['நீங்கள் எங்கே செல்கிறீர்கள்.', 'நீங்கள் எங்கே செல்கிறீர்கள்?', 'நீங்கள் எங்கே செல்கிறீர்கள்!']},
                    {'questionNumber': 2, 'questionText': 'சரியான நிறுத்தற்குறியைச் சேர்க்கவும்.', 'equation': 'வண்டியை நிறுத்து', 'target': 'வண்டியை நிறுத்து!', 'options': ['வண்டியை நிறுத்து?', 'வண்டியை நிறுத்து,', 'வண்டியை நிறுத்து!']}
                ],
                5: [
                    {'questionNumber': 1, 'questionText': 'சரியான எழுத்துக்கூட்டலைத் தேர்ந்தெடுக்கவும்.', 'equation': 'தமிழ் வாழ்க', 'target': 'தமிழ் வாழ்க!', 'options': ['தமிழ் வாழ்க', 'தமிழ் வால்க!', 'தமிழ் வாழ்க!']},
                    {'questionNumber': 2, 'questionText': 'சரியான எழுத்துக்கூட்டலைத் தேர்ந்தெடுக்கவும்.', 'equation': 'அம்மா கூப்பிட்டார்', 'target': 'அம்மா கூப்பிட்டார்.', 'options': ['அம்மா கூப்பிட்டார்', 'அம்மா கூப்பிட்டாள்.', 'அம்மா கூப்பிட்டார்.']}
                ],
                6: {
                    'type': 'paragraph_writing',
                    'title': 'படைப்பாற்றல் எழுத்து',
                    'subtitle': 'உங்களுக்குப் பிடித்த விலங்கைப் பற்றி ஒரு சிறு பத்தி எழுதுங்கள்.',
                    'topic': 'எனக்குப் பிடித்த விலங்கு',
                    'instruction': 'குறைந்தது 10 சொற்கள் எழுதவும். இந்த விலங்கு ஏன் உங்களுக்குப் பிடிக்கும் என விளக்கவும்.'
                },
                7: {
                    'type': 'paragraph_writing',
                    'title': 'தலைப்பு விளக்கம்',
                    'subtitle': 'உங்கள் தினசரி பழக்கவழக்கங்கள் பற்றி எழுதுங்கள்.',
                    'topic': 'என் தினசரி பழக்கங்கள்',
                    'instruction': 'குறைந்தது 10 சொற்கள் எழுதவும். காலையிலிருந்து இரவு வரை நீங்கள் என்ன செய்கிறீர்கள் என விவரிக்கவும்.'
                },
                8: [
                    {'type': 'unscramble_words', 'title': 'சொற்கள் திருப்புதல்', 'subtitle': 'எழுத்துக்களை வரிசைப்படுத்துங்கள்.', 'instruction': 'எழுத்துக்களை சரியான வரிசையில் வைக்கவும்.', 'items': [{'id': 1, 'clue': 'ஒரு மனிதன்', 'image': 'man', 'tokens': ['ம', 'னி', 'த', 'ன்'], 'target': 'மனிதன்'}]},
                    {'type': 'unscramble_sentence', 'title': 'வாக்கியம் திருப்புதல்', 'subtitle': 'சரியான வாக்கியத்தை அமைக்க சொற்களை வரிசைப்படுத்துங்கள்.', 'instruction': 'சொற்களை சரியான வரிசையில் தட்டவும்.', 'tokens': ['அறிவை', 'வளர்க்கும்.', 'வாசிப்பு'], 'target': 'வாசிப்பு அறிவை வளர்க்கும்.'}
                ]
            }
        }

        # =====================================================================
        # 3. ADVANCED WRITING DATA
        # =====================================================================
        advanced_data = {
            'en': {
                1: {
                    'type': 'letter_drafting',
                    'title': 'Formal Request Email',
                    'subtitle': 'Draft a leave email',
                    'topic': 'Requesting sick leave from your office or school supervisor.',
                    'instruction': 'Include a subject line, formal greeting, reason for leave, and closing signature.',
                    'template': 'Subject: Sick Leave Request\n\nDear Supervisor,\n\nI am writing to formally request sick leave for two days due to fever. I will make sure to catch up on all tasks once I return.\n\nSincerely,\n[Name]'
                },
                2: {
                    'type': 'paragraph_writing',
                    'title': 'Creative Narratives',
                    'subtitle': 'Write a short story',
                    'topic': 'A Clever Fox',
                    'instruction': 'Write at least 25 words. Narrate how a clever fox managed to find food on a hot summer day.'
                },
                3: {
                    'type': 'paragraph_writing',
                    'title': 'Descriptive Essays',
                    'subtitle': 'Describe a scene',
                    'topic': 'A Journey by Train',
                    'instruction': 'Write at least 25 words. Describe the sights, sounds, and experience of riding a train through the countryside.'
                },
                4: {
                    'type': 'paragraph_writing',
                    'title': 'Opinion & Arguments',
                    'subtitle': 'Write an explanation',
                    'topic': 'Why Education Matters',
                    'instruction': 'Write at least 25 words explaining why education is important for personal and societal growth.'
                },
                5: {
                    'type': 'paragraph_writing',
                    'title': 'Text Summarization',
                    'subtitle': 'Summarize a reading passage',
                    'topic': 'Healthy Eating Habits',
                    'instruction': 'Write a summary of at least 20 words explaining that eating fresh fruits, vegetables, and drinking clean water is essential.'
                },
                6: {
                    'type': 'letter_drafting',
                    'title': 'Formal Complaint Letter',
                    'subtitle': 'Draft a complaint letter',
                    'topic': 'Write a formal letter to a shop manager complaining about a damaged product delivery.',
                    'instruction': 'State the order details, the issue with the product, and demand a replacement or refund.',
                    'template': 'To,\nThe Shop Manager\n\nSubject: Complaint regarding damaged product delivery\n\nI received order #1234 yesterday but the item was damaged. Please arrange a replacement.\n\nSincerely,\n[Name]'
                },
                7: {
                    'type': 'paragraph_writing',
                    'title': 'Report Writing',
                    'subtitle': 'Write an environmental report',
                    'topic': 'Protecting Our Forests',
                    'instruction': 'Write at least 25 words reporting on why forests are disappearing and how we can plant more trees.'
                },
                8: {
                    'type': 'paragraph_writing',
                    'title': 'Independent Project',
                    'subtitle': 'Write a career essay',
                    'topic': 'My Career Goal',
                    'instruction': 'Write at least 30 words describing what you want to become in life and how you plan to achieve it.'
                }
            },
            'hi': {
                1: {
                    'type': 'letter_drafting',
                    'title': 'छुट्टी के लिए प्रार्थना पत्र',
                    'subtitle': 'प्रार्थना पत्र ड्राफ्ट करें',
                    'topic': 'बीमारी के कारण विद्यालय के प्रधानाचार्य से दो दिन की छुट्टी का अनुरोध करें।',
                    'instruction': 'सेवा में, प्रधानाचार्य महोदय लिखते हुए विषय, कारण और अंत में अपना नाम शामिल करें।',
                    'template': 'सेवा में,\nप्रधानाचार्य महोदय\n\nविषय: दो दिन की छुट्टी हेतु प्रार्थना पत्र\n\nमहोदय,\nसविनय निवेदन है कि मुझे कल रात से तेज बुखार है। डॉक्टर ने मुझे आराम की सलाह दी है। कृपया मुझे दो दिन का अवकाश प्रदान करें।\n\nआपका आज्ञाकारी छात्र/छात्रा,\n[Name]'
                },
                2: {
                    'type': 'paragraph_writing',
                    'title': 'सृजनात्मक कहानियाँ',
                    'subtitle': 'एक कहानी लिखें',
                    'topic': 'एकता में बल है',
                    'instruction': 'कम से कम २५ शब्दों में एक कहानी लिखें कि कैसे लकड़ी के गट्ठर को कोई तोड़ नहीं पाया, जिससे एकता का महत्व सिद्ध हुआ।'
                },
                3: {
                    'type': 'paragraph_writing',
                    'title': 'वर्णनात्मक निबंध',
                    'subtitle': 'त्योहार का वर्णन करें',
                    'topic': 'दीपावली का त्यौहार',
                    'instruction': 'कम से कम २५ शब्दों में लिखें कि दीपावली कैसे मनाई जाती है, दीप कैसे जलाए जाते हैं और मिठाइयाँ बाँटी जाती हैं।'
                },
                4: {
                    'type': 'paragraph_writing',
                    'title': 'विचार और तर्क',
                    'subtitle': 'अपने विचार लिखें',
                    'topic': 'जल संरक्षण का महत्व',
                    'instruction': 'कम से कम २५ शब्दों में समझाएं कि हमें पानी की बर्बादी क्यों रोकनी चाहिए और जल संचयन क्यों आवश्यक है।'
                },
                5: {
                    'type': 'paragraph_writing',
                    'title': 'पाठ सारांश',
                    'subtitle': 'गद्यांश का सारांश लिखें',
                    'topic': 'योग और स्वास्थ्य',
                    'instruction': 'कम से कम २० शब्दों में एक सारांश लिखें कि प्रतिदिन योग करने से शरीर स्वस्थ और मन शांत रहता है।'
                },
                6: {
                    'type': 'letter_drafting',
                    'title': 'शिकायती पत्र',
                    'subtitle': 'शिकायती पत्र ड्राफ्ट करें',
                    'topic': 'अपने क्षेत्र के नगर निगम अधिकारी को सड़कों पर गंदगी की शिकायत करते हुए पत्र लिखें।',
                    'instruction': 'सफाई अधिकारी का पता, विषय और क्षेत्र में नियमित सफाई न होने की समस्या का उल्लेख करें।',
                    'template': 'सेवा में,\nसफाई अधिकारी महोदय,\nनगर निगम\n\nविषय: क्षेत्र में गंदगी की शिकायत हेतु\n\nमहोदय,\nमैं आपका ध्यान हमारे मोहल्ले की सड़कों पर फैली गंदगी की ओर आकर्षित करना चाहता हूँ। यहाँ कूड़ा नियमित रूप से नहीं उठाया जा रहा है।\n\nभवदीय,\n[Name]'
                },
                7: {
                    'type': 'paragraph_writing',
                    'title': 'विवरण लेखन',
                    'subtitle': 'मेले का विवरण दें',
                    'topic': 'गाँव का मेला',
                    'instruction': 'कम से कम २५ शब्दों में किसी गाँव के मेले का आँखों देखा विवरण लिखें कि वहाँ कौन-कौन से झूले और दुकानें थीं।'
                },
                8: {
                    'type': 'paragraph_writing',
                    'title': 'स्वतंत्र परियोजना',
                    'subtitle': 'देश पर निबंध लिखें',
                    'topic': 'मेरा भारत महान',
                    'instruction': 'कम से कम ३० शब्दों में एक निबंध लिखें कि हमारे देश भारत की संस्कृति, नदियाँ और विविधता क्यों अद्भुत हैं।'
                }
            },
            'kn': {
                1: {
                    'type': 'letter_drafting',
                    'title': 'ರಜೆ ಕೋರಿ ಅರ್ಜಿ ಪತ್ರ',
                    'subtitle': 'ರಜೆ ಪತ್ರವನ್ನು ಬರೆಯಿರಿ',
                    'topic': 'ಅನಾರೋಗ್ಯದ ಕಾರಣದಿಂದ ಶಾಲೆಯ ಮುಖ್ಯೋಪಾಧ್ಯಾಯರಿಗೆ ಎರಡು ದಿನಗಳ ರಜೆಗಾಗಿ ಪತ್ರ ಬರೆಯಿರಿ।',
                    'instruction': 'ವಿಷಯ, ಕಾರಣ ಮತ್ತು ಕೊನೆಯಲ್ಲಿ ನಿಮ್ಮ ಹೆಸರನ್ನು ಒಳಗೊಂಡಂತೆ ಪತ್ರವನ್ನು ಬರೆಯಿರಿ.',
                    'template': 'ಗೆ,\nಮುಖ್ಯೋಪಾಧ್ಯಾಯರು,\nಸರ್ಕಾರಿ ಶಾಲೆ\n\nವಿಷಯ: ಎರಡು ದಿನಗಳ ರಜೆ ಕೋರಿ ಅರ್ಜಿ\n\nಗೌರವಾನ್ವಿತ ಗುರುಗಳೇ,\nನನಗೆ ಜ್ವರ ಬಂದಿರುವುದರಿಂದ ಶಾಲೆಗೆ ಬರಲು ಸಾಧ್ಯವಾಗುತ್ತಿಲ್ಲ. ದಯವಿಟ್ಟು ಎರಡು ದಿನ ರಜೆ ನೀಡಬೇಕಾಗಿ ವಿನಂತಿ.\n\nಇತಿ ತಮ್ಮ ನಂಬಿಕಸ್ಥ ವಿದ್ಯಾರ್ಥಿ,\n[Name]'
                },
                2: {
                    'type': 'paragraph_writing',
                    'title': 'ಸೃಜನಶೀಲ ಕಥೆಗಳು',
                    'subtitle': 'ಒಂದು ಕಥೆ ಬರೆಯಿರಿ',
                    'topic': 'ಬುದ್ಧಿವಂತ ಕಾಗೆ',
                    'instruction': 'ಕನಿಷ್ಠ 25 ಪದಗಳಲ್ಲಿ ಬಾಯಾರಿದ ಕಾಗೆಯು ಮಡಿಕೆಗೆ ಕಲ್ಲುಗಳನ್ನು ಹಾಕಿ ನೀರು ಕುಡಿದ ಕಥೆಯನ್ನು ಬರೆಯಿರಿ.'
                },
                3: {
                    'type': 'paragraph_writing',
                    'title': 'ವಿವರಣಾತ್ಮಕ ಪ್ರಬಂಧಗಳು',
                    'subtitle': 'ಹಬ್ಬದ ವಿವರಣೆ',
                    'topic': 'ಕನ್ನಡ ರಾಜ್ಯೋತ್ಸವ',
                    'instruction': 'ಕನಿಷ್ಠ 25 ಪದಗಳಲ್ಲಿ ನವೆಂಬರ್ ಒಂದರಂದು ಆಚರಿಸಲಾಗುವ ಕನ್ನಡ ರಾಜ್ಯೋತ್ಸವದ ವೈಭವ ಮತ್ತು ಹಳದಿ-ಕೆಂಪು ಧ್ವಜದ ಬಗ್ಗೆ ಬರೆಯಿರಿ.'
                },
                4: {
                    'type': 'paragraph_writing',
                    'title': 'ಅಭಿಪ್ರಾಯ ಮತ್ತು ಚರ್ಚೆ',
                    'subtitle': 'ನಿಮ್ಮ ಅಭಿಪ್ರಾಯ ಬರೆಯಿರಿ',
                    'topic': 'ಪರಿಸರ ಮಾಲಿನ್ಯ ತಡೆಗಟ್ಟುವುದು',
                    'instruction': 'ಕನಿಷ್ಠ 25 ಪದಗಳಲ್ಲಿ ನಾವು ಹೇಗೆ ಗಿಡಗಳನ್ನು ನೆಡುವ ಮೂಲಕ ಪರಿಸರ ಮಾಲಿನ್ಯವನ್ನು ತಡೆಯಬಹುದು ಎಂದು ಬರೆಯಿರಿ.'
                },
                5: {
                    'type': 'paragraph_writing',
                    'title': 'ಪಠ್ಯದ ಸಾರಾಂಶ',
                    'subtitle': 'ಸಾರಾಂಶ ಬರೆಯಿರಿ',
                    'topic': 'ಕಾಲದ ಮಹತ್ವ',
                    'instruction': 'ಕನಿಷ್ಠ 20 ಪದಗಳಲ್ಲಿ ಕಳೆದುಹೋದ ಸಮಯ ಮರಳಿ ಬರುವುದಿಲ್ಲ ಮತ್ತು ಸಮಯದ ಪಾಲನೆ ಏಕೆ ಮುಖ್ಯ ಎಂದು ಸಾರಾಂಶ ಬರೆಯಿರಿ.'
                },
                6: {
                    'type': 'letter_drafting',
                    'title': 'ಅರ್ಜಿ ಪತ್ರ',
                    'subtitle': 'ಪಂಚಾಯಿತಿಗೆ ಪತ್ರ ಬರೆಯಿರಿ',
                    'topic': 'ಗ್ರಾಮದಲ್ಲಿ ಶುದ್ಧ ಕುಡಿಯುವ ನೀರಿನ ವ್ಯವಸ್ಥೆ ಕೋರಿ ಪಂಚಾಯಿತಿ ಅಧ್ಯಕ್ಷರಿಗೆ ಪತ್ರ ಬರೆಯಿರಿ.',
                    'instruction': 'ವಿಷಯ ಮತ್ತು ಗ್ರಾಮಸ್ಥರ ಕುಡಿಯುವ ನೀರಿನ ಸಮಸ್ಯೆಯನ್ನು ಸ್ಪಷ್ಟವಾಗಿ ತಿಳಿಸಿ ಪತ್ರ ಬರೆಯಿರಿ.',
                    'template': 'ಗೆ,\nಗ್ರಾಮ ಪಂಚಾಯಿತಿ ಅಧ್ಯಕ್ಷರು\n\nವಿಷಯ: ಶುದ್ಧ ಕುಡಿಯುವ ನೀರಿನ ವ್ಯವಸ್ಥೆಗಾಗಿ ವಿನಂತಿ\n\nಮಾನ್ಯರೇ,\nನಮ್ಮ ಗ್ರಾಮದಲ್ಲಿ ಕುಡಿಯುವ ನೀರಿನ ತೊಂದರೆ ಇದ್ದು, ಶುದ್ಧ ನೀರಿನ ಘಟಕವನ್ನು ಸ್ಥಾಪಿಸಬೇಕಾಗಿ ವಿನಂತಿ ಮಾಡಿಕೊಳ್ಳುತ್ತೇವೆ.\n\nತಮ್ಮ ವಿಶ್ವಾಸಿ,\n[Name]'
                },
                7: {
                    'type': 'paragraph_writing',
                    'title': 'ವರದಿ ಬರವಣಿಗೆ',
                    'subtitle': 'ವರದಿ ಸಿದ್ಧಪಡಿಸಿ',
                    'topic': 'ಶಾಲಾ ವಾರ್ಷಿಕೋತ್ಸವ',
                    'instruction': 'ಕನಿಷ್ಠ 25 ಪದಗಳಲ್ಲಿ ನಿಮ್ಮ ಶಾಲೆಯಲ್ಲಿ ನಡೆದ ವಾರ್ಷಿಕ ಸಾಂಸ್ಕೃತಿಕ ಹಬ್ಬದ ವರದಿಯನ್ನು ಬರೆಯಿರಿ.'
                },
                8: {
                    'type': 'paragraph_writing',
                    'title': 'ಸ್ವತಂತ್ರ ಯೋಜನೆ',
                    'subtitle': 'ಪ್ರಬಂಧ ಬರೆಯಿರಿ',
                    'topic': 'ನನ್ನ ಕನಸಿನ ಕರ್ನಾಟಕ',
                    'instruction': 'ಕನಿಷ್ಠ 30 ಪದಗಳಲ್ಲಿ ಕರ್ನಾಟಕದ ಸಂಸ್ಕೃತಿ, ಭಾಷೆ ಮತ್ತು ಪ್ರಕೃತಿಯನ್ನು ಹೊಗಳುವ ಒಂದು ಸುಂದರ ಪ್ರಬಂಧ ಬರೆಯಿರಿ.'
                }
            },
            'ta': {
                1: {
                    'type': 'letter_drafting',
                    'title': 'விடுப்பு விண்ணப்பக் கடிதம்',
                    'subtitle': 'விடுப்பு கடிதத்தை எழுதவும்',
                    'topic': 'உடல்நலக்குறைவு காரணமாக பள்ளி தலைமை ஆசிரியருக்கு இரண்டு நாள் விடுப்பு வேண்டி கடிதம் எழுதவும்.',
                    'instruction': 'பொருள், காரணம் மற்றும் இறுதியில் உங்கள் பெயர் ஆகியவற்றை உள்ளடக்கி கடிதத்தை எழுதவும்.',
                    'template': 'அனுப்புநர்:\n[Name]\n\nபெறுநர்:\nதலைமை ஆசிரியர் அவர்கள்\n\nஐயா,\nஎனக்கு காய்ச்சலாக இருப்பதால் பள்ளிக்கு வர இயலவில்லை. தயவுசெய்து இரண்டு நாட்கள் விடுப்பு வழங்கும்படி கேட்டுக்கொள்கிறேன்.\n\nஇப்படிக்கு,\nதங்கள் கீழ்ப்படிதலுள்ள மாணவன்,\n[Name]'
                },
                2: {
                    'type': 'paragraph_writing',
                    'title': 'படைப்பாற்றல் கதைகள்',
                    'subtitle': 'ஒரு கதை எழுதவும்',
                    'topic': 'முயலும் ஆமையும்',
                    'instruction': 'குறைந்தது 25 சொற்களில் விடாமுயற்சியால் ஆமை எப்படி முயலை வென்றது என்ற கதையை எழுதவும்.'
                },
                3: {
                    'type': 'paragraph_writing',
                    'title': 'விளக்கக் கட்டுரைகள்',
                    'subtitle': 'விழாவைப் பற்றி எழுதவும்',
                    'topic': 'உழவர் திருநாளாம் பொங்கல்',
                    'instruction': 'குறைந்தது 25 சொற்களில் பொங்கல் திருவிழா எப்படி கொண்டாடப்படுகிறது மற்றும் மாட்டு பொங்கலின் சிறப்பு பற்றி எழுதவும்.'
                },
                4: {
                    'type': 'paragraph_writing',
                    'title': 'கருத்துக்கள் மற்றும் வாதங்கள்',
                    'subtitle': 'உங்கள் கருத்துக்களை எழுதவும்',
                    'topic': 'மரம் வளர்ப்போம் மழை பெறுவோம்',
                    'instruction': 'குறைந்தது 25 சொற்களில் மரங்கள் எவ்வாறு மழையைத் தருகின்றன மற்றும் காடுகளை ஏன் பாதுகாக்க வேண்டும் என்று எழுதவும்.'
                },
                5: {
                    'type': 'paragraph_writing',
                    'title': 'உரைச் சுருக்கம்',
                    'subtitle': 'சுருக்கம் எழுதவும்',
                    'topic': 'நூலகத்தின் பயன்கள்',
                    'instruction': 'குறைந்தது 20 சொற்களில் நூல்கள் எவ்வாறு நமக்கு அறிவைத் தருகின்றன மற்றும் வாரந்தோறும் நூலகம் செல்வதன் முக்கியத்துவத்தை எழுதவும்.'
                },
                6: {
                    'type': 'letter_drafting',
                    'title': 'விண்ணப்பக் கடிதம்',
                    'subtitle': 'புகார் கடிதம் எழுதவும்',
                    'topic': 'உங்கள் பகுதியில் தெருவிளக்குகள் எரியாதது குறித்து மின்சார வாரியத்திற்கு கடிதம் எழுதவும்.',
                    'instruction': 'அதிகாரியின் முகவரி, பொருள் மற்றும் தெருவில் உள்ள இருள் சூழ்ந்த பிரச்சனையைக் குறிப்பிட்டு எழுதவும்.',
                    'template': 'பெறுநர்:\nமின்சார வாரிய அதிகாரி அவர்கள்\n\nபொருள்: தெருவிளக்கு வசதி செய்யக் கோருதல்\n\nமதிப்பிற்குரிய ஐயா,\nஎங்கள் பகுதியில் கடந்த சில நாட்களாக தெருவிளக்குகள் எரியவில்லை. மக்கள் நடமாட அச்சமாக உள்ளது. உடனே சரிசெய்ய வேண்டுகிறேன்.\n\nநன்றி,\n[Name]'
                },
                7: {
                    'type': 'paragraph_writing',
                    'title': 'அறிக்கை எழுதுதல்',
                    'subtitle': 'அறிக்கை எழுதவும்',
                    'topic': 'சுதந்திர தின விழா கொண்டாட்டம்',
                    'instruction': 'குறைந்தது 25 சொற்களில் உங்கள் பள்ளியில் நடந்த தேசியக் கொடியேற்றுதல் மற்றும் கலை நிகழ்ச்சிகள் பற்றிய அறிக்கையை எழுதவும்.'
                },
                8: {
                    'type': 'paragraph_writing',
                    'title': 'சுயாதீன திட்டம்',
                    'subtitle': 'கட்டுரை எழுதவும்',
                    'topic': 'எனது எதிர்கால லட்சியம்',
                    'instruction': 'குறைந்தது 30 சொற்களில் நீங்கள் எதிர்காலத்தில் என்னவாக விரும்புகிறீர்கள் மற்றும் அதற்காக எப்படி உழைப்பீர்கள் என எழுதவும்.'
                }
            }
        }

        # Topics mapping for titles and descriptions
        level_topics = {
            'beginner': [
                {'title': 'Writing the Alphabet', 'desc': 'Learn to write capital letters'},
                {'title': 'Writing Small Letters', 'desc': 'Learn to write lowercase letters'},
                {'title': 'Writing Numbers', 'desc': 'Learn to write numbers 1 to 10'},
                {'title': 'Simple Words', 'desc': 'Write easy short words'},
                {'title': 'Naming Words', 'desc': 'Write names of common objects'},
                {'title': 'Action Words', 'desc': 'Write verbs and action descriptions'},
                {'title': 'Small Sentences', 'desc': 'Write short sentences correctly'},
                {'title': 'Fun with Practice', 'desc': 'Test your beginner writing skills'}
            ],
            'intermediate': [
                {'title': 'Word Building', 'desc': 'Unscramble the letters to make words'},
                {'title': 'Sentence Building', 'desc': 'Create meaningful sentences'},
                {'title': 'Paragraph Writing', 'desc': 'Write short descriptive paragraphs'},
                {'title': 'Punctuation', 'desc': 'Use punctuation marks correctly'},
                {'title': 'Capitalization', 'desc': 'Use correct grammar and spelling rules'},
                {'title': 'Creative Writing', 'desc': 'Write your own imaginative ideas'},
                {'title': 'Letter Writing', 'desc': 'Write friendly letters and invites'},
                {'title': 'Practice Test', 'desc': 'Test your intermediate writing skills'}
            ],
            'advanced': [
                {'title': 'Formal Correspondence', 'desc': 'Draft official letters and emails'},
                {'title': 'Creative Narratives', 'desc': 'Compose short moral stories'},
                {'title': 'Descriptive Essays', 'desc': 'Describe beautiful scenes or journeys'},
                {'title': 'Opinion & Arguments', 'desc': 'Express structured views on social themes'},
                {'title': 'Text Summarization', 'desc': 'Summarize a given reading passage'},
                {'title': 'Business Letters', 'desc': 'Write letters of complaint or request'},
                {'title': 'Report Writing', 'desc': 'Document incidents and environmental reports'},
                {'title': 'Independent Project', 'desc': 'Write a comprehensive career/national essay'}
            ]
        }

        for lang in languages:
            # Seed 3 levels
            for lvl in ['beginner', 'intermediate', 'advanced']:
                topics_list = level_topics[lvl]
                for idx in range(1, 9):
                    lesson_id = f"WR-{lvl[:3].upper()}-{lang.upper()}-{idx:03d}"
                    prereq = f"WR-{lvl[:3].upper()}-{lang.upper()}-{idx-1:03d}" if idx > 1 else None

                    topic_info = topics_list[idx - 1]
                    title_str = topic_info['title']
                    desc_str = topic_info['desc']

                    # Base welcome slide
                    welcome_slide = {
                        'type': 'welcome',
                        'title': title_str,
                        'subtitle': desc_str,
                        'objectives': [
                            f"Master {title_str.lower()}",
                            "Build spelling and structure accuracy",
                            "Unlock creative writing potential"
                        ]
                    }

                    activities = [welcome_slide]

                    if lvl == 'beginner':
                        data = beginner_data[lang][idx]
                        trace_slide = {
                            'type': 'trace_letter',
                            'title': title_str,
                            'subtitle': data['trace_sub'],
                            'target': data['trace'],
                            'image': 'pencil',
                            'arrows': ['Follow the tracing lines carefully.']
                        }
                        missing_slide = {
                            'type': 'practice_missing',
                            'questionNumber': 2,
                            'questionText': 'Write the missing letter.',
                            'equation': data['missing_eq'],
                            'target': data['missing_target'],
                            'options': data['missing_opts']
                        }
                        word_slide = {
                            'type': 'write_word',
                            'title': 'Write the word',
                            'target': data['word'],
                            'image': data['word_image'],
                            'instruction': f"Trace the word '{data['word']}'."
                        }
                        sentence_slide = {
                            'type': 'write_sentence',
                            'title': 'Write the sentence',
                            'target': data['sentence'],
                            'instruction': 'Read the sentence. Then arrange the jumbled words correctly.'
                        }
                        activities.extend([trace_slide, missing_slide, word_slide, sentence_slide])

                    elif lvl == 'intermediate':
                        data = intermediate_data[lang][idx]
                        if idx == 1:
                            activities.append({
                                'type': 'unscramble_words',
                                'title': data['unscramble_title'],
                                'subtitle': data['unscramble_subtitle'],
                                'instruction': data['unscramble_instruction'],
                                'items': data['items']
                            })
                        elif idx == 2:
                            activities.append({
                                'type': 'unscramble_sentence',
                                'title': data['title'],
                                'subtitle': data['subtitle'],
                                'instruction': data['instruction'],
                                'tokens': data['tokens'],
                                'target': data['target']
                            })
                        elif idx == 3 or idx == 6 or idx == 7:
                            activities.append({
                                'type': 'paragraph_writing',
                                'title': data['title'],
                                'subtitle': data['subtitle'],
                                'topic': data['topic'],
                                'instruction': data['instruction']
                            })
                        elif idx == 4 or idx == 5:
                            for item in data:
                                activities.append({
                                    'type': 'practice_missing',
                                    'questionNumber': item['questionNumber'],
                                    'questionText': item['questionText'],
                                    'equation': item['equation'],
                                    'target': item['target'],
                                    'options': item['options']
                                })
                        elif idx == 8:
                            activities.extend(data)

                    else: # advanced
                        data = advanced_data[lang][idx]
                        if data['type'] == 'letter_drafting':
                            activities.append({
                                'type': 'letter_drafting',
                                'title': data['title'],
                                'subtitle': data['subtitle'],
                                'topic': data['topic'],
                                'instruction': data['instruction'],
                                'template': data['template']
                            })
                        else:
                            activities.append({
                                'type': 'paragraph_writing',
                                'title': data['title'],
                                'subtitle': data['subtitle'],
                                'topic': data['topic'],
                                'instruction': data['instruction']
                            })

                    # Add graduation slide
                    grad_slide = {
                        'type': 'graduation',
                        'title': 'Great job!',
                        'subtitle': 'You finished the writing lesson!',
                        'xp': 20,
                        'time': '12 min'
                    }
                    activities.append(grad_slide)

                    Lesson.objects.update_or_create(
                        lesson_id=lesson_id,
                        defaults={
                            'title': title_str,
                            'module': f"{lvl.capitalize()} Writing",
                            'difficulty': lvl,
                            'skill': 'writing',
                            'language': lang,
                            'estimated_time': 12,
                            'order_in_level': idx,
                            'prerequisite_id': prereq,
                            'concept_intro': desc_str,
                            'real_life_context': 'Writing Skills Improvement',
                            'image_visual': '✏️',
                            'activities': activities,
                            'reward_xp': 20,
                            'reward_stars': 3,
                            'reward_coins': 5,
                            'badge_code': f"badge_wr_{lvl[:3]}_{lang}_{idx}"
                        }
                    )
                    seeded_count += 1

        self.stdout.write(self.style.SUCCESS(f"Successfully seeded {seeded_count} writing lessons!"))
