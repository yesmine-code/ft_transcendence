import { Injectable, BadRequestException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { authenticator } from "@otplib/preset-default";

import { UsersService } from "@/users/users.service";

import { UserEntity } from "@/entities/user.entity";
import { Twilio } from "twilio";

@Injectable()
export class TwoFactorAuthenticationService {
  private twilioClient: Twilio;
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService
  ) {
    const accountSid = configService.get("TWILIO_ACCOUNT_SID");
    const authToken = configService.get("TWILIO_AUTH_TOKEN");

    this.twilioClient = new Twilio(accountSid, authToken);
  }

  public async generateTwoFactorAuthenticationSecret(user: UserEntity) {
    let secret = authenticator.generateSecret();

    const otpauthUrl = authenticator.keyuri(
      user.email,
      this.configService.get("TWO_FACTOR_AUTHENTICATION_APP_NAME"),
      secret
    );
    await this.usersService.setTwoFactorAuthenticationSecret(secret, user.id);
    return { secret, otpauthUrl };
  }

  public isTwoFactorAuthenticationCodeValid(
    twoFactorAuthenticationCode: string,
    user: UserEntity
  ) {
    return authenticator.verify({
      token: twoFactorAuthenticationCode,
      secret: user.twoFactorAuthenticationSecret,
    });
  }

  initiatePhoneNumberVerification(phoneNumber: string) {
    const serviceSid = this.configService.get(
      "TWILIO_VERIFICATION_SERVICE_SID"
    );
    return this.twilioClient.verify
      .services(serviceSid)
      .verifications.create({ to: phoneNumber, channel: "sms" });
  }

  async confirmPhoneNumber(
    userId: number,
    phoneNumber: string,
    verificationCode: string
  ) {
    const serviceSid = this.configService.get(
      "TWILIO_VERIFICATION_SERVICE_SID"
    );

    const result = await this.twilioClient.verify
      .services(serviceSid)
      .verificationChecks.create({ to: phoneNumber, code: verificationCode });

    if (result.valid && result.status == "approved")
      await this.usersService.markPhoneNumberAsConfirmed(userId);

    return result;
  }
}
