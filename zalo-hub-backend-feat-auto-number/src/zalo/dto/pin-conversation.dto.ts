import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class PinConversationDto {
  @IsNumber()
  @IsNotEmpty()
  accountId: number;

  @IsString()
  @IsNotEmpty()
  threadId: string;

  @IsNumber()
  @IsNotEmpty()
  isPinned: number;
}
