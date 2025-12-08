import { IsOptional, IsString, IsNumber } from 'class-validator';

export class QuoteMessageDto {
  @IsString()
  @IsOptional()
  contentJson?: string;

  @IsString()
  @IsOptional()
  msgType?: string;

  @IsString()
  @IsOptional()
  propertyExtJson?: string;

  @IsString()
  @IsOptional()
  uidFrom?: string;

  @IsString()
  @IsOptional()
  msgId?: string;

  @IsString()
  @IsOptional()
  cliMsgId?: string;

  @IsString()
  @IsOptional()
  ts?: string;

  @IsNumber()
  @IsOptional()
  ttl?: number;
}
