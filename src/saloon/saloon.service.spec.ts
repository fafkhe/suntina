import { Test, TestingModule } from '@nestjs/testing';
import { SaloonService } from './saloon.service';

describe('SaloonService', () => {
  let service: SaloonService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SaloonService],
    }).compile();

    service = module.get<SaloonService>(SaloonService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
