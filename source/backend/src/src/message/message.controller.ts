import { Request, Response } from "express";

import { Controller, Post, Body, Res, Req } from "@nestjs/common";

import { MessageDto } from "./dto/message.dto";

import { MessageService } from "./message.service";

@Controller("message")
export class MessageController {
  constructor(private messageService: MessageService) {}

  @Post()
  async message(
    @Body() body: MessageDto,
    @Res() res: Response,
    @Req() req: Request
  ) {
    const current = req.currentUser;
    if (!current) return res.redirect(301, "http://127.0.0.1:4000/signin");

    const messages = await this.messageService.getMessages(
      Number(body.conversation_id),
      current.id,
      body.last
    );

    res.status(201).send(messages.reverse());
  }
}
