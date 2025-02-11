import json
from channels.generic.websocket import AsyncWebsocketConsumer


# class CommentConsumer(AsyncWebsocketConsumer):
#     async def connect(self):
#         self.post_id = self.scope['url_route']['kwargs']['post_id']
#         self.room_group_name = f"post_{self.post_id}"
#
#         # Tham gia nhóm WebSocket
#         await self.channel_layer.group_add(self.room_group_name, self.channel_name)
#         await self.accept()
#
#     async def disconnect(self, close_code):
#         # Rời khỏi nhóm WebSocket
#         await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
#
#     async def receive(self, text_data):
#         data = json.loads(text_data)
#
#         # Phát tin nhắn đến tất cả người dùng trong nhóm
#         await self.channel_layer.group_send(
#             self.room_group_name,
#             {
#                 'type': 'send_comment',
#                 'comment': data
#             }
#         )
#
#     async def send_comment(self, event):
#         # Gửi bình luận đến các client kết nối
#         await self.send(text_data=json.dumps({
#             'comment': event['comment']
#         }))


class PostActivityConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Tạo group
        self.post_id = self.scope['url_route']['kwargs']['post_id']
        self.room_group_name = f"post_{self.post_id}"

        # Tham gia group WebSocket
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get("type")
        message_data = data.get("data")

        if message_type == "comment":
            event_type = "send_comment"
        elif message_type == "update-comment":
            event_type = "send_update_comment"
        elif message_type == "action":
            event_type = "send_action"
        else:
            return

        # Phát tin nhắn đến tất cả người dùng trong nhóm
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': event_type,
                'data': message_data
            }
        )

    async def send_comment(self, event):
        await self.send(text_data=json.dumps({
            'type': 'comment',
            'data': event['data']
        }))

    async def send_update_comment(self, event):
        await self.send(text_data=json.dumps({
            'type': 'update-comment',
            'data': event['data']
        }))

    async def send_action(self, event):
        await self.send(text_data=json.dumps({
            'type': 'action',
            'data': event['data']
        }))
