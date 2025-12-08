import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  // Không tạo client, không kết nối Redis

  constructor(private configService: ConfigService) {
    // Không tạo client Redis
  }

  async onModuleInit() {
    // Không connect
  }

  async onModuleDestroy() {
    // Không quit
  }

  async set(key: string, value: any, ttl?: number) {
    // Không làm gì cả
    return;
  }

  async get(key: string) {
    // Luôn trả về null
    return null;
  }

  async del(key: string) {
    return;
  }

  async exists(key: string) {
    return 0;
  }

  async lpush(key: string, value: string) {
    return 0;
  }

  async lrange(key: string, start: number, stop: number) {
    return [];
  }

  async ltrim(key: string, start: number, stop: number) {
    return;
  }

  async llen(key: string) {
    return 0;
  }
}
