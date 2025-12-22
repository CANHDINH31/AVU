import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class ChangeRecommTimeToDecimal1744000000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Change recommTime column to DECIMAL(20,0) to support very large millisecond timestamps
    // DECIMAL(20,0) can store up to 20 digits, much larger than BIGINT or INT
    // This migration handles both INT and BIGINT columns (in case previous migration was run)
    await queryRunner.changeColumn(
      'friend_requests',
      'recommTime',
      new TableColumn({
        name: 'recommTime',
        type: 'decimal',
        precision: 20,
        scale: 0,
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert recommTime column back to INT
    await queryRunner.changeColumn(
      'friend_requests',
      'recommTime',
      new TableColumn({
        name: 'recommTime',
        type: 'int',
        isNullable: true,
      }),
    );
  }
}
