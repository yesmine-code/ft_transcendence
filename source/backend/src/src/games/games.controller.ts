import { Response, Request } from "express";

import { Controller, Body, Post, Res, Req } from "@nestjs/common";

import { HistoryDto } from "./dto/history.dto";

import { GamesService } from "./games.service";
import { LevelsDto } from "./dto/levels.dto";

@Controller("games")
export class GamesController {
  constructor(private gamesService: GamesService) {}

  @Post("history")
  async history(
    @Body() body: HistoryDto,
    @Req() req: Request,
    @Res() res: Response
  ) {
    const current = req.currentUser;
    if (!current) return res.redirect(301, "http://127.0.0.1:4000/signin");

    const games = await this.gamesService.history(
      body.user_id || current.id,
      body.last
    );

    return res.status(201).send(games);
  }

  @Post("levels")
  async levels(
    @Body() body: LevelsDto,
    @Req() req: Request,
    @Res() res: Response
  ) {
    const current = req.currentUser;
    if (!current) return res.redirect(301, "http://127.0.0.1:4000/signin");

    const levels = await this.gamesService.levels(body.user_id);

    return res.status(201).send(levels);
  }
}
