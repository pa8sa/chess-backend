import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@ObjectType()
@Entity('users')
export class User {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ unique: true })
  username: string;

  @Field()
  @Column()
  password: string;

  @Field()
  @Column({ default: 0 })
  gameCount: number

  @Field()
  @Column({ default: 0 })
  gamesWon: number

  @Field()
  @Column({ default: 0 })
  gamesLost: number

  @Field()
  @Column({ default: 0 })
  gamesDrawn: number
}
