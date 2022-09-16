import * as cookie from "cookie";
import { Socket, Server } from "socket.io";

import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UseFilters,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";

import { UserEntity } from "@/entities/user.entity";
import { GameEntity } from "@/entities/game.entity";
import { ConversationEntity } from "@/entities/conversation.entity";
import { ConversationRole } from "@/entities/conversation_members.utils";

import { WsExceptionFilter } from "@/common/filters/wsexception.filter";
import { InputException } from "@/common/exception/input.exception";

import { AuthenticationService } from "@/authentication/authentication.service";
import { ConversationsService } from "@/conversations/conversations.service";
import { MessageService } from "@/message/message.service";
import { SocketService } from "@/socket/socket.service";
import { UsersService } from "@/users/users.service";
import { GamesService } from "@/games/games.service";
import { FindOneOptions } from "typeorm";
import { MessageEntity } from "@/entities/message.entity";
import { ConnectionService } from "@/connections/connections.service";
import { ConversationVisibility } from "@/entities/conversation.utils";

@Injectable()
@UseFilters(WsExceptionFilter)
@WebSocketGateway({
  cors: {
    origin: "*",
  },
})
@UsePipes(
  new ValidationPipe({
    whitelist: true,
    transform: true,
    stopAtFirstError: true,
    exceptionFactory: (errors) => {
      return new InputException(
        errors[0].children.reduce(
          (a, v) => ({ ...a, [v.property]: Object.values(v.constraints)[0] }),
          {}
        )
      );
    },
  })
)
export class GatewaySocket
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  constructor(
    public usersService: UsersService,
    public socketService: SocketService,
    public messageService: MessageService,
    public conversationsService: ConversationsService,
    public connectionService: ConnectionService,
    public authenticationService: AuthenticationService,
    public gamesService: GamesService
  ) {}

  @WebSocketServer()
  server: Server;

  async afterInit() {
    await this.socketService.clear();
  }

  async handleConnection(@ConnectedSocket() socket: Socket) {
    try {
      const access_token = cookie.parse(
        socket.handshake.headers.cookie
      ).access_token;
      if (!access_token) {
        throw new BadRequestException();
      }

      const user = await this.authenticationService.verifyAccessToken(
        access_token
      );
      if (!user) {
        throw new BadRequestException();
      }

      socket.data = user;

      await this.handleStatus(socket, "connect");
    } catch {
      socket.disconnect();
    }
  }

  async handleDisconnect(@ConnectedSocket() socket: Socket) {
    const user = socket.data as UserEntity;
    if (!user) throw new ForbiddenException();

    await this.handleStatus(socket, "disconnect");
  }

  async handleStatus(socket: Socket, event: "connect" | "disconnect") {
    const user = socket.data as UserEntity;
    if (!user) throw new ForbiddenException();

    const source = event == "connect" ? user : undefined;

    const game = await this.gamesService.finish(socket);
    if (game) await this.emitGameLive(game.id);

    await this.socketService.setSocket(socket.id, source);
    await this.updateStatus(user);
    this.server.to(socket.id).emit(`${event}ed`);
  }

  async updateStatus(user: UserEntity) {
    const status = await this.usersService.updateStatus(user);
    this.server.to(`profile_${user.id}`).emit("profile_data", { status });
  }

  async joinRoom(socket: Socket, room: string) {
    const user = socket.data as UserEntity;
    if (!user) return;

    await this.socketService.setRoom(socket.id, room);
    await this.updateStatus(user);
    await socket.join(room);
  }

  async leaveRoom(socket: Socket, room: string) {
    const user = socket.data as UserEntity;
    if (!user) return;

    await this.socketService.setRoom(socket.id);
    await this.updateStatus(user);
    socket.leave(room);
  }

  async getConversation(
    conversation_id: number,
    user_id?: number,
    roles?: ConversationRole[]
  ) {
    const conversation = await this.conversationsService.findConversationById(
      conversation_id
    );
    if (!conversation) throw new NotFoundException();

    if (roles && user_id) {
      const role = await this.conversationsService.getRole(
        conversation,
        user_id
      );
      if (!(role && roles.includes(role))) throw new ForbiddenException();
    }

    return conversation;
  }

  async emitGameQueuing(game: GameEntity, queuing: boolean) {
    this.server.to(`game_${game.id}`).emit("game_queuing", {
      game_id: game.id,
      queuing,
    });
  }

  async emitGameDeleted(game_id: number, socket?: string) {
    this.server
      .to(socket || `game_${game_id}`)
      .emit("game_deleted", { id: game_id });
  }

  async emitGameJoined(game: GameEntity, socket?: string) {
    const players = await this.gamesService.findGameById(game.id, {
      relations: [
        "first_player",
        "first_player_socket",
        "second_player",
        "second_player_socket",
        "second_player_requested",
      ],
    });
    if (!players) throw new NotFoundException();

    const first_player = players.first_player;
    const second_player = players.second_player;
    const is_reset_required =
      socket &&
      players.first_player_socket &&
      socket == players.first_player_socket.socket;

    (await this.server.to(socket || `game_${game.id}`).fetchSockets()).map(
      (item) => {
        const is_first_player =
          players.first_player_socket &&
          item.id == players.first_player_socket.socket;

        const is_second_player =
          players.second_player_socket &&
          item.id == players.second_player_socket.socket;

        item.emit("game_joined", {
          game_id: players.id,
          is_reset_required,
          start: players.start,
          finish: players.finish,
          is_engine: is_first_player,
          is_player: is_first_player || is_second_player,
          map: first_player && first_player.map,
          first_player: (first_player || undefined) && {
            id: first_player.id,
            display_name: first_player.display_name,
            username: first_player.username,
            avatar: `/users/avatar/${first_player.id}/${first_player.avatar}`,
            score: players.first_player_score,
            y: 250,
          },
          second_player: (second_player || undefined) && {
            id: second_player.id,
            display_name: second_player.display_name,
            username: second_player.username,
            avatar: `/users/avatar/${second_player.id}/${second_player.avatar}`,
            score: players.second_player_score,
            y: 250,
          },
        });
      }
    );
  }

  async emitGameInvitation(
    user: UserEntity,
    conversation: ConversationEntity,
    game: GameEntity
  ) {
    const targets = [game.first_player.id, game.second_player_requested.id];
    if (!targets) return;

    const message = await this.messageService.setMessage(
      user,
      conversation,
      game
    );
    if (!message) return;

    const author = message.author;
    const target = message.game.second_player_requested;

    this.server.to(`conversation_${conversation.id}`).emit("message", {
      author: {
        id: author.id,
        display_name: author.display_name,
        username: author.username,
        avatar: `/users/avatar/${author.id}/${author.avatar}`,
      },
      game: {
        id: message.game.id,
        target: {
          id: target.id,
          display_name: target.display_name,
          username: target.username,
          avatar: `/users/avatar/${target.id}/${target.avatar}`,
        },
      },
      date: message.date,
      id: message.id,
    });
  }

  async emitGameInvitationDeleted(conversation_id: number, game_id: number) {
    this.server
      .to(`conversation_${conversation_id}`)
      .emit("game_deleted", { id: game_id });
    this.server.to(`game_${game_id}`).emit("game_deleted", { id: game_id });
  }

  async emitGameStarted(conversation_id: number, game_id: number) {
    const game = await this.gamesService.findGameById(game_id);
    if (!game || !game.created) return;

    this.server
      .to(`conversation_${conversation_id}`)
      .emit("game_started", { id: game.id, created: game.created });
  }

  async emitGameScore(game: GameEntity, socket?: string) {
    const players = await this.gamesService.findGameById(game.id, {
      relations: [
        "first_player",
        "first_player_socket",
        "second_player",
        "second_player_socket",
        "second_player_requested",
      ],
    });
    if (!players) throw new NotFoundException();

    this.server
      .to(socket || `game_${players.id}`)
      .emit("first_player_score", players.first_player_score);

    this.server
      .to(socket || `game_${players.id}`)
      .emit("second_player_score", players.second_player_score);

    if (players.finish) {
      this.server.to(socket || `game_${players.id}`).emit("game_live", {
        status: "Game over",
        players: {
          first_player: players.first_player_status,
          second_player: players.second_player_status,
        },
      });
    }
  }

  async emitGamePosition(game_id: number, socket?: string) {
    const game = await this.gamesService.findGameById(game_id, {
      relations: [
        "first_player",
        "first_player_socket",
        "second_player",
        "second_player_socket",
        "second_player_requested",
      ],
    });
    if (!game) return;

    const position = await this.gamesService.getPlayerPosition(game_id);
    if (!position) return;

    this.server
      .to(socket || `game_${game.id}`)
      .emit("first_player_move", position.first_player);

    this.server
      .to(socket || `game_${game.id}`)
      .emit("second_player_move", position.second_player);
  }

  async emitGameBall(game_id: number) {
    const ball = await this.gamesService.getBallPosition(game_id);
    if (!ball) return;

    this.server.to(`game_${game_id}`).emit("ball_move", ball);
  }

  async emitGameLive(game_id: number, socket?: string) {
    const game = await this.gamesService.findGameById(game_id, {
      relations: [
        "first_player",
        "first_player_socket",
        "second_player",
        "second_player_socket",
        "second_player_requested",
      ],
    });
    if (!game) return;

    if (game.finish) {
      this.gamesService.setProcess(undefined);
      if (socket) {
        return this.server.to(socket).emit("game_over", {
          first_player: game.first_player_status,
          second_player: game.second_player_status,
        });
      } else {
        return this.server
          .to(`game_${game.id}`)
          .except(socket)
          .emit("game_over", {
            first_player: game.first_player_status,
            second_player: game.second_player_status,
          });
      }
    }

    if (!game.start && game.first_player_socket && game.second_player_socket) {
      return await this.gamesService.getProcess(
        game.id,
        async (status: string) => {
          this.server.to(`game_${game_id}`).emit("game_live", { status });
        }
      );
    }
  }

  async emitConversationData(conversation: ConversationEntity) {
    const members = await this.conversationsService.getMembers(conversation);

    const data = {
      name: conversation.name,
      visibility: conversation.visibility,
      members,
    };

    (
      await this.server.to(`conversation_${conversation.id}`).fetchSockets()
    ).map(async (item) => {
      const current = item.data as UserEntity;
      let role = undefined;

      if (current) {
        const member = members.filter((member) => member.id == current.id);
        if (member.length > 0)
          role = member.length > 0 ? member[0].role : undefined;
      }

      const blocked = (await this.connectionService.blocked(current)).map(
        (block) => block.target.id
      );

      if (role == ConversationRole.BANNED) {
        return item.emit("conversation_data", {
          name: data.name,
          visibility: data.visibility,
          is_banned: true,
        });
      }

      const filtered_members = data.members.map((member) => {
        const is_blocked = blocked.includes(member.id);
        if (!is_blocked) return member;

        return {
          ...member,
          action: "none",
          status: "NONE",
        };
      });

      item.emit("conversation_data", {
        ...data,
        ...(role ? { role } : {}),
        members: filtered_members,
      });
    });
  }

  async emitSearch(query: string, conversation: ConversationEntity) {
    const members = await this.conversationsService.searchInvitableUsers(
      conversation,
      query
    );

    this.server
      .to(`conversation_${conversation.id}`)
      .emit("conversation_invitable", members);
  }

  async emitConversationInvitation(
    user_id: number,
    conversation: ConversationEntity
  ) {
    const user = await this.usersService.findOneById(user_id);
    if (!user) throw new ForbiddenException();

    await this.conversationsService.setMember(
      conversation,
      user,
      ConversationRole.PENDING
    );

    await this.emitConversationData(conversation);
  }

  async emitConversationMessage(
    conversation: ConversationEntity,
    user: UserEntity,
    message: string
  ) {
    const data = await this.messageService.setMessage(
      user,
      conversation,
      message
    );
    if (!data) return;

    (
      await this.server.to(`conversation_${conversation.id}`).fetchSockets()
    ).map(async (item) => {
      const current = item.data as UserEntity;

      const blocked = (await this.connectionService.blocked(current)).map(
        (block) => block.target.id
      );

      if (blocked.includes(data.author.id)) return;

      item.emit("message", {
        author: {
          id: data.author.id,
          display_name: data.author.display_name,
          username: data.author.username,
          avatar: `/users/avatar/${data.author.id}/${data.author.avatar}`,
        },
        date: data.date,
        value: data.value,
        id: data.id,
      });
    });
  }
}
