import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TalkModule } from './talk/talk.module';

@Module({
  imports: [TalkModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
