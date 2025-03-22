import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@ObjectType()
@Entity('games')
export class Game {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  whiteUsername: string;

  @Field()
  @Column()
  blackUsername: string;

  @Field()
  @Column()
  draw: boolean;

  @Field()
  @Column()
  whiteWins: boolean;

  @Field()
  @Column()
  pgn: string;
}
