import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMessageTrackingFields1743100000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`daily_scan_tracking\`
        ADD COLUMN manualMessageToday INT NOT NULL DEFAULT 0,
        ADD COLUMN autoMessageToday INT NOT NULL DEFAULT 0,
        ADD COLUMN limitAutoMessageToday INT NOT NULL DEFAULT 200
    `);

    await queryRunner.query(`
      ALTER TABLE \`phone_number_messages\`
        ADD COLUMN isSuccess TINYINT(1) NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`phone_number_messages\`
        DROP COLUMN isSuccess
    `);

    await queryRunner.query(`
      ALTER TABLE \`daily_scan_tracking\`
        DROP COLUMN limitAutoMessageToday,
        DROP COLUMN autoMessageToday,
        DROP COLUMN manualMessageToday
    `);
  }
}
