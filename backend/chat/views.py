# chat/views.py
from django.shortcuts import render
from django.utils.safestring import mark_safe
from django.contrib.auth.decorators import login_required
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import * 
from .models import * 
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.db.models import Q, F

from rest_framework.decorators import api_view, permission_classes
import json
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import os 
from django.http import HttpResponse, Http404
from django.conf import settings

channel_layer = get_channel_layer()






def index(request):
    return render(request, "chat/index.html")

@login_required
def room(request, room_name):
    # return render(request, "chat/room.html", {"room_name": room_name})
    return render(request, "chat/chat.html", {
        "room_name_json": mark_safe(json.dumps(room_name)),
        'username' : mark_safe(json.dumps(request.user.username))
    })
    
    


    permission_classes = [IsAuthenticated]
class ChatMessageAPI(APIView):
    def get(self, request, format= None):
        chat_room_queryset = ChatRoom.objects.filter(members = request.user.id)
        # it have passed context in serializer because remove login user for frontend
        serializer = ChatRoomGetSerializer(chat_room_queryset, many=True, context={'request': request})

        # serializer = ChatRoomSerializer(chat_room_queryset , many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request , format=None):
        usernames_list = request.data.get("usernames")
        message_type = request.data.get("type")
        if not message_type:
            return Response({"error": "Message Type is required like 'GROUP' or DM "}, status=status.HTTP_400_BAD_REQUEST)
            
        if not usernames_list:
            return Response({"error": "Username is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        users_ids_lst = list(User.objects.filter(username__in = usernames_list).values_list("id", flat=True))
        joined_users_ids = [request.user.id] + users_ids_lst 
        if not users_ids_lst:
            return Response({"error": "User(s) not found"}, status=status.HTTP_404_NOT_FOUND)

        
        # chat_message_queryset = ChatRoom.objects.filter(
        #     members__id = request.user.id , 
        #     members = User.objects.filter(username = username).first() , 
        #     type="DM"
        # )
        # print("chat_message_queryset ------ ", chat_message_queryset)
        # print("Queryset:", chat_message_queryset.query)
        # if chat_message_queryset.exists():
        #     return Response({"msg": "direct message is already available"}, status=status.HTTP_200_OK)

        if message_type == "DM":
            request.data["members"] = joined_users_ids
            request.data["name"] = "direct message"
        elif message_type == "GROUP":
            request.data["members"] = joined_users_ids

        serializer = ChatRoomPostSerializer(data = request.data )
        if serializer.is_valid():
            serializer.save() 
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def put(self, request, format=None):
        group_action = request.data.get("group_action")
        usernames_list = request.data.get("usernames")
        chat_room_id = request.data.get("chat_room_id")
        users_ids_lst = list(User.objects.filter(username__in = usernames_list).values_list("id", flat=True))
        chat_room_object = ChatRoom.objects.get(id = chat_room_id)
        if group_action == "remove_user":
            chat_room_object.members.remove(*users_ids_lst)
        elif group_action == "add_user":
            chat_room_object.members.add(*users_ids_lst)
        serializer = ChatRoomPostSerializer(chat_room_object, data=request.data, partial=True) 
        if serializer.is_valid():
            serializer.save()

        return Response(serializer.data , status=status.HTTP_200_OK)
    
    def delete(self, request, format=None):
        try:
            chat_room_id = request.data.get("chat_room_id")
            print("chat_room_id ------ ", chat_room_id)
            if not chat_room_id:
                return Response({"error": "Usernames list is required"}, status=status.HTTP_400_BAD_REQUEST)
            chat_room_id = chat_room_id
            ChatRoom.objects.get(id = chat_room_id).delete()
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(status=status.HTTP_204_NO_CONTENT)

class SearchChatUser(APIView):
    permission_classes = [IsAuthenticated]


    def get(self, request):
        
        query = request.GET.get('query', '')
        if len(query) >= 3:
            # Assuming your User model has a 'username' field
            
            chatroom_users = list(ChatRoom.objects.filter(type = "DM", members__id = request.user.id ).filter( members__username__icontains = query).values_list("members__id", flat=True))
            print("chatroom_users ---------- ", chatroom_users)
            users = list(User.objects.filter(username__icontains=query).exclude(id__in = chatroom_users).values("username"))
            return Response({"data": users})
        else:
            users = list(User.objects.exclude(username = request.user.username).values("username"))
            return Response({"data": users}) 



@permission_classes([IsAuthenticated])
@api_view(['POST'])
def file_upload_send_chat(request):
    print("calling function ------- file_upload_send_chat")
    if request.method == "POST":
        data = request.data
        print('data ----------- ', data )
        roomId = data.get('roomId')
        userObj = request.user
        message = data.get('message')
        file = data.get("file")
        print("file -in post-------- ", file)
        
        # userObj = User.objects.get(username = sender)
        chatObj = ChatRoom.objects.get(roomId=roomId)
        chatMessageObj = ChatMessage.objects.create(
            file = file,
            room=chatObj, 
            sender=userObj, 
            message=message
        )
        
        
        chatMessage =  {
            "action": "message",
            "user": userObj.id,
            "roomId": roomId,
            "sender": userObj.username,
            "file" : str(chatMessageObj.file.name),  
            "message": message,
            "sender_image": userObj.image.name if userObj.image.name else '',
            "userName": userObj.first_name + " " + userObj.last_name if userObj.first_name and userObj.last_name else '',
            "timestamp": str(chatMessageObj.timestamp),
        }
        
        print('roomId -inside post method ------', roomId)
        async_to_sync(channel_layer.group_send)(
            f'chat_{roomId}',  # roodId
            {
                'type': 'chat_message',  # Method name in consumer
                'message': chatMessage,  
            }
        )

        return Response(chatMessage, status=status.HTTP_200_OK)
    return Response({"msg" : "Invaild Method"}, status=status.HTTP_400_BAD_REQUEST)



def download_chat_file(request, file_name):
    file_path = os.path.join(settings.MEDIA_ROOT, 'chat_files', file_name)
    if os.path.exists(file_path):
        with open(file_path, 'rb') as fh:
            response = HttpResponse(fh.read(), content_type="application/octet-stream")
            response['Content-Disposition'] = 'inline; filename=' + os.path.basename(file_path)
            return response
    raise Http404