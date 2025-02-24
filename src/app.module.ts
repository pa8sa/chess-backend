import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TalkModule } from './talk/talk.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { User } from './user/user.entity';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({ driver: ApolloDriver, autoSchemaFile: true }),
    TypeOrmModule.forRoot({ type: 'postgres', host: 'localhost', port: 5432, username: 'postgres', password: 'pa8sa1016', database: 'chess', entities: [User], synchronize: true }),
    TalkModule, 
    UserModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
