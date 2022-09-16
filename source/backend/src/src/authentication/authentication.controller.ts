import { Request, Response } from "express";

import {
  Controller,
  Res,
  Req,
  Get,
  UseGuards,
  ForbiddenException,
  Post,
  Body,
} from "@nestjs/common";

import { IntraGuard } from "./intra/intra.guard";

import { AuthenticationService } from "./authentication.service";
import { InputException } from "@/common/exception/input.exception";

import { SignInDto } from "./dto/signin.dto";
import { SignUpDto } from "./dto/signup.dto";

@Controller("api/auth")
export class AuthenticationController {
  constructor(private authenticationService: AuthenticationService) {}

  @Get("redirect")
  @UseGuards(IntraGuard)
  async redirect(
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request
  ) {
    if (!(await this.authenticationService.verifyUser(req.user["email"]))) {
      res.clearCookie("access_token");
      return res.status(302).redirect("http://127.0.0.1:4000/signin");
    }

    const access_token = this.authenticationService.createAccessToken(
      req.user["id"]
    );
    res.cookie("access_token", access_token, { httpOnly: true });
    return res.status(302).redirect("http://127.0.0.1:4000/");
  }

  @Get("connect_42")
  @UseGuards(IntraGuard)
  connect42() {}

  @Post("logout")
  logout(@Res() res: Response, @Req() req: Request) {
    if (!req.currentUser) throw new ForbiddenException();
    res.clearCookie("2fa");
    res.clearCookie("access_token");
    return res.status(302).redirect("http://127.0.0.1:4000/");
  }

  @Post("signin")
  async signin(
    @Body() body: SignInDto,
    @Res() res: Response,
    @Req() req: Request
  ) {
    if (req.currentUser) throw new ForbiddenException();

    const access_token = await this.authenticationService.verifyUserPassword({
      email: body.email,
      password: body.password,
    });

    if (!access_token) {
      throw new InputException({
        password: "Email or password is incorrect.",
      });
    }

    res.cookie("access_token", access_token, { httpOnly: true });
    return res.status(302).redirect("http://127.0.0.1:4000/");
  }

  @Post("signup")
  async signup(
    @Body() body: SignUpDto,
    @Res() res: Response,
    @Req() req: Request
  ) {
    if (req.currentUser) throw new ForbiddenException();

    const username_taken =
      body.username &&
      (await this.authenticationService.usernameExist(body.username));

    const email_taken =
      body.email && (await this.authenticationService.emailExist(body.email));

    if (username_taken || email_taken) {
      throw new InputException({
        ...(username_taken ? { username: "Username already exist." } : {}),
        ...(email_taken ? { email: "Email already exist." } : {}),
      });
    }

    const access_token = await this.authenticationService.saveUser(body);
    if (!access_token) throw new ForbiddenException();

    res.cookie("access_token", access_token, { httpOnly: true });
    return res.status(302).redirect("http://127.0.0.1:4000/");
  }
}
