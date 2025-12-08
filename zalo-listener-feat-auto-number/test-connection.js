const io = require("socket.io-client");

// Kết nối đến WebSocket server
const socket = io("http://localhost:3002");

console.log("🔌 Connecting to Zalo Listener WebSocket...");

socket.on("connect", () => {
  console.log("✅ Connected to WebSocket server");
  console.log("Client ID:", socket.id);

  // Lấy thống kê
  socket.emit("get_stats");
});

socket.on("connected", (data) => {
  console.log("📡 Server confirmed connection:", data);
});

socket.on("stats", (stats) => {
  console.log("📊 Server stats:", stats);
});

socket.on("new_message", (message) => {
  console.log("💬 New message received:", message);
});

socket.on("account_status", (status) => {
  console.log("👤 Account status update:", status);
});

socket.on("error", (error) => {
  console.log("❌ Error:", error);
});

socket.on("disconnect", () => {
  console.log("🔌 Disconnected from server");
});

socket.on("connect_error", (error) => {
  console.log("❌ Connection error:", error.message);
});

// Ping server mỗi 30 giây
setInterval(() => {
  socket.emit("ping");
}, 30000);

socket.on("pong", (data) => {
  console.log("🏓 Pong received:", data);
});

// Xử lý tắt chương trình
process.on("SIGINT", () => {
  console.log("\n🛑 Disconnecting...");
  socket.disconnect();
  process.exit(0);
});

console.log("Press Ctrl+C to exit");
