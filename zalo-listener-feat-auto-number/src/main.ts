import { NestFactory } from "@nestjs/core";
import { IoAdapter } from "@nestjs/platform-socket.io";
import * as dotenv from "dotenv";
import { AppModule } from "./app.module";
import * as bodyParser from "body-parser";
import { NestExpressApplication } from "@nestjs/platform-express";
import { join } from "path";

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(bodyParser.json({ limit: "100mb" }));
  app.use(bodyParser.urlencoded({ limit: "100mb", extended: true }));

  // Enable CORS
  app.enableCors({
    origin: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  });

  // Serve static files from uploads directory
  app.useStaticAssets(join(process.cwd(), "uploads"), {
    prefix: "/uploads",
  });

  // Use Socket.IO adapter
  app.useWebSocketAdapter(new IoAdapter(app));

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`🚀 Zalo Listener Service is running on port ${port}`);
  console.log(`🔗 Socket.IO endpoint: http://localhost:${port}/chat`);
  console.log(`📁 Static files served at: http://localhost:${port}/uploads`);
}

bootstrap();
