from rest_framework import serializers
from .models import User, Chat, Message, Interest, ChatUser, ChatInterest, ChatType
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    password2 = serializers.CharField(write_only=True, required=False)
    email = serializers.EmailField(required=False, allow_null=True, allow_blank=True)
    age = serializers.IntegerField(required=False, allow_null=True)
    gender = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    role = serializers.CharField(required=False, default='USER')

    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'password2', 'age', 'gender', 'role', 'email']
        extra_kwargs = {
            'username': {'required': True},
            'email': {'required': False},
            'age': {'required': False},
            'gender': {'required': False},
            'role': {'required': False}
        }

    def validate_password(self, value):
        try:
            validate_password(value)
        except ValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        return value

    def validate(self, attrs):
        if 'password2' in attrs and attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2', None)
        try:
            user = User.objects.create_user(
                username=validated_data['username'],
                password=validated_data['password'],
                email=validated_data.get('email', ''),
                age=validated_data.get('age'),
                gender=validated_data.get('gender'),
                role=validated_data.get('role', 'USER')
            )
            return user
        except Exception as e:
            raise serializers.ValidationError(str(e))

class InterestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Interest
        fields = ['id', 'interest']

class ChatInterestSerializer(serializers.ModelSerializer):
    interest = InterestSerializer()

    class Meta:
        model = ChatInterest
        fields = ['id', 'interest', 'added_at']

class ChatUserSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = ChatUser
        fields = ['id', 'user', 'joined_at']

class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    chat = serializers.PrimaryKeyRelatedField(queryset=Chat.objects.all())

    class Meta:
        model = Message
        fields = ['id', 'content', 'created_at', 'sender', 'chat']
        read_only_fields = ['created_at', 'sender']

class ChatSerializer(serializers.ModelSerializer):
    participants = ChatUserSerializer(source='chatuser_set', many=True, read_only=True)
    interests = ChatInterestSerializer(source='chatinterest_set', many=True, read_only=True)
    messages = serializers.SerializerMethodField()
    interest_names = serializers.ListField(
        child=serializers.CharField(),
        write_only=True,
        required=False
    )
    type = serializers.ChoiceField(choices=ChatType.choices)

    class Meta:
        model = Chat
        fields = ['id', 'type', 'name', 'created_at', 'participants', 'interests', 'messages', 'interest_names']
        read_only_fields = ['created_at']

    def get_messages(self, obj):
        # Get the chat_id from the request query params
        request = self.context.get('request')
        if request and request.query_params.get('chat_id') == str(obj.id):
            messages = Message.objects.filter(chat=obj)
            return MessageSerializer(messages, many=True).data
        return []

    def create(self, validated_data):
        interest_names = validated_data.pop('interest_names', [])
        chat = super().create(validated_data)
        
        # Add interests
        for interest_name in interest_names:
            interest, _ = Interest.objects.get_or_create(interest=interest_name)
            ChatInterest.objects.create(chat=chat, interest=interest)
        
        return chat 