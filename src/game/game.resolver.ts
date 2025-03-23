import { Args, Query, Resolver } from '@nestjs/graphql';
import { GameService } from './game.service';
import { Game } from './game.entity';

@Resolver()
export class GameResolver {
  constructor(
    private gameService: GameService
  ) {}

  @Query(() => [Game])
  async getGamesByUsername(@Args('data') data: string) {
    return await this.gameService.findAllGamesByUsername(data);
  }
}
