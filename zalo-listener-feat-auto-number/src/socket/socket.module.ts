import { Module } from "@nestjs/common";
import { SocketController } from "./socket.controller";
import { SocketGateway } from "./socket.gateway";
import { SocketService } from "./socket.service";

@Module({
  providers: [SocketGateway, SocketService],
  controllers: [SocketController],
  exports: [SocketService, SocketGateway],
})
export class SocketModule {}
