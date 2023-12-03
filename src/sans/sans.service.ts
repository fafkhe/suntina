import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Sans } from 'src/entities/sans.entity';
import { Repository } from 'typeorm';
import { createSansDto } from './dtos/createSans.dto';

@Injectable()
export class SansService {
  constructor(@InjectRepository(Sans) private SansRepo: Repository<Sans>) {}

  async createSans(data: createSansDto) {
    const newSans = this.SansRepo.create({
      movieId: data.movieId,
      saloonId: data.saloonId,
      start: data.start,
      end: data.end,
    });

    await this.SansRepo.save(newSans);

    return newSans;
  }
}
