# backend/lessons/management/commands/seed_rich_lessons.py
from django.core.management.base import BaseCommand
from lessons.models import Lesson
from users.models import Learner, StudySession
from rewards.models import RewardProfile, LearnerAchievement, Achievement
from assessments.models import LiteracyProfile, AssessmentAttempt, AssessmentResponse, SeenQuestion, SkillBreakdown
from lessons.models import LearningPath
import random

LANGS = ['en', 'hi', 'kn', 'ta']
LEVELS = ['beginner', 'intermediate', 'advanced']

# Translations for UI labels
TRANSLATIONS = {
    'en': {
        'explore': "Explore the object and listen to its sound.",
        'learn': "Learn the concept: ",
        'practice': "Tap microphone and speak: ",
        'feedback': "Great job! Keep practicing to master this concept.",
        'takeaway': "Always notice how this concept appears in daily life.",
        'transition': "Next, we will build upon this to learn the next concept."
    },
    'hi': {
        'explore': "वस्तु को देखें और उसकी ध्वनि सुनें।",
        'learn': "अवधारणा सीखें: ",
        'practice': "माइक दबाएं और बोलें: ",
        'feedback': "बहुत बढ़िया! इस अवधारणा में महारत हासिल करने के लिए अभ्यास करते रहें।",
        'takeaway': "हमेशा ध्यान दें कि दैनिक जीवन में यह अवधारणा कैसे दिखाई देती है।",
        'transition': "आगे, हम अगला विषय सीखने के लिए इसे आगे बढ़ाएंगे।"
    },
    'kn': {
        'explore': "ವಸ್ತುವನ್ನು ಅನ್ವೇಷಿಸಿ ಮತ್ತು ಅದರ ಧ್ವನಿಯನ್ನು ಆಲಿಸಿ.",
        'learn': "ಪರಿಕಲ್ಪನೆಯನ್ನು ಕಲಿಯಿರಿ: ",
        'practice': "ಮೈಕ್ರೊಫೋನ್ ಟ್ಯಾಪ್ ಮಾಡಿ ಮತ್ತು ಮಾತನಾಡಿ: ",
        'feedback': "ಅದ್ಭುತ ಕೆಲಸ! ಈ ಪರಿಕಲ್ಪನೆಯನ್ನು ಕರಗತ ಮಾಡಿಕೊಳ್ಳಲು ಅಭ್ಯಾಸ ಮಾಡುತ್ತಿರಿ.",
        'takeaway': "ದೈನಂದಿನ ಜೀವನದಲ್ಲಿ ಈ ಪರಿಕಲ್ಪನೆಯು ಹೇಗೆ ಕಾಣಿಸಿಕೊಳ್ಳುತ್ತದೆ ಎಂಬುದನ್ನು ಯಾವಾಗಲೂ ಗಮನಿಸಿ.",
        'transition': "ಮುಂದೆ, ಮುಂದಿನ ಪರಿಕಲ್ಪನೆಯನ್ನು ಕಲಿಯಲು ನಾವು ಇದನ್ನು ಮುಂದುವರಿಸುತ್ತೇವೆ."
    },
    'ta': {
        'explore': "பொருளை ஆராய்ந்து அதன் ஒலியைக் கேளுங்கள்.",
        'learn': "கருத்தைக் கற்றுக்கொள்ளுங்கள்: ",
        'practice': "மைக்கை தட்டி பேசுங்கள்: ",
        'feedback': "அருமையான வேலை! இந்த கருத்தை மாஸ்டர் செய்ய தொடர்ந்து பயிற்சி செய்யுங்கள்.",
        'takeaway': "அன்றாட வாழ்க்கையில் இந்த கருத்து எவ்வாறு தோன்றுகிறது என்பதை எப்போதும் கவனியுங்கள்.",
        'transition': "அடுத்து, அடுத்த கருத்தைக் கற்றுக்கொள்ள இதை அடிப்படையாகக் கொண்டு தொடர்வோம்."
    }
}

# The first 9 visual-first grouped alphabet lessons (matching screen mockups exactly)
ALPHABET_GROUPS = {
    'en': [
        {"title": "Letters A B C", "emoji": "abc", "t1": "A", "opts1": ["A", "B", "C"], "q2": "___ BC — what is the missing letter?", "t2": "A", "opts2": ["A", "B", "Z"]},
        {"title": "Letters D E F", "emoji": "🅰️", "t1": "D", "opts1": ["D", "E", "F"], "q2": "___ EF — what is the missing letter?", "t2": "D", "opts2": ["D", "E", "X"]},
        {"title": "Letters F to J", "emoji": "🅰️", "t1": "G", "opts1": ["G", "H", "I", "J"], "q2": "___ HIJ — what is the missing letter?", "t2": "G", "opts2": ["G", "B", "Y"]},
        {"title": "Letters K to O", "emoji": "✏️", "t1": "K", "opts1": ["K", "L", "M", "N"], "q2": "___ LMN — what is the missing letter?", "t2": "K", "opts2": ["K", "P", "Q"]},
        {"title": "Letters P Q R", "emoji": "🎯", "t1": "P", "opts1": ["P", "Q", "R"], "q2": "___ QR — what is the missing letter?", "t2": "P", "opts2": ["P", "S", "T"]},
        {"title": "Letters S T U", "emoji": "abc", "t1": "S", "opts1": ["S", "T", "U"], "q2": "___ TU — what is the missing letter?", "t2": "S", "opts2": ["S", "Y", "Z"]},
        {"title": "Letters V W X", "emoji": "📖", "t1": "V", "opts1": ["V", "W", "X"], "q2": "___ WX — what is the missing letter?", "t2": "V", "opts2": ["V", "A", "B"]},
        {"title": "Letters Y and Z", "emoji": "🎯", "t1": "Y", "opts1": ["Y", "Z", "X"], "q2": "___ Z — what is the missing letter?", "t2": "Y", "opts2": ["Y", "W", "P"]},
        {"title": "Alphabet Review", "emoji": "🏆", "t1": "M", "opts1": ["M", "N", "W"], "q2": "A ___ C — what is the missing letter?", "t2": "B", "opts2": ["B", "D", "X"]}
    ],
    'hi': [
        {"title": "स्वर अ आ इ", "emoji": "abc", "t1": "अ", "opts1": ["अ", "आ", "इ"], "q2": "___ आ इ — लुप्त अक्षर क्या है?", "t2": "अ", "opts2": ["अ", "क", "ख"]},
        {"title": "स्वर ई उ ऊ", "emoji": "🅰️", "t1": "ई", "opts1": ["ई", "उ", "ऊ"], "q2": "___ उ ऊ — लुप्त अक्षर क्या है?", "t2": "ई", "opts2": ["ई", "अ", "ग"]},
        {"title": "व्यंजन क ख ग घ", "emoji": "🅰️", "t1": "क", "opts1": ["क", "ख", "ग"], "q2": "___ ख ग घ — लुप्त अक्षर क्या है?", "t2": "क", "opts2": ["क", "च", "ट"]},
        {"title": "व्यंजन च छ ज झ", "emoji": "✏️", "t1": "च", "opts1": ["च", "छ", "ज"], "q2": "___ छ ज झ — लुप्त अक्षर क्या है?", "t2": "च", "opts2": ["च", "त", "प"]},
        {"title": "व्यंजन ट ठ ड ढ", "emoji": "🎯", "t1": "ट", "opts1": ["ट", "ठ", "ड"], "q2": "___ ठ ड ढ — लुप्त अक्षर क्या है?", "t2": "ट", "opts2": ["ट", "य", "र"]},
        {"title": "व्यंजन त थ द ध", "emoji": "abc", "t1": "त", "opts1": ["त", "थ", "द"], "q2": "___ थ द ध — लुप्त अक्षर क्या है?", "t2": "त", "opts2": ["त", "ल", "व"]},
        {"title": "व्यंजन प फ ब भ", "emoji": "📖", "t1": "प", "opts1": ["प", "फ", "ब"], "q2": "___ फ ब भ — लुप्त अक्षर क्या है?", "t2": "प", "opts2": ["प", "श", "स"]},
        {"title": "व्यंजन म य र ल", "emoji": "🎯", "t1": "म", "opts1": ["म", "य", "र"], "q2": "___ य र ल — लुप्त अक्षर क्या है?", "t2": "म", "opts2": ["म", "ह", "क्ष"]},
        {"title": "वर्णमाला पुनरावलोकन", "emoji": "🏆", "t1": "क", "opts1": ["क", "ख", "ग"], "q2": "अ ___ इ — लुप्त अक्षर क्या है?", "t2": "आ", "opts2": ["आ", "उ", "ऊ"]}
    ],
    'kn': [
        {"title": "ಸ್ವರಗಳು ಅ ಆ ಇ", "emoji": "abc", "t1": "ಅ", "opts1": ["ಅ", "ಆ", "ಇ"], "q2": "___ ಆ ಇ — ಬಿಟ್ಟಿರುವ ಅಕ್ಷರ ಯಾವುದು?", "t2": "ಅ", "opts2": ["ಅ", "ಕ", "ಖ"]},
        {"title": "ಸ್ವರಗಳು ಈ ಉ ಊ", "emoji": "🅰️", "t1": "ಈ", "opts1": ["ಈ", "ಉ", "ಊ"], "q2": "___ ಉ ಊ — ಬಿಟ್ಟಿರುವ ಅಕ್ಷರ ಯಾವುದು?", "t2": "ಈ", "opts2": ["ಈ", "ಅ", "ಗ"]},
        {"title": "ವ್ಯಂಜನಗಳು ಕ ಖ ಗ ಘ", "emoji": "🅰️", "t1": "ಕ", "opts1": ["ಕ", "ಖ", "ಗ"], "q2": "___ ಖ ಗ ಘ — ಬಿಟ್ಟಿರುವ ಅಕ್ಷರ ಯಾವುದು?", "t2": "ಕ", "opts2": ["ಕ", "ಚ", "ಟ"]},
        {"title": "ವ್ಯಂಜನಗಳು ಚ ಛ ಜ ಝ", "emoji": "✏️", "t1": "ಚ", "opts1": ["ಚ", "ಛ", "ಜ"], "q2": "___ ಛ ಜ ಝ — ಬಿಟ್ಟಿರುವ ಅಕ್ಷರ ಯಾವುದು?", "t2": "ಚ", "opts2": ["ಚ", "ತ", "ಪ"]},
        {"title": "ವ್ಯಂಜನಗಳು ಟ ಠ ಡ ಢ", "emoji": "🎯", "t1": "ಟ", "opts1": ["ಟ", "ಠ", "ಡ"], "q2": "___ ಠ ಡ ಢ — ಬಿಟ್ಟಿರುವ ಅಕ್ಷರ ಯಾವುದು?", "t2": "ಟ", "opts2": ["ಟ", "ಯ", "ರ"]},
        {"title": "ವ್ಯಂಜನಗಳು ತ ಥ ದ ಧ", "emoji": "abc", "t1": "ತ", "opts1": ["ತ", "ಥ", "ದ"], "q2": "___ ಥ ದ ಧ — ಬಿಟ್ಟಿರುವ ಅಕ್ಷರ ಯಾವುದು?", "t2": "ತ", "opts2": ["ತ", "ಲ", "ವ"]},
        {"title": "ವ್ಯಂಜನಗಳು ಪ ಫ ಬ ಭ", "emoji": "📖", "t1": "ಪ", "opts1": ["ಪ", "ಫ", "ಬ"], "q2": "___ ಫ ಬ ಭ — ಬಿಟ್ಟಿರುವ ಅಕ್ಷರ ಯಾವುದು?", "t2": "ಪ", "opts2": ["ಪ", "ಶ", "ಸ"]},
        {"title": "ವ್ಯಂಜನಗಳು ಮ ಯ ರ ಲ", "emoji": "🎯", "t1": "ಮ", "opts1": ["ಮ", "ಯ", "ರ"], "q2": "___ ಯ ರ ಲ — ಬಿಟ್ಟಿರುವ ಅಕ್ಷರ ಯಾವುದು?", "t2": "ಮ", "opts2": ["ಮ", "ಹ", "ಕ್ಷ"]},
        {"title": "ಅಕ್ಷರಮಾಲೆ ಪುನರಾವರ್ತನೆ", "emoji": "🏆", "t1": "ಕ", "opts1": ["ಕ", "ಖ", "ಗ"], "q2": "ಅ ___ ಇ — ಬಿಟ್ಟಿರುವ ಅಕ್ಷರ ಯಾವುದು?", "t2": "ಆ", "opts2": ["ಆ", "ಉ", "ಊ"]}
    ],
    'ta': [
        {"title": "உயிரெழுத்துக்கள் அ ஆ இ", "emoji": "abc", "t1": "அ", "opts1": ["அ", "ஆ", "இ"], "q2": "___ ஆ இ — விடுபட்ட எழுத்து எது?", "t2": "அ", "opts2": ["அ", "க", "ச"]},
        {"title": "உயிரெழுத்துக்கள் ஈ உ ஊ", "emoji": "🅰️", "t1": "ஈ", "opts1": ["ஈ", "உ", "ஊ"], "q2": "___ உ ஊ — விடுபட்ட எழுத்து எது?", "t2": "ஈ", "opts2": ["ஈ", "அ", "ட"]},
        {"title": "மெய்யெழுத்துக்கள் க் ங ச் ஞ்", "emoji": "🅰️", "t1": "க்", "opts1": ["க்", "ங", "ச்"], "q2": "___ ங ச் ஞ் — விடுபட்ட எழுத்து எது?", "t2": "க்", "opts2": ["க்", "த்", "ப்"]},
        {"title": "மெய்யெழுத்துக்கள் ட் ண் த் ந்", "emoji": "✏️", "t1": "ட்", "opts1": ["ட்", "ண்", "த்"], "q2": "___ ண் த் ந் — விடுபட்ட எழுத்து எது?", "t2": "ட்", "opts2": ["ட்", "ம்", "ய்"]},
        {"title": "மெய்யெழுத்துக்கள் ப் ம் ய் ர்", "emoji": "🎯", "t1": "ப்", "opts1": ["ப்", "ம்", "ய்"], "q2": "___ ம் ய் ர் — விடுபட்ட எழுத்து எது?", "t2": "ப்", "opts2": ["ப்", "ல்", "வ்"]},
        {"title": "மெய்யெழுத்துக்கள் ல் வ் ழ் ள்", "emoji": "abc", "t1": "ல்", "opts1": ["ல்", "வ்", "ழ்"], "q2": "___ வ் ழ் ள் — விடுபட்ட எழுத்து எது?", "t2": "ல்", "opts2": ["ல்", "ற்", "ன்"]},
        {"title": "மெய்யெழுத்துக்கள் ற் ன்", "emoji": "📖", "t1": "ற்", "opts1": ["ற்", "ன்", "க்"], "q2": "___ ன் — விடுபட்ட எழுத்து எது?", "t2": "ற்", "opts2": ["ற்", "ச்", "த்"]},
        {"title": "உயிர்மெய் எழுத்துக்கள் க ச", "emoji": "🎯", "t1": "க", "opts1": ["க", "ச", "ட"], "q2": "___ ச — விடுபட்ட எழுத்து எது?", "t2": "க", "opts2": ["க", "த", "ப"]},
        {"title": "எழுத்துக்கள் திருப்புதல்", "emoji": "🏆", "t1": "அ", "opts1": ["அ", "ஆ", "இ"], "q2": "அ ___ இ — விடுபட்ட எழுத்து எது?", "t2": "ஆ", "opts2": ["ஆ", "உ", "ஊ"]}
    ]
}

# The remaining Beginner lessons from Lesson 10 onwards (teaching simple 2-letter and 3-letter words)
BEG_WORD_BLUEPRINTS = [
    # 2-Letter Words
    {"concept": "2-Letter Words: at, am", "text": "at", "emoji": "🐈", "context": "Read: cat is at home"},
    {"concept": "2-Letter Words: in, it", "text": "in", "emoji": "📥", "context": "Read: in the box"},
    {"concept": "2-Letter Words: on, go", "text": "on", "emoji": "🔛", "context": "Read: go on the road"},
    {"concept": "2-Letter Words: up, no", "text": "up", "emoji": "⬆️", "context": "Read: stand up now"},
    {"concept": "2-Letter Words Review", "text": "go", "emoji": "🔄", "context": "Reading simple 2-letter terms"},
    
    # 3-Letter CVC Words
    {"concept": "3-Letter Word: cat", "text": "cat", "emoji": "🐱", "context": "Identify the pet animal"},
    {"concept": "3-Letter Word: dog", "text": "dog", "emoji": "🐶", "context": "Identify the guard dog"},
    {"concept": "3-Letter Word: pen", "text": "pen", "emoji": "🖊️", "context": "Identify the writing tool"},
    {"concept": "3-Letter Word: bus", "text": "bus", "emoji": "🚌", "context": "Identify the transit vehicle"},
    {"concept": "3-Letter Word: cup", "text": "cup", "emoji": "🥛", "context": "Identify the drinking glass"},
    {"concept": "3-Letter Word: sun", "text": "sun", "emoji": "☀️", "context": "Identify the morning sky sun"},
    {"concept": "3-Letter Words Review", "text": "run", "emoji": "🔄", "context": "Reading basic 3-letter nouns"},
    
    # Simple Objects & Numbers
    {"concept": "Simple Nouns: home", "text": "home", "emoji": "🏠", "context": "Identify the place we live"},
    {"concept": "Simple Nouns: food", "text": "food", "emoji": "🍲", "context": "Identify the daily meals"},
    {"concept": "Simple Nouns: shop", "text": "shop", "emoji": "🏪", "context": "Identify the grocery store"},
    {"concept": "Simple Nouns: road", "text": "road", "emoji": "🛣️", "context": "Identify the public transit road"},
    {"concept": "Simple Verbs: walk", "text": "walk", "emoji": "🚶", "context": "Identify the walking action"},
    {"concept": "Simple Verbs: stop", "text": "stop", "emoji": "🛑", "context": "Identify the red traffic sign"},
    {"concept": "Numbers: 1, 2, 3", "text": "1 2 3", "emoji": "🔢", "context": "Read counting numbers"},
    {"concept": "Numbers: 4, 5, 6", "text": "4 5 6", "emoji": "🔢", "context": "Read counting numbers"}
]

# Simple word translations for Hindi, Kannada, Tamil
WORD_TRANSLATIONS = {
    'hi': {
        "at": "पर", "in": "में", "on": "पर", "go": "जाओ", "up": "ऊपर", "no": "नहीं",
        "cat": "बिल्ली", "dog": "कुत्ता", "pen": "कलम", "bus": "बस", "cup": "कप", "sun": "सूरज", "run": "दौड़",
        "home": "घर", "food": "खाना", "shop": "दुकान", "road": "सड़क", "walk": "चलो", "stop": "रुको",
        "1 2 3": "१ २ ३", "4 5 6": "४ ५ ६", "hello": "नमस्ते"
    },
    'kn': {
        "at": "ನಲ್ಲಿ", "in": "ಒಳಗೆ", "on": "ಮೇಲೆ", "go": "ಹೋಗು", "up": "ಮೇಲೆ", "no": "ಇಲ್ಲ",
        "cat": "ಬೆಕ್ಕು", "dog": "ನಾಯಿ", "pen": "ಪೇನಾ", "bus": "ಬಸ್", "cup": "ಕಪ್", "sun": "ಸೂರ್ಯ", "run": "ಓಡು",
        "home": "ಮನೆ", "food": "ಊಟ", "shop": "ಅಂಗಡಿ", "road": "ರಸ್ತೆ", "walk": "ನಡೆ", "stop": "ನಿಲ್ಲಿಸು",
        "1 2 3": "೧ ೨ ೩", "4 5 6": "೪ ೫ ೬", "hello": "ನಮಸ್ಕಾರ"
    },
    'ta': {
        "at": "இல்", "in": "உள்ளே", "on": "மேலே", "go": "போ", "up": "மேலே", "no": "இல்லை",
        "cat": "பூனை", "dog": "நாய்", "pen": "பேனா", "bus": "பேருந்து", "cup": "கப்", "sun": "சூரியன்", "run": "ஓடு",
        "home": "வீடு", "food": "உணவு", "shop": "கடை", "road": "சாலை", "walk": "நடை", "stop": "நில்",
        "1 2 3": "1 2 3", "4 5 6": "4 5 6", "hello": "வணக்கம்"
    }
}

# Blueprints for Intermediate and Advanced levels
BLUEPRINTS = {
    'intermediate': [
        {"concept": "Sight Words: the, is", "text": "The bus is here.", "emoji": "🚌", "context": "Reading transit announcements"},
        {"concept": "Sight Words: this, that", "text": "This is my home.", "emoji": "🏠", "context": "Pointing to address boards"},
        {"concept": "Action Verbs", "text": "Walk on the road.", "emoji": "🚶", "context": "Following street path rules"},
        {"concept": "Essential Descriptors", "text": "The milk is hot.", "emoji": "🥛", "context": "Daily kitchen cooking alerts"},
        {"concept": "Size Adjectives", "text": "This is a big shop.", "emoji": "🏪", "context": "Identifying marketplace sizes"},
        {"concept": "Reading Transit Boards", "text": "Route city center", "emoji": "🚌", "context": "Selecting the correct bus trip"},
        {"concept": "Reading Bills", "text": "Grocery bill slip", "emoji": "🧾", "context": "Verifying purchase receipt costs"},
        {"concept": "Medical Labels", "text": "Take pill daily", "emoji": "💊", "context": "Taking daily doctor dose safely"},
        {"concept": "Expiry Dates check", "text": "EXP 12/28 date", "emoji": "📅", "context": "Inspecting food safety dates"},
        {"concept": "Reading Calendar Days", "text": "Monday is holiday", "emoji": "📅", "context": "Planning weekly schedules"},
        {"concept": "Public Safety Signs", "text": "Emergency EXIT door", "emoji": "🚪", "context": "Locating emergency exit gates"},
        {"concept": "Counting Currency", "text": "Pay fifty rupees", "emoji": "💵", "context": "Paying correct retail cashier change"},
        {"concept": "Public Banners", "text": "Public Hospital clinic", "emoji": "🩺", "context": "Locating health clinic entries"},
        {"concept": "Reading SMS Alerts", "text": "Your package is ready", "emoji": "💬", "context": "Reading mobile delivery texts"},
        {"concept": "Reading Directions", "text": "Turn left arrow", "emoji": "⬅️", "context": "Navigating street guide signs"},
        {"concept": "Filling Forms", "text": "Enter name surname", "emoji": "✍️", "context": "Filling simple clinic forms"},
        {"concept": "Weather Reports", "text": "Today heavy rain", "emoji": "🌧️", "context": "Checking daily weather updates"},
        {"concept": "Leaving Notes", "text": "I am at the shop", "emoji": "📝", "context": "Writing family household alerts"},
        {"concept": "App Buttons", "text": "Tap SUBMIT button", "emoji": "✔️", "context": "Confirming mobile app details"},
        {"concept": "Saving Numbers", "text": "Save phone contact", "emoji": "📞", "context": "Adding family phone contacts"},
        {"concept": "Receipt Totals", "text": "Verify receipt total", "emoji": "🧾", "context": "Checking final billing printouts"},
        {"concept": "Asking Directions", "text": "Where is the post office?", "emoji": "❓", "context": "Asking neighborhood directions"},
        {"concept": "Medicine Instructions", "text": "Keep in cool place", "emoji": "💊", "context": "Storing medicines correctly"},
        {"concept": "Transit Timings", "text": "Bus departs at 10 AM", "emoji": "🚌", "context": "Timing the morning bus"},
        {"concept": "Address details", "text": "Save home pincode", "emoji": "🏠", "context": "Typing address details correctly"},
        {"concept": "Ration Allocations", "text": "Check grain allowance", "emoji": "🌾", "context": "Checking ration shop board list"},
        {"concept": "Digital Keyboard", "text": "Type alphabet code", "emoji": "⌨️", "context": "Using touch screen keypads"},
        {"concept": "ATM Cash Alerts", "text": "ATM Cash withdrawal", "emoji": "🏧", "context": "Checking ATM transaction slips"},
        {"concept": "Utility app check", "text": "Pay electric bill", "emoji": "⚡", "context": "Paying local electric bill app"},
        {"concept": "Intermediate Review", "text": "Review all intermediate concepts", "emoji": "🔄", "context": "Milestone assessment checkup"}
    ],
    'advanced': [
        {
            "concept": "Story Elements",
            "text": "Story Elements",
            "emoji": "📖",
            "context": "Stories & Literature: Characters, Setting, Plot",
            "type": "storyboard_story",
        },
        {
            "concept": "Main Idea & Details",
            "text": "Main Idea & Details",
            "emoji": "💡",
            "context": "Find the main idea and key details",
            "type": "default",
        },
        {
            "concept": "Making Inferences",
            "text": "Making Inferences",
            "emoji": "🔍",
            "context": "Read between the lines",
            "type": "default",
        },
        {
            "concept": "Context Clues",
            "text": "Context Clues",
            "emoji": "🧩",
            "context": "Guess the meaning of words",
            "type": "default",
        },
        {
            "concept": "Cause and Effect",
            "text": "Cause and Effect",
            "emoji": "🔗",
            "context": "Understand why things happen",
            "type": "default",
        },
        {
            "concept": "Sequencing Events",
            "text": "Sequencing Events",
            "emoji": "🔢",
            "context": "Put events in the right order",
            "type": "default",
        },
        {
            "concept": "Compare and Contrast",
            "text": "Compare and Contrast",
            "emoji": "⚖️",
            "context": "Find similarities and differences",
            "type": "default",
        },
        {
            "concept": "Fact and Opinion",
            "text": "Fact and Opinion",
            "emoji": "🗣️",
            "context": "Know the difference",
            "type": "default",
        },
        {
            "concept": "Vocabulary in Context",
            "text": "Vocabulary in Context",
            "emoji": "Aa",
            "context": "Use new words in context",
            "type": "default",
        },
        {
            "concept": "Author's Purpose",
            "text": "Author's Purpose",
            "emoji": "🎯",
            "context": "Why did the author write this?",
            "type": "default",
        },
        # 10 More Advanced Lesson Ideas
        {
            "concept": "Summarizing",
            "text": "Summarizing",
            "emoji": "📝",
            "context": "Identify core summaries",
            "type": "default",
        },
        {
            "concept": "Drawing Conclusions",
            "text": "Drawing Conclusions",
            "emoji": "💡",
            "context": "Make judgements based on facts",
            "type": "default",
        },
        {
            "concept": "Point of View",
            "text": "Point of View",
            "emoji": "👁️",
            "context": "Understand who is speaking",
            "type": "default",
        },
        {
            "concept": "Theme",
            "text": "Theme",
            "emoji": "🎭",
            "context": "Discover the main message",
            "type": "default",
        },
        {
            "concept": "Figurative Language",
            "text": "Figurative Language",
            "emoji": "✨",
            "context": "Understand metaphors and similes",
            "type": "default",
        },
        {
            "concept": "Advertisement Analysis",
            "text": "Advertisement Analysis",
            "emoji": "📢",
            "context": "Evaluate ads and promotions",
            "type": "default",
        },
        {
            "concept": "Letter & Email Writing",
            "text": "Letter & Email Writing",
            "emoji": "✉️",
            "context": "Write formal letters and applications",
            "type": "letter_drafting",
        },
        {
            "concept": "Debate & Discussion",
            "text": "Debate & Discussion",
            "emoji": "💬",
            "context": "Daily Communication & Conversation Practice",
            "type": "conversation_chat",
        },
        {
            "concept": "Essay Writing",
            "text": "Essay Writing",
            "emoji": "📝",
            "context": "Write structured and impressive essays",
            "type": "essay_planning",
        },
        {
            "concept": "Critical Thinking Puzzles",
            "text": "Critical Thinking Puzzles",
            "emoji": "🧩",
            "context": "Solve advanced comprehension puzzles",
            "type": "default",
        }
    ]
}

NATIVE_INTERMEDIATE_ADVANCED_TRANSLATIONS = {
    'hi': {
        'The bus is here.': "बस यहाँ है।", 'This is my home.': "यह मेरा घर है।", 'Walk on the road.': "सड़क पर चलें।",
        'The milk is hot.': "दूध गर्म है।", 'This is a big shop.': "यह एक बड़ी दुकान है।", 'Route city center': "शहर का केंद्र मार्ग",
        'Grocery bill slip': "किराने का बिल", 'Take pill daily': "रोजाना एक गोली लें", 'EXP 12/28 date': "समाप्ति तिथि 12/28",
        'Monday is holiday': "सोमवार को छुट्टी है", 'Emergency EXIT door': "आपातकालीन निकास द्वार", 'Pay fifty rupees': "पचास रुपये का भुगतान करें",
        'Public Hospital clinic': "सरकारी अस्पताल क्लिनिक", 'Your package is ready': "आपका पार्सल तैयार है", 'Turn left arrow': "बाएं मुड़ें",
        'Enter name surname': "नाम और उपनाम दर्ज करें", 'Today heavy rain': "आज भारी बारिश", 'I am at the shop': "मैं दुकान पर हूँ",
        'Tap SUBMIT button': "सबमिट बटन दबाएं", 'Save phone contact': "फ़ोन नंबर सहेजें", 'Verify receipt total': "रसीद का योग जांचें",
        'Where is the post office?': "डाकघर कहाँ है?", 'Keep in cool place': "ठंडे स्थान पर रखें", 'Bus departs at 10 AM': "बस सुबह 10 बजे रवाना होती है",
        'Save home pincode': "घर का पिनकोड सहेजें", 'Check grain allowance': "अनाज का आवंटन जांचें", 'Type alphabet code': "वर्णमाला कोड टाइप करें",
        'ATM Cash withdrawal': "एटीएम से नकद निकासी", 'Pay electric bill': "बिजली बिल का भुगतान करें", 'Review all intermediate concepts': "सभी मध्यवर्ती अवधारणाओं की समीक्षा करें",
        'Heavy rain alert in city': "शहर में भारी बारिश की चेतावनी", 'Request leave for sickness': "बीमारी के लिए छुट्टी का अनुरोध",
        'Enter Aadhaar card number': "आधार कार्ड नंबर दर्ज करें", 'Open bank savings account': "बैंक बचत खाता खोलें",
        'Account ledger statements': "खाता विवरण", 'Select language and cash amount': "भाषा और नकद राशि चुनें",
        'Never share secret bank PIN': "गुप्त बैंक पिन कभी साझा न करें", 'Check electricity usage total': "बिजली उपयोग की कुल जांच करें",
        'Verify one time password code': "वन टाइम पासवर्ड कोड सत्यापित करें", 'Avoid lottery prize scams': "लॉटरी पुरस्कार घोटालों से बचें",
        'Scan merchant store UPI code': "दुकानदार का यूपीआई कोड स्कैन करें", 'Deny micro contacts storage access': "संपर्क फ़ोल्डर तक पहुंच अस्वीकार करें",
        'Call emergency ambulance helpline': "आपातकालीन एम्बुलेंस हेल्पलाइन पर कॉल करें", 'Book clinic consultation slot': "डॉक्टर से मिलने का समय बुक करें",
        'Old age pension support application': "वृद्धावस्था पेंशन सहायता आवेदन", 'Verify birth date address proofs': "जन्म तिथि और पते के प्रमाण सत्यापित करें",
        'Fill post office deposit slips': "डाकघर जमा पर्ची भरें", 'Write status reports to manager': "मैनेजर को कार्य रिपोर्ट भेजें",
        'Write local feedback notices': "स्थानीय फीडबैक रिपोर्ट लिखें", 'Search map route to hospital': "अस्पताल का मार्ग मानचित्र पर खोजें",
        'Book gas cylinder delivery': "गैस सिलेंडर की बुकिंग करें", 'List experience and qualifications': "अनुभव और योग्यता सूचीबद्ध करें",
        'Practice personal career summary': "व्यक्तिगत परिचय का अभ्यास करें", 'Apply for digital ration cards': "डिजिटल राशन कार्ड के लिए आवेदन करें",
        'Check monthly rent lease terms': "मासिक किराया अनुबंध जांचें", 'Compare bank credit interest rates': "बैंक ब्याज दरों की तुलना करें",
        'Change UPI banking PIN weekly': "यूपीआई बैंकिंग पिन साप्ताहिक बदलें", 'Report community sanitation issues': "स्थानीय स्वच्छता समस्याओं की रिपोर्ट करें",
        'Use electronic signature keys': "इलेक्ट्रॉनिक हस्ताक्षर का उपयोग करें", 'Final certification exam summary': "अंतिम साक्षरता परीक्षा का सारांश"
    },
    'kn': {
        'The bus is here.': "ಬಸ್ ಇಲ್ಲಿದೆ.", 'This is my home.': "ಇದು ನನ್ನ ಮನೆ.", 'Walk on the road.': "ರಸ್ತೆಯಲ್ಲಿ ನಡೆಯಿರಿ.",
        'The milk is hot.': "ಹಾಲು ಬಿಸಿಯಾಗಿದೆ.", 'This is a big shop.': "ಇದು ದೊಡ್ಡ ಅಂಗಡಿ.", 'Route city center': "ನಗರ ಕೇಂದ್ರ ಮಾರ್ಗ",
        'Grocery bill slip': "ಕಿರಾಣಿ ಬಿಲ್", 'Take pill daily': "ಪ್ರತಿದಿನ ಒಂದು ಮಾತ್ರೆ ತೆಗೆದುಕೊಳ್ಳಿ", 'EXP 12/28 date': "ಮುಕ್ತಾಯ ದಿನಾಂಕ 12/28",
        'Monday is holiday': "ಸೋಮವಾರ ರಜೆ ಇದೆ", 'Emergency EXIT door': "ತುರ್ತು ನಿರ್ಗಮನ ದ್ವಾರ", 'Pay fifty rupees': "ಐವತ್ತು ರೂಪಾಯಿ ಪಾವತಿಸಿ",
        'Public Hospital clinic': "ಸರ್ಕಾರಿ ಆಸ್ಪತ್ರೆ ಕ್ಲಿನಿಕ್", 'Your package is ready': "ನಿಮ್ಮ ಪಾರ್ಸಲ್ ಸಿದ್ಧವಾಗಿದೆ", 'Turn left arrow': "ಎಡಕ್ಕೆ ತಿರುಗಿ",
        'Enter name surname': "ಹೆಸರು ಮತ್ತು ಉಪನಾಮವನ್ನು ನಮೂದಿಸಿ", 'Today heavy rain': "ಇಂದು ಭಾರಿ ಮಳೆ", 'I am at the shop': "ನಾನು ಅಂಗಡಿಯಲ್ಲಿದ್ದೇನೆ",
        'Tap SUBMIT button': "ಸಬ್ಮಿಟ್ ಬಟನ್ ಟ್ಯಾಪ್ ಮಾಡಿ", 'Save phone contact': "ಫೋನ್ ಸಂಖ್ಯೆ ಉಳಿಸಿ", 'Verify receipt total': "ರಶೀದಿ ಮೊತ್ತ ಪರಿಶೀಲಿಸಿ",
        'Where is the post office?': "ಅಂಚೆ ಕಚೇರಿ ಎಲ್ಲಿದೆ?", 'Keep in cool place': "ತಂಪಾದ ಸ್ಥಳದಲ್ಲಿ ಇರಿಸಿ", 'Bus departs at 10 AM': "ಬಸ್ ಬೆಳಿಗ್ಗೆ 10 ಕ್ಕೆ ಹೊರಡುತ್ತದೆ",
        'Save home pincode': "ಮನೆಯ ಪಿನಕೋಡ್ ಉಳಿಸಿ", 'Check grain allowance': "ಪಡಿತರ ಧಾನ್ಯ ಹಂಚಿಕೆ ಪರಿಶೀಲಿಸಿ", 'Type alphabet code': "ವರ್ಣಮಾಲೆ ಕೋಡ್ ಟೈಪ್ ಮಾಡಿ",
        'ATM Cash withdrawal': "ಎಟಿಎಂನಿಂದ ನಗದು ಹಿಂಪಡೆಯುವಿಕೆ", 'Pay electric bill': "ವಿದ್ಯುತ್ ಬಿಲ್ ಪಾವತಿಸಿ", 'Review all intermediate concepts': "ಎಲ್ಲಾ ಮಧ್ಯಂತರ ಪರಿಕಲ್ಪನೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ",
        'Heavy rain alert in city': "ನಗರದಲ್ಲಿ ಭಾರಿ ಮಳೆ ಎಚ್ಚರಿಕೆ", 'Request leave for sickness': "ಅನಾರೋಗ್ಯದ ರಜೆಗಾಗಿ ವಿನಂತಿ",
        'Enter Aadhaar card number': "ಆಧಾರ್ ಕಾರ್ಡ್ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ", 'Open bank savings account': "ಬ್ಯಾಂಕ್ ಉಳಿತಾಯ ಖಾತೆ ತೆರೆಯಿರಿ",
        'Account ledger statements': "ಖಾತೆ ವಿವರಗಳು", 'Select language and cash amount': "ಭಾಷೆ ಮತ್ತು ನಗದು ಮೊತ್ತವನ್ನು ಆರಿಸಿ",
        'Never share secret bank PIN': "ರಹಸ್ಯ ಬ್ಯಾಂಕ್ ಪಿನ್ ಹಂಚಿಕೊಳ್ಳಬೇಡಿ", 'Check electricity usage total': "ಒಟ್ಟು ವಿದ್ಯುತ್ ಬಳಕೆಯನ್ನು ಪರಿಶೀಲಿಸಿ",
        'Verify one time password code': "ಒನ್ ಟೈಮ್ ಪಾಸ್‌ವರ್ಡ್ ಪರಿಶೀಲಿಸಿ", 'Avoid lottery prize scams': "ಲಾಟರಿ ವಂಚನೆಗಳಿಂದ ದೂರವಿರಿ",
        'Scan merchant store UPI code': "ಅಂಗಡಿಯವರ ಯುಪಿಐ ಕೋಡ್ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ", 'Deny micro contacts storage access': "ಸಂಪರ್ಕ ಫೋಲ್ಡರ್ ಪ್ರವೇಶ ನಿರಾಕರಿಸಿ",
        'Call emergency ambulance helpline': "ತುರ್ತು ಆಂಬ್ಯುಲೆನ್ಸ್ ಸಹಾಯವಾಣಿಗೆ ಕರೆ ಮಾಡಿ", 'Book clinic consultation slot': "ವೈದ್ಯರ ಭೇಟಿ ಸಮಯ ಕಾಯ್ದಿರಿಸಿ",
        'Old age pension support application': "ವೃದ್ಧಾಪ್ಯ ವೇತನ ಸಹಾಯ ಧನ ಅರ್ಜಿ", 'Verify birth date address proofs': "ಹುಟ್ಟಿದ ದಿನಾಂಕ ಮತ್ತು ವಿಳಾಸ ಪುರಾವೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ",
        'Fill post office deposit slips': "ಅಂಚೆ ಕಚೇರಿ ಠೇವಣಿ ಚೀಟಿ ತುಂಬಿ", 'Write status reports to manager': "ಮ್ಯಾನೇಜರ್ ಗೆ ಕಾರ್ಯ ವರದಿ ಕಳುಹಿಸಿ",
        'Write local feedback notices': "ಸ್ಥಳೀಯ ಫೀಡ್ಬ್ಯಾಕ್ ವರದಿ ಬರೆಯಿರಿ", 'Search map route to hospital': "ಆಸ್ಪತ್ರೆ ಮಾರ್ಗವನ್ನು ನಕ್ಷೆಯಲ್ಲಿ ಹುಡುಕಿ",
        'Book gas cylinder delivery': "ಗ್ಯಾಸ್ ಸಿಲಿಂಡರ್ ಬುಕ್ಕಿಂಗ್ ಮಾಡಿ", 'List experience and qualifications': "ಅನುಭವ ಮತ್ತು ಅರ್ಹತೆಗಳನ್ನು ಪಟ್ಟಿ ಮಾಡಿ",
        'Practice personal career summary': "ವೈಯಕ್ತಿಕ ಪರಿಚಯವನ್ನು ಅಭ್ಯಾಸ ಮಾಡಿ", 'Apply for digital ration cards': "ಡಿಜಿಟಲ್ ರೇಷನ್ ಕಾರ್ಡ್ ಗೆ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ",
        'Check monthly rent lease terms': "ಮಾಸಿಕ ಬಾಡಿಗೆ ಒಪ್ಪಂದ ಪರಿಶೀಲಿಸಿ", 'Compare bank credit interest rates': "ಬ್ಯಾಂಕ್ ಬಡ್ಡಿ ದರಗಳನ್ನು ಹೋಲಿಸಿ",
        'Change UPI banking PIN weekly': "ಯುಪಿಐ ಬ್ಯಾಂಕಿಂಗ್ ಪಿನ್ ವಾರಕ್ಕೊಮ್ಮೆ ಬದಲಾಯಿಸಿ", 'Report community sanitation issues': "ಸ್ಥಳೀಯ ನೈರ್ಮಲ್ಯ ಸಮಸ್ಯೆಗಳನ್ನು ವರದಿ ಮಾಡಿ",
        'Use electronic signature keys': "ಎಲೆಕ್ಟ್ರಾನಿಕ್ ಸಹಿಯನ್ನು ಬಳಸಿ", 'Final certification exam summary': "ಅಂತಿಮ ಸಾಕ್ಷರತೆ ಪರೀಕ್ಷೆಯ ಸಾರಾಂಶ"
    },
    'ta': {
        'The bus is here.': "பேருந்து இங்கே உள்ளது.", 'This is my home.': "இது என் வீடு.", 'Walk on the road.': "சாலையில் நடக்கவும்.",
        'The milk is hot.': "பால் சூடாக இருக்கிறது.", 'This is a big shop.': "இது ஒரு பெரிய கடை.", 'Route city center': "நகர மைய வழி",
        'Grocery bill slip': "மளிகைக் கடை பில்", 'Take pill daily': "தினமும் ஒரு மாத்திரை எடுக்கவும்", 'EXP 12/28 date': "காலாவதி தேதி 12/28",
        'Monday is holiday': "திங்கட்கிழமை விடுமுறை", 'Emergency EXIT door': "அவசரகால வெளியேறும் கதவு", 'Pay fifty rupees': "ஐம்பது ரூபாய் செலுத்தவும்",
        'Public Hospital clinic': "அரசு மருத்துவமனை கிளினிக்", 'Your package is ready': "உங்கள் பார்சல் தயாராக உள்ளது", 'Turn left arrow': "இடப்பக்கம் திரும்பவும்",
        'Enter name surname': "பெயர் மற்றும் குடும்பப்பெயரை உள்ளிடவும்", 'Today heavy rain': "இன்று கனமழை", 'I am at the shop': "நான் கடையில் இருக்கிறேன்",
        'Tap SUBMIT button': "சமர்ப்பி பொத்தானைத் தட்டவும்", 'Save phone contact': "தொலைபேசி எண்ணைச் சேமிக்கவும்", 'Verify receipt total': "ரசீது தொகையைச் சரிபார்க்கவும்",
        'Where is the post office?': "தபால் நிலையம் எங்கே உள்ளது?", 'Keep in cool place': "குளிர்ந்த இடத்தில் வைக்கவும்", 'Bus departs at 10 AM': "பேருந்து காலை 10 மணிக்கு புறப்படும்",
        'Save home pincode': "வீட்டு பின்கோட்டை சேமிக்கவும்", 'Check grain allowance': "தானிய ஒதுக்கீட்டை சரிபார்க்கவும்", 'Type alphabet code': "குறியீட்டை தட்டச்சு செய்யவும்",
        'ATM Cash withdrawal': "ஏடிஎம் பணம் எடுப்பு", 'Pay electric bill': "மின்சாரக் கட்டணம் செலுத்தவும்", 'Review all intermediate concepts': "அனைத்து இடைநிலைக் கருத்துக்களையும் மதிப்பாய்வு செய்யவும்",
        'Heavy rain alert in city': "நகரில் கனமழை எச்சரிக்கை", 'Request leave for sickness': "நோய் விடுப்பு விண்ணப்பம்",
        'Enter Aadhaar card number': "ஆதார் அட்டை எண்ணை உள்ளிடவும்", 'Open bank savings account': "வங்கி சேமிப்புக் கணக்கு தொடங்கவும்",
        'Account ledger statements': "கணக்கு அறிக்கை", 'Select language and cash amount': "மொழி மற்றும் பணத் தொகையைத் தேர்ந்தெடுக்கவும்",
        'Never share secret bank PIN': "ரகசிய வங்கி பின் எண்ணை பகிர வேண்டாம்", 'Check electricity usage total': "மின்சாரப் பயன்பாட்டு அளவைச் சரிபார்க்கவும்",
        'Verify one time password code': "ஒரு முறை கடவுச்சொல்லை சரிபார்க்கவும்", 'Avoid lottery prize scams': "லாட்டரி மோசடிகளில் இருந்து விலகி இருங்கள்",
        'Scan merchant store UPI code': "கடைக்காரரின் யுபிஐ குறியீட்டை ஸ்கேன் செய்யவும்", 'Deny micro contacts storage access': "தொடர்பு கோப்பு அணுகலை மறுக்கவும்",
        'Call emergency ambulance helpline': "அவசர ஆம்புலன்ஸ் உதவி எண்ணை அழைக்கவும்", 'Book clinic consultation slot': "மருத்துவர் சந்திப்பு நேரத்தை முன்பதிவு செய்யவும்",
        'Old age pension support application': "முதியோர் ஓய்வூதிய உதவித் தொகை விண்ணப்பம்", 'Verify birth date address proofs': "பிறந்த தேதி மற்றும் முகவரிச் சான்றுகளைச் சரிபார்க்கவும்",
        'Fill post office deposit slips': "தபால் நிலைய வைப்புப் படிவத்தை நிரப்பவும்", 'Write status reports to manager': "மேலாளருக்கு பணி அறிக்கையை அனுப்பவும்",
        'Write local feedback notices': "உள்ளூர் பின்னூட்ட அறிக்கையை எழுதவும்", 'Search map route to hospital': "மருத்துவமனைக்கான வழியை வரைபடத்தில் தேடவும்",
        'Book gas cylinder delivery': "கேஸ் சிலிண்டர் முன்பதிவு செய்யவும்", 'List experience and qualifications': "அனுபவம் மற்றும் தகுதிகளைப் பட்டியலிடவும்",
        'Practice personal career summary': "சுய அறிமுகத்தைப் பயிற்சி செய்யவும்", 'Apply for digital ration cards': "டிஜிட்டல் ரேஷன் கார்டுக்கு விண்ணப்பிக்கவும்",
        'Check monthly rent lease terms': "மாதாந்திர வாடகை ஒப்பந்தத்தை சரிபார்க்கவும்", 'Compare bank credit interest rates': "வங்கி வட்டி விகிதங்களை ஒப்பிடவும்",
        'Change UPI banking PIN weekly': "யுபிஐ வங்கி பின்னை வாரத்திற்கு ஒருமுறை மாற்றவும்", 'Report community sanitation issues': "உள்ளூர் சுகாதாரப் பிரச்சினைகளைப் புகாரளிக்கவும்",
        'Use electronic signature keys': "மின்னணு கையொப்பத்தைப் பயன்படுத்தவும்", 'Final certification exam summary': "இறுதி எழுத்தறிவுத் தேர்வு சுருக்கம்"
    }
}


class Command(BaseCommand):
    help = 'Seeds grouped alphabet lessons and simple CVC word lessons into the database'

    def handle(self, *args, **options):
        self.stdout.write('Wiping all user data from database to start fresh...')
        LearningPath.objects.all().delete()
        RewardProfile.objects.all().delete()
        LearnerAchievement.objects.all().delete()
        Achievement.objects.all().delete()
        StudySession.objects.all().delete()
        AssessmentResponse.objects.all().delete()
        AssessmentAttempt.objects.all().delete()
        SeenQuestion.objects.all().delete()
        SkillBreakdown.objects.all().delete()
        LiteracyProfile.objects.all().delete()
        Learner.objects.all().delete()

        self.stdout.write('Wiping old rich curriculum database items...')
        Lesson.objects.all().delete()

        seeded_count = 0

        # Seed lessons
        for lang in LANGS:
            # Beginner Lessons
            # 1 to 9: Alphabet groups
            alphabet_list = ALPHABET_GROUPS.get(lang, ALPHABET_GROUPS['en'])
            for idx, item in enumerate(alphabet_list, start=1):
                lesson_id = f"BEG-{lang.upper()}-{idx:03d}"
                prereq = f"BEG-{lang.upper()}-{idx-1:03d}" if idx > 1 else None

                explore_step = {
                    'type': 'audio_match',
                    'question': "Tap the letter you hear",
                    'target': item['t1'],
                    'options': item['opts1'],
                    'hint': f"Listen for: {item['t1']}"
                }

                practice_step = {
                    'type': 'missing_letter',
                    'question': item['q2'],
                    'target': item['t2'],
                    'options': item['opts2'],
                    'hint': f"Find the missing character"
                }

                # We store them in activities array for frontend mapping
                Lesson.objects.create(
                    lesson_id=lesson_id,
                    title=item['title'],
                    module='Alphabet Basics',
                    difficulty='beginner',
                    skill='letter_recognition',
                    language=lang,
                    estimated_time=5,
                    order_in_level=idx,
                    prerequisite_id=prereq,

                    concept_intro=f"Learn grouping: {item['title']}",
                    real_life_context="Recognizing alphabet letters in sequence",
                    image_visual=item['emoji'],
                    activities=[explore_step, practice_step],
                    mini_game={},
                    quiz_bank=[],
                    reward_xp=10 if idx % 2 != 0 else 15,
                    reward_stars=3,
                    reward_coins=2,
                    badge_code=f"badge_beg_{lang}_{idx}",
                    encouragement_template="Brilliant!",
                    improvement_tip="Perfect letters recognition!"
                )
                seeded_count += 1

            # 10 to 30: 2-Letter and 3-Letter Words
            for idx, bp in enumerate(BEG_WORD_BLUEPRINTS, start=10):
                lesson_id = f"BEG-{lang.upper()}-{idx:03d}"
                prereq = f"BEG-{lang.upper()}-{idx-1:03d}"

                english_text = bp['text']
                target_word = WORD_TRANSLATIONS.get(lang, {}).get(english_text, english_text) if lang != 'en' else english_text
                concept_name = bp['concept']
                target_emoji = bp['emoji']
                real_context = bp['context']

                trans = TRANSLATIONS[lang]

                explore_step = {
                    'type': 'explore',
                    'instruction': trans['explore'],
                    'concept': concept_name,
                    'visual': target_emoji,
                    'audio_narration': f"Observe: {target_word}"
                }

                learn_step = {
                    'type': 'learn',
                    'instruction': f"{trans['learn']} {concept_name}",
                    'explanation': f"The spelling represents {target_word}. Learn its shape.",
                    'visual': target_emoji
                }

                practice_step = {
                    'type': 'practice',
                    'instruction': f"{trans['practice']} {target_word}",
                    'voice_target': target_word
                }

                # Interactive game
                scrambled = list(target_word)
                random.shuffle(scrambled)
                game_step = {
                    'type': 'unscramble',
                    'instruction': "Unscramble the letters",
                    'word': target_word,
                    'letters': scrambled
                }

                # Quiz
                quiz_list = [
                    {
                        'level': 'recognition',
                        'question': f"Identify: {target_word}",
                        'options': [f"{target_emoji} {target_word}", "🍲 Food", "💧 Water", "💵 Money"],
                        'correct_index': 0,
                        'explanation': f"The correct card shows {target_word}."
                    },
                    {
                        'level': 'understanding',
                        'question': f"Select correct spelling representing: {target_word}",
                        'options': [target_word, "Water", "Home", "Shop"],
                        'correct_index': 0,
                        'explanation': f"Spelling matches {target_word}."
                    },
                    {
                        'level': 'application',
                        'question': f"Where is this applied: {real_context}?",
                        'options': [f"Identify {target_word} in texts", "Ignore it", "Ask helper", "Turn off"],
                        'correct_index': 0,
                        'explanation': f"Recognizing {target_word} helps in reading."
                    }
                ]

                Lesson.objects.create(
                    lesson_id=lesson_id,
                    title=f"Beginner Lesson {idx}: {concept_name}",
                    module='Simple Words',
                    difficulty='beginner',
                    skill='word_recognition',
                    language=lang,
                    estimated_time=5,
                    order_in_level=idx,
                    prerequisite_id=prereq,

                    concept_intro=f"Learn word: {target_word}",
                    real_life_context=real_context,
                    image_visual=target_emoji,
                    activities=[explore_step, learn_step, practice_step],
                    mini_game=game_step,
                    quiz_bank=quiz_list,
                    reward_xp=10,
                    reward_stars=3,
                    reward_coins=2,
                    badge_code=f"badge_beg_{lang}_{idx}",
                    encouragement_template="Great job!",
                    improvement_tip="Word recognized correctly!"
                )
                seeded_count += 1

            # Intermediate Lessons (Lessons 1-7 storyboard style)
            INTERMEDIATE_LESSONS_BLUEPRINT = [
                {
                    'id_num': 1,
                    'concept': 'Compound Words',
                    'title': 'Compound Words',
                    'visual': '🔗',
                    'subtitle': 'Welcome! In this lesson, you will learn how two small words can combine to make a new word with a new meaning.',
                    'objectives': ['Learn with examples', 'Listen and understand', 'Practice and earn XP'],
                    'def_title': 'What are Compound Words?',
                    'def_sub': 'Compound words are made by joining two small words to make a new word.',
                    'def_left': 'rain', 'def_right': 'bow', 'def_result': 'rainbow',
                    'def_left_emoji': 'rain', 'def_right_emoji': 'bow', 'def_result_emoji': 'rainbow',
                    'examples': [
                        {'left': 'sun', 'right': 'shine', 'result': 'sunshine', 'l_em': 'sun', 'r_em': 'shine', 'res_em': 'sunshine'},
                        {'left': 'tooth', 'right': 'brush', 'result': 'toothbrush', 'l_em': 'tooth', 'r_em': 'brush', 'res_em': 'toothbrush'},
                        {'left': 'butter', 'right': 'fly', 'result': 'butterfly', 'l_em': 'butter', 'r_em': 'fly', 'res_em': 'butterfly'},
                        {'left': 'sea', 'right': 'shell', 'result': 'seashell', 'l_em': 'sea', 'r_em': 'shell', 'res_em': 'seashell'}
                    ],
                    'listen_target': 'rainbow',
                    'q1': {'qText': 'Tap the correct compound word you hear.', 'target': 'notebook', 'options': ['snowman', 'notebook', 'basketball'], 'em': ['snowman', 'notebook', 'basketball']},
                    'q2': {'qText': 'Tap the correct compound word you hear.', 'target': 'raincoat', 'options': ['rainbow', 'raincoat', 'raindrop'], 'em': ['rainbow', 'raincoat', 'raindrop']},
                    'q3': {'qText': 'Tap the correct compound word you hear.', 'target': 'toothbrush', 'options': ['toothbrush', 'toothache', 'toothpaste'], 'em': ['toothbrush', 'toothache', 'toothpaste']},
                    'q4': {'qText': 'What is the missing word?', 'equation': 'butter + fly = _____', 'target': 'butterfly', 'options': ['button', 'butterfly', 'butterscotch']}
                },
                {
                    'id_num': 2,
                    'concept': 'Opposite Words',
                    'title': 'Opposite Words',
                    'visual': 'opp_arrows',
                    'subtitle': 'Welcome! Today we will learn words that have opposite meanings to help you compare things.',
                    'objectives': ['Understand opposites', 'Listen to opposite pairs', 'Answer practice questions'],
                    'def_title': 'What are Opposite Words?',
                    'def_sub': 'Opposite words are word pairs that have completely different meanings.',
                    'def_left': 'hot', 'def_right': 'cold', 'def_result': 'hot vs cold',
                    'def_left_emoji': 'hot', 'def_right_emoji': 'cold', 'def_result_emoji': 'hot',
                    'examples': [
                        {'left': 'big', 'right': 'small', 'result': 'big / small', 'l_em': 'big', 'r_em': 'small', 'res_em': 'big'},
                        {'left': 'up', 'right': 'down', 'result': 'up / down', 'l_em': 'up', 'r_em': 'down', 'res_em': 'up'},
                        {'left': 'heavy', 'right': 'light', 'result': 'heavy / light', 'l_em': 'heavy', 'r_em': 'light', 'res_em': 'heavy'},
                        {'left': 'happy', 'right': 'sad', 'result': 'happy / sad', 'l_em': 'happy', 'r_em': 'sad', 'res_em': 'happy'}
                    ],
                    'listen_target': 'cold',
                    'q1': {'qText': 'Tap the correct opposite word you hear.', 'target': 'small', 'options': ['big', 'small', 'heavy'], 'em': ['big', 'small', 'heavy']},
                    'q2': {'qText': 'Tap the correct opposite word you hear.', 'target': 'down', 'options': ['up', 'down', 'light'], 'em': ['up', 'down', 'light']},
                    'q3': {'qText': 'Tap the correct opposite word you hear.', 'target': 'sad', 'options': ['happy', 'sad', 'glad'], 'em': ['happy', 'sad', 'glad']},
                    'q4': {'qText': 'What is the missing word?', 'equation': 'hot vs _____ = opposites', 'target': 'cold', 'options': ['cold', 'warm', 'freeze']}
                },
                {
                    'id_num': 3,
                    'concept': 'Similar Meanings',
                    'title': 'Similar Meanings',
                    'visual': 'sim_arrows',
                    'subtitle': 'Welcome! In this lesson, we will learn different words that mean the exact same thing.',
                    'objectives': ['Identify synonyms', 'Listen and connect similar words', 'Verify spelling checks'],
                    'def_title': 'What are Similar Meanings?',
                    'def_sub': 'These are different words that have the same or very similar meaning.',
                    'def_left': 'happy', 'def_right': 'glad', 'def_result': 'happy = glad',
                    'def_left_emoji': 'happy', 'def_right_emoji': 'glad', 'def_result_emoji': 'happy',
                    'examples': [
                        {'left': 'big', 'right': 'large', 'result': 'big = large', 'l_em': 'big', 'r_em': 'large', 'res_em': 'big'},
                        {'left': 'start', 'right': 'begin', 'result': 'start = begin', 'l_em': 'start', 'r_em': 'begin', 'res_em': 'start'},
                        {'left': 'shut', 'right': 'close', 'result': 'shut = close', 'l_em': 'shut', 'r_em': 'close', 'res_em': 'shut'},
                        {'left': 'quick', 'right': 'fast', 'result': 'quick = fast', 'l_em': 'quick', 'r_em': 'fast', 'res_em': 'quick'}
                    ],
                    'listen_target': 'large',
                    'q1': {'qText': 'Tap the correct similar meaning word you hear.', 'target': 'glad', 'options': ['sad', 'glad', 'angry'], 'em': ['sad', 'glad', 'angry']},
                    'q2': {'qText': 'Tap the correct similar meaning word you hear.', 'target': 'begin', 'options': ['stop', 'begin', 'slow'], 'em': ['stop', 'begin', 'slow']},
                    'q3': {'qText': 'Tap the correct similar meaning word you hear.', 'target': 'close', 'options': ['open', 'close', 'wide'], 'em': ['open', 'close', 'wide']},
                    'q4': {'qText': 'What is the missing word?', 'equation': 'happy = _____', 'target': 'glad', 'options': ['sad', 'glad', 'mad']}
                },
                {
                    'id_num': 4,
                    'concept': 'Health Words',
                    'title': 'Health Words',
                    'visual': 'hospital',
                    'subtitle': 'Welcome! Today we will learn simple words used at doctors, clinics, and hospitals.',
                    'objectives': ['Recognize medical terms', 'Hear emergency instructions', 'Learn clinic word shapes'],
                    'def_title': 'What are Health Words?',
                    'def_sub': 'These are essential words used to describe health, sickness, and medical support.',
                    'def_left': 'doctor', 'def_right': 'help', 'def_result': 'doctor helps',
                    'def_left_emoji': 'doctor', 'def_right_emoji': 'help', 'def_result_emoji': 'doctor',
                    'examples': [
                        {'left': 'nurse', 'right': 'care', 'result': 'nurse cares', 'l_em': 'nurse', 'r_em': 'care', 'res_em': 'nurse'},
                        {'left': 'medicine', 'right': 'cure', 'result': 'medicine cures', 'l_em': 'medicine', 'r_em': 'cure', 'res_em': 'medicine'},
                        {'left': 'hospital', 'right': 'clinic', 'result': 'hospital clinic', 'l_em': 'hospital', 'r_em': 'clinic', 'res_em': 'hospital'},
                        {'left': 'health', 'right': 'strong', 'result': 'health is strength', 'l_em': 'health', 'r_em': 'strong', 'res_em': 'health'}
                    ],
                    'listen_target': 'medicine',
                    'q1': {'qText': 'Tap the correct health word you hear.', 'target': 'doctor', 'options': ['doctor', 'driver', 'farmer'], 'em': ['doctor', 'driver', 'farmer']},
                    'q2': {'qText': 'Tap the correct health word you hear.', 'target': 'nurse', 'options': ['nurse', 'teacher', 'builder'], 'em': ['nurse', 'teacher', 'builder']},
                    'q3': {'qText': 'Tap the correct health word you hear.', 'target': 'hospital', 'options': ['hospital', 'school', 'shop'], 'em': ['hospital', 'school', 'shop']},
                    'q4': {'qText': 'What is the missing word?', 'equation': 'cures sickness = _____', 'target': 'medicine', 'options': ['medicine', 'food', 'water']}
                },
                {
                    'id_num': 5,
                    'concept': 'Occupation Words',
                    'title': 'Occupation Words',
                    'visual': 'builder',
                    'subtitle': 'Welcome! In this lesson, we will learn about common jobs people do in the community.',
                    'objectives': ['Recognize jobs names', 'Connect occupations to tasks', 'Identify workplace words'],
                    'def_title': 'What are Occupation Words?',
                    'def_sub': 'Occupations describe the work, trades, and careers people practice.',
                    'def_left': 'teacher', 'def_right': 'teach', 'def_result': 'teacher teaches',
                    'def_left_emoji': 'teacher', 'def_right_emoji': 'teach', 'def_result_emoji': 'teacher',
                    'examples': [
                        {'left': 'builder', 'right': 'build', 'result': 'builder builds', 'l_em': 'builder', 'r_em': 'build', 'res_em': 'builder'},
                        {'left': 'driver', 'right': 'drive', 'result': 'driver drives', 'l_em': 'driver', 'r_em': 'drive', 'res_em': 'driver'},
                        {'left': 'farmer', 'right': 'grow', 'result': 'farmer grows', 'l_em': 'farmer', 'r_em': 'grow', 'res_em': 'farmer'},
                        {'left': 'tailor', 'right': 'sew', 'result': 'tailor sews', 'l_em': 'tailor', 'r_em': 'sew', 'res_em': 'tailor'}
                    ],
                    'listen_target': 'farmer',
                    'q1': {'qText': 'Tap the correct occupation word you hear.', 'target': 'builder', 'options': ['builder', 'doctor', 'nurse'], 'em': ['builder', 'doctor', 'nurse']},
                    'q2': {'qText': 'Tap the correct occupation word you hear.', 'target': 'driver', 'options': ['driver', 'teacher', 'tailor'], 'em': ['driver', 'teacher', 'tailor']},
                    'q3': {'qText': 'Tap the correct occupation word you hear.', 'target': 'farmer', 'options': ['farmer', 'police', 'cook'], 'em': ['farmer', 'police', 'cook']},
                    'q4': {'qText': 'What is the missing word?', 'equation': 'builds houses = _____', 'target': 'builder', 'options': ['builder', 'baker', 'butcher']}
                },
                {
                    'id_num': 6,
                    'concept': 'Time Expressions',
                    'title': 'Time Expressions',
                    'visual': 'watch',
                    'subtitle': 'Welcome! Today we will learn words to describe different parts of the day and night.',
                    'objectives': ['Understand times of day', 'Identify dawn and dusk words', 'Spelling checks for time'],
                    'def_title': 'What are Time Expressions?',
                    'def_sub': 'These are common words describing periods, hours, and sections of the daily cycle.',
                    'def_left': 'morning', 'def_right': 'start', 'def_result': 'morning starts day',
                    'def_left_emoji': 'morning', 'def_right_emoji': 'start', 'def_result_emoji': 'morning',
                    'examples': [
                        {'left': 'afternoon', 'right': 'midday', 'result': 'afternoon midday', 'l_em': 'afternoon', 'r_em': 'midday', 'res_em': 'afternoon'},
                        {'left': 'evening', 'right': 'sunset', 'result': 'evening sunset', 'l_em': 'evening', 'r_em': 'sunset', 'res_em': 'evening'},
                        {'left': 'night', 'right': 'stars', 'result': 'night stars time', 'l_em': 'night', 'r_em': 'stars', 'res_em': 'night'},
                        {'left': 'day', 'right': 'light', 'result': 'day has light', 'l_em': 'day', 'r_em': 'light', 'res_em': 'day'}
                    ],
                    'listen_target': 'morning',
                    'q1': {'qText': 'Tap the correct time word you hear.', 'target': 'evening', 'options': ['morning', 'afternoon', 'evening'], 'em': ['morning', 'afternoon', 'evening']},
                    'q2': {'qText': 'Tap the correct time word you hear.', 'target': 'night', 'options': ['day', 'night', 'noon'], 'em': ['day', 'night', 'noon']},
                    'q3': {'qText': 'Tap the correct time word you hear.', 'target': 'afternoon', 'options': ['morning', 'afternoon', 'night'], 'em': ['morning', 'afternoon', 'night']},
                    'q4': {'qText': 'What is the missing word?', 'equation': 'start of day = _____', 'target': 'morning', 'options': ['morning', 'evening', 'night']}
                },
                {
                    'id_num': 7,
                    'concept': 'Direction Words',
                    'title': 'Direction Words',
                    'visual': 'van',
                    'subtitle': 'Welcome! In this lesson, we will learn basic navigation terms to help you find paths and read signs.',
                    'objectives': ['Identify directions', 'Read left, right, straight guides', 'Earn navigation badge'],
                    'def_title': 'What are Direction Words?',
                    'def_sub': 'Direction words give guidance on positions, routes, and navigation turns.',
                    'def_left': 'left', 'def_right': 'turn', 'def_result': 'turn left',
                    'def_left_emoji': 'left', 'def_right_emoji': 'turn', 'def_result_emoji': 'left',
                    'examples': [
                        {'left': 'right', 'right': 'turn', 'result': 'turn right', 'l_em': 'right', 'r_em': 'turn', 'res_em': 'right'},
                        {'left': 'straight', 'right': 'path', 'result': 'go straight', 'l_em': 'straight', 'r_em': 'path', 'res_em': 'straight'},
                        {'left': 'back', 'right': 'return', 'result': 'go back', 'l_em': 'back', 'r_em': 'return', 'res_em': 'back'},
                        {'left': 'up', 'right': 'high', 'result': 'go up', 'l_em': 'up', 'r_em': 'high', 'res_em': 'up'}
                    ],
                    'listen_target': 'straight',
                    'q1': {'qText': 'Tap the correct direction word you hear.', 'target': 'left', 'options': ['left', 'right', 'straight'], 'em': ['left', 'right', 'straight']},
                    'q2': {'qText': 'Tap the correct direction word you hear.', 'target': 'right', 'options': ['left', 'right', 'back'], 'em': ['left', 'right', 'back']},
                    'q3': {'qText': 'Tap the correct direction word you hear.', 'target': 'straight', 'options': ['straight', 'back', 'stop'], 'em': ['straight', 'back', 'stop']},
                    'q4': {'qText': 'What is the missing word?', 'equation': 'opposite of left = _____', 'target': 'right', 'options': ['right', 'straight', 'back']}
                }
            ]

            INTERMEDIATE_TRANSLATIONS = {
                'hi': {
                    'Compound Words': 'संयुक्त शब्द',
                    'Opposite Words': 'विपरीत शब्द',
                    'Similar Meanings': 'समानार्थी शब्द',
                    'Health Words': 'स्वास्थ्य शब्द',
                    'Occupation Words': 'व्यवसाय शब्द',
                    'Time Expressions': 'समय अभिव्यक्ति',
                    'Direction Words': 'दिशा शब्द',
                    'Welcome! In this lesson, you will learn how two small words can combine to make a new word with a new meaning.': 'नमस्ते! इस पाठ में, आप सीखेंगे कि कैसे दो छोटे शब्द मिलकर एक नया अर्थपूर्ण शब्द बनाते हैं।',
                    'Welcome! Today we will learn words that have opposite meanings to help you compare things.': 'नमस्ते! आज हम विपरीत अर्थ वाले शब्द सीखेंगे जिससे आप चीजों की तुलना कर सकें।',
                    'Welcome! In this lesson, we will learn different words that mean the exact same thing.': 'नमस्ते! इस पाठ में, हम अलग-अलग शब्द सीखेंगे जिनका अर्थ बिल्कुल एक समान होता है।',
                    'Welcome! Today we will learn simple words used at doctors, clinics, and hospitals.': 'नमस्ते! आज हम डॉक्टर, क्लिनिक और अस्पतालों में उपयोग किए जाने वाले सरल शब्द सीखेंगे।',
                    'Welcome! In this lesson, we will learn about common jobs people do in the community.': 'नमस्ते! इस पाठ में, हम समाज में लोगों द्वारा किए जाने वाले सामान्य कार्यों के बारे में सीखेंगे।',
                    'Welcome! Today we will learn words to describe different parts of the day and night.': 'नमस्ते! आज हम दिन और रात के विभिन्न हिस्सों को दर्शाने वाले शब्द सीखेंगे।',
                    'Welcome! In this lesson, we will learn basic navigation terms to help you find paths and read signs.': 'नमस्ते! इस पाठ में, हम बुनियादी दिशा निर्देश शब्द सीखेंगे जो आपको रास्ता खोजने में मदद करेंगे।',
                    'What are Compound Words?': 'संयुक्त शब्द क्या हैं?',
                    'Compound words are made by joining two small words to make a new word.': 'दो छोटे शब्दों को जोड़कर एक नया शब्द बनाने से संयुक्त शब्द बनते हैं।',
                    'What are Opposite Words?': 'विपरीत शब्द क्या हैं?',
                    'Opposite words are word pairs that have completely different meanings.': 'विपरीत शब्द वे शब्द युग्म हैं जिनके अर्थ पूरी तरह से अलग होते हैं।',
                    'What are Similar Meanings?': 'समानार्थी शब्द क्या हैं?',
                    'These are different words that have the same or very similar meaning.': 'ये अलग-अलग शब्द हैं जिनका अर्थ एक समान या बहुत मिलता-जुलता होता है।',
                    'What are Health Words?': 'स्वास्थ्य शब्द क्या हैं?',
                    'These are essential words used to describe health, sickness, and medical support.': 'ये स्वास्थ्य, बीमारी और चिकित्सा सहायता को दर्शाने वाले महत्वपूर्ण शब्द हैं।',
                    'What are Occupation Words?': 'व्यवसाय शब्द क्या हैं?',
                    'Occupations describe the work, trades, and careers people practice.': 'व्यवसाय लोगों द्वारा किए जाने वाले काम, व्यापार और करियर को दर्शाते हैं।',
                    'What are Time Expressions?': 'समय अभिव्यक्ति क्या हैं?',
                    'These are common words describing periods, hours, and sections of the daily cycle.': 'ये दैनिक चक्र के हिस्सों, घंटों और समय अवधियों को दर्शाने वाले सामान्य शब्द हैं।',
                    'What are Direction Words?': 'दिशा शब्द क्या हैं?',
                    'Direction words give guidance on positions, routes, and navigation turns.': 'दिशा शब्द स्थिति, मार्ग और मोड़ों के बारे में मार्गदर्शन प्रदान करते हैं।',
                    'Tap the correct compound word you hear.': 'सुने गए सही संयुक्त शब्द पर टैप करें।',
                    'Tap the correct opposite word you hear.': 'सुने गए सही विपरीत शब्द पर टैप करें।',
                    'Tap the correct similar meaning word you hear.': 'सुने गए सही समानार्थी शब्द पर टैप करें।',
                    'Tap the correct health word you hear.': 'सुने गए सही स्वास्थ्य शब्द पर टैप करें।',
                    'Tap the correct occupation word you hear.': 'सुने गए सही व्यवसाय शब्द पर टैप करें।',
                    'Tap the correct time word you hear.': 'सुने गए सही समय शब्द पर टैप करें।',
                    'Tap the correct direction word you hear.': 'सुने गए सही दिशा शब्द पर टैप करें।',
                    'What is the missing word?': 'लापता शब्द क्या है?',
                    'Learn with examples': 'उदाहरणों से सीखें',
                    'Listen and understand': 'सुनें और समझें',
                    'Practice and earn XP': 'अभ्यास करें और XP अर्जित करें',
                    'Understand opposites': 'विपरीत अर्थ समझें',
                    'Listen to opposite pairs': 'विपरीत जोड़ियों को सुनें',
                    'Answer practice questions': 'अभ्यास प्रश्नों के उत्तर दें',
                    'Identify synonyms': 'समानार्थी शब्द पहचानें',
                    'Listen and connect similar words': 'समान शब्दों को सुनें और जोड़ें',
                    'Verify spelling checks': 'वर्तनी की जाँच करें',
                    'Recognize medical terms': 'चिकित्सा शब्दों को पहचानें',
                    'Hear emergency instructions': 'आपातकालीन निर्देश सुनें',
                    'Learn clinic word shapes': 'क्लिनिक शब्द रूपों को सीखें',
                    'Recognize jobs names': 'नौकरियों के नाम पहचानें',
                    'Connect occupations to tasks': 'व्यवसायों को कार्यों से जोड़ें',
                    'Identify workplace words': 'कार्यस्थल के शब्दों को पहचानें',
                    'Understand times of day': 'दिन के समय को समझें',
                    'Identify dawn and dusk words': 'सुबह और शाम के शब्दों को पहचानें',
                    'Spelling checks for time': 'समय के लिए वर्तनी की जाँच करें',
                    'Identify directions': 'दिशाओं की पहचान करें',
                    'Read left, right, straight guides': 'बाएँ, दाएँ, सीधे मार्गदर्शक पढ़ें',
                    'Earn navigation badge': 'दिशा सूचक बैज अर्जित करें',
                    'rain': 'बारिश', 'bow': 'धनुष', 'rainbow': 'इंद्रधनुष',
                    'sun': 'सूरज', 'shine': 'चमक', 'sunshine': 'धूप',
                    'tooth': 'दांत', 'brush': 'ब्रश', 'toothbrush': 'टूथब्रश',
                    'butter': 'मक्खन', 'fly': 'मक्खी', 'butterfly': 'तितली',
                    'sea': 'समुद्र', 'shell': 'शंख', 'seashell': 'सीप',
                    'snowman': 'बर्फ का आदमी', 'notebook': 'कॉपी', 'basketball': 'बास्केटबॉल',
                    'raincoat': 'रेनकोट', 'raindrop': 'बारिश की बूंद',
                    'toothache': 'दांत का दर्द', 'toothpaste': 'टूथपेस्ट',
                    'button': 'बटन', 'butterscotch': 'बटरस्कॉच',
                    'hot': 'गर्म', 'cold': 'ठंडा', 'hot vs cold': 'गर्म बनाम ठंडा',
                    'big': 'बड़ा', 'small': 'छोटा', 'big / small': 'बड़ा / छोटा',
                    'up': 'ऊपर', 'down': 'नीचे', 'up / down': 'ऊपर / नीचे',
                    'heavy': 'भारी', 'light': 'हल्का', 'heavy / light': 'भारी / हल्का',
                    'happy': 'खुश', 'sad': 'उदास', 'happy / sad': 'खुश / उदास',
                    'glad': 'प्रसन्न', 'angry': 'क्रोधित', 'noon': 'दोपहर',
                    'start': 'शुरू', 'begin': 'प्रारंभ', 'start = begin': 'शुरू = प्रारंभ',
                    'shut': 'बंद', 'close': 'बंद करना', 'shut = close': 'बंद = बंद करना',
                    'quick': 'तेज', 'fast': 'तेज', 'quick = fast': 'तेज = तेज',
                    'open': 'खुला', 'wide': 'चौड़ा', 'mad': 'पागल',
                    'doctor': 'डॉक्टर', 'help': 'मदद', 'doctor helps': 'डॉक्टर मदद करता है',
                    'nurse': 'नर्स', 'care': 'देखभाल', 'nurse cares': 'नर्स देखभाल करती है',
                    'medicine': 'दवा', 'cure': 'इलाज', 'medicine cures': 'दवा ठीक करती है',
                    'hospital': 'अस्पताल', 'clinic': 'क्लिनिक', 'hospital clinic': 'अस्पताल क्लिनिक',
                    'health': 'स्वास्थ्य', 'strong': 'मजबूत', 'health is strength': 'स्वास्थ्य ही ताकत है',
                    'teacher': 'शिक्षक', 'teach': 'पढ़ाना', 'teacher teaches': 'शिक्षक पढ़ाता है',
                    'builder': 'निर्माता', 'build': 'बनाना', 'builder builds': 'निर्माता बनाता है',
                    'driver': 'चालक', 'drive': 'चलाना', 'driver drives': 'चालक चलाता है',
                    'farmer': 'किसान', 'grow': 'उगाना', 'farmer grows': 'किसान उगाता है',
                    'tailor': 'दर्जी', 'sew': 'सिलना', 'tailor sews': 'दर्जी सिलता है',
                    'morning': 'सुबह', 'morning starts day': 'सुबह दिन शुरू करती है',
                    'afternoon': 'दोपहर', 'afternoon midday': 'दोपहर का समय',
                    'evening': 'शाम', 'evening sunset': 'शाम का सूर्यास्त',
                    'night': 'रात', 'night stars time': 'रात का समय',
                    'day': 'दिन', 'day has light': 'दिन में उजाला होता है',
                    'left': 'बाएं', 'turn': 'मुड़ना', 'turn left': 'बाएं मुड़ें',
                    'right': 'दाएं', 'turn right': 'दाएं मुड़ें',
                    'straight': 'सीधा', 'path': 'मार्ग', 'go straight': 'सीधे जाएं',
                    'back': 'पीछे', 'return': 'वापस', 'go back': 'पीछे जाएं',
                    'opposite of left = _____': 'बाएं का विपरीत = _____',
                },
                'kn': {
                    'Compound Words': 'ಸಂಯುಕ್ತ ಪದಗಳು',
                    'Opposite Words': 'ವಿರುದ್ಧ ಪದಗಳು',
                    'Similar Meanings': 'ಸಮಾನಾರ್ಥಕ ಪದಗಳು',
                    'Health Words': 'ಆರೋಗ್ಯ ಪದಗಳು',
                    'Occupation Words': 'ಉದ್ಯೋಗ ಪದಗಳು',
                    'Time Expressions': 'ಸಮಯದ ಪದಗಳು',
                    'Direction Words': 'ದಿಕ್ಕಿನ ಪದಗಳು',
                    'Welcome! In this lesson, you will learn how two small words can combine to make a new word with a new meaning.': 'ಸ್ವಾಗತ! ಈ ಪಾಠದಲ್ಲಿ, ಎರಡು ಸಣ್ಣ ಪದಗಳು ಹೇಗೆ ಒಟ್ಟಿಗೆ ಸೇರಿ ಹೊಸ ಅರ್ಥದ ಹೊಸ ಪದವನ್ನು ರೂಪಿಸುತ್ತವೆ ಎಂದು ತಿಳಿಯುವಿರಿ.',
                    'Welcome! Today we will learn words that have opposite meanings to help you compare things.': 'ಸ್ವಾಗತ! ಇಂದು ನಾವು ವಸ್ತುಗಳನ್ನು ಹೋಲಿಸಲು ವಿರುದ್ಧ ಅರ್ಥವನ್ನು ಹೊಂದಿರುವ ಪದಗಳನ್ನು ಕಲಿಯಲಿದ್ದೇವೆ.',
                    'Welcome! In this lesson, we will learn different words that mean the exact same thing.': 'ಸ್ವಾಗತ! ಈ ಪಾಠದಲ್ಲಿ, ನಾವು ಒಂದೇ ರೀತಿಯ ಅರ್ಥವನ್ನು ನೀಡುವ ವಿವಿಧ ಪದಗಳನ್ನು ಕಲಿಯಲಿದ್ದೇವೆ.',
                    'Welcome! Today we will learn simple words used at doctors, clinics, and hospitals.': 'ಸ್ವಾಗತ! ಇಂದು ನಾವು ವೈದ್ಯರು, ಕ್ಲಿನಿಕ್ ಮತ್ತು ಆಸ್ಪತ್ರೆಗಳಲ್ಲಿ ಬಳಸಲಾಗುವ ಸರಳ ಪದಗಳನ್ನು ಕಲಿಯಲಿದ್ದೇವೆ.',
                    'Welcome! In this lesson, we will learn about common jobs people do in the community.': 'ಸ್ವಾಗತ! ಈ ಪಾಠದಲ್ಲಿ, ಸಮಾಜದಲ್ಲಿ ಜನರು ಮಾಡುವ ಸಾಮಾನ್ಯ ಕೆಲಸಗಳ ಬಗ್ಗೆ ಕಲಿಯಲಿದ್ದೇವೆ.',
                    'Welcome! Today we will learn words to describe different parts of the day and night.': 'ಸ್ವಾಗತ! ಇಂದು ನಾವು ಹಗಲು ಮತ್ತು ರಾತ್ರಿಯ विभिन्न ಹಂತಗಳನ್ನು ವಿವರಿಸುವ ಪದಗಳನ್ನು ಕಲಿಯಲಿದ್ದೇವೆ.',
                    'Welcome! In this lesson, we will learn basic navigation terms to help you find paths and read signs.': 'ಸ್ವಾಗತ! ಈ ಪಾಠದಲ್ಲಿ, ನಾವು ಮಾರ್ಗಗಳನ್ನು ಹುಡುಕಲು ಮತ್ತು ಚಿಹ್ನೆಗಳನ್ನು ಓದಲು ಸಹಾಯ ಮಾಡುವ ಮೂಲಭೂತ ದಿಕ್ಕಿನ ಪದಗಳನ್ನು ಕಲಿಯಲಿದ್ದೇವೆ.',
                    'What are Compound Words?': 'ಸಂಯುಕ್ತ ಪದಗಳು ಎಂದರೇನು?',
                    'Compound words are made by joining two small words to make a new word.': 'ಎರಡು ಸಣ್ಣ ಪದಗಳನ್ನು ಸೇರಿಸುವ ಮೂಲಕ ಹೊಸದೊಂದು ಸಂಯುಕ್ತ ಪದವನ್ನು ರಚಿಸಲಾಗುತ್ತದೆ.',
                    'What are Opposite Words?': 'ವಿರುದ್ಧ ಪದಗಳು ಎಂದರೇನು?',
                    'Opposite words are word pairs that have completely different meanings.': 'ವಿರುದ್ಧ ಪದಗಳೆಂದರೆ ಸಂಪೂರ್ಣವಾಗಿ ವಿಭಿನ್ನ ಅರ್ಥಗಳನ್ನು ಹೊಂದಿರುವ ಪದಗಳ ಜೋಡಿ.',
                    'What are Similar Meanings?': 'ಸಮಾನಾರ್ಥಕ ಪದಗಳು ಎಂದರೇನು?',
                    'These are different words that have the same or very similar meaning.': 'ಇವುಗಳು ಒಂದೇ ಅಥವಾ ಒಂದೇ ರೀತಿಯ ಅರ್ಥವನ್ನು ಹೊಂದಿರುವ ವಿಭಿನ್ನ ಪದಗಳಾಗಿವೆ.',
                    'What are Health Words?': 'ಆರೋಗ್ಯದ ಪದಗಳು ಎಂದರೇನು?',
                    'These are essential words used to describe health, sickness, and medical support.': 'ಇವುಗಳು ಆರೋಗ್ಯ, ಕಾಯಿಲೆ ಮತ್ತು ವೈದ್ಯಕೀಯ ಸಹಾಯವನ್ನು ವಿವರಿಸಲು ಬಳಸುವ ಪ್ರಮುಖ ಪದಗಳಾಗಿವೆ.',
                    'What are Occupation Words?': 'ಉದ್ಯೋಗದ ಪದಗಳು ಎಂದರೇನು?',
                    'Occupations describe the work, trades, and careers people practice.': 'ಉದ್ಯೋಗಗಳು ಜನರು ಮಾಡುವ ಕೆಲಸ, ವ್ಯಾಪಾರ ಮತ್ತು ವೃತ್ತಿಗಳನ್ನು ವಿವರಿಸುತ್ತವೆ.',
                    'What are Time Expressions?': 'ಸಮಯದ ಪದಗಳು ಎಂದರೇನು?',
                    'These are common words describing periods, hours, and sections of the daily cycle.': 'ಇವುಗಳು ದಿನದ ವಿವಿಧ ಅವಧಿಗಳು ಮತ್ತು ಸಮಯಗಳನ್ನು ವಿವರಿಸುವ ಸಾಮಾನ್ಯ ಪದಗಳಾಗಿವೆ.',
                    'What are Direction Words?': 'ದಿಕ್ಕಿನ ಪದಗಳು ಎಂದರೇನು?',
                    'Direction words give guidance on positions, routes, and navigation turns.': 'ದಿಕ್ಕಿನ ಪದಗಳು ಸ್ಥಳಗಳು, ಮಾರ್ಗಗಳು ಮತ್ತು ತಿರುವುಗಳ ಬಗ್ಗೆ ಮಾರ್ಗದರ್ಶನ ನೀಡುತ್ತವೆ.',
                    'Tap the correct compound word you hear.': 'ನೀವು ಕೇಳುವ ಸರಿಯಾದ ಸಂಯುಕ್ತ ಪದವನ್ನು ಟ್ಯಾಪ್ ಮಾಡಿ.',
                    'Tap the correct opposite word you hear.': 'ನೀವು ಕೇಳುವ ಸರಿಯಾದ ವಿರುದ್ಧ ಪದವನ್ನು ಟ್ಯಾಪ್ ಮಾಡಿ.',
                    'Tap the correct similar meaning word you hear.': 'ನೀವು ಕೇಳುವ ಸರಿಯಾದ ಸಮಾನಾರ್ಥಕ ಪದವನ್ನು ಟ್ಯಾಪ್ ಮಾಡಿ.',
                    'Tap the correct health word you hear.': 'ನೀವು ಕೇಳುವ ಸರಿಯಾದ ಆರೋಗ್ಯದ ಪದವನ್ನು ಟ್ಯಾಪ್ ಮಾಡಿ.',
                    'Tap the correct occupation word you hear.': 'ನೀವು ಕೇಳುವ ಸರಿಯಾದ ಉದ್ಯೋಗದ ಪದವನ್ನು ಟ್ಯಾಪ್ ಮಾಡಿ.',
                    'Tap the correct time word you hear.': 'ನೀವು ಕೇಳುವ ಸರಿಯಾದ ಸಮಯದ ಪದವನ್ನು ಟ್ಯಾಪ್ ಮಾಡಿ.',
                    'Tap the correct direction word you hear.': 'ನೀವು ಕೇಳುವ ಸರಿಯಾದ ದಿಕ್ಕಿನ ಪದವನ್ನು ಟ್ಯಾಪ್ ಮಾಡಿ.',
                    'What is the missing word?': 'ಬಿಟ್ಟುಹೋದ ಪದ ಯಾವುದು?',
                    'Learn with examples': 'ಉದಾಹರಣೆಗಳೊಂದಿಗೆ ಕಲಿಯಿರಿ',
                    'Listen and understand': 'ಕೇಳಿ ಮತ್ತು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಿ',
                    'Practice and earn XP': 'ಅಭ್ಯಾಸ ಮಾಡಿ ಮತ್ತು XP ಗಳಿಸಿ',
                    'Understand opposites': 'ವಿರುದ್ಧಾರ್ಥಕಗಳನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಿ',
                    'Listen to opposite pairs': 'ವಿರುದ್ಧ ಜೋಡಿಗಳನ್ನು ಕೇಳಿ',
                    'Answer practice questions': 'ಅಭ್ಯಾಸ ಪ್ರಶ್ನೆಗಳಿಗೆ ಉತ್ತರಿಸಿ',
                    'Identify synonyms': 'ಸಮಾನಾರ್ಥಕಗಳನ್ನು ಗುರುತಿಸಿ',
                    'Listen and connect similar words': 'ಸಮಾನ ಪದಗಳನ್ನು ಕೇಳಿ ಜೋಡಿಸಿ',
                    'Verify spelling checks': 'ಕಾಗುಣಿತ ಪರಿಶೀಲಿಸಿ',
                    'Recognize medical terms': 'ವೈದ್ಯಕೀಯ ಪದಗಳನ್ನು ಗುರುತಿಸಿ',
                    'Hear emergency instructions': 'ತುರ್ತು ಸೂಚನೆಗಳನ್ನು ಕೇಳಿ',
                    'Learn clinic word shapes': 'ಕ್ಲಿನಿಕ್ ಪದಗಳ ರೂಪಗಳನ್ನು ಕಲಿಯಿರಿ',
                    'Recognize jobs names': 'ಕೆಲಸದ ಹೆಸರುಗಳನ್ನು ಗುರುತಿಸಿ',
                    'Connect occupations to tasks': 'ಉದ್ಯೋಗಗಳನ್ನು ಕಾರ್ಯಗಳಿಗೆ ಜೋಡಿಸಿ',
                    'Identify workplace words': 'ಕೆಲಸದ ಸ್ಥಳದ ಪದಗಳನ್ನು ಗುರುತಿಸಿ',
                    'Understand times of day': 'ದಿನದ ಸಮಯವನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಿ',
                    'Identify dawn and dusk words': 'ಬೆಳಗಿನ ಮತ್ತು ಸಂಜೆಯ ಪದಗಳನ್ನು ಗುರುತಿಸಿ',
                    'Spelling checks for time': 'ಸಮಯಕ್ಕಾಗಿ ಕಾಗುಣಿತ ಪರಿಶೀಲಿಸಿ',
                    'Identify directions': 'ದಿಕ್ಕುಗಳನ್ನು ಗುರುತಿಸಿ',
                    'Read left, right, straight guides': 'ಎಡ, ಬಲ, ನೇರ ಮಾರ್ಗದರ್ಶಿಗಳನ್ನು ಓದಿ',
                    'Earn navigation badge': 'ದಿಕ್ಸೂಚಿ ಬ್ಯಾಡ್ಜ್ ಗಳಿಸಿ',
                    'rain': 'ಮಳೆ', 'bow': 'ಬಿಲ್ಲು', 'rainbow': 'ಮಳೆಬಿಲ್ಲು',
                    'sun': 'ಸೂರ್ಯ', 'shine': 'ಬೆಳಕು', 'sunshine': 'ಬಿಸಿಲು',
                    'tooth': 'ಹಲ್ಲು', 'brush': 'ಬ್ರಷ್', 'toothbrush': 'ಹಲ್ಲುಜ್ಜುವ ಬ್ರಷ್',
                    'butter': 'ಬೆಣ್ಣೆ', 'fly': 'ನೊಣ', 'butterfly': 'ಚಿಟ್ಟೆ',
                    'sea': 'ಸಮುದ್ರ', 'shell': 'ಚಿಪ್ಪು', 'seashell': 'ಶಂಖ',
                    'snowman': 'ಹಿಮದ ಮನುಷ್ಯ', 'notebook': 'ನೋಟ್‌ಬುಕ್', 'basketball': 'ಬಾಸ್ಕೆಟ್‌ಬಾಲ್',
                    'raincoat': 'ರೇನ್‌ಕೋಟ್', 'raindrop': 'ಮಳೆಹನಿ',
                    'toothache': 'ಹಲ್ಲು ನೋವು', 'toothpaste': 'ಟೂತ್‌ಪೇಸ್ಟ್',
                    'button': 'ಬಟನ್', 'butterscotch': 'ಬಟರ್‌ಸ್ಕಾಚ್',
                    'hot': 'ಬಿಸಿ', 'cold': 'ತಂಪು', 'hot vs cold': 'ಬಿಸಿ ಮತ್ತು ತಂಪು',
                    'big': 'ದೊಡ್ಡ', 'small': 'ಸಣ್ಣ', 'big / small': 'ದೊಡ್ಡ / ಸಣ್ಣ',
                    'up': 'ಮೇಲೆ', 'down': 'ಕೆಳಗೆ', 'up / down': 'ಮೇಲೆ / ಕೆಳಗೆ',
                    'heavy': 'ಭಾರ', 'light': 'ಹಗುರ', 'heavy / light': 'ಭಾರ / ಹಗುರ',
                    'happy': 'ಸಂತೋಷ', 'sad': 'ದುಃಖ', 'happy / sad': 'ಸಂತೋಷ / ದುಃಖ',
                    'glad': 'ಆನಂದ', 'angry': 'ಕೋಪ', 'noon': 'ಮಧ್ಯಾಹ್ನ',
                    'start': 'ಪ್ರಾರಂಭ', 'begin': 'ಶುರು', 'start = begin': 'ಪ್ರಾರಂಭ = ಶುರು',
                    'shut': 'ಮುಚ್ಚು', 'close': 'ಬಂದ್', 'shut = close': 'ಮುಚ್ಚು = ಬಂದ್',
                    'quick': 'ವೇಗ', 'fast': 'ತ್ವರಿತ', 'quick = fast': 'ವೇಗ = ತ್ವರಿತ',
                    'open': 'ತೆರೆ', 'wide': 'ಅಗಲ', 'mad': 'ಹುಚ್ಚು',
                    'doctor': 'ವೈದ್ಯರು', 'help': 'ಸಹಾಯ', 'doctor helps': 'ವೈದ್ಯರು ಸಹಾಯ ಮಾಡುತ್ತಾರೆ',
                    'nurse': 'ದಾದಿ', 'care': 'ಆರೈಕೆ', 'nurse cares': 'ದಾದಿ ಆರೈಕೆ ಮಾಡುತ್ತಾರೆ',
                    'medicine': 'ಔಷಧಿ', 'cure': 'ಗುಣಪಡಿಸು', 'medicine cures': 'ಔಷಧಿ ಗುಣಪಡಿಸುತ್ತದೆ',
                    'hospital': 'ಆಸ್ಪತ್ರೆ', 'clinic': 'ಕ್ಲಿನಿಕ್', 'hospital clinic': 'ಆಸ್ಪತ್ರೆ ಕ್ಲಿನಿಕ್',
                    'health': 'ಆರೋಗ್ಯ', 'strong': 'ಬಲಶಾಲಿ', 'health is strength': 'ಆರೋಗ್ಯವೇ ಭಾಗ್ಯ',
                    'teacher': 'ಶಿಕ್ಷಕರು', 'teach': 'ಕಲಿಸು', 'teacher teaches': 'ಶಿಕ್ಷಕರು ಕಲಿಸುತ್ತಾರೆ',
                    'builder': 'ಕಟ್ಟಡ ನಿರ್ಮಾಣಗಾರ', 'build': 'ಕಟ್ಟು', 'builder builds': 'ನಿರ್ಮಾಣಗಾರ ಕಟ್ಟುತ್ತಾರೆ',
                    'driver': 'ಚಾಲಕರು', 'drive': 'ಚಲಾಯಿಸು', 'driver drives': 'ಚಾಲಕರು ಚಲಾಯಿಸುತ್ತಾರೆ',
                    'farmer': 'ರೈತರು', 'grow': 'ಬೆಳೆಸು', 'farmer grows': 'ರೈತರು ಬೆಳೆಯುತ್ತಾರೆ',
                    'tailor': 'ದರ್ಜಿ', 'sew': 'ಹೊಲಿ', 'tailor sews': 'ದರ್ಜಿ ಹೊಲಿಯುತ್ತಾರೆ',
                    'morning': 'ಬೆಳಿಗ್ಗೆ', 'morning starts day': 'ಬೆಳಿಗ್ಗೆ ದಿನ ಪ್ರಾರಂಭಿಸುತ್ತದೆ',
                    'afternoon': 'ಮಧ್ಯಾಹ್ನ', 'afternoon midday': 'ಮಧ್ಯಾಹ್ನ ಸಮಯ',
                    'evening': 'ಸಂಜೆ', 'evening sunset': 'ಸಂಜೆ ಸೂರ್ಯಾಸ್ತ',
                    'night': 'ರಾತ್ರಿ', 'night stars time': 'ರಾತ್ರಿ ನಕ್ಷತ್ರಗಳ ಸಮಯ',
                    'day': 'ಹಗಲು', 'day has light': 'ಹಗಲಿನಲ್ಲಿ ಬೆಳಕಿದೆ',
                    'left': 'ಎಡ', 'turn': 'ತಿರುಗು', 'turn left': 'ಎಡಕ್ಕೆ ತಿರುಗು',
                    'right': 'ಬಲ', 'turn right': 'ಬಲಕ್ಕೆ ತಿರುಗು',
                    'straight': 'ನೇರ', 'path': 'ದಾರಿ', 'go straight': 'ನೇರವಾಗಿ ಹೋಗಿ',
                    'back': 'ಹಿಂದೆ', 'return': 'ಹಿಂತಿರುಗು', 'go back': 'ಹಿಂದೆ ಹೋಗಿ',
                    'opposite of left = _____': 'ಎಡದ ವಿರುದ್ಧ = _____',
                },
                'ta': {
                    'Compound Words': 'கூட்டுச் சொற்கள்',
                    'Opposite Words': 'எதிர்ச்சொற்கள்',
                    'Similar Meanings': 'ஒத்த சொற்கள்',
                    'Health Words': 'சுகாதாரச் சொற்கள்',
                    'Occupation Words': 'தொழில் சொற்கள்',
                    'Time Expressions': 'கால வெளிப்பாடுகள்',
                    'Direction Words': 'திசைச் சொற்கள்',
                    'Welcome! In this lesson, you will learn how two small words can combine to make a new word with a new meaning.': 'வரவேற்பு! இந்த பாடத்தில், இரண்டு சிறிய சொற்கள் இணைந்து எவ்வாறு புதிய அர்த்தமுடைய ஒரு புதிய சொல்லை உருவாக்குகின்றன என்பதைப் படிப்பீர்கள்.',
                    'Welcome! Today we will learn words that have opposite meanings to help you compare things.': 'வரவேற்பு! இன்று நாம் பொருட்களை ஒப்பிட உதவும் எதிர் அர்த்தங்களைக் கொண்ட சொற்களைக் கற்போம்.',
                    'Welcome! In this lesson, we will learn different words that mean the exact same thing.': 'வரவேற்பு! இந்த பாடத்தில், ஒரே அர்த்தத்தைத் தரும் வெவ்வேறு சொற்களைக் கற்போம்.',
                    'Welcome! Today we will learn simple words used at doctors, clinics, and hospitals.': 'வரவேற்பு! இன்று நாம் மருத்துவர்கள், கிளினிக் மற்றும் மருத்துவமனைகளில் பயன்படுத்தப்படும் எளிய சொற்களைக் கற்போம்.',
                    'Welcome! In this lesson, we will learn about common jobs people do in the community.': 'வரவேற்பு! இந்த பாடத்தில், சமூகத்தில் மக்கள் செய்யும் பொதுவான வேலைகளைப் பற்றி கற்போம்.',
                    'Welcome! Today we will learn words to describe different parts of the day and night.': 'வரவேற்பு! இன்று நாம் பகல் மற்றும் இரவின் வெவ்வேறு பகுதிகளை விவரிக்கும் சொற்களைக் கற்போம்.',
                    'Welcome! In this lesson, we will learn basic navigation terms to help you find paths and read signs.': 'வரவேற்பு! இந்த பாடத்தில், நீங்கள் பாதைகளைக் கண்டறியவும் அடையாளங்களை வாசிக்கவும் உதவும் அடிப்படை திசை சொற்களைக் கற்போம்.',
                    'What are Compound Words?': 'கூட்டுச் சொற்கள் என்றால் என்ன?',
                    'Compound words are made by joining two small words to make a new word.': 'இரண்டு சிறிய சொற்களை இணைப்பதன் மூலம் புதிய கூட்டுச் சொல் உருவாக்கப்படுகிறது.',
                    'What are Opposite Words?': 'எதிர்ச்சொற்கள் என்றால் என்ன?',
                    'Opposite words are word pairs that have completely different meanings.': 'எதிர்ச்சொற்கள் என்பது முற்றிலும் மாறுபட்ட அர்த்தங்களைக் கொண்ட சொற்களின் இணையாகும்.',
                    'What are Similar Meanings?': 'ஒத்த சொற்கள் என்றால் என்ன?',
                    'These are different words that have the same or very similar meaning.': 'இவை ஒரே மாதிரியான அர்த்தத்தை உடைய வெவ்வேறு சொற்கள் ஆகும்.',
                    'What are Health Words?': 'சுகாதாரச் சொற்கள் என்றால் என்ன?',
                    'These are essential words used to describe health, sickness, and medical support.': 'இவை உடல்நலம், நோய் மற்றும் மருத்துவ உதவியை விவரிக்கப் பயன்படும் முக்கிய சொற்களாகும்.',
                    'What are Occupation Words?': 'தொழில் சொற்கள் என்றால் என்ன?',
                    'Occupations describe the work, trades, and careers people practice.': 'தொழில் என்பது மக்கள் செய்யும் வேலை மற்றும் வேலைவாய்ப்புகளை விவரிக்கிறது.',
                    'What are Time Expressions?': 'கால வெளிப்பாடுகள் என்றால் என்ன?',
                    'These are common words describing periods, hours, and sections of the daily cycle.': 'இவை தினசரி சுழற்சியின் காலங்கள் மற்றும் நேரங்களை விவரிக்கும் பொதுவான சொற்களாகும்.',
                    'What are Direction Words?': 'திசைச் சொற்கள் என்றால் என்ன?',
                    'Direction words give guidance on positions, routes, and navigation turns.': 'திசை சொற்கள் இடங்கள், வழிகள் மற்றும் திருப்பங்கள் பற்றிய வழிகாட்டுதலை வழங்குகின்றன.',
                    'Tap the correct compound word you hear.': 'நீங்கள் கேட்கும் சரியான கூட்டுச் சொல்லைத் தட்டவும்.',
                    'Tap the correct opposite word you hear.': 'நீங்கள் கேட்கும் சரியான எதிர்ச்சொல்லைத் தட்டவும்.',
                    'Tap the correct similar meaning word you hear.': 'நீங்கள் கேட்கும் சரியான ஒத்த சொல்லைத் தட்டவும்.',
                    'Tap the correct health word you hear.': 'நீங்கள் கேட்கும் சரியான சுகாதாரச் சொல்லைத் தட்டவும்.',
                    'Tap the correct occupation word you hear.': 'நீங்கள் கேட்கும் சரியான தொழில் சொல்லைத் தட்டவும்.',
                    'Tap the correct time word you hear.': 'நீங்கள் கேட்கும் சரியான காலச் சொல்லைத் தட்டவும்.',
                    'Tap the correct direction word you hear.': 'நீங்கள் கேட்கும் சரியான திசைச் சொல்லைத் தட்டவும்.',
                    'What is the missing word?': 'விடுபட்ட சொல் எது?',
                    'Learn with examples': 'உதாரணங்களுடன் கற்றுக்கொள்ளுங்கள்',
                    'Listen and understand': 'கேட்டு புரிந்து கொள்ளுங்கள்',
                    'Practice and earn XP': 'பயிற்சி செய்து XP சம்பாதிக்கவும்',
                    'Understand opposites': 'எதிர்ச்சொற்களைப் புரிந்து கொள்ளுங்கள்',
                    'Listen to opposite pairs': 'எதிர் இணைகளைக் கேளுங்கள்',
                    'Answer practice questions': 'பயிற்சி கேள்விகளுக்கு பதிலளிக்கவும்',
                    'Identify synonyms': 'ஒத்த சொற்களைக் கண்டறியவும்',
                    'Listen and connect similar words': 'ஒத்த சொற்களைக் கேட்டு இணைக்கவும்',
                    'Verify spelling checks': 'எழுத்துப்பிழைகளைச் சரிபார்க்கவும்',
                    'Recognize medical terms': 'மருத்துவச் சொற்களை அடையாளம் காணவும்',
                    'Hear emergency instructions': 'அவசரகால அறிவுறுத்தல்களைக் கேளுங்கள்',
                    'Learn clinic word shapes': 'மருத்துவமனை சொற்களைக் கற்றுக்கொள்ளுங்கள்',
                    'Recognize jobs names': 'வேலைகளின் பெயர்களை அடையாளம் காணவும்',
                    'Connect occupations to tasks': 'தொழில்களை பணிகளுடன் இணைக்கவும்',
                    'Identify workplace words': 'வேலையிடத்துச் சொற்களை அடையாளம் காணவும்',
                    'Understand times of day': 'பகல் நேரங்களைப் புரிந்து கொள்ளுங்கள்',
                    'Identify dawn and dusk words': 'விடியல் மற்றும் மாலைச் சொற்களை அறியவும்',
                    'Spelling checks for time': 'நேரத்திற்கான எழுத்துப்பிழை சரிபார்ப்பு',
                    'Identify directions': 'திசைகளை அடையாளம் காணவும்',
                    'Read left, right, straight guides': 'இடது, வலது, நேராக வழிகாட்டிகளைப் படியுங்கள்',
                    'Earn navigation badge': 'திசைக்காட்டி பேட்ஜ் சம்பாதிக்கவும்',
                    'rain': 'மழை', 'bow': 'வில்', 'rainbow': 'வானவில்',
                    'sun': 'சூரியன்', 'shine': 'ஒளி', 'sunshine': 'வெயில்',
                    'tooth': 'பல்', 'brush': 'பிரஷ்', 'toothbrush': 'பல் துலக்கி',
                    'butter': 'வெண்ணெய்', 'fly': 'ஈ', 'butterfly': 'பட்டாம்பூச்சி',
                    'sea': 'கடல்', 'shell': 'சிப்பி', 'seashell': 'சங்கு',
                    'snowman': 'பனிமனிதன்', 'notebook': 'நோட்டுப் புத்தகம்', 'basketball': 'கூடைப்பந்து',
                    'raincoat': 'மழைக்கோட்', 'raindrop': 'மழைத்துளி',
                    'toothache': 'பல் வலி', 'toothpaste': 'பற்பசை',
                    'button': 'பொத்தான்', 'butterscotch': 'பட்டர்ஸ்காட்ச்',
                    'hot': 'சூடு', 'cold': 'குளிர்ச்சி', 'hot vs cold': 'சூடு மற்றும் குளிர்ச்சி',
                    'big': 'பெரிய', 'small': 'சிறிய', 'big / small': 'பெரிய / சிறிய',
                    'up': 'மேலே', 'down': 'கீழே', 'up / down': 'மேலே / கீழே',
                    'heavy': 'கனம்', 'light': 'இலகுவான', 'heavy / light': 'கனம் / இலகுவான',
                    'happy': 'மகிழ்ச்சி', 'sad': 'சோகம்', 'happy / sad': 'மகிழ்ச்சி / சோகம்',
                    'glad': 'மகிழ்ச்சி', 'angry': 'கோபம்', 'noon': 'நண்பகல்',
                    'start': 'தொடங்கு', 'begin': 'ஆரம்பி', 'start = begin': 'தொடங்கு = ஆரம்பி',
                    'shut': 'மூடு', 'close': 'அடை', 'shut = close': 'மூடு = அடை',
                    'quick': 'வேகம்', 'fast': 'விரைவு', 'quick = fast': 'வேகம் = விரைவு',
                    'open': 'திற', 'wide': 'அகலம்', 'mad': 'பைத்தியம்',
                    'doctor': 'மருத்துவர்', 'help': 'உதவி', 'doctor helps': 'மருத்துவர் உதவுகிறார்',
                    'nurse': 'செவிலியர்', 'care': 'பராமரிப்பு', 'nurse cares': 'செவிலியர் பராமரிக்கிறார்',
                    'medicine': 'மருந்து', 'cure': 'குணப்படுத்து', 'medicine cures': 'மருந்து குணப்படுத்துகிறது',
                    'hospital': 'மருத்துவமனை', 'clinic': 'கிளினிக்', 'hospital clinic': 'மருத்துவமனை கிளினிக்',
                    'health': 'உடல்நலம்', 'strong': 'வலிமை', 'health is strength': 'நோயற்ற வாழ்வே குறைவற்ற செல்வம்',
                    'teacher': 'ஆசிரியர்', 'teach': 'கற்பி', 'teacher teaches': 'ஆசிரியர் கற்பிக்கிறார்',
                    'builder': 'கட்டிட வடிவமைப்பாளர்', 'build': 'கட்டு', 'builder builds': 'வடிவமைப்பாளர் கட்டுகிறார்',
                    'driver': 'ஓட்டுநர்', 'drive': 'ஓட்டு', 'driver drives': 'ஓட்டுநர் ஓட்டுகிறார்',
                    'farmer': 'விவசாயி', 'grow': 'வளர்த்து', 'farmer grows': 'விவசாயி வளர்க்கிறார்',
                    'tailor': 'தையல்காரர்', 'sew': 'தை', 'tailor sews': 'தையல்காரர் தைக்கிறார்',
                    'morning': 'காலை', 'morning starts day': 'காலை நாளைத் தொடங்குகிறது',
                    'afternoon': 'மதியம்', 'afternoon midday': 'மதிய நேரம்',
                    'evening': 'மாலை', 'evening sunset': 'மாலை சூரிய அஸ்தமனம்',
                    'night': 'இரவு', 'night stars time': 'இரவு நட்சத்திரங்களின் நேரம்',
                    'day': 'பகல்', 'day has light': 'பகலில் வெளிச்சம் உண்டு',
                    'left': 'இடது', 'turn': 'திருப்பு', 'turn left': 'இடது பக்கம் திரும்பு',
                    'right': 'வலது', 'turn right': 'வலது பக்கம் திரும்பு',
                    'straight': 'நேராக', 'path': 'பாதை', 'go straight': 'நேராகச் செல்லுங்கள்',
                    'back': 'பின்னால்', 'return': 'திரும்பு', 'go back': 'பின்னால் செல்லுங்கள்',
                    'opposite of left = _____': 'இடதின் எதிர் = _____',
                }
            }

            for idx, bp in enumerate(INTERMEDIATE_LESSONS_BLUEPRINT, start=1):
                lesson_id = f"INT-{lang.upper()}-{idx:03d}"
                prereq = f"INT-{lang.upper()}-{idx-1:03d}" if idx > 1 else None
                trans = INTERMEDIATE_TRANSLATIONS.get(lang, {}) if lang != 'en' else {}

                def t(key):
                    return trans.get(key, key)

                welcome_slide = {
                    'type': 'welcome',
                    'title': t(bp['title']),
                    'subtitle': t(bp['subtitle']),
                    'objectives': [t(obj) for obj in bp['objectives']]
                }

                def_slide = {
                    'type': 'definition',
                    'title': t(bp['def_title']),
                    'subtitle': t(bp['def_sub']),
                    'left': t(bp['def_left']),
                    'right': t(bp['def_right']),
                    'result': t(bp['def_result']),
                    'left_emoji': bp['def_left_emoji'],
                    'right_emoji': bp['def_right_emoji'],
                    'result_emoji': bp['def_result_emoji']
                }

                examples_slide = {
                    'type': 'examples',
                    'title': t('Look at these compound words' if bp['concept'] == 'Compound Words' else 'Look at these examples'),
                    'examples': [
                        {
                            'left': t(ex['left']),
                            'right': t(ex['right']),
                            'result': t(ex['result']),
                            'left_emoji': ex['l_em'],
                            'right_emoji': ex['r_em'],
                            'result_emoji': ex['res_em']
                        } for ex in bp['examples']
                    ]
                }

                listen_slide = {
                    'type': 'listen',
                    'title': t('Listen to the word'),
                    'target': t(bp['listen_target']),
                    'hint': t('Listen carefully!')
                }

                q1_slide = {
                    'type': 'practice_audio',
                    'questionNumber': 1,
                    'questionText': t(bp['q1']['qText']),
                    'target': t(bp['q1']['target']),
                    'options': [t(opt) for opt in bp['q1']['options']],
                    'emojis': bp['q1']['em']
                }

                q2_slide = {
                    'type': 'practice_audio',
                    'questionNumber': 2,
                    'questionText': t(bp['q2']['qText']),
                    'target': t(bp['q2']['target']),
                    'options': [t(opt) for opt in bp['q2']['options']],
                    'emojis': bp['q2']['em']
                }

                q3_slide = {
                    'type': 'practice_audio',
                    'questionNumber': 3,
                    'questionText': t(bp['q3']['qText']),
                    'target': t(bp['q3']['target']),
                    'options': [t(opt) for opt in bp['q3']['options']],
                    'emojis': bp['q3']['em']
                }

                eq = bp['q4']['equation']
                for k, v in trans.items():
                    if k in eq:
                        eq = eq.replace(k, v)

                q4_slide = {
                    'type': 'practice_missing',
                    'questionNumber': 4,
                    'questionText': t(bp['q4']['qText']),
                    'equation': eq,
                    'target': t(bp['q4']['target']),
                    'options': [t(opt) for opt in bp['q4']['options']]
                }

                grad_slide = {
                    'type': 'graduation',
                    'title': t('Great Job!'),
                    'subtitle': t('You have completed this lesson.'),
                    'xp': 15,
                    'time': '10 min'
                }

                activities_list = [
                    welcome_slide,
                    def_slide,
                    examples_slide,
                    listen_slide,
                    q1_slide,
                    q2_slide,
                    q3_slide,
                    q4_slide,
                    grad_slide
                ]

                Lesson.objects.create(
                    lesson_id=lesson_id,
                    title=t(bp['title']),
                    module='Language Concepts',
                    difficulty='intermediate',
                    skill='vocabulary',
                    language=lang,
                    estimated_time=10,
                    order_in_level=idx,
                    prerequisite_id=prereq,

                    concept_intro=t(bp['subtitle']),
                    real_life_context=t(bp['def_sub']),
                    image_visual=bp['visual'],
                    activities=activities_list,
                    mini_game={},
                    quiz_bank=[],
                    reward_xp=15,
                    reward_stars=3,
                    reward_coins=5,
                    badge_code=f"badge_int_{lang}_{idx}",
                    encouragement_template="Amazing!",
                    improvement_tip="Concept learned perfectly!"
                )
                seeded_count += 1

            # Advanced Lessons Translations & Pools
            ADVANCED_TRANSLATIONS = {
                'hi': {
                    'Story Elements': 'कहानी के तत्व', 'Characters, Setting, Plot': 'पात्र, स्थान, कथानक',
                    'Main Idea & Details': 'मुख्य विचार और विवरण', 'Find the main idea and key details': 'मुख्य विचार और मुख्य विवरण खोजें',
                    'Making Inferences': 'निष्कर्ष निकालना', 'Read between the lines': 'छिपे हुए अर्थ को समझें',
                    'Context Clues': 'संदर्भ संकेत', 'Guess the meaning of words': 'शब्दों के अर्थ का अनुमान लगाएं',
                    'Cause and Effect': 'कारण और प्रभाव', 'Understand why things happen': 'समझें कि चीजें क्यों होती हैं',
                    'Sequencing Events': 'घटनाओं का क्रम', 'Put events in the right order': 'घटनाओं को सही क्रम में रखें',
                    'Compare and Contrast': 'तुलना और अंतर', 'Find similarities and differences': 'समानताएं और अंतर खोजें',
                    'Fact and Opinion': 'तथ्य और राय', 'Know the difference': 'अंतर जानें',
                    'Vocabulary in Context': 'संदर्भ में शब्दावली', 'Use new words in context': 'संदर्भ में नए शब्दों का प्रयोग करें',
                    'Author\'s Purpose': 'लेखक का उद्देश्य', 'Why did the author write this?': 'लेखक ने यह क्यों लिखा?',
                    'Summarizing': 'संक्षेपीकरण', 'Identify core summaries': 'मुख्य सारांश पहचानें',
                    'Drawing Conclusions': 'निष्कर्ष पर पहुँचना', 'Make judgements based on facts': 'तथ्यों के आधार पर निर्णय लें',
                    'Point of View': 'दृष्टिकोण', 'Understand who is speaking': 'समझें कि कौन बोल रहा है',
                    'Theme': 'विषय (थीम)', 'Discover the main message': 'मुख्य संदेश खोजें',
                    'Figurative Language': 'अलंकारिक भाषा', 'Understand metaphors and similes': 'रूपक और उपमा को समझें',
                    'Advertisement Analysis': 'विज्ञापन विश्लेषण', 'Evaluate ads and promotions': 'विज्ञापनों और प्रचारों का मूल्यांकन करें',
                    'Letter & Email Writing': 'पत्र और ईमेल लेखन', 'Write formal letters and applications': 'औपचारिक पत्र और आवेदन लिखें',
                    'Debate & Discussion': 'वाद-विवाद और चर्चा', 'Daily Communication & Conversation Practice': 'दैनिक संचार और बातचीत अभ्यास',
                    'Essay Writing': 'निबंध लेखन', 'Write structured and impressive essays': 'संरचित और प्रभावशाली निबंध लिखें',
                    'Critical Thinking Puzzles': 'तार्किक सोच की पहेलियाँ', 'Solve advanced comprehension puzzles': 'उन्नत समझ वाली पहेलियाँ हल करें',
                    'Stories & Literature': 'कहानियाँ और साहित्य',
                    'Read, analyze and enjoy beautiful stories.': 'सुंदर कहानियों को पढ़ें, विश्लेषण करें और आनंद लें।',
                    'The Honest Farmer': 'ईमानदार किसान',
                    'Once, there lived a farmer who was known for his honesty. One day, he found a bag of gold coins in his field. Instead of keeping it, he went to the village chief to find the owner. The owner rewarded him for his honesty. Moral: Honesty is always rewarded.': 'एक बार, एक किसान रहता था जो अपनी ईमानदारी के लिए जाना जाता था। एक दिन, उसे अपने खेत में सोने के सिक्कों से भरा थैला मिला। इसे अपने पास रखने के बजाय, वह मालिक को खोजने के लिए गाँव के मुखिया के पास गया। मालिक ने उसे उसकी ईमानदारी के लिए पुरस्कृत किया। सीख: ईमानदारी का फल हमेशा मिलता है।',
                    'Story Comprehension': 'कहानी की समझ',
                    'Character Analysis': 'चरित्र विश्लेषण',
                    'Theme & Moral': 'विषय और नैतिक मूल्य',
                    'Vocabulary Check': 'शब्दावली जांच',
                    'Who is the main character in the story?': 'कहानी का मुख्य पात्र कौन है?',
                    'The farmer': 'किसान', 'The dog': 'कुत्ता', 'The market': 'बाज़ार', 'The sun': 'सूरज',
                    'Why was the farmer known?': 'किसान क्यों जाना जाता था?',
                    'For his wealth': 'अपनी संपत्ति के लिए', 'For his honesty': 'अपनी ईमानदारी के लिए', 'For his laziness': 'अपने आलस्य के लिए', 'For his anger': 'अपने गुस्से के लिए',
                    'What is the moral of the story?': 'कहानी की सीख क्या है?',
                    'Greed is good': 'लालच अच्छा है', 'Honesty is always rewarded': 'ईमानदारी का फल हमेशा मिलता है', 'Money is everything': 'पैसा ही सब कुछ है', 'Never work hard': 'कभी मेहनत मत करो',
                    'What does "honesty" mean?': 'ईमानदारी का क्या अर्थ है?',
                    'Being truthful': 'सच्चा होना', 'Being rich': 'अमीर होना', 'Being funny': 'मज़ेदार होना', 'Being strong': 'मजबूत होना',
                    'Daily Communication': 'दैनिक संचार',
                    'Conversation Practice': 'बातचीत अभ्यास',
                    'Hi! How was your weekend?': 'नमस्ते! आपका सप्ताहांत कैसा रहा?',
                    'It was great! I went hiking with my friends. The weather was perfect.': 'यह बहुत बढ़िया था! मैं अपने दोस्तों के साथ ट्रेकिंग पर गया था। मौसम बहुत अच्छा था।',
                    'That sounds fun! What did you enjoy the most?': 'यह सुनने में अच्छा लग रहा है! आपको सबसे ज्यादा क्या पसंद आया?',
                    'I loved the beautiful view from the top!': 'मुझे ऊपर से सुंदर नज़ारा बहुत पसंद आया!',
                    'The food we packed was delicious.': 'जो भोजन हमने पैक किया था वह स्वादिष्ट था।',
                    'Just walking with my friends.': 'बस अपने दोस्तों के साथ घूमना।',
                    'Essay Writing': 'निबंध लेखन',
                    'Plan, write and structure impressive essays.': 'प्रभावशाली निबंधों की योजना बनाएं, लिखें और उन्हें संरचित करें।',
                    'Is Technology Making Our Lives Better or Worse?': 'क्या तकनीक हमारे जीवन को बेहतर बना रही है या बदतर?',
                    'Introduction': 'प्रस्तावना (Introduction)', 'Body Paragraph 1': 'मुख्य भाग १ (Body Paragraph 1)', 'Body Paragraph 2': 'मुख्य भाग २ (Body Paragraph 2)', 'Conclusion': 'निष्कर्ष (Conclusion)',
                    'Organize your ideas': 'अपने विचारों को व्यवस्थित करें', 'Use examples and facts': 'उदाहरणों और तथ्यों का प्रयोग करें', 'Write coherently': 'सुसंगत तरीके से लिखें', 'Conclude effectively': 'प्रभावी ढंग से निष्कर्ष निकालें',
                    'Letter & Email Writing': 'पत्र और ईमेल लेखन',
                    'Write formal letters, emails and applications': 'औपचारिक पत्र, ईमेल और आवेदन लिखें',
                    'Manager': 'प्रबंधक', 'Sick Leave Application': 'बीमारी की छुट्टी के लिए आवेदन',
                    'Dear Sir/Madam, I am writing to request sick leave for today due to a sudden fever. Please approve my leave.': 'प्रिय महोदय/महोदया, मैं आज अचानक बुखार के कारण बीमारी की छुट्टी का अनुरोध करने के लिए लिख रहा हूँ। कृपया मेरी छुट्टी स्वीकृत करें।',
                    'Great job!': 'बहुत बढ़िया!', 'You completed the advanced checkup challenge!': 'आपने उन्नत स्तर की चुनौती को पूरा कर लिया है!',
                    'Learn step by step and master functional skills!': 'कदम दर कदम सीखें और व्यावहारिक कौशल हासिल करें!',
                    'Read and practice real life scenarios': 'वास्तविक जीवन के परिदृश्यों को पढ़ें और अभ्यास करें',
                    'Pass the concept checkup challenge': 'अवधारणा जांच चुनौती पास करें'
                },
                'kn': {
                    'Story Elements': 'ಕಥೆಯ ಅಂಶಗಳು', 'Characters, Setting, Plot': 'ಪಾತ್ರಗಳು, ಹಿನ್ನೆಲೆ, ಕಥಾವಸ್ತು',
                    'Main Idea & Details': 'ಮುಖ್ಯ ಆಲೋಚನೆ ಮತ್ತು ವಿವರಗಳು', 'Find the main idea and key details': 'ಮುಖ್ಯ ಆಲೋಚನೆ ಮತ್ತು ಪ್ರಮುಖ ವಿವರಗಳನ್ನು ಹುಡುಕಿ',
                    'Making Inferences': 'ಅನುಮಾನಗಳನ್ನು ಮಾಡುವುದು', 'Read between the lines': 'ವರಿಯದ ಸಾಲುಗಳನ್ನು ಓದಿ',
                    'Context Clues': 'ಸಂದರ್ಭದ ಸುಳಿವುಗಳು', 'Guess the meaning of words': 'ಪದಗಳ ಅರ್ಥವನ್ನು ಊಹಿಸಿ',
                    'Cause and Effect': 'ಕಾರಣ ಮತ್ತು ಪರಿಣಾಮ', 'Understand why things happen': 'ವಿಷಯಗಳು ಏಕೆ ಸಂಭವಿಸುತ್ತವೆ ಎಂಬುದನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಿ',
                    'Sequencing Events': 'ಘಟನೆಗಳ ಅನುಕ್ರಮ', 'Put events in the right order': 'ಘಟನೆಗಳನ್ನು ಸರಿಯಾದ ಕ್ರಮದಲ್ಲಿ ಇರಿಸಿ',
                    'Compare and Contrast': 'ಹೋಲಿಕೆ ಮತ್ತು ವ್ಯತ್ಯಾಸ', 'Find similarities and differences': 'ಸಮಾನತೆಗಳು ಮತ್ತು ವ್ಯತ್ಯಾಸಗಳನ್ನು ಹುಡುಕಿ',
                    'Fact and Opinion': 'ವಾಸ್ತವ ಮತ್ತು ಅಭಿಪ್ರಾಯ', 'Know the difference': 'ವ್ಯತ್ಯಾಸವನ್ನು ತಿಳಿಯಿರಿ',
                    'Vocabulary in Context': 'ಸಂದರ್ಭದಲ್ಲಿ ಶಬ್ದಕೋಶ', 'Use new words in context': 'ಸಂದರ್ಭದಲ್ಲಿ ಹೊಸ ಪದಗಳನ್ನು ಬಳಸಿ',
                    'Author\'s Purpose': 'ಲೇಖಕರ ಉದ್ದೇಶ', 'Why did the author write this?': 'ಲೇಖಕರು ಇದನ್ನು ಏಕೆ ಬರೆದಿದ್ದಾರೆ?',
                    'Summarizing': 'ಸಾರಾಂಶ ಮಾಡುವುದು', 'Identify core summaries': 'ಮುಖ್ಯ ಸಾರಾಂಶಗಳನ್ನು ಗುರುತಿಸಿ',
                    'Drawing Conclusions': 'ತೀರ್ಮಾನಗಳನ್ನು ತೆಗೆದುಕೊಳ್ಳುವುದು', 'Make judgements based on facts': 'ಸಂಗತಿಗಳ ಆಧಾರದ ಮೇಲೆ ತೀರ್ಪು ನೀಡಿ',
                    'Point of View': 'ದೃಷ್ಟಿಕೋನ', 'Understand who is speaking': 'ಯಾರು ಮಾತನಾಡುತ್ತಿದ್ದಾರೆಂದು ತಿಳಿಯಿರಿ',
                    'Theme': 'ವಸ್ತು ವಿಷಯ', 'Discover the main message': 'ಮುಖ್ಯ ಸಂದೇಶವನ್ನು ಅನ್ವೇಷಿಸಿ',
                    'Figurative Language': 'ಅಲಂಕಾರಿಕ ಭಾಷೆ', 'Understand metaphors and similes': 'ರೂಪಕ ಮತ್ತು ಉಪಮೆಗಳನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಿ',
                    'Advertisement Analysis': 'ಜಾಹೀರಾತು ವಿಶ್ಲೇಷಣೆ', 'Evaluate ads and promotions': 'ಜಾಹೀರಾತುಗಳು ಮತ್ತು ಪ್ರಚಾರಗಳನ್ನು ಮೌಲ್ಯಮಾಪನ ಮಾಡಿ',
                    'Letter & Email Writing': 'ಪತ್ರ ಮತ್ತು ಇಮೇಲ್ ಬರವಣಿಗೆ', 'Write formal letters and applications': 'ಔಚಾರಿಕ ಪತ್ರಗಳು ಮತ್ತು ಅರ್ಜಿಗಳನ್ನು ಬರೆಯಿರಿ',
                    'Debate & Discussion': 'ಚರ್ಚೆ ಮತ್ತು ಸಂವಾದ', 'Daily Communication & Conversation Practice': 'ದೈನಂದಿನ ಸಂವಹನ ಮತ್ತು ಸಂಭಾಷಣೆ ಅಭ್ಯಾಸ',
                    'Essay Writing': 'ಪ್ರಬಂಧ ಬರವಣಿಗೆ', 'Write structured and impressive essays': 'ರಚನಾತ್ಮಕ ಮತ್ತು ಪ್ರಭಾವಶಾಲಿ ಪ್ರಬಂಧಗಳನ್ನು ಬರೆಯಿರಿ',
                    'Critical Thinking Puzzles': 'ವಿಮರ್ಶಾತ್ಮಕ ಚಿಂತನೆಯ ಪದಬಂಧಗಳು', 'Solve advanced comprehension puzzles': 'ಸುಧಾರಿತ ಗ್ರಹಿಕೆಯ ಒಗಟುಗಳನ್ನು ಬಿಡಿಸಿ',
                    'Stories & Literature': 'ಕಥೆಗಳು ಮತ್ತು ಸಾಹಿತ್ಯ',
                    'Read, analyze and enjoy beautiful stories.': 'ಸುಂದರವಾದ ಕಥೆಗಳನ್ನು ಓದಿ, ವಿಶ್ಲೇಷಿಸಿ ಮತ್ತು ಆನಂದಿಸಿ.',
                    'The Honest Farmer': 'ಪ್ರಾಮಾಣಿಕ ರೈತ',
                    'Once, there lived a farmer who was known for his honesty. One day, he found a bag of gold coins in his field. Instead of keeping it, he went to the village chief to find the owner. The owner rewarded him for his honesty. Moral: Honesty is always rewarded.': 'ಒಂದಾನೊಂದು ಕಾಲದಲ್ಲಿ, ತನ್ನ ಪ್ರಾಮಾಣಿಕತೆಗೆ ಹೆಸರಾದ ಒಬ್ಬ ರೈತ ವಾಸಿಸುತ್ತಿದ್ದನು. ಒಂದು ದಿನ, ಅವನಿಗೆ ತನ್ನ ಹೊಲದಲ್ಲಿ ಚಿನ್ನದ ನಾಣ್ಯಗಳ ಚೀಲ ಸಿಕ್ಕಿತು. ಅದನ್ನು ತನ್ನ ಬಳಿ ಇಟ್ಟುಕೊಳ್ಳುವ ಬದಲು, ಮಾಲೀಕರನ್ನು ಹುಡುಕಲು ಹಳ್ಳಿಯ ಮುಖ್ಯಸ್ಥರ ಬಳಿಗೆ ಹೋದನು. ಮಾಲೀಕರು ಅವನ ಪ್ರಾಮಾಣಿಕತೆಗಾಗಿ ಅವನಿಗೆ ಬಹುಮಾನ ನೀಡಿದರು. ನೀತಿ: ಪ್ರಾಮಾಣಿಕತೆಗೆ ಯಾವಾಗಲೂ ಪ್ರತಿಫಲ ಸಿಗುತ್ತದೆ.',
                    'Story Comprehension': 'ಕಥೆಯ ಗ್ರಹಿಕೆ',
                    'Character Analysis': 'ಪಾತ್ರ ವಿಶ್ಲೇಷಣೆ',
                    'Theme & Moral': 'ವಸ್ತು ಮತ್ತು ನೈತಿಕತೆ',
                    'Vocabulary Check': 'ಶಬ್ದಕೋಶ ಪರಿಶೀಲನೆ',
                    'Who is the main character in the story?': 'ಕಥೆಯ ಮುಖ್ಯ ಪಾತ್ರ ಯಾರು?',
                    'The farmer': 'ರೈತ', 'The dog': 'ನಾಯಿ', 'The market': 'ಮಾರುಕಟ್ಟೆ', 'The sun': 'ಸೂರ್ಯ',
                    'Why was the farmer known?': 'ರೈತ ಯಾತಕ್ಕಾಗಿ ಹೆಸರುವಾಸಿಯಾಗಿದ್ದನು?',
                    'For his wealth': 'ಅವನ ಸಂಪತ್ತಿಗಾಗಿ', 'For his honesty': 'ಅವನ ಪ್ರಾಮಾಣಿಕತೆಗಾಗಿ', 'For his laziness': 'ಅವನ ಸೋಮಾರಿತನಕ್ಕಾಗಿ', 'For his anger': 'ಅವನ ಕೋಪಕ್ಕಾಗಿ',
                    'What is the moral of the story?': 'ಕಥೆಯ ನೀತಿ ಏನು?',
                    'Greed is good': 'ದುರಾಸೆ ಒಳ್ಳೆಯದು', 'Honesty is always rewarded': 'ಪ್ರಾಮಾಣಿಕತೆಗೆ ಯಾವಾಗಲೂ ಪ್ರತಿಫಲ ಸಿಗುತ್ತದೆ', 'Money is everything': 'ಹಣವೇ ಸರ್ವಸ್ವ', 'Never work hard': 'ಯಾವಾಗಲೂ ಕಷ್ಟಪಟ್ಟು ಕೆಲಸ ಮಾಡಬೇಡಿ',
                    'What does "honesty" mean?': '"ಪ್ರಾಮಾಣಿಕತೆ" ಎಂದರೆ ಏನು?',
                    'Being truthful': 'ಸತ್ಯ ಹೇಳುವುದು', 'Being rich': 'ಶ್ರೀಮಂತನಾಗಿರುವುದು', 'Being funny': 'ಹಾಸ್ಯಮಯವಾಗಿರುವುದು', 'Being strong': 'ಬಲಶಾಲಿಯಾಗಿರುವುದು',
                    'Daily Communication': 'ದೈನಂದಿನ ಸಂವಹನ',
                    'Conversation Practice': 'ಸಂಭಾಷಣೆ ಅಭ್ಯಾಸ',
                    'Hi! How was your weekend?': 'ಹಲೋ! ನಿಮ್ಮ ವಾರಾಂತ್ಯ ಹೇಗಿತ್ತು?',
                    'It was great! I went hiking with my friends. The weather was perfect.': 'ಅತ್ಯುತ್ತಮವಾಗಿತ್ತು! ನಾನು ನನ್ನ ಸ್ನೇಹಿತರೊಂದಿಗೆ ಟ್ರೆಕ್ಕಿಂಗ್ ಹೋಗಿದ್ದೆ. ಹವಾಮಾನ ಸೂಕ್ತವಾಗಿತ್ತು.',
                    'That sounds fun! What did you enjoy the most?': 'ಕೇಳಲು ಸಂತೋಷವಾಗುತ್ತದೆ! ನೀವು ಹೆಚ್ಚು ಎಂಜಾಯ್ ಮಾಡಿದ್ದು ಯಾವುದನ್ನು?',
                    'I loved the beautiful view from the top!': 'ನನಗೆ ಮೇಲಿನಿಂದ ಸುಂದರವಾದ ನೋಟ ತುಂಬಾ ಇಷ್ಟವಾಯಿತು!',
                    'The food we packed was delicious.': 'ನಾವು ಕಟ್ಟಿಕೊಂಡು ಹೋದ ಆಹಾರ ರುಚಿಕರವಾಗಿತ್ತು.',
                    'Just walking with my friends.': 'ಕೇವಲ ಸ್ನೇಹಿತರೊಂದಿಗೆ ನಡೆಯುವುದು.',
                    'Essay Writing': 'ಪ್ರಬಂಧ ಬರವಣಿಗೆ',
                    'Plan, write and structure impressive essays.': 'ಪ್ರಭಾವಶಾಲಿ ಪ್ರಬಂಧಗಳನ್ನು ಯೋಜಿಸಿ, ಬರೆಯಿರಿ ಮತ್ತು ಸಂಘಟಿಸಿ.',
                    'Is Technology Making Our Lives Better or Worse?': 'ತಂತ್ರಜ್ಞಾನವು ನಮ್ಮ ಜೀವನವನ್ನು ಉತ್ತಮಗೊಳಿಸುತ್ತಿದೆಯೇ ಅಥವಾ ಕೆಡಿಸುತ್ತಿದೆಯೇ?',
                    'Introduction': 'ಪೀಠಿಕೆ (Introduction)', 'Body Paragraph 1': 'ಮುಖ್ಯ ಭಾಗ ೧ (Body Paragraph 1)', 'Body Paragraph 2': 'ಮುಖ್ಯ ಭಾಗ ೨ (Body Paragraph 2)', 'Conclusion': 'ಉಪಸಂಹಾರ (Conclusion)',
                    'Organize your ideas': 'ನಿಮ್ಮ ಆಲೋಚನೆಗಳನ್ನು ಸಂಘಟಿಸಿ', 'Use examples and facts': 'ಉದಾಹರಣೆಗಳು ಮತ್ತು ಸತ್ಯಗಳನ್ನು ಬಳಸಿ', 'Write coherently': 'ಸುಸಂಬದ್ಧವಾಗಿ ಬರೆಯಿರಿ', 'Conclude effectively': 'ಪರಿಣಾಮಕಾರಿಯಾಗಿ ಮುಕ್ತಾಯಗೊಳಿಸಿ',
                    'Letter & Email Writing': 'ಪತ್ರ ಮತ್ತು ಇಮೇಲ್ ಬರವಣಿಗೆ',
                    'Write formal letters, emails and applications': 'ಔಪಚಾರಿಕ ಪತ್ರಗಳು, ಇಮೇಲ್ ಮತ್ತು ಅರ್ಜಿಗಳನ್ನು ಬರೆಯಿರಿ',
                    'Manager': 'ವ್ಯವಸ್ಥಾಪಕರು (ಮ್ಯಾನೇಜರ್)', 'Sick Leave Application': 'ಅನಾರೋಗ್ಯ ರಜೆಗಾಗಿ ಅರ್ಜಿ',
                    'Dear Sir/Madam, I am writing to request sick leave for today due to a sudden fever. Please approve my leave.': 'ಆತ್ಮೀಯ ಮಹನೀಯರೇ/ಮಹಿಳೆಯರೇ, ಇವತ್ತು ಹಠಾತ್ ಜ್ವರ ಬಂದ ಕಾರಣ ರಜೆ ನೀಡಲು ವಿನಂತಿಸುತ್ತೇನೆ. ದಯವಿಟ್ಟು ರಜೆಯನ್ನು ಅನುಮೋದಿಸಿ.',
                    'Great job!': 'ತುಂಬಾ ಒಳ್ಳೆಯ ಕೆಲಸ!', 'You completed the advanced checkup challenge!': 'ನೀವು ಸುಧಾರಿತ ಮಟ್ಟದ ಸವಾಲನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಪೂರ್ಣಗೊಳಿಸಿದ್ದೀರಿ!',
                    'Learn step by step and master functional skills!': 'ಹಂತ ಹಂತವಾಗಿ ಕಲಿಯಿರಿ ಮತ್ತು ಕ್ರಿಯಾತ್ಮಕ ಕೌಶಲ್ಯಗಳನ್ನು ಕರಗತ ಮಾಡಿಕೊಳ್ಳಿ!',
                    'Read and practice real life scenarios': 'ನೈಜ ಜೀವನದ ಸನ್ನಿವೇಶಗಳನ್ನು ಓದಿ ಮತ್ತು ಅಭ್ಯಾಸ ಮಾಡಿ',
                    'Pass the concept checkup challenge': 'ಪರಿಕಲ್ಪನೆ ಪರಿಶೀಲನೆ ಸವಾಲನ್ನು ಪಾಸ್ ಮಾಡಿ'
                },
                'ta': {
                    'Story Elements': 'கதை கூறுகள்', 'Characters, Setting, Plot': 'கதாபாத்திரங்கள், அமைவிடம், கதைக்களம்',
                    'Main Idea & Details': 'முக்கிய கருத்து மற்றும் விவரங்கள்', 'Find the main idea and key details': 'முக்கிய கருத்து மற்றும் முக்கிய விவரங்களைக் கண்டறியவும்',
                    'Making Inferences': 'ஊகம் செய்தல்', 'Read between the lines': 'வரிகளுக்கு இடையே படியுங்கள்',
                    'Context Clues': 'சூழல் குறிப்புகள்', 'Guess the meaning of words': 'வார்த்தைகளின் பொருளை யூகிக்கவும்',
                    'Cause and Effect': 'காரணம் மற்றும் விளைவு', 'Understand why things happen': 'விஷயங்கள் ஏன் நடக்கின்றன என்பதைப் புரிந்து கொள்ளுங்கள்',
                    'Sequencing Events': 'நிகழ்வுகளை வரிசைப்படுத்துதல்', 'Put events in the right order': 'நிகழ்வுகளை சரியான வரிசையில் வைக்கவும்',
                    'Compare and Contrast': 'ஒப்பிடுதல் மற்றும் வேறுபடுத்துதல்', 'Find similarities and differences': 'ஒற்றுமைகள் மற்றும் வேறுபாடுகளைக் கண்டறியவும்',
                    'Fact and Opinion': 'உண்மை மற்றும் கருத்து', 'Know the difference': 'வித்தியாசத்தை அறிந்து கொள்ளுங்கள்',
                    'Vocabulary in Context': 'சூழலில் சொல்லகராதி', 'Use new words in context': 'சூழலில் புதிய வார்த்தைகளைப் பயன்படுத்தவும்',
                    'Author\'s Purpose': 'ஆசிரியரின் நோக்கம்', 'Why did the author write this?': 'ஆசிரியர் இதை ஏன் எழுதினார்?',
                    'Summarizing': 'சுருக்கம் செய்தல்', 'Identify core summaries': 'முக்கிய சுருக்கங்களை அடையாளம் காணவும்',
                    'Drawing Conclusions': 'முடிவுகளை எடுத்தல்', 'Make judgements based on facts': 'உண்மைகளின் அடிப்படையில் தீர்ப்புகளை வழங்குங்கள்',
                    'Point of View': '노க்குநிலை', 'Understand who is speaking': 'யார் பேசுகிறார்கள் என்பதைப் புரிந்து கொள்ளுங்கள்',
                    'Theme': 'கருப்பொருள்', 'Discover the main message': 'முக்கிய செய்தியைக் கண்டறியவும்',
                    'Figurative Language': 'அணிநடை மொழி', 'Understand metaphors and similes': 'உருவகங்கள் மற்றும் உவமைகளைப் புரிந்து கொள்ளுங்கள்',
                    'Advertisement Analysis': 'விளம்பர பகுப்பாய்வு', 'Evaluate ads and promotions': 'விளம்பரங்கள் மற்றும் விளம்பரங்களை மதிப்பிடுங்கள்',
                    'Letter & Email Writing': 'கடிதம் மற்றும் மின்னஞ்சல் எழுதுதல்', 'Write formal letters and applications': 'முறையான கடிதங்கள் மற்றும் விண்ணப்பங்களை எழுதுங்கள்',
                    'Debate & Discussion': 'விவாதம் மற்றும் உரையாடல்', 'Daily Communication & Conversation Practice': 'தினசரி தொடர்பு மற்றும் உரையாடல் பயிற்சி',
                    'Essay Writing': 'கட்டுரை எழுதுதல்', 'Write structured and impressive essays': 'கட்டமைக்கப்பட்ட மற்றும் ஈர்க்கக்கூடிய கட்டுரைகளை எழுதுங்கள்',
                    'Critical Thinking Puzzles': 'சிந்தனை புதிர்கள்', 'Solve advanced comprehension puzzles': 'மேம்பட்ட புதிர்களை தீர்க்கவும்',
                    'Stories & Literature': 'கதைகள் மற்றும் இலக்கியம்',
                    'Read, analyze and enjoy beautiful stories.': 'அழகான கதைகளைப் படித்து, பகுப்பாய்வு செய்து மகிழுங்கள்.',
                    'The Honest Farmer': 'நேர்மையான விவசாயி',
                    'Once, there lived a farmer who was known for his honesty. One day, he found a bag of gold coins in his field. Instead of keeping it, he went to the village chief to find the owner. The owner rewarded him for his honesty. Moral: Honesty is always rewarded.': 'முன்னொரு காலத்தில், நேர்மைக்காக அறியப்பட்ட ஒரு விவசாயி வாழ்ந்து வந்தார். ஒரு நாள், அவருக்குத் தனது நிலத்தில் தங்க நாணயங்கள் நிறைந்த பை கிடைத்தது. அதைத் தன்வசம் வைத்திருப்பதற்குப் பதிலாக, அதன் உரிமையாளரைக் கண்டுபிடிக்க அவர் ஊர்த் தலைவரிடம் சென்றார். உரிமையாளர் அவரது நேர்மைக்காக அவருக்குப் பரிசு வழங்கினார். நீதி: நேர்மைக்கு எப்போதும் பலன் உண்டு.',
                    'Story Comprehension': 'கதையின் புரிதல்',
                    'Character Analysis': 'கதாபாத்திர பகுப்பாய்வு',
                    'Theme & Moral': 'கருப்பொருள் மற்றும் நீதி',
                    'Vocabulary Check': 'சொற்களஞ்சிய சோதனை',
                    'Who is the main character in the story?': 'கதையின் முக்கிய கதாபாத்திரம் யார்?',
                    'The farmer': 'விவசாயி', 'The dog': 'நாய்', 'The market': 'சந்தை', 'The sun': 'சூரியன்',
                    'Why was the farmer known?': 'விவசாயி எதற்காக அறியப்பட்டார்?',
                    'For his wealth': 'அவரது செல்வத்திற்காக', 'For his honesty': 'அவரது நேர்மைக்காக', 'For his laziness': 'அவரது சோம்பேறித்தனத்திற்காக', 'For his anger': 'அவரது கோபத்திற்காக',
                    'What is the moral of the story?': 'கதையின் நீதி என்ன?',
                    'Greed is good': 'பேராசை நல்லது', 'Honesty is always rewarded': 'நேர்மைக்கு எப்போதும் பலன் உண்டு', 'Money is everything': 'பணமே எல்லாமும்', 'Never work hard': 'கடினமாக உழைக்கக் கூடாது',
                    'What does "honesty" mean?': '"நேர்மை" என்றால் என்ன?',
                    'Being truthful': 'உண்மையாக இருப்பது', 'Being rich': 'பணக்காரராக இருப்பது', 'Being funny': 'வேடிக்கையாக இருப்பது', 'Being strong': 'வலிமையாக இருப்பது',
                    'Daily Communication': 'தினசரி தொடர்பு',
                    'Conversation Practice': 'உரையாடல் பயிற்சி',
                    'Hi! How was your weekend?': 'வணக்கம்! உங்கள் வார இறுதி எவ்வாறு கழிந்தது?',
                    'It was great! I went hiking with my friends. The weather was perfect.': 'மிகவும் அருமையாக இருந்தது! நான் என் நண்பர்களுடன் மலை ஏறிச் சென்றேன். வானிலை மிகச் சிறப்பாக இருந்தது.',
                    'That sounds fun! What did you enjoy the most?': 'கேட்க மகிழ்ச்சியாக உள்ளது! நீங்கள் எதை மிகவும் ரசித்தீர்கள்?',
                    'I loved the beautiful view from the top!': 'உச்சியிலிருந்து தெரிந்த அழகான காட்சி எனக்கு மிகவும் பிடித்திருந்தது!',
                    'The food we packed was delicious.': 'நாங்கள் கொண்டு சென்ற உணவு மிகவும் சுவையாக இருந்தது.',
                    'Just walking with my friends.': 'நண்பர்களுடன் சும்மா நடந்து சென்றது.',
                    'Essay Writing': 'கட்டுரை எழுதுதல்',
                    'Plan, write and structure impressive essays.': 'ஈர்க்கக்கூடிய கட்டுரைகளைத் திட்டமிட்டு, எழுதி, கட்டமைக்கவும்.',
                    'Is Technology Making Our Lives Better or Worse?': 'தொழில்நுட்பம் நமது வாழ்க்கையை சிறந்ததாக்குகிறதா அல்லது மோசமாக்குகிறதா?',
                    'Introduction': 'அறிமுகம் (Introduction)', 'Body Paragraph 1': 'உடல் பத்தி ೧ (Body Paragraph 1)', 'Body Paragraph 2': 'உடல் பத்தி ೨ (Body Paragraph 2)', 'Conclusion': 'முடிவுரை (Conclusion)',
                    'Organize your ideas': 'உங்கள் கருத்துக்களை ஒழுங்கமைக்கவும்', 'Use examples and facts': 'உதாரணங்களையும் உண்மைகளையும் பயன்படுத்தவும்', 'Write coherently': 'தொடர்புடையதாக எழுதவும்', 'Conclude effectively': 'பயனுள்ள முறையில் முடிக்கவும்',
                    'Letter & Email Writing': 'கடிதம் மற்றும் மின்னஞ்சல் எழுதுதல்',
                    'Write formal letters, emails and applications': 'முறையான கடிதங்கள், மின்னஞ்சல்கள் மற்றும் விண்ணப்பங்களை எழுதுங்கள்',
                    'Manager': 'மேலாளர்', 'Sick Leave Application': 'மருத்துவ விடுப்பு விண்ணப்பம்',
                    'Dear Sir/Madam, I am writing to request sick leave for today due to a sudden fever. Please approve my leave.': 'மதிப்பிற்குரிய ஐயா/அம்மையீர், திடீர் காய்ச்சல் காரணமாக இன்று மருத்துவ விடுப்பு வழங்குமாறு கேட்டுக்கொள்கிறேன். தயவுசெய்து எனது விடுப்பை அங்கீகரிக்கவும்.',
                    'Great job!': 'அருமை!', 'You completed the advanced checkup challenge!': 'மேம்பட்ட அளவிலான சவாலை நீங்கள் வெற்றிகரமாக முடித்துவிட்டீர்கள்!',
                    'Learn step by step and master functional skills!': 'படிப்படியாகக் கற்றுக்கொண்டு நடைமுறைத் திறன்களை மாஸ்டர் செய்யுங்கள்!',
                    'Read and practice real life scenarios': 'நிஜ வாழ்க்கை காட்சிகளைப் படித்து பயிற்சி செய்யுங்கள்',
                    'Pass the concept checkup challenge': 'கருத்து சரிபார்ப்பு சவாலில் தேர்ச்சி பெறுங்கள்'
                }
            }

            ADVANCED_QUIZ_TRANSLATIONS = {
                'hi': {
                    'Who is the main character in the story?': 'कहानी का मुख्य पात्र कौन है?',
                    'The honest farmer is the primary character in this story.': 'ईमानदार किसान इस कहानी का मुख्य पात्र है।',
                    'What is the main idea of the passage?': 'गद्यांश का मुख्य विचार क्या है?',
                    'The details explain how to clean, feed and look after a cat.': 'विवरण बिल्ली को साफ करने, खिलाने और उसकी देखभाल करने का तरीका बताता है।',
                    'It started raining and the boy took an umbrella with him. What can we infer?': 'बारिश शुरू हो गई और लड़का अपने साथ छाता ले गया। हम क्या निष्कर्ष निकाल सकते हैं?',
                    'Taking an umbrella means he plans to walk out in the rain.': 'छाता लेने का मतलब है कि वह बारिश में बाहर जाने की योजना बना रहा है।',
                    'What does the word "generous" mean in this sentence? She is a generous person who always helps others.': 'इस वाक्य में "उदार" (generous) शब्द का क्या अर्थ है? वह एक उदार व्यक्ति है जो हमेशा दूसरों की मदद करती है।',
                    'Generous means giving and kind.': 'उदार का अर्थ है दयालु और दान करने वाला।',
                    'Why did the plants wilt?': 'पौधे क्यों मुरझा गए?',
                    'Lack of water causes plants to dry and wilt.': 'पानी की कमी से पौधे सूखकर मुरझा जाते हैं।',
                    'Put these events in the correct order.\n1. The seeds were planted.\n2. The plant grew bigger.\n3. The seeds were watered.': 'इन घटनाओं को सही क्रम में रखें:\n1. बीज बोए गए।\n2. पौधा बड़ा हो गया।\n3. बीजों को पानी दिया गया।',
                    'Planting happens first, then watering, which leads to growth.': 'रोपण पहले होता है, फिर पानी देना, जिससे विकास होता है।',
                    'How are a cat and a dog alike?': 'बिल्ली और कुत्ता किस प्रकार समान हैं?',
                    'Cats and dogs are common domestic house pets.': 'बिल्ली और कुत्ते आम घरेलू पालतू जानवर हैं।',
                    'Which of these is an opinion?': 'इनमें से कौन सी एक राय (ओपिनियन) है?',
                    'Chocolate taste is personal preference, hence it is an opinion.': 'चॉकलेट का स्वाद व्यक्तिगत पसंद है, इसलिए यह एक राय है।',
                    'Choose the word that best fits the blank. She felt _______ when she won the prize.': 'रिक्त स्थान के लिए सबसे उपयुक्त शब्द चुनें। जब उसने पुरस्कार जीता, तो वह _______ महसूस कर रही थी।',
                    'Winning a prize makes someone feel happy and excited.': 'पुरस्कार जीतने से व्यक्ति खुश और उत्साहित महसूस करता है।',
                    'Why did the author write this passage?': 'लेखक ने यह गद्यांश क्यों लिखा?',
                    'The informational passage aims to share facts and details.': 'जानकारीपूर्ण गद्यांश का उद्देश्य तथ्यों और विवरणों को साझा करना है।',
                    'What is the best summary of a story about a hard-working student?': 'एक मेहनती छात्र की कहानी का सबसे अच्छा सारांश क्या है?',
                    'A summary highlights the main action and result.': 'सारांश मुख्य कार्य और परिणाम को उजागर करता है।',
                    'The street is wet and everyone is holding umbrellas. What conclusion can you draw?': 'सड़क गीली है और सभी ने छाता लिया हुआ है। आप क्या निष्कर्ष निकाल सकते हैं?',
                    'Umbrellas and wet streets are clear evidence of rain.': 'छाते और गीली सड़कें बारिश का स्पष्ट प्रमाण हैं।',
                    'If the narrator says "I walked to the store", which point of view is it?': 'यदि कथावाचक कहता है "मैं दुकान पर गया", तो यह कौन सा दृष्टिकोण है?',
                    'The pronoun "I" indicates first-person narrative.': 'सर्वनाम "मैं" प्रथम पुरुष वर्णन को दर्शाता है।',
                    'In a story where a friend helps another during a storm, what is the theme?': 'एक कहानी में जहाँ एक दोस्त तूफान के दौरान दूसरे की मदद करता है, थीम क्या है?',
                    'The theme represents the deeper message about friendship.': 'थीम दोस्ती के बारे में गहरे संदेश का प्रतिनिधित्व करती है।',
                    'Which of these is a simile comparing height?': 'इनमें से कौन सी ऊंचाई की तुलना करने वाली उपमा (simile) है?',
                    '"As tall as a tree" compares height using "as".': '"पेड़ जितना लंबा" "जितना" का उपयोग करके ऊंचाई की तुलना करता है।',
                    'An ad says: "Buy one get one free!" What is its purpose?': 'एक विज्ञापन कहता है: "एक खरीदें, एक मुफ्त पाएं!" इसका उद्देश्य क्या है?',
                    'Ads use deals to persuade customers to buy products.': 'विज्ञापन ग्राहकों को उत्पाद खरीदने के लिए राजी करने के लिए सौदों का उपयोग करते हैं।',
                    'Which greeting is most appropriate for a formal email to a boss?': 'बॉस को औपचारिक ईमेल के लिए कौन सा अभिवादन सबसे उपयुक्त है?',
                    '"Dear Sir/Madam" is a standard formal greeting.': '"प्रिय महोदय/महोदया" एक मानक औपचारिक अभिवादन है।',
                    'Which response is most polite when you disagree during a debate?': 'वाद-विवाद के दौरान असहमत होने पर कौन सी प्रतिक्रिया सबसे विनम्र है?',
                    'Polite disagreement respects the other speaker\'s view.': 'विनम्र असहमति दूसरे वक्ता के दृष्टिकोण का सम्मान करती है।',
                    'What is the primary purpose of an essay\'s introduction?': 'एक निबंध के परिचय का प्राथमिक उद्देश्य क्या है?',
                    'The introduction sets the scene and thesis statement.': 'परिचय दृश्य और मुख्य कथन को निर्धारित करता है।',
                    'If all birds have wings, and a sparrow is a bird, does a sparrow have wings?': 'यदि सभी पक्षियों के पंख होते हैं, और गौरैया एक पक्षी है, तो क्या गौरैया के पंख होते हैं?',
                    'A sparrow is a bird, so it must follow the rule and have wings.': 'गौरैया एक पक्षी है, इसलिए इसे नियम का पालन करना चाहिए और इसके पंख होने चाहिए।'
                },
                'kn': {
                    'Who is the main character in the story?': 'ಕಥೆಯ ಮುಖ್ಯ ಪಾತ್ರ ಯಾರು?',
                    'The honest farmer is the primary character in this story.': 'ಪ್ರಾಮಾಣಿಕ ರೈತ ಈ ಕಥೆಯ ಮುಖ್ಯ ಪಾತ್ರ.',
                    'What is the main idea of the passage?': 'ಪ್ಯಾರಾಗ್ರಾಫ್‌ನ ಮುಖ್ಯ ಆಲೋಚನೆ ಏನು?',
                    'The details explain how to clean, feed and look after a cat.': 'ವಿವರಗಳು ಬೆಕ್ಕನ್ನು ಹೇಗೆ ಸ್ವಚ್ಛಗೊಳಿಸಬೇಕು, ಆಹಾರ ನೀಡಬೇಕು ಮತ್ತು ಕಾಳಜಿ ವಹಿಸಬೇಕು ಎಂದು ವಿವರಿಸುತ್ತದೆ.',
                    'It started raining and the boy took an umbrella with him. What can we infer?': 'ಮಳೆ ಪ್ರಾರಂಭವಾಯಿತು ಮತ್ತು ಹುಡುಗ ತನ್ನೊಂದಿಗೆ ಕೊಡೆಯನ್ನು ತೆಗೆದುಕೊಂಡನು. ನಾವು ಏನು ಊಹಿಸಬಹುದು?',
                    'Taking an umbrella means he plans to walk out in the rain.': 'ಕೊಡೆಯನ್ನು ತೆಗೆದುಕೊಳ್ಳುವುದು ಎಂದರೆ ಅವನು ಮಳೆಯಲ್ಲಿ ಹೊರಗೆ ಹೋಗಲು ಯೋಜಿಸುತ್ತಿದ್ದಾನೆ ಎಂದರ್ಥ.',
                    'What does the word "generous" mean in this sentence? She is a generous person who always helps others.': 'ಈ ವಾಕ್ಯದಲ್ಲಿ "ಉದಾರ" (generous) ಪದದ ಅರ್ಥವೇನು? ಅವಳು ಯಾವಾಗಲೂ ಇತರರಿಗೆ ಸಹಾಯ ಮಾಡುವ ಉದಾರ ವ್ಯಕ್ತಿ.',
                    'Generous means giving and kind.': 'ಉದಾರ ಎಂದರೆ ದಯೆಯುಳ್ಳ ಮತ್ತು ಕೊಡುವ ಗುಣವಿರುವ.',
                    'Why did the plants wilt?': 'ಗಿಡಗಳು ಏಕೆ ಬಾಡಿಹೋದವು?',
                    'Lack of water causes plants to dry and wilt.': 'ನೀರಿನ ಕೊರತೆಯು ಗಿಡಗಳು ಒಣಗಿ ಬಾಡಿಹೋಗಲು ಕಾರಣವಾಗುತ್ತದೆ.',
                    'Put these events in the correct order.\n1. The seeds were planted.\n2. The plant grew bigger.\n3. The seeds were watered.': 'ಈ ಘಟನೆಗಳನ್ನು ಸರಿಯಾದ ಕ್ರಮದಲ್ಲಿ ಇರಿಸಿ:\n1. ಬೀಜಗಳನ್ನು ಬಿತ್ತಲಾಯಿತು.\n2. ಗಿಡ ದೊಡ್ಡದಾಗಿ ಬೆಳೆಯಿತು.\n3. ಬೀಜಗಳಿಗೆ ನೀರುಣಿಸಲಾಯಿತು.',
                    'Planting happens first, then watering, which leads to growth.': 'ಬಿತ್ತನೆ ಮೊದಲು ಸಂಭವಿಸುತ್ತದೆ, ನಂತರ ನೀರುಣಿಸುವುದು, ಇದು ಬೆಳವಣಿಗೆಗೆ ಕಾರಣವಾಗುತ್ತದೆ.',
                    'How are a cat and a dog alike?': 'ಬೆಕ್ಕು ಮತ್ತು ನಾಯಿ ಹೇಗೆ ಹೋಲುತ್ತವೆ?',
                    'Cats and dogs are common domestic house pets.': 'ಬೆಕ್ಕುಗಳು ಮತ್ತು ನಾಯಿಗಳು ಸಾಮಾನ್ಯ ಸಾಕುಪ್ರಾಣಿಗಳಾಗಿವೆ.',
                    'Which of these is an opinion?': 'ಇವುಗಳಲ್ಲಿ ಯಾವುದು ಅಭಿಪ್ರಾಯವಾಗಿದೆ?',
                    'Chocolate taste is personal preference, hence it is an opinion.': 'ಚಾಕೊಲೇಟ್ ರುಚಿ ವೈಯಕ್ತಿಕ ಆದ್ಯತೆಯಾಗಿದೆ, ಆದ್ದರಿಂದ ಇದು ಒಂದು ಅಭಿಪ್ರಾಯವಾಗಿದೆ.',
                    'Choose the word that best fits the blank. She felt _______ when she won the prize.': 'ಖಾಲಿ ಜಾಗಕ್ಕೆ ಸೂಕ್ತವಾದ ಪದವನ್ನು ಆರಿಸಿ. ಅವಳು ಬಹುಮಾನ ಗೆದ್ದಾಗ _______ ಅನುಭವಿಸಿದಳು.',
                    'Winning a prize makes someone feel happy and excited.': 'ಬಹುಮಾನವನ್ನು ಗೆಲ್ಲುವುದು ಯಾರನ್ನಾದರೂ ಸಂತೋಷಪಡಿಸುತ್ತದೆ.',
                    'Why did the author write this passage?': 'ಲೇಖಕರು ಈ ಪ್ಯಾರಾಗ್ರಾಫ್ ಅನ್ನು ಏಕೆ ಬರೆದಿದ್ದಾರೆ?',
                    'The informational passage aims to share facts and details.': 'ಮಾಹಿತಿ ನೀಡುವ ಪ್ಯಾರಾಗ್ರಾಫ್ ಸತ್ಯಗಳು ಮತ್ತು ವಿವರಗಳನ್ನು ಹಂಚಿಕೊಳ್ಳುವ ಗುರಿಯನ್ನು ಹೊಂದಿದೆ.',
                    'What is the best summary of a story about a hard-working student?': 'ಕಷ್ಟಪಟ್ಟು ಓದುವ ವಿದ್ಯಾರ್ಥಿಯ ಕಥೆಯ ಅತ್ಯುತ್ತಮ ಸಾರಾಂಶ ಯಾವುದು?',
                    'A summary highlights the main action and result.': 'ಸಾರಾಂಶವು ಪ್ರಮುಖ ಕ್ರಮ ಮತ್ತು ಫಲಿತಾಂಶವನ್ನು ಎತ್ತಿ ತೋರಿಸುತ್ತದೆ.',
                    'The street is wet and everyone is holding umbrellas. What conclusion can you draw?': 'ರಸ್ತೆ ಒದ್ದೆಯಾಗಿದೆ ಮತ್ತು ಪ್ರತಿಯೊಬ್ಬರೂ ಕೊಡೆಗಳನ್ನು ಹಿಡಿದಿದ್ದಾರೆ. ನೀವು ಯಾವ ತೀರ್ಮಾನವನ್ನು ತೆಗೆದುಕೊಳ್ಳಬಹುದು?',
                    'Umbrellas and wet streets are clear evidence of rain.': 'ಕೊಡೆಗಳು ಮತ್ತು ಒದ್ದೆಯಾದ ರಸ್ತೆಗಳು ಮಳೆಯ ಸ್ಪಷ್ಟ ಪುರಾವೆಗಳಾಗಿವೆ.',
                    'If the narrator says "I walked to the store", which point of view is it?': 'ನಿರೂಪಕನು "ನಾನು ಅಂಗಡಿಗೆ ಹೋದೆ" ಎಂದು ಹೇಳಿದರೆ, ಅದು ಯಾವ ದೃಷ್ಟಿಕೋನ?',
                    'The pronoun "I" indicates first-person narrative.': '"ನಾನು" ಎಂಬ ಸರ್ವನಾಮವು ಪ್ರಥಮ ಪುರುಷ ನಿರೂಪಣೆಯನ್ನು ಸೂಚಿಸುತ್ತದೆ.',
                    'In a story where a friend helps another during a storm, what is the theme?': 'ಬಿರುಗಾಳಿಯ ಸಮಯದಲ್ಲಿ ಸ್ನೇಹಿತನೊಬ್ಬ ಇನ್ನೊಬ್ಬನಿಗೆ ಸಹಾಯ ಮಾಡುವ ಕಥೆಯಲ್ಲಿ, ವಿಷಯ ಯಾವುದು?',
                    'The theme represents the deeper message about friendship.': 'ವಿಷಯವು ಸ್ನೇಹದ ಬಗೆಗಿನ ಆಳವಾದ ಸಂದೇಶವನ್ನು ಪ್ರತಿನಿಧಿಸುತ್ತದೆ.',
                    'Which of these is a simile comparing height?': 'ಇವುಗಳಲ್ಲಿ ಯಾವುದು ಎತ್ತರವನ್ನು ಹೋಲಿಸುವ ಉಪಮೆಯಾಗಿದೆ (simile)?',
                    '"As tall as a tree" compares height using "as".': '"ಮರದಷ್ಟು ಎತ್ತರ" ಎನ್ನುವುದು ಎತ್ತರವನ್ನು ಹೋಲಿಸುತ್ತದೆ.',
                    'An ad says: "Buy one get one free!" What is its purpose?': 'ಜಾಹೀರಾತೊಂದು ಹೇಳುತ್ತದೆ: "ಒಂದು ಕೊಂಡರೆ ಒಂದು ಉಚಿತ!" ಇದರ उद्देश्यವೇನು?',
                    'Ads use deals to persuade customers to buy products.': 'ಜಾಹೀರಾತುಗಳು ಗ್ರಾಹಕರನ್ನು ಉತ್ಪನ್ನಗಳನ್ನು ಖರೀದಿಸಲು ಪ್ರೇರೇಪಿಸುತ್ತವೆ.',
                    'Which greeting is most appropriate for a formal email to a boss?': 'ಬಾಸ್‌ಗೆ ಕಳುಹಿಸುವ ಔಪಚಾರಿಕ ಇಮೇಲ್‌ಗೆ ಯಾವ ಶುಭಾಶಯ ಅತ್ಯಂತ ಸೂಕ್ತವಾಗಿದೆ?',
                    '"Dear Sir/Madam" is a standard formal greeting.': '"ಆತ್ಮೀಯ ಮಹನೀಯರೇ/ಮಹಿಳೆಯರೇ" ಎಂಬುದು ಪ್ರಮಾಣಿತ ಔಪಚಾರಿಕ ಶುಭಾಶಯವಾಗಿದೆ.',
                    'Which response is most polite when you disagree during a debate?': 'ಚರ್ಚೆಯ ಸಮಯದಲ್ಲಿ ನೀವು ಭಿನ್ನಾಭಿಪ್ರಾಯ ಹೊಂದಿರುವಾಗ ಯಾವ ಪ್ರತಿಕ್ರಿಯೆ ಅತ್ಯಂತ ಸಭ್ಯವಾಗಿದೆ?',
                    'Polite disagreement respects the other speaker\'s view.': 'ಸಭ್ಯ ಭಿನ್ನಾಭಿಪ್ರಾಯವು ಇತರ ಭಾಷಣಕಾರರ ದೃಷ್ಟಿಕೋನವನ್ನು ಗೌರವಿಸುತ್ತದೆ.',
                    'What is the primary purpose of an essay\'s introduction?': 'ಪ್ರಬಂಧದ ಪೀಠಿಕೆಯ ಪ್ರಾಥಮಿಕ ಉದ್ದೇಶವೇನು?',
                    'The introduction sets the scene and thesis statement.': 'ಪೀಠಿಕೆಯು ವಿಷಯ ಮತ್ತು ಮುಖ್ಯ ಪ್ರತಿಪಾದನೆಯನ್ನು ಹೊಂದಿಸುತ್ತದೆ.',
                    'If all birds have wings, and a sparrow is a bird, does a sparrow have wings?': 'ಎಲ್ಲಾ ಹಕ್ಕಿಗಳಿಗೆ ರೆಕ್ಕೆಗಳಿದ್ದರೆ ಮತ್ತು ಗುಬ್ಬಚ್ಚಿ ಒಂದು ಹಕ್ಕಿಯಾಗಿದ್ದರೆ, ಗುಬ್ಬಚ್ಚಿಗೆ ರೆಕ್ಕೆಗಳಿವೆಯೇ?',
                    'A sparrow is a bird, so it must follow the rule and have wings.': 'ಗುಬ್ಬಚ್ಚಿ ಒಂದು ಹಕ್ಕಿಯಾಗಿದೆ, ಆದ್ದರಿಂದ ಅದು ನಿಯಮವನ್ನು ಪಾಲಿಸಬೇಕು ಮತ್ತು ರೆಕ್ಕೆಗಳನ್ನು ಹೊಂದಿರಬೇಕು.'
                },
                'ta': {
                    'Who is the main character in the story?': 'கதையின் முக்கிய கதாபாத்திரம் யார்?',
                    'The honest farmer is the primary character in this story.': 'நேர்மையான விவசாயி இக்கதையின் முக்கிய கதாபாத்திரம் ஆவார்.',
                    'What is the main idea of the passage?': 'பத்தியின் முக்கிய கருத்து என்ன?',
                    'The details explain how to clean, feed and look after a cat.': 'விவரங்கள் பூனையை எவ்வாறு சுத்தம் செய்வது, உணவளிப்பது மற்றும் கவனிப்பது என்பதை விளக்குகின்றன.',
                    'It started raining and the boy took an umbrella with him. What can we infer?': 'மழை பெய்யத் தொடங்கியது, சிறுவன் ஒரு குடையை எடுத்துச் சென்றான். நாம் என்ன யூகிக்கலாம்?',
                    'Taking an umbrella means he plans to walk out in the rain.': 'குடை எடுத்துச் செல்வது என்பது அவன் மழையில் வெளியே செல்ல திட்டமிடுகிறான் என்பதாகும்.',
                    'What does the word "generous" mean in this sentence? She is a generous person who always helps others.': 'இந்த வாக்கியத்தில் "கொடைத்தன்மை" (generous) என்ற வார்த்தையின் பொருள் என்ன? அவள் எப்போதும் பிறருக்கு உதவும் ஒரு கொடைத்தன்மை உள்ள நபர்.',
                    'Generous means giving and kind.': 'கொடையுள்ள என்பது கொடுக்கும் குணமும் அன்பும் கொண்டதாகும்.',
                    'Why did the plants wilt?': 'செடிகள் ஏன் வாடின?',
                    'Lack of water causes plants to dry and wilt.': 'தண்ணீர் பற்றாக்குறை செடிகள் காய்ந்து வாடிப் போக காரணமாகிறது.',
                    'Put these events in the correct order.\n1. The seeds were planted.\n2. The plant grew bigger.\n3. The seeds were watered.': 'இந்த நிகழ்வுகளை சரியான வரிசையில் வைக்கவும்:\n1. விதைகள் விதைக்கப்பட்டன.\n2. செடி பெரிதாக வளர்ந்தது.\n3. விதைகளுக்கு நீர் பாய்ச்சப்பட்டது.',
                    'Planting happens first, then watering, which leads to growth.': 'விதைப்பது முதலில் நடக்கிறது, பின்னர் நீர் பாய்ச்சுவது, இது வளர்ச்சிக்கு வழிவகுக்கிறது.',
                    'How are a cat and a dog alike?': 'பூனையும் நாயும் எவ்வாறு ஒரே மாதிரியானவை?',
                    'Cats and dogs are common domestic house pets.': 'பூனைகளும் நாய்களும் பொதுவான செல்லப்பிராணிகளாகும்.',
                    'Which of these is an opinion?': 'இவற்றில் எது ஒரு கருத்து (opinion) ஆகும்?',
                    'Chocolate taste is personal preference, hence it is an opinion.': 'சாக்லேட் சுவை தனிப்பட்ட விருப்பமாகும், எனவே அது ஒரு கருத்து.',
                    'Choose the word that best fits the blank. She felt _______ when she won the prize.': 'கோடிட்ட இடத்திற்கு மிகவும் பொருத்தமான வார்த்தையைத் தேர்ந்தெடுக்கவும். பரிசு வென்றபோது அவள் _______ உணர்ந்தாள்.',
                    'Winning a prize makes someone feel happy and excited.': 'பரிசு வெல்வது ஒருவரை மகிழ்ச்சியடையச் செய்கிறது.',
                    'Why did the author write this passage?': 'ஆசிரியர் இந்த பத்தியை ஏன் எழுதினார்?',
                    'The informational passage aims to share facts and details.': 'தகவல் தரும் பத்தி உண்மைகளையும் விவரங்களையும் பகிர்ந்து கொள்வதை நோக்கமாகக் கொண்டுள்ளது.',
                    'What is the best summary of a story about a hard-working student?': 'கடினமாக உழைக்கும் ஒரு மாணவனைப் பற்றிய கதையின் சிறந்த சுருக்கம் எது?',
                    'A summary highlights the main action and result.': 'சுருக்கம் என்பது முக்கிய செயலையும் அதன் முடிவையும் காட்டுகிறது.',
                    'The street is wet and everyone is holding umbrellas. What conclusion can you draw?': 'தெரு ஈரமாகவும் அனைவரும் குடை பிடித்தும் உள்ளனர். நீங்கள் என்ன முடிவுக்கு வரலாம்?',
                    'Umbrellas and wet streets are clear evidence of rain.': 'குடைகளும் ஈரமான தெருக்களும் மழை பெய்ததற்கான தெளிவான ஆதாரங்களாகும்.',
                    'If the narrator says "I walked to the store", which point of view is it?': 'கதை சொல்பவர் "நான் கடைக்குச் சென்றேன்" என்று கூறினால், அது எந்த நோக்குநிலை?',
                    'The pronoun "I" indicates first-person narrative.': '"நான்" என்ற பிரதிபெயர் தன்மை நோக்குநிலையைக் குறிக்கிறது.',
                    'In a story where a friend helps another during a storm, what is the theme?': 'புயலின் போது ஒரு நண்பன் மற்றொருவருக்கு உதவும் கதையில், அதன் கருப்பொருள் என்ன?',
                    'The theme represents the deeper message about friendship.': 'கருப்பொருள் என்பது நட்பைப் பற்றிய ஆழமான செய்தியைக் குறிக்கிறது.',
                    'Which of these is a simile comparing height?': 'இவற்றில் எது உயரத்தை ஒப்பிடும் உவமை (simile) ஆகும்?',
                    '"As tall as a tree" compares height using "as".': '"மரத்தைப் போல உயரமானவன்" என்பது உயரத்தை ஒப்பிடுகிறது.',
                    'An ad says: "Buy one get one free!" What is its purpose?': 'ஒரு விளம்பரம் கூறுகிறது: "ஒன்று வாங்கினால் ஒன்று இலவசம்!" இதன் நோக்கம் என்ன?',
                    'Ads use deals to persuade customers to buy products.': 'விளம்பரங்கள் வாடிக்கையாளர்களை வாங்க தூண்டுவதற்கு சலுகைகளைப் பயன்படுத்துகின்றன.',
                    'Which greeting is most appropriate for a formal email to a boss?': 'ஒரு முதலாளிக்கு முறையான மின்னஞ்சல் அனுப்ப எந்த வாழ்த்து மிகவும் பொருத்தமானது?',
                    '"Dear Sir/Madam" is a standard formal greeting.': '"மதிப்பிற்குரிய ஐயா/அம்மையீர்" என்பது ஒரு முறையான வாழ்த்தாகும்.',
                    'Which response is most polite when you disagree during a debate?': 'விவாதத்தின் போது நீங்கள் உடன்படாதபோது எந்தப் பதில் மிகவும் கண்ணியமானது?',
                    'Polite disagreement respects the other speaker\'s view.': 'கண்ணியமான கருத்து வேறுபாடு மற்ற பேச்சாளரின் கருத்தை மதிக்கிறது.',
                    'What is the primary purpose of an essay\'s introduction?': 'கட்டுரையின் முன்னுரையின் முதன்மை நோக்கம் என்ன?',
                    'The introduction sets the scene and thesis statement.': 'முன்னுரை என்பது தலைப்பையும் முக்கிய வாதத்தையும் அமைக்கிறது.',
                    'If all birds have wings, and a sparrow is a bird, does a sparrow have wings?': 'அனைத்து பறவைகளுக்கும் இறக்கைகள் இருந்தால், சிட்டுக்குருவி ஒரு பறவை என்றால், சிட்டுக்குருவிக்கு இறக்கைகள் இருக்குமா?',
                    'A sparrow is a bird, so it must follow the rule and have wings.': 'சிட்டுக்குருவி ஒரு பறவை, எனவே அது விதியைப் பின்பற்றி இறக்கைகளைக் கொண்டிருக்க வேண்டும்.'
                }
            }

            ADVANCED_QUIZ_POOL = {
                1: {
                    'question': 'Who is the main character in the story?',
                    'options': ['The farmer', 'The dog', 'The market', 'The sun'],
                    'correct_index': 0,
                    'explanation': 'The honest farmer is the primary character in this story.'
                },
                2: {
                    'question': 'What is the main idea of the passage?',
                    'options': ['The cat is playing', 'Cats are good pets', 'How to take care of a cat', 'The cat is sleeping'],
                    'correct_index': 2,
                    'explanation': 'The details explain how to clean, feed and look after a cat.'
                },
                3: {
                    'question': 'It started raining and the boy took an umbrella with him. What can we infer?',
                    'options': ['He likes umbrellas', 'He was going outside', 'He does not like rain', 'He lost his umbrella'],
                    'correct_index': 1,
                    'explanation': 'Taking an umbrella means he plans to walk out in the rain.'
                },
                4: {
                    'question': 'What does the word "generous" mean in this sentence? She is a generous person who always helps others.',
                    'options': ['Kind', 'Angry', 'Lazy', 'Scared'],
                    'correct_index': 0,
                    'explanation': 'Generous means giving and kind.'
                },
                5: {
                    'question': 'Why did the plants wilt?',
                    'options': ['Because it was sunny', 'Because they did not get water', 'Because of the wind', 'Because they were old'],
                    'correct_index': 1,
                    'explanation': 'Lack of water causes plants to dry and wilt.'
                },
                6: {
                    'question': 'Put these events in the correct order.\n1. The seeds were planted.\n2. The plant grew bigger.\n3. The seeds were watered.',
                    'options': ['1 → 2 → 3', '2 → 1 → 3', '1 → 3 → 2', '3 → 1 → 2'],
                    'correct_index': 2,
                    'explanation': 'Planting happens first, then watering, which leads to growth.'
                },
                7: {
                    'question': 'How are a cat and a dog alike?',
                    'options': ['Both can fly', 'Both are pets', 'Both live in water', 'Both are wild animals'],
                    'correct_index': 1,
                    'explanation': 'Cats and dogs are common domestic house pets.'
                },
                8: {
                    'question': 'Which of these is an opinion?',
                    'options': ['The sun rises in the east', 'Water freezes at 0°C', 'Chocolate ice cream is the best', 'Birds have wings'],
                    'correct_index': 2,
                    'explanation': 'Chocolate taste is personal preference, hence it is an opinion.'
                },
                9: {
                    'question': 'Choose the word that best fits the blank. She felt _______ when she won the prize.',
                    'options': ['happy', 'sad', 'tired', 'angry'],
                    'correct_index': 0,
                    'explanation': 'Winning a prize makes someone feel happy and excited.'
                },
                10: {
                    'question': 'Why did the author write this passage?',
                    'options': ['To entertain', 'To inform', 'To persuade', 'To scare'],
                    'correct_index': 1,
                    'explanation': 'The informational passage aims to share facts and details.'
                },
                11: {
                    'question': 'What is the best summary of a story about a hard-working student?',
                    'options': ['A student studies hard and achieves success.', 'School is boring.', 'Playing games is fun.', 'Teachers are nice.'],
                    'correct_index': 0,
                    'explanation': 'A summary highlights the main action and result.'
                },
                12: {
                    'question': 'The street is wet and everyone is holding umbrellas. What conclusion can you draw?',
                    'options': ['It has been raining.', 'It is very cold.', 'It is night time.', 'The road is closed.'],
                    'correct_index': 0,
                    'explanation': 'Umbrellas and wet streets are clear evidence of rain.'
                },
                13: {
                    'question': 'If the narrator says "I walked to the store", which point of view is it?',
                    'options': ['First Person ("I")', 'Second Person ("You")', 'Third Person ("He/She")', 'Unknown'],
                    'correct_index': 0,
                    'explanation': 'The pronoun "I" indicates first-person narrative.'
                },
                14: {
                    'question': 'In a story where a friend helps another during a storm, what is the theme?',
                    'options': ['A friend in need is a friend indeed.', 'Storms are dangerous.', 'Boats are expensive.', 'Always buy umbrellas.'],
                    'correct_index': 0,
                    'explanation': 'The theme represents the deeper message about friendship.'
                },
                15: {
                    'question': 'Which of these is a simile comparing height?',
                    'options': ['He is as tall as a tree.', 'He is very short.', 'He went home.', 'He likes trees.'],
                    'correct_index': 0,
                    'explanation': '"As tall as a tree" compares height using "as".'
                },
                16: {
                    'question': 'An ad says: "Buy one get one free!" What is its purpose?',
                    'options': ['To persuade you to buy more.', 'To give free gifts.', 'To share medical news.', 'To teach reading.'],
                    'correct_index': 0,
                    'explanation': 'Ads use deals to persuade customers to buy products.'
                },
                17: {
                    'question': 'Which greeting is most appropriate for a formal email to a boss?',
                    'options': ['Dear Sir/Madam,', 'Hey buddy,', 'What\'s up,', 'Hello friend,'],
                    'correct_index': 0,
                    'explanation': '"Dear Sir/Madam" is a standard formal greeting.'
                },
                18: {
                    'question': 'Which response is most polite when you disagree during a debate?',
                    'options': ['I understand your point, but I respectfully disagree.', 'You are completely wrong.', 'Shut up.', 'I do not care.'],
                    'correct_index': 0,
                    'explanation': 'Polite disagreement respects the other speaker\'s view.'
                },
                19: {
                    'question': 'What is the primary purpose of an essay\'s introduction?',
                    'options': ['To introduce the topic and state your main argument.', 'To write the final conclusion.', 'To list references.', 'To ask questions.'],
                    'correct_index': 0,
                    'explanation': 'The introduction sets the scene and thesis statement.'
                },
                20: {
                    'question': 'If all birds have wings, and a sparrow is a bird, does a sparrow have wings?',
                    'options': ['Yes, definitely.', 'No, never.', 'Sometimes.', 'Only in summer.'],
                    'correct_index': 0,
                    'explanation': 'A sparrow is a bird, so it must follow the rule and have wings.'
                }
            }

            ADVANCED_LESSONS_DETAILS = {
                "Main Idea & Details": {
                    "explanation": {
                        "en": "The main idea is what the story is mostly about. Supporting details tell more about the main idea.",
                        "hi": "मुख्य विचार वह है जिसके बारे में कहानी मुख्य रूप से होती है। सहायक विवरण मुख्य विचार के बारे में अधिक बताते हैं।",
                        "kn": "ಮುಖ್ಯ ಆಲೋಚನೆ ಎಂದರೆ ಕಥೆಯು ಯಾವುದರ ಬಗ್ಗೆ ಎಂಬುದಾಗಿದೆ. ಪೂರಕ ವಿವರಗಳು ಮುಖ್ಯ ಆಲೋಚನೆಯ ಬಗ್ಗೆ ಹೆಚ್ಚಿನದನ್ನು ತಿಳಿಸುತ್ತವೆ.",
                        "ta": "முக்கிய கருத்து என்பது கதை எதைப்பற்றியது என்பதாகும். துணை விவரங்கள் முக்கிய கருத்தைப் பற்றி மேலும் கூறுகின்றன."
                    },
                    "voice_target": {
                        "en": "Main Idea",
                        "hi": "मुख्य विचार",
                        "kn": "ಮುಖ್ಯ ಆಲೋಚನೆ",
                        "ta": "முக்கிய கருத்து"
                    }
                },
                "Making Inferences": {
                    "explanation": {
                        "en": "Making an inference is using clues from the story and your own knowledge to guess what happens.",
                        "hi": "निष्कर्ष निकालना कहानी के सुरागों और अपने स्वयं के ज्ञान का उपयोग करके यह अनुमान लगाना है कि क्या होता है।",
                        "kn": "ಅನುಮಾನವನ್ನು ಮಾಡುವುದು ಎಂದರೆ ಕಥೆಯ ಸುಳಿವುಗಳನ್ನು ಮತ್ತು ನಿಮ್ಮ ಸ್ವಂತ ಜ್ಞಾನವನ್ನು ಬಳಸಿ ಏನು ಸಂಭವಿಸುತ್ತದೆ ಎಂದು ಊಹಿಸುವುದಾಗಿದೆ.",
                        "ta": "ஒரு ஊகம் செய்வது என்பது கதையின் குறிப்புகளையும் உங்கள் சொந்த அறிவையும் பயன்படுத்தி என்ன நடக்கிறது என்று யூகிக்க உதவுவதாகும்."
                    },
                    "voice_target": {
                        "en": "Inference",
                        "hi": "निष्कर्ष",
                        "kn": "ಅನುಮಾನ",
                        "ta": "ஊகம்"
                    }
                },
                "Context Clues": {
                    "explanation": {
                        "en": "Context clues are hints found in a sentence to help you figure out the meaning of difficult new words.",
                        "hi": "संदर्भ संकेत एक वाक्य में मिलने वाले संकेत हैं जो आपको कठिन नए शब्दों के अर्थ को समझने में मदद करते हैं।",
                        "kn": "ಸಂದರ್ಭದ ಸುಳಿವುಗಳು ಎಂದರೆ ಕಠಿಣವಾದ ಹೊಸ ಪದಗಳ ಅರ್ಥವನ್ನು ಕಂಡುಹಿಡಿಯಲು ವಾಕ್ಯದಲ್ಲಿ ಕಂಡುಬರುವ ಸುಳಿವುಗಳಾಗಿವೆ.",
                        "ta": "சூழல் குறிப்புகள் என்பது கடினமான புதிய சொற்களின் பொருளைக் கண்டறிய ஒரு வாக்கியத்தில் காணப்படும் குறிப்புகளாகும்."
                    },
                    "voice_target": {
                        "en": "Context Clues",
                        "hi": "संदर्भ संकेत",
                        "kn": "ಸಂದರ್ಭದ ಸುಳಿವುಗಳು",
                        "ta": "சூழல் குறிப்புகள்"
                    }
                },
                "Cause and Effect": {
                    "explanation": {
                        "en": "A cause is why something happens. An effect is what actually happens as a result.",
                        "hi": "कारण वह है जिससे कुछ घटित होता है। प्रभाव वह है जो वास्तव में परिणाम स्वरूप घटित होता है।",
                        "kn": "ಕಾರಣ ಎಂದರೆ ಏನಾದರೂ ಏಕೆ ಸಂಭವಿಸುತ್ತದೆ ಎಂಬುದಾಗಿದೆ. ಪರಿಣಾಮ ಎಂದರೆ ಅದರ ಫಲಿತಾಂಶವಾಗಿ ಸಂಭವಿಸುವುದಾಗಿದೆ.",
                        "ta": "காரணம் என்பது ஒரு விஷயம் ஏன் நடக்கிறது என்பதாகும். விளைவு என்பது அதன் முடிவாக உண்மையில் என்ன நடக்கிறது என்பதாகும்."
                    },
                    "voice_target": {
                        "en": "Cause and Effect",
                        "hi": "कारण और प्रभाव",
                        "kn": "ಕಾರಣ ಮತ್ತು ಪರಿಣಾಮ",
                        "ta": "காரணம் மற்றும் விளைவு"
                    }
                },
                "Sequencing Events": {
                    "explanation": {
                        "en": "Sequencing means putting the events of a story in order from beginning, middle, to end.",
                        "hi": "क्रमबद्धता का अर्थ है किसी कहानी की घटनाओं को शुरू, मध्य और अंत के क्रम में रखना।",
                        "kn": "ಅನುಕ್ರಮ ಎಂದರೆ ಕಥೆಯ ಘಟನೆಗಳನ್ನು ಪ್ರಾರಂಭ, ಮಧ್ಯ ಮತ್ತು ಅಂತ್ಯದ ಕ್ರಮದಲ್ಲಿ ಜೋಡಿಸುವುದಾಗಿದೆ.",
                        "ta": "வரிசைப்படுத்துதல் என்பது கதையின் நிகழ்வுகளை ஆரம்பம், நடு, முடிவு என வரிசையாக அமைப்பதாகும்."
                    },
                    "voice_target": {
                        "en": "Sequencing",
                        "hi": "क्रमबद्धता",
                        "kn": "ಅನುಕ್ರಮ",
                        "ta": "வரிசைப்படுத்துதல்"
                    }
                },
                "Compare and Contrast": {
                    "explanation": {
                        "en": "Compare means finding how two things are alike. Contrast means finding how they are different.",
                        "hi": "तुलना का अर्थ है यह खोजना कि दो चीजें किस प्रकार समान हैं। अंतर का अर्थ है यह खोजना कि वे किस प्रकार भिन्न हैं।",
                        "kn": "ಹೋಲಿಕೆ ಎಂದರೆ ಎರಡು ವಸ್ತುಗಳು ಹೇಗೆ ಒಂದೇ ತರಹ ಇವೆ ಎಂದು ಕಂಡುಹಿಡಿಯುವುದು. ವ್ಯತ್ಯಾಸ ಎಂದರೆ ಅವು ಹೇಗೆ ಭಿನ್ನವಾಗಿವೆ ಎಂದು ತಿಳಿಯುವುದು.",
                        "ta": "ஒப்பிடுதல் என்பது இரண்டு விஷயங்கள் எவ்வாறு ஒரே மாதிரியாக உள்ளன என்பதைக் கண்டறிவதாகும். வேறுபடுத்துதல் என்பது அவை எவ்வாறு வேறுபடுகின்றன என்பதைக் கண்டறிவதாகும்."
                    },
                    "voice_target": {
                        "en": "Compare",
                        "hi": "तुलना",
                        "kn": "ಹೋಲಿಕೆ",
                        "ta": "ஒப்பிடுதல்"
                    }
                },
                "Fact and Opinion": {
                    "explanation": {
                        "en": "A fact is something true that can be proven. An opinion is how someone feels or thinks about something.",
                        "hi": "तथ्य वह है जिसे सिद्ध किया जा सकता है। राय वह है कि कोई किसी चीज़ के बारे में कैसा महसूस करता है या सोचता है।",
                        "kn": "ಸಂಗತಿ ಎಂದರೆ ಸಾಬೀತುಪಡಿಸಬಹುದಾದ ಸತ್ಯವಾಗಿದೆ. ಅಭಿಪ್ರಾಯ ಎಂದರೆ ಯಾರಾದರೂ ಯಾವುದರ ಬಗ್ಗೆ ಹೇಗೆ ಭಾವಿಸುತ್ತಾರೆ ಅಥವಾ ಯೋಚಿಸುತ್ತಾರೆ ಎಂಬುದಾಗಿದೆ.",
                        "ta": "உண்மை என்பது நிரூபிக்கப்படக்கூடிய ஒரு உண்மையாகும். கருத்து என்பது ஒரு விஷயத்தைப் பற்றி ஒருவர் என்ன நினைக்கிறார் என்பதாகும்."
                    },
                    "voice_target": {
                        "en": "Opinion",
                        "hi": "राय",
                        "kn": "ಅಭಿಪ್ರಾಯ",
                        "ta": "கருத்து"
                    }
                },
                "Vocabulary in Context": {
                    "explanation": {
                        "en": "Vocabulary in context means choosing the correct word that fits perfectly in a sentence.",
                        "hi": "संदर्भ में शब्दावली का अर्थ है उस सही शब्द को चुनना जो एक वाक्य में पूरी तरह से फिट बैठता है।",
                        "kn": "ಸಂದರ್ಭದಲ್ಲಿ ಶಬ್ದಕೋಶ ಎಂದರೆ ವಾಕ್ಯಕ್ಕೆ ಸಂಪೂರ್ಣವಾಗಿ ಹೊಂದುವ ಸರಿಯಾದ ಪದವನ್ನು ಆರಿಸುವುದಾಗಿದೆ.",
                        "ta": "சூழலில் சொல்லகராதி என்பது ஒரு வாக்கியத்திற்கு கச்சிதமாக பொருந்தும் சரியான வார்த்தையைத் தேர்ந்தெடுப்பதாகும்."
                    },
                    "voice_target": {
                        "en": "Vocabulary",
                        "hi": "शब्दावली",
                        "kn": "ಶಬ್ದಕೋಶ",
                        "ta": "சொல்லகராதி"
                    }
                },
                "Author's Purpose": {
                    "explanation": {
                        "en": "Author's purpose is the reason why a writer wrote a text, such as to persuade, inform, or entertain.",
                        "hi": "लेखक का उद्देश्य वह कारण है जिसके लिए एक लेखक ने पाठ लिखा है, जैसे कि राजी करना, सूचित करना या मनोरंजन करना।",
                        "kn": "ಲೇಖಕರ ಉದ್ದೇಶ ಎಂದರೆ ಬರಹಗಾರರು ಪಠ್ಯವನ್ನು ಬರೆಯಲು कारणವಾಗಿದೆ, ಉದಾಹರಣೆಗೆ ಒಪ್ಪಿಸಲು, ತಿಳಿಸಲು ಅಥವಾ ಮನರಂಜಿಸಲು.",
                        "ta": "ஆசிரியரின் நோக்கம் என்பது ஒரு எழுத்தாளர் ஒரு உரையை எழுதியதற்கான காரணமாகும், அதாவது வற்புறுத்தவோ, தகவல் தெரிவிக்கவோ அல்லது மகிழ்விக்கவோ."
                    },
                    "voice_target": {
                        "en": "Author's Purpose",
                        "hi": "लेखक का उद्देश्य",
                        "kn": "ಲೇಖಕರ ಉದ್ದೇಶ",
                        "ta": "ஆசிரியரின் நோக்கம்"
                    }
                },
                "Summarizing": {
                    "explanation": {
                        "en": "Summarizing is describing the main points of a story in your own words, keeping it brief.",
                        "hi": "संक्षेप में बताने का अर्थ है किसी कहानी के मुख्य बिंदुओं को अपने शब्दों में संक्षेप में लिखना।",
                        "kn": "ಸಾರಾಂಶ ಮಾಡುವುದು ಎಂದರೆ ಕಥೆಯ ಮುಖ್ಯ ಅಂಶಗಳನ್ನು ನಿಮ್ಮ ಸ್ವಂತ ಮಾತುಗಳಲ್ಲಿ ಸಂಕ್ಷಿಪ್ತವಾಗಿ ವಿವರಿಸುವುದಾಗಿದೆ.",
                        "ta": "சுருக்கம் செய்தல் என்பது கதையின் முக்கிய புள்ளிகளை உங்கள் சொந்த வார்த்தைகளில் சுருக்கமாக விவரிப்பதாகும்."
                    },
                    "voice_target": {
                        "en": "Summary",
                        "hi": "सारांश",
                        "kn": "ಸಾರಾಂಶ",
                        "ta": "சுருக்கம்"
                    }
                },
                "Drawing Conclusions": {
                    "explanation": {
                        "en": "Drawing a conclusion means making a final decision or judgment based on facts and details.",
                        "hi": "निष्कर्ष निकालने का अर्थ है तथ्यों और विवरणों के आधार पर अंतिम निर्णय या निर्णय लेना।",
                        "kn": "ತೀರ್ಮಾನವನ್ನು ತೆಗೆದುಕೊಳ್ಳುವುದು ಎಂದರೆ ಸಂಗತಿಗಳು ಮತ್ತು ವಿವರಗಳ ಆಧಾರದ ಮೇಲೆ ಅಂತಿಮ ನಿರ್ಧಾರವನ್ನು ಮಾಡುವುದಾಗಿದೆ.",
                        "ta": "முடிவெடுத்தல் என்பது உண்மைகள் மற்றும் விவரங்களின் அடிப்படையில் இறுதி முடிவை எடுப்பதாகும்."
                    },
                    "voice_target": {
                        "en": "Conclusion",
                        "hi": "निष्कर्ष",
                        "kn": "ತೀರ್ಮಾನ",
                        "ta": "முடிவு"
                    }
                },
                "Point of View": {
                    "explanation": {
                        "en": "Point of view is the perspective from which a story is told, like first person (I) or third person (he/she).",
                        "hi": "दृष्टिकोण वह परिप्रेक्ष्य है जिससे कहानी बताई जाती है, जैसे प्रथम पुरुष (मैं) या अन्य पुरुष (वह)।",
                        "kn": "ದೃಷ್ಟಿಕೋನ ಎಂದರೆ ಕಥೆಯನ್ನು ಹೇಳುವ ದೃಷ್ಟಿಯಾಗಿದೆ, ಉದಾಹರಣೆಗೆ ಪ್ರಥಮ ಪುರುಷ (ನಾನು) ಅಥವಾ ತೃತೀಯ ಪುರುಷ (ಅವನು/ಅವಳು).",
                        "ta": "நோக்குநிலை என்பது கதை சொல்லப்படும் கோணமாகும், அதாவது தன்மை (நான்) அல்லது படர்க்கை (அவன்/அவள்)."
                    },
                    "voice_target": {
                        "en": "Point of View",
                        "hi": "दृष्टिकोण",
                        "kn": "ದೃಷ್ಟಿಕೋನ",
                        "ta": "நோக்குநிலை"
                    }
                },
                "Theme": {
                    "explanation": {
                        "en": "The theme is the underlying message, lesson, or moral that the author wants you to learn from the story.",
                        "hi": "थीम वह संदेश, सीख या नैतिक मूल्य है जो लेखक चाहता है कि आप कहानी से सीखें।",
                        "kn": "ವಸ್ತು ವಿಷಯ ಎಂದರೆ ಕಥೆಯಿಂದ ನೀವು ಕಲಿಯಬೇಕೆಂದು ಲೇಖಕರು ಬಯಸುವ ಆಳವಾದ ಸಂದೇಶ ಅಥವಾ ನೈತಿಕತೆಯಾಗಿದೆ.",
                        "ta": "கருப்பொருள் என்பது கதையிலிருந்து நீங்கள் கற்றுக்கொள்ள வேண்டும் என்று ஆசிரியர் விரும்பும் ஆழமான செய்தி அல்லது நீதியாகும்."
                    },
                    "voice_target": {
                        "en": "Theme",
                        "hi": "थीम",
                        "kn": "ವಸ್ತು ವಿಷಯ",
                        "ta": "கருப்பொருள்"
                    }
                },
                "Figurative Language": {
                    "explanation": {
                        "en": "Figurative language uses words in creative ways to describe things, like similes (as brave as a lion).",
                        "hi": "अलंकारिक भाषा चीजों का वर्णन करने के लिए रचनात्मक तरीकों से शब्दों का उपयोग करती है, जैसे उपमा (शेर जैसा बहादुर)।",
                        "kn": "ಅಲಂಕಾರಿಕ ಭಾಷೆ ಎಂದರೆ ವಸ್ತುಗಳನ್ನು ವಿವರಿಸಲು ಪದಗಳನ್ನು ಸೃಜನಶೀಲವಾಗಿ ಬಳಸುವುದು, ಉದಾಹರಣೆಗೆ ಉಪಮೆಗಳು (ಸಿಂಹದಂತೆ ಧೈರ್ಯಶಾಲಿ).",
                        "ta": "அணிநடை மொழி என்பது விஷயங்களை விவரிக்க ஆக்கப்பூர்வமான வழிகளில் வார்த்தைகளைப் பயன்படுத்துவதாகும், அதாவது உவமைகள் (சிங்கம் போன்ற வீரன்)."
                    },
                    "voice_target": {
                        "en": "Figurative",
                        "hi": "अलंकारिक",
                        "kn": "ಅಲಂಕಾರಿಕ",
                        "ta": "அணிநடை"
                    }
                },
                "Advertisement Analysis": {
                    "explanation": {
                        "en": "Analyzing ads means looking at details to see how they try to attract customers and sell products.",
                        "hi": "विज्ञापनों का विश्लेषण करने का अर्थ है विवरणों को देखना कि वे ग्राहकों को कैसे आकर्षित करते हैं और उत्पाद बेचते हैं।",
                        "kn": "ಜಾಹೀರಾತುಗಳನ್ನು ವಿಶ್ಲೇಷಿಸುವುದು ಎಂದರೆ ಗ್ರಾಹಕರನ್ನು ಹೇಗೆ ಆಕರ್ಷಿಸಲು ಮತ್ತು ಉತ್ಪನ್ನಗಳನ್ನು ಮಾರಾಟ ಮಾಡಲು ಪ್ರಯತ್ನಿಸುತ್ತವೆ ಎಂದು ನೋಡುವುದಾಗಿದೆ.",
                        "ta": "விளம்பரங்களை பகுப்பாய்வு செய்வது என்பது வாடிக்கையாளர்களை எவ்வாறு ஈர்க்கவும் தயாரிப்புகளை விற்கவும் முயற்சிக்கின்றன என்பதைப் பார்ப்பதாகும்."
                    },
                    "voice_target": {
                        "en": "Advertisement",
                        "hi": "विज्ञापन",
                        "kn": "ಜಾಹೀರಾತು",
                        "ta": "விளம்பரம்"
                    }
                },
                "Critical Thinking Puzzles": {
                    "explanation": {
                        "en": "Critical thinking puzzles help you practice logic, find patterns, and solve problems step by step.",
                        "hi": "तार्किक सोच पहेलियाँ आपको तर्क का अभ्यास करने, पैटर्न खोजने और कदम दर कदम समस्याओं को हल करने में मदद करती हैं।",
                        "kn": "ವಿಮರ್ಶಾತ್ಮಕ ಚಿಂತನೆಯ ಒಗಟುಗಳು ತರ್ಕವನ್ನು ಅಭ್ಯಾಸ ಮಾಡಲು, ಮಾದರಿಗಳನ್ನು ಕಂಡುಹಿಡಿಯಲು ಮತ್ತು ಸಮಸ್ಯೆಗಳನ್ನು ಬಿಡಿಸಲು ಸಹಾಯ ಮಾಡುತ್ತವೆ.",
                        "ta": "சிந்தனை புதிர்கள் தர்க்கப் பயிற்சி பெறவும், வடிவங்களைக் கண்டறியவும், சிக்கல்களைத் தீர்க்கவும் உதவுகின்றன."
                    },
                    "voice_target": {
                        "en": "Logic",
                        "hi": "तर्क",
                        "kn": "ತರ್ಕ",
                        "ta": "தர்க்கம்"
                    }
                }
            }

            for idx, bp in enumerate(BLUEPRINTS['advanced'], start=1):
                lesson_id = f"ADV-{lang.upper()}-{idx:03d}"
                prereq = f"ADV-{lang.upper()}-{idx-1:03d}" if idx > 1 else None

                trans_dict = ADVANCED_TRANSLATIONS.get(lang, {})
                quiz_trans_dict = ADVANCED_QUIZ_TRANSLATIONS.get(lang, {})
                def t_adv(txt):
                    return trans_dict.get(txt, quiz_trans_dict.get(txt, txt))

                trans = TRANSLATIONS[lang]

                welcome_slide = {
                    'type': 'welcome',
                    'title': t_adv(bp['concept']),
                    'subtitle': t_adv(bp['context']),
                    'objectives': [
                        t_adv("Learn step by step and master functional skills!"),
                        t_adv("Read and practice real life scenarios"),
                        t_adv("Pass the concept checkup challenge")
                    ]
                }

                activities_list = [welcome_slide]

                if bp['type'] == 'storyboard_story':
                    story_slide = {
                        'type': 'storyboard_story',
                        'title': t_adv("Stories & Literature"),
                        'subtitle': t_adv("Read, analyze and enjoy beautiful stories."),
                        'story_title': t_adv("The Honest Farmer"),
                        'story_body': t_adv("Once, there lived a farmer who was known for his honesty. One day, he found a bag of gold coins in his field. Instead of keeping it, he went to the village chief to find the owner. The owner rewarded him for his honesty. Moral: Honesty is always rewarded."),
                        'tabs': {
                            t_adv("Story Comprehension"): {
                                'question': t_adv("Who is the main character in the story?"),
                                'options': [t_adv("The farmer"), t_adv("The dog"), t_adv("The market"), t_adv("The sun")],
                                'correct_index': 0
                            },
                            t_adv("Character Analysis"): {
                                'question': t_adv("Why was the farmer known?"),
                                'options': [t_adv("For his wealth"), t_adv("For his honesty"), t_adv("For his laziness"), t_adv("For his anger")],
                                'correct_index': 1
                            },
                            t_adv("Theme & Moral"): {
                                'question': t_adv("What is the moral of the story?"),
                                'options': [t_adv("Greed is good"), t_adv("Honesty is always rewarded"), t_adv("Money is everything"), t_adv("Never work hard")],
                                'correct_index': 1
                            },
                            t_adv("Vocabulary Check"): {
                                'question': t_adv("What does \"honesty\" mean?"),
                                'options': [t_adv("Being truthful"), t_adv("Being rich"), t_adv("Being funny"), t_adv("Being strong")],
                                'correct_index': 0
                            }
                        }
                    }
                    activities_list.append(story_slide)

                elif bp['type'] == 'conversation_chat':
                    chat_slide = {
                        'type': 'conversation_chat',
                        'title': t_adv("Daily Communication"),
                        'subtitle': t_adv("Conversation Practice"),
                        'messages': [
                            {"sender": "them", "text": t_adv("Hi! How was your weekend?")},
                            {"sender": "you", "text": t_adv("It was great! I went hiking with my friends. The weather was perfect.")},
                            {"sender": "them", "text": t_adv("That sounds fun! What did you enjoy the most?")}
                        ],
                        'options': [
                            t_adv("I loved the beautiful view from the top!"),
                            t_adv("The food we packed was delicious."),
                            t_adv("Just walking with my friends.")
                        ]
                    }
                    activities_list.append(chat_slide)

                elif bp['type'] == 'essay_planning':
                    essay_slide = {
                        'type': 'essay_planning',
                        'title': t_adv("Essay Writing"),
                        'subtitle': t_adv("Plan, write and structure impressive essays."),
                        'topic': t_adv("Is Technology Making Our Lives Better or Worse?"),
                        'plan': [t_adv("Introduction"), t_adv("Body Paragraph 1"), t_adv("Body Paragraph 2"), t_adv("Conclusion")],
                        'skills': [t_adv("Organize your ideas"), t_adv("Use examples and facts"), t_adv("Write coherently"), t_adv("Conclude effectively")]
                    }
                    activities_list.append(essay_slide)

                elif bp['type'] == 'letter_drafting':
                    letter_slide = {
                        'type': 'letter_drafting',
                        'title': t_adv("Letter & Email Writing"),
                        'subtitle': t_adv("Write formal letters, emails and applications"),
                        'to_label': t_adv("Manager"),
                        'subject_label': t_adv("Sick Leave Application"),
                        'body_placeholder': t_adv("Dear Sir/Madam, I am writing to request sick leave for today due to a sudden fever. Please approve my leave.")
                    }
                    activities_list.append(letter_slide)

                else:
                    details = ADVANCED_LESSONS_DETAILS.get(bp['concept'], {
                        "explanation": {
                            "en": f"Learn the concepts and definitions of {bp['concept']}.",
                            "hi": f"Learn the concepts and definitions of {bp['concept']}.",
                            "kn": f"Learn the concepts and definitions of {bp['concept']}.",
                            "ta": f"Learn the concepts and definitions of {bp['concept']}."
                        },
                        "voice_target": {
                            "en": bp['concept'],
                            "hi": bp['concept'],
                            "kn": bp['concept'],
                            "ta": bp['concept']
                        }
                    })
                    explanation_text = details['explanation'].get(lang, details['explanation']['en'])
                    voice_target_text = details['voice_target'].get(lang, details['voice_target']['en'])

                    explore_step = {
                        'type': 'explore',
                        'instruction': trans['explore'],
                        'concept': t_adv(bp['concept']),
                        'visual': bp['emoji'],
                        'audio_narration': f"Observe: {t_adv(bp['concept'])}"
                    }
                    learn_step = {
                        'type': 'learn',
                        'instruction': f"{trans['learn']} {t_adv(bp['concept'])}",
                        'explanation': explanation_text,
                        'visual': bp['emoji']
                    }
                    practice_step = {
                        'type': 'practice',
                        'instruction': f"{trans['practice']} {t_adv(bp['concept'])}",
                        'voice_target': voice_target_text
                    }
                    activities_list.extend([explore_step, learn_step, practice_step])

                grad_slide = {
                    'type': 'graduation',
                    'title': t_adv("Great job!"),
                    'subtitle': t_adv("You completed the advanced checkup challenge!"),
                    'xp': 25,
                    'time': '20 min'
                }
                activities_list.append(grad_slide)

                quiz_data = ADVANCED_QUIZ_POOL.get(idx, {
                    'question': f"Identify the correct option for: {bp['concept']}",
                    'options': [bp['concept'], "Incorrect1", "Incorrect2", "Incorrect3"],
                    'correct_index': 0,
                    'explanation': "Select the match."
                })

                localized_quiz = [
                    {
                        'level': 'recognition',
                        'question': t_adv(quiz_data['question']),
                        'options': [t_adv(opt) for opt in quiz_data['options']],
                        'correct_index': quiz_data['correct_index'],
                        'explanation': t_adv(quiz_data['explanation'])
                    }
                ]

                Lesson.objects.create(
                    lesson_id=lesson_id,
                    title=t_adv(bp['concept']),
                    module='Advanced Literacy',
                    difficulty='advanced',
                    skill=bp.get('skill', 'comprehension'),
                    language=lang,
                    estimated_time=20,
                    order_in_level=idx,
                    prerequisite_id=prereq,

                    concept_intro=t_adv(bp['context']),
                    real_life_context=t_adv(bp['concept']),
                    image_visual=bp['emoji'],
                    activities=activities_list,
                    mini_game={},
                    quiz_bank=localized_quiz,
                    reward_xp=25,
                    reward_stars=5,
                    reward_coins=5,
                    badge_code=f"badge_adv_{lang}_{idx}",
                    encouragement_template="Sensational performance!",
                    improvement_tip="Read everyday articles."
                )
                seeded_count += 1



        # Seed new multi-level graduation assessments
        for lang in ['en', 'hi', 'kn', 'ta']:
            for level in ['beginner', 'intermediate', 'advanced']:
                prefix = 'BEG' if level == 'beginner' else 'INT' if level == 'intermediate' else 'ADV'
                lesson_id = f"{prefix}-ASSESS-{lang.upper()}"
                if not Lesson.objects.filter(lesson_id=lesson_id).exists():
                    Lesson.objects.create(
                        lesson_id=lesson_id,
                        title=f'{level.capitalize()} Level Graduation Assessment',
                        module='Level Assessment & Certification',
                        difficulty=level,
                        skill='comprehension',
                        language=lang,
                        estimated_time=15,
                        order_in_level=999,
                        concept_intro=f'Welcome to your {level.capitalize()} Graduation Assessment. Pass this to get your certificate!',
                        real_life_context=f'{level.capitalize()} assessment checklist',
                        image_visual='🏆',
                        activities=[
                            {
                                'type': 'explore',
                                'instruction': f'{level.capitalize()} Graduation Assessment checkup.',
                                'concept': 'Level Certificate',
                                'visual': '🏆',
                                'audio_narration': 'Graduation Checkup'
                            }
                        ],
                        mini_game={
                            'type': 'drag_match',
                            'instruction': 'Match to receive certificate',
                            'data': {'target': 'Certificate', 'options': ['Certificate', 'Lock', 'Key']}
                        },
                        quiz_bank=[
                            {
                                'level': 'recognition',
                                'question': 'Tap matching card: Certificate',
                                'options': ['Certificate 🎓', 'Bag 👜', 'Lock 🔒', 'Key 🔑'],
                                'correct_index': 0,
                                'explanation': 'The certificate icon represents graduation.'
                            }
                        ],
                        reward_xp=20,
                        reward_stars=5,
                        reward_coins=5,
                        badge_code=f'{level.capitalize()} Master Certificate',
                        encouragement_template='Congratulations! You have mastered the level!',
                        improvement_tip='Keep up the amazing reading habits!'
                    )

        # Seed Writing Lessons
        WRITING_TRANSLATIONS = {
            'hi': {
                'Writing the Alphabet': 'वर्णमाला लिखना',
                'Writing Small Letters': 'छोटे अक्षर लिखना',
                'Writing Numbers': 'संख्याएँ लिखना',
                'Simple Words': 'सरल शब्द',
                'Naming Words': 'नामकरण शब्द',
                'Action Words': 'क्रिया शब्द',
                'Small Sentences': 'छोटे वाक्य',
                'Fun with Practice': 'अभ्यास का मज़ा',
                'Word Building': 'शब्द निर्माण',
                'Sentence Building': 'वाक्य निर्माण',
                'Paragraph Writing': 'अनुच्छेद लेखन',
                'Punctuation': 'विराम चिन्ह',
                'Capitalization': 'बड़े अक्षर',
                'Creative Writing': 'रचनात्मक लेखन',
                'Letter Writing': 'पत्र लेखन',
                'Practice Test': 'अभ्यास परीक्षा',
            },
            'kn': {
                'Writing the Alphabet': 'ಅಕ್ಷರಮಾಲೆ ಬರೆಯುವುದು',
                'Writing Small Letters': 'ಚಿಕ್ಕ ಅಕ್ಷರಗಳನ್ನು ಬರೆಯುವುದು',
                'Writing Numbers': 'ಸಂಖ್ಯೆಗಳನ್ನು ಬರೆಯುವುದು',
                'Simple Words': 'ಸರಳ ಪದಗಳು',
                'Naming Words': 'ಹೆಸರಿಸುವ ಪದಗಳು',
                'Action Words': 'ಕ್ರಿಯಾ ಪದಗಳು',
                'Small Sentences': 'ಸಣ್ಣ ವಾಕ್ಯಗಳು',
                'Fun with Practice': 'ಅಭ್ಯಾಸದ ಆಟ',
                'Word Building': 'ಪದ ರಚನೆ',
                'Sentence Building': 'ವಾಕ್ಯ ರಚನೆ',
                'Paragraph Writing': 'ಪ್ಯಾರಾಗ್ರಾಫ್ ಬರೆಯುವುದು',
                'Punctuation': 'ವಿರಾಮ ಚಿಹ್ನೆಗಳು',
                'Capitalization': 'ದೊಡ್ಡ ಅಕ್ಷರಗಳು',
                'Creative Writing': 'ಸೃಜನಶೀಲ ಬರವಣಿಗೆ',
                'Letter Writing': 'ಪತ್ರ ಬರವಣಿಗೆ',
                'Practice Test': 'ಅಭ್ಯಾಸ ಪರೀಕ್ಷೆ',
            },
            'ta': {
                'Writing the Alphabet': 'நெடுங்கணக்கு எழுதுதல்',
                'Writing Small Letters': 'சிறிய எழுத்துக்களை எழுதுதல்',
                'Writing Numbers': 'எண்களை எழுதுதல்',
                'Simple Words': 'எளிய சொற்கள்',
                'Naming Words': 'பெயர்ச்சொற்கள்',
                'Action Words': 'வினைச்சொற்கள்',
                'Small Sentences': 'சிறு வாக்கியங்கள்',
                'Fun with Practice': 'பயிற்சி விளையாட்டு',
                'Word Building': 'சொல் உருவாக்கம்',
                'Sentence Building': 'வாக்கிய உருவாக்கம்',
                'Paragraph Writing': 'பத்தி எழுதுதல்',
                'Punctuation': 'நிறுத்தற்குறிகள்',
                'Capitalization': 'பெரிய எழுத்துக்கள்',
                'Creative Writing': 'படைப்பாற்றல் எழுத்து',
                'Letter Writing': 'கடிதம் எழுதுதல்',
                'Practice Test': 'பயிற்சி தேர்வு',
            }
        }

        BEGINNER_WRITING_TOPICS = [
            {'title': 'Writing the Alphabet', 'desc': 'Learn to write A to Z'},
            {'title': 'Writing Small Letters', 'desc': 'Learn to write a to z'},
            {'title': 'Writing Numbers', 'desc': 'Learn to write 1 to 10'},
            {'title': 'Simple Words', 'desc': 'Write easy 3-letter words'},
            {'title': 'Naming Words', 'desc': 'Write names of things around us'},
            {'title': 'Action Words', 'desc': 'Write words for actions'},
            {'title': 'Small Sentences', 'desc': 'Write short and simple sentences'},
            {'title': 'Fun with Practice', 'desc': 'Let\'s write what you know!'}
        ]

        INTERMEDIATE_WRITING_TOPICS = [
            {'title': 'Word Building', 'desc': 'Unscramble the letters'},
            {'title': 'Sentence Building', 'desc': 'Create meaningful sentences'},
            {'title': 'Paragraph Writing', 'desc': 'Write short paragraphs'},
            {'title': 'Punctuation', 'desc': 'Use punctuation correctly'},
            {'title': 'Capitalization', 'desc': 'Use capital letters'},
            {'title': 'Creative Writing', 'desc': 'Write your own ideas'},
            {'title': 'Letter Writing', 'desc': 'Write friendly letters'},
            {'title': 'Practice Test', 'desc': 'Test your writing skills'}
        ]

        BEGINNER_TOPIC_DATA = {
            1: {
                'trace': 'A', 'trace_sub': "Let's learn to write the letter A.",
                'missing_eq': 'b _ t', 'missing_target': 'a', 'missing_opts': ['a', 'e', 'i'],
                'word': 'cat', 'word_image': 'cat',
                'sentence': 'The cat is fat.'
            },
            2: {
                'trace': 'a', 'trace_sub': "Let's learn to write the small letter a.",
                'missing_eq': 'h _ n', 'missing_target': 'e', 'missing_opts': ['a', 'e', 'o'],
                'word': 'hen', 'word_image': 'food',
                'sentence': 'I have a pen.'
            },
            3: {
                'trace': '1', 'trace_sub': "Let's learn to write the number 1.",
                'missing_eq': '1 _ 3', 'missing_target': '2', 'missing_opts': ['2', '4', '5'],
                'word': 'one', 'word_image': 'number',
                'sentence': 'There are three apples.'
            },
            4: {
                'trace': 'O', 'trace_sub': "Let's learn to write the letter O.",
                'missing_eq': 's _ n', 'missing_target': 'u', 'missing_opts': ['a', 'e', 'u'],
                'word': 'sun', 'word_image': 'sun',
                'sentence': 'The sun is hot.'
            },
            5: {
                'trace': 'B', 'trace_sub': "Let's learn to write the letter B.",
                'missing_eq': 'b _ ok', 'missing_target': 'o', 'missing_opts': ['a', 'e', 'o'],
                'word': 'book', 'word_image': 'book',
                'sentence': 'This is my book.'
            },
            6: {
                'trace': 'R', 'trace_sub': "Let's learn to write the letter R.",
                'missing_eq': 'r _ n', 'missing_target': 'u', 'missing_opts': ['a', 'o', 'u'],
                'word': 'run', 'word_image': 'walk',
                'sentence': 'The children play.'
            },
            7: {
                'trace': 'S', 'trace_sub': "Let's learn to write the letter S.",
                'missing_eq': 'I a _ happy', 'missing_target': 'm', 'missing_opts': ['m', 'n', 't'],
                'word': 'happy', 'word_image': 'happy',
                'sentence': 'I like to smile.'
            },
            8: {
                'trace': 'W', 'trace_sub': "Let's learn to write the letter W.",
                'missing_eq': 'M _ Go', 'missing_target': 'i', 'missing_opts': ['a', 'e', 'i'],
                'word': 'write', 'word_image': 'pencil',
                'sentence': 'We love to read.'
            }
        }

        for lang in ['en', 'hi', 'kn', 'ta']:
            trans = WRITING_TRANSLATIONS.get(lang, {})

            def translate_str(text):
                return trans.get(text, text)

            # Beginner Writing Lessons
            for idx, topic in enumerate(BEGINNER_WRITING_TOPICS, start=1):
                lesson_id = f"WR-BEG-{lang.upper()}-{idx:03d}"
                prereq = f"WR-BEG-{lang.upper()}-{idx-1:03d}" if idx > 1 else None

                t_title = translate_str(topic['title'])
                t_desc = translate_str(topic['desc'])
                data = BEGINNER_TOPIC_DATA[idx]

                welcome_slide = {
                    'type': 'welcome',
                    'title': t_title,
                    'subtitle': t_desc,
                    'objectives': [
                        translate_str('Learn step by step and become a great writer!'),
                        translate_str('Trace letters and write words'),
                        translate_str('Complete practice exercises')
                    ]
                }

                trace_slide = {
                    'type': 'trace_letter',
                    'title': translate_str(topic['title']),
                    'subtitle': translate_str(data['trace_sub']),
                    'target': data['trace'],
                    'image': 'pencil',
                    'arrows': [translate_str('Start from 1, follow the arrows and trace the letter.')]
                }

                missing_slide = {
                    'type': 'practice_missing',
                    'questionNumber': 2,
                    'questionText': translate_str('Write the missing letter.'),
                    'equation': data['missing_eq'],
                    'target': data['missing_target'],
                    'options': data['missing_opts']
                }

                word_slide = {
                    'type': 'write_word',
                    'title': translate_str('Write the word'),
                    'target': data['word'],
                    'image': data['word_image'],
                    'instruction': translate_str('Look at the word. Say it aloud. Then trace each letter.')
                }

                sentence_slide = {
                    'type': 'write_sentence',
                    'title': translate_str('Write the sentence'),
                    'target': data['sentence'],
                    'instruction': translate_str('Read the sentence. Then write it neatly on the lines below.')
                }

                grad_slide = {
                    'type': 'graduation',
                    'title': translate_str('Great job!'),
                    'subtitle': translate_str('You finished the writing lesson!'),
                    'xp': 15,
                    'time': '10 min'
                }

                Lesson.objects.create(
                    lesson_id=lesson_id,
                    title=t_title,
                    module='Writing Skills',
                    difficulty='beginner',
                    skill='writing',
                    language=lang,
                    estimated_time=10,
                    order_in_level=idx,
                    prerequisite_id=prereq,

                    concept_intro=t_desc,
                    real_life_context='Writing practice',
                    image_visual='✏️',
                    activities=[welcome_slide, trace_slide, missing_slide, word_slide, sentence_slide, grad_slide],
                    mini_game={},
                    quiz_bank=[],
                    reward_xp=15,
                    reward_stars=3,
                    reward_coins=3,
                    badge_code=f"badge_wr_beg_{lang}_{idx}",
                    encouragement_template="Fabulous writing!",
                    improvement_tip="Practice tracing every day."
                )
                seeded_count += 1

            # Intermediate Writing Lessons
            for idx, topic in enumerate(INTERMEDIATE_WRITING_TOPICS, start=1):
                lesson_id = f"WR-INT-{lang.upper()}-{idx:03d}"
                prereq = f"WR-INT-{lang.upper()}-{idx-1:03d}" if idx > 1 else None

                t_title = translate_str(topic['title'])
                t_desc = translate_str(topic['desc'])

                welcome_slide = {
                    'type': 'welcome',
                    'title': t_title,
                    'subtitle': t_desc,
                    'objectives': [
                        translate_str('Improve functional writing skills'),
                        translate_str('Form correct sentences and grammar'),
                        translate_str('Write short paragraphs')
                    ]
                }
                
                activities = [welcome_slide]

                if idx == 1: # Word Building
                    activities.append({
                        'type': 'unscramble_words',
                        'title': translate_str('Word Building'),
                        'subtitle': translate_str('Unscramble the letters to make meaningful words.'),
                        'instruction': translate_str('Drag and drop the letters in the right order.'),
                        'items': [
                            {
                                'id': 1,
                                'clue': translate_str('A person'),
                                'image': 'man',
                                'tokens': ['u', 'n', 'm', 'h', 'a'],
                                'target': 'human'
                            },
                            {
                                'id': 2,
                                'clue': translate_str('A place to buy things'),
                                'image': 'shop',
                                'tokens': ['e', 't', 'k', 'r', 'a', 'm'],
                                'target': 'market'
                            },
                            {
                                'id': 3,
                                'clue': translate_str('The shining ball in the sky'),
                                'image': 'sun',
                                'tokens': ['n', 's', 'u'],
                                'target': 'sun'
                            },
                            {
                                'id': 4,
                                'clue': translate_str('To move on your feet'),
                                'image': 'walk',
                                'tokens': ['l', 'w', 'a', 'k'],
                                'target': 'walk'
                            }
                        ]
                    })
                elif idx == 2: # Sentence Building
                    activities.append({
                        'type': 'unscramble_sentence',
                        'title': translate_str('Sentence Building'),
                        'subtitle': translate_str('Arrange the words to form a correct sentence.'),
                        'instruction': translate_str('Tap the scrambled word tokens in the correct order.'),
                        'tokens': ['the', 'park', 'children', 'in', 'play'],
                        'target': 'The children play in the park.'
                    })
                elif idx == 3: # Paragraph Writing
                    activities.append({
                        'type': 'paragraph_writing',
                        'title': translate_str('Paragraph Writing'),
                        'subtitle': translate_str('Write a short paragraph about the topic given.'),
                        'topic': translate_str('My School'),
                        'instruction': translate_str('Write at least 10 words. Describe your school, teachers, and friends.')
                    })
                elif idx == 4: # Punctuation
                    activities.extend([
                        {
                            'type': 'practice_missing',
                            'questionNumber': 1,
                            'questionText': translate_str('Add the correct punctuation.'),
                            'equation': 'Where are you going',
                            'target': 'Where are you going ?',
                            'options': ['Where are you going.', 'Where are you going ?', 'Where are you going !', 'Where are you going ,']
                        },
                        {
                            'type': 'practice_missing',
                            'questionNumber': 2,
                            'questionText': translate_str('Add the correct punctuation.'),
                            'equation': 'Stop the car',
                            'target': 'Stop the car !',
                            'options': ['Stop the car ?', 'Stop the car ,', 'Stop the car !', 'Stop the car .']
                        },
                        {
                            'type': 'practice_missing',
                            'questionNumber': 3,
                            'questionText': translate_str('Add the correct punctuation.'),
                            'equation': 'I bought apples bananas and oranges',
                            'target': 'I bought apples, bananas, and oranges.',
                            'options': ['I bought apples bananas and oranges.', 'I bought apples, bananas, and oranges.', 'I bought apples? bananas? and oranges.', 'I bought apples! bananas! and oranges.']
                        },
                        {
                            'type': 'practice_missing',
                            'questionNumber': 4,
                            'questionText': translate_str('Add the correct punctuation.'),
                            'equation': 'It is a sunny day',
                            'target': 'It is a sunny day.',
                            'options': ['It is a sunny day ?', 'It is a sunny day ,', 'It is a sunny day.', 'It is a sunny day !']
                        }
                    ])
                elif idx == 5: # Capitalization
                    activities.extend([
                        {
                            'type': 'practice_missing',
                            'questionNumber': 1,
                            'questionText': translate_str('Use capital letters correctly.'),
                            'equation': 'my name is ayesha',
                            'target': 'My name is Ayesha.',
                            'options': ['my name is ayesha.', 'My name is ayesha.', 'My name is Ayesha.', 'my name is Ayesha.']
                        },
                        {
                            'type': 'practice_missing',
                            'questionNumber': 2,
                            'questionText': translate_str('Use capital letters correctly.'),
                            'equation': 'we live in india',
                            'target': 'We live in India.',
                            'options': ['we live in india.', 'We live in india.', 'we live in India.', 'We live in India.']
                        },
                        {
                            'type': 'practice_missing',
                            'questionNumber': 3,
                            'questionText': translate_str('Use capital letters correctly.'),
                            'equation': 'monday is a working day',
                            'target': 'Monday is a working day.',
                            'options': ['monday is a working day.', 'Monday is a working day.', 'monday is a Working day.', 'Monday is a Working day.']
                        },
                        {
                            'type': 'practice_missing',
                            'questionNumber': 4,
                            'questionText': translate_str('Use capital letters correctly.'),
                            'equation': 'he read a book about mahatma gandhi',
                            'target': 'He read a book about Mahatma Gandhi.',
                            'options': ['he read a book about mahatma gandhi.', 'He read a book about mahatma gandhi.', 'He read a book about Mahatma Gandhi.', 'he read a book about Mahatma Gandhi.']
                        }
                    ])
                elif idx == 6: # Creative Writing
                    activities.append({
                        'type': 'paragraph_writing',
                        'title': translate_str('Creative Writing'),
                        'subtitle': translate_str('Write a short paragraph about your favorite animal.'),
                        'topic': translate_str('My Favorite Animal'),
                        'instruction': translate_str('Write at least 10 words. Explain why you like this animal and what it does.')
                    })
                elif idx == 7: # Letter Writing
                    activities.append({
                        'type': 'letter_drafting',
                        'title': translate_str('Letter Writing'),
                        'subtitle': translate_str('Write friendly letters to friends or family.'),
                        'topic': translate_str('Write a letter to your friend inviting them to your birthday party.'),
                        'instruction': translate_str('Complete the letter fields below to invite your friend.')
                    })
                elif idx == 8: # Practice Test
                    activities.extend([
                        {
                            'type': 'unscramble_words',
                            'title': translate_str('Review spelling words'),
                            'subtitle': translate_str('Unscramble the letters.'),
                            'instruction': translate_str('Drag and drop the letters in the right order.'),
                            'items': [
                                {
                                    'id': 1,
                                    'clue': translate_str('A person'),
                                    'image': 'man',
                                    'tokens': ['u', 'n', 'm', 'h', 'a'],
                                    'target': 'human'
                                }
                            ]
                        },
                        {
                            'type': 'unscramble_sentence',
                            'title': translate_str('Sentence Review'),
                            'subtitle': translate_str('Arrange the words to form a correct sentence.'),
                            'instruction': translate_str('Tap the scrambled word tokens in the correct order.'),
                            'tokens': ['makes', 'us', 'smart', 'reading'],
                            'target': 'Reading makes us smart.'
                        },
                        {
                            'type': 'practice_missing',
                            'questionNumber': 3,
                            'questionText': translate_str('Add the correct punctuation.'),
                            'equation': 'What is your name',
                            'target': 'What is your name ?',
                            'options': ['What is your name.', 'What is your name ?', 'What is your name !', 'What is your name ,']
                        }
                    ])

                grad_slide = {
                    'type': 'graduation',
                    'title': translate_str('Great job!'),
                    'subtitle': translate_str('You finished the writing lesson!'),
                    'xp': 15,
                    'time': '12 min'
                }
                activities.append(grad_slide)

                Lesson.objects.create(
                    lesson_id=lesson_id,
                    title=t_title,
                    module='Writing Skills',
                    difficulty='intermediate',
                    skill='writing',
                    language=lang,
                    estimated_time=12,
                    order_in_level=idx,
                    prerequisite_id=prereq,

                    concept_intro=t_desc,
                    real_life_context='Functional writing skills',
                    image_visual='✍️',
                    activities=activities,
                    mini_game={},
                    quiz_bank=[],
                    reward_xp=15,
                    reward_stars=3,
                    reward_coins=4,
                    badge_code=f"badge_wr_int_{lang}_{idx}",
                    encouragement_template="Outstanding sentence construction!",
                    improvement_tip="Always check punctuation."
                )
                seeded_count += 1

        self.stdout.write(self.style.SUCCESS(f'Successfully seeded {seeded_count} rich progressive lessons!'))
