import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CheckConnectionDto {
  @ApiProperty({
    description: 'Cookies for authentication',
    example:
      '[{"name": "cookie1", "value": "value1"}, {"name": "cookie2", "value": "value2"}]',
  })
  @IsNotEmpty()
  cookies: any;

  @ApiProperty({
    description: 'IMEI of the device',
    example: '123456789012345',
  })
  @IsString()
  @IsNotEmpty()
  imei: string;

  @ApiProperty({
    description: 'User agent string',
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  })
  @IsString()
  @IsNotEmpty()
  userAgent: string;
}
