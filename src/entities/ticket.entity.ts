import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Ticket {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  user_id: string;

  @Column()
  user_name: string;

  @Column()
  sans_id: number;

  @Column()
  seatnumber: number;

  @Column()
  is_taken: boolean;
}
