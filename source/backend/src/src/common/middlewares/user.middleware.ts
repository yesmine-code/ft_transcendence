import { Request, Response, NextFunction } from "express";

import {
  BadRequestException,
  Injectable,
  NestMiddleware,
} from "@nestjs/common";

import { AuthenticationService } from "@/authentication/authentication.service";

@Injectable()
export default class LoggerMiddleware implements NestMiddleware {
  constructor(private authenticationService: AuthenticationService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    if (!req.cookies) throw new BadRequestException();

    const access_token = req.cookies["access_token"];
    if (!access_token) {
      req.currentUser = undefined;
      return next();
    }

    const user = await this.authenticationService.verifyAccessToken(
      access_token
    );
    if (!user) {
      res.clearCookie("2fa");
      res.clearCookie("access_token");
      return res.status(302).redirect("http://127.0.0.1:4000/signin");
    }

    req.currentUser = user;
    req.required_2fa = false;

    const tfa = req.cookies["2fa"];
    if (!user.isTwoFactorAuthenticationEnabled) {
      if (tfa) res.clearCookie("2fa");
      return next();
    }

    const tfa_verify = await this.authenticationService.verifyAccessToken(tfa);
    if (
      !tfa_verify &&
      req.method.toLocaleLowerCase() !== "post" &&
      req.originalUrl !== "/2fa"
    ) {
      req.required_2fa = true;
      res.clearCookie("2fa");
    }

    return next();
  }
}
