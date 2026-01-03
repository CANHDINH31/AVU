import {
  Controller,
  Post,
  Body,
  Get,
  ParseIntPipe,
  UploadedFiles,
  UseInterceptors,
} from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { ZaloListenerService } from "./zalo-listener.service";

@Controller("zalo-listener")
export class ZaloListenerController {
  constructor(private readonly zaloListenerService: ZaloListenerService) {}

  @Post("trigger-check-accounts")
  async triggerCheckAccounts() {
    await this.zaloListenerService.checkConnectionsAndUpdateAccounts();
    return { message: "Triggered checkConnectionsAndUpdateAccounts" };
  }
}

@Controller("listener")
export class ListenerController {
  constructor(private readonly zaloListenerService: ZaloListenerService) {}

  @Get("status")
  async getListenerStatus() {
    return await this.zaloListenerService.getListenerStatus();
  }

  @Post("restart")
  async restartListener() {
    return await this.zaloListenerService.restartListener();
  }
}

@Controller("zalo")
export class ZaloController {
  constructor(private readonly zaloListenerService: ZaloListenerService) {}

  @Post("send-message-with-attachments")
  @UseInterceptors(FilesInterceptor("files"))
  async sendMessageWithAttachments(
    @UploadedFiles() files: Array<any>,
    @Body("accountId", ParseIntPipe) accountId: number,
    @Body("friendZaloId") friendZaloId: string,
    @Body("message") message?: string,
    @Body("testError") testError?: boolean
  ) {
    if (!files || files.length === 0) {
      return { success: false, message: "No files uploaded" };
    }
    const attachments = files.map((file) => ({
      data: file.buffer,
      filename: file.originalname,
      metadata: {
        totalSize: file.size,
      },
    }));

    return await this.zaloListenerService.sendMessageWithAttachments(
      accountId,
      friendZaloId,
      attachments,
      message
    );
  }

  @Post("send-message")
  async sendMessage(
    @Body()
    body: {
      accountId: number;
      friendZaloId: string;
      message: string;
      type?: string;
      quote?: any;
    }
  ) {
    const { accountId, friendZaloId, message, type, quote } = body;
    return await this.zaloListenerService.sendMessage(
      accountId,
      friendZaloId,
      message,
      type,
      quote
    );
  }
}
