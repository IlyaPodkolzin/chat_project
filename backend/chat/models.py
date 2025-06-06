from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone

class UserRole(models.TextChoices):
    ANONYMOUS = 'ANONYMOUS', 'Anonymous'
    USER = 'USER', 'User'
    ADMIN = 'ADMIN', 'Admin'

class ChatType(models.TextChoices):
    ANONYMOUS = 'ANONYMOUS', 'Anonymous'
    GROUP = 'GROUP', 'Group'

class User(AbstractUser):
    age = models.IntegerField(null=True)
    gender = models.CharField(max_length=10, null=True)
    role = models.CharField(
        max_length=10,
        choices=UserRole.choices,
        default=UserRole.ANONYMOUS
    )
    email = models.EmailField(null=True, blank=True)

    def __str__(self):
        return self.username

class Chat(models.Model):
    name = models.CharField(max_length=255, null=True, blank=True)
    type = models.CharField(
        max_length=10,
        choices=ChatType.choices,
        default=ChatType.GROUP
    )
    created_at = models.DateTimeField(auto_now_add=True)
    participants = models.ManyToManyField(
        User,
        through='ChatUser',
        related_name='chats'
    )
    interests = models.ManyToManyField(
        'Interest',
        through='ChatInterest',
        related_name='chats'
    )
    preferences = models.JSONField(null=True, blank=True, help_text="Preferences for anonymous chat matching")

    def __str__(self):
        return f"{self.name or 'Unnamed'} ({self.type})"

class Message(models.Model):
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    sender = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='messages'
    )
    chat = models.ForeignKey(
        Chat,
        on_delete=models.CASCADE,
        related_name='messages'
    )

    def __str__(self):
        return f"Message from {self.sender.username} in {self.chat}"

class Interest(models.Model):
    interest = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.interest

class ChatUser(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'chat')

    def __str__(self):
        return f"{self.user.username} in {self.chat}"

class ChatInterest(models.Model):
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE)
    interest = models.ForeignKey(Interest, on_delete=models.CASCADE)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('chat', 'interest')

    def __str__(self):
        return f"{self.interest} in {self.chat}"
