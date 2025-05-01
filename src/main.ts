import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WinstonModule } from 'nest-winston';
import { winstonLogger } from './logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      instance: winstonLogger,
    })
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
