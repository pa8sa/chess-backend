import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class SignupDto {
  @Field()
  username: string;

  @Field()
  password: string;
}
