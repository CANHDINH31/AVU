import { MigrationInterface, QueryRunner, TableIndex } from 'typeorm';

export class UpdatePhoneNumberUniqueConstraint1740000000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('phone_numbers');

    if (!table) {
      return;
    }

    // Find and drop the old unique index on phoneNumber
    // MySQL stores unique constraints as unique indexes
    const oldUniqueIndex = table.indices.find(
      (index) =>
        index.isUnique &&
        index.columnNames.length === 1 &&
        index.columnNames[0] === 'phoneNumber',
    );

    if (oldUniqueIndex) {
      await queryRunner.dropIndex('phone_numbers', oldUniqueIndex);
    }

    // Create new composite unique index on (phoneNumber, accountId)
    // MySQL uses unique index instead of unique constraint
    const hasCompositeUnique = table.indices.some(
      (index) =>
        index.isUnique &&
        index.columnNames.length === 2 &&
        index.columnNames.includes('phoneNumber') &&
        index.columnNames.includes('accountId'),
    );

    if (!hasCompositeUnique) {
      await queryRunner.createIndex(
        'phone_numbers',
        new TableIndex({
          name: 'UQ_phone_numbers_phoneNumber_accountId',
          columnNames: ['phoneNumber', 'accountId'],
          isUnique: true,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('phone_numbers');

    if (!table) {
      return;
    }

    // Drop composite unique index
    const compositeUnique = table.indices.find(
      (index) =>
        index.isUnique &&
        index.columnNames.length === 2 &&
        index.columnNames.includes('phoneNumber') &&
        index.columnNames.includes('accountId'),
    );

    if (compositeUnique) {
      await queryRunner.dropIndex('phone_numbers', compositeUnique);
    }

    // Restore old unique index on phoneNumber
    const hasOldUnique = table.indices.some(
      (index) =>
        index.isUnique &&
        index.columnNames.length === 1 &&
        index.columnNames[0] === 'phoneNumber',
    );

    if (!hasOldUnique) {
      await queryRunner.createIndex(
        'phone_numbers',
        new TableIndex({
          name: 'UQ_phone_numbers_phoneNumber',
          columnNames: ['phoneNumber'],
          isUnique: true,
        }),
      );
    }
  }
}
