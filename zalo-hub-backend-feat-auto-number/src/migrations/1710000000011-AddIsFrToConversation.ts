import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsFrToConversation1710000000011 implements MigrationInterface {
  name = 'AddIsFrToConversation1710000000011';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasColumn = await queryRunner.hasColumn('conversations', 'isFr');
    if (!hasColumn) {
      await queryRunner.query(`
        ALTER TABLE \`conversations\`
          ADD COLUMN \`isFr\` TINYINT NOT NULL DEFAULT 1
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasColumn = await queryRunner.hasColumn('conversations', 'isFr');
    if (hasColumn) {
      await queryRunner.query(`
        ALTER TABLE \`conversations\`
          DROP COLUMN \`isFr\`
      `);
    }
  }
}
