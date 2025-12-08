import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray } from 'class-validator';
import { Transform } from 'class-transformer';

export class ConversationAccountIdsDto {
  @ApiPropertyOptional({
    description: 'Array of account IDs as numbers',
    type: [Number],
    example: [1, 2, 3],
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
