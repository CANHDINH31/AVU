import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsArray } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetFriendsDto {
  @ApiPropertyOptional({ description: 'Search by display name or username' })
  @IsOptional()
  @IsString()
  search?: string;
}

export class GetFriendsByAccountIdsDto {
  @ApiPropertyOptional({
    description: 'Search by display name or username',
    type: String,
  })
  @IsOptional()
  @IsString()
  search?: string;
}

export class AccountIdsDto {
  @ApiPropertyOptional({
    description: 'Array of account IDs as strings',
    type: [String],
    example: ['1', '2', '3'],
  })
  @IsArray()
  @Transform(({ value }) => {
    if (Array.isArray(value)) {
      // Convert string to number and filter invalid values
      const numbers = value
        .map((id) => {
          const num = parseInt(String(id), 10);
          return isNaN(num) ? null : num;
        })
        .filter((id) => id !== null);
      return numbers;
    }
    return value;
  })
  accountIds: number[];
}
