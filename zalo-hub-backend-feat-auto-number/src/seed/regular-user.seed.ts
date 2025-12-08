import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UserService } from '../user/user.service';
import { UserRole } from '../user/entities/user.entity';
import * as bcrypt from 'bcrypt';

async function seedRegularUsers() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const userService = app.get(UserService);

  const regularUsers = [
    {
      email: 'user1@gmail.com',
      name: 'Nguyễn Văn An',
      password: '123456',
      role: UserRole.USER,
    },
    {
      email: 'user2@gmail.com',
      name: 'Trần Thị Bình',
      password: '123456',
      role: UserRole.USER,
    },
    {
      email: 'user3@gmail.com',
      name: 'Lê Văn Cường',
      password: '123456',
      role: UserRole.USER,
    },
    {
      email: 'user4@gmail.com',
      name: 'Phạm Thị Đức',
      password: '123456',
      role: UserRole.USER,
    },
    {
      email: 'user5@gmail.com',
      name: 'Hoàng Văn Em',
      password: '123456',
      role: UserRole.USER,
    },
  ];

  try {
    const saltRounds = 10;
    let createdCount = 0;
    let skippedCount = 0;

    console.log('🚀 Bắt đầu tạo regular users...\n');

    for (const userData of regularUsers) {
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
        });

        console.log(`✅ Tạo user thành công: ${createdUser.name}`);
        console.log(`   📧 Email: ${createdUser.email}`);
        console.log(`   🔑 Role: ${createdUser.role}`);
        console.log(`   🆔 ID: ${createdUser.id}\n`);

        createdCount++;
      } catch (error) {
        console.error(`❌ Lỗi khi tạo user ${userData.email}:`, error.message);
      }
    }

    console.log('📊 Tổng kết:');
    console.log(`✅ Đã tạo: ${createdCount} users`);
    console.log(`❌ Đã bỏ qua: ${skippedCount} users (do đã tồn tại)`);
    console.log(`📋 Tổng số users trong danh sách: ${regularUsers.length}`);
  } catch (error) {
    console.error('❌ Lỗi khi chạy seed script:', error.message);
    throw error;
  } finally {
    await app.close();
  }
}

// Run the seed function
if (require.main === module) {
  seedRegularUsers()
    .then(() => {
      console.log('🎉 Seed script hoàn thành!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seed script thất bại:', error);
      process.exit(1);
    });
}

export { seedRegularUsers };
