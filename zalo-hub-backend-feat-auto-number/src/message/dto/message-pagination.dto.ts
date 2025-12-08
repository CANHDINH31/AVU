import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min } from 'class-validator';
import { DEFAULT_MESSAGE_LIMIT } from '../../constant/constants';

export class MessagePaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = DEFAULT_MESSAGE_LIMIT;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  beforeId?: number;
}
