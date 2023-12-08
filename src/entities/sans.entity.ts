import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Sans {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  movie_id: number;

  @Column()
  saloon_id: number;

  @Column({ type: 'timestamptz' }) 
  start_t: Date;

  @Column({ type: 'timestamptz' }) 
  end_t: Date;
}
