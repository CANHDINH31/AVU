import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddModeToPhoneNumberMessages1743200000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if column already exists
    const table = await queryRunner.getTable('phone_number_messages');
    const hasModeColumn = table?.columns.some(
      (column) => column.name === 'mode',
    );

    if (!hasModeColumn) {
      // Add column with default value
      await queryRunner.query(`
        ALTER TABLE \`phone_number_messages\`
          ADD COLUMN \`mode\` VARCHAR(10) NOT NULL DEFAULT 'manual'
      `);

      // Update all existing records to 'manual' (in case default didn't apply)
      await queryRunner.query(`
        UPDATE \`phone_number_messages\`
        SET \`mode\` = 'manual'
        WHERE \`mode\` IS NULL OR \`mode\` = ''
      `);

      // Also update records based on type field for backward compatibility
      // If type contains 'text-auto', set mode to 'auto'
      await queryRunner.query(`
        UPDATE \`phone_number_messages\`
        SET \`mode\` = 'auto'
        WHERE \`type\` LIKE '%text-auto%' OR \`type\` = 'text-auto'
      `);

      // If type contains 'text-manual', set mode to 'manual'
      await queryRunner.query(`
        UPDATE \`phone_number_messages\`
        SET \`mode\` = 'manual'
        WHERE \`type\` LIKE '%text-manual%' OR \`type\` = 'text-manual'
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('phone_number_messages');
    const hasModeColumn = table?.columns.some(
      (column) => column.name === 'mode',
    );

    if (hasModeColumn) {
      await queryRunner.query(`
        ALTER TABLE \`phone_number_messages\`
          DROP COLUMN \`mode\`
      `);
    }
  }
}
