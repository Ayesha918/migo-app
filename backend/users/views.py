# backend/users/views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q
from django.contrib.auth.hashers import make_password, check_password
from .models import Learner, PhoneAccount, DeviceSession, Book, SupportTicket, CommunityPost, Notification
from .serializers import LearnerSerializer


def normalize_phone_number(email_or_phone):
    """
    Cleans and normalizes identifier (email address).
    Preserves original helper name to avoid renaming DB columns.
    """
    if not email_or_phone:
        return ""
    return email_or_phone.strip().lower()


@api_view(['POST'])
def register_learner(request):
    """
    POST /api/users/register
    Body: { name, age, known_language, learning_language, avatar, phone_number, device_id }
    Creates a new Learner, links it to PhoneAccount, and returns the generated learner_id.
    """
    phone_number = request.data.get('phone_number')
    device_id = request.data.get('device_id')

    serializer = LearnerSerializer(data=request.data)
    if serializer.is_valid():
        learner = serializer.save()

        if phone_number:
            normalized = normalize_phone_number(phone_number)
            phone_account, _ = PhoneAccount.objects.get_or_create(phone_number=normalized)
            learner.phone_account = phone_account
            learner.save()

            if device_id:
                DeviceSession.objects.get_or_create(phone_account=phone_account, device_id=device_id)

        return Response(LearnerSerializer(learner).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def search_learner(request):
    """
    GET /api/users/search?learner_id=MG000001
    GET /api/users/search?name=ravi
    Returns matching learner(s) for the Login screen.
    """
    learner_id = request.query_params.get('learner_id', '').strip()
    name = request.query_params.get('name', '').strip()

    if not learner_id and not name:
        return Response(
            {'error': 'Provide either learner_id or name to search.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if learner_id:
        # Exact match expected for a Learner ID
        learners = Learner.objects.filter(learner_id__iexact=learner_id)
    else:
        # Partial, case-insensitive match for name search
        learners = Learner.objects.filter(name__icontains=name)

    if not learners.exists():
        return Response(
            {'error': 'No matching learner found.'},
            status=status.HTTP_404_NOT_FOUND
        )

    serializer = LearnerSerializer(learners, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
def signup_account(request):
    """
    POST /api/users/signup
    Body: { email, password }
    Creates a new PhoneAccount (email identifier) with hashed password.
    """
    email = request.data.get('email')
    password = request.data.get('password')

    if not email or not password:
        return Response({'error': 'Email address and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

    normalized = email.strip().lower()

    if PhoneAccount.objects.filter(phone_number=normalized).exists():
        return Response({'error': 'An account with this email address already exists. Please log in.'}, status=status.HTTP_400_BAD_REQUEST)

    hashed_password = make_password(password)
    PhoneAccount.objects.create(phone_number=normalized, password=hashed_password)

    return Response({'success': True, 'email': normalized}, status=status.HTTP_201_CREATED)


@api_view(['POST'])
def login_account(request):
    """
    POST /api/users/login
    Body: { email, password, device_id }
    Authenticates email and password. Registers trusted device session.
    """
    email = request.data.get('email')
    password = request.data.get('password')
    device_id = request.data.get('device_id')

    if not email or not password:
        return Response({'error': 'Email address and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

    normalized = email.strip().lower()

    try:
        phone_account = PhoneAccount.objects.get(phone_number=normalized)
    except PhoneAccount.DoesNotExist:
        return Response({'error': 'Invalid email address or password.'}, status=status.HTTP_400_BAD_REQUEST)

    if not phone_account.password:
        return Response({'error': 'This account was signed up via Google. Please log in with Google.'}, status=status.HTTP_400_BAD_REQUEST)

    if not check_password(password, phone_account.password):
        return Response({'error': 'Invalid email address or password.'}, status=status.HTTP_400_BAD_REQUEST)

    if device_id:
        DeviceSession.objects.get_or_create(phone_account=phone_account, device_id=device_id)

    learners = phone_account.learners.all()
    serializer = LearnerSerializer(learners, many=True)

    return Response({
        'verified': True,
        'phone_number': normalized,
        'email': normalized,
        'learners': serializer.data
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
def check_device(request):
    """
    GET /api/users/check-device?learner_id=MG000001&device_id=abc
    Checks if device_id is trusted for learner's phone account.
    """
    learner_id = request.query_params.get('learner_id', '').strip()
    device_id = request.query_params.get('device_id', '').strip()

    if not learner_id or not device_id:
        return Response({'error': 'Provide both learner_id and device_id.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        learner = Learner.objects.get(learner_id__iexact=learner_id)
    except Learner.DoesNotExist:
        return Response({'error': 'Learner not found.'}, status=status.HTTP_404_NOT_FOUND)

    # Legacy fallback: if learner has no phone account, skip verification (trusted directly)
    if not learner.phone_account:
        return Response({'verified': True}, status=status.HTTP_200_OK)

    # Check if a DeviceSession exists
    exists = DeviceSession.objects.filter(phone_account=learner.phone_account, device_id=device_id).exists()
    return Response({'verified': exists}, status=status.HTTP_200_OK)


@api_view(['GET'])
def get_phone_learners(request):
    """
    GET /api/users/phone-learners?phone_number=+91XXXX
    Returns all learners linked to this phone number.
    """
    phone_number = request.query_params.get('phone_number', '').strip()
    if not phone_number:
        return Response({'error': 'Phone number is required.'}, status=status.HTTP_400_BAD_REQUEST)

    normalized = normalize_phone_number(phone_number)
    try:
        phone_account = PhoneAccount.objects.get(phone_number=normalized)
        learners = phone_account.learners.all()
    except PhoneAccount.DoesNotExist:
        learners = Learner.objects.none()

    serializer = LearnerSerializer(learners, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
def list_books(request):
    """
    GET /api/users/books
    Returns all books. Auto-seeds default books if none exist.
    """
    if not Book.objects.exists() or Book.objects.filter(price__contains='₹').exists() or Book.objects.count() < 10 or not Book.objects.filter(title__contains='The Dog and His Reflection').exists():
        Book.objects.all().delete()
        
    if not Book.objects.exists():
        # English Books
        Book.objects.create(
            title='The Lost Wallet: A Story About Integrity', author='Malik Taalib', pages=32,
            category='Family & Friendship', level='Level 2 — Beginner', emoji='👛',
            content='Maya was walking home from school one sunny afternoon. The autumn leaves crunched under her bright red sneakers. As she took a shortcut through the park, she spotted something half-buried under a pile of maple leaves. It was a smooth, dark brown leather wallet.\n\nMaya looked around. The path was empty. She picked it up. It felt heavy. When she opened it, her eyes grew wide. Inside was a thick stack of folded bills. She counted them: ten, twenty, fifty... one hundred dollars in total!\n\nMaya\'s heart raced. A hundred dollars! Nobody saw her pick it up. Nobody would ever know. Her mind began to spin with all the things she could do. She could buy the set of professional sketch pencils she had been wishing for. She could get the sleek blue skateboard from the toy store window. She could buy ice cream for her little brother every day for a month!\n\nBut then, she noticed a small clear pocket inside the wallet. It held a card. Written on the card in neat, elegant handwriting was a name: "Mrs. Park". Mrs. Park was the kind, elderly lady who owned the little corner grocery store near Maya\'s house. She always had a warm smile and a sweet lollipop for Maya and her brother. Mrs. Park worked very hard, standing on her feet all day.\n\nMaya looked at the money, then at the name card. She pictured Mrs. Park\'s face when she realized her wallet was gone. The worry, the sadness.\n\nMaya zipped up her backpack, placing the wallet safely inside. She walked as fast as she could straight to the corner grocery store. When she entered, the little bell above the door jingled. Mrs. Park was at the counter, looking distressed, searching through drawers.\n\n"Hello, Mrs. Park," Maya said softly. "Oh, hello, Maya," Mrs. Park replied, trying to smile but looking tired. "I seem to have lost my wallet today. I\'m a bit worried."\n\nMaya reached into her backpack and pulled out the leather wallet. "Is this it? I found it under the leaves in the park."\n\nMrs. Park gasped, her hands flying to her cheeks. She took the wallet, opened it, and saw everything was intact. Tears of relief filled her eyes. "Oh, Maya! You have no idea how important this is. This was the money to pay the delivery man today," Mrs. Park said, her voice shaking. She reached over the counter and hugged Maya. "Thank you for your honesty and integrity. You are a wonderful girl."\n\nMrs. Park tried to give Maya a reward, but Maya shook her head. "Seeing you happy is reward enough, Mrs. Park."\n\nAs Maya walked home, she didn\'t have the sketch pencils or the skateboard, but she felt a warm, golden glow in her chest. She knew she had done the right thing, and that honesty is the greatest treasure of all.',
            rating=4.8, price='In Library', google_play_url='',
            why_recommended='This story matches your current reading level and introduces simple everyday vocabulary about honesty.',
            audio_available=True, language='en', book_type='Story', cover_image_path='/src/assets/images/lost_wallet_cover.jpg'
        )
        Book.objects.create(
            title='The Tortoise and the Hare', author='Aesop', pages=16,
            category='Folk & Moral Stories', level='Level 1 — Early Reader', emoji='🐢',
            content='Once upon a time, in a green forest, there lived a Hare who was very proud of his speed. He would run circles around the other animals, boasting about how fast he was. "I am the fastest animal in the entire woods!" he would cry. "No one can beat me!" He especially loved to tease the slow-moving Tortoise. "Hey there, slowpoke!" the Hare laughed as he zipped past. "Do you ever get anywhere before sunset?"\n\nThe Tortoise did not get angry. He simply smiled. One day, tired of the Hare\'s constant bragging, the Tortoise said, "You may be fast, but I challenge you to a race." The Hare roared with laughter. "A race? Against you? That is the funniest joke I have ever heard! I will win before you even cross the starting line."\n\nAll the forest animals gathered to watch the race. The clever Fox was chosen as the judge. He drew the starting line and pointed toward the finish post at the other end of the forest. "Three, two, one, go!" barked the Fox.\n\nThe Hare shot forward like an arrow. In a blink of an eye, he was almost out of sight. The Tortoise, on the other hand, began to walk with slow, steady steps: clip-clop, clip-clop, never stopping. The Hare reached the halfway point in no time. He looked back, but the Tortoise was nowhere to be seen.\n\n"This is too easy," thought the proud Hare. "The Tortoise is so far behind. Why should I rush? The sun is warm, and the grass is soft. I think I will take a little nap under this shady oak tree. When I wake up, I can easily run across the finish line." So, the Hare stretched out on the cool grass, closed his eyes, and fell fast asleep.\n\nMeanwhile, the Tortoise kept walking. He walked step-by-step, under the hot sun, through the dusty path. He did not stop to rest, and he did not look back. Minutes turned into hours. The Hare was still sleeping soundly, dreaming of his victory.\n\nQuietly, the Tortoise crawled past the sleeping Hare. He didn\'t make a sound. When the Hare finally woke up, the shadows of evening were long. He jumped to his feet and looked back. "Ah, the Tortoise must still be miles away," he chuckled. But when he turned toward the finish line, he gasped in shock. The Tortoise was just a few inches from the red ribbon!\n\nThe Hare ran as fast as his long legs could carry him, kicking up dust. But it was too late. The Tortoise crossed the line just as the Hare reached him. All the animals cheered and threw wild flowers at the Tortoise. The Fox smiled and announced, "The winner of the race is the Tortoise!" The Hare hung his head in shame, realizing his pride had cost him the race. The Tortoise looked at him kindly and said, "Slow and steady wins the race."',
            rating=4.9, price='Free', google_play_url='',
            why_recommended='This classic fable is excellent for early readers with repetitive words and a clear, simple lesson.',
            audio_available=True, language='en', book_type='Folk Tale', cover_image_path='/src/assets/images/tortoise_hare_cover.jpg'
        )
        Book.objects.create(
            title='Panchatantra Stories', author='Vishnu Sharma', pages=48,
            category='Animal Stories', level='Level 2 — Beginner', emoji='🐘',
            content='A collection of ancient animal stories from India. The clever monkey tricks the crocodile, the small mouse saves the mighty lion from a net, and the loyal mongoose protects the baby. Each story teaches a valuable moral lesson.',
            rating=4.7, price='Free', google_play_url='',
            why_recommended='Panchatantra stories are wonderful for building beginner vocabulary using familiar animal characters.',
            audio_available=True, language='en', book_type='Moral Story', cover_image_path='/src/assets/images/panchatantra_cover.jpg'
        )
        Book.objects.create(
            title='Grandma\'s Bag of Stories', author='Sudha Murty', pages=160,
            category='Easy Stories', level='Level 3 — Elementary', emoji='👵',
            content='Anand, Krishna, Raghu, and Meena go to their grandparents\' home in Shiggaon. Grandma opens her magical bag of stories. She tells stories of kings, monkeys, magic pots, and clever villagers, keeping the children enchanted during their summer holidays.',
            rating=4.9, price='In Library', google_play_url='',
            why_recommended='Perfect for developing readers ready for longer sentence structures and elementary comprehension challenges.',
            audio_available=False, language='en', book_type='Short Story', cover_image_path='/src/assets/images/grandma_stories_cover.jpg'
        )
        Book.objects.create(
            title='The Fox and the Crow', author='Aesop', pages=12,
            category='Moral Stories', level='Level 1 — Early Reader', emoji='🦊',
            content='A crow found a piece of cheese and flew to a branch to eat it. A sly fox saw this and wanted the cheese. "What a beautiful bird you are!" said the fox. "Your voice must be sweet too. Sing for me!" Flattered, the crow opened her beak to caw, and the cheese fell straight into the fox\'s waiting mouth. Do not trust flatterers.',
            rating=4.6, price='Free', google_play_url='',
            why_recommended='Excellent for early learners to build moral awareness and simple animal vocabulary.',
            audio_available=True, language='en', book_type='Folk Tale', cover_image_path='/src/assets/images/fox_crow_cover.jpg'
        )
        Book.objects.create(
            title='The Dog and His Reflection', author='Aesop', pages=14,
            category='Moral Stories', level='Level 1 — Early Reader', emoji='🐶',
            content='A Dog, to whom the butcher had thrown a bone, was hurrying home with his prize as fast as he could go. As he crossed a narrow footbridge, he happened to look down and saw himself reflected in the quiet water as if in a mirror. But the greedy Dog thought he saw another Dog carrying a bone much bigger than his own.\n\nIf he had stopped to think he would have known better. But instead of thinking, he dropped his bone and sprang at the Dog in the river, only to find himself swimming for dear life to reach the shore. At last he managed to scramble out, and as he stood sadly thinking about the good bone he had lost, he realized what a stupid Dog he had been.\n\nIt is very foolish to be greedy.',
            rating=4.5, price='Free', google_play_url='',
            why_recommended='Teaches children the hazards of greed with easy, engaging sentence flow.',
            audio_available=True, language='en', book_type='Folk Tale', cover_image_path='/src/assets/images/dog_reflection_cover.jpg'
        )
        Book.objects.create(
            title='Panchatantra - The Monkey and the Crocodile', author='Vishnu Sharma', pages=24,
            category='Animal Stories', level='Level 2 — Beginner', emoji='🐊',
            content='A monkey lived on a berry tree by the river. He became friends with a crocodile and shared berries. The crocodile\'s wife wanted to eat the monkey\'s heart. The crocodile reluctantly invited the monkey to his home, carrying him on his back. Mid-river, the crocodile confessed. The clever monkey said, "I left my heart on the tree! Let\'s go back." Upon returning, the monkey climbed to safety, teaching that quick thinking saves lives.',
            rating=4.6, price='Free', google_play_url='',
            why_recommended='A timeless Panchatantra fable with a valuable lesson in quick wit and safety.',
            audio_available=True, language='en', book_type='Moral Story', cover_image_path='/src/assets/images/monkey_crocodile_cover.jpg'
        )
        Book.objects.create(
            title='The Emperor\'s New Clothes', author='Hans Christian Andersen', pages=28,
            category='Moral Stories', level='Level 2 — Beginner', emoji='👑',
            content='An emperor loved new clothes. Two weavers promised him a magical suit invisible to fools. They pretended to weave and dress the emperor. Afraid of being called fools, everyone praised the invisible suit. But during a grand parade, a young child shouted, "But he has nothing on at all!" The truth was spoken.',
            rating=4.6, price='Free', google_play_url='',
            why_recommended='Teaches children honesty and independent thinking through a funny, classic fable.',
            audio_available=True, language='en', book_type='Moral Story', cover_image_path='/src/assets/images/emperors_clothes_cover.jpg'
        )

        # Hindi Books
        Book.objects.create(
            title='पंचतंत्र की कहानियां (Panchatantra Stories)', author='Vishnu Sharma', pages=48,
            category='Animal Stories', level='Level 2 — Beginner', emoji='🐻',
            content='पंचतंत्र की कहानियां बहुत पुरानी और प्रसिद्ध हैं। इनमें जानवरों जैसे शेर, बंदर, चूहा और खरगोश के माध्यम से जीवन के महत्वपूर्ण पाठ सिखाए गए हैं।',
            rating=4.8, price='Free', google_play_url='',
            why_recommended='यह पुस्तक सरल हिंदी वाक्यों के साथ आपकी शब्दावली और नैतिक समझ को बढ़ाएगी।',
            audio_available=True, language='hi', book_type='Moral Story', cover_image_path='/src/assets/images/panchatantra_cover.jpg'
        )
        Book.objects.create(
            title='हाथी और दर्जी (The Elephant and the Tailor)', author='Traditional', pages=12,
            category='Folk & Moral Stories', level='Level 1 — Early Reader', emoji='🐘',
            content='एक हाथी रोज नदी पर नहाने जाता था। रास्ते में एक दर्जी की दुकान थी। दर्जी हाथी को रोज खाने के लिए फल देता था। एक दिन दर्जी ने मजाक में हाथी की सूंड में सुई चुभा दी...',
            rating=4.7, price='Free', google_play_url='',
            why_recommended='यह कहानी बहुत सरल शब्दों में लिखी गई है, जो शुरुआती पाठकों के लिए उपयुक्त है।',
            audio_available=True, language='hi', book_type='Folk Tale', cover_image_path='/src/assets/images/elephant_tailor_cover.jpg'
        )

        # Kannada Books
        Book.objects.create(
            title='ತೆನಾಲಿ ರಾಮನ ಕಥೆಗಳು (Tenali Rama Stories)', author='Traditional', pages=40,
            category='Folk & Moral Stories', level='Level 2 — Beginner', emoji='👑',
            content='ತೆನಾಲಿ ರಾಮಕೃಷ್ಣನು ಕೃಷ್ಣದೇವರಾಯನ ಆಸ್ಥಾನದಲ್ಲಿದ್ದ ಪ್ರಸಿದ್ಧ ಹಾಸ್ಯಕವಿ ಮತ್ತು ಬುದ್ಧಿವಂತ ಮಂತ್ರಿ. ಅವನ ಚತುರತೆಯ ಕಥೆಗಳು ಎಲ್ಲರಿಗೂ ಇಷ್ಟವಾಗುತ್ತವೆ.',
            rating=4.8, price='Free', google_play_url='',
            why_recommended='ಸರಳ ಕನ್ನಡ ಪದಗಳ ಬಳಕೆ ಹೊಂದಿರುವ ಈ ಕಥೆಗಳು ಆರಂಭಿಕ ಕಲಿಯುವವರಿಗೆ ತುಂಬಾ ಸಹಕಾರಿಯಾಗಿದೆ.',
            audio_available=False, language='kn', book_type='Folk Tale', cover_image_path='/src/assets/images/panchatantra_cover.jpg'
        )
        Book.objects.create(
            title='ಪ್ರಾಮಾಣಿಕ ಕಟ್ಟಿಗೆ ಕಡಿಯುವವನು (The Honest Woodcutter)', author='Traditional', pages=16,
            category='Folk & Moral Stories', level='Level 1 — Early Reader', emoji='🪓',
            content='ಒಬ್ಬ ಬಡ ಕಟ್ಟಿಗೆ ಕಡಿಯುವವನು ನದಿಯ ದಡದಲ್ಲಿ ಮರ ಕಡಿಯುತ್ತಿದ್ದಾಗ ಅವನ ಕೊಡಲಿ ನದಿಗೆ ಬಿದ್ದಿತು. ಆಗ ಜಲದೇವತೆ ಪ್ರತ್ಯಕ್ಷಳಾಗಿ ಚಿನ್ನದ ಕೊಡಲಿ ತೋರಿಸಿದಳು...',
            rating=4.9, price='Free', google_play_url='',
            why_recommended='ಕನ್ನಡ ವರ್ಣಮಾಲೆ ಮತ್ತು ಸರಳ ಪದಗಳ ಕಲಿಕೆಗೆ ಇದು ಅತ್ಯುತ್ತಮ ಕಥೆಯಾಗಿದೆ.',
            audio_available=True, language='kn', book_type='Moral Story', cover_image_path='/src/assets/images/honest_woodcutter_cover.jpg'
        )

        # Tamil Books
        Book.objects.create(
            title='தெனாலிராமன் கதைகள் (Tenali Raman Stories)', author='Traditional', pages=40,
            category='Folk & Moral Stories', level='Level 2 — Beginner', emoji='👳',
            content='தெனாலிராமன் கிருஷ்ணதேவராயரின் அவையில் இருந்த சிறந்த விகடகவி ஆவார். அவரது அறிவுக் கூர்மையும் நகைச்சுவையும் நிறைந்த கதைகள் உலகப் புகழ் பெற்றவை.',
            rating=4.8, price='Free', google_play_url='',
            why_recommended='எளிய தமிழ் வாக்கியங்களுடன் அமைந்துள்ள இந்த கதைகள் புதிய சொற்களை கற்க உதவும்.',
            audio_available=False, language='ta', book_type='Folk Tale', cover_image_path='/src/assets/images/panchatantra_cover.jpg'
        )
        Book.objects.create(
            title='ஆமையும் முயலும் (The Tortoise and the Hare)', author='Aesop', pages=16,
            category='Folk & Moral Stories', level='Level 1 — Early Reader', emoji='🐢',
            content='ஒரு முயலும் ஆமையும் ஓட்டப்பந்தயம் வைக்க முடிவு செய்தன. முயல் வேகமாக ஓடிவிட்டு வழியில் தூங்கிவிட்டது, ஆனால் ஆமை மெதுவாகவும் தொடர்ந்தும் நடந்து வென்றது.',
            rating=4.9, price='Free', google_play_url='',
            why_recommended='குழந்தைகள் எளிதாக வாசித்து புரிந்து கொள்ளக்கூடிய எளிய சொற்கள் கொண்ட கதை.',
            audio_available=True, language='ta', book_type='Moral Story', cover_image_path='/src/assets/images/tortoise_hare_cover.jpg'
        )

    books = Book.objects.all()
    data = []
    for b in books:
        data.append({
            'id': b.id,
            'title': b.title,
            'author': b.author,
            'pages': b.pages,
            'category': b.category,
            'level': b.level,
            'emoji': b.emoji,
            'content': b.content,
            'rating': b.rating,
            'price': b.price,
            'google_play_url': b.google_play_url,
            'why_recommended': b.why_recommended,
            'audio_available': b.audio_available,
            'language': b.language,
            'book_type': b.book_type,
            'cover_image_path': b.cover_image_path
        })
    return Response(data, status=status.HTTP_200_OK)


@api_view(['POST'])
def create_support_ticket(request):
    """
    POST /api/users/support/ticket
    Body: { learner_id, subject, message }
    """
    learner_id = request.data.get('learner_id')
    subject = request.data.get('subject')
    message = request.data.get('message')

    if not all([learner_id, subject, message]):
        return Response({'error': 'All fields are required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        learner = Learner.objects.get(learner_id__iexact=learner_id)
    except Learner.DoesNotExist:
        return Response({'error': 'Learner not found.'}, status=status.HTTP_404_NOT_FOUND)

    ticket = SupportTicket.objects.create(learner=learner, subject=subject, message=message)
    return Response({'id': ticket.id, 'status': 'submitted'}, status=status.HTTP_201_CREATED)


@api_view(['GET', 'POST'])
def community_posts(request):
    """
    GET /api/users/community/posts -> list posts
    POST /api/users/community/posts -> create post: { learner_id, content }
    """
    if request.method == 'POST':
        learner_id = request.data.get('learner_id')
        content = request.data.get('content')

        if not all([learner_id, content]):
            return Response({'error': 'learner_id and content are required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            learner = Learner.objects.get(learner_id__iexact=learner_id)
        except Learner.DoesNotExist:
            return Response({'error': 'Learner not found.'}, status=status.HTTP_404_NOT_FOUND)

        post = CommunityPost.objects.create(learner=learner, content=content)
        return Response({
            'id': post.id,
            'author': post.learner.name,
            'avatar': post.learner.avatar,
            'content': post.content,
            'time': 'Just now',
            'likes': 0,
            'liked': False,
            'comments': 0
        }, status=status.HTTP_201_CREATED)

    # GET: List posts (auto-seed if empty)
    if not CommunityPost.objects.exists():
        l1 = Learner.objects.first()
        if l1:
            CommunityPost.objects.create(learner=l1, content='im struggling in communication, any tips on intermediate dialogues?')
            CommunityPost.objects.create(learner=l1, content='Just hit a 42-day streak! Who else is starting fresh on MiGo today?')

    posts = CommunityPost.objects.all().order_by('-id')
    current_learner = None
    l_id = request.query_params.get('learner_id')
    if l_id:
        current_learner = Learner.objects.filter(learner_id__iexact=l_id).first()

    data = []
    for p in posts:
        liked = False
        if current_learner:
            liked = p.likes.filter(id=current_learner.id).exists()
        data.append({
            'id': p.id,
            'author': p.learner.name,
            'avatar': p.learner.avatar,
            'content': p.content,
            'time': 'Recent',
            'likes': p.likes.count(),
            'liked': liked,
            'comments': 0
        })
    return Response(data, status=status.HTTP_200_OK)


@api_view(['POST'])
def like_post(request, post_id):
    """
    POST /api/users/community/posts/<post_id>/like
    Body: { learner_id }
    """
    learner_id = request.data.get('learner_id')
    if not learner_id:
        return Response({'error': 'learner_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        post = CommunityPost.objects.get(id=post_id)
        learner = Learner.objects.get(learner_id__iexact=learner_id)
    except (CommunityPost.DoesNotExist, Learner.DoesNotExist):
        return Response({'error': 'Post or Learner not found.'}, status=status.HTTP_404_NOT_FOUND)

    if post.likes.filter(id=learner.id).exists():
        post.likes.remove(learner)
        liked = False
    else:
        post.likes.add(learner)
        liked = True

    return Response({'likes': post.likes.count(), 'liked': liked}, status=status.HTTP_200_OK)


@api_view(['GET', 'POST'])
def manage_notifications(request):
    """
    GET /api/users/notifications?learner_id=MGXXXX
    POST /api/users/notifications/read-all -> { learner_id }
    """
    learner_id = request.query_params.get('learner_id') if request.method == 'GET' else request.data.get('learner_id')
    if not learner_id:
        return Response({'error': 'learner_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        learner = Learner.objects.get(learner_id__iexact=learner_id)
    except Learner.DoesNotExist:
        return Response({'error': 'Learner not found.'}, status=status.HTTP_444_NOT_FOUND if request.method == 'GET' else status.HTTP_404_NOT_FOUND)

    if request.method == 'POST':
        # Mark all read
        Notification.objects.filter(learner=learner).update(unread=False)
        return Response({'status': 'read_all'}, status=status.HTTP_200_OK)

    # GET: list notifications
    if not Notification.objects.filter(learner=learner).exists():
        Notification.objects.create(
            learner=learner,
            title='Placement Complete!',
            description='You completed your initial placement checks and have been placed in the Beginner level. Your custom roadmap is ready!',
            notification_type='placement'
        )
        Notification.objects.create(
            learner=learner,
            title='Welcome to MiGo!',
            description='Embark on your journey to learn Hindi, Kannada, Tamil, or English with child-friendly interactive exercises!',
            notification_type='welcome'
        )

    notifs = Notification.objects.filter(learner=learner).order_by('-id')
    data = []
    for n in notifs:
        data.append({
            'id': n.id,
            'title': n.title,
            'description': n.description,
            'unread': n.unread,
            'time': 'Just now',
            'notification_type': n.notification_type
        })
    return Response(data, status=status.HTTP_200_OK)


@api_view(['POST'])
def upgrade_subscription(request):
    """
    POST /api/users/subscription/upgrade
    Body: { learner_id, plan_name }
    """
    learner_id = request.data.get('learner_id')
    plan_name = request.data.get('plan_name')

    if not all([learner_id, plan_name]):
        return Response({'error': 'learner_id and plan_name are required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        learner = Learner.objects.get(learner_id__iexact=learner_id)
    except Learner.DoesNotExist:
        return Response({'error': 'Learner not found.'}, status=status.HTTP_404_NOT_FOUND)

    learner.subscription_tier = plan_name
    learner.save()

    # Create notification
    Notification.objects.create(
        learner=learner,
        title='Subscription Upgraded!',
        description=f'Congratulations! Your account was upgraded to {plan_name} Plan. Enjoy unlimited lessons and features.',
        notification_type='payment'
    )

    return Response({
        'learner_id': learner.learner_id,
        'subscription_tier': learner.subscription_tier,
        'status': 'upgraded'
    }, status=status.HTTP_200_OK)


import urllib.request
import json
from django.conf import settings

@api_view(['POST'])
def google_login(request):
    """
    POST /api/users/google-login
    Body: { credential, device_id }
    Verifies the Google JWT ID token and authenticates the user.
    """
    credential = request.data.get('credential')
    device_id = request.data.get('device_id')

    if not credential:
        return Response({'error': 'Google credential token is required.'}, status=status.HTTP_400_BAD_REQUEST)

    # Call Google's tokeninfo API to verify the token for free without external python dependencies
    url = f"https://oauth2.googleapis.com/tokeninfo?id_token={credential}"
    try:
        req = urllib.request.Request(url, method='GET')
        with urllib.request.urlopen(req) as response:
            payload = json.loads(response.read().decode('utf-8'))
            
            # Check for token validation errors
            if "error_description" in payload:
                return Response({'error': payload["error_description"]}, status=status.HTTP_400_BAD_REQUEST)
            
            # Check Audience (aud) matches our Client ID if configured
            client_id = getattr(settings, 'GOOGLE_CLIENT_ID', '')
            if client_id and payload.get('aud') != client_id:
                print(f"[GOOGLE LOGIN] Warning: Token audience '{payload.get('aud')}' does not match client ID '{client_id}'")
            
            email = payload.get('email')
            name = payload.get('name')
            avatar_url = payload.get('picture')
            
            if not email:
                return Response({'error': 'Email address not found in Google profile.'}, status=status.HTTP_400_BAD_REQUEST)

            normalized = email.strip().lower()
            
            # Get or create PhoneAccount (using email identifier)
            phone_account, created = PhoneAccount.objects.get_or_create(phone_number=normalized)
            
            # Register device session if device_id is provided
            if device_id:
                DeviceSession.objects.get_or_create(phone_account=phone_account, device_id=device_id)

            # Query existing learners linked to this account
            learners = phone_account.learners.all()
            serializer = LearnerSerializer(learners, many=True)

            return Response({
                'verified': True,
                'phone_number': normalized,
                'email': normalized,
                'name': name,
                'avatar_url': avatar_url,
                'learners': serializer.data
            }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({'error': f"Failed to verify Google token: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)