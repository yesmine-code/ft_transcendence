import { FindOneOptions, IsNull, Not, Repository } from "typeorm";

import { ForbiddenException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { InputException } from "@/common/exception/input.exception";

import { GameEntity } from "@/entities/game.entity";
import { UserEntity } from "@/entities/user.entity";
import { PlayerStatus } from "@/entities/game.utils";

import { UsersService } from "@/users/users.service";
import { SocketService } from "@/socket/socket.service";
import { MessageService } from "@/message/message.service";
import { Socket } from "socket.io";
import { AchievementsService } from "@/achievements/achievements.service";

interface Ball {
  x: number;
  y: number;
  speed: {
    x: number;
    y: number;
  };
}

interface Players {
  first_player: number;
  second_player: number;
}

interface Game extends Partial<Players> {
  process?: () => Promise<void>;
  ball?: Ball;
}

type Games = Record<number, Game>;

let games = ((store: Games) => {
  return (id: number) => {
    return {
      set first_player_position(y: number) {
        const current = store[id] || {};

        store[id] = {
          ...current,
          first_player: y,
        };
      },
      set second_player_position(y: number) {
        const current = store[id] || {};

        store[id] = {
          ...current,
          second_player: y,
        };
      },
      set ball(ball: Ball | undefined) {
        if (!ball) return;

        store[id] = {
          ...(store[id] || {}),
          ball,
        };
      },
      async setProcess(process?: () => Promise<void>) {
        store[id] = {
          ...(store[id] || {}),
          process,
        };

        if (process) await process();
      },
      get data() {
        return store[id];
      },
    };
  };
})([]);

@Injectable()
export class GamesService {
  constructor(
    @InjectRepository(GameEntity)
    private gameRepository: Repository<GameEntity>,

    private usersService: UsersService,
    private achievementsService: AchievementsService,
    private messageService: MessageService,
    private socketService: SocketService
  ) {}

  async setGame(source: UserEntity, target?: UserEntity): Promise<GameEntity> {
    if (target && source.id === target.id) {
      throw new InputException({
        user: "Deplicated player.",
      });
    }

    return await this.gameRepository.save(
      this.gameRepository.create({
        first_player: source,
        second_player_requested: target,
        created: null,
        start: null,
        finish: null,
      })
    );
  }

  async findGameById(id: number, options?: FindOneOptions<GameEntity>) {
    return await this.gameRepository.findOne({
      where: {
        id,
      },
      ...(options || {}),
    });
  }

  async findGameBySocket(socket_id: string) {
    const query = await this.gameRepository
      .createQueryBuilder("games")
      .leftJoinAndSelect("games.first_player_socket", "first_player_socket")
      .leftJoinAndSelect("games.second_player_socket", "second_player_socket")
      .select(["games.id as id"])
      .where(
        "(first_player_socket.socket = :socketID OR second_player_socket.socket = :socketID)",
        {
          socketID: socket_id,
        }
      )
      .getRawOne();
    if (!query) return null;

    return await this.gameRepository.findOne({
      relations: [
        "first_player",
        "first_player_socket",
        "second_player",
        "second_player_socket",
      ],
      where: {
        id: query.id,
      },
    });
  }

  async deleteGame(game: GameEntity | number) {
    return await this.gameRepository
      .createQueryBuilder("games")
      .delete()
      .from(GameEntity)
      .where("id = :gameId", {
        gameId: typeof game == "number" ? game : game.id,
      })
      .execute();
  }

  async history(user_id: number, last?: number): Promise<GameEntity[]> {
    const query = this.gameRepository
      .createQueryBuilder("games")
      .leftJoinAndSelect("games.first_player", "first_player")
      .leftJoinAndSelect("games.second_player", "second_player")
      .where("(first_player.id = :playerId OR second_player.id = :playerId)", {
        playerId: user_id,
      })
      .andWhere("games.finish IS NOT NULL")
      .select([
        "json_build_object( \
					'id', first_player.id, \
					'username', first_player.username, \
					'display_name', first_player.display_name, \
					'score', games.first_player_score, \
					'status', games.first_player_status \
				) as first_player",
        "json_build_object( \
					'id', second_player.id, \
					'username', second_player.username, \
					'display_name', second_player.display_name, \
					'score', games.second_player_score, \
					'status', games.second_player_status \
				) as second_player",
        "games.finish as finish",
        "games.id as id",
      ])
      .addOrderBy("games.id", "DESC")
      .limit(20);

    if (last && last > 0) query.andWhere("games.id < :last", { last });

    return await query.getRawMany();
  }

  async levels(user_id: number): Promise<number[]> {
    const user = await this.usersService.findOneById(user_id);
    if (!user) return null;

    return (
      (await this.gameRepository
        .createQueryBuilder("games")
        .addOrderBy("games.id", "ASC")
        .select([`public.levels(games.id, ${user.id}) as level`])
        .getRawMany()) || []
    ).map((game) => game.level);
  }

  async getPlayerKey(game_id: number, socket_id: string) {
    const game = await this.findGameById(game_id, {
      relations: [
        "first_player",
        "first_player_socket",
        "second_player",
        "second_player_socket",
        "second_player_requested",
      ],
    });
    if (!game) throw new ForbiddenException();

    const first_player =
      game.first_player_socket && game.first_player_socket.socket == socket_id;
    const second_player =
      game.second_player_socket &&
      game.second_player_socket.socket == socket_id;

    if (!first_player && !second_player) return null;

    return first_player ? "first_player" : "second_player";
  }

  async queueGame(source: UserEntity): Promise<GameEntity> {
    const queue = await this.gameRepository.findOne({
      where: [
        {
          first_player_id: Not(source.id),
          second_player_id: IsNull(),
          second_player_requested_id: IsNull(),
        },
        {
          first_player_id: Not(source.id),
          second_player_id: IsNull(),
          second_player_requested_id: source.id,
        },
      ],
      relations: [
        "first_player",
        "first_player_socket",
        "second_player",
        "second_player_socket",
        "second_player_requested",
      ],
    });

    if (!queue) return queue;

    const game = await this.findGameById(queue.id, {
      relations: [
        "first_player",
        "first_player_socket",
        "second_player",
        "second_player_socket",
        "second_player_requested",
      ],
    });
    game.first_player = queue.first_player;
    game.second_player = source;
    return await this.gameRepository.save(game);
  }

  async connectPlayer(socketId: string, game: GameEntity) {
    const socket = await this.socketService.findSocketById(socketId, {
      relations: ["source"],
    });
    if (!socket || game.start) return false;

    const first_player = game.first_player_id == socket.source.id;
    const second_player = game.second_player_id == socket.source.id;

    let player: "first_player" | "second_player" = null;
    if (first_player) player = "first_player";
    else if (second_player) player = "second_player";
    if (!player) return false;

    const current = games(game.id);
    current[`${player}_position`] = 250;

    game[`${player}_socket`] = socket;
    if (player == "second_player") game.created = new Date();
    await this.gameRepository.save(game);
    return true;
  }

  async joinGame(game_id: number, user: UserEntity) {
    const game = await this.findGameById(game_id, {
      relations: [
        "first_player",
        "first_player_socket",
        "second_player",
        "second_player_socket",
        "second_player_requested",
      ],
    });

    if (!game) return null;
    if (!game.first_player) return null;
    if (game.created) return null;

    game.second_player = await this.usersService.findOneById(user.id);
    return await this.gameRepository.save(game);
  }

  async findGame(
    source: UserEntity,
    target?: UserEntity | number
  ): Promise<GameEntity> {
    if (typeof target == "number")
      target = await this.usersService.findOneById(target);

    if (source && target) return await this.setGame(source, target);

    const queue = await this.queueGame(source);
    if (queue) return queue;

    return await this.setGame(source, target);
  }

  async updateLevel(user: UserEntity) {
    user.level++;
    await this.usersService.updateLevel(user.id, user.level);

    await this.achievementsService.updateLevelAchievements(user);
  }

  async updateNumberOfGames(user: UserEntity) {
    user.number_of_games++;
    await this.usersService.updateNumberOfGames(user.id, user.number_of_games);
    await this.achievementsService.updateNumberOfGamesAchievements(user);
  }

  async finish(socket: Socket) {
    const game = await this.findGameBySocket(socket.id);
    if (!game) return null;

    if (!game.created) {
      const message = await this.messageService.findMessageByGame(game);
      if (message) {
        message.game = await this.findGameById(game.id, {
          relations: [
            "first_player",
            "first_player_socket",
            "second_player",
            "second_player_socket",
            "second_player_requested",
          ],
        });
      }

      await this.deleteGame(game);
      return message;
    }

    const first_player =
      game.first_player_socket && game.first_player_socket.socket == socket.id;

    const second_player =
      game.second_player_socket &&
      game.second_player_socket.socket == socket.id;

    if (!first_player && !second_player) {
      console.log("WE ARE HERE 1...");
      return null;
    }

    console.log("WE ARE HERE 2...");

    if (first_player) {
      game.first_player_socket = null;
      if (!game.finish) {
        game.finish = new Date();
        await this.updateNumberOfGames(game.first_player);
        await this.updateNumberOfGames(game.second_player);
        await this.updateLevel(game.second_player);
        game.first_player_status = PlayerStatus.GAVE_UP;
        game.second_player_status = PlayerStatus.WIN;
      }
    } else if (second_player) {
      game.second_player_socket = null;
      if (!game.finish) {
        game.finish = new Date();
        await this.updateNumberOfGames(game.first_player);
        await this.updateNumberOfGames(game.second_player);
        await this.updateLevel(game.first_player);
        game.first_player_status = PlayerStatus.WIN;
        game.second_player_status = PlayerStatus.GAVE_UP;
      }
    }

    return await this.gameRepository.save(game);
  }

  async setPlayerPosition(
    game_id: number,
    key: "first_player" | "second_player",
    y: number
  ) {
    const current = games(game_id);
    current[`${key}_position`] = y;
  }

  async setPlayerScore(
    game_id: number,
    score: { first_player: number; second_player: number }
  ) {
    const game = await this.findGameById(game_id, {
      relations: [
        "first_player",
        "first_player_socket",
        "second_player",
        "second_player_socket",
        "second_player_requested",
      ],
    });
    if (!game) return null;

    game.first_player_score = score.first_player;
    game.second_player_score = score.second_player;

    if (
      score.first_player >= 11 &&
      score.first_player - score.second_player >= 2
    ) {
      game.finish = new Date();
      await this.updateNumberOfGames(game.first_player);
      await this.updateNumberOfGames(game.second_player);
      await this.updateLevel(game.first_player);
      game.first_player_status = PlayerStatus.WIN;
      game.second_player_status = PlayerStatus.LOOSE;
    }

    if (
      score.second_player >= 11 &&
      score.second_player - score.first_player >= 2
    ) {
      game.finish = new Date();
      await this.updateNumberOfGames(game.first_player);
      await this.updateNumberOfGames(game.second_player);
      await this.updateLevel(game.second_player);
      game.first_player_status = PlayerStatus.LOOSE;
      game.second_player_status = PlayerStatus.WIN;
    }

    return await this.gameRepository.save(game);
  }

  async setBallPosition(game_id: number, ball: Ball) {
    const current = games(game_id);
    current.ball = ball;
  }

  async getPlayerPosition(game_id: number) {
    return games(game_id).data;
  }

  async reset(game_id: number, body: { ball: Ball; players: Players }) {
    const current = games(game_id);
    current.ball = body.ball;
    current.first_player_position = body.players.first_player;
    current.second_player_position = body.players.second_player;
  }

  async setProcess(game_id: number) {
    games(game_id).setProcess(undefined);
  }

  async getProcess(
    game_id: number,
    callback?: (status: string) => Promise<void>
  ) {
    const current = games(game_id);

    if (!current.data || !current.data.process) {
      current.setProcess(async () => {
        for (let timer = 3; timer >= 0; timer--) {
          const game = await this.findGameById(game_id);
          if (game && game.finish) {
            current.setProcess(undefined);
            game.start = new Date();
            game.finish = new Date();

            await this.gameRepository.save(game);
            return;
          }

          await callback(`${!timer ? "GO!" : `${timer}`}`);
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        current.setProcess(undefined);

        const game = await this.findGameById(game_id);
        if (!game) return;

        game.start = new Date();

        await this.gameRepository.save(game);
      });
    }
  }

  async getBallPosition(game_id: number) {
    return games(game_id).data.ball;
  }
}
