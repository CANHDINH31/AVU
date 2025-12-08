# Quick Start Guide

## 🚀 Chạy nhanh

### 1. Cài đặt dependencies

```bash
npm install
```

### 2. Cấu hình môi trường

```bash
# Copy file env.example thành .env
cp env.example .env

# Cập nhật ZALO_BE_BASE_URL trong .env nếu cần
```

### 3. Chạy service

```bash
# Development mode
npm run start:dev

# Hoặc production mode
npm run build
npm run start:prod
```

## 🧪 Test

### Test API

```bash
npm run test:api
```

### Test WebSocket

```bash
npm run test:socket
```

## 📡 Kết nối từ Frontend

### WebSocket

```javascript
import { io } from "socket.io-client";

const socket = io("http://localhost:3002");

socket.on("new_message", (message) => {
  console.log("Tin nhắn mới:", message);
});

socket.on("account_status", (status) => {
  console.log("Trạng thái tài khoản:", status);
});
```

### API

```javascript
// Lấy trạng thái
const status = await fetch("http://localhost:3001/listener/status");

// Bắt đầu listener
await fetch("http://localhost:3001/listener/start", { method: "POST" });
```

## 🐳 Docker

```bash
# Build và chạy với Docker Compose
docker-compose up -d

# Xem logs
docker-compose logs -f
```

## 📊 Monitoring

- **API Health**: `GET http://localhost:3001/listener/status`
- **WebSocket**: `ws://localhost:3002`
- **Logs**: Xem console output hoặc logs trong Docker

## 🔧 Troubleshooting

### Lỗi kết nối đến zalo_be

- Đảm bảo `zalo_be` đang chạy trên port 3000
- Kiểm tra `ZALO_BE_BASE_URL` trong file `.env`

### Lỗi WebSocket

- Đảm bảo port 3002 không bị chiếm
- Kiểm tra CORS settings nếu cần

### Lỗi Zalo API

- Kiểm tra credentials của tài khoản Zalo
- Đảm bảo cookies, imei, userAgent đều có giá trị
