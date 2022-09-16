import { Request, Response } from "express";

import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  ForbiddenException,
} from "@nestjs/common";

import { ConnectionType } from "@/entities/connection.entity";

import { UsersService } from "@/users/users.service";

import { FriendsDto } from "./dto/friends.dto";

import { ConnectionService } from "./connections.service";
import { AddFriendDto } from "./dto/add_friend.dto";
import { RemoveFriendDto } from "./dto/remove_friend.dto";
import { FriendRequestsDto } from "./dto/friend_requests.dto";
import { AcceptFriendDto } from "./dto/accept_friend.dto";
import { DeclineFriendDto } from "./dto/decline_friend.dto";
import { AddBlockDto } from "./dto/add_block.dto";
import { BlockedDto } from "./dto/blocked.dto";
import { RemoveBlockDto } from "./dto/remove_block.dto";

@Controller("connections")
export class ConnectionsController {
  constructor(
    private usersService: UsersService,
    private connectionService: ConnectionService
  ) {}

  @Post("friends")
  async connections(
    @Body() body: FriendsDto,
    @Res() res: Response,
    @Req() req: Request
  ) {
    const current = req.currentUser;
    if (!current) return res.redirect(301, "http://127.0.0.1:4000/signin");

    const connection = await this.connectionService.getFriends(
      current.id,
      body.last
    );

    res.status(201).send(connection);
  }

  @Post("add_friend")
  async addFriend(
    @Body() body: AddFriendDto,
    @Res() res: Response,
    @Req() req: Request
  ) {
    const current = req.currentUser;
    if (!current) return res.redirect(301, "http://127.0.0.1:4000/signin");

    const target = await this.usersService.findOneById(body.user_id);
    if (!target) return res.redirect(301, "http://127.0.0.1:4000/signin");

    const data = await this.connectionService.addFriend(current, target);
    if (!data) throw new ForbiddenException();

    res.status(201).send({
      friendship: ["PENDING", "FRIEND", "DECLINED", "BLOCKED"][data.type],
    });
  }

  @Post("remove_friend")
  async removeFriend(
    @Body() body: RemoveFriendDto,
    @Res() res: Response,
    @Req() req: Request
  ) {
    const current = req.currentUser;
    if (!current) return res.redirect(301, "http://127.0.0.1:4000/signin");

    const target = await this.usersService.findOneById(body.user_id);
    if (!target) return res.redirect(301, "http://127.0.0.1:4000/signin");

    const data = await this.connectionService.removeFriend(current, target);
    if (!data) throw new ForbiddenException();

    res.status(201).send({});
  }

  /* Friend Requests */
  @Post("friend_requests")
  async friendRequests(
    @Body() body: FriendRequestsDto,
    @Res() res: Response,
    @Req() req: Request
  ) {
    const current = req.currentUser;
    if (!current) throw new ForbiddenException();

    const data = await this.connectionService.getFriendRequests(
      current.id,
      ConnectionType.PENDING,
      body.last
    );

    res.status(201).send(data);
  }

  @Post("accept_friend")
  async acceptFriend(
    @Body() body: AcceptFriendDto,
    @Res() res: Response,
    @Req() req: Request
  ) {
    const current = req.currentUser;
    if (!current) throw new ForbiddenException();

    await this.connectionService.answerToFriendRequest(
      body.user_id,
      current.id,
      ConnectionType.FRIEND
    );

    res.status(201).send({});
  }

  @Post("decline_friend")
  async declineFriend(
    @Body() body: DeclineFriendDto,
    @Res() res: Response,
    @Req() req: Request
  ) {
    const current = req.currentUser;
    if (!current) throw new ForbiddenException();

    await this.connectionService.answerToFriendRequest(
      body.user_id,
      current.id,
      ConnectionType.DECLINED
    );

    res.status(201).send({});
  }

  /* Blocks */
  @Post("blocked")
  async blocked(
    @Body() body: BlockedDto,
    @Res() res: Response,
    @Req() req: Request
  ) {
    const current = req.currentUser;
    if (!current) return res.redirect(301, "http://127.0.0.1:4000/signin");

    const connection = await this.connectionService.getBlocked(
      current.id,
      body.last
    );

    res.status(201).send(connection);
  }

  @Post("add_block")
  async addBlock(
    @Body() body: AddBlockDto,
    @Res() res: Response,
    @Req() req: Request
  ) {
    const current = req.currentUser;
    if (!current) return res.redirect(301, "http://127.0.0.1:4000/signin");

    const target = await this.usersService.findOneById(body.user_id);
    if (!target) return res.redirect(301, "http://127.0.0.1:4000/signin");

    const data = await this.connectionService.addBlock(current, target);
    if (!data) return new ForbiddenException();

    res.status(201).send({
      friendship: ["PENDING", "FRIEND", "DECLINED", "BLOCKED"][data.type],
    });
  }

  @Post("remove_block")
  async removeBlock(
    @Body() body: RemoveBlockDto,
    @Res() res: Response,
    @Req() req: Request
  ) {
    const current = req.currentUser;
    if (!current) return res.redirect(301, "http://127.0.0.1:4000/signin");

    const target = await this.usersService.findOneById(body.user_id);
    if (!target) return res.redirect(301, "http://127.0.0.1:4000/signin");

    const data = await this.connectionService.removeBlock(current, target);
    if (!data) throw new ForbiddenException();

    res.status(201).send({});
  }
}
