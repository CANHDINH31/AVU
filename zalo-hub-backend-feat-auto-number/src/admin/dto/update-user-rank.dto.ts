import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class UpdateUserRankForUserDto {
  @ApiProperty({
    example: 1,
    description: 'ID của rank mới cho user',
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  rankId: number;
}
