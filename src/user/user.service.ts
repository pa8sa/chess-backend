import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findUserByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { username } });
  }

  async updateUsersGameResult(winnerUsername: string, losersUsername: string, isItDraw: boolean) {
    await this.usersRepository.increment({ username: winnerUsername }, 'gameCount', 1)
    await this.usersRepository.increment({ username: losersUsername }, 'gameCount', 1)
    if (isItDraw) {
      await this.usersRepository.increment({ username: winnerUsername }, 'gamesDrawn', 1)
      await this.usersRepository.increment({ username: losersUsername }, 'gamesDrawn', 1)
    } else {
      await this.usersRepository.increment({ username: winnerUsername }, 'gamesWon', 1)
      await this.usersRepository.increment({ username: losersUsername }, 'gamesLost', 1)
    }
  }
}
