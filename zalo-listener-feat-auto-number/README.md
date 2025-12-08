# Zalo Listener Service

Service độc lập để lắng nghe tin nhắn Zalo và cung cấp WebSocket real-time.

## Tính năng

- 🔄 Lắng nghe tin nhắn Zalo real-time
- 📡 WebSocket server để broadcast tin nhắn
- 🔌 Tự động kết nối/ngắt kết nối tài khoản
- 📊 API để quản lý listener
- 🔗 Tích hợp với zalo_be backend

## Cài đặt

```bash
npm install
```

## Cấu hình

1. Copy file `env.example` thành `.env`
2. Cập nhật các biến môi trường:

```env
# Server Configuration
PORT=3001
SOCKET_PORT=3002

# Zalo Backend API
ZALO_BE_BASE_URL=http://localhost:3000

# Logging
LOG_LEVEL=info
```

## Chạy ứng dụng

### Development

```bash
npm run start:dev
```

### Production

```bash
npm run build
npm run start:prod
```

## API Endpoints

### Listener Management

- `GET /listener/status` - Lấy trạng thái listener
- `POST /listener/start` - Bắt đầu listener
- `DELETE /listener/stop` - Dừng listener
- `POST /listener/restart` - Khởi động lại listener

## WebSocket Events

### Client Events

- `join_room` - Tham gia room
- `leave_room` - Rời khỏi room
- `get_stats` - Lấy thống kê
- `ping` - Ping server

### Server Events

- `connected` - Kết nối thành công
- `new_message` - Tin nhắn mới
- `account_status` - Trạng thái tài khoản
- `error` - Lỗi
- `stats` - Thống kê
- `pong` - Response ping

## Cấu trúc Project

```
src/
├── api/                 # API service để gọi zalo_be
│   ├── api.module.ts
│   └── api.service.ts
├── socket/              # WebSocket functionality
│   ├── socket.module.ts
│   ├── socket.service.ts
│   └── socket.gateway.ts
├── zalo/                # Zalo listener logic
│   ├── zalo-listener.module.ts
│   ├── zalo-listener.service.ts
│   └── zalo-listener.controller.ts
├── app.module.ts        # Module chính
└── main.ts             # Entry point
```

## Tích hợp với Frontend

### Kết nối WebSocket

```javascript
import { io } from "socket.io-client";

const socket = io("http://localhost:3002");

socket.on("connected", (data) => {
  console.log("Connected to Zalo Listener");
});

socket.on("new_message", (message) => {
  console.log("New message:", message);
});

socket.on("account_status", (status) => {
  console.log("Account status:", status);
});
```

### Gọi API

```javascript
// Lấy trạng thái listener
const status = await fetch("http://localhost:3001/listener/status");

// Bắt đầu listener
await fetch("http://localhost:3001/listener/start", { method: "POST" });
```

## Lưu ý

- Service này cần `zalo_be` backend chạy để lấy thông tin tài khoản
- Đảm bảo các tài khoản Zalo có đầy đủ credentials (cookies, imei, userAgent)
- WebSocket server chạy trên port riêng biệt để tránh conflict
