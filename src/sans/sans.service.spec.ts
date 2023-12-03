import { Test, TestingModule } from '@nestjs/testing';
import { SansService } from './sans.service';

describe('SansService', () => {
  let service: SansService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SansService],
    }).compile();

    service = module.get<SansService>(SansService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
