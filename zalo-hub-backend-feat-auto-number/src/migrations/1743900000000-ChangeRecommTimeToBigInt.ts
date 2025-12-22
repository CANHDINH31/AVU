import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class ChangeRecommTimeToBigInt1743900000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Change recommTime column from INT to BIGINT to support millisecond timestamps
    await queryRunner.changeColumn(
      'friend_requests',
      'recommTime',
      new TableColumn({
        name: 'recommTime',
        type: 'bigint',
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
