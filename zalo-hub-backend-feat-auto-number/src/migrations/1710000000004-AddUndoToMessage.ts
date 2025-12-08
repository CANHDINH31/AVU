import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUndoToMessage1710000000004 implements MigrationInterface {
  name = 'AddUndoToMessage1710000000004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`messages\` ADD \`undo\` int NOT NULL DEFAULT 0`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`messages\` DROP COLUMN \`undo\``);
  }
}
