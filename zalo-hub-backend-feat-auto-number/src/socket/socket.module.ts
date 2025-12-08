import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { SocketService } from './socket.service';

@Module({
  imports: [HttpModule],
  providers: [SocketService],
  exports: [SocketService],
})
export class SocketModule {}
