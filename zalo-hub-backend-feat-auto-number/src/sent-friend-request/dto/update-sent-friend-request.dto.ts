import { PartialType } from '@nestjs/swagger';
import { CreateSentFriendRequestDto } from './create-sent-friend-request.dto';

export class UpdateSentFriendRequestDto extends PartialType(CreateSentFriendRequestDto) {}
