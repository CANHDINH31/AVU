import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class AcceptFriendRequestDto {
  @IsNumber()
  @IsNotEmpty()
  accountId: number;

  @IsString()
  @IsNotEmpty()
  userId: string;
}
