import { Module } from "@nestjs/common";
import { ZaloListenerModule } from "./zalo/zalo-listener.module";
import { DatabaseModule } from "./database/database.module";
import { SocketModule } from "./socket/socket.module";
import { CleanupFilesModule } from "./cleanup/cleanup-files.module";

@Module({
  imports: [
    ZaloListenerModule,
    DatabaseModule,
    SocketModule,
    CleanupFilesModule,
  ],
})
export class AppModule {}
