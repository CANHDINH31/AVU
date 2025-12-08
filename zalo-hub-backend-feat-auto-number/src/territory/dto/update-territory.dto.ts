import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateTerritoryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @ApiPropertyOptional({ description: 'Manager user id' })
  @IsOptional()
  @IsInt()
  managerId?: number;

  @ApiPropertyOptional({
    description: 'List of user ids in this territory',
    type: [Number],
  })
  @IsOptional()
  userIds?: number[];
}
