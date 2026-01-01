import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, Min, IsNotEmpty } from 'class-validator';

export class CreateUserRankDto {
  @ApiProperty({ description: 'Tên rank (kim_cuong, vang, bac, dong)' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Tên hiển thị của rank' })
  @IsString()
  @IsNotEmpty()
  displayName: string;

  @ApiProperty({ description: 'Số tài khoản tối đa được phép thêm' })
  @IsInt()
  @Min(0)
  maxAccounts: number;

  @ApiProperty({ description: 'Thứ tự sắp xếp (1: cao nhất, 4: thấp nhất)' })
  @IsInt()
  @Min(1)
  order: number;
}
