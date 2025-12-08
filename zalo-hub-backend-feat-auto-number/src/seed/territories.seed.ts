import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { TerritoryService } from '../territory/territory.service';
import { UserService } from '../user/user.service';
import { UserRole } from '../user/entities/user.entity';
import * as bcrypt from 'bcrypt';

async function seedTerritories() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const territoryService = app.get(TerritoryService);
  const userService = app.get(UserService);

  try {
    const totalTerritories = 30;
    const managerCount = 5;
    const saltRounds = 10;

    console.log(`🚀 Bắt đầu seed territories...`);

    // 1) Ensure manager users exist
    const managerNames: string[] = [];
    for (let i = 1; i <= managerCount; i++) {
      const email = `manager${i}@test.com`;
      const name = `Manager ${i}`;
      managerNames.push(name);

      const existingManager = await userService.findByEmail(email);
      if (existingManager) {
        console.log(
          `ℹ️  Manager đã tồn tại: ${existingManager.name} (${existingManager.email})`,
        );
        continue;
      }

      const hashedPassword = await bcrypt.hash('123456', saltRounds);
      const createdManager = await userService.create({
        email,
        password: hashedPassword,
        name,
        role: UserRole.MANAGER,
        active: 1,
      });
      console.log(
        `✅ Tạo manager: ${createdManager.name} (${createdManager.email})`,
      );
    }

    // 2) Build existing territory name set to avoid duplicates
    const existing = await territoryService.findAll();
    const existingNames = new Set(existing.map((t) => t.name));

    // 3) Create territories
    let createdCount = 0;
    let skippedCount = 0;
    for (let i = 1; i <= totalTerritories; i++) {
      const name = `Territory ${i}`;
      if (existingNames.has(name)) {
        console.log(`❌ Territory đã tồn tại - SKIP: ${name}`);
        skippedCount++;
        continue;
      }

      const managerName = managerNames[(i - 1) % managerNames.length];
      try {
        const created = await territoryService.create({ name, managerName });
        if (i <= 5 || i % 5 === 0) {
          console.log(
            `✅ Tạo territory: ${created.name} | Manager: ${managerName}`,
          );
        }
        createdCount++;
      } catch (err) {
        console.error(`💥 Lỗi khi tạo territory ${name}:`, err?.message ?? err);
      }
    }

    console.log('\n📊 Tổng kết:');
    console.log(`✅ Đã tạo mới: ${createdCount} territories`);
    console.log(`❌ Đã bỏ qua (đã tồn tại): ${skippedCount} territories`);
    console.log(`🎯 Mục tiêu: ${totalTerritories} territories`);
  } catch (error) {
    console.error('❌ Lỗi khi chạy seed territories:', error?.message ?? error);
    throw error;
  } finally {
    await app.close();
  }
}

// Run the seed function
if (require.main === module) {
  seedTerritories()
    .then(() => {
      console.log('🎉 Seed territories hoàn thành!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seed territories thất bại:', error);
      process.exit(1);
    });
}

export { seedTerritories };
