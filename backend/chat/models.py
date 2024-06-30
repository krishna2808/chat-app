from django.db import models
from account.models import User
from datetime import datetime
from shortuuidfield import ShortUUIDField


class ChatRoom(models.Model):
    roomId = ShortUUIDField()
    type = models.CharField(max_length=10, default='DM')
    members = models.ManyToManyField(User, related_name='users_chatroom')
    name = models.CharField(max_length=20, null=True, blank=True)
    image = models.ImageField(
        null=True, 
        blank=True, 
        upload_to = f"images/account/{str(datetime.now())}/",
        default='images/group_default.png'
    )
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.roomId + ' -> ' + str(self.name)
    class Meta:
        ordering = ["-timestamp"]

class ChatMessage(models.Model):
    room = models.ForeignKey(ChatRoom, on_delete=models.SET_NULL, null=True, related_name='chat_room')
    sender = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='user_chat')
    file = models.FileField(upload_to='chat_files/', null=True, blank=True)
    message = models.CharField(max_length=255)
    
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.message
    class Meta:
        ordering = ["-timestamp"]


class OnlineUser(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.user.username