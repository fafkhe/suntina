import { BadRequestException, Injectable } from '@nestjs/common';
import { Saloon } from 'src/entities/saloon.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createSaloonDto } from './dtos/saloon.dto';
import { SaloonQueryDto } from './dtos/saloonQuery.dto';
import { EditSaloonDto } from './dtos/saloon.dto';

@Injectable()
export class SaloonService {
  constructor(
    @InjectRepository(Saloon) private saloonRepo: Repository<Saloon>,
  ) {}

  async createSaloon(data: createSaloonDto) {
    const existingSaloon = await this.saloonRepo.findOne({
      where: {
        name: data.name,
      },
    });

    if (existingSaloon)
      throw new BadRequestException('this saloon already exist!!');

    const newSaloon = this.saloonRepo.create({
      name: data.name,
      numOfSeat: data.numOfSeat,
      numOfseatPerRow: data.numOfseatPerRow,
    });
    await this.saloonRepo.save(newSaloon);

    return 'ok';
  }

  async editSaloon(data: EditSaloonDto) {
    const thisSaloon = await this.saloonRepo.findOne({
      where: {
        id: data.id,
      },
    });
    if (!thisSaloon) throw new BadRequestException('no such saloon found!');

    this.saloonRepo.save({ thisSaloon, ...data });

    return 'ok';
  }

  async AllSaloons(data: SaloonQueryDto) {
    const name = data.name || '';
    return this.saloonRepo.manager.query(
      'SELECT * FROM public.saloon WHERE LOWER(public.saloon.name) LIKE $1 OFFSET $2 ROWS FETCH NEXT $3 ROWS ONLY',
      [`%${name}%`, data.limit, data.page],
    );
  }

  async getSaloonById(id: string) {
    const thisSaloon = await this.saloonRepo.findOne({
      where: {
        id: id,
      },
    });

    if (!thisSaloon) {
      throw new BadRequestException('this saloon does not exist!');
    }

    return thisSaloon;
  }
}
