import { Socket } from "socket.io";

import { ForbiddenException, Injectable } from "@nestjs/common";
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
} from "@nestjs/websockets";

import { UserEntity } from "@/entities/user.entity";

import { MessageService } from "@/message/message.service";
import { SocketService } from "@/socket/socket.service";
import { AuthenticationService } from "@/authentication/authentication.service";
import { ConversationsService } from "@/conversations/conversations.service";
import { UsersService } from "@/users/users.service";
import { GamesService } from "@/games/games.service";

import { InputException } from "@/common/exception/input.exception";

import { JoinGameDto } from "./dto/join_game.dto";
import { LeaveGameDto } from "./dto/leave_game.dto";
import { PlayerMoveDto } from "./dto/player_move.dto";
import { BallMoveDto } from "./dto/ball_move.dto";
import { GameScoreDto } from "./dto/game_score.dto";
import { GameResetDto } from "./dto/game_reset.dto";

import { GatewayProfile } from "../profile/gateway.profile";
import { MessageEntity } from "@/entities/message.entity";
import { GameInvitationDto } from "./dto/game_invitation.dto";
import { ConnectionService } from "@/connections/connections.service";
import { GameEntity } from "@/entities/game.entity";

@Injectable()
export class GatewayGame extends GatewayProfile {
  constructor(
    public usersService: UsersService,
    public socketService: SocketService,
    public messageService: MessageService,
    public conversationsService: ConversationsService,
    public connectionService: ConnectionService,
    public authenticationService: AuthenticationService,
    public gamesService: GamesService
  ) {
    super(
      usersService,
      socketService,
      messageService,
      conversationsService,
      connectionService,
      authenticationService,
      gamesService
    );
  }

  async findGame(user: UserEntity, body: JoinGameDto) {
    if (body.game_id) {
      return await this.gamesService.findGameById(body.game_id, {
        relations: [
          "first_player",
          "first_player_socket",
          "second_player",
          "second_player_socket",
          "second_player_requested",
        ],
      });
    }

    const conversation =
      body.conversation_id &&
      (await this.conversationsService.findConversationById(
        body.conversation_id
      ));

    if (body.conversation_id && !conversation) return;

    const game = await this.gamesService.findGame(user, body.opponent_id);

    if (game.second_player_requested) {
      await this.emitGameInvitation(user, conversation, game);
    }

    return game;
  }

  async connectGame(socket: Socket, game: GameEntity) {
    await this.joinRoom(socket, `game_${game.id}`);
    return await this.gamesService.connectPlayer(socket.id, game);
  }

  @SubscribeMessage("join_game")
  async joinGame(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: JoinGameDto
  ) {
    const user = socket.data as UserEntity;
    if (!user) return;

    let game = await this.findGame(user, body);
    if (!game) {
      return await this.emitGameDeleted(body.game_id, socket.id);
    }

    const queuing = !body.game_id;
    const connected = await this.connectGame(socket, game);

    game = await this.findGame(user, { game_id: game.id });
    if (!game) {
      return await this.emitGameDeleted(body.game_id, socket.id);
    }

    const is_requested_player = game.second_player_requested_id == user.id;
    const is_created = game.created != null;
    const is_player_ready =
      (!game.first_player_socket && game.first_player.id != user.id) ||
      (game.first_player_socket &&
        game.first_player_socket.socket != socket.id);

    if (!is_requested_player && !is_created && is_player_ready) {
      return await this.emitGameDeleted(body.game_id, socket.id);
    }

    if (queuing) {
      return await this.emitGameQueuing(game, !game.second_player);
    }

    const current_joined = !queuing && connected ? undefined : socket.id;
    await this.emitGameJoined(game, current_joined);

    const current = !queuing && connected ? socket.id : undefined;
    await this.emitGameLive(game.id, current);
  }

  @SubscribeMessage("leave_game")
  async leaveGame(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: LeaveGameDto
  ) {
    const user = socket.data as UserEntity;
    if (!user) return;

    const game = await this.gamesService.finish(socket);
    if (game instanceof MessageEntity) {
      await this.leaveRoom(socket, `game_${game.game.id}`);
      await this.joinRoom(socket, `conversation_${game.conversation.id}`);
      await this.emitGameInvitationDeleted(game.conversation.id, game.game.id);
    }
    if (game) await this.emitGameLive(body.game_id);

    if (!body.conversation_id) {
      await this.leaveRoom(socket, `game_${body.game_id}`);
    }
  }

  @SubscribeMessage("player_move")
  async playerMove(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: PlayerMoveDto
  ) {
    const user = socket.data as UserEntity;
    if (!user) return;

    const player_key = await this.gamesService.getPlayerKey(
      body.game_id,
      socket.id
    );

    if (!player_key) return;

    await this.gamesService.setPlayerPosition(body.game_id, player_key, body.y);

    this.server
      .to(`game_${body.game_id}`)
      .except(socket.id)
      .emit(`${player_key}_move`, body.y);
  }

  @SubscribeMessage("ball_move")
  async ballMove(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: BallMoveDto
  ) {
    const user = socket.data as UserEntity;
    if (!user) return;

    await this.gamesService.setBallPosition(body.game_id, body.ball);

    this.server
      .to(`game_${body.game_id}`)
      .except(socket.id)
      .emit("ball_move", body.ball);
  }

  @SubscribeMessage("game_score")
  async gameScore(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: GameScoreDto
  ) {
    const user = socket.data as UserEntity;
    if (!user) return;

    const game = await this.gamesService.setPlayerScore(
      body.game_id,
      body.score
    );
    if (!game) return;

    this.server
      .to(`game_${body.game_id}`)
      .except(socket.id)
      .emit("first_player_score", body.score.first_player);

    this.server
      .to(`game_${body.game_id}`)
      .except(socket.id)
      .emit("second_player_score", body.score.second_player);

    if (game.finish) {
      this.server.to(`game_${body.game_id}`).emit("game_over", {
        first_player: game.first_player_status,
        second_player: game.second_player_status,
      });
    }
  }

  @SubscribeMessage("game_reset")
  async gameReset(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: GameResetDto
  ) {
    const user = socket.data as UserEntity;
    if (!user) return;

    await this.gamesService.reset(body.game_id, body);

    const position = await this.gamesService.getPlayerPosition(body.game_id);
    if (!position) return;

    this.server
      .to(`game_${body.game_id}`)
      .except(socket.id)
      .emit("game_reset", {
        first_player: position.first_player,
        second_player: position.second_player,
        ball: position.ball,
      });
  }

  @SubscribeMessage("game_invitation")
  async gameInvitation(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: GameInvitationDto
  ) {
    const user = socket.data as UserEntity;
    if (!user) return;

    let game = await this.gamesService.findGameById(body.game_id, {
      relations: ["second_player_requested"],
    });
    if (!game) return;

    const requested_player = game.second_player_requested;
    if (!requested_player) return;
    if (requested_player.id != user.id) return;

    const message = await this.messageService.findMessageByGame(game);
    if (!message) return;

    if (body.response == "refuse") {
      await this.gamesService.deleteGame(game);

      return await this.emitGameInvitationDeleted(
        message.conversation.id,
        message.game.id
      );
    }

    game = await this.gamesService.joinGame(game.id, user);

    await this.joinRoom(socket, `game_${game.id}`);

    await this.gamesService.connectPlayer(socket.id, game);
    await this.emitGameQueuing(game, false);
    await this.emitGameStarted(message.conversation.id, game.id);
  }
}
