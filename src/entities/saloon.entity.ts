import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Saloon {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  numOfSeat: number;

  @Column()
  numOfseatPerRow: number;
}
