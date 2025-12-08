import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetFriendRequestsByAccountIdsDto {
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
