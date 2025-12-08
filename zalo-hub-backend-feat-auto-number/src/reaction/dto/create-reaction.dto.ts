import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ReactionMsgItemDto {
  @IsNumber()
  gMsgID: number;

  @IsNumber()
  cMsgID: number;

  @IsNumber()
  msgType: number;
}

export class CreateReactionDto {
  @IsString()
  actionId: string;

  @IsString()
  msgId: string;

  @IsString()
  cliMsgId: string;

  @IsString()
  msgType: string;

  @IsString()
  uidFrom: string;

  @IsString()
  idTo: string;

  @IsString()
  dName: string;

  @IsString()
  ts: string;

  @IsString()
  rIcon: string;

  @IsNumber()
  rType: number;

  @IsOptional()
  @IsNumber()
  source?: number;

  @IsOptional()
  @IsNumber()
  ttl?: number;

  @IsString()
  threadId: string;

  @IsNumber()
  isSelf: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReactionMsgItemDto)
  @IsOptional()
  rMsg?: ReactionMsgItemDto[];
}
