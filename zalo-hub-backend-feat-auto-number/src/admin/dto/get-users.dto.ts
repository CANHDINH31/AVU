import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, Min, Max, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class GetUsersDto {
  @ApiProperty({
    example: 1,
    required: false,
    description: 'Page number (starts from 1)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    example: 10,
    required: false,
    description: 'Number of items per page',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiProperty({
    example: 'john',
    required: false,
    description: 'Search term for name or email',
  })
  @IsOptional()
  search?: string;

  @ApiProperty({
    example: 1,
    required: false,
    description: 'Filter by active status (0: inactive, 1: active)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsIn([0, 1])
  active?: number;

  @ApiProperty({
    example: 'user',
    required: false,
    description: 'Filter by role (admin, manager, user)',
    enum: ['admin', 'manager', 'user'],
  })
  @IsOptional()
  @IsIn(['admin', 'manager', 'user'])
  role?: string;
}
