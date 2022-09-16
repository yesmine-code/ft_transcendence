import { Profile } from "passport-42";

import { JwtService } from "@nestjs/jwt";
import { Injectable } from "@nestjs/common";

import { UsersService } from "@/users/users.service";

import * as hashPassword from "@/common/hash/hash.password";

import { SignUpDto } from "./dto/signup.dto";

@Injectable()
export class AuthenticationService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService
  ) {}

  async getUser(id: number) {
    return await this.usersService.findOneById(id);
  }

  async get42User(id: number) {
    return await this.usersService.findOneBy42Id(id);
  }

  async set42User(profile: Profile) {
    if (await this.get42User(profile.id)) return profile;
    if (await this.usernameExist(profile.username))
      profile.username = undefined;

    return await this.usersService.set42User(profile);
  }

  async verifyUser(email?: string) {
    return email && (await this.usersService.findOneByEmail(email));
  }

  async emailExist(email?: string): Promise<boolean> {
    return !!(await this.usersService.findOneByEmail(email));
  }
  async usernameExist(username?: string): Promise<boolean> {
    const forbidden = [
      "signin",
      "signup",
      "direct_message",
      "connections",
      "channels",
      "games",
      "direct_messages",
      "settings",
      "logout",
    ];

    if (forbidden.includes(username)) return true;

    return !!(await this.usersService.findOneByUsername(username));
  }

  async verifyUserPassword({
    email,
    password,
  }: { email?: string; password?: string } = {}): Promise<string | null> {
    if (!(await this.verifyUser(email))) return null;

    const user = await this.usersService.findOneByEmail(email);
    if (!hashPassword.verify(user.password, password)) return null;

    return this.createAccessToken(user.id);
  }

  async saveUser(userdto: SignUpDto) {
    userdto.password = hashPassword.encode(userdto.password);

    const user = await this.usersService.setUserSigned(userdto);
    if (!user) return null;

    return this.createAccessToken(user.id);
  }

  createAccessToken(id: number | Record<string, any>) {
    return this.jwtService.sign(typeof id == "number" ? { id } : id, {
      secret: process.env.ACCESS_TOKEN_SECRET,
      expiresIn: process.env.ACCESS_TOKEN_EXPIRATION,
    });
  }

  async verifyAccessToken(access_token?: string) {
    try {
      if (!access_token) return null;

      const data = this.jwtService.verify(access_token, {
        secret: process.env.ACCESS_TOKEN_SECRET,
      });
      if (!(data && data.id)) return null;

      const user = await this.getUser(data.id);
      if (!user) return null;

      return user;
    } catch (err) {
      return null;
    }
  }
}
