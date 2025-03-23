import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Game } from './game.entity';
import { Repository } from 'typeorm';

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(Game)
    private gameRepository: Repository<Game>
  ) {}

  async createGame(whiteUsername: string, blackUsername: string, draw: boolean, whiteWins: boolean, pgn: string): Promise<Game | null> {
    const game = this.gameRepository.create({ whiteUsername, blackUsername, draw, whiteWins, pgn })
    return this.gameRepository.save(game)
  }

  async findAllGamesByUsername(username: string): Promise<Game[] | null> {
    return await this.gameRepository.find({ where: [ { whiteUsername: username }, { blackUsername: username } ] })
  }
}
