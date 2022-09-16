import { Repository } from "typeorm";

import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { MessageEntity } from "@/entities/message.entity";
import { UserEntity } from "@/entities/user.entity";
import { ConversationEntity } from "@/entities/conversation.entity";
import { GameEntity } from "@/entities/game.entity";

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(MessageEntity)
    private messagesRepository: Repository<MessageEntity>
  ) {}

  /**
   * Adding a message.
   * @param author Author data.
   * @param conversation Conversation data.
   * @param value Message.
   * @returns
   */
  async setMessage(
    author: UserEntity,
    conversation: ConversationEntity,
    value: string | GameEntity
  ): Promise<MessageEntity> {
    const message = this.messagesRepository.create({
      author,
      conversation,
      value: typeof value == "string" ? value : null,
      game: value instanceof GameEntity ? value : null,
    });

    return await this.messagesRepository.save(message);
  }

  async getMessages(
    conversation: ConversationEntity | number,
    user_id: number,
    last?: number
  ): Promise<MessageEntity[]> {
    const query = this.messagesRepository
      .createQueryBuilder("messages")
      .leftJoinAndSelect("messages.author", "author")
      .leftJoinAndSelect("messages.game", "game")
      .leftJoinAndSelect(
        "game.second_player_requested",
        "second_player_requested"
      )
      .where("messages.conversation = :conversationId", {
        conversationId:
          typeof conversation == "number" ? conversation : conversation.id,
      })
      .andWhere(
        '(SELECT NOT EXISTS (SELECT 1 FROM connections WHERE "sourceId" = :userId AND "targetId" = author.id AND type = 3))',
        {
          userId: user_id,
        }
      )
      .select([
        "json_build_object( \
					'id', author.id, \
					'username', author.username, \
					'display_name', author.display_name, \
					'avatar', concat('/users/avatar/', author.id, '/', author.avatar) \
				) as author",
        "(case \
	   	when game.id IS NULL then NULL \
		else json_build_object( \
			'id', game.id, \
			'created', game.created, \
			'target', json_build_object( \
				'id', second_player_requested.id, \
				'username', second_player_requested.username, \
				'display_name', second_player_requested.display_name, \
				'avatar', concat('/users/avatar/', second_player_requested.id, '/', second_player_requested.avatar) \
			) \
		) \
		end) as game",
        'messages.id as "id"',
        'messages.value as "value"',
        'messages.date as "date"',
      ])
      .addOrderBy("id", "DESC")
      .limit(20);

    if (last && last > 0) query.andWhere("messages.id < :last", { last });

    return await query.getRawMany();
  }

  async findMessageByGame(game: GameEntity) {
    return await this.messagesRepository.findOne({
      where: {
        game_id: game.id,
      },
      relations: ["game", "conversation", "author"],
    });
  }
}
