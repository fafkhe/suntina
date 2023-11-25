import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  PrimaryColumn,
} from 'typeorm';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ fulltext: true })
  @Column({
    default: '',
  })
  name: string;

  @PrimaryColumn({ name: 'email' })
  public email: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({
    default: false,
  })
  isMaster: boolean;
}
