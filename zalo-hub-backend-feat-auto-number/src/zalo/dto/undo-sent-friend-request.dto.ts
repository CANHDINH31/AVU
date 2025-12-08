import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UndoSentFriendRequestDto {
  @IsNumber()
  @IsNotEmpty()
  accountId: number;

  @IsString()
  @IsNotEmpty()
  userId: string;
}
