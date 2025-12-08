// conversation-friend-id.dto.ts
import { IsNotEmpty, IsNumber } from 'class-validator';

export class ConversationFriendIdDto {
  @IsNumber()
  @IsNotEmpty()
  friendId: number;

  @IsNumber()
  @IsNotEmpty()
  accountId: number;
}
