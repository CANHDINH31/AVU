import { DataSource } from 'typeorm';
import { UploadPermissions } from '../entities/upload-permissions.entity';
import { User } from '../../user/entities/user.entity';

export async function seedUploadPermissions(dataSource: DataSource) {
  const permissionsRepository = dataSource.getRepository(UploadPermissions);
  const userRepository = dataSource.getRepository(User);

  // Tìm admin user
  const adminUser = await userRepository.findOne({
    where: { email: 'admin@example.com' }, // Thay đổi email admin tùy theo hệ thống
  });

  if (!adminUser) {
    console.log('Admin user not found, skipping upload permissions seed');
    return;
  }

  // Kiểm tra xem admin đã có permissions chưa
  const existingPermissions = await permissionsRepository.findOne({
    where: { userId: adminUser.id },
  });

  if (existingPermissions) {
    console.log('Admin upload permissions already exist');
    return;
  }

  // Tạo full permissions cho admin
  const adminPermissions = permissionsRepository.create({
    userId: adminUser.id,
    canRead: true,
    canCreate: true,
    canEdit: true,
    canDelete: true,
  });

  await permissionsRepository.save(adminPermissions);
  console.log('Admin upload permissions created successfully');
}

// Seed function để chạy
export default async function runUploadPermissionsSeed(dataSource: DataSource) {
  try {
    await seedUploadPermissions(dataSource);
  } catch (error) {
    console.error('Error seeding upload permissions:', error);
  }
}
