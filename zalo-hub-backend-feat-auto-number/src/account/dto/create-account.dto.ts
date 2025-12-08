import {
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsString,
  IsObject,
  IsJSON,
} from 'class-validator';

export class CreateAccountDto {
  @IsNotEmpty()
  @IsString()
  userZaloId: string;

  @IsOptional()
  @IsNumber()
  accountStatus?: number;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsString()
  bgavatar?: string;

  @IsOptional()
  @IsObject()
  bizPkg?: { label: string | null; pkgId: number };

  @IsOptional()
  @IsString()
  cover?: string;

  @IsOptional()
  @IsNumber()
  createdTs?: number;

  @IsOptional()
  @IsString()
  displayName?: string;

  @IsOptional()
  @IsNumber()
  dob?: number;

  @IsOptional()
  @IsNumber()
  gender?: number;

  @IsOptional()
  @IsString()
  globalId?: string;

  @IsOptional()
  @IsNumber()
  isActive?: number;

  @IsOptional()
  @IsNumber()
  isActivePC?: number;

  @IsOptional()
  @IsNumber()
  isActiveWeb?: number;

  @IsOptional()
  @IsNumber()
  isBlocked?: number;

  @IsOptional()
  @IsNumber()
  isFr?: number;

  @IsOptional()
  @IsNumber()
  isValid?: number;

  @IsOptional()
  @IsNumber()
  accountKey?: number;

  @IsOptional()
  @IsNumber()
  lastActionTime?: number;

  @IsOptional()
  @IsNumber()
  lastUpdateTime?: number;

  @IsOptional()
  @IsObject()
  oaInfo?: any;

  @IsOptional()
  @IsObject()
  oa_status?: any;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  sdob?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsNumber()
  type?: number;

  @IsOptional()
  @IsString()
  userKey?: string;

  @IsOptional()
  @IsNumber()
  user_mode?: number;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  zaloName?: string;

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
