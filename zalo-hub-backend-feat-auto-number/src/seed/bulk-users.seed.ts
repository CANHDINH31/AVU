import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UserService } from '../user/user.service';
import { UserRole } from '../user/entities/user.entity';
import * as bcrypt from 'bcrypt';

async function seedBulkUsers() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const userService = app.get(UserService);

  try {
    const saltRounds = 10;
    const totalUsers = 50; // Số lượng users muốn tạo
    let createdCount = 0;
    let skippedCount = 0;
    const batchSize = 10; // Xử lý theo batch để tránh quá tải

    console.log(`🚀 Bắt đầu tạo ${totalUsers} users...\n`);

    for (let i = 1; i <= totalUsers; i++) {
      const userData = {
        email: `user${i}@test.com`,
        name: `Test User ${i}`,
        password: '123456',
        role: UserRole.USER,
      };

      try {
        // Check if user already exists
        const existingUser = await userService.findByEmail(userData.email);
        if (existingUser) {
          console.log(`❌ User với email ${userData.email} đã tồn tại - SKIP`);
          skippedCount++;
          continue;
        }

        // Create user
        const createdUser = await userService.create({
          email: userData.email,
          password: userData.password,
          name: userData.name,
          role: userData.role,
          active: 1,
        });

        if (i <= 10 || i % 10 === 0) {
          // Hiển thị chi tiết cho 10 user đầu và mỗi 10 user
          console.log(`✅ Tạo user thành công: ${createdUser.name}`);
          console.log(`   📧 Email: ${createdUser.email}`);
          console.log(`   🔑 Role: ${createdUser.role}`);
          console.log(`   🆔 ID: ${createdUser.id}\n`);
        } else if (i % 10 === 0) {
          console.log(`⏳ Đã xử lý ${i}/${totalUsers} users...\n`);
        }

        createdCount++;
      } catch (error) {
        console.error(`❌ Lỗi khi tạo user ${userData.email}:`, error.message);
      }

      // Thêm delay nhỏ giữa các batch để tránh quá tải database
      if (i % batchSize === 0) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    console.log('\n📊 Tổng kết:');
    console.log(`✅ Đã tạo: ${createdCount} users`);
    console.log(`❌ Đã bỏ qua: ${skippedCount} users (do đã tồn tại)`);
    console.log(`📋 Tổng số users trong danh sách: ${totalUsers}`);
    console.log(`📝 Password mặc định cho tất cả users: 123456`);
  } catch (error) {
    console.error('❌ Lỗi khi chạy seed script:', error.message);
    throw error;
  } finally {
    await app.close();
  }
}

// Run the seed function
if (require.main === module) {
  seedBulkUsers()
    .then(() => {
      console.log('🎉 Bulk seed script hoàn thành!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Bulk seed script thất bại:', error);
      process.exit(1);
    });
}

export { seedBulkUsers };
