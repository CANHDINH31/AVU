import {
  Controller,
  Get,
  Query,
  UseGuards,
  ParseIntPipe,
  Req,
  Body,
  Post,
  UploadedFiles,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ZaloService } from './zalo.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { SendMessageDto } from './dto/send-message.dto';
import { PinConversationDto } from './dto/pin-conversation.dto';
import { SendReactionDto } from './dto/send-reaction.dto';
import { ParseLinkDto } from './dto/parse-link.dto';
import { ParseLinkResponseDto } from './dto/parse-link-response.dto';
import { SendStickerDto } from './dto/send-sticker.dto';
import { GetStickersDto } from './dto/get-stickers.dto';
import { ApiBody, ApiResponse } from '@nestjs/swagger';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UndoMessageDto } from './dto/undo-message.dto';
import { AcceptFriendRequestDto } from './dto/accept-friend-request.dto';
import { UndoSentFriendRequestDto } from './dto/undo-sent-friend-request.dto';
import { SendFriendRequestDto } from './dto/send-friend-request.dto';

@ApiBearerAuth('access-token')
@UseGuards(AuthGuard)
@Controller('zalo')
export class ZaloController {
  constructor(private readonly zaloService: ZaloService) {}

  @Get('/gen-qr')
  async genQr() {
    return this.zaloService.genQr();
  }

  @Get('/check-login')
  async checkLogin(@Query('sessionId') sessionId: string) {
    return this.zaloService.checkLogin(sessionId);
  }

  @Get('/sync-friends')
  async syncFriends(
    @Query('accountId', ParseIntPipe) accountId: number,
    @Req() req,
  ) {
    return this.zaloService.syncFriends(accountId, req.user.sub);
  }

  @Post('/send-message')
  async sendMessage(@Body() body: SendMessageDto, @Req() req) {
    const { accountId, friendZaloId, message, type, quote } = body;
    return this.zaloService.sendMessage(
      accountId,
      friendZaloId,
      message,
      type,
      quote,
    );
  }

  @Post('/send-reaction')
  async sendReaction(@Body() body: SendReactionDto, @Req() req) {
    const { accountId, threadId, type, msgId, cliMsgId, emoji } = body;
    return this.zaloService.sendReaction(
      accountId,
      threadId,
      type,
      msgId,
      cliMsgId,
      emoji ? emoji : '',
    );
  }

  @Post('/pin-conversation')
  async pinConversation(@Body() body: PinConversationDto, @Req() req) {
    const { accountId, threadId, isPinned } = body;
    return this.zaloService.pinConversation(accountId, threadId, isPinned);
  }

  @Post('/parse-link')
  @ApiBody({ type: ParseLinkDto })
  @ApiResponse({ status: 200, type: ParseLinkResponseDto })
  async parseLink(@Body() body: ParseLinkDto): Promise<any> {
    const { accountId, url } = body;
    return this.zaloService.parseLink(accountId, url);
  }

  @Post('/send-sticker')
  @ApiBody({ type: SendStickerDto })
  @ApiResponse({ status: 200, description: 'Sticker sent successfully' })
  async sendSticker(@Body() body: SendStickerDto): Promise<any> {
    const {
      accountId,
      friendZaloId,
      stickerId,
      cateId,
      type,
      stickerUrl,
      stickerSpriteUrl,
      stickerWebpUrl,
    } = body;
    return this.zaloService.sendSticker(accountId, friendZaloId, {
      id: stickerId,
      cateId,
      type,
      stickerUrl,
      stickerSpriteUrl,
      stickerWebpUrl,
    });
  }

  @Post('/send-message-with-attachments')
  @UseInterceptors(FilesInterceptor('files'))
  async sendMessageWithAttachments(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body('accountId', ParseIntPipe) accountId: number,
    @Body('friendZaloId') friendZaloId: string,
    @Body('message') message?: string,
  ) {
    if (!files || files.length === 0) {
      return { success: false, message: 'No files uploaded' };
    }
    const attachments = files.map((file) => ({
      data: file.buffer,
      filename: file.originalname,
      metadata: {
        totalSize: file.size,
      },
    }));

    // return attachments;

    return this.zaloService.sendMessageWithAttachments(
      accountId,
      friendZaloId,
      attachments,
      message,
    );
  }

  @Post('/send-message-with-video')
  @UseInterceptors(FileInterceptor('file'))
  async sendMessageWithVideo(
    @UploadedFile() file: Express.Multer.File,
    @Body('accountId', ParseIntPipe) accountId: number,
    @Body('friendZaloId') friendZaloId: string,
  ) {
    if (!file) {
      return { success: false, message: 'No files uploaded' };
    }

    // Upload video lên server và lấy videoUrl public
    return this.zaloService.sendMessageWithVideo(accountId, friendZaloId, file);
  }

  @Post('/undo-message')
  async undoMessage(@Body() body: UndoMessageDto, @Req() req) {
    const { accountId, threadId, type, msgId, cliMsgId } = body;
    return this.zaloService.undoMessage(
      accountId,
      threadId,
      type,
      msgId,
      cliMsgId,
    );
  }

  @Post('/stickers')
  @ApiBody({ type: GetStickersDto })
  @ApiResponse({
    status: 200,
    description: 'Get stickers by keyword successfully',
  })
  async getStickers(@Body() body: GetStickersDto): Promise<any> {
    const { accountId, keyword } = body;
    return this.zaloService.getStickers(accountId, keyword);
  }

  @Post('/accept-friend-request')
  async acceptFriendRequest(@Body() body: AcceptFriendRequestDto, @Req() req) {
    const { userId, accountId } = body;
    return this.zaloService.acceptFriendRequest(
      accountId,
      userId,
      req.user.sub,
    );
  }

  @Post('/undo-sent-friend-request')
  async undoSentFriendRequest(
    @Body() body: UndoSentFriendRequestDto,
    @Req() req,
  ) {
    const { userId, accountId } = body;
    return this.zaloService.undoSentFriendRequest(
      accountId,
      userId,
      req.user.sub,
    );
  }

  @Post('/send-friend-request')
  async SendFriendRequest(@Body() body: SendFriendRequestDto, @Req() req) {
    const { userId, accountId, friendId } = body;
    return this.zaloService.sendFriendRequest(accountId, friendId, userId);
  }
}
