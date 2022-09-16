import { Request, Response } from "express";

import { Controller, Res, Req, Get, Post, Body } from "@nestjs/common";

import { AppSearchDto } from "./dto/search.dto";
import { AppService } from "./app.service";

@Controller()
export class AppController {
  constructor(private appService: AppService) {}

  @Post("search")
  async search(@Body() body: AppSearchDto) {
    return await this.appService.search(body.query);
  }

  @Get("/*")
  async fallback(
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request
  ) {
    const vars: Record<string, any> = { initialize: {} };

    vars.nonce = res.locals.nonce;
    vars.initialize.token = req.csrfToken();

    if (req.currentUser) {
      vars.initialize.user = {
        id: req.currentUser.id,
        username: req.currentUser.username,
        display_name: req.currentUser.display_name,
        avatar: `/users/avatar/${req.currentUser.id}/${req.currentUser.avatar}`,
        theme: req.currentUser.theme,
        map: req.currentUser.map,
        phone_number: req.currentUser.phoneNumber,
        phone_number_confirmed: req.currentUser.isPhoneNumberConfirmed,
        two_step_authentication:
          req.currentUser.isTwoFactorAuthenticationEnabled,
        required_2fa: req.required_2fa,
        level: req.currentUser.level,
        isFirstLogin: req.currentUser.isFirstLogin,
      };
    }

    return this.appService.getIndex(vars);
  }
}
