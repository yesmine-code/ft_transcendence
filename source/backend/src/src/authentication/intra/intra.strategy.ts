import { Strategy, Profile } from "passport-42";

import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";

import { UserEntity } from "@/entities/user.entity";

import { AuthenticationService } from "@/authentication/authentication.service";

@Injectable()
export class IntraStrategy extends PassportStrategy(Strategy, "OAuth2") {
  constructor(private readonly authenticationService: AuthenticationService) {
    super({
      clientID: process.env.INTRA_CLIENT_ID,
      clientSecret: process.env.INTRA_CLIENT_SECRET,
      callbackURL: process.env.INTRA_CALLBACK_URL,
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile
  ): Promise<UserEntity> {
    const user = await this.authenticationService.get42User(profile.id);

    return user || (await this.authenticationService.set42User(profile));
  }
}
