import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, Min, IsOptional } from 'class-validator';

export class UpdateUserRankDto {
  @ApiProperty({
    description: 'Tên rank (kim_cuong, vang, bac, dong)',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'Tên hiển thị của rank', required: false })
  @IsString()
  @IsOptional()
  displayName?: string;

  @ApiProperty({
    description: 'Số tài khoản tối đa được phép thêm',
    required: false,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  maxAccounts?: number;

  @ApiProperty({
    description: 'Thứ tự sắp xếp (1: cao nhất, 4: thấp nhất)',
    required: false,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  order?: number;
}
