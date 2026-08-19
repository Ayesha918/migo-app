// src/components/Lessons/writingHelpers.js
import React from 'react';

export const MIGO_WRITING_STARTERS = {
  en: {
    cleanliness: {
      template: "Cleanliness is very [important] in our life. We should keep our house, school, and surroundings [clean]. Cleanliness protects us from [diseases]. We should always throw garbage in the [dustbin]. A clean environment keeps us [healthy] and happy.",
      blanks: [
        { placeholder: "important", suggestions: ["important", "bad", "useless"], hint: "Why is cleanliness valued?" },
        { placeholder: "clean", suggestions: ["clean", "dirty", "messy"], hint: "How should we keep our surroundings?" },
        { placeholder: "diseases", suggestions: ["diseases", "strength", "health"], hint: "What does cleanliness protect us from?" },
        { placeholder: "dustbin", suggestions: ["dustbin", "river", "road"], hint: "Where should we throw garbage?" },
        { placeholder: "healthy", suggestions: ["healthy", "sick", "tired"], hint: "How does a clean environment make us feel?" }
      ],
      wizard: {
        steps: [
          { question: "How do you want to start?", options: ["Cleanliness is very important in our life.", "Keeping our surroundings clean is everyone's duty.", "A clean environment makes us healthy and happy."] },
          { question: "What is your main idea?", options: ["If we keep our surroundings clean, diseases will not spread.", "Pollution and dirt harm our environment and health.", "Cleanliness makes both our home and school beautiful."] },
          { question: "Add one example:", options: ["For example, we should always throw garbage in the dustbin.", "For example, washing hands before eating is very important.", "We should keep our classroom clean just like our home."] },
          { question: "Provide your advice or conclusion:", options: ["Therefore, we must contribute to the cleanliness drive.", "Therefore, we should make cleanliness a daily habit.", "Only then can we build a healthy and clean society."] }
        ]
      }
    },
    school: {
      template: "The name of my school is [Gyan Niketan]. My school is very [beautiful] and big. Many of my [friends] study there. Our [teachers] teach us with great [love]. I love to go to my school every day.",
      blanks: [
        { placeholder: "Gyan Niketan", suggestions: ["Gyan Niketan", "St. Pauls", "Model School"], hint: "Your school's name" },
        { placeholder: "beautiful", suggestions: ["beautiful", "small", "dark"], hint: "How does the school look?" },
        { placeholder: "friends", suggestions: ["friends", "enemies", "strangers"], hint: "Who studies with you?" },
        { placeholder: "love", suggestions: ["love", "anger", "fear"], hint: "How do teachers teach?" }
      ],
      wizard: {
        steps: [
          { question: "How do you want to start?", options: ["The name of my school is Gyan Niketan.", "I study in a very big and beautiful school.", "My school is a wonderful place of learning."] },
          { question: "What do you like about it?", options: ["I have many good friends who study with me.", "Our teachers are very kind and teach us with love.", "We have a large playground and a big library."] },
          { question: "Provide a detail:", options: ["We play together during recess time.", "We learn new interesting subjects every day.", "My school has many beautiful plants and trees."] },
          { question: "Closing sentence:", options: ["I love going to my school every day.", "I feel very proud of my school.", "My school is the best school in the area."] }
        ]
      }
    },
    animal: {
      template: "My favorite animal is the [cow]. It is a very [domestic] and gentle animal. It has [four] legs and a long tail. It gives us [milk] which is very [healthy] for us.",
      blanks: [
        { placeholder: "cow", suggestions: ["cow", "lion", "tiger"], hint: "Which animal gives milk?" },
        { placeholder: "domestic", suggestions: ["domestic", "wild", "forest"], hint: "Is it domestic or wild?" },
        { placeholder: "four", suggestions: ["four", "two", "six"], hint: "How many legs does it have?" },
        { placeholder: "milk", suggestions: ["milk", "juice", "soda"], hint: "What do we drink from cows?" },
        { placeholder: "healthy", suggestions: ["healthy", "harmful", "tasteless"], hint: "Is milk good for health?" }
      ],
      wizard: {
        steps: [
          { question: "How do you want to start?", options: ["My favorite animal is the cow.", "Dogs are my favorite domestic animals.", "The elephant is a majestic animal that I like."] },
          { question: "Describe its characteristics:", options: ["It is very friendly and helps people in daily life.", "It lives in our house and guards us at night.", "It has a large trunk and eats green leaves."] },
          { question: "What does it eat or give us?", options: ["It gives us healthy milk every day.", "It eats grass, grains, and dog food.", "It eats plants, bananas, and sugarcane."] },
          { question: "Why do you like it?", options: ["I like it because it is gentle and sweet.", "I like it because it is loyal and playful.", "I like it because it is strong and intelligent."] }
        ]
      }
    },
    default: {
      template: "I want to share my thoughts about [topic]. It is very [important] because of [reasons]. For example, [detail]. Therefore, we should [action]. In conclusion, [thought].",
      blanks: [
        { placeholder: "topic", suggestions: ["topic", "school", "health"], hint: "The main subject" },
        { placeholder: "important", suggestions: ["important", "good", "helpful"], hint: "Value descriptor" },
        { placeholder: "reasons", suggestions: ["reasons", "benefits", "people"], hint: "Why does it matter?" },
        { placeholder: "detail", suggestions: ["detail", "examples", "activities"], hint: "Provide an example" },
        { placeholder: "action", suggestions: ["action", "practice", "work"], hint: "What should we do?" },
        { placeholder: "thought", suggestions: ["thought", "conclusion", "summary"], hint: "Closing thought" }
      ],
      wizard: {
        steps: [
          { question: "Choose an opening sentence:", options: ["Today I want to write about this topic.", "This is a very interesting subject to discuss.", "Everyone should know about this topic."] },
          { question: "Choose the main reason:", options: ["It helps us learn new things in daily life.", "It brings joy and happiness to everyone.", "It makes our society better and cleaner."] },
          { question: "Choose a detail or example:", options: ["For instance, we can practice it every day.", "For example, it helps children grow healthy.", "We see this happening all around us."] },
          { question: "Choose a closing sentence:", options: ["In conclusion, it is highly recommended.", "Therefore, we should support it fully.", "That is why it is so important."] }
        ]
      }
    },
    letter: {
      to: "Principal",
      subject: "Leave Application for Fever",
      body: "To,\nThe Principal,\n[Gyan Niketan] School\n\nSubject: Leave Application for Fever\n\nRespected Sir/Madam,\n\nI am writing to state that I am a student of class [5th]. I need leave from [19th Aug] to [21th Aug] due to [fever]. Please grant me leave for these days.\n\nThanking you.\n\nYour obedient student,\nName: [Ayesha]\nClass: [5th]",
      blanks: [
        { placeholder: "Gyan Niketan", suggestions: ["Gyan Niketan", "St. Xavier", "Government"], hint: "Enter your school name" },
        { placeholder: "5th", suggestions: ["5th", "6th", "7th", "8th"], hint: "Your class grade" },
        { placeholder: "19th Aug", suggestions: ["19th Aug", "Today", "Monday"], hint: "Start date" },
        { placeholder: "21th Aug", suggestions: ["21th Aug", "Tomorrow", "Next week"], hint: "End date" },
        { placeholder: "fever", suggestions: ["fever", "marriage", "urgent work"], hint: "Reason for leave" },
        { placeholder: "Ayesha", suggestions: ["Ayesha", "Learner", "Your Name"], hint: "Write your name" }
      ]
    }
  },
  hi: {
    cleanliness: {
      template: "स्वच्छता हमारे जीवन में बहुत [महत्वपूर्ण] है। हमें अपने घर, स्कूल और आसपास की जगहों को [साफ] रखना चाहिए। [स्वच्छता] हमें बीमारियों से बचाता है। हमें कूड़ा हमेशा [कूड़ेदान] में डालना चाहिए। स्वच्छ वातावरण हमें [स्वस्थ] और खुश रखता है।",
      blanks: [
        { placeholder: "महत्वपूर्ण", suggestions: ["महत्वपूर्ण", "बेकार", "नुकसानदेह"], hint: "स्वच्छता का क्या महत्व है?" },
        { placeholder: "साफ", suggestions: ["साफ", "गंदा", "अस्वच्छ"], hint: "हमें जगहों को कैसा रखना चाहिए?" },
        { placeholder: "स्वच्छता", suggestions: ["स्वच्छता", "गंदगी", "लापरवाही"], hint: "हमें बीमारियों से क्या बचाता है?" },
        { placeholder: "कूड़ेदान", suggestions: ["कूड़ेदान", "सड़क", "मैदान"], hint: "कूड़ा कहाँ डालना चाहिए?" },
        { placeholder: "स्वस्थ", suggestions: ["स्वस्थ", "बीमार", "कमजोर"], hint: "स्वच्छ वातावरण हमें कैसा रखता है?" }
      ],
      wizard: {
        steps: [
          { question: "संबोधन या शुरुआत कैसे करना चाहते हैं?", options: ["स्वच्छता हमारे जीवन का एक अत्यंत महत्वपूर्ण हिस्सा है।", "साफ-सफाई रखना हर नागरिक का कर्तव्य है।", "स्वच्छ वातावरण हमें निरोगी और सुखी बनाता है।"] },
          { question: "आपका मुख्य विचार क्या है?", options: ["यदि हम अपने आसपास सफाई रखेंगे, तो बीमारियाँ नहीं फैलेंगी।", "गंदगी से प्रदूषण बढ़ता है और पर्यावरण को नुकसान होता है।", "साफ-सफाई से घर और विद्यालय दोनों का वातावरण सुंदर बनता है।"] },
          { question: "एक उदाहरण या विवरण जोड़ें:", options: ["जैसे, हमें हमेशा कचरा कूड़ेदान में ही डालना चाहिए।", "उदाहरण के लिए, भोजन करने से पहले हाथ धोना बहुत ज़रूरी है।", "हमें अपने विद्यालय को भी घर की तरह साफ रखना चाहिए।"] },
          { question: "अपनी सलाह या निष्कर्ष दें:", options: ["तभी हम एक स्वस्थ और विकसित समाज का निर्माण कर सकते हैं।", "अतः, साफ-सफाई को अपनी आदत बना लेना चाहिए।", "इसलिए, हमें 'स्वच्छ भारत' अभियान में अपना योगदान देना चाहिए।"] }
        ]
      }
    },
    school: {
      template: "मेरे स्कूल का नाम [ज्ञान निकेतन] है। मेरे स्कूल में बहुत [सुंदर] और बड़ा है। वहाँ मेरे कई [दोस्त] पढ़ते हैं। हमारे [शिक्षक] हमें बहुत प्यार से पढ़ाते हैं। मुझे अपने स्कूल जाना बहुत [पसंद] है।",
      blanks: [
        { placeholder: "ज्ञान निकेतन", suggestions: ["ज्ञान निकेतन", "राजकीय विद्यालय", "डी.ए.वी."], hint: "अपने स्कूल का नाम चुनें" },
        { placeholder: "सुंदर", suggestions: ["सुंदर", "छोटा", "अंधेरा"], hint: "स्कूल कैसा दिखता है?" },
        { placeholder: "दोस्त", suggestions: ["दोस्त", "दुश्मन", "अजनबी"], hint: "वहाँ आपके साथ कौन पढ़ता है?" },
        { placeholder: "शिक्षक", suggestions: ["शिक्षक", "नेता", "दुकानदार"], hint: "हमें प्यार से कौन पढ़ाता है?" },
        { placeholder: "पसंद", suggestions: ["पसंद", "नापसंद", "बुरा"], hint: "आपको स्कूल जाना कैसा लगता है?" }
      ],
      wizard: {
        steps: [
          { question: "शुरुआत कैसे करना चाहते हैं?", options: ["मेरे स्कूल का नाम ज्ञान निकेतन है।", "मैं एक बहुत बड़े और सुंदर स्कूल में पढ़ता/पढ़ती हूँ।", "मेरा स्कूल शिक्षा का एक बहुत अच्छा केंद्र है।"] },
          { question: "आपको अपने स्कूल में क्या पसंद है?", options: ["वहाँ मेरे कई अच्छे दोस्त पढ़ते हैं।", "हमारे शिक्षक बहुत दयालु हैं और हमें प्यार से पढ़ाते हैं।", "हमारे स्कूल में एक बड़ा खेल का मैदान और पुस्तकालय है।"] },
          { question: "एक विवरण जोड़ें:", options: ["हम लंच के समय साथ मिलकर खेलते हैं।", "हम हर दिन नए और दिलचस्प विषय सीखते हैं।", "मेरे स्कूल में कई सुंदर पेड़-पौधे हैं।"] },
          { question: "समापन वाक्य:", options: ["मुझे अपने स्कूल जाना बहुत पसंद है।", "मुझे अपने स्कूल पर बहुत गर्व है।", "मेरा स्कूल सबसे अच्छा स्कूल है।"] }
        ]
      }
    },
    animal: {
      template: "मेरा पसंदीदा जानवर [गाय] है। यह एक बहुत [पालतू] और सीधा जानवर है। इसके [चार] पैर और एक लंबी पूंछ होती है। यह हमें [दूध] देती है जो स्वास्थ्य के लिए बहुत [अच्छा] होता है।",
      blanks: [
        { placeholder: "गाय", suggestions: ["गाय", "शेर", "चीता"], hint: "कौन सा जानवर दूध देता है?" },
        { placeholder: "पालतू", suggestions: ["पालतू", "जंगली", "खूंखार"], hint: "गाय कैसा जानवर है?" },
        { placeholder: "चार", suggestions: ["चार", "दो", "छह"], hint: "इसके कितने पैर होते हैं?" },
        { placeholder: "दूध", suggestions: ["दूध", "जूस", "पानी"], hint: "गाय से हमें क्या मिलता है?" },
        { placeholder: "अच्छा", suggestions: ["अच्छा", "हानिकारक", "कड़वा"], hint: "दूध स्वास्थ्य के लिए कैसा होता है?" }
      ],
      wizard: {
        steps: [
          { question: "शुरुआत कैसे करना चाहते हैं?", options: ["मेरा पसंदीदा जानवर गाय है।", "कुत्ता मेरा सबसे पसंदीदा पालतू जानवर है।", "हाथी एक बहुत ही विशाल और बुद्धिमान जानवर है।"] },
          { question: "इसकी विशेषता बताएं:", options: ["यह एक बहुत ही सीधा और मददगार जानवर है।", "यह हमारे घर की रखवाली करता है और वफादार होता है।", "इसकी एक लंबी सूंड होती है और यह शाकाहारी होता है।"] },
          { question: "यह हमें क्या देता है या क्या खाता है?", options: ["यह हमें स्वास्थ्यवर्धक दूध देती है।", "यह रोटी, मांस और बचा हुआ खाना खाता है।", "यह हरी पत्तियां और गन्ने बड़े चाव से खाता है।"] },
          { question: "आप इसे क्यों पसंद करते हैं?", options: ["मुझे यह इसकी मासूमियत के कारण पसंद है।", "मुझे इसकी वफादारी और चंचलता पसंद है।", "मुझे इसकी ताकत और शांत स्वभाव पसंद है।"] }
        ]
      }
    },
    default: {
      template: "मैं [विषय] के बारे में लिखना चाहता/चाहती हूँ। यह हमारे लिए बहुत [ज़रूरी] है क्योंकि इसके कई [लाभ] हैं। उदाहरण के लिए, [विवरण]। इसलिए हमें हमेशा [कार्य] करना चाहिए। अंत में, स्वच्छ विचार हमें [प्रगति] की ओर ले जाते हैं।",
      blanks: [
        { placeholder: "विषय", suggestions: ["स्वच्छता", "शिक्षा", "स्वास्थ्य"], hint: "मुख्य विषय" },
        { placeholder: "ज़रूरी", suggestions: ["ज़रूरी", "बेकार", "कठिन"], hint: "विषय का महत्व" },
        { placeholder: "लाभ", suggestions: ["लाभ", "हानि", "प्रभाव"], hint: "विषय का परिणाम" },
        { placeholder: "विवरण", suggestions: ["नियमों का पालन", "प्रतिदिन अभ्यास", "योगदान"], hint: "एक उदाहरण दें" },
        { placeholder: "कार्य", suggestions: ["मेहनत", "आराम", "मदद"], hint: "हमें क्या करना चाहिए?" },
        { placeholder: "प्रगति", suggestions: ["प्रगति", "विनाश", "पीछे"], hint: "निष्कर्ष" }
      ],
      wizard: {
        steps: [
          { question: "शुरुआत कैसे करना चाहते हैं?", options: ["आज मैं इस विषय पर अपने विचार साझा करना चाहता हूँ।", "यह समाज के विकास के लिए एक बहुत महत्वपूर्ण विषय है।", "इस विषय के बारे में जानना हम सभी के लिए अत्यंत आवश्यक है।"] },
          { question: "मुख्य कारण या लाभ क्या है?", options: ["यह हमें नया ज्ञान प्राप्त करने में मदद करता है।", "इससे हमारे जीवन स्तर में काफी सुधार आता है।", "यह हमारे समाज को अधिक सुंदर और जागरूक बनाता है।"] },
          { question: "एक उदाहरण दें:", options: ["उदाहरण के लिए, हम इसका दैनिक अभ्यास कर सकते हैं।", "जैसे कि यह बच्चों के बेहतर भविष्य के लिए उपयोगी है।", "हम अपने आसपास इसके सकारात्मक प्रभाव देख सकते हैं।"] },
          { question: "निष्कर्ष या समापन वाक्य चुनें:", options: ["अतः, हमें इसे पूरी तरह से अपनाना चाहिए।", "इसलिए, इस दिशा में मिलकर काम करना ही सही मार्ग है।", "यही कारण है कि यह विषय इतना महत्वपूर्ण माना जाता है।"] }
        ]
      }
    },
    letter: {
      to: "प्रधानाचार्य/प्रधानाचार्या",
      subject: "छुट्टी के लिए प्रार्थना पत्र",
      body: "सेवा में,\nप्रधानाचार्य/प्रधानाचार्या,\n[ज्ञान निकेतन] विद्यालय\n\nविषय: छुट्टी के लिए प्रार्थना पत्र\n\nमहोदय/महोदया,\n\nसविनय निवेदन है कि मैं [5वीं] कक्षा में पढ़ता/पढ़ती हूँ। मुझे [बीमारी] के कारण दिनांक [19 अगस्त] से [21 अगस्त] तक छुट्टी चाहिए। कृपया मुझे छुट्टी प्रदान करने की कृपा करें।\n\nधन्यवाद।\n\nका/की आज्ञाकारी छात्र/छात्रा\nनाम: [आयशा]\nकक्षा: [5वीं]",
      blanks: [
        { placeholder: "ज्ञान निकेतन", suggestions: ["ज्ञान निकेतन", "राजकीय", "डी.ए.वी."], hint: "विद्यालय का नाम" },
        { placeholder: "5वीं", suggestions: ["5वीं", "6वीं", "7वीं", "8वीं"], hint: "अपनी कक्षा" },
        { placeholder: "बीमारी", suggestions: ["बीमारी", "शादी", "ज़रूरी काम"], hint: "छुट्टी का कारण" },
        { placeholder: "19 अगस्त", suggestions: ["19 अगस्त", "आज", "कल"], hint: "प्रारंभ तिथि" },
        { placeholder: "21 अगस्त", suggestions: ["21 अगस्त", "परसों", "अगले हफ्ते"], hint: "समाप्ति तिथि" },
        { placeholder: "आयशा", suggestions: ["आयशा", "राहुल", "अपना नाम"], hint: "अपना नाम लिखें" }
      ]
    }
  },
  kn: {
    cleanliness: {
      template: "ಶುಚಿತ್ವವು ನಮ್ಮ ಜೀವನದಲ್ಲಿ ಬಹಳ [ಮುಖ್ಯವಾಗಿದೆ]. ನಾವು ನಮ್ಮ ಮನೆ, ಶಾಲೆ ಮತ್ತು ಸುತ್ತಮುತ್ತಲಿನ ಪ್ರದೇಶಗಳನ್ನು [ಸ್ವಚ್ಛವಾಗಿಡಬೇಕು]. ಶುಚಿತ್ವವು ನಮ್ಮನ್ನು ಕಾಯಿಲೆಗಳಿಂದ [ರಕ್ಷಿಸುತ್ತದೆ]. ನಾವು ಯಾವಾಗಲೂ ಕಸವನ್ನು [ಕಸದ ಬುಟ್ಟಿ] ಗೆ ಹಾಕಬೇಕು. ಸ್ವಚ್ಛ ಪರಿಸರವು ನಮ್ಮನ್ನು [ಆರೋಗ್ಯವಾಗಿ] ಮತ್ತು ಸಂತೋಷವಾಗಿಡುತ್ತದೆ.",
      blanks: [
        { placeholder: "ಮುಖ್ಯವಾಗಿದೆ", suggestions: ["ಮುಖ್ಯವಾಗಿದೆ", "ಅಪ್ರಸ್ತುತ", "ಕೆಟ್ಟದು"], hint: "ಶುಚಿತ್ವದ ಮಹತ್ವವೇನು?" },
        { placeholder: "ಸ್ವಚ್ಛವಾಗಿಡಬೇಕು", suggestions: ["ಸ್ವಚ್ಛವಾಗಿಡಬೇಕು", "ಗಲೀಜು ಮಾಡಬೇಕು", "ಹಾಳು ಮಾಡಬೇಕು"], hint: "ಪರಿಸರವನ್ನು ಹೇಗೆ ಇಡಬೇಕು?" },
        { placeholder: "ರಕ್ಷಿಸುತ್ತದೆ", suggestions: ["ರಕ್ಷಿಸುತ್ತದೆ", "ದೂಡುತ್ತದೆ", "ಬಾಧಿಸುತ್ತದೆ"], hint: "ಕಾಯಿಲೆಯಿಂದ ನಮಗೆ ಏನು ಮಾಡುತ್ತದೆ?" },
        { placeholder: "ಕಸದ ಬುಟ್ಟಿ", suggestions: ["ಕಸದ ಬುಟ್ಟಿ", "ರಸ್ತೆ", "ನದಿ"], hint: "ಕಸವನ್ನು ಎಲ್ಲಿ ಹಾಕಬೇಕು?" },
        { placeholder: "ಆರೋಗ್ಯವಾಗಿ", suggestions: ["ಆರೋಗ್ಯವಾಗಿ", "ಅನಾರೋಗ್ಯವಾಗಿ", "ಸುಸ್ತಾಗಿ"], hint: "ಸ್ವಚ್ಛ ಪರಿಸರ ನಮ್ಮನ್ನು ಹೇಗೆ ಇಡುತ್ತದೆ?" }
      ],
      wizard: {
        steps: [
          { question: "ಬರವಣಿಗೆಯನ್ನು ಹೇಗೆ ಪ್ರಾರಂಭಿಸಲು ಬಯಸುತ್ತೀರಿ?", options: ["ಶುಚಿತ್ವವು ನಮ್ಮ ಜೀವನದ ಪ್ರಮುಖ ಭಾಗವಾಗಿದೆ.", "ನಮ್ಮ ಸುತ್ತಮುತ್ತಲಿನ ಪ್ರದೇಶಗಳನ್ನು ಸ್ವಚ್ಛವಾಗಿಡುವುದು ಪ್ರತಿಯೊಬ್ಬರ ಕರ್ತವ್ಯ.", "ಸ್ವಚ್ಛ ಪರಿಸರವು ನಮ್ಮನ್ನು ಆರೋಗ್ಯವಾಗಿ ಮತ್ತು ಸಂತೋಷವಾಗಿಡುತ್ತದೆ."] },
          { question: "ನಿಮ್ಮ ಮುಖ್ಯ ಆಲೋಚನೆ ಏನು?", options: ["ನಾವು ನಮ್ಮ ಸುತ್ತಮುತ್ತಲಿನ ಪ್ರದೇಶಗಳನ್ನು ಸ್ವಚ್ಛವಾಗಿಟ್ಟರೆ, ಕಾಯಿಲೆಗಳು ಹರಡುವುದಿಲ್ಲ.", "ಕಸ ಮತ್ತು ಕೊಳಕು ನಮ್ಮ ಪರಿಸರ ಮತ್ತು ಆರೋಗ್ಯಕ್ಕೆ ಹಾನಿ ಮಾಡುತ್ತದೆ.", "ಶುಚಿತ್ವವು ನಮ್ಮ ಮನೆ ಮತ್ತು ಶಾಲೆ ಎರಡನ್ನೂ ಸುಂದರಗೊಳಿಸುತ್ತದೆ."] },
          { question: "ಒಂದು ಉದಾಹರಣೆ ನೀಡಿ:", options: ["ಉದಾಹರಣೆಗೆ, ನಾವು ಯಾವಾಗಲೂ ಕಸವನ್ನು ಕಸದ ಬುಟ್ಟಿಗೆ ಹಾಕಬೇಕು.", "ಉದಾಹರಣೆಗೆ, ಊಟಕ್ಕೆ ಮುಂಚೆ ಕೈ ತೊಳೆಯುವುದು ಬಹಳ ಮುಖ್ಯ.", "ನಾವು ನಮ್ಮ ತರಗತಿಯನ್ನು ಮನೆಯಂತೆಯೇ ಸ್ವಚ್ಛವಾಗಿಡಬೇಕು."] },
          { question: "ನಿಮ್ಮ ಸಲಹೆ ಅಥವಾ ಮುಕ್ತಾಯ ತಿಳಿಸಿ:", options: ["ಆದ್ದರಿಂದ, ನಾವು ಸ್ವಚ್ಛತಾ ಅಭಿಯಾನಕ್ಕೆ ನಮ್ಮ ಕೊಡುಗೆ ನೀಡಬೇಕು.", "ಆದ್ದರಿಂದ, ನಾವು ಶುಚಿತ್ವವನ್ನು ದಿನನಿತ್ಯದ ಅಭ್ಯಾಸ ಮಾಡಿಕೊಳ್ಳಬೇಕು.", "ಆಗ ಮಾತ್ರ ನಾವು ಆರೋಗ್ಯವಂತ ಸಮಾಜವನ್ನು ನಿರ್ಮಿಸಬಹುದು."] }
        ]
      }
    },
    school: {
      template: "ನನ್ನ ಶಾಲೆಯ ಹೆಸರು [ಜ್ಞಾನ ನಿಕೇತನ]. ನನ್ನ ಶಾಲೆ ತುಂಬಾ [ಸುಂದರ] ಮತ್ತು ದೊಡ್ಡದಾಗಿದೆ. ಅಲ್ಲಿ ನನ್ನ ಅನೇಕ [ಸ್ನೇಹಿತರು] ಓದುತ್ತಿದ್ದಾರೆ. ನಮ್ಮ [ಶಿಕ್ಷಕರು] ನಮಗೆ ಬಹಳ ಪ್ರೀತಿಯಿಂದ ಕಲಿಸುತ್ತಾರೆ. ನನಗೆ ನನ್ನ ಶಾಲೆಗೆ ಹೋಗಲು ತುಂಬಾ [ಇಷ್ಟ].",
      blanks: [
        { placeholder: "ಜ್ಞಾನ ನಿಕೇತನ", suggestions: ["ಜ್ಞಾನ ನಿಕೇತನ", "ಸರ್ಕಾರಿ ಶಾಲೆ", "ಆದರ್ಶ ಶಾಲೆ"], hint: "ನಿಮ್ಮ ಶಾಲೆಯ ಹೆಸರು" },
        { placeholder: "ಸುಂದರ", suggestions: ["ಸುಂದರ", "ಚಿಕ್ಕದು", "ಕತ್ತಲೆ"], hint: "ಶಾಲೆ ಹೇಗೆ ಕಾಣುತ್ತದೆ?" },
        { placeholder: "ಸ್ನೇಹಿತರು", suggestions: ["ಸ್ನೇಹಿತರು", "ಶತ್ರುಗಳು", "ಅಪರಿಚಿತರು"], hint: "ನಿಮ್ಮ ಜೊತೆ ಯಾರು ಓದುತ್ತಾರೆ?" },
        { placeholder: "ಶಿಕ್ಷಕರು", suggestions: ["ಶಿಕ್ಷಕರು", "ಅಂಗಡಿಯವರು", "ರೈತರು"], hint: "ನಮಗೆ ಯಾರು ಕಲಿಸುತ್ತಾರೆ?" },
        { placeholder: "ಇಷ್ಟ", suggestions: ["ಇಷ್ಟ", "ಕಷ್ಟ", "ಬೇಸರ"], hint: "ಶಾಲೆಗೆ ಹೋಗುವುದು ನಿಮಗೆ ಹೇಗನಿಸುತ್ತದೆ?" }
      ],
      wizard: {
        steps: [
          { question: "ಹೇಗೆ ಪ್ರಾರಂಭಿಸಲು ಬಯಸುತ್ತೀರಿ?", options: ["ನನ್ನ ಶಾಲೆಯ ಹೆಸರು ಜ್ಞಾನ ನಿಕೇತನ.", "ನಾನು ತುಂಬಾ ದೊಡ್ಡ ಮತ್ತು ಸುಂದರವಾದ ಶಾಲೆಯಲ್ಲಿ ಓದುತ್ತಿದ್ದೇನೆ.", "ನನ್ನ ಶಾಲೆ ಕಲಿಯಲು ಒಂದು ಅದ್ಭುತವಾದ ಸ್ಥಳವಾಗಿದೆ."] },
          { question: "ನಿಮಗೆ ಶಾಲೆಯಲ್ಲಿ ಏನು ಇಷ್ಟ?", options: ["ನನ್ನ ಜೊತೆ ಓದುವ ಅನೇಕ ಒಳ್ಳೆಯ ಸ್ನೇಹಿತರಿದ್ದಾರೆ.", "ನಮ್ಮ ಶಿಕ್ಷಕರು ಬಹಳ ದಯಾಳು ಮತ್ತು ನಮಗೆ ಪ್ರೀತಿಯಿಂದ ಕಲಿಸುತ್ತಾರೆ.", "ನಮ್ಮ ಶಾಲೆಯಲ್ಲಿ ದೊಡ್ಡ ಆಟದ ಮೈದಾನ ಮತ್ತು ಗ್ರಂಥಾಲಯವಿದೆ."] },
          { question: "ಒಂದು ವಿವರಣೆ ನೀಡಿ:", options: ["ನಾವು ಬಿಡುವಿನ ವೇಳೆಯಲ್ಲಿ ಒಟ್ಟಿಗೆ ಆಟವಾಡುತ್ತೇವೆ.", "ನಾವು ಪ್ರತಿದಿನ ಹೊಸ ಮತ್ತು ಆಸಕ್ತಿದಾಯಕ ವಿಷಯಗಳನ್ನು ಕಲಿಯುತ್ತೇವೆ.", "ನನ್ನ ಶಾಲೆಯಲ್ಲಿ ಸುಂದರವಾದ ಗಿಡಮರಗಳಿವೆ."] },
          { question: "ಮುಕ್ತಾಯದ ವಾಕ್ಯ:", options: ["ನಮಗೆ ಪ್ರತಿದಿನ ಶಾಲೆಗೆ ಹೋಗಲು ತುಂಬಾ ಇಷ್ಟ.", "ನನ್ನ ಶಾಲೆಯ ಬಗ್ಗೆ ನನಗೆ ತುಂಬಾ ಹೆಮ್ಮೆಯಿದೆ.", "ನನ್ನ ಶಾಲೆ ಈ ಪ್ರದೇಶದಲ್ಲೇ ಅತ್ಯುತ್ತಮ ಶಾಲೆಯಾಗಿದೆ."] }
        ]
      }
    },
    animal: {
      template: "ನನ್ನ ಪ್ರೀತಿಯ ಪ್ರಾಣಿ [ಹಸು]. ಇದು ತುಂಬಾ [ಸಾದು] ಪ್ರಾಣಿಯಾಗಿದೆ. ಇದಕ್ಕೆ [ನಾಲ್ಕು] ಕಾಲುಗಳು ಮತ್ತು ಒಂದು ಉದ್ದನೆಯ ಬಾಲ ಇರುತ್ತದೆ. ಇದು ನಮಗೆ [ಹಾಲು] ನೀಡುತ್ತದೆ, ಅದು ಆರೋಗ್ಯಕ್ಕೆ ತುಂಬಾ [ಒಳ್ಳೆಯದು].",
      blanks: [
        { placeholder: "ಹಸು", suggestions: ["ಹಸು", "ಸಿಂಹ", "ಹುಲಿ"], hint: "ಹಾಲು ಕೊಡುವ ಪ್ರಾಣಿ ಯಾವುದು?" },
        { placeholder: "ಸಾದು", suggestions: ["ಸಾದು", "ಕಾಡು", "ಕ್ರೂರ"], hint: "ಹಸು ಎಂತಹ ಪ್ರಾಣಿ?" },
        { placeholder: "ನಾಲ್ಕು", suggestions: ["ನಾಲ್ಕು", "ಎರಡು", "ಆರು"], hint: "ಇದಕ್ಕೆ ಎಷ್ಟು ಕಾಲುಗಳಿವೆ?" },
        { placeholder: "ಹಾಲು", suggestions: ["ಹಾಲು", "ರಸ", "ನೀರು"], hint: "ಹಸುವಿನಿಂದ ಏನು ಸಿಗುತ್ತದೆ?" },
        { placeholder: "ಒಳ್ಳೆಯದು", suggestions: ["ಒಳ್ಳೆಯದು", "ಕೆಟ್ಟದ್ದು", "ವಿಷಕಾರಿ"], hint: "ಹಾಲು ಆರೋಗ್ಯಕ್ಕೆ ಹೇಗಿದೆ?" }
      ],
      wizard: {
        steps: [
          { question: "ಹೇಗೆ ಪ್ರಾರಂಭಿಸಲು ಬಯಸುತ್ತೀರಿ?", options: ["ನನ್ನ ಪ್ರೀತಿಯ ಪ್ರಾಣಿ ಹಸು.", "ನಾಯಿ ನನ್ನ ಅತ್ಯಂತ ಪ್ರೀತಿಯ ಸಾಕುಪ್ರಾಣಿ.", "ಆನೆ ನನಗೆ ತುಂಬಾ ಇಷ್ಟವಾದ ಬುದ್ಧಿವಂತ ಪ್ರಾಣಿ."] },
          { question: "ಇದರ ವಿಶೇಷತೆ ತಿಳಿಸಿ:", options: ["ಇದು ಬಹಳ ಶಾಂತ ಹಾಗೂ ಉಪಯುಕ್ತ ಪ್ರಾಣಿಯಾಗಿದೆ.", "ಇದು ನಮ್ಮ ಮನೆಯನ್ನು ಕಾಯುತ್ತದೆ ಮತ್ತು ನಿಷ್ಠಾವಂತವಾಗಿದೆ.", "ಇದು ದೊಡ್ಡ ಸೊಂಡಿಲು ಹೊಂದಿದ್ದು, ಸೊಪ್ಪು ತಿನ್ನುತ್ತದೆ."] },
          { question: "ಇದು ನಮಗೆ ಏನು ನೀಡುತ್ತದೆ ಅಥವಾ ಏನು ತಿನ್ನುತ್ತದೆ?", options: ["ಇದು ನಮಗೆ ಆರೋಗ್ಯಕರವಾದ ಹಾಲು ನೀಡುತ್ತದೆ.", "ಇದು ರೊಟ್ಟಿ, ಅನ್ನ ಮತ್ತು ಮಾಂಸವನ್ನು ತಿನ್ನುತ್ತದೆ.", "ಇದು ಹಸಿರು ಎಲೆಗಳು ಮತ್ತು ಕಬ್ಬನ್ನು ತಿನ್ನುತ್ತದೆ."] },
          { question: "ನೀವು ಇದನ್ನು ಏಕೆ ಇಷ್ಟಪಡುತ್ತೀರಿ?", options: ["ಇದು ಮೃದು ಸ್ವಭಾವದ್ದಾದ್ದರಿಂದ ನನಗೆ ಇಷ್ಟ.", "ಇದು ನಿಷ್ಠಾವಂತ ಮತ್ತು ಚುರುಕಾಗಿರುವುದರಿಂದ ಇಷ್ಟ.", "ಇದು ಬಲಶಾಲಿ ಮತ್ತು ಬುದ್ಧಿವಂತ ಪ್ರಾಣಿಯಾದ್ದರಿಂದ ಇಷ್ಟ."] }
        ]
      }
    },
    default: {
      template: "ನಾನು [ವಿಷಯ] ಬಗ್ಗೆ ಬರೆಯಲು ಬಯಸುತ್ತೇನೆ. ಇದು ನಮ್ಮ ಜೀವನದಲ್ಲಿ ತುಂಬಾ [ಮುಖ್ಯ] ಏಕೆಂದರೆ ಇದರಿಂದ ಅನೇಕ [ಪ್ರಯೋಜನಗಳು] ಇವೆ. ಉದಾಹರಣೆಗೆ, [ವಿವರಣೆ]. ಆದ್ದರಿಂದ ನಾವು ಯಾವಾಗಲೂ [ಕೆಲಸ] ಮಾಡಬೇಕು. ಕೊನೆಯದಾಗಿ, ಇದು ನಮಗೆ [ಯಶಸ್ಸು] ನೀಡುತ್ತದೆ.",
      blanks: [
        { placeholder: "ವಿಷಯ", suggestions: ["ಶುಚಿತ್ವ", "ಶಿಕ್ಷಣ", "ಆರೋಗ್ಯ"], hint: "ಮುಖ್ಯ ವಿಷಯ" },
        { placeholder: "ಮುಖ್ಯ", suggestions: ["ಮುಖ್ಯ", "ಅಪ್ರಯೋಜಕ", "ಕಠಿಣ"], hint: "ವಿಷಯದ ಮಹತ್ವ" },
        { placeholder: "ಪ್ರಯೋಜನಗಳು", suggestions: ["ಪ್ರಯೋಜನಗಳು", "ನಷ್ಟಗಳು", "ತೊಂದರೆಗಳು"], hint: "ಫಲಿತಾಂಶ" },
        { placeholder: "ವಿವರಣೆ", suggestions: ["ನಿಯಮಗಳ ಪಾಲನೆ", "ದಿನನಿತ್ಯದ ಅಭ್ಯಾಸ", "ಸಹಾಯ"], hint: "ಒಂದು ಉದಾಹರಣೆ ಕೊಡಿ" },
        { placeholder: "ಕೆಲಸ", suggestions: ["ಶ್ರಮ", "ವಿಶ್ರಾಂತಿ", "ಆಟ"], hint: "ನಾವು ಏನು ಮಾಡಬೇಕು?" },
        { placeholder: "ಯಶಸ್ಸು", suggestions: ["ಯಶಸ್ಸು", "ಅಪಜಯ", "ಅವನತಿ"], hint: "ಮುಕ್ತಾಯ" }
      ],
      wizard: {
        steps: [
          { question: "ಆರಂಭಿಕ ವಾಕ್ಯವನ್ನು ಆರಿಸಿ:", options: ["ಇಂದು ನಾನು ಈ ವಿಷಯದ ಬಗ್ಗೆ ಬರೆಯಲು ಇಷ್ಟಪಡುತ್ತೇನೆ.", "ಇದು ನಮ್ಮ ಸಮಾಜದ ಅಭಿವೃದ್ಧಿಗೆ ತುಂಬಾ ಮುಖ್ಯವಾದ ವಿಷಯ.", "ಈ ವಿಷಯದ ಬಗ್ಗೆ ನಾವೆಲ್ಲರೂ ತಿಳಿದುಕೊಳ್ಳುವುದು ಅಗತ್ಯ."] },
          { question: "ಮುಖ್ಯ ಕಾರಣ ಅಥವಾ ಪ್ರಯೋಜನವೇನು?", options: ["ಇದು ನಮಗೆ ಹೊಸ ಜ್ಞಾನವನ್ನು ಪಡೆಯಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ.", "ಇದರಿಂದ ನಮ್ಮ ಜೀವನ ಶೈಲಿ ಸುಧಾರಿಸುತ್ತದೆ.", "ಇದು ಸಮಾಜದಲ್ಲಿ ಜಾಗೃತಿ ಮೂಡಿಸಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ."] },
          { question: "ಒಂದು ಉದಾಹರಣೆ ನೀಡಿ:", options: ["ಉದಾಹರಣೆಗೆ, ನಾವು ಇದನ್ನು ಪ್ರತಿದಿನ ಅಭ್ಯಾಸ ಮಾಡಬಹುದು.", "ಇದು ಮಕ್ಕಳ ಉತ್ತಮ ಭವಿಷ್ಯಕ್ಕಾಗಿ ಸಹಕಾರಿಯಾಗಿದೆ.", "ನಮ್ಮ ಸುತ್ತಮುತ್ತ ಇದರ ಪ್ರಭಾವವನ್ನು ಕಾಣಬಹುದು."] },
          { question: "ಮುಕ್ತಾಯದ ವಾಕ್ಯವನ್ನು ಆರಿಸಿ:", options: ["ಆದ್ದರಿಂದ, ನಾವು ಇದನ್ನು ಸಂಪೂರ್ಣವಾಗಿ ಬೆಂಬಲಿಸಬೇಕು.", "ನಾವು ಒಟ್ಟಾಗಿ ಕೆಲಸ ಮಾಡುವುದು ಉತ್ತಮ ಮಾರ್ಗವಾಗಿದೆ.", "ಇದಕ್ಕಾಗಿಯೇ ಈ ವಿಷಯವು ಇಷ್ಟು ಪ್ರಾಮುಖ್ಯತೆ ಪಡೆದಿದೆ."] }
        ]
      }
    },
    letter: {
      to: "ಮುಖ್ಯೋಪಾಧ್ಯಾಯರು",
      subject: "ರಜೆಗಾಗಿ ಅರ್ಜಿ",
      body: "ಗೌರವಾನ್ವಿತ,\nಮುಖ್ಯೋಪಾಧ್ಯಾಯರು,\n[ಜ್ಞಾನ ನಿಕೇತನ] ಶಾಲೆ\n\nವಿಷಯ: ರಜೆಗಾಗಿ ಅರ್ಜಿ\n\nಮಾನ್ಯರೇ,\n\nನಾನು ನಿಮ್ಮ ಶಾಲೆಯ [೫ನೇ] ತರಗತಿಯಲ್ಲಿ ಓದುತ್ತಿದ್ದೇನೆ. ನನಗೆ [ಜ್ವರ] ಇರುವುದರಿಂದ ದಿನಾಂಕ [೧೯ ಆಗಸ್ಟ್] ರಿಂದ [೨೧ ಆಗಸ್ಟ್] ವರೆಗೆ ರಜೆ ಬೇಕಾಗಿದೆ. ದಯವಿಟ್ಟು ರಜೆ ನೀಡಲು ವಿನಂತಿಸುತ್ತೇನೆ.\n\nಧನ್ಯವಾದಗಳು.\n\nಇಂತಿ ತಮ್ಮ ನಂಬಿಕಸ್ಥ ವಿದ್ಯಾರ್ಥಿ,\nಹೆಸರು: [ಆಯಿಷಾ]\nತರಗತಿ: [೫ನೇ]",
      blanks: [
        { placeholder: "ಜ್ಞಾನ ನಿಕೇತನ", suggestions: ["ಜ್ಞಾನ ನಿಕೇತನ", "ಸರ್ಕಾರಿ", "ಆದರ್ಶ"], hint: "ಶಾಲೆಯ ಹೆಸರು" },
        { placeholder: "೫ನೇ", suggestions: ["೫ನೇ", "೬ನೇ", "೭ನೇ", "೮ನೇ"], hint: "ನಿಮ್ಮ ತರಗತಿ" },
        { placeholder: "ಜ್ವರ", suggestions: ["ಜ್ವರ", "ಮದುವೆ", "ತುರ್ತು ಕೆಲಸ"], hint: "ರಜೆಯ ಕಾರಣ" },
        { placeholder: "೧೯ ಆಗಸ್ಟ್", suggestions: ["೧೯ ಆಗಸ್ಟ್", "ಇಂದು", "ನಾಳೆ"], hint: "ಪ್ರಾರಂಭ ದಿನಾಂಕ" },
        { placeholder: "೨೧ ಆಗಸ್ಟ್", suggestions: ["೨೧ ಆಗಸ್ಟ್", "ನಾಡಿದ್ದು", "ಮುಂದಿನ ವಾರ"], hint: "ಮುಕ್ತಾಯ ದಿನಾಂಕ" },
        { placeholder: "ಆಯಿಷಾ", suggestions: ["ಆಯಿಷಾ", "ರಾಹುಲ್", "ನಿಮ್ಮ ಹೆಸರು"], hint: "ನಿಮ್ಮ ಹೆಸರು ಬರೆಯಿರಿ" }
      ]
    }
  },
  ta: {
    cleanliness: {
      template: "சுத்தம் நம் வாழ்வில் மிகவும் [முக்கியமானது]. நமது வீடு, பள்ளி மற்றும் சுற்றுப்புறங்களை [சுத்தமாக] வைத்திருக்க வேண்டும். சுத்தம் நம்மை நோய்களிலிருந்து [பாதுகாக்கிறது]. குப்பைகளை எப்போதும் [குப்பைத்தொட்டி] இல் போட வேண்டும். சுத்தமான சூழல் நம்மை [ஆரோக்கியமாகவும்] மகிழ்ச்சியாகவும் வைக்கிறது.",
      blanks: [
        { placeholder: "முக்கியமானது", suggestions: ["முக்கியமானது", "தேவையற்றது", "கெட்டது"], hint: "சுத்தத்தின் முக்கியத்துவம் என்ன?" },
        { placeholder: "சுத்தமாக", suggestions: ["சுத்தமாக", "அசுத்தமாக", "குப்பையாக"], hint: "இடங்களை எப்படி வைத்திருக்க வேண்டும்?" },
        { placeholder: "பாதுகாக்கிறது", suggestions: ["பாதுகாக்கிறது", "பாதிக்கிறது", "தள்ளுகிறது"], hint: "நோய் வராமல் சுத்தம் என்ன செய்கிறது?" },
        { placeholder: "குப்பைத்தொட்டி", suggestions: ["குப்பைத்தொட்டி", "சாலை", "ஆறு"], hint: "குப்பைகளை எங்கு போட வேண்டும்?" },
        { placeholder: "ஆரோக்கியமாகவும்", suggestions: ["ஆரோக்கியமாகவும்", "நோயுடனும்", "சோர்வாகவும்"], hint: "சுத்தமான சூழல் நம்மை எப்படி வைக்கும்?" }
      ],
      wizard: {
        steps: [
          { question: "எழுத்தை எவ்வாறு தொடங்க விரும்புகிறீர்கள்?", options: ["சுத்தம் நம் வாழ்வின் மிக முக்கியமான பகுதியாகும்.", "நம் சுற்றுப்புறத்தை சுத்தமாக வைத்திருப்பது ஒவ்வொருவரின் கடமையாகும்.", "சுத்தமான சூழல் நம்மை ஆரோக்கியமாகவும் மகிழ்ச்சியாகவும் வைக்கிறது."] },
          { question: "உங்களின் முக்கிய கருத்து என்ன?", options: ["நம் சுற்றுப்புறத்தை சுத்தமாக வைத்தால், நோய்கள் பரவாது.", "குப்பைகளும் அசுத்தமும் நமது சூழலையும் ஆரோக்கியத்தையும் கெடுக்கின்றன.", "சுத்தம் நமது வீடு மற்றும் பள்ளி இரண்டையும் அழகாக்குகிறது."] },
          { question: "ஒரு உதாரணத்தைச் சேர்க்கவும்:", options: ["உதாரணமாக, குப்பைகளை எப்போதும் குப்பைத்தொட்டியிலேயே போட வேண்டும்.", "உதாரணமாக, சாப்பிடும் முன் கைகழுவுவது மிகவும் முக்கியம்.", "நமது வகுப்பறையையும் வீட்டைப் போலவே சுத்தமாக வைத்திருக்க வேண்டும்."] },
          { question: "உங்களின் ஆலோசனை அல்லது முடிவுரையைத் தருக:", options: ["எனவே, நாம் தூய்மைப் பணியில் நம் பங்களிப்பை வழங்க வேண்டும்.", "எனவே, சுத்தத்தை நமது அன்றாடப் பழக்கமாக்கிக் கொள்ள வேண்டும்.", "அப்போதுதான் நாம் ஒரு ஆரோக்கியமான சமுதாயத்தை உருவாக்க முடியும்."] }
        ]
      }
    },
    school: {
      template: "எனது பள்ளியின் பெயர் [ஞான நிகேதன்]. எனது பள்ளி மிகவும் [அழகானது] மற்றும் பெரியது. அங்கு எனது [நண்பர்கள்] பலர் படிக்கிறார்கள். எங்கள் [ஆசிரியர்கள்] எங்களுக்கு அன்போடு கற்பிக்கிறார்கள். எனக்கு எனது பள்ளிக்குச் செல்ல மிகவும் [பிடிக்கும்].",
      blanks: [
        { placeholder: "ஞான நிகேதன்", suggestions: ["ஞான நிகேதன்", "அரசு பள்ளி", "மாடல் பள்ளி"], hint: "பள்ளியின் பெயர்" },
        { placeholder: "அழகானது", suggestions: ["அழகானது", "சிறியது", "இருட்டானது"], hint: "பள்ளி எப்படி இருக்கும்?" },
        { placeholder: "நண்பர்கள்", suggestions: ["நண்பர்கள்", "எதிரிகள்", "அந்நியர்கள்"], hint: "உங்களுடன் யார் படிக்கிறார்கள்?" },
        { placeholder: "ஆசிரியர்கள்", suggestions: ["ஆசிரியர்கள்", "வியாபாரிகள்", "விவசாயிகள்"], hint: "யார் கற்பிக்கிறார்கள்?" },
        { placeholder: "பிடிக்கும்", suggestions: ["பிடிக்கும்", "பிடிக்காது", "கடினம்"], hint: "பள்ளிக்கு செல்வது எப்படி இருக்கிறது?" }
      ],
      wizard: {
        steps: [
          { question: "எவ்வாறு தொடங்க விரும்புகிறீர்கள்?", options: ["எனது பள்ளியின் பெயர் ஞான நிகேதன்.", "நான் ஒரு பெரிய மற்றும் அழகான பள்ளியில் படிக்கிறேன்.", "எனது பள்ளி கற்பதற்கான ஒரு சிறந்த இடமாகும்."] },
          { question: "உங்களுக்கு பள்ளியில் என்ன பிடிக்கும்?", options: ["என்னுடன் படிக்கும் பல நல்ல நண்பர்கள் எனக்கு உள்ளனர்.", "எங்கள் ஆசிரியர்கள் மிகவும் அன்பானவர்கள் மற்றும் பொறுமையுடன் கற்பிக்கிறார்கள்.", "எங்கள் பள்ளியில் ஒரு பெரிய விளையாட்டு மைதானமும் நூலகமும் உள்ளன."] },
          { question: "ஒரு விவரத்தைச் சேர்க்கவும்:", options: ["நாங்கள் இடைவேளை நேரத்தில் ஒன்றாக விளையாடுகிறோம்.", "நாங்கள் ஒவ்வொரு நாளும் புதிய சுவாரஸ்யமான விஷயங்களைக் கற்கிறோம்.", "எனது பள்ளியில் பல அழகான செடி கொடிகள் உள்ளன."] },
          { question: "முடிவுரை வாக்கியம்:", options: ["எனக்கு தினமும் பள்ளிக்குச் செல்ல மிகவும் பிடிக்கும்.", "எனது பள்ளியைப் பற்றி நான் மிகவும் பெருமைப்படுகிறேன்.", "எனது பள்ளி இப்பகுதியில் மிகச் சிறந்த பள்ளியாகும்."] }
        ]
      }
    },
    animal: {
      template: "எனக்குப் பிடித்த விலங்கு [பசு]. இது மிகவும் [சாதுவான] வீட்டு விலங்கு. இதற்கு [நான்கு] கால்களும் ஒரு நீண்ட வாலும் உள்ளன. இது நமக்கு [பால்] தருகிறது, அது ஆரோக்கியத்திற்கு மிகவும் [நல்லது].",
      blanks: [
        { placeholder: "பசு", suggestions: ["பசு", "சிங்கம்", "புலி"], hint: "பால் தரும் விலங்கு எது?" },
        { placeholder: "சாதுவான", suggestions: ["சாதுவான", "காட்டு", "கொடிய"], hint: "பசு எத்தகைய விலங்கு?" },
        { placeholder: "நான்கு", suggestions: ["நான்கு", "இரண்டு", "அறு"], hint: "இதற்கு எத்தனை கால்கள் உள்ளன?" },
        { placeholder: "பால்", suggestions: ["பால்", "சாறு", "தண்ணீர்"], hint: "பசுவிடமிருந்து என்ன கிடைக்கிறது?" },
        { placeholder: "நல்லது", suggestions: ["நல்லது", "கெட்டது", "விஷமானது"], hint: "பால் உடலுக்கு எப்படிப்பட்டது?" }
      ],
      wizard: {
        steps: [
          { question: "எவ்வாறு தொடங்க விரும்புகிறீர்கள்?", options: ["எனக்குப் பிடித்த விலங்கு பசு.", "நாய் எனது செல்லமான வீட்டு விலங்கு.", "யானை எனக்கு மிகவும் பிடித்த பிரம்மாண்டமான விலங்கு."] },
          { question: "இதன் சிறப்பம்சத்தை விவரிக்குக:", options: ["இது மிகவும் சாதுவான மற்றும் உபயோகமான விலங்கு.", "இது நமது வீட்டைக் காக்கிறது மற்றும் விசுவாசமானது.", "இது பெரிய தும்பிக்கையைக் கொண்டு இலைகளைத் தின்னும்."] },
          { question: "இது நமக்கு என்ன தருகிறது அல்லது என்ன உண்ணும்?", options: ["இது நமக்கு சத்தான பால் தருகிறது.", "இது சாதம், இறைச்சி மற்றும் ரொட்டி உண்ணும்.", "இது பசுமையான இலைகளையும் கரும்பையும் உண்ணும்."] },
          { question: "நீங்கள ஏன் விரும்புகிறீர்கள்?", options: ["இது அமைதியான குணம் என்பதால் எனக்குப் பிடிக்கும்.", "இது விசுவாசமாகவும் சுறுசுறுப்பாகவும் இருப்பதால் பிடிக்கும்.", "இது வலிமையான மற்றும் அறிவுள்ள விலங்கு என்பதால் பிடிக்கும்."] }
        ]
      }
    },
    default: {
      template: "நான் [தலைப்பு] பற்றி எழுத விரும்புகிறேன். இது நம் வாழ்வில் மிகவும் [முக்கியம்] ஏனெனில் இதனால் பல [நன்மைகள்] உள்ளன. உதாரணத்திற்கு, [விளக்கம்]. எனவே நாம் எப்போதும் [முயற்சி] செய்ய வேண்டும். முடிவாக, இது நமக்கு [வெற்றி] தரும்.",
      blanks: [
        { placeholder: "தலைப்பு", suggestions: ["சுத்தம்", "கல்வி", "சுகாதாரம்"], hint: "முக்கிய தலைப்பு" },
        { placeholder: "முக்கியம்", suggestions: ["முக்கியம்", "வீணானது", "கடினமானது"], hint: "தலைப்பின் முக்கியத்துவம்" },
        { placeholder: "நன்மைகள்", suggestions: ["நன்மைகள்", "தீமைகள்", "இழப்புகள்"], hint: "விளைவுகள்" },
        { placeholder: "விளக்கம்", suggestions: ["ஒழுக்கத்தைப் பேணுதல்", "தினமும் பயிற்சி", "உதவி செய்தல்"], hint: "ஒரு உதாரணம் தருக" },
        { placeholder: "முயற்சி", suggestions: ["உழைப்பு", "ஓய்வு", "விளையாட்டு"], hint: "நாம் என்ன செய்ய வேண்டும்?" },
        { placeholder: "வெற்றி", suggestions: ["வெற்றி", "தோல்வி", "அழிவு"], hint: "முடிவுரை" }
      ],
      wizard: {
        steps: [
          { question: "தொடக்க வாக்கியத்தைத் தேர்ந்தெடுக்கவும்:", options: ["இன்று நான் இந்த தலைப்பைப் பற்றி எழுத விரும்புகிறேன்.", "இது சமுதாய வளர்ச்சிக்கு மிகவும் முக்கியமான ஒரு தலைப்பாகும்.", "இந்த தலைப்பைப் பற்றி நாம் அனைவரும் அறிவது அவசியம்."] },
          { question: "முக்கிய காரணம் அல்லது நன்மை என்ன?", options: ["இது நமக்கு புதிய அறிவைப் பெற உதவுகிறது.", "இதனால் நமது வாழ்க்கை தரம் பெரிதும் உயரும்.", "இது சமுதாயத்தில் விழிப்புணர்வை ஏற்படுத்த உதவுகிறது."] },
          { question: "ஒரு உதாரணம் தருக:", options: ["உதாரணமாக, நாம் ಇದನ್ನು ಪ್ರತಿದಿನ ಅಭ್ಯಾಸ ಮಾಡಬಹುದು.", "ಇದು ಮಕ್ಕಳ ಉತ್ತಮ ಭವಿಷ್ಯಕ್ಕಾಗಿ ಸಹಕಾರಿಯಾಗಿದೆ.", "ನಮ್ಮ ಸುತ್ತಮುತ್ತ ಇದರ ಪ್ರಭಾವವನ್ನು ಕಾಣಬಹುದು."] },
          { question: "ಮುಕ್ತಾಯದ ವಾಕ್ಯವನ್ನು ಆರಿಸಿ:", options: ["ಆದ್ದರಿಂದ, ನಾವು ಇದನ್ನು ಸಂಪೂರ್ಣವಾಗಿ ಬೆಂಬಲಿಸಬೇಕು.", "ನಾವು ಒಟ್ಟಾಗಿ ಕೆಲಸ ಮಾಡುವುದು ಉತ್ತಮ ಮಾರ್ಗವಾಗಿದೆ.", "ಇದಕ್ಕಾಗಿಯೇ ಈ ವಿಷಯವು ಇಷ್ಟು ಪ್ರಾಮುಖ್ಯತೆ ಪಡೆದಿದೆ."] }
        ]
      }
    },
    letter: {
      to: "தலைமை ஆசிரியர்",
      subject: "விடுப்பு விண்ணப்பம்",
      body: "மதிப்பிற்குரிய,\nதலைமை ஆசிரியர்,\n[ஞான நிகேதன்] பள்ளி\n\nபொருள்: விடுப்பு விண்ணப்பம்\n\nஐயா/அம்மா,\n\nநான் உங்கள் பள்ளியில் [5ஆம்] வகுப்பில் படிக்கிறேன். எனக்கு [காய்ச்சல்] காரணமாக [19 ஆகஸ்ட்] முதல் [21 ஆகஸ்ட்] வரை விடுப்பு தேவைப்படுகிறது. தயவுசெய்து விடுப்பு வழங்கும்படி கேட்டுக்கொள்கிறேன்.\n\nநன்றி.\n\nதங்கள் கீழ்ப்படிதலுள்ள மாணவன்/மாணவி,\nபெயர்: [ஆயிஷா]\nவகுப்பு: [5ஆம்]",
      blanks: [
        { placeholder: "ஞான நிகேதன்", suggestions: ["ஞான நிகேதன்", "அரசு", "மாடல்"], hint: "பள்ளியின் பெயர்" },
        { placeholder: "5ஆம்", suggestions: ["5ஆம்", "6ஆம்", "7ஆம்", "8ஆம்"], hint: "வகுப்பு" },
        { placeholder: "காய்ச்சல்", suggestions: ["காய்ச்சல்", "திருமணம்", "அவசர வேலை"], hint: "விடுப்புக்கான காரணம்" },
        { placeholder: "19 ஆகஸ்ட்", suggestions: ["19 ஆகஸ்ட்", "இன்று", "நாளை"], hint: "தொடக்க தேதி" },
        { placeholder: "21 ஆகஸ்ட்", suggestions: ["21 ஆகஸ்ட்", "நாளை மறுநாள்", "அடுத்த வாரம்"], hint: "முடிவு தேதி" },
        { placeholder: "ஆயிஷா", suggestions: ["ஆயிஷா", "ராகுல்", "உங்கள் பெயர்"], hint: "உங்கள் பெயர் எழுதவும்" }
      ]
    }
  }
};

export const getWritingStarterKey = (topicText = '') => {
  const txt = (topicText || '').toLowerCase();
  if (txt.includes('स्वच्छता') || txt.includes('clean') || txt.includes('hygiene') || txt.includes('சுத்தம்') || txt.includes('ಶುಚಿತ್ವ')) {
    return 'cleanliness';
  }
  if (txt.includes('स्कूल') || txt.includes('school') || txt.includes('பள்ளி') || txt.includes('ಶಾಲೆ') || txt.includes('विद्यालय')) {
    return 'school';
  }
  if (txt.includes('जानवर') || txt.includes('animal') || txt.includes('மிருகம்') || txt.includes('விலங்கு') || txt.includes('ಪ್ರಾಣಿ')) {
    return 'animal';
  }
  if (txt.includes('रविवार') || txt.includes('sunday') || txt.includes('ஞாயிறு') || txt.includes('ಭಾನುವಾರ')) {
    return 'sunday';
  }
  return 'default';
};

export const parseTemplateToReact = (template, blanks, filledBlanks, activeBlankIdx, setActiveBlankIdx) => {
  const parts = template.split(/(\[[^\]]+\])/);
  let blankCounter = 0;
  
  return parts.map((part, index) => {
    if (part.startsWith('[') && part.endsWith(']')) {
      const currentCounter = blankCounter++;
      const blankInfo = blanks[currentCounter] || { placeholder: part.slice(1, -1), suggestions: [], hint: "" };
      const currentVal = filledBlanks[currentCounter] !== undefined ? filledBlanks[currentCounter] : `[ ${blankInfo.placeholder} ]`;
      const isActive = activeBlankIdx === currentCounter;
      
      return (
        <span
          key={index}
          onClick={() => setActiveBlankIdx(currentCounter)}
          style={{
            display: 'inline',
            borderBottom: isActive ? '3.5px solid var(--color-orange)' : '2px dashed var(--color-orange-dark)',
            padding: '2px 8px',
            margin: '0 4px',
            borderRadius: '6px',
            background: isActive ? '#FFE0B2' : '#FFF3E0',
            color: 'var(--color-orange-dark)',
            fontWeight: 900,
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          {currentVal}
        </span>
      );
    }
    return <span key={index} style={{ whiteSpace: 'pre-wrap' }}>{part}</span>;
  });
};
