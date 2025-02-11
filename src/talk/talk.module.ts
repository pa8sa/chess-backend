import { Module } from '@nestjs/common';
import { TalkGateway } from './talk-gateway';
import { TalkService } from './talk.service';

@Module({
  providers: [TalkGateway, TalkService]
})
export class TalkModule {}
