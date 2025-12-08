import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsIn } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class SearchUserDto {
  @ApiPropertyOptional({
    description: 'Search in both name and email (LIKE match)',
    example: 'john',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by name (LIKE match)',
    example: 'john',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Filter by email (LIKE match)',
    example: 'gmail.com',
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ enum: UserRole, description: 'Exact role match' })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({
    description: 'Filter by active status (1 or 0)',
    example: 1,
  })
  @IsOptional()
  @IsIn([0, 1])
  active?: 0 | 1;

  @ApiPropertyOptional({
    description: 'Get all users without any filtering (1 or 0)',
    example: 1,
  })
  @IsOptional()
  @IsIn([0, 1])
  all?: 0 | 1;
}
