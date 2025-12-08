import { IsNumber, IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateMessageDto {
  @IsNumber()
  type: number;

  @IsString()
  threadId: string;

  @IsBoolean()
  isSelf: number;

  @IsString()
  actionId: string;

  @IsString()
  msgId: string;

  @IsString()
  cliMsgId: string;

  @IsString()
  uidFrom: string;

  @IsString()
  idTo: string;

  @IsString()
  dName: string;

  @IsString()
  ts: string;

  @IsNumber()
  status: number;

  @IsString()
  content: string;

  @IsNumber()
  conversationId: number;

  @IsOptional()
  @IsNumber()
  senderId?: number;
}
