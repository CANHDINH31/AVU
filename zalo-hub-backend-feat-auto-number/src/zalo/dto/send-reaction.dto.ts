import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class SendReactionDto {
  @IsNumber()
  @IsNotEmpty()
  accountId: number;

  @IsString()
  @IsNotEmpty()
  threadId: string;

  @IsNumber()
  @IsNotEmpty()
  type: number;

  @IsString()
  @IsNotEmpty()
  msgId: string;

  @IsString()
  @IsNotEmpty()
  cliMsgId: string;

  @IsString()
  @IsOptional()
  emoji?: string;
}
