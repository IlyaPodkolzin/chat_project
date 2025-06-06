from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Chat, Message, Interest, ChatUser, ChatInterest

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'role', 'age', 'gender', 'is_staff', 'is_active')
    list_filter = ('role', 'is_staff', 'is_active', 'gender')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    ordering = ('username',)
    
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'email', 'age', 'gender')}),
        ('Permissions', {'fields': ('role', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )

@admin.register(Chat)
class ChatAdmin(admin.ModelAdmin):
    list_display = ('name', 'type', 'created_at')
    list_filter = ('type', 'created_at')
    search_fields = ('name',)

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('sender', 'chat', 'content', 'created_at')
    list_filter = ('created_at', 'chat')
    search_fields = ('content', 'sender__username')
    date_hierarchy = 'created_at'

@admin.register(Interest)
class InterestAdmin(admin.ModelAdmin):
    list_display = ('interest',)
    search_fields = ('interest',)

@admin.register(ChatUser)
class ChatUserAdmin(admin.ModelAdmin):
    list_display = ('user', 'chat', 'joined_at')
    list_filter = ('joined_at',)
    search_fields = ('user__username', 'chat__name')
    date_hierarchy = 'joined_at'

@admin.register(ChatInterest)
class ChatInterestAdmin(admin.ModelAdmin):
    list_display = ('chat', 'interest', 'added_at')
    list_filter = ('added_at',)
    search_fields = ('chat__name', 'interest__interest')
    date_hierarchy = 'added_at'
