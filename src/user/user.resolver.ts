import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User } from './user.entity';

@Resolver()
export class UserResolver {
  constructor (
    private userService: UserService,
  ) {}

  @Query(() => User)
  async getUserByUsername(@Args('data') data: string) {
    return await this.userService.findUserByUsername(data);
  }
}
