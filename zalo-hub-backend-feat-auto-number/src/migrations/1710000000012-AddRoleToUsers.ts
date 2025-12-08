import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRoleToUsers1710000000012 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Thêm cột role dạng ENUM trong MySQL
    await queryRunner.query(`
      ALTER TABLE users
      ADD COLUMN role ENUM('user', 'admin', 'manager') NOT NULL DEFAULT 'user'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Xóa cột role
    await queryRunner.query(`
      ALTER TABLE users DROP COLUMN role
    `);
  }
}
