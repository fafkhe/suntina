import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Saloon {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  numOfSeat: number;

  @Column()
  numOfseatPerRow: number;
}
