import { Module } from "@nestjs/common";
import { ZaloListenerService } from "./zalo-listener.service";
import {
  ZaloListenerController,
  ZaloController,
  ListenerController,
} from "./zalo-listener.controller";
import { DatabaseModule } from "../database/database.module";
import { SocketModule } from "../socket/socket.module";

@Module({
  imports: [DatabaseModule, SocketModule],
  providers: [ZaloListenerService],
  exports: [ZaloListenerService],
  controllers: [ZaloListenerController, ZaloController, ListenerController],
})
export class ZaloListenerModule {}
