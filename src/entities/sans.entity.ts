import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Sans {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  movieId: string;

  @Column()
  saloonid: number;

  @Column({ type: 'timestamptz' })
  start: Date;

  @Column({ type: 'timestamptz' })
  end: Date;
}
