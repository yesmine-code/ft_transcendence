import { Response } from "express";
import { Controller, Body, Post, Res } from "@nestjs/common";

import { AchievementsService } from "./achievements.service";

import { ListDto } from "./dto/list.dto";

@Controller("achievements")
export class AchievementsController {
  constructor(private achievementsService: AchievementsService) {}

  @Post("list")
  async achievments(@Body() body: ListDto, @Res() res: Response) {
    const achievments = await this.achievementsService.getAchievements(
      body.user_id
    );

    return res
      .status(201)
      .send(achievments.map((achievment) => achievment.achievement));
  }
}
