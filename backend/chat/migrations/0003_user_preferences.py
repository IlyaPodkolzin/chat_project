# Generated by Django 5.0.2 on 2025-06-06 18:06

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('chat', '0002_alter_chat_name_alter_chat_type'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='preferences',
            field=models.JSONField(blank=True, null=True),
        ),
    ]
