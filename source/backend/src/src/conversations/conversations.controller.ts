import { Request, Response } from "express";

import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";

import * as hashPassword from "@/common/hash/hash.password";

import { ConversationRole } from "@/entities/conversation_members.utils";

import { ConversationsDto } from "./dto/conversations.dto";
import { ConversationsService } from "./conversations.service";
import { CreateChannelDto } from "./dto/create_channel.dto";
import { EditConversationDto } from "./dto/edit_channel.dto";
import { CreateDirectMessageDto } from "./dto/create_direct_message.dto";

@Controller("conversations")
export class ConversationsController {
  constructor(private conversationsService: ConversationsService) {}

  @Post("channels")
  async channels(
    @Body() body: ConversationsDto,
    @Res() res: Response,
    @Req() req: Request
  ) {
    const current = req.currentUser;
    if (!current) return res.redirect(301, "http://127.0.0.1:4000/signin");

    const conversation = await this.conversationsService.getChannels(
      current,
      [ConversationRole.OWNER, ConversationRole.ADMIN, ConversationRole.MEMBER],
      body.last
    );

    res.status(201).send(conversation);
  }

  @Post("direct_messages")
  async directMessages(
    @Body() body: ConversationsDto,
    @Res() res: Response,
    @Req() req: Request
  ) {
    const current = req.currentUser;
    if (!current) return res.redirect(301, "http://127.0.0.1:4000/signin");

    const conversation = await this.conversationsService.getDirectMessages(
      current,
      body.last
    );

    res.status(201).send(conversation);
  }

  @Post("invitations")
  async invitations(
    @Body() body: ConversationsDto,
    @Res() res: Response,
    @Req() req: Request
  ) {
    const current = req.currentUser;
    if (!current) return res.redirect(301, "http://127.0.0.1:4000/signin");

    const conversation = await this.conversationsService.getChannels(
      current,
      [ConversationRole.PENDING],
      body.last
    );

    res.status(201).send(conversation);
  }

  @Post("create_channel")
  async createChannel(
    @Body() { name, visibility, password }: CreateChannelDto,
    @Res() res: Response,
    @Req() req: Request
  ) {
    const current = req.currentUser;
    if (!current) return res.redirect(301, "http://127.0.0.1:4000/signin");

    const conversation = await this.conversationsService.setChannel(
      name,
      visibility,
      password
    );
    await this.conversationsService.setMember(
      conversation,
      current,
      ConversationRole.OWNER
    );

    res.status(201).send({
      owner: {
        id: current.id,
        username: current.username,
        display_name: current.display_name,
        avatar: `/users/avatar/${current.id}/${current.avatar}`,
      },
      id: conversation.id,
      name: conversation.name,
      created: conversation.created,
      visibility: conversation.visibility,
    });
  }

  @Post("create_direct_message")
  async createDirectMessage(
    @Body() { target_id }: CreateDirectMessageDto,
    @Res() res: Response,
    @Req() req: Request
  ) {
    const current = req.currentUser;
    if (!current) return res.redirect(301, "http://127.0.0.1:4000/signin");

    const conversation = await this.conversationsService.setDirectMessage(
      current,
      target_id
    );

    res.status(201).send({ conversation_id: conversation.id });
  }

  @Post("edit")
  async edit(
    @Body() body: EditConversationDto,
    @Res() res: Response,
    @Req() req: Request
  ) {
    const current = req.currentUser;
    if (!current) return res.redirect(301, "http://127.0.0.1:4000/signin");

    const conversation = await this.conversationsService.findConversationById(
      body.conversation_id
    );
    if (!conversation) throw new NotFoundException();

    const roles = [ConversationRole.OWNER, ConversationRole.ADMIN];

    if (roles) {
      const role = await this.conversationsService.getRole(
        conversation,
        current
      );
      if (!(role && roles.includes(role))) throw new ForbiddenException();
    }

    if (body.data.password)
      body.data.password = hashPassword.encode(body.data.password);

    const result = await this.conversationsService.editConversation(
      conversation,
      body.data
    );
    if (!result.affected) throw new ForbiddenException();

    res.status(201).send({});
  }
}
