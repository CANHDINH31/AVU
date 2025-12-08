import { IsBoolean, IsOptional, IsString, IsInt } from 'class-validator';

export class CreateUploadPermissionsDto {
  @IsInt()
  userId: number;

  @IsBoolean()
  @IsOptional()
  canRead?: boolean = false;

  @IsBoolean()
  @IsOptional()
  canCreate?: boolean = false;

  @IsBoolean()
  @IsOptional()
  canEdit?: boolean = false;

  @IsBoolean()
  @IsOptional()
  canDelete?: boolean = false;
}

export class UpdateUploadPermissionsDto {
  @IsBoolean()
  @IsOptional()
  canRead?: boolean;

  @IsBoolean()
  @IsOptional()
  canCreate?: boolean;

  @IsBoolean()
  @IsOptional()
  canEdit?: boolean;

  @IsBoolean()
  @IsOptional()
  canDelete?: boolean;
}

export class InviteUserDto {
  @IsString()
  email: string;

  @IsBoolean()
  @IsOptional()
  canRead?: boolean = true;

  @IsBoolean()
  @IsOptional()
  canCreate?: boolean = false;

  @IsBoolean()
  @IsOptional()
  canEdit?: boolean = false;

  @IsBoolean()
  @IsOptional()
  canDelete?: boolean = false;
}
