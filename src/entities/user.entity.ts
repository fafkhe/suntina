import { Entity, Column, PrimaryGeneratedColumn, Index, Check } from 'typeorm';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

@Entity()
// @Check('"balance">=0')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ fulltext: true })
  @Column({
    default: '',
  })
  name: string;

  @Column({ unique: true })
  email: string;

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

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  balance: number;
}
