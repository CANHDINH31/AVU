import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ThreadType } from 'zca-js';

export class UndoMessageDto {
  @IsNumber()
  @IsNotEmpty()
  accountId: number;

  @IsString()
  @IsNotEmpty()
  threadId: string;

  @IsNumber()
  @IsNotEmpty()
  type: ThreadType;

  @IsString()
  @IsNotEmpty()
  msgId: string;

  @IsString()
  @IsNotEmpty()
  cliMsgId: string;
}
