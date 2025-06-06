from django.shortcuts import render
from rest_framework import viewsets, permissions, status, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q, Count
from .models import Chat, Message, Interest, ChatUser, ChatInterest, User, ChatType
from .serializers import (
    ChatSerializer, MessageSerializer, InterestSerializer,
    ChatUserSerializer, ChatInterestSerializer, UserSerializer
)
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken
import logging

logger = logging.getLogger(__name__)

# Create your views here.

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action in ['create', 'register', 'create_anonymous']:
            return [AllowAny()]
        return super().get_permissions()

    @action(detail=False, methods=['post'])
    def register(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            try:
                user = serializer.save()
                # Generate tokens for the new user
                refresh = RefreshToken.for_user(user)
                return Response({
                    'user': serializer.data,
                    'access': str(refresh.access_token),
                    'refresh': str(refresh)
                }, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response(
                    {'error': str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def me(self, request):
        if not request.user.is_authenticated:
            return Response(
                {'error': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def anonymous(self, request, *args, **kwargs):
        """Create an anonymous user with provided gender, age and nickname"""
        serializer = self.get_serializer(data={
            'username': f"anon_{request.data.get('username', 'user')}",
            'password': User.objects.make_random_password(),
            'gender': request.data.get('gender'),
            'age': request.data.get('age'),
            'role': "ANONYMOUS"
        })
        
        if serializer.is_valid():
            try:
                user = serializer.save()
                refresh = RefreshToken.for_user(user)
                return Response({
                    'user': serializer.data,
                    'access': str(refresh.access_token),
                    'refresh': str(refresh)
                }, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response(
                    {'error': str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ChatViewSet(viewsets.ModelViewSet):
    queryset = Chat.objects.all()
    serializer_class = ChatSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def get_queryset(self):
        """Get queryset for chat operations"""
        user = self.request.user
        if user.role == 'ADMIN':
            return Chat.objects.all()
        
        # For retrieve action (viewing a single chat) and group_chats action, return all chats
        if self.action in ['retrieve', 'group_chats']:
            return Chat.objects.all()
            
        # For other actions, return only chats where user is a participant
        return Chat.objects.filter(participants=user)

    def get_permissions(self):
        if self.action in ['find_anonymous_chat']:
            return [AllowAny()]
        return super().get_permissions()

    @action(detail=False, methods=['get'])
    def group_chats(self, request):
        """Get all group chats with optional filters"""
        name = request.query_params.get('name', '')
        min_participants = request.query_params.get('min_participants', 0)
        interests = request.query_params.getlist('interests', [])

        # Get all group chats where the user is not a participant
        queryset = Chat.objects.filter(type=ChatType.GROUP).exclude(participants=request.user)

        if name:
            queryset = queryset.filter(name__icontains=name)

        if min_participants:
            queryset = queryset.annotate(
                participant_count=Count('participants')
            ).filter(participant_count__gte=min_participants)

        if interests:
            queryset = queryset.filter(interests__interest__in=interests).distinct()

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def find_anonymous_chat(self, request):
        """Find or create an anonymous chat based on user preferences"""
        # If user is not authenticated, create an anonymous user
        if not request.user.is_authenticated:
            user_response = UserViewSet.create_anonymous(self, request)
            if user_response.status_code != status.HTTP_201_CREATED:
                return user_response
            request.user = User.objects.get(id=user_response.data['user']['id'])

        interests = request.data.get('interests', [])
        gender = request.data.get('gender')
        min_age = request.data.get('min_age')
        max_age = request.data.get('max_age')
        
        logger.info(f"Finding anonymous chat with filters: interests={interests}, gender={gender}, min_age={min_age}, max_age={max_age}")

        # Базовый запрос для поиска чата
        chat_query = Chat.objects.filter(
            type=ChatType.ANONYMOUS
        ).annotate(
            participant_count=Count('participants')
        ).filter(participant_count=1)

        # Добавляем фильтр по интересам, если они указаны
        if interests:
            chat_query = chat_query.filter(interests__interest__in=interests)

        # Добавляем фильтры по полу и возрасту, если они указаны
        if gender:
            chat_query = chat_query.filter(participants__gender=gender)
        
        if min_age:
            chat_query = chat_query.filter(participants__age__gte=min_age)
        
        if max_age:
            chat_query = chat_query.filter(participants__age__lte=max_age)

        # Исключаем чаты, где текущий пользователь уже является участником
        chat_query = chat_query.exclude(participants=request.user)

        existing_chat = chat_query.first()

        if existing_chat:
            logger.info(f"Found existing chat {existing_chat.id} with matching filters")
            # Join existing chat
            ChatUser.objects.create(user=request.user, chat=existing_chat)
            serializer = self.get_serializer(existing_chat)
            return Response(serializer.data)

        # Create new anonymous chat
        logger.info("No matching chat found, creating new one")
        new_chat = Chat.objects.create(type=ChatType.ANONYMOUS)
        ChatUser.objects.create(user=request.user, chat=new_chat)
        
        # Add interests to the new chat if they were specified
        if interests:
            for interest_name in interests:
                interest, _ = Interest.objects.get_or_create(interest=interest_name)
                ChatInterest.objects.get_or_create(chat=new_chat, interest=interest)

        serializer = self.get_serializer(new_chat)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def join_chat(self, request, pk=None):
        """Join a group chat"""
        try:
            chat = Chat.objects.get(pk=pk)
            logger.info(f"User {request.user.username} attempting to join chat {chat.id}")
        except Chat.DoesNotExist:
            logger.warning(f"Chat {pk} not found")
            return Response(
                {'error': 'Chat not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        if chat.type != ChatType.GROUP:
            logger.warning(f"User {request.user.username} tried to join non-group chat {chat.id}")
            return Response(
                {'error': 'Can only join group chats'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if ChatUser.objects.filter(user=request.user, chat=chat).exists():
            logger.info(f"User {request.user.username} already in chat {chat.id}")
            return Response(
                {'error': 'Already joined this chat'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            ChatUser.objects.create(user=request.user, chat=chat)
            logger.info(f"User {request.user.username} successfully joined chat {chat.id}")
            serializer = self.get_serializer(chat)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error joining chat: {str(e)}")
            return Response(
                {'error': 'Failed to join chat'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def leave_chat(self, request, pk=None):
        """Leave a chat and delete anonymous user if applicable"""
        try:
            chat = Chat.objects.get(pk=pk)
            logger.info(f"User {request.user.username} attempting to leave chat {chat.id}")
        except Chat.DoesNotExist:
            logger.warning(f"Chat {pk} not found")
            return Response(
                {'error': 'Chat not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Get the ChatUser record
        chat_user = ChatUser.objects.filter(user=request.user, chat=chat).first()
        
        if not chat_user:
            logger.warning(f"User {request.user.username} is not a member of chat {chat.id}")
            return Response(
                {'error': 'Not a member of this chat'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Delete the ChatUser record
        try:
            chat_user.delete()
            logger.info(f"Successfully removed user {request.user.username} from chat {chat.id}")
        except Exception as e:
            logger.error(f"Error removing user from chat: {str(e)}")
            return Response(
                {'error': 'Failed to leave chat'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # Проверяем, остались ли участники в чате
        remaining_participants = ChatUser.objects.filter(chat=chat).count()
        logger.info(f"Remaining participants in chat {chat.id}: {remaining_participants}")

        # Если это анонимный чат и в нем не осталось участников, удаляем его
        if chat.type == ChatType.ANONYMOUS and remaining_participants == 0:
            try:
                # Сначала удаляем все связанные записи
                ChatInterest.objects.filter(chat=chat).delete()
                Message.objects.filter(chat=chat).delete()
                # Затем удаляем сам чат
                chat.delete()
                logger.info(f"Deleted anonymous chat {chat.id} as it has no participants")
            except Exception as e:
                logger.error(f"Error deleting chat: {str(e)}")
                return Response(
                    {'error': 'Failed to delete chat'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

        # Если пользователь анонимный, удаляем его после выхода из чата
        if request.user.role == 'ANONYMOUS':
            try:
                # Сохраняем ID пользователя перед удалением для логирования
                user_id = request.user.id
                username = request.user.username

                # Удаляем все связанные записи пользователя
                ChatUser.objects.filter(user=request.user).delete()
                Message.objects.filter(sender=request.user).delete()

                # Blacklist the current refresh token
                try:
                    refresh_token = request.data.get('refresh_token')
                    if refresh_token:
                        token = RefreshToken(refresh_token)
                        token.blacklist()
                        logger.info(f"Blacklisted token for anonymous user {username}")
                except Exception as e:
                    logger.warning(f"Failed to blacklist token for user {username}: {str(e)}")

                # Delete the user
                request.user.delete()
                logger.info(f"Successfully deleted anonymous user {username} (ID: {user_id})")
                
                # Возвращаем специальный статус, указывающий на удаление пользователя
                return Response({
                    'message': 'User deleted successfully',
                    'user_deleted': True
                }, status=status.HTTP_200_OK)
            except Exception as e:
                logger.error(f"Error deleting anonymous user {request.user.username}: {str(e)}")
                return Response(
                    {'error': f'Failed to delete anonymous user: {str(e)}'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

        return Response(status=status.HTTP_204_NO_CONTENT)

    def create(self, request, *args, **kwargs):
        """Create a new group chat"""
        # Set the chat type to GROUP
        request.data['type'] = ChatType.GROUP
        
        # Create the chat
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        chat = serializer.save()

        # Add the creator as a participant
        ChatUser.objects.create(user=request.user, chat=chat)

        # Add interests if provided
        interests = request.data.get('interest_names', [])
        for interest_name in interests:
            interest, _ = Interest.objects.get_or_create(interest=interest_name)
            # Use get_or_create to avoid duplicate interests
            ChatInterest.objects.get_or_create(chat=chat, interest=interest)

        return Response(serializer.data, status=status.HTTP_201_CREATED)

class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Message.objects.all()
        chat_id = self.request.query_params.get('chat')
        if chat_id:
            queryset = queryset.filter(chat_id=chat_id)
        return queryset

    def perform_create(self, serializer):
        chat_id = self.request.data.get('chat')
        try:
            chat = Chat.objects.get(id=chat_id, participants=self.request.user)
            serializer.save(sender=self.request.user, chat=chat)
        except Chat.DoesNotExist:
            raise serializers.ValidationError({'chat': 'Chat not found or you are not a participant'})

class InterestViewSet(viewsets.ModelViewSet):
    queryset = Interest.objects.all()
    serializer_class = InterestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Interest.objects.all()
