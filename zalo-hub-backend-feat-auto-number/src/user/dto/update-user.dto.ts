import { IsOptional, IsString, IsJSON } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  imei?: string;

  @IsOptional()
  @IsJSON()
  cookies?: any;

  @IsOptional()
  @IsString()
  userAgent?: string;
}
