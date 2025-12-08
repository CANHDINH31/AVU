import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVideoDurationToMessage1710000000002
  implements MigrationInterface
{
  name = 'AddVideoDurationToMessage1710000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`messages\` ADD \`video_duration\` int NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`messages\` DROP COLUMN \`video_duration\``,
    );
  }
}
