import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class SendFriendRequestDto {
  @IsNumber()
  @IsNotEmpty()
  accountId: number;

  @IsNumber()
  @IsNotEmpty()
  friendId: number;

  @IsString()
  @IsNotEmpty()
  userId: string;
}
