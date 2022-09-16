import * as fs from "fs";
import * as path from "path";

import { Request, Response, Express } from "express";

import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  ForbiddenException,
  UploadedFile,
  UseInterceptors,
  Get,
  Param,
  NotFoundException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";

import { isFriendshipType, translateType } from "@/entities/connection.entity";

import { ConnectionService } from "@/connections/connections.service";

import { AuthenticationService } from "@/authentication/authentication.service";
import { InputException } from "@/common/exception/input.exception";

import { storage } from "./storage/avatars.storage";

import { UsernameDto } from "./dto/username.dto";
import { UsersThemeDto } from "./dto/theme.dto";
import { ProfileDto } from "./dto/profile.dto";
import { UpdateDto } from "./dto/update.dto";

import { UsersService } from "./users.service";
import { UsersMapDto } from "./dto/map.dto";
import { FirstLoginDto } from "./dto/first_login.dto";

@Controller("users")
export class UsersController {
  constructor(
    private usersService: UsersService,
    private connectionService: ConnectionService,
    private authenticationService: AuthenticationService
  ) {}

  @Post("profile")
  async profile(@Body() body: ProfileDto, @Req() req: Request) {
    const user = await this.usersService.findOneByUsername(body.username);
    if (!user || user.isFirstLogin) {
      return {};
    }

    const profile: Record<string, any> = {};
    profile["id"] = user.id;
    profile["username"] = user.username;
    profile["display_name"] = user.display_name;
    profile["is_owner"] = req.currentUser?.id == user.id;
    profile["avatar"] = `/users/avatar/${user.id}/${user.avatar}`;
    profile["status"] = user.status;

    if (req.currentUser && !profile["is_owner"]) {
      const connections = await this.connectionService.getManyFriendship(
        req.currentUser,
        user
      );

      let friendship = null;
      let blocked = false;

      for (const connection of connections) {
        const updatable_friendship =
          friendship == null || friendship < connection.type;
        const source_origine = connection.source.id == req.currentUser.id;
        const is_friendship = isFriendshipType(connection.type);

        if (is_friendship || source_origine) {
          if (!connection.type && !source_origine) continue;
          if (updatable_friendship) friendship = connection.type;
          continue;
        }

        if (!blocked) {
          blocked = true;
        }
      }

      if (blocked) {
        profile["blocked"] = true;
      }

      if (friendship != null) {
        profile["friendship"] = translateType(friendship);
      }
    }

    return profile;
  }

  @Post("username")
  async username(
    @Body() body: UsernameDto,
    @Res() res: Response,
    @Req() req: Request
  ) {
    const current = req.currentUser;
    if (!current) throw new ForbiddenException();

    const username_taken =
      body.username &&
      (await this.authenticationService.usernameExist(body.username));

    if (username_taken)
      throw new InputException({
        username: "Username already exist.",
      });

    await this.usersService.username(current, body.username);

    return res.status(201).send({});
  }

  @Post("update")
  @UseInterceptors(FileInterceptor("avatar", storage))
  async uploadFile(
    @UploadedFile() avatar: Express.Multer.File,
    @Body() body: UpdateDto,
    @Res() res: Response,
    @Req() req: Request
  ) {
    const current = req.currentUser;
    if (!current || current.isFirstLogin) throw new ForbiddenException();

    const fields: Record<string, any> = body;
    if (avatar?.filename) {
      fields.avatar = avatar?.filename;
    }

    const data = await this.usersService.update(current, fields);
    if (!data) throw new ForbiddenException();

    return res.status(201).send(data);
  }

  @Post("first_login")
  @UseInterceptors(FileInterceptor("avatar", storage))
  async firstLogin(
    @UploadedFile() avatar: Express.Multer.File,
    @Body() body: FirstLoginDto,
    @Res() res: Response,
    @Req() req: Request
  ) {
    const current = req.currentUser;
    if (!current || !current.isFirstLogin) throw new ForbiddenException();

    const fields: Record<string, any> = body;
    if (avatar?.filename) {
      fields.avatar = avatar?.filename;
    }

    fields.isFirstLogin = false;

    const data = await this.usersService.update(current, fields);
    if (!data) throw new ForbiddenException();

    return res.redirect(301, "http://127.0.0.1:4000/");
  }

  @Post("theme")
  async theme(
    @Body() body: UsersThemeDto,
    @Res() res: Response,
    @Req() req: Request
  ) {
    const current = req.currentUser;
    if (!current) throw new ForbiddenException();

    await this.usersService.theme(current, body.theme);

    return res.status(201).send({});
  }

  @Post("map")
  async map(
    @Body() body: UsersMapDto,
    @Res() res: Response,
    @Req() req: Request
  ) {
    const current = req.currentUser;
    if (!current) throw new ForbiddenException();

    await this.usersService.map(current, body.map);

    return res.status(201).send({});
  }

  @Get("avatar/:user_id/:avatar")
  async findProfileImage(
    @Res() res: Response,
    @Param("user_id") user_id: number,
    @Param("avatar") avatar: string
  ) {
    const source = await this.usersService.findOneById(user_id);
    if (!source || source.avatar != avatar) throw new NotFoundException();

    res.contentType("image/jpeg");

    const src = fs.createReadStream(
      path.join(process.cwd(), "avatars", source.avatar)
    );
    src.pipe(res);
  }
}
