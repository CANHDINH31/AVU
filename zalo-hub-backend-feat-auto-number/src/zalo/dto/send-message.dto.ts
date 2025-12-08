import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { QuoteMessageDto } from './quote-message.dto';

export class SendMessageDto {
  @IsNumber()
  @IsNotEmpty()
  accountId: number;

  @IsString()
  @IsNotEmpty()
  friendZaloId: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsOptional()
  type?: string;

  @ValidateNested()
  @Type(() => QuoteMessageDto)
  @IsOptional()
  quote?: QuoteMessageDto;
}
