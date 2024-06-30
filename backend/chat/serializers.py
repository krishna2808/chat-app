
from rest_framework import serializers
from .models import *
from account.models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'image', ] 


        
class ChatMessageSerializer(serializers.ModelSerializer):
    
    chat_room = serializers.StringRelatedField(source='room.roomId')
    sender = serializers.StringRelatedField(source='sender.username')
    sender_image = serializers.StringRelatedField(source='sender.image')
    
    class Meta:
        model = ChatMessage
        fields = ['id',  'message', 'sender', 'file', 'sender_image', 'timestamp', 'chat_room']


    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['file'] = self.get_file(instance)
        return representation

    def get_file(self, obj):
        if obj.file:
            return obj.file.name 
        return None


class MemberSerializer(serializers.Serializer):
    # name = serializers.CharField(source='get_full_name')  # Access user's full name
    username = serializers.CharField(source='username')

class ChatRoomGetSerializer(serializers.ModelSerializer):
    
    # reversed relation because chat_room is related_name name. ChatRoom is referenced by ChatRoom via the ForeignKey. We access this relation through related_name='chat_room'
    chat_room = ChatMessageSerializer(many=True, read_only=True)
    
    # direct relation because members is (manytomany or onetoone or freign key) child to parent realtion 
    members = UserSerializer(many=True, read_only=True)  # Use UserSerializer for members field
    class Meta:
        model = ChatRoom
        fields = ['id', 'roomId', 'chat_room', 'type', "name", "members","image"]

    # for exclude current login user for frontent. 
    def to_representation(self, instance):
        # Call the parent class's to_representation method
        data = super().to_representation(instance)
        
        # Get the request user
        request = self.context.get('request', None)
        if request is None:
            return data
        
        request_user = request.user
        
        # Exclude the request user from the members list
        if 'members' in data:
            data['members'] = [member for member in data['members'] if member['id'] != request_user.id]
        
        return data

class ChatRoomPostSerializer(serializers.ModelSerializer):
    
    # reversed relation because chat_room is related_name name. ChatRoom is referenced by ChatRoom via the ForeignKey. We access this relation through related_name='chat_room'
    chat_room = ChatMessageSerializer(many=True, read_only=True)    
    class Meta:
        model = ChatRoom
        fields = ['id', 'roomId', 'chat_room', 'type', "name", "members","image"]

