import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ParseLinkDto {
  @IsNotEmpty()
  @IsNumber()
  accountId: number;

  @IsNotEmpty()
  @IsString()
  url: string;
}
