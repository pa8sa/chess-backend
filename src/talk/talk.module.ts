import { Module } from '@nestjs/common';
import { TalkGateway } from './talk-gateway';
import { TalkService } from './talk.service';
import { UserModule } from 'src/user/user.module';
import { GameModule } from 'src/game/game.module';

@Module({
  providers: [TalkGateway, TalkService],
  imports: [UserModule, GameModule]
})
export class TalkModule {}
