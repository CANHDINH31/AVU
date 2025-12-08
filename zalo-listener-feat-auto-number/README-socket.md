# Socket Module Documentation

## Tổng quan

Socket Module cung cấp WebSocket functionality cho ứng dụng Zalo Listener, cho phép real-time communication giữa client và server.

## Cấu trúc

```
src/socket/
├── socket.module.ts      # Module chính
├── socket.gateway.ts     # WebSocket Gateway
├── socket.service.ts     # Service quản lý connections
├── socket.controller.ts  # REST API controller
├── dto/
│   └── socket.dto.ts     # Data Transfer Objects
└── index.ts             # Exports
```

## Tính năng

### 1. WebSocket Events

#### Client → Server

- `join_room`: Tham gia vào room
- `leave_room`: Rời khỏi room
- `send_message`: Gửi tin nhắn
- `typing`: Thông báo đang gõ
- `read_messages`: Đánh dấu tin nhắn đã đọc

#### Server → Client

- `new_message`: Tin nhắn mới
- `user_typing`: User đang gõ
- `messages_read`: Tin nhắn đã được đọc
- `joined_room`: Xác nhận đã tham gia room
- `left_room`: Xác nhận đã rời room

### 2. REST API Endpoints

- `GET /socket/stats` - Thống kê connections
- `GET /socket/users/online` - Danh sách user online
- `GET /socket/users/:userId/status` - Trạng thái user
- `POST /socket/users/:userId/disconnect` - Ngắt kết nối user
- `GET /socket/connections/count` - Số lượng connections

## Cách sử dụng

### 1. Kết nối WebSocket

```javascript
import { io } from "socket.io-client";

const socket = io("http://localhost:3001/chat", {
  auth: {
    userId: "your-user-id",
  },
});
```

### 2. Tham gia room

```javascript
socket.emit("join_room", { roomId: "conversation-123" });

socket.on("joined_room", (data) => {
  console.log("Đã tham gia room:", data.roomId);
});
```

### 3. Gửi tin nhắn

```javascript
socket.emit("send_message", {
  roomId: "conversation-123",
  message: {
    content: "Hello world!",
    type: "text",
  },
});

socket.on("new_message", (message) => {
  console.log("Tin nhắn mới:", message);
});
```

### 4. Typing indicator

```javascript
// Bắt đầu gõ
socket.emit("typing", { roomId: "conversation-123", isTyping: true });

// Dừng gõ
socket.emit("typing", { roomId: "conversation-123", isTyping: false });

socket.on("user_typing", (data) => {
  console.log(`User ${data.userId} đang gõ:`, data.isTyping);
});
```

### 5. Đánh dấu tin nhắn đã đọc

```javascript
socket.emit("read_messages", {
  roomId: "conversation-123",
  messageIds: ["msg-1", "msg-2", "msg-3"],
});

socket.on("messages_read", (data) => {
  console.log(`User ${data.userId} đã đọc tin nhắn:`, data.messageIds);
});
```

## Testing

### Chạy test WebSocket

```bash
# Cài đặt socket.io-client nếu chưa có
npm install socket.io-client

# Chạy test
node test-socket.js
```

### Kiểm tra API endpoints

```bash
# Thống kê connections
curl http://localhost:3001/socket/stats

# Danh sách user online
curl http://localhost:3001/socket/users/online

# Trạng thái user
curl http://localhost:3001/socket/users/test-user-123/status
```

## Cấu hình

### Environment Variables

```env
PORT=3001                    # Port cho HTTP server
SOCKET_PORT=3001            # Port cho WebSocket (cùng với HTTP)
```

### CORS Configuration

WebSocket Gateway được cấu hình với CORS cho phép tất cả origins:

```typescript
@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  namespace: '/chat',
})
```

## Tích hợp với Zalo Listener

Socket Module có thể được tích hợp với Zalo Listener để:

1. **Real-time notifications**: Thông báo tin nhắn mới từ Zalo
2. **Status updates**: Cập nhật trạng thái kết nối Zalo account
3. **Message synchronization**: Đồng bộ tin nhắn giữa các client

### Ví dụ tích hợp

```typescript
// Trong ZaloListenerService
constructor(private socketGateway: SocketGateway) {}

// Gửi thông báo tin nhắn mới
notifyNewMessage(userId: string, message: any) {
  this.socketGateway.sendToUser(userId, 'new_zalo_message', message);
}

// Thông báo trạng thái kết nối
notifyConnectionStatus(userId: string, status: string) {
  this.socketGateway.sendToUser(userId, 'zalo_connection_status', { status });
}
```

## Troubleshooting

### Lỗi thường gặp

1. **Connection refused**: Kiểm tra server có đang chạy không
2. **CORS errors**: Kiểm tra cấu hình CORS
3. **Authentication failed**: Kiểm tra userId trong auth object

### Debug

Bật debug logging:

```typescript
// Trong main.ts
const app = await NestFactory.create(AppModule, {
  logger: ["debug", "error", "warn", "log"],
});
```

## Performance

- Hỗ trợ multiple connections per user
- Efficient room management
- Memory-efficient user tracking
- Automatic cleanup khi user disconnect
