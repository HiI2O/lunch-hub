import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';

@Entity('password_reset_tokens')
export class PasswordResetTokenEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  user_id!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  token!: string;

  @Column({ type: 'timestamp' })
  expires_at!: Date;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;
}
