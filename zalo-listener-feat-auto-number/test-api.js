const axios = require("axios");

const API_BASE_URL = "http://localhost:3001";

async function testAPI() {
  console.log("🧪 Testing Zalo Listener API...\n");

  try {
    // Test 1: Lấy trạng thái listener
    console.log("1️⃣ Testing GET /listener/status");
    const statusResponse = await axios.get(`${API_BASE_URL}/listener/status`);
    console.log("✅ Status:", statusResponse.data);
    console.log("");

    // Test 2: Bắt đầu listener
    console.log("2️⃣ Testing POST /listener/start");
    const startResponse = await axios.post(`${API_BASE_URL}/listener/start`);
    console.log("✅ Start response:", startResponse.data);
    console.log("");

    // Test 3: Lấy trạng thái sau khi start
    console.log("3️⃣ Testing GET /listener/status (after start)");
    const statusAfterStart = await axios.get(`${API_BASE_URL}/listener/status`);
    console.log("✅ Status after start:", statusAfterStart.data);
    console.log("");

    // Test 4: Restart listener
    console.log("4️⃣ Testing POST /listener/restart");
    const restartResponse = await axios.post(
      `${API_BASE_URL}/listener/restart`
    );
    console.log("✅ Restart response:", restartResponse.data);
    console.log("");

    // Test 5: Lấy trạng thái cuối cùng
    console.log("5️⃣ Testing GET /listener/status (final)");
    const finalStatus = await axios.get(`${API_BASE_URL}/listener/status`);
    console.log("✅ Final status:", finalStatus.data);
    console.log("");

    console.log("🎉 All API tests completed successfully!");
  } catch (error) {
    console.error("❌ API test failed:", error.response?.data || error.message);

    if (error.code === "ECONNREFUSED") {
      console.log(
        "\n💡 Make sure the Zalo Listener service is running on port 3001"
      );
      console.log("   Run: npm run start:dev");
    }
  }
}

// Chạy test
testAPI();
