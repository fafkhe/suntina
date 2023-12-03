import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Sans {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  movieId: string;

  @Column()
  saloonId: string;

  @Column()
  start: string;

  @Column()
  end: string;
}
