import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional } from 'class-validator';

export class GetStickersDto {
  @ApiProperty({
    description: 'ID của account Zalo',
    example: 1,
  })
  @IsNumber()
  accountId: number;

  @ApiProperty({
    description: 'Từ khóa để tìm kiếm stickers',
    example: 'happy',
  })
  @IsString()
  keyword: string;
}
