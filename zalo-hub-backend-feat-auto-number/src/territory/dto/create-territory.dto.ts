import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateTerritoryDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name: string;

  @ApiProperty({ description: 'Manager name' })
  @IsString()
  @IsNotEmpty()
  managerName: string;

  // Users will be added after creation; omit at creation time
}
