import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { SignupDto } from '../user/dto/signup.dto';
import { LoginDto } from '../user/dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Resolver()
export class AuthResolver {
  constructor(
    private usersService: AuthService,
    private jwtService: JwtService,
  ) {}

  @Query(() => String)
  sayHello(): string {
    return 'Hello from GraphQL!';
  }

  @Mutation(() => String)
  async signup(@Args('data') data: SignupDto) {
    const user = await this.usersService.create(data.username, data.password);
    return this.jwtService.sign({ username: user.username, sub: user.id });
  }

  @Mutation(() => String)
  async login(@Args('data') data: LoginDto) {
    const user = await this.usersService.findOne(data.username);
    if (!user || !(await bcrypt.compare(data.password, user.password))) {
      throw new Error('Invalid credentials');
    }
    return this.jwtService.sign({ username: user.username, sub: user.id });
  }
}
