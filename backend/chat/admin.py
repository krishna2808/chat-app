from django.contrib import admin
from .models import * 
# Register your models here.


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ( "id", "sender", "room", "timestamp",)

admin.site.register(ChatRoom)
admin.site.register(OnlineUser)
