import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UserRank, UserRankName } from '../user/entities/user-rank.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

async function seedUserRanks() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const userRankRepository = app.get<Repository<UserRank>>(
    getRepositoryToken(UserRank),
  );

  try {
    // Check if ranks already exist
    const existingRanks = await userRankRepository.find();
    if (existingRanks.length > 0) {
      console.log('✅ User ranks already exist, skipping seed...');
      existingRanks.forEach((rank) => {
        console.log(
          `  - ${rank.displayName} (${rank.name}): ${rank.maxAccounts} accounts`,
        );
      });
      return;
    }

    const ranks = [
      {
        name: UserRankName.KIM_CUONG,
        displayName: 'Kim Cương',
        maxAccounts: 100,
        order: 1,
      },
      {
        name: UserRankName.VANG,
        displayName: 'Vàng',
        maxAccounts: 50,
        order: 2,
      },
      {
        name: UserRankName.BAC,
        displayName: 'Bạc',
        maxAccounts: 20,
        order: 3,
      },
      {
        name: UserRankName.DONG,
        displayName: 'Đồng',
        maxAccounts: 5,
        order: 4,
      },
    ];

    for (const rankData of ranks) {
      const rank = userRankRepository.create(rankData);
      await userRankRepository.save(rank);
      console.log(
        `✅ Created rank: ${rank.displayName} (${rank.name}) - Max accounts: ${rank.maxAccounts}`,
      );
    }

    console.log('🎉 User ranks seeded successfully!');
  } catch (error) {
    console.error('❌ Lỗi khi seed user ranks:', error.message);
    throw error;
  } finally {
    await app.close();
  }
}

// Run the seed function
if (require.main === module) {
  seedUserRanks()
    .then(() => {
      console.log('🎉 Seed script hoàn thành!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seed script thất bại:', error);
      process.exit(1);
    });
}

export { seedUserRanks };
