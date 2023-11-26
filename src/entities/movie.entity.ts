import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';


@Entity()
export class Movie {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  // @Column()
  // releaseDate: number;

  // @Column()
  // lastModifiedBy: number;
}