# backend/users/views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q
from .models import Learner, PhoneAccount, DeviceSession, Book, SupportTicket, CommunityPost, Notification
from .serializers import LearnerSerializer
from .otp_service import send_real_otp, verify_real_otp


def normalize_phone_number(phone):
    """
    Cleans and normalizes phone number to E.164 format.
    E.g. '9876543210' -> '+919876543210'
    """
    cleaned = ''.join(c for c in phone if c.isdigit() or c == '+')
    if not cleaned.startswith('+'):
        cleaned = f"+91{cleaned}"
    return cleaned


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
def send_otp(request):
    """
    POST /api/users/otp/send
    Body: { phone_number }
    Sends a 6-digit OTP code to the actual phone number via Twilio Verify API.
    """
    phone_number = request.data.get('phone_number')
    if not phone_number:
        return Response({'error': 'Phone number is required.'}, status=status.HTTP_400_BAD_REQUEST)
    
    normalized = normalize_phone_number(phone_number)
    try:
        res = send_real_otp(normalized)
        is_mock = False
        if res and "mock" in res.get("message", "").lower():
            is_mock = True
        return Response({
            'message': 'OTP sent successfully.',
            'is_mock': is_mock,
            'mock_code': '123456' if is_mock else None
        }, status=status.HTTP_200_OK)
    except ValueError as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def verify_otp(request):
    """
    POST /api/users/otp/verify
    Body: { phone_number, otp, device_id }
    Verifies the OTP via Twilio Verify API and creates PhoneAccount/DeviceSession.
    """
    phone_number = request.data.get('phone_number')
    otp = request.data.get('otp')
    device_id = request.data.get('device_id')

    if not phone_number or not otp:
        return Response({'error': 'Phone number and OTP are required.'}, status=status.HTTP_400_BAD_REQUEST)

    normalized = normalize_phone_number(phone_number)
    try:
        check_res = verify_real_otp(normalized, otp)
        if check_res.get('status') == 'approved':
            # Success: Get or create phone account
            phone_account, _ = PhoneAccount.objects.get_or_create(phone_number=normalized)

            # Register device session if device_id is provided
            if device_id:
                DeviceSession.objects.get_or_create(phone_account=phone_account, device_id=device_id)

            return Response({'verified': True, 'phone_number': normalized}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Verification code is incorrect or expired.'}, status=status.HTTP_400_BAD_REQUEST)
    except ValueError as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


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
    if not Book.objects.exists():
        Book.objects.create(
            title='The Magic of Words', author='Elena Vance', pages=120,
            category='Literature', level='Beginner', emoji='📖',
            content='Once upon a time, there was a little seed that wanted to speak. It learned sound by sound. First came "A", then came "Aa". Soon it could trace the letters on the sand, and the magic of words began to bloom!'
        )
        Book.objects.create(
            title='Modern Communication', author='Dr. Julian Thorne', pages=245,
            category='Business', level='Intermediate', emoji='💼',
            content='Communication is the cornerstone of progress. In this book, we explore how spoken dialogue and writing connect communities across barriers.'
        )
        Book.objects.create(
            title='Linguistic Psychology', author='Sarah Miller', pages=310,
            category='Science', level='Advanced', emoji='🧠',
            content='How does our brain decode scripts? When we trace characters, a network of motor and visual neurons fire together to associate characters with phonetic mappings.'
        )
        Book.objects.create(
            title='Short Stories for Learners', author='Various Authors', pages=95,
            category='Fiction', level='Beginner', emoji='🧚',
            content='A collection of short tales. The cat said "Meow". The dog said "Woof". The king looked at his garden and smiled as the sun went down.'
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
            'content': b.content
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