import { Test, TestingModule } from '@nestjs/testing';
import { TalkService } from './talk.service';

describe('TalkService', () => {
  let service: TalkService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TalkService],
    }).compile();

    service = module.get<TalkService>(TalkService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
