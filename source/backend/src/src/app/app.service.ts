import * as fs from "fs";
import * as serialize from "serialize-javascript";

import { Injectable } from "@nestjs/common";

import { UsersService } from "@/users/users.service";
import { ConversationsService } from "@/conversations/conversations.service";

@Injectable()
export class AppService {
  constructor(
    private usersService: UsersService,
    private conversationsService: ConversationsService
  ) {}

  getIndex(vars: Record<string, any>) {
    let file = fs.readFileSync("/app/dist/static/index.html", "utf8");

    Object.entries(vars).forEach(([key, value]) => {
      value = !["string", "number"].includes(typeof value)
        ? serialize(value)
        : value;

      file = file.replaceAll(`__${key.toLowerCase()}__`, value);
    });

    return file;
  }

  async search(query: string) {
    const users = ((await this.usersService.findLike(query)) || []) as Record<
      string,
      any
    >[];
    const conversations = ((await this.conversationsService.findLike(query)) ||
      []) as Record<string, any>[];

    return conversations.concat(users);
  }
}
