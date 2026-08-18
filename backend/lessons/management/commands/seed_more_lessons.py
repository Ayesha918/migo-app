# backend/lessons/management/commands/seed_more_lessons.py
from django.core.management.base import BaseCommand
from lessons.models import Lesson

class Command(BaseCommand):
    help = "Seeds more high-quality Reading and Writing lessons for all supported languages and levels"

    def handle(self, *args, **options):
        self.stdout.write("Seeding additional reading and writing lessons...")
        
        # We will update_or_create lessons for 'en', 'hi', 'kn', 'ta' across 'beginner', 'intermediate', 'advanced'
        languages = ['en', 'hi', 'kn', 'ta']
        seeded_count = 0

        # Define pre-translated content structures for all languages
        LESSON_SPECS = {
            'en': {
                # --- READING LESSONS ---
                'RD-BEG-EN-001': {
                    'title': 'Sight Words & Basic Nouns',
                    'module': 'Reading Basics',
                    'difficulty': 'beginner',
                    'skill': 'word_recognition',
                    'concept_intro': 'Identify common everyday sight words and learn their sounds.',
                    'real_life_context': 'Recognizing basic words on signs and packages.',
                    'image_visual': '📖',
                    'activities': [
                        {'type': 'welcome', 'title': 'Sight Words & Basic Nouns', 'subtitle': 'Learn common everyday words', 'objectives': ['Identify sight words', 'Practice sounds', 'Understand meanings']},
                        {'type': 'definition', 'title': 'Sight Word: Tree', 'subtitle': 'A large plant with leaves', 'left': 'Tree', 'right': 'A green plant', 'result': 'Tree', 'left_emoji': '🌳', 'right_emoji': '🌱', 'result_emoji': '🌳'},
                        {'type': 'examples', 'title': 'Common Sight Words', 'examples': [
                            {'left': 'Home', 'right': 'House', 'result': 'Home', 'left_emoji': '🏠', 'right_emoji': '🏡', 'result_emoji': '🏠'},
                            {'left': 'Water', 'right': 'Drink', 'result': 'Water', 'left_emoji': '💧', 'right_emoji': '🥤', 'result_emoji': '💧'}
                        ]},
                        {'type': 'listen', 'title': 'Listen and Read', 'target': 'This is a beautiful green tree.', 'hint': 'Listen closely!'},
                        {'type': 'practice_audio', 'questionNumber': 1, 'questionText': 'Tap the word you hear: Tree', 'target': 'Tree', 'options': ['Tree', 'House', 'Water']},
                        {'type': 'graduation', 'title': 'Great Job!', 'subtitle': 'You finished the sight words lesson!', 'xp': 15, 'time': '10 min'}
                    ],
                    'quiz_bank': [
                        {'question': 'Which word matches the emoji 🏠?', 'options': ['Home', 'Tree', 'Water'], 'correct_index': 0, 'explanation': 'Home matches the house emoji.'}
                    ],
                    'improvement_tip': 'Practice pointing to objects in your house and saying their English names.'
                },
                'RD-BEG-EN-002': {
                    'title': 'Simple Sentences',
                    'module': 'Reading Basics',
                    'difficulty': 'beginner',
                    'skill': 'reading_fluency',
                    'concept_intro': 'Read simple short sentences with three or four words.',
                    'real_life_context': 'Reading short greetings and labels.',
                    'image_visual': '📖',
                    'activities': [
                        {'type': 'welcome', 'title': 'Simple Sentences', 'subtitle': 'Let\'s read short sentences together', 'objectives': ['Read short sentences', 'Learn word flow']},
                        {'type': 'definition', 'title': 'Simple Sentence', 'subtitle': 'The cat sits on the mat.', 'left': 'Cat', 'right': 'Sits', 'result': 'Cat sits', 'left_emoji': '🐱', 'right_emoji': '🧘', 'result_emoji': '🐱'},
                        {'type': 'listen', 'title': 'Listen and repeat', 'target': 'The dog runs fast.', 'hint': 'Say it aloud!'},
                        {'type': 'practice_missing', 'questionNumber': 1, 'questionText': 'Fill in the missing word: The ___ runs.', 'equation': 'The _ runs.', 'target': 'dog', 'options': ['dog', 'tree', 'water']},
                        {'type': 'graduation', 'title': 'Excellent!', 'subtitle': 'Sentence reading completed.', 'xp': 15, 'time': '10 min'}
                    ],
                    'quiz_bank': [
                        {'question': 'Complete the sentence: The sun is ___.', 'options': ['hot', 'run', 'mat'], 'correct_index': 0, 'explanation': 'The sun is hot is correct.'}
                    ],
                    'improvement_tip': 'Try reading words from left to right slowly, blending sounds.'
                },
                'RD-INT-EN-001': {
                    'title': 'Story: The Clever Crow',
                    'module': 'Reading Fluency',
                    'difficulty': 'intermediate',
                    'skill': 'reading_fluency',
                    'concept_intro': 'Read a short fable and answer comprehension questions about details.',
                    'real_life_context': 'Understanding the central message of narratives.',
                    'image_visual': '🦅',
                    'activities': [
                        {'type': 'welcome', 'title': 'Story: The Clever Crow', 'subtitle': 'Read a moral fable', 'objectives': ['Understand story details', 'Identify the moral']},
                        {
                            'type': 'storyboard_story',
                            'title': 'The Clever Crow',
                            'subtitle': 'Read the story and answer questions',
                            'story_title': 'The Thirsty Crow',
                            'story_body': 'A thirsty crow searched for water. He found a pitcher, but the water was too low. The clever crow dropped small pebbles into the pitcher. The water rose to the top, and he drank. Moral: Where there is a will, there is a way.',
                            'tabs': {
                                'Comprehension': {
                                    'question': 'What was the crow looking for?',
                                    'options': ['Food', 'Water', 'Pebbles', 'A nest'],
                                    'correct_index': 1
                                },
                                'Problem Solving': {
                                    'question': 'What did the crow drop inside the pitcher?',
                                    'options': ['Leaves', 'Pebbles', 'Coins', 'Water'],
                                    'correct_index': 1
                                },
                                'Moral Lesson': {
                                    'question': 'What is the moral of the story?',
                                    'options': ['Never drink water', 'Pebbles are good', 'Where there is a will, there is a way', 'Crows are birds'],
                                    'correct_index': 2
                                }
                            }
                        },
                        {'type': 'graduation', 'title': 'Spectacular!', 'subtitle': 'Story comprehension passed.', 'xp': 20, 'time': '15 min'}
                    ],
                    'quiz_bank': [
                        {'question': 'Why did the water rise?', 'options': ['Because it rained', 'Because the crow added pebbles', 'Because the pitcher broke'], 'correct_index': 1, 'explanation': 'Dropping pebbles displaced the water, causing it to rise.'}
                    ],
                    'improvement_tip': 'Retell this story to a friend in your own words to check understanding.'
                },
                'RD-INT-EN-002': {
                    'title': 'Everyday Signs & Notices',
                    'module': 'Reading Fluency',
                    'difficulty': 'intermediate',
                    'skill': 'comprehension',
                    'concept_intro': 'Learn to read and understand warnings, signs, and public announcements.',
                    'real_life_context': 'Navigating public spaces like bus stands and banks.',
                    'image_visual': '🛑',
                    'activities': [
                        {'type': 'welcome', 'title': 'Everyday Signs & Notices', 'subtitle': 'Read signs in public places', 'objectives': ['Identify safety signs', 'Understand notices']},
                        {
                            'type': 'storyboard_story',
                            'title': 'Public Notice Boards',
                            'subtitle': 'Understand warnings and instructions',
                            'story_title': 'Hospital Notice Board',
                            'story_body': 'Please keep silence. Turn off mobile phones inside the ICU ward. Visitors are allowed only between 4 PM and 6 PM. Always wash hands before entering.',
                            'tabs': {
                                'Rules': {
                                    'question': 'What should you do with your mobile phone?',
                                    'options': ['Keep it on ring', 'Turn it off', 'Use it for calls', 'Take pictures'],
                                    'correct_index': 1
                                },
                                'Visiting Hours': {
                                    'question': 'When can visitors enter the ICU ward?',
                                    'options': ['Anytime', 'Between 4 PM and 6 PM', 'In the morning only', 'Never'],
                                    'correct_index': 1
                                }
                            }
                        },
                        {'type': 'graduation', 'title': 'Great Job!', 'subtitle': 'Notice reading finished.', 'xp': 20, 'time': '12 min'}
                    ],
                    'quiz_bank': [
                        {'question': 'What is required before entering the ICU ward?', 'options': ['Wash hands', 'Pay a fee', 'Bring flowers'], 'correct_index': 0, 'explanation': 'Washing hands is required for sanitation.'}
                    ],
                    'improvement_tip': 'Look out for announcements and safety boards in your local community.'
                },
                'RD-ADV-EN-001': {
                    'title': 'Descriptive Text: The Lost Compass',
                    'module': 'Advanced Comprehension',
                    'difficulty': 'advanced',
                    'skill': 'comprehension',
                    'concept_intro': 'Analyze descriptions, character choices, and vocabulary context in advanced passages.',
                    'real_life_context': 'Understanding long stories and complex books.',
                    'image_visual': '🧭',
                    'activities': [
                        {'type': 'welcome', 'title': 'Advanced Descriptive Reading', 'subtitle': 'Analyze detailed passages', 'objectives': ['Determine vocabulary in context', 'Identify plot themes']},
                        {
                            'type': 'storyboard_story',
                            'title': 'The Lost Compass',
                            'subtitle': 'Read carefully and analyze the passage details',
                            'story_title': 'The Journey to the Peak',
                            'story_body': 'Alan navigated the dense, mist-shrouded jungle. His primary guide was a brass pocket compass, a cherished heirloom from his grandfather. When a sudden gust swept it into a deep ravine, fear gripped him. Yet, remembering the celestial tracking lessons from his youth, he looked at the sun\'s position and marched forward with conviction.',
                            'tabs': {
                                'Plot Detail': {
                                    'question': 'What happened to Alan\'s compass?',
                                    'options': ['He sold it', 'It fell into a deep ravine', 'He forgot it', 'It was stolen'],
                                    'correct_index': 1
                                },
                                'Inference': {
                                    'question': 'How did Alan find his way after losing the compass?',
                                    'options': ['He waited for help', 'He used celestial tracking (sun)', 'He followed a map', 'He went back home'],
                                    'correct_index': 1
                                },
                                'Vocabulary': {
                                    'question': 'What does "heirloom" mean in this context?',
                                    'options': ['A brand new toy', 'A valuable family object passed down', 'A compass map', 'A secret path'],
                                    'correct_index': 1
                                }
                            }
                        },
                        {'type': 'graduation', 'title': 'Incredible Achievement!', 'subtitle': 'Advanced comprehension passed!', 'xp': 25, 'time': '20 min'}
                    ],
                    'quiz_bank': [
                        {'question': 'What emotion did Alan feel initially when the compass was lost?', 'options': ['Excitement', 'Fear', 'Anger', 'Happiness'], 'correct_index': 1, 'explanation': 'The text states "fear gripped him" initially.'}
                    ],
                    'improvement_tip': 'When encountering unfamiliar words, look at surrounding sentences for context clues.'
                },
                'RD-ADV-EN-002': {
                    'title': 'Scientific Article: Why Rain Falls',
                    'module': 'Advanced Comprehension',
                    'difficulty': 'advanced',
                    'skill': 'vocabulary',
                    'concept_intro': 'Read informational reports and identify main scientific concepts.',
                    'real_life_context': 'Reading news articles and educational science booklets.',
                    'image_visual': '🌧️',
                    'activities': [
                        {'type': 'welcome', 'title': 'Scientific Article: Why Rain Falls', 'subtitle': 'Learn about the water cycle', 'objectives': ['Understand scientific summaries', 'Identify cause and effect']},
                        {
                            'type': 'storyboard_story',
                            'title': 'The Water Cycle',
                            'subtitle': 'Read the report on precipitation',
                            'story_title': 'How Clouds Form Rain',
                            'story_body': 'Solar heat evaporates water from oceans, turning liquid into vapor. As vapor rises into the cooler atmosphere, it condenses to form clouds. When cloud droplets accumulate and become too dense, gravity pulls them down as precipitation (rain). This continuous loop supports earth\'s ecology.',
                            'tabs': {
                                'Cause of Evaporation': {
                                    'question': 'What causes ocean water to turn into vapor?',
                                    'options': ['Solar heat', 'Strong winds', 'Fish movement', 'Precipitation'],
                                    'correct_index': 0
                                },
                                'Cloud Formation': {
                                    'question': 'What is the process where vapor turns back into liquid cloud droplets?',
                                    'options': ['Evaporation', 'Condensation', 'Gravity', 'Ecology'],
                                    'correct_index': 1
                                }
                            }
                        },
                        {'type': 'graduation', 'title': 'Perfect!', 'subtitle': 'Scientific reading completed.', 'xp': 25, 'time': '18 min'}
                    ],
                    'quiz_bank': [
                        {'question': 'What does "precipitation" refer to in this article?', 'options': ['Ocean currents', 'Rain falling due to gravity', 'Cloud formation'], 'correct_index': 1, 'explanation': 'Precipitation is liquid water falling as rain.'}
                    ],
                    'improvement_tip': 'Draw the water cycle on paper and label evaporation and condensation.'
                },

                # --- WRITING LESSONS ---
                'WR-BEG-EN-002': {
                    'title': 'Writing Short Words',
                    'module': 'Writing Skills',
                    'difficulty': 'beginner',
                    'skill': 'writing',
                    'concept_intro': 'Practice tracing and writing common three-letter nouns.',
                    'real_life_context': 'Writing short names and shopping lists.',
                    'image_visual': '✏️',
                    'activities': [
                        {'type': 'welcome', 'title': 'Writing Short Words', 'subtitle': 'Trace letters to build words', 'objectives': ['Trace letters', 'Form complete words']},
                        {'type': 'trace_letter', 'title': 'Trace Letter M', 'subtitle': 'Start tracing the letter M', 'target': 'M', 'image': 'pencil', 'arrows': ['Start at bottom, go straight up, slanting down, slanting up, go straight down.']},
                        {'type': 'practice_missing', 'questionNumber': 2, 'questionText': 'Write the missing letter: M A ___', 'equation': 'MA_', 'target': 'N', 'options': ['N', 'Z', 'X']},
                        {'type': 'write_word', 'title': 'Write the word', 'target': 'MAN', 'image': 'man', 'instruction': 'Trace the word MAN to practice writing names.'},
                        {'type': 'write_sentence', 'title': 'Write the sentence', 'target': 'A good man.', 'instruction': 'Copy the short sentence cleanly.'},
                        {'type': 'graduation', 'title': 'Awesome!', 'subtitle': 'Three-letter writing complete.', 'xp': 15, 'time': '10 min'}
                    ],
                    'quiz_bank': [
                        {'question': 'Which letter is missing in the word: C _ T?', 'options': ['A', 'P', 'R'], 'correct_index': 0, 'explanation': 'C-A-T spells Cat.'}
                    ],
                    'improvement_tip': 'Say each letter sound aloud while writing to build letter-sound links.'
                },
                'WR-INT-EN-003': {
                    'title': 'Grammar: Verb Tense & Spelling',
                    'module': 'Writing Skills',
                    'difficulty': 'intermediate',
                    'skill': 'writing',
                    'concept_intro': 'Learn rules of present and past verb tenses and correct spelling.',
                    'real_life_context': 'Writing text messages and filling out forms correctly.',
                    'image_visual': '✍️',
                    'activities': [
                        {'type': 'welcome', 'title': 'Verb Tense & Spelling', 'subtitle': 'Learn past and present tense conjugations', 'objectives': ['Use correct past tense', 'Spell verbs correctly']},
                        {'type': 'unscramble_words', 'title': 'Spelling Unscramble', 'subtitle': 'Rearrange letters to spell past verbs', 'instruction': 'Unscramble the tokens.', 'items': [
                            {'id': 1, 'clue': 'Past of play', 'image': 'pencil', 'tokens': ['y', 'd', 'e', 'l', 'a', 'p'], 'target': 'played'},
                            {'id': 2, 'clue': 'Past of watch', 'image': 'pencil', 'tokens': ['h', 'e', 'c', 't', 'w', 'a', 'd'], 'target': 'watched'}
                        ]},
                        {'type': 'unscramble_sentence', 'title': 'Sentence Formation', 'subtitle': 'Order the sentence correctly', 'instruction': 'Tap the tokens.', 'tokens': ['yesterday', 'he', 'played', 'cricket'], 'target': 'He played cricket yesterday.'},
                        {'type': 'paragraph_writing', 'title': 'Paragraph Writing', 'subtitle': 'Describe your weekend', 'topic': 'My Sunday Activities', 'instruction': 'Write at least 15 words explaining what you did last Sunday.'},
                        {'type': 'graduation', 'title': 'Superb!', 'subtitle': 'Spelling and grammar writing passed.', 'xp': 15, 'time': '12 min'}
                    ],
                    'quiz_bank': [
                        {'question': 'What is the past tense of "walk"?', 'options': ['walking', 'walked', 'walks'], 'correct_index': 1, 'explanation': '"Walked" is the standard past tense.'}
                    ],
                    'improvement_tip': 'Add "ed" at the end of regular verbs to represent actions completed yesterday.'
                },
                'WR-ADV-EN-001': {
                    'title': 'Advanced: Email Writing & Structure',
                    'module': 'Advanced Composition',
                    'difficulty': 'advanced',
                    'skill': 'writing',
                    'concept_intro': 'Construct formal emails with proper greetings, content blocks, and signatures.',
                    'real_life_context': 'Writing emails to teachers, managers, or companies.',
                    'image_visual': '✉️',
                    'activities': [
                        {'type': 'welcome', 'title': 'Advanced Email Composition', 'subtitle': 'Write formal emails', 'objectives': ['Structure an email', 'Select formal vocabulary']},
                        {'type': 'letter_drafting', 'title': 'Formal Request Email', 'topic': 'Requesting sick leave from your office or school supervisor.', 'instruction': 'Include a subject line, formal greeting, reason for leave, and closing signature.', 'subtitle': 'Draft leave email'},
                        {'type': 'paragraph_writing', 'title': 'Opinion Composition', 'subtitle': 'Write an explanation', 'topic': 'Why Clear Writing Matters', 'instruction': 'Write a paragraph of at least 25 words explaining why communication is important.'},
                        {'type': 'graduation', 'title': 'Graduate Master!', 'subtitle': 'Email structure writing passed.', 'xp': 25, 'time': '20 min'}
                    ],
                    'quiz_bank': [
                        {'question': 'Which is a formal email greeting?', 'options': ['Hey check this', 'Dear Manager,', 'Hi dude,'], 'correct_index': 1, 'explanation': '"Dear Manager," is appropriate for formal communication.'}
                    ],
                    'improvement_tip': 'Always proofread formal correspondence to fix typos and grammar slips.'
                }
            },

            'hi': {
                # --- READING LESSONS ---
                'RD-BEG-HI-001': {
                    'title': 'सरल शब्द और संज्ञा शब्द',
                    'module': 'पठन बुनियादी',
                    'difficulty': 'beginner',
                    'skill': 'word_recognition',
                    'concept_intro': 'रोजमर्रा के सामान्य शब्दों को पहचानें और उनकी ध्वनियों को समझें।',
                    'real_life_context': 'संकेतों और बोर्ड पर लिखे सरल शब्दों को पहचानना।',
                    'image_visual': '📖',
                    'activities': [
                        {'type': 'welcome', 'title': 'सरल शब्द और संज्ञा शब्द', 'subtitle': 'रोजमर्रा के सामान्य शब्द सीखें', 'objectives': ['शब्दों को पहचानें', 'ध्वनि का अभ्यास करें']},
                        {'type': 'definition', 'title': 'सरल शब्द: घर', 'subtitle': 'रहने का स्थान', 'left': 'घर', 'right': 'भवन', 'result': 'घर', 'left_emoji': '🏠', 'right_emoji': '🏢', 'result_emoji': '🏠'},
                        {'type': 'examples', 'title': 'सामान्य दैनिक शब्द', 'examples': [
                            {'left': 'जल', 'right': 'पीना', 'result': 'जल', 'left_emoji': '💧', 'right_emoji': '🥤', 'result_emoji': '💧'},
                            {'left': 'फल', 'right': 'खाना', 'result': 'फल', 'left_emoji': '🍎', 'right_emoji': '🍌', 'result_emoji': '🍎'}
                        ]},
                        {'type': 'listen', 'title': 'सुनें और पढ़ें', 'target': 'यह मेरा सुंदर घर है।', 'hint': 'ध्यान से सुनें!'},
                        {'type': 'practice_audio', 'questionNumber': 1, 'questionText': 'वह शब्द चुनें जिसे आप सुनते हैं: घर', 'target': 'घर', 'options': ['घर', 'जल', 'फल']},
                        {'type': 'graduation', 'title': 'बहुत बढ़िया!', 'subtitle': 'आपने सरल शब्दों का पाठ पूरा किया!', 'xp': 15, 'time': '10 min'}
                    ],
                    'quiz_bank': [
                        {'question': 'इमोजी 🍎 किस शब्द से मेल खाता है?', 'options': ['घर', 'फल', 'जल'], 'correct_index': 1, 'explanation': 'फल सेब या केले जैसी खाने की चीजों को दर्शाता है।'}
                    ],
                    'improvement_tip': 'घर की वस्तुओं को देखें और उनके हिंदी नाम बोलें।'
                },
                'RD-BEG-HI-002': {
                    'title': 'छोटे और सरल वाक्य',
                    'module': 'पठन बुनियादी',
                    'difficulty': 'beginner',
                    'skill': 'reading_fluency',
                    'concept_intro': 'तीन या चार शब्दों वाले छोटे वाक्यों को पढ़ना सीखें।',
                    'real_life_context': 'छोटे निर्देश और बोर्ड पढ़ना।',
                    'image_visual': '📖',
                    'activities': [
                        {'type': 'welcome', 'title': 'छोटे और सरल वाक्य', 'subtitle': 'आइए मिलकर छोटे वाक्य पढ़ें', 'objectives': ['छोटे वाक्य पढ़ें', 'शब्द प्रवाह समझें']},
                        {'type': 'definition', 'title': 'सरल वाक्य', 'subtitle': 'बिल्ली चटाई पर बैठी है।', 'left': 'बिल्ली', 'right': 'बैठी', 'result': 'बिल्ली बैठी', 'left_emoji': '🐱', 'right_emoji': '🧘', 'result_emoji': '🐱'},
                        {'type': 'listen', 'title': 'सुनें और दोहराएं', 'target': 'कुत्ता तेज़ भागता है।', 'hint': 'ज़ोर से बोलें!'},
                        {'type': 'practice_missing', 'questionNumber': 1, 'questionText': 'खाली स्थान भरें: कुत्ता तेज़ ___ है।', 'equation': 'कुत्ता तेज़ _ है।', 'target': 'भागता', 'options': ['भागता', 'घर', 'जल']},
                        {'type': 'graduation', 'title': 'अति उत्तम!', 'subtitle': 'वाक्य पठन समाप्त हुआ।', 'xp': 15, 'time': '10 min'}
                    ],
                    'quiz_bank': [
                        {'question': 'वाक्य पूरा करें: सूर्य बहुत ___ है।', 'options': ['गर्म', 'भागता', 'चटाई'], 'correct_index': 0, 'explanation': 'सूर्य गर्म होता है।'}
                    ],
                    'improvement_tip': 'बाएँ से दाएँ उंगली रखकर धीरे-धीरे शब्दों को मिलाकर पढ़ें।'
                },
                'RD-INT-HI-001': {
                    'title': 'कहानी: चतुर कौआ',
                    'module': 'पठन प्रवाह',
                    'difficulty': 'intermediate',
                    'skill': 'reading_fluency',
                    'concept_intro': 'एक छोटी नीति कथा पढ़ें और विवरणों के बारे में समझ के प्रश्नों के उत्तर दें।',
                    'real_life_context': 'कहानियों के मुख्य संदेश को समझना।',
                    'image_visual': '🦅',
                    'activities': [
                        {'type': 'welcome', 'title': 'कहानी: चतुर कौआ', 'subtitle': 'नीति कथा पढ़ें', 'objectives': ['कहानी के विवरण समझें', 'नैतिक शिक्षा जानें']},
                        {
                            'type': 'storyboard_story',
                            'title': 'चतुर कौआ',
                            'subtitle': 'कहानी पढ़ें और प्रश्नों के उत्तर दें',
                            'story_title': 'प्यासा कौआ',
                            'story_body': 'एक प्यासा कौआ पानी की तलाश में था। उसे एक घड़ा मिला, लेकिन उसमें पानी बहुत नीचे था। चतुर कौए ने घड़े में छोटे-छोटे कंकड़ डाले। पानी ऊपर आ गया और उसने पानी पी लिया। सीख: जहाँ चाह, वहाँ राह।',
                            'tabs': {
                                'समझ': {
                                    'question': 'कौआ क्या ढूँढ रहा था?',
                                    'options': ['भोजन', 'पानी', 'कंकड़', 'घोंसला'],
                                    'correct_index': 1
                                },
                                'समाधान': {
                                    'question': 'कौए ने घड़े में क्या डाला?',
                                    'options': ['पत्ते', 'कंकड़', 'सिक्के', 'फल'],
                                    'correct_index': 1
                                },
                                'सीख': {
                                    'question': 'इस कहानी से क्या सीख मिलती है?',
                                    'options': ['पानी कभी मत पियो', 'कंकड़ अच्छे हैं', 'जहाँ चाह, वहाँ राह', 'कौआ उड़ता है'],
                                    'correct_index': 2
                                }
                            }
                        },
                        {'type': 'graduation', 'title': 'अद्भुत!', 'subtitle': 'कहानी बोध का चरण पूरा हुआ।', 'xp': 20, 'time': '15 min'}
                    ],
                    'quiz_bank': [
                        {'question': 'पानी ऊपर क्यों आया?', 'options': ['क्योंकि बारिश हुई', 'क्योंकि कौए ने कंकड़ डाले', 'क्योंकि घड़ा टूट गया'], 'correct_index': 1, 'explanation': 'कंकड़ डालने से पानी का स्तर ऊपर उठ गया।'}
                    ],
                    'improvement_tip': 'यह कहानी अपने किसी मित्र को अपने शब्दों में सुनाएं।'
                },
                'RD-ADV-HI-001': {
                    'title': 'गहन पठन: खोया हुआ दिशा-सूचक',
                    'module': 'उन्नत बोध',
                    'difficulty': 'advanced',
                    'skill': 'comprehension',
                    'concept_intro': 'उन्नत गद्यांशों में विवरण, पात्रों के निर्णय और संदर्भगत शब्दावली का विश्लेषण करें।',
                    'real_life_context': 'लंबी कहानियों और जटिल पुस्तकों को समझना।',
                    'image_visual': '🧭',
                    'activities': [
                        {'type': 'welcome', 'title': 'उन्नत वर्णनात्मक पठन', 'subtitle': 'विस्तृत गद्यांशों का विश्लेषण करें', 'objectives': ['संदर्भ में अर्थ समझें', 'कथानक के मूल विषय को पहचानें']},
                        {
                            'type': 'storyboard_story',
                            'title': 'खोया हुआ दिशा-सूचक',
                            'subtitle': 'ध्यान से पढ़ें और गद्यांश के विवरणों का विश्लेषण करें',
                            'story_title': 'शिखर की यात्रा',
                            'story_body': 'अमित घने और कोहरे से ढके जंगल में आगे बढ़ रहा था। उसका मुख्य मार्गदर्शक पीतल का एक दिशा-सूचक (कंपास) था, जो उसे दादाजी से विरासत में मिला था। जब हवा के एक तेज़ झोंके ने उसे गहरी खाई में गिरा दिया, तो वह डर गया। फिर भी, बचपन में सीखे गए तारों और सूर्य की दिशा के ज्ञान को याद कर, वह दृढ़ संकल्प के साथ आगे बढ़ा।',
                            'tabs': {
                                'विवरण': {
                                    'question': 'अमित के कंपास को क्या हुआ?',
                                    'options': ['उसने बेच दिया', 'वह गहरी खाई में गिर गया', 'वह भूल गया', 'चोरी हो गया'],
                                    'correct_index': 1
                                },
                                'अनुमान': {
                                    'question': 'कंपास खोने के बाद अमित ने रास्ता कैसे ढूँढा?',
                                    'options': ['मदद का इंतजार किया', 'सूर्य की दिशा के ज्ञान से', 'नक्शे से', 'वापस घर गया'],
                                    'correct_index': 1
                                },
                                'शब्दावली': {
                                    'question': 'यहाँ "विरासत" का क्या अर्थ है?',
                                    'options': ['नया खिलौना', 'पूर्वजों से मिली मूल्यवान वस्तु', 'दिशा सूचक नक्शा', 'गुप्त मार्ग'],
                                    'correct_index': 1
                                }
                            }
                        },
                        {'type': 'graduation', 'title': 'असाधारण सफलता!', 'subtitle': 'उन्नत बोध पूरा हुआ!', 'xp': 25, 'time': '20 min'}
                    ],
                    'quiz_bank': [
                        {'question': 'कंपास खोने पर अमित को शुरू में कैसा महसूस हुआ?', 'options': ['उत्साह', 'डर', 'क्रोध', 'खुशी'], 'correct_index': 1, 'explanation': 'गद्यांश के अनुसार "वह डर गया था"।'}
                    ],
                    'improvement_tip': 'कठिन शब्दों के अर्थ जानने के लिए उनके आस-पास के वाक्यों के संदर्भ को समझें।'
                },

                # --- WRITING LESSONS ---
                'WR-BEG-HI-002': {
                    'title': 'सरल शब्द लिखना',
                    'module': 'लेखन कौशल',
                    'difficulty': 'beginner',
                    'skill': 'writing',
                    'concept_intro': 'तीन अक्षरों वाले सामान्य संज्ञा शब्दों को लिखने का अभ्यास करें।',
                    'real_life_context': 'सरल नाम और खरीदारी की सूची लिखना।',
                    'image_visual': '✏️',
                    'activities': [
                        {'type': 'welcome', 'title': 'सरल शब्द लिखना', 'subtitle': 'शब्द बनाने के लिए अक्षरों को लिखें', 'objectives': ['अक्षर ट्रेस करें', 'पूरे शब्द लिखें']},
                        {'type': 'trace_letter', 'title': 'अक्षर म लिखना', 'subtitle': 'अक्षर म लिखना सीखें', 'target': 'म', 'image': 'pencil', 'arrows': ['ऊपर से नीचे सीधी रेखा खींचे, मोड़ें, फिर आड़ी रेखा और एक खड़ी रेखा खींचे।']},
                        {'type': 'practice_missing', 'questionNumber': 2, 'questionText': 'लुप्त अक्षर लिखें: म _ र', 'equation': 'म_र', 'target': 'ग', 'options': ['ग', 'थ', 'च']},
                        {'type': 'write_word', 'title': 'शब्द लिखें', 'target': 'मगर', 'image': 'tiger', 'instruction': 'मगर शब्द लिखने का अभ्यास करें।'},
                        {'type': 'write_sentence', 'title': 'वाक्य लिखें', 'target': 'मगर जल में रहता है।', 'instruction': 'दिए गए वाक्य को साफ-防-साफ लिखें।'},
                        {'type': 'graduation', 'title': 'बहुत बढ़िया!', 'subtitle': 'शब्द लेखन पूरा हुआ।', 'xp': 15, 'time': '10 min'}
                    ],
                    'quiz_bank': [
                        {'question': 'क-म-ल जोड़कर कौन सा शब्द बनता है?', 'options': ['कमल', 'मगर', 'घर'], 'correct_index': 0, 'explanation': 'क-म-ल से कमल शब्द बनता है।'}
                    ],
                    'improvement_tip': 'अक्षरों को लिखते समय उनके उच्चारण को दोहराएं।'
                },
                'WR-INT-HI-003': {
                    'title': 'व्याकरण: क्रिया काल और वाक्य रचना',
                    'module': 'लेखन कौशल',
                    'difficulty': 'intermediate',
                    'skill': 'writing',
                    'concept_intro': 'भूतकाल और वर्तमान काल के वाक्यों को सही व्याकरण के साथ बनाना सीखें।',
                    'real_life_context': 'संदेश लिखना और फॉर्म को सही ढंग से भरना।',
                    'image_visual': '✍️',
                    'activities': [
                        {'type': 'welcome', 'title': 'क्रिया काल और वाक्य रचना', 'subtitle': 'भूतकाल और वर्तमान काल सीखें', 'objectives': ['सही क्रिया रूप चुनें', 'शुद्ध वाक्य लिखें']},
                        {'type': 'unscramble_words', 'title': 'अक्षर सुलझाएं', 'subtitle': 'सही वर्तनी बनाने के लिए अक्षरों को व्यवस्थित करें', 'instruction': 'सुलझाएं।', 'items': [
                            {'id': 1, 'clue': 'खेलना का भूतकाल', 'image': 'pencil', 'tokens': ['ल', 'खे', 'ता', 'था'], 'target': 'खेलताथा'},
                            {'id': 2, 'clue': 'पढ़ना का रूप', 'image': 'pencil', 'tokens': ['ढ़', 'प', 'ता', 'है'], 'target': 'पढ़ताहै'}
                        ]},
                        {'type': 'unscramble_sentence', 'title': 'वाक्य व्यवस्था', 'subtitle': 'वाक्य को सही क्रम में लगाएं', 'instruction': 'टोकन दबाएं।', 'tokens': ['कल', 'उसने', 'क्रिकेट', 'खेला'], 'target': 'उसने कल क्रिकेट खेला।'},
                        {'type': 'paragraph_writing', 'title': 'अनुच्छेद लेखन', 'subtitle': 'अपने रविवार के बारे में लिखें', 'topic': 'मेरा रविवार', 'instruction': 'कम से कम 15 शब्दों में लिखें कि आपने पिछले रविवार को क्या किया।'},
                        {'type': 'graduation', 'title': 'उत्कृष्ट!', 'subtitle': 'व्याकरण और वाक्य लेखन पूरा हुआ।', 'xp': 15, 'time': '12 min'}
                    ],
                    'quiz_bank': [
                        {'question': '"पढ़ना" का भूतकाल रूप क्या होगा?', 'options': ['पढ़ेगा', 'पढ़ा था', 'पढ़ता है'], 'correct_index': 1, 'explanation': '"पढ़ा था" भूतकाल को दर्शाता है।'}
                    ],
                    'improvement_tip': 'वाक्य के अंत में हमेशा पूर्णविराम (।) लगाना याद रखें।'
                },
                'WR-ADV-HI-001': {
                    'title': 'औपचारिक पत्र और ईमेल',
                    'module': 'उन्नत रचना',
                    'difficulty': 'advanced',
                    'skill': 'writing',
                    'concept_intro': 'सही अभिवादन और विषय के साथ औपचारिक पत्र या ईमेल लिखना सीखें।',
                    'real_life_context': 'प्रबंधकों, शिक्षकों या कार्यालयों को आवेदन पत्र लिखना।',
                    'image_visual': '✉️',
                    'activities': [
                        {'type': 'welcome', 'title': 'औपचारिक पत्र लेखन', 'subtitle': 'औपचारिक ईमेल और पत्र लिखना सीखें', 'objectives': ['पत्र का ढांचा समझें', 'औपचारिक शब्दों का चयन करें']},
                        {'type': 'letter_drafting', 'title': 'छुट्टी के लिए प्रार्थना पत्र', 'topic': 'बीमारी के कारण विद्यालय के प्रधानाचार्य से दो दिन की छुट्टी का अनुरोध करें।', 'instruction': 'सेवा में, प्रधानाचार्य महोदय लिखते हुए विषय, कारण और अंत में अपना नाम शामिल करें।', 'subtitle': 'प्रार्थना पत्र ड्राफ्ट करें'},
                        {'type': 'paragraph_writing', 'title': 'विचार लेखन', 'subtitle': 'एक अनुच्छेद लिखें', 'topic': 'स्वच्छता का महत्व', 'instruction': 'कम से कम 25 शब्दों में एक अनुच्छेद लिखें कि हमारे जीवन में स्वच्छता क्यों आवश्यक है।', 'topic_label': 'विषय'},
                        {'type': 'graduation', 'title': 'उन्नत लेखन संपन्न!', 'subtitle': 'औपचारिक पत्र लेखन का चरण पूरा हुआ।', 'xp': 25, 'time': '20 min'}
                    ],
                    'quiz_bank': [
                        {'question': 'प्रधानाचार्य को पत्र लिखते समय कौन सा अभिवादन उपयुक्त है?', 'options': ['अरे सुनो', 'आदरणीय महोदय / महोदया,', 'नमस्ते दोस्त,'], 'correct_index': 1, 'explanation': 'प्रधानाचार्य के लिए "आदरणीय महोदय" सबसे उपयुक्त और औपचारिक है।'}
                    ],
                    'improvement_tip': 'पत्र भेजने से पहले वर्तनी और व्याकरण की गलतियों को दोबारा जांचें।'
                }
            },

            'kn': {
                # --- READING LESSONS ---
                'RD-BEG-KN-001': {
                    'title': 'ಸರಳ ಪದಗಳು ಮತ್ತು ನಾಮಪದಗಳು',
                    'module': 'ಓದುವಿಕೆಯ ಮೂಲಗಳು',
                    'difficulty': 'beginner',
                    'skill': 'word_recognition',
                    'concept_intro': 'ದೈನಂದಿನ ಸರಳ ಪದಗಳನ್ನು ಗುರುತಿಸಿ ಮತ್ತು ಅವುಗಳ ಉಚ್ಚಾರಣೆಯನ್ನು ಕಲಿಯಿರಿ.',
                    'real_life_context': 'ಬೋರ್ಡ್‌ಗಳು ಮತ್ತು ಪ್ಯಾಕೆಟ್‌ಗಳ ಮೇಲಿನ ಸರಳ ಪದಗಳನ್ನು ಗುರುತಿಸುವುದು.',
                    'image_visual': '📖',
                    'activities': [
                        {'type': 'welcome', 'title': 'ಸರಳ ಪದಗಳು ಮತ್ತು ನಾಮಪದಗಳು', 'subtitle': 'ದೈನಂದಿನ ಸರಳ ಪದಗಳನ್ನು ಕಲಿಯಿರಿ', 'objectives': ['ಪದಗಳನ್ನು ಗುರುತಿಸಿ', 'ಉಚ್ಚಾರಣೆ ಕಲಿಯಿರಿ']},
                        {'type': 'definition', 'title': 'ಸರಳ ಪದ: ಮರ', 'subtitle': 'ಎಲೆಗಳಿರುವ ದೊಡ್ಡ ಸಸ್ಯ', 'left': 'ಮರ', 'right': 'ಗಿಡ', 'result': 'ಮರ', 'left_emoji': '🌳', 'right_emoji': '🌱', 'result_emoji': '🌳'},
                        {'type': 'examples', 'title': 'ಸಾಮಾನ್ಯ ಪದಗಳು', 'examples': [
                            {'left': 'ಹಾಲು', 'right': 'ಕುಡಿಯುವುದು', 'result': 'ಹಾಲು', 'left_emoji': '🥛', 'right_emoji': '🥤', 'result_emoji': '🥛'},
                            {'left': 'ಹಣ್ಣು', 'right': 'ತಿನ್ನುವುದು', 'result': 'ಹಣ್ಣು', 'left_emoji': '🍎', 'right_emoji': '🍌', 'result_emoji': '🍎'}
                        ]},
                        {'type': 'listen', 'title': 'ಆಲಿಸಿ ಮತ್ತು ಓದಿ', 'target': 'ಇದು ನನ್ನ ಸುಂದರ ಮನೆ.', 'hint': 'ಗಮನವಿಟ್ಟು ಕೇಳಿ!'},
                        {'type': 'practice_audio', 'questionNumber': 1, 'questionText': 'ನೀವು ಕೇಳುವ ಪದವನ್ನು ಟ್ಯಾಪ್ ಮಾಡಿ: ಮರ', 'target': 'ಮರ', 'options': ['ಮರ', 'ಹಾಲು', 'ಹಣ್ಣು']},
                        {'type': 'graduation', 'title': 'ಅದ್ಭುತ!', 'subtitle': 'ಸರಳ ಪದಗಳ ಕಲಿಕೆ ಮುಗಿಯಿತು!', 'xp': 15, 'time': '10 min'}
                    ],
                    'quiz_bank': [
                        {'question': '🍎 ಎಮೋಜಿಗೆ ಯಾವ ಪದ ಹೊಂದಿಕೆಯಾಗುತ್ತದೆ?', 'options': ['ಹಾಲು', 'ಹಣ್ಣು', 'ಮರ'], 'correct_index': 1, 'explanation': 'ಹಣ್ಣು ಎಂಬೂ ಆಪಲ್ ಎಮೋಜಿಗೆ ಹೊಂದಿಕೆಯಾಗುತ್ತದೆ.'}
                    ],
                    'improvement_tip': 'ಮನೆಯಲ್ಲಿರುವ ವಸ್ತುಗಳ ಕನ್ನಡ ಹೆಸರನ್ನು ಜೋರಾಗಿ ಹೇಳಿ ಅಭ್ಯಾಸ ಮಾಡಿ.'
                },
                'RD-BEG-KN-002': {
                    'title': 'ಸಣ್ಣ ವಾಕ್ಯಗಳು',
                    'module': 'ಓದುವಿಕೆಯ ಮೂಲಗಳು',
                    'difficulty': 'beginner',
                    'skill': 'reading_fluency',
                    'concept_intro': 'ಮೂರು ಅಥವಾ ನಾಲ್ಕು ಪದಗಳಿರುವ ಸಣ್ಣ ವಾಕ್ಯಗಳನ್ನು ಓದಲು ಕಲಿಯಿರಿ.',
                    'real_life_context': 'ಸಣ್ಣ ಬೋರ್ಡ್‌ಗಳು ಮತ್ತು ಶುಭ ಹಾರೈಕೆಗಳನ್ನು ಓದುವುದು.',
                    'image_visual': '📖',
                    'activities': [
                        {'type': 'welcome', 'title': 'ಸಣ್ಣ ವಾಕ್ಯಗಳು', 'subtitle': 'ಸಣ್ಣ ವಾಕ್ಯಗಳನ್ನು ಒಟ್ಟಿಗೆ ಓದೋಣ', 'objectives': ['ಸಣ್ಣ ವಾಕ್ಯಗಳನ್ನು ಓದಿ', 'ಪದಗಳ ಓಟವನ್ನು ಕಲಿಯಿರಿ']},
                        {'type': 'definition', 'title': 'ಸರಳ ವಾಕ್ಯ', 'subtitle': 'ಬೆಕ್ಕು ಚಾಪೆಯ ಮೇಲೆ ಕೂತಿದೆ.', 'left': 'ಬೆಕ್ಕು', 'right': 'ಕೂತಿದೆ', 'result': 'ಬೆಕ್ಕು ಕೂತಿದೆ', 'left_emoji': '🐱', 'right_emoji': '🧘', 'result_emoji': '🐱'},
                        {'type': 'listen', 'title': 'ಆಲಿಸಿ ಮತ್ತು ಪುನರಾವರ್ತಿಸಿ', 'target': 'ನಾಯಿ ವೇಗವಾಗಿ ಓಡುತ್ತದೆ.', 'hint': 'ಜೋರಾಗಿ ಹೇಳಿ!'},
                        {'type': 'practice_missing', 'questionNumber': 1, 'questionText': 'ಬಿಟ್ಟ ಸ್ಥಳ ತುಂಬಿ: ನಾಯಿ ವೇಗವಾಗಿ ___ ತದೆ.', 'equation': 'ನಾಯಿ ವೇಗವಾಗಿ _ ತದೆ.', 'target': 'ಓಡು', 'options': ['ಓಡು', 'ಮನೆ', 'ಹಾಲು']},
                        {'type': 'graduation', 'title': 'ಉತ್ತಮ!', 'subtitle': 'ವಾಕ್ಯ ಓದುವಿಕೆ ಪೂರ್ಣಗೊಂಡಿದೆ.', 'xp': 15, 'time': '10 min'}
                    ],
                    'quiz_bank': [
                        {'question': 'ವಾಕ್ಯ ಪೂರ್ಣಗೊಳಿಸಿ: ಸೂರ್ಯನು ತುಂಬಾ ___ ಇರುತ್ತಾನೆ.', 'options': ['ಬಿಸಿ', 'ಓಡು', 'ಮರ'], 'correct_index': 0, 'explanation': 'ಸೂರ್ಯನು ಬಿಸಿಯಾಗಿರುತ್ತಾನೆ.'}
                    ],
                    'improvement_tip': 'ಎಡರಿಂದ ಬಲಕ್ಕೆ ಬೆರಳು ಇಟ್ಟು ನಿಧಾನವಾಗಿ ಓದಿ.'
                },
                'RD-INT-KN-001': {
                    'title': 'ಕಥೆ: ಬುದ್ಧಿವಂತ ಕಾಗೆ',
                    'module': 'ಓದುವಿಕೆಯ ಶೈಲಿ',
                    'difficulty': 'intermediate',
                    'skill': 'reading_fluency',
                    'concept_intro': 'ಬುದ್ಧಿವಂತ ಕಾಗೆಯ ನೀತಿ ಕಥೆಯನ್ನು ಓದಿ ಮತ್ತು ಪ್ರಶ್ನೆಗಳಿಗೆ ಉತ್ತರಿಸಿ.',
                    'real_life_context': 'ಕಥೆಗಳ ಮುಖ್ಯ ಸಂದೇಶ ಮತ್ತು ಸಾರಾಂಶವನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳುವುದು.',
                    'image_visual': '🦅',
                    'activities': [
                        {'type': 'welcome', 'title': 'ಕಥೆ: ಬುದ್ಧಿವಂತ ಕಾಗೆ', 'subtitle': 'ನೀತಿ ಕಥೆಯನ್ನು ಓದಿ', 'objectives': ['ಕಥೆಯ ವಿವರಗಳನ್ನು ತಿಳಿಯಿರಿ', 'ನೀತಿಯನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಿ']},
                        {
                            'type': 'storyboard_story',
                            'title': 'ಬುದ್ಧಿವಂತ ಕಾಗೆ',
                            'subtitle': 'ಕಥೆಯನ್ನು ಓದಿ ಮತ್ತು ಪ್ರಶ್ನೆಗಳಿಗೆ ಉತ್ತರಿಸಿ',
                            'story_title': 'ಬಾಯಾರಿದ ಕಾಗೆ',
                            'story_body': 'ಒಂದು ಬಾಯಾರಿದ ಕಾಗೆ ನೀರಿಗಾಗಿ ಹುಡುಕುತ್ತಿತ್ತು. ಅದಕ್ಕೆ ಒಂದು ಕೊಡ ಸಿಕ್ಕಿತು, ಆದರೆ ನೀರು ತುಂಬಾ ಕೆಳಗಿತ್ತು. ಬುದ್ಧಿವಂತ ಕಾಗೆಯು ಕೊಡಕ್ಕೆ ಸಣ್ಣ ಕಲ್ಲುಗಳನ್ನು ಹಾಕಿತು. ನೀರು ಮೇಲೆ ಬಂದಿತು ಮತ್ತು ಕಾಗೆ ನೀರನ್ನು ಕುಡಿಯಿತು. ನೀತಿ: ಶ್ರಮಕ್ಕೆ ತಕ್ಕ ಫಲ.',
                            'tabs': {
                                'ಗ್ರಹಿಕೆ': {
                                    'question': 'ಕಾಗೆ ಯಾವುದಕ್ಕಾಗಿ ಹುಡುಕುತ್ತಿತ್ತು?',
                                    'options': ['ಆಹಾರ', 'ನೀರು', 'ಕಲ್ಲುಗಳು', 'ಗೂಡು'],
                                    'correct_index': 1
                                },
                                'ಪರಿಹಾರ': {
                                    'question': 'ಕಾಗೆಯು ಕೊಡದ ಒಳಗೆ ಏನನ್ನು ಹಾಕಿತು?',
                                    'options': ['ಎಲೆಗಳು', 'ಕಲ್ಲುಗಳು', 'ನಾಣ್ಯಗಳು', 'ಹಣ್ಣುಗಳು'],
                                    'correct_index': 1
                                },
                                'ನೀತಿ': {
                                    'question': 'ಕಥೆಯ ನೀತಿ ಏನು?',
                                    'options': ['ನೀರು ಕುಡಿಯಬೇಡಿ', 'ಕಲ್ಲುಗಳು ಒಳ್ಳೆಯವು', 'ಶ್ರಮಕ್ಕೆ ತಕ್ಕ ಫಲ', 'ಕಾಗೆ ಒಂದು ಪಕ್ಷಿ'],
                                    'correct_index': 2
                                }
                            }
                        },
                        {'type': 'graduation', 'title': 'ಅದ್ಭುತ!', 'subtitle': 'ಕಥೆಯ ಗ್ರಹಿಕೆ ಪೂರ್ಣಗೊಂಡಿದೆ.', 'xp': 20, 'time': '15 min'}
                    ],
                    'quiz_bank': [
                        {'question': 'ನೀರು ಏಕೆ ಮೇಲೆ ಬಂದಿತು?', 'options': ['ಮಳೆಯಾದ ಕಾರಣ', 'ಕಾಗೆ ಕೊಡಕ್ಕೆ ಕಲ್ಲುಗಳನ್ನು ಹಾಕಿದ್ದರಿಂದ', 'ಕೊಡ ಒಡೆದಿದ್ದರಿಂದ'], 'correct_index': 1, 'explanation': 'ಕಲ್ಲುಗಳನ್ನು ಹಾಕಿದ್ದರಿಂದ ನೀರಿನ ಮಟ್ಟ ಮೇಲೆ ಬಂದಿತು.'}
                    ],
                    'improvement_tip': 'ಈ ಕಥೆಯನ್ನು ನಿಮ್ಮ ಸ್ನೇಹಿತರಿಗೆ ನಿಮ್ಮದೇ ಪದಗಳಲ್ಲಿ ಹೇಳಿ ಅಭ್ಯಾಸ ಮಾಡಿ.'
                },
                'RD-ADV-KN-001': {
                    'title': 'ವಿವರಣಾತ್ಮಕ ಓದುವಿಕೆ: ಕಳೆದುಹೋದ ದಿಕ್ಸೂಚಿ',
                    'module': 'ಸುಧಾರಿತ ಗ್ರಹಿಕೆ',
                    'difficulty': 'advanced',
                    'skill': 'comprehension',
                    'concept_intro': 'ವಿವರವಾದ ಗದ್ಯ ಭಾಗಗಳನ್ನು ಓದಿ ಕಥೆಯ ಸಂದರ್ಭ ಮತ್ತು ಪದಗಳ ಅರ್ಥವನ್ನು ವಿಶ್ಲೇಷಿಸಿ.',
                    'real_life_context': 'ದೊಡ್ಡ ಪುಸ್ತಕಗಳು ಮತ್ತು ಲೇಖನಗಳನ್ನು ಓದುವುದು.',
                    'image_visual': '🧭',
                    'activities': [
                        {'type': 'welcome', 'title': 'ಸುಧಾರಿತ ವಿವರಣಾತ್ಮಕ ಓದುವಿಕೆ', 'subtitle': 'ವಿವರವಾದ ಭಾಗಗಳನ್ನು ವಿಶ್ಲೇಷಿಸಿ', 'objectives': ['ಸಂದರ್ಭಕ್ಕೆ ತಕ್ಕ ಪದಗಳ ಅರ್ಥ ತಿಳಿಯಿರಿ', 'ಕಥೆಯ ವಿಷಯವನ್ನು ಗುರುತಿಸಿ']},
                        {
                            'type': 'storyboard_story',
                            'title': 'ಕಳೆದುಹೋದ ದಿಕ್ಸೂಚಿ',
                            'subtitle': 'ಗಮನವಿಟ್ಟು ಓದಿ ಮತ್ತು ವಿವರಗಳನ್ನು ವಿಶ್ಲೇಷಿಸಿ',
                            'story_title': 'ಶಿಖರದ ಕಡೆಗೆ ಪ್ರಯಾಣ',
                            'story_body': 'ಅಮಿತ್ ದಟ್ಟವಾದ ಮಂಜಿನಿಂದ ಆವೃತವಾದ ಕಾಡಿನಲ್ಲಿ ಸಾಗುತ್ತಿದ್ದನು. ಅವನಿಗೆ ದಾರಿತೋರಲು ಅವನ ತಾತ ನೀಡಿದ್ದ ಹಿತ್ತಾಳೆಯ ದಿಕ್ಸೂಚಿ ಒಂದೇ ಆಧಾರವಾಗಿತ್ತು. ಇದ್ದಕ್ಕಿದ್ದಂತೆ ಬೀಸಿದ ಗಾಳಿಗೆ ಅದು ಕಣಿವೆಯೊಳಗೆ ಬಿದ್ದಾಗ ಅವನು ಗಾಬರಿಯಾದನು. ಆದರೆ, ಬಾಲ್ಯದಲ್ಲಿ ಕಲಿತ ನಕ್ಷತ್ರ ಮತ್ತು ಸೂರ್ಯನ ದಿಕ್ಕಿನ ಜ್ಞಾನದಿಂದ ಧೈರ್ಯ ತಂದುಕೊಂಡು ಮುಂದೆ ನಡೆದನು.',
                            'tabs': {
                                'ವಿವರ': {
                                    'question': 'ಅಮಿತ್ ಅವರ ದಿಕ್ಸೂಚಿಗೆ ಏನಾಯಿತು?',
                                    'options': ['ಅವನು ಮಾರಿದನು', 'ಅದು ಕಣಿವೆಯೊಳಗೆ ಬಿದ್ದಿತು', 'ಅವನು ಮರೆತುಹೋದನು', 'ಕಳ್ಳತನವಾಯಿತು'],
                                    'correct_index': 1
                                },
                                'ಅನುಮಾನ': {
                                    'question': 'ದಿಕ್ಸೂಚಿ ಕಳೆದುಕೊಂಡ ನಂತರ ಅಮಿತ್ ದಾರಿಯನ್ನು ಹೇಗೆ ಕಂಡುಕೊಂಡನು?',
                                    'options': ['ಸಹಾಯಕ್ಕಾಗಿ ಕಾದನು', 'ಸೂರ್ಯ ಮತ್ತು ನಕ್ಷತ್ರಗಳ ದಿಕ್ಕಿನಿಂದ', 'ನಕ್ಷೆಯಿಂದ', 'ಮನೆಗೆ ಮರಳಿದನು'],
                                    'correct_index': 1
                                },
                                'ಶಬ್ದಕೋಶ': {
                                    'question': 'ಇಲ್ಲಿ "ಪರಂಪರೆ" ಪದದ ಅರ್ಥವೇನು?',
                                    'options': ['ಹೊಸ ಆಟಿಕೆ', 'ಹಿರಿಯರಿಂದ ಬಂದ ಅಮೂಲ್ಯ ವಸ್ತು', 'ದಿಕ್ಸೂಚಿ ನಕ್ಷೆ', 'ರಹಸ್ಯ ಹಾದಿ'],
                                    'correct_index': 1
                                }
                            }
                        },
                        {'type': 'graduation', 'title': 'ಅದ್ಭುತ ಸಾಧನೆ!', 'subtitle': 'ಸುಧಾರಿತ ಓದುವಿಕೆ ಮುಕ್ತಾಯವಾಯಿತು!', 'xp': 25, 'time': '20 min'}
                    ],
                    'quiz_bank': [
                        {'question': 'ದಿಕ್ಸೂಚಿ ಕಳೆದುಕೊಂಡಾಗ ಅಮಿತ್ ಮೊದಲು ಯಾವ ಭಾವನೆ ಅನುಭವಿಸಿದನು?', 'options': ['ಸಂತೋಷ', 'ಭಯ', 'ಕೋಪ', 'ಕುತೂಹಲ'], 'correct_index': 1, 'explanation': 'ದಿಕ್ಸೂಚಿ ಬಿದ್ದಾಗ ಅವನು ಗಾಬರಿಯಾದನು ಅಂದರೆ ಭಯಪಟ್ಟನು.'}
                    ],
                    'improvement_tip': 'ಕಠಿಣ ಪದಗಳು ಬಂದಾಗ ಅವುಗಳ ಹಿಂದಿನ ಮತ್ತು ಮುಂದಿನ ವಾಕ್ಯಗಳನ್ನು ಓದಿ ಅರ್ಥ ತಿಳಿಯಲು ಪ್ರಯತ್ನಿಸಿ.'
                },

                # --- WRITING LESSONS ---
                'WR-BEG-KN-002': {
                    'title': 'ಸರಳ ಪದಗಳನ್ನು ಬರೆಯುವುದು',
                    'module': 'ಬರವಣಿಗೆ ಕೌಶಲ್ಯ',
                    'difficulty': 'beginner',
                    'skill': 'writing',
                    'concept_intro': 'ಮೂರು ಅಕ್ಷರಗಳ ಸಾಮಾನ್ಯ ಸರಳ ನಾಮಪದಗಳನ್ನು ಬರೆಯಲು ಅಭ್ಯಾಸ ಮಾಡಿ.',
                    'real_life_context': 'ಸರಳ ಹೆಸರುಗಳು ಮತ್ತು ಪಟ್ಟಿಯನ್ನು ಬರೆಯುವುದು.',
                    'image_visual': '✏️',
                    'activities': [
                        {'type': 'welcome', 'title': 'ಸರಳ ಪದಗಳನ್ನು ಬರೆಯುವುದು', 'subtitle': 'ಪದಗಳನ್ನು ರೂಪಿಸಲು ಅಕ್ಷರಗಳನ್ನು ಬರೆಯಿರಿ', 'objectives': ['ಅಕ್ಷರಗಳನ್ನು ಬರೆಯಿರಿ', 'ಪೂರ್ಣ ಪದಗಳನ್ನು ರೂಪಿಸಿ']},
                        {'type': 'trace_letter', 'title': 'ಅಕ್ಷರ ಮ ಬರೆಯುವುದು', 'subtitle': 'ಅಕ್ಷರ ಮ ಬರೆಯಲು ಕಲಿಯಿರಿ', 'target': 'ಮ', 'image': 'pencil', 'arrows': ['ಮೇಲಿಂದ ಕೆಳಗೆ ಬರೆಯಿರಿ, ನಡುವೆ ತಿರುಗಿಸಿ ನೇರ ಗೆರೆ ಹಾಕಿ.']},
                        {'type': 'practice_missing', 'questionNumber': 2, 'questionText': 'ಬಿಟ್ಟಿರುವ ಅಕ್ಷರ ಬರೆಯಿರಿ: ಮ _ ನ', 'equation': 'ಮ_ನ', 'target': 'ನೆ', 'options': ['ನೆ', 'ಗೆ', 'ಕೆ']},
                        {'type': 'write_word', 'title': 'ಪದ ಬರೆಯಿರಿ', 'target': 'ಮನೆ', 'image': 'home', 'instruction': 'ಮನೆ ಪದವನ್ನು ಬರೆಯಲು ಅಭ್ಯಾಸ ಮಾಡಿ.'},
                        {'type': 'write_sentence', 'title': 'ವಾಕ್ಯ ಬರೆಯಿರಿ', 'target': 'ನನ್ನ ಮನೆ ದೊಡ್ಡದಾಗಿದೆ.', 'instruction': 'ದಿನನಿತ್ಯದ ಸರಳ ವಾಕ್ಯ ಬರೆಯಿರಿ.'},
                        {'type': 'graduation', 'title': 'ಅತ್ಯುತ್ತಮ!', 'subtitle': 'ಸರಳ ಪದ ಬರವಣಿಗೆ ಮುಗಿಯಿತು.', 'xp': 15, 'time': '10 min'}
                    ],
                    'quiz_bank': [
                        {'question': 'ಮ-ರ ಸೇರಿಸಿದರೆ ಯಾವ ಪದವಾಗುತ್ತದೆ?', 'options': ['ಮರ', 'ಮನೆ', 'ಹಾಲು'], 'correct_index': 0, 'explanation': 'ಮ ಮತ್ತು ರ ಅಕ್ಷರಗಳು ಸೇರಿದರೆ ಮರವಾಗುತ್ತದೆ.'}
                    ],
                    'improvement_tip': 'ಅಕ್ಷರ ಬರೆಯುವಾಗ ಅದರ ಧ್ವನಿಯನ್ನು ಜೋರಾಗಿ ಹೇಳಿ ಬರೆಯಿರಿ.'
                },
                'WR-INT-KN-003': {
                    'title': 'ಕ್ರಿಯಾಪದಗಳು ಮತ್ತು ವಾಕ್ಯ ರಚನೆ',
                    'module': 'ಬರವಣಿಗೆ ಕೌಶಲ್ಯ',
                    'difficulty': 'intermediate',
                    'skill': 'writing',
                    'concept_intro': 'ಭೂತಕಾಲ ಮತ್ತು ವರ್ತಮಾನ ಕಾಲದ ವಾಕ್ಯಗಳನ್ನು ವ್ಯಾಕರಣಬದ್ಧವಾಗಿ ರಚಿಸಲು ಕಲಿಯಿರಿ.',
                    'real_life_context': 'ಸರಳ ಸಂದೇಶಗಳನ್ನು ಬರೆಯುವುದು ಮತ್ತು ಫಾರ್ಮ್‌ಗಳನ್ನು ತುಂಬುವುದು.',
                    'image_visual': '✍️',
                    'activities': [
                        {'type': 'welcome', 'title': 'ಕ್ರಿಯಾಪದಗಳು ಮತ್ತು ವಾಕ್ಯ ರಚನೆ', 'subtitle': 'ಭೂತಕಾಲ ಮತ್ತು ವರ್ತಮಾನ ಕಾಲ ತಿಳಿಯಿರಿ', 'objectives': ['ಸರಿಯಾದ ಕ್ರಿಯಾಪದ ರೂಪ ಬಳಸಿ', 'ವಾಕ್ಯ ರಚಿಸಿ']},
                        {'type': 'unscramble_words', 'title': 'ಅಕ್ಷರ ಜೋಡಣೆ', 'subtitle': 'ಸರಿಯಾದ ಪದಗಳನ್ನು ರೂಪಿಸಲು ಅಕ್ಷರಗಳನ್ನು ಜೋಡಿಸಿ', 'instruction': 'ಜೋಡಿಸಿ.', 'items': [
                            {'id': 1, 'clue': 'ಆಟವಾಡುವ ಭೂತಕಾಲ', 'image': 'pencil', 'tokens': ['ಡ', 'ತಿ', 'ದ್ದ', 'ಆ', 'ನು'], 'target': 'ಆಡುತ್ತಿದ್ದನು'},
                            {'id': 2, 'clue': 'ಓದುವ ರೂಪ', 'image': 'pencil', 'tokens': ['ದು', 'ತ್ತಾ', 'ನೆ', 'ಓ'], 'target': 'ಓದುತ್ತಾನೆ'}
                        ]},
                        {'type': 'unscramble_sentence', 'title': 'ವಾಕ್ಯ ರಚನೆ', 'subtitle': 'ವಾಕ್ಯವನ್ನು ಸರಿಯಾದ ಕ್ರಮದಲ್ಲಿ ಜೋಡಿಸಿ', 'instruction': 'ಟೋಕನ್ ಒತ್ತಿ.', 'tokens': ['ನಿನ್ನೆ', 'ಅವನು', 'ಆಟ', 'ವಾಡಿದನು'], 'target': 'ಅವನು ನಿನ್ನೆ ಆಟ ವಾಡಿದನು.'},
                        {'type': 'paragraph_writing', 'title': 'ಪ್ಯಾರಾಗ್ರಾಫ್ ಬರವಣಿಗೆ', 'subtitle': 'ನಿಮ್ಮ ಭಾನುವಾರದ ಬಗ್ಗೆ ಬರೆಯಿರಿ', 'topic': 'ನನ್ನ ಭಾನುವಾರ', 'instruction': 'ಕನಿಷ್ಠ 15 ಪದಗಳಲ್ಲಿ ಕಳೆದ ಭಾನುವಾರ ನೀವು ಮಾಡಿದ್ದನ್ನು ಬರೆಯಿರಿ.'},
                        {'type': 'graduation', 'title': 'ಉತ್ತಮ ಕೆಲಸ!', 'subtitle': 'ವಾಕ್ಯ ರಚನೆ ಮತ್ತು ವ್ಯಾಕರಣ ಬರವಣಿಗೆ ಮುಗಿಯಿತು.', 'xp': 15, 'time': '12 min'}
                    ],
                    'quiz_bank': [
                        {'question': '"ಓದು" ಪದದ ಭೂತಕಾಲ ರೂಪ ಯಾವುದು?', 'options': ['ಓದುತ್ತಾನೆ', 'ಓದಿದನು', 'ಓದುವನು'], 'correct_index': 1, 'explanation': '"ಓದಿದನು" ಎಂಬುದು ಕಳೆದ ಸಮಯವನ್ನು ಸೂಚಿಸುತ್ತದೆ.'}
                    ],
                    'improvement_tip': 'ವಾಕ್ಯದ ಕೊನೆಯಲ್ಲಿ ಪೂರ್ಣವಿರಾಮ ಬಿಂದುವನ್ನು (.) ಹಾಕಲು ಮರೆಯದಿರಿ.'
                },
                'WR-ADV-KN-001': {
                    'title': 'ಔಪಚಾರಿಕ ಪತ್ರಗಳು ಮತ್ತು ಇಮೇಲ್',
                    'module': 'ಸುಧಾರಿತ ರಚನೆ',
                    'difficulty': 'advanced',
                    'skill': 'writing',
                    'concept_intro': 'ಸೂಕ್ತವಾದ ಸಂಬೋಧನೆ ಮತ್ತು ವಿಷಯದೊಂದಿಗೆ ಇಮೇಲ್ ಅಥವಾ ಪತ್ರ ಬರೆಯುವುದನ್ನು ಕಲಿಯಿರಿ.',
                    'real_life_context': 'ಶಿಕ್ಷಕರಿಗೆ ಅಥವಾ ಕಚೇರಿಗಳಿಗೆ ರಜೆ ಅರ್ಜಿಗಳನ್ನು ಬರೆಯುವುದು.',
                    'image_visual': '✉️',
                    'activities': [
                        {'type': 'welcome', 'title': 'ಔಪಚಾರಿಕ ಪತ್ರ ಬರವಣಿಗೆ', 'subtitle': 'ಔಪಚಾರಿಕ ಇಮೇಲ್ ಬರೆಯಲು ಕಲಿಯಿರಿ', 'objectives': ['ಪತ್ರದ ರಚನೆಯನ್ನು ತಿಳಿಯಿರಿ', 'ಔಪಚಾರಿಕ ಪದಗಳನ್ನು ಬಳಸಿ']},
                        {'type': 'letter_drafting', 'title': 'ರಜೆ ಕೋರಿ ಅರ್ಜಿ ಪತ್ರ', 'topic': 'ಅನಾರೋಗ್ಯದ ಕಾರಣದಿಂದ ಶಾಲೆಯ ಮುಖ್ಯೋಪಾಧ್ಯಾಯರಿಗೆ ಎರಡು ದಿನಗಳ ರಜೆಗಾಗಿ ಪತ್ರ ಬರೆಯಿರಿ.', 'instruction': 'ವಿಷಯ, ಕಾರಣ ಮತ್ತು ಕೊನೆಯಲ್ಲಿ ನಿಮ್ಮ ಹೆಸರನ್ನು ಒಳಗೊಂಡಂತೆ ಪತ್ರವನ್ನು ಬರೆಯಿರಿ.', 'subtitle': 'ರಜೆ ಪತ್ರವನ್ನು ಬರೆಯಿರಿ'},
                        {'type': 'paragraph_writing', 'title': 'ವಿಚಾರ ಬರವಣಿಗೆ', 'subtitle': 'ಒಂದು ಪ್ಯಾರಾಗ್ರಾಫ್ ಬರೆಯಿರಿ', 'topic': 'ಸ್ವಚ್ಛತೆಯ ಪ್ರಾಮುಖ್ಯತೆ', 'instruction': 'ಕನಿಷ್ಠ 25 ಪದಗಳಲ್ಲಿ ನಮ್ಮ ಜೀವನದಲ್ಲಿ ಸ್ವಚ್ಛತೆ ಏಕೆ ಅಗತ್ಯ ಎಂದು ಬರೆಯಿರಿ.', 'topic_label': 'ವಿಷಯ'},
                        {'type': 'graduation', 'title': 'ಸುಧಾರಿತ ಹಂತ ಮುಗಿಯಿತು!', 'subtitle': 'ಔಪಚಾರಿಕ ಪತ್ರ ಬರವಣಿಗೆಯ ಹಂತ ಮುಗಿಯಿತು.', 'xp': 25, 'time': '20 min'}
                    ],
                    'quiz_bank': [
                        {'question': 'ಮುಖ್ಯೋಪಾಧ್ಯಾಯರಿಗೆ ಪತ್ರ ಬರೆಯುವಾಗ ಯಾವ ಸಂಬೋಧನೆ ಸೂಕ್ತವಾಗಿದೆ?', 'options': ['ಹೇ ಸ್ನೇಹಿತ', 'ಗೌರವಾನ್ವಿತ ಗುರುಗಳೇ,', 'ಹಲೋ ಸರ್,'], 'correct_index': 1, 'explanation': 'ಮುಖ್ಯೋಪಾಧ್ಯಾಯರಿಗೆ "ಗೌರವಾನ್ವಿತ ಗುರುಗಳೇ" ಎಂಬ ಸಂಬೋಧನೆ ಸೂಕ್ತ ಮತ್ತು ಗೌರವಪೂರ್ವಕವಾಗಿರುತ್ತದೆ.'}
                    ],
                    'improvement_tip': 'ಪತ್ರ ಬರೆದ ನಂತರ ಅಕ್ಷರ ತಪ್ಪುಗಳು ಮತ್ತು ವ್ಯಾಕರಣ ದೋಷಗಳನ್ನು ಮತ್ತೊಮ್ಮೆ ಪರಿಶೀಲಿಸಿ.'
                }
            },

            'ta': {
                # --- READING LESSONS ---
                'RD-BEG-TA-001': {
                    'title': 'எளிய சொற்களும் பெயர்ச்சொற்களும்',
                    'module': 'வாசிப்பின் அடிப்படைகள்',
                    'difficulty': 'beginner',
                    'skill': 'word_recognition',
                    'concept_intro': 'அன்றாட எளிய சொற்களை அடையாளம் கண்டு அவற்றின் உச்சரிப்பைக் கற்றுக்கொள்ளுங்கள்.',
                    'real_life_context': 'பெயர்ப் பலகைகள் மற்றும் அறிவிப்புகளில் உள்ள எளிய சொற்களை வாசிப்பது.',
                    'image_visual': '📖',
                    'activities': [
                        {'type': 'welcome', 'title': 'எளிய சொற்களும் பெயர்ச்சொற்களும்', 'subtitle': 'அன்றாட எளிய சொற்களைக் கற்றுக்கொள்ளுங்கள்', 'objectives': ['சொற்களை அடையாளம் காண்க', 'உச்சரிப்பை பழகுக']},
                        {'type': 'definition', 'title': 'எளிய சொல்: மரம்', 'subtitle': 'இலைகளைக் கொண்ட பெரிய தாவரம்', 'left': 'மரம்', 'right': 'செடி', 'result': 'மரம்', 'left_emoji': '🌳', 'right_emoji': '🌱', 'result_emoji': '🌳'},
                        {'type': 'examples', 'title': 'பொதுவான சொற்கள்', 'examples': [
                            {'left': 'பால்', 'right': 'குடிப்பது', 'result': 'பால்', 'left_emoji': '🥛', 'right_emoji': '🥤', 'result_emoji': '🥛'},
                            {'left': 'பழம்', 'right': 'உண்பது', 'result': 'பழம்', 'left_emoji': '🍎', 'right_emoji': '🍌', 'result_emoji': '🍎'}
                        ]},
                        {'type': 'listen', 'title': 'கேட்டு வாசியுங்கள்', 'target': 'இது என் அழகான வீடு.', 'hint': 'கவனமாகக் கேளுங்கள்!'},
                        {'type': 'practice_audio', 'questionNumber': 1, 'questionText': 'நீங்கள் கேட்கும் சொல்லைத் தட்டவும்: மரம்', 'target': 'மரம்', 'options': ['மரம்', 'பால்', 'பழம்']},
                        {'type': 'graduation', 'title': 'அருமை!', 'subtitle': 'எளிய சொற்கள் பாடம் முடிந்தது!', 'xp': 15, 'time': '10 min'}
                    ],
                    'quiz_bank': [
                        {'question': '🍎 எமோஜிக்கு எந்த சொல் பொருந்தும்?', 'options': ['பால்', 'பழம்', 'மரம்'], 'correct_index': 1, 'explanation': 'பழம் என்பது ஆப்பிள் எமோஜியைக் குறிக்கும் சொல்.'}
                    ],
                    'improvement_tip': 'வீட்டில் உள்ள பொருட்களின் தமிழ் பெயரைச் சொல்லி பழகவும்.'
                },
                'RD-BEG-TA-002': {
                    'title': 'எளிய வாக்கியங்கள்',
                    'module': 'வாசிப்பின் அடிப்படைகள்',
                    'difficulty': 'beginner',
                    'skill': 'reading_fluency',
                    'concept_intro': 'மூன்று அல்லது நான்கு சொற்கள் கொண்ட எளிய வாக்கியங்களை வாசிக்கப் பழகுங்கள்.',
                    'real_life_context': 'சிறு பலகைகள் மற்றும் வாழ்த்துகளை வாசிப்பது.',
                    'image_visual': '📖',
                    'activities': [
                        {'type': 'welcome', 'title': 'எளிய வாக்கியங்கள்', 'subtitle': 'எளிய வாக்கியங்களை வாசிப்போம்', 'objectives': ['எளிய வாக்கியங்களை வாசித்தல்', 'சொற்களின் ஓட்டத்தை அறிதல்']},
                        {'type': 'definition', 'title': 'எளிய வாக்கியம்', 'subtitle': 'பூனை பாயில் அமர்ந்துள்ளது.', 'left': 'பூனை', 'right': 'அமர்ந்துள்ளது', 'result': 'பூனை அமர்ந்துள்ளது', 'left_emoji': '🐱', 'right_emoji': '🧘', 'result_emoji': '🐱'},
                        {'type': 'listen', 'title': 'கேட்டுத் திரும்பச் சொல்லவும்', 'target': 'நாய் வேகமாக ஓடுகிறது.', 'hint': 'ஜோராகச் சொல்லவும்!'},
                        {'type': 'practice_missing', 'questionNumber': 1, 'questionText': 'விடுபட்ட இடத்தை நிரப்புக: நாய் வேகமாக ___கிறது.', 'equation': 'நாய் வேகமாக _ கிறது.', 'target': 'ஓடு', 'options': ['ஓடு', 'வீடு', 'பால்']},
                        {'type': 'graduation', 'title': 'அனுக்கிரகம்!', 'subtitle': 'வாக்கிய வாசிப்பு நிறைவடைந்தது.', 'xp': 15, 'time': '10 min'}
                    ],
                    'quiz_bank': [
                        {'question': 'வாக்கியத்தை நிரப்புக: சூரியன் மிகவும் ___.', 'options': ['சூடு', 'ஓடு', 'மரம்'], 'correct_index': 0, 'explanation': 'சூரியன் வெப்பமானது (சூடு).'}
                    ],
                    'improvement_tip': 'இடமிருந்து வலமாக விரல் வைத்து மெதுவாக வாசித்து பழகவும்.'
                },
                'RD-INT-TA-001': {
                    'title': 'கதை: புத்திசாலி காகம்',
                    'module': 'வாசிப்பு திறன்',
                    'difficulty': 'intermediate',
                    'skill': 'reading_fluency',
                    'concept_intro': 'புத்திசாலி காகத்தின் நீதி கதையை வாசித்து வினாக்களுக்கு விடையளியுங்கள்.',
                    'real_life_context': 'கதைகளின் முக்கிய கருத்தை அறிந்து கொள்வது.',
                    'image_visual': '🦅',
                    'activities': [
                        {'type': 'welcome', 'title': 'கதை: புத்திசாலி காகம்', 'subtitle': 'நீதி கதையை வாசியுங்கள்', 'objectives': ['கதையின் விவரங்களை அறிக', 'நீதியை புரிந்து கொள்க']},
                        {
                            'type': 'storyboard_story',
                            'title': 'புத்திசாலி காகம்',
                            'subtitle': 'கதையை வாசித்து வினாக்களுக்கு விடையளியுங்கள்',
                            'story_title': 'தாகமுள்ள காகம்',
                            'story_body': 'ஒரு தாகமுள்ள காகம் தண்ணீரைத் தேடி அலைந்தது. அதற்கு ஒரு குடம் கிடைத்தது, ஆனால் தண்ணீர் மிகவும் அடியில் இருந்தது. புத்திசாலி காகம் குடத்தினுள் சிறிய கற்களைப் போட்டது. தண்ணீர் மேலே வந்தது, காகம் நீர் அருந்தியது. நீதி: முயற்சி திருவினையாக்கும்.',
                            'tabs': {
                                'புரிதல்': {
                                    'question': 'காகம் எதைத் தேடியது?',
                                    'options': ['உணவு', 'தண்ணீர்', 'கற்கள்', 'கூடு'],
                                    'correct_index': 1
                                },
                                'தீர்வு': {
                                    'question': 'காகம் குடத்தினுள் எதைப் போட்டது?',
                                    'options': ['இலைகள்', 'கற்கள்', 'நாணயங்கள்', 'பழங்கள்'],
                                    'correct_index': 1
                                },
                                'நீதி': {
                                    'question': 'கதையின் நீதி काय?',
                                    'options': ['தண்ணீர் குடிக்காதே', 'கற்கள் நல்லவை', 'முயற்சி திருவினையாக்கும்', 'காகம் ஒரு பறவை'],
                                    'correct_index': 2
                                }
                            }
                        },
                        {'type': 'graduation', 'title': 'அற்புதம்!', 'subtitle': 'கதை புரிதல் நிறைவடைந்தது.', 'xp': 20, 'time': '15 min'}
                    ],
                    'quiz_bank': [
                        {'question': 'தண்ணீர் ஏன் மேலே வந்தது?', 'options': ['மழை பெய்ததால்', 'காகம் கற்களைப் போட்டதால்', 'குடம் உடைந்ததால்'], 'correct_index': 1, 'explanation': 'கற்களைப் போட்டதால் குடத்தின் நீர் மட்டம் உயர்ந்தது.'}
                    ],
                    'improvement_tip': 'இக்கதையை உங்கள் நண்பர்களுக்கு உங்கள் சொந்த வார்த்தைகளில் சொல்லப் பழகுங்கள்.'
                },
                'RD-ADV-TA-001': {
                    'title': 'விளக்க உரை: தொலைந்த திசைகாட்டி',
                    'module': 'உயர்தர வாசிப்பு',
                    'difficulty': 'advanced',
                    'skill': 'comprehension',
                    'concept_intro': 'விரிவான உரை பகுதிகளை வாசித்து கதையின் சூழல் மற்றும் சொற்களின் பொருளை ஆராயுங்கள்.',
                    'real_life_context': 'நீண்ட புத்தகங்கள் மற்றும் கட்டுரைகளை வாசித்து புரிந்து கொள்வது.',
                    'image_visual': '🧭',
                    'activities': [
                        {'type': 'welcome', 'title': 'உயர்தர விளக்க வாசிப்பு', 'subtitle': 'விளக்கப் பகுதிகளை ஆராயுங்கள்', 'objectives': ['சொற்களின் சூழல் பொருள் அறிக', 'கதையின் மையக் கருத்தை அறிக']},
                        {
                            'type': 'storyboard_story',
                            'title': 'தொலைந்த திசைகாட்டி',
                            'subtitle': 'கவனமாக வாசித்து விவரங்களை ஆராயுங்கள்',
                            'story_title': 'சிகரத்தை நோக்கிய பயணம்',
                            'story_body': 'அமித் அடர்ந்த பனி மூடிய காட்டின் வழியே சென்று கொண்டிருந்தான். அவனுக்கு வழிகாட்ட அவனது தாத்தா கொடுத்த பித்தளை திசைகாட்டி மட்டுமே இருந்தது. திடீரென வீசிய காற்றில் அது பள்ளத்தாக்கில் விழுந்தபோது அவன் பயந்தான். ஆனால், சிறுவயதில் கற்ற சூரியன் மற்றும் விண்மீன்களின் திசை அறிவை நினைவுகூர்ந்து, துணிவுடன் முன்னேறினான்.',
                            'tabs': {
                                'விவரம்': {
                                    'question': 'அமித்தின் திசைகாட்டிக்கு என்ன நேர்ந்தது?',
                                    'options': ['அவன் விற்றுவிட்டான்', 'அது பள்ளத்தாக்கில் விழுந்தது', 'அவன் மறந்துவிட்டான்', 'திருடப்பட்டுவிட்டது'],
                                    'correct_index': 1
                                },
                                'அனுமானம்': {
                                    'question': 'திசைகாட்டியை இழந்த பின் அமித் வழியை எவ்வாறு கண்டறிந்தான்?',
                                    'options': ['உதவிக்காகக் காத்திருந்தான்', 'சூரியன் மற்றும் விண்மீன்களின் திசையால்', 'வரைபடத்தின் மூலம்', 'வீடு திரும்பினான்'],
                                    'correct_index': 1
                                },
                                'சொற்களஞ்சியம்': {
                                    'question': 'இங்கு "பாரம்பரியம்" என்பதன் பொருள் என்ன?',
                                    'options': ['புதிய பொம்மை', 'மூதாதையரிடமிருந்து வந்த மதிப்புமிக்க பொருள்', 'திசைகாட்டி வரைபடம்', 'ரகசிய வழி'],
                                    'correct_index': 1
                                }
                            }
                        },
                        {'type': 'graduation', 'title': 'அருமையான சாதனை!', 'subtitle': 'உயர்தர வாಸಿப்பு நிறைவடைந்தது!', 'xp': 25, 'time': '20 min'}
                    ],
                    'quiz_bank': [
                        {'question': 'திசைகாட்டி தொலைந்தபோது அமித் முதலில் என்ன உணர்வை அடைந்தான்?', 'options': ['மகிழ்ச்சி', 'பயம்', 'கோபம்', 'ஆர்வம்'], 'correct_index': 1, 'explanation': 'திசைகாட்டி விழுந்ததும் அவன் பயந்தான் என்று உரை கூறுகிறது.'}
                    ],
                    'improvement_tip': 'கடினமான சொற்கள் வரும்போது அவற்றின் முன்னும் பின்னும் உள்ள வாக்கியங்களை வாசித்து பொருள் அறிய முயலுங்கள்.'
                },

                # --- WRITING LESSONS ---
                'WR-BEG-TA-002': {
                    'title': 'ಎಲಿಯ ಸೊಕ್ಕಳೈ ಎಳುತುತಲ್',
                    'module': 'எழுத்து பயிற்சி',
                    'difficulty': 'beginner',
                    'skill': 'writing',
                    'concept_intro': 'மூன்று எழுத்துக்கள் கொண்ட எளிய பெயர்ச்சொற்களை எழுதப் பழகுங்கள்.',
                    'real_life_context': 'எளிய பெயர்கள் மற்றும் பட்டியல்களை எழுதுவது.',
                    'image_visual': '✏️',
                    'activities': [
                        {'type': 'welcome', 'title': 'எளிய சொற்களை எழுதுதல்', 'subtitle': 'சொற்களை உருவாக்க எழுத்துக்களை எழுதுங்கள்', 'objectives': ['எழுத்துக்களை எழுதுதல்', 'முழு சொற்களை உருவாக்குதல்']},
                        {'type': 'trace_letter', 'title': 'எழுத்து ம எழுதுதல்', 'subtitle': 'எழுத்து ம எழுதக் கற்றுக்கொள்ளுங்கள்', 'target': 'ம', 'image': 'pencil', 'arrows': ['மேலிருந்து கீழ் நேராக வரைந்து, வளைத்து படுக்கை கோடு போடுங்கள்.']},
                        {'type': 'practice_missing', 'questionNumber': 2, 'questionText': 'விடுபட்ட எழுத்தை எழுதுக: ம _ ம்', 'equation': 'ம_ம்', 'target': 'ர', 'options': ['ர', 'த', 'ந']},
                        {'type': 'write_word', 'title': 'சொல்லை எழுதுக', 'target': 'மரம்', 'image': 'tree', 'instruction': 'மரம் என்ற சொல்லை எழுதப் பழகுங்கள்.'},
                        {'type': 'write_sentence', 'title': 'வாக்கியத்தை எழுதுக', 'target': 'மரம் காற்று தரும்.', 'instruction': 'அன்றாட எளிய வாக்கியத்தை எழுதுங்கள்.'},
                        {'type': 'graduation', 'title': 'அருமை!', 'subtitle': 'எளிய சொல் எழுதுதல் நிறைவடைந்தது.', 'xp': 15, 'time': '10 min'}
                    ],
                    'quiz_bank': [
                        {'question': 'ம-ர-ம் சேர்த்தால் என்ன சொல்லாகும்?', 'options': ['மரம்', 'கல்', 'வீடு'], 'correct_index': 0, 'explanation': 'ம, ர, ம் ஆகிய எழுத்துக்கள் சேர்ந்தால் மரம் என்ற சொல்லாகும்.'}
                    ],
                    'improvement_tip': 'எழுத்தை எழுதும் போது அதன் ஒலியைச் சொல்லி எழுதவும்.'
                },
                'WR-INT-TA-003': {
                    'title': 'வினைச்சொற்களும் வாக்கிய அமைப்பும்',
                    'module': 'எழுத்து பயிற்சி',
                    'difficulty': 'intermediate',
                    'skill': 'writing',
                    'concept_intro': 'இறந்தகாலம் மற்றும் நிகழ்கால வாக்கியங்களை இலக்கண முறைப்படி அமைக்க கற்றுக்கொள்ளுங்கள்.',
                    'real_life_context': 'எளிய செய்திகளை எழுதுதல் மற்றும் படிவங்களை நிரப்புவது.',
                    'image_visual': '✍️',
                    'activities': [
                        {'type': 'welcome', 'title': 'வினைச்சொற்களும் வாக்கிய அமைப்பும்', 'subtitle': 'இறந்தகாலம் மற்றும் நிகழ்காலம் அறிக', 'objectives': ['சரியான வினை வடிவம் பயன்படுத்துக', 'வாக்கியம் அமைக்க']},
                        {'type': 'unscramble_words', 'title': 'எழுத்துக்களைச் சீரமைத்தல்', 'subtitle': 'சரியான சொற்களை உருவாக்க எழுத்துக்களைச் சீரமைக்கவும்', 'instruction': 'சீரமைக்கவும்.', 'items': [
                            {'id': 1, 'clue': 'விளையாடு என்பதன் இறந்தகாலம்', 'image': 'pencil', 'tokens': ['வி', 'ளை', 'யா', 'டி', 'ನಾ', 'ன்'], 'target': 'விளையாடினான்'},
                            {'id': 2, 'clue': 'படிக்கும் வடிவம்', 'image': 'pencil', 'tokens': ['ப', 'டி', 'க்', 'கி', 'றா', 'ன்'], 'target': 'படிக்கிறான்'}
                        ]},
                        {'type': 'unscramble_sentence', 'title': 'வாக்கிய சீரமைப்பு', 'subtitle': 'வாக்கியத்தை சரியான வரிசையில் சீரமைக்கவும்', 'instruction': 'டோக்கனை அழுத்தவும்.', 'tokens': ['நேற்று', 'அவன்', 'விளையாடினான்', 'விளையாட்டு'], 'target': 'அவன் நேற்று விளையாட்டு விளையாடினான்.'},
                        {'type': 'paragraph_writing', 'title': 'பத்தி எழுதுதல்', 'subtitle': 'உங்கள் ஞாயிற்றுக்கிழமை பற்றி எழுதுங்கள்', 'topic': 'என் ஞாயிற்றுக்கிழமை', 'instruction': 'கடந்த ஞாயிறு நீங்கள் செய்ததை குறைந்தபட்சம் 15 சொற்களில் எழுதவும்.'},
                        {'type': 'graduation', 'title': 'நன்றாகச் செய்தீர்கள்!', 'subtitle': 'வாக்கிய அமைப்பு மற்றும் இலக்கண எழுத்து பயிற்சி முடிந்தது.', 'xp': 15, 'time': '12 min'}
                    ],
                    'quiz_bank': [
                        {'question': '"எழுது" என்ற சொல்லின் இறந்தகால வடிவம் எது?', 'options': ['எழுதுகிறான்', 'எழுதினான்', 'எழுதுவான்'], 'correct_index': 1, 'explanation': '"எழுதினான்" என்பது கடந்த காலத்தைக் குறிக்கும் வினைச்சொல்.'}
                    ],
                    'improvement_tip': 'வாக்கியத்தின் இறுதியில் எப்போதும் முற்றுப்புள்ளி (.) வைக்க மறக்காதீர்கள்.'
                },
                'WR-ADV-TA-001': {
                    'title': 'விண்ணப்பங்கள் மற்றும் மின்னஞ்சல்',
                    'module': 'உயர்தர வடிவங்கள்',
                    'difficulty': 'advanced',
                    'skill': 'writing',
                    'concept_intro': 'முறையான முகவுரை மற்றும் பொருளுடன் மின்னஞ்சல் அல்லது விண்ணப்பக் கடிதம் எழுதக் கற்றுக்கொள்ளுங்கள்.',
                    'real_life_context': 'ஆசிரியர்களுக்கு அல்லது அலுவலகங்களுக்கு விடுப்பு விண்ணப்பங்களை எழுதுதல்.',
                    'image_visual': '✉️',
                    'activities': [
                        {'type': 'welcome', 'title': 'விண்ணப்பக் கடிதம் எழுதுதல்', 'subtitle': 'முறையான மின்னஞ்சல் எழுதக் கற்றுக்கொள்ளுங்கள்', 'objectives': ['கடிதத்தின் அமைப்பை அறிக', 'முறையான சொற்களைப் பயன்படுத்துக']},
                        {'type': 'letter_drafting', 'title': 'விடுப்பு விண்ணப்பக் கடிதம்', 'topic': 'உடல்நலக்குறைவு காரணமாக பள்ளி தலைமை ஆசிரியருக்கு இரண்டு நாள் விடுப்பு வேண்டி கடிதம் எழுதவும்.', 'instruction': 'பொருள், காரணம் மற்றும் இறுதியில் உங்கள் பெயர் ஆகியவற்றை உள்ளடக்கி கடிதத்தை எழுதவும்.', 'subtitle': 'விடுப்பு கடிதத்தை எழுதவும்'},
                        {'type': 'paragraph_writing', 'title': 'கருத்து எழுதுதல்', 'subtitle': 'ஒரு பத்தி எழுதவும்', 'topic': 'சுத்தம் சுகம் தரும்', 'instruction': 'சுத்தம் ஏன் அவசியம் என்பதைப் பற்றி குறைந்தபட்சம் 25 சொற்களில் ஒரு பத்தி எழுதவும்.', 'topic_label': 'பொருள்'},
                        {'type': 'graduation', 'title': 'உயர்தர எழுத்து நிறைவுற்றது!', 'subtitle': 'விண்ணப்பக் கடிதம் எழுதும் பாடம் முடிந்தது.', 'xp': 25, 'time': '20 min'}
                    ],
                    'quiz_bank': [
                        {'question': 'தலைமை ஆசிரியருக்கு கடிதம் எழுதும் போது எந்த முகவுரை பொருத்தமானது?', 'options': ['ஹே நண்பா', 'மதிப்பிற்குரிய ஐயா / அம்மா,', 'ஹலோ சார்,'], 'correct_index': 1, 'explanation': 'தலைமை ஆசிரியருக்கு "மதிப்பிற்குரிய ஐயா" என்ற முகவுரை மிகவும் பொருத்தமானது.'}
                    ],
                    'improvement_tip': 'கடிதத்தை எழுதிய பின் எழுத்துப் பிழைகள் ஏதேனும் உள்ளதா என சரிபார்க்கவும்.'
                }
            }
        }

        # Let's seed the lessons using update_or_create to prevent duplicate keys
        for lang, lessons_dict in LESSON_SPECS.items():
            for lesson_id, defaults in lessons_dict.items():
                if 'estimated_time' not in defaults:
                    defaults['estimated_time'] = 12
                defaults['language'] = lang
                lesson, created = Lesson.objects.update_or_create(
                    lesson_id=lesson_id,
                    defaults=defaults
                )
                if created:
                    self.stdout.write(f"Created new lesson: {lesson_id}")
                else:
                    self.stdout.write(f"Updated lesson: {lesson_id}")
                seeded_count += 1
                
        self.stdout.write(self.style.SUCCESS(f"Successfully seeded {seeded_count} advanced and intermediate Reading & Writing lessons!"))
