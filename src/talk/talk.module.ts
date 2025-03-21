import { Module } from '@nestjs/common';
import { TalkGateway } from './talk-gateway';
import { TalkService } from './talk.service';
import { UserModule } from 'src/user/user.module';

@Module({
  providers: [TalkGateway, TalkService],
  imports: [UserModule]
})
export class TalkModule {}
