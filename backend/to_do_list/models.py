from datetime import timedelta
from django.db import models
from django.utils import timezone
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinLengthValidator

class User(AbstractUser):
    first_name = models.CharField(max_length=30, blank=False)
    last_name = models.CharField(max_length=30, blank=True)
    username = models.CharField(
        max_length=100,
        unique=True,
        validators=[MinLengthValidator(4)]
    )
    password = models.CharField(
        max_length=100,
        validators=[MinLengthValidator(6)]
    )

    def __str__(self):
        return self.username
    
    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        ordering = ['username']
    

class Task(models.Model):
    STATUS_CHOICES = [
        ('NEW', 'New'),
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed'),
    ]
    
    title = models.CharField(max_length=200, blank=False)
    description = models.TextField(blank=True)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='NEW'
    )
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='tasks'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.title} ({self.status})"
    
    def can_edit_title(self):
        """Check if title can still be edited (within 5 minutes of creation)"""
        return timezone.now() < self.created_at + timedelta(minutes=5)
    
    def can_change_to_new(self):
        """Check if status can be changed to NEW"""
        return self.status == 'NEW'
    
    class Meta:
        unique_together = ('user', 'title')
        indexes = [
            models.Index(fields=['title']),
            models.Index(fields=['status']),
        ]
        verbose_name = 'Task'
        verbose_name_plural = 'Tasks'    