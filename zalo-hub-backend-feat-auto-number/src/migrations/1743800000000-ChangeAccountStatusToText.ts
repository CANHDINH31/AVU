import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class ChangeAccountStatusToText1743800000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Change status column from VARCHAR(50) to TEXT
    await queryRunner.changeColumn(
      'accounts',
      'status',
      new TableColumn({
        name: 'status',
        type: 'text',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert status column back to VARCHAR(50)
    await queryRunner.changeColumn(
      'accounts',
      'status',
      new TableColumn({
        name: 'status',
        type: 'varchar',
        length: '50',
        isNullable: true,
      }),
    );
  }
}
