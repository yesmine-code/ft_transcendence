import { Response, Request } from "express";
import * as qrcode from "qrcode";

import {
  Controller,
  Post,
  Res,
  UseGuards,
  Req,
  ForbiddenException,
  Body,
  HttpCode,
  UnauthorizedException,
  BadRequestException,
  UnprocessableEntityException,
} from "@nestjs/common";

import { AuthenticationService } from "@/authentication/authentication.service";
import { UsersService } from "@/users/users.service";

import { TwoFactorAuthenticationCodeDto } from "./dto/twoFactorAuthenticationCode.dto";
import { CheckVerificationCodeDto } from "./dto/checkVerificationCode.dto";
import { UpdateDto } from "./dto/update.dto";
import { PhoneNumberDto } from "./dto/phoneNumberCode.dto";

import { TwoFactorAuthenticationService } from "./two_factor_authentication.service";
import { InputException } from "@/common/exception/input.exception";

@Controller("2fa")
export class TwoFactorAuthenticationController {
  constructor(
    private readonly twoFactorAuthenticationService: TwoFactorAuthenticationService,
    private readonly usersService: UsersService,
    private readonly authenticationService: AuthenticationService
  ) {}

  @Post("generate")
  @UseGuards(AuthenticationService)
  async register(@Res() res: Response, @Req() req: Request) {
    const user = req.currentUser;
    if (!user) throw new ForbiddenException();

    const { otpauthUrl } =
      await this.twoFactorAuthenticationService.generateTwoFactorAuthenticationSecret(
        user
      );
    let hh = this.usersService.findOneById(user.id);
    const url = await qrcode.toDataURL(otpauthUrl);
    res.status(201).send({ qrcode: url });
  }

  @Post("authenticate")
  @HttpCode(200)
  @UseGuards(AuthenticationService)
  async authenticate(
    @Req() req: Request,
    @Body() { twoFactorAuthenticationCode }: TwoFactorAuthenticationCodeDto
  ) {
    const user = req.currentUser;
    if (!user) throw new ForbiddenException();

    twoFactorAuthenticationCode.trim();
    const isCodeValid =
      this.twoFactorAuthenticationService.isTwoFactorAuthenticationCodeValid(
        twoFactorAuthenticationCode,
        user
      );

    if (!isCodeValid)
      throw new UnauthorizedException("Wrong authentication code");

    await this.usersService.turnOnTwoFactorAuthentication(user.id);
    const accessTokenCookie = this.authenticationService.createAccessToken(
      user.id
    );
    req.res.setHeader("Set-Cookie", [accessTokenCookie]);
    return user;
  }

  @Post("phone_number")
  @UseGuards(AuthenticationService)
  async getPhoneNumber(
    @Req() request: Request,
    @Body() { phone_number }: PhoneNumberDto
  ) {
    const user = request.currentUser;
    if (!user) throw new ForbiddenException();

    phone_number.trim();

    await this.usersService.updatePhoneNumber(user.id, phone_number);

    return {};
  }

  @Post("initiate-verification")
  async initiatePhoneNumberVerification(@Req() request: Request) {
    const user = request.currentUser;
    if (!user) throw new ForbiddenException();

    if (user.isPhoneNumberConfirmed)
      throw new BadRequestException("Phone number already confirmed");

    await this.twoFactorAuthenticationService.initiatePhoneNumberVerification(
      user.phoneNumber
    );

    return {};
  }

  @Post("check-verification-code")
  async checkVerificationCode(
    @Req() request: Request,
    @Body() verificationData: CheckVerificationCodeDto
  ) {
    const user = request.currentUser;
    if (!user) throw new ForbiddenException();

    if (user.isPhoneNumberConfirmed)
      throw new BadRequestException("Phone number already confirmed");

    const data = await this.twoFactorAuthenticationService.confirmPhoneNumber(
      user.id,
      user.phoneNumber,
      verificationData.code
    );

    if (data.status !== "approved")
      throw new InputException({
        code: "Incorrect code.",
      });

    return {};
  }

  @Post("send_code")
  async sendVerificationCode(@Req() request: Request) {
    const user = request.currentUser;
    if (!user) throw new ForbiddenException();

    await this.twoFactorAuthenticationService.initiatePhoneNumberVerification(
      user.phoneNumber
    );

    return {};
  }

  @Post("verify_code")
  async verifyVerificationCode(
    @Req() request: Request,
    @Body() verificationData: CheckVerificationCodeDto
  ) {
    const user = request.currentUser;
    if (!user) throw new ForbiddenException();

    const data = await this.twoFactorAuthenticationService.confirmPhoneNumber(
      user.id,
      user.phoneNumber,
      verificationData.code
    );

    if (data.status !== "approved")
      throw new InputException({
        code: "Incorrect code.",
      });
    const tfa = this.authenticationService.createAccessToken({
      id: user.id,
      "2fa": user.isTwoFactorAuthenticationEnabled,
    });
    request.res.cookie("2fa", tfa, {
      httpOnly: true,
    });
    return {};
  }

  @Post("update")
  async update(@Body() body: UpdateDto, @Req() request: Request) {
    const user = request.currentUser;
    if (!user) throw new ForbiddenException();

    if (user.isPhoneNumberConfirmed) {
      await this.usersService.enableTwoStepAuthentication(user.id, body.enable);
      if (!body.enable) request.res.clearCookie("2fa");
      else {
        const tfa = this.authenticationService.createAccessToken({
          id: user.id,
          "2fa": user.isTwoFactorAuthenticationEnabled,
        });
        request.res.cookie("2fa", tfa, {
          httpOnly: true,
        });
      }
    }

    return {
      confirmed: user.isPhoneNumberConfirmed,
    };
  }
}
