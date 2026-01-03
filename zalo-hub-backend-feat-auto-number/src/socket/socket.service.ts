import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class SocketService {
  private readonly logger = new Logger(SocketService.name);
  private readonly zaloListenerBaseUrl =
    process.env.ZALO_LISTENER_BASE_URL || 'http://localhost:3001';

  constructor(private readonly httpService: HttpService) {}

  /**
   * Gửi tin nhắn với attachments thông qua zalo-listener
   */
  async sendMessageWithAttachments(
    accountId: number,
    friendZaloId: string,
    attachments: any[],
    message?: string,
  ) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.zaloListenerBaseUrl}/zalo/send-message-with-attachments`,
          {
            accountId,
            friendZaloId,
            attachments,
            message,
          },
        ),
      );

      return response.data as any;
    } catch (error) {
      this.logger.error('Error calling zalo-listener API:', error.message);
      throw new Error(`Failed to send message via socket: ${error.message}`);
    }
  }

  /**
   * Gửi tin nhắn thông thường thông qua zalo-listener
   */
  async sendMessage(
    accountId: number,
    friendZaloId: string,
    message: string,
    type?: string,
    quote?: any,
  ) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.zaloListenerBaseUrl}/zalo/send-message`, {
          accountId,
          friendZaloId,
          message,
          type,
          quote,
        }),
      );

      return response.data as any;
    } catch (error) {
      this.logger.error('Error calling zalo-listener API:', error.message);
      throw new Error(`Failed to send message via socket: ${error.message}`);
    }
  }

  /**
   * Kiểm tra trạng thái listener
   */
  async getListenerStatus() {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.zaloListenerBaseUrl}/listener/status`),
      );

      return response.data as any;
    } catch (error) {
      this.logger.error('Error getting listener status:', error.message);
      throw new Error(`Failed to get listener status: ${error.message}`);
    }
  }

  /**
   * Khởi động lại listener
   */
  async restartListener() {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.zaloListenerBaseUrl}/listener/restart`),
      );

      return response.data as any;
    } catch (error) {
      this.logger.error('Error restarting listener:', error.message);
      throw new Error(`Failed to restart listener: ${error.message}`);
    }
  }
}
