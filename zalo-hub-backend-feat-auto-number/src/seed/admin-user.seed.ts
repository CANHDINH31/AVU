import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UserService } from '../user/user.service';
import { UserRole } from '../user/entities/user.entity';
import * as bcrypt from 'bcrypt';

async function seedAdminUser() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const userService = app.get(UserService);

  try {
    // Check if admin user already exists
    const existingAdmin = await userService.findByEmail('admin@gmail.com');
    if (existingAdmin) {
      console.log('❌ Admin user đã tồn tại với email: admin@gmail.com');
      console.log('📧 Email:', existingAdmin.email);
      console.log('👤 Name:', existingAdmin.name);
      console.log('🔑 Role:', existingAdmin.role);
      return;
    }

    // Create admin user
    const adminUser = await userService.create({
      email: 'admin@gmail.com',
      password: '123456',
      name: 'System Administrator',
      role: UserRole.ADMIN,
      active: 1, // Admin user is active by default
    });

    console.log('✅ Tạo admin user thành công!');
    console.log('📧 Email:', adminUser.email);
    console.log('👤 Name:', adminUser.name);
    console.log('🔑 Role:', adminUser.role);
    console.log('🆔 ID:', adminUser.id);
    console.log('📅 Created At:', adminUser.createdAt);
  } catch (error) {
    console.error('❌ Lỗi khi tạo admin user:', error.message);
    throw error;
  } finally {
    await app.close();
  }
}

// Run the seed function
if (require.main === module) {
  seedAdminUser()
    .then(() => {
      console.log('🎉 Seed script hoàn thành!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seed script thất bại:', error);
      process.exit(1);
    });
}

export { seedAdminUser };
