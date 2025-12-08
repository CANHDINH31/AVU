import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DatabaseService } from "./database.service";
import { databaseConfig } from "../config/database.config";
import { Account } from "@/entities/account.entity";
import { Message } from "@/entities/message.entity";
import { Conversation } from "@/entities/conversation.entity";
import { Friend } from "@/entities/friend.entity";
import { Reaction } from "@/entities/reaction.entity";
import { Sticker } from "@/entities/sticker.entity";
import { FailedFileStorage } from "@/entities/failed-file-storage.entity";

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfig),
    TypeOrmModule.forFeature([
      Account,
      Message,
      Conversation,
      Friend,
      Reaction,
      Sticker,
      FailedFileStorage,
    ]),
  ],
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
