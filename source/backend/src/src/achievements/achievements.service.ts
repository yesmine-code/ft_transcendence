import { Repository } from "typeorm";

import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { InputException } from "@/common/exception/input.exception";

import { AchievementEntity } from "@/entities/achievement.entity";
import { Achievement } from "@/entities/achievement.utils";
import { UserEntity } from "@/entities/user.entity";

import { UsersService } from "@/users/users.service";

@Injectable()
export class AchievementsService {
  constructor(
    @InjectRepository(AchievementEntity)
    private AchievmentRepository: Repository<AchievementEntity>,
    private usersService: UsersService
  ) {}

  async createAchievement(user: UserEntity, achievement: Achievement) {
    await this.AchievmentRepository.save(
      this.AchievmentRepository.create({
        user: user,
        achievement,
      })
    );
  }

  async updateNumberOfGamesAchievements(user: UserEntity) {
    if (user.number_of_games == 10) {
      await this.createAchievement(user, Achievement.PLAY_10_TIMES);
    } else if (user.number_of_games == 25) {
      await this.createAchievement(user, Achievement.PLAY_25_TIMES);
    } else if (user.number_of_games == 50) {
      await this.createAchievement(user, Achievement.PLAY_50_TIMES);
    }
  }

  async updateLevelAchievements(user: UserEntity) {
    if (user.level == 10) {
      await this.createAchievement(user, Achievement.WIN_10_TIMES);
    } else if (user.level == 25) {
      await this.createAchievement(user, Achievement.WIN_25_TIMES);
    } else if (user.level == 50) {
      await this.createAchievement(user, Achievement.WIN_50_TIMES);
    } else if (user.level == 100) {
      await this.createAchievement(user, Achievement.EXPERT);
    }
  }

  async getAchievements(user_id: number): Promise<AchievementEntity[]> {
    const user = await this.usersService.findOneById(user_id);
    if (!user) {
      throw new InputException({
        user: "Player not found.",
      });
    }

    return await this.AchievmentRepository.createQueryBuilder("achievements")
      .take(10)
      .where("achievements.user = :userId", { userId: user.id })
      .select(['achievements.achievement as "achievement"'])
      .getRawMany();
  }
}
