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
  sansId: string;

  @Column()
  Seatnumber: string;

  @Column()
  isTaken: boolean;
}
