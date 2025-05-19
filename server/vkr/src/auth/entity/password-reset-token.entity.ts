import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index, 
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entity/user.entity'; 

@Entity('password_reset_tokens')
@Index(['userId', 'token', 'isValid']) // для быстрого поиска активных токенов пользователя
export class PasswordResetToken {
  @PrimaryGeneratedColumn() 
  id: number;

  @Column({ name: 'user_id', type: 'bigint' }) 
  userId: number; 

  @Column({ type: 'character varying', length: 4 }) 
  token: string;

  @Column({ name: 'expires_at', type: 'timestamp with time zone' }) 
  expiresAt: Date; 

  @Column({ name: 'is_valid', type: 'boolean', default: true })
  isValid: boolean; 

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' }) 
  createdAt: Date;
 
  @ManyToOne(() => User, (user) => user.passwordResetTokens)
  @JoinColumn({ name: 'userId', referencedColumnName: 'userId' }) 
  user: User;
}