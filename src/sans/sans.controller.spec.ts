import { Test, TestingModule } from '@nestjs/testing';
import { SansController } from './sans.controller';

describe('SansController', () => {
  let controller: SansController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SansController],
    }).compile();

    controller = module.get<SansController>(SansController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
