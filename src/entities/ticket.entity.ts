import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Ticket {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  userId: string;

  @Column()
  userName: string;

  @Column()
  sansId: number;

  @Column()
  Seatnumber: number;

  @Column()
  isTaken: boolean;
}
