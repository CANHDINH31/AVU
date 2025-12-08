import { IsString, IsOptional, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateFolderDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  path: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateFolderDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class RenameFolderDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;
}
