from rest_framework import serializers
from .models import User, Task
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'first_name', 'last_name')
        read_only_fields = ('id', 'username')


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    first_name = serializers.CharField(required=True) 
    password = serializers.CharField(write_only=True)  

    class Meta:
        model = User
        fields = ('id', 'username', 'password', 'first_name', 'last_name')

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("A user with that username already exists.")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data.get('last_name', '')
        )
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        username = data.get('username')
        password = data.get('password')

        if not (username and password):
            raise serializers.ValidationError('Must include "username" and "password".')
        
        user = authenticate(username=username, password=password)
        
        if user is None:
            raise serializers.ValidationError('Unable to log in with provided credentials.')
        
        if not user.is_active:
            raise serializers.ValidationError('User account is disabled.')
        data['user'] = user
        return data
    

class TaskSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')
    
    class Meta:
        model = Task
        fields = ('id', 'user', 'title', 'description', 'status', 'created_at', 'updated_at')
        read_only_fields = ('user', 'created_at', 'updated_at')
        
    def get_can_edit_title(self, obj):
        return obj.can_edit_title()
        
    def validate_status(self, value):
        if value not in dict(Task.STATUS_CHOICES):
            raise serializers.ValidationError("Invalid status")
        return value
        
    def validate(self, data):
        # Check title uniqueness when updating
        if self.instance and 'title' in data:
            if Task.objects.filter(
                user=self.context['request'].user,
                title=data['title']
            ).exclude(pk=self.instance.pk).exists():
                raise serializers.ValidationError(
                    {"title": "You already have a task with this title"}
                )
        return data
    
    def validate_status(self, value):
        instance = self.instance
        if instance and instance.status != 'NEW' and value == 'NEW':
            raise serializers.ValidationError(
                "Cannot set status back to NEW once task has progressed"
            )
        return value
     