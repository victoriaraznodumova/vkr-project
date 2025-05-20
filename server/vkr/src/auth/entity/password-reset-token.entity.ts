// import {
//   Entity,
//   PrimaryGeneratedColumn,
//   Column,
//   ManyToOne,
//   JoinColumn,
//   Index, 
//   CreateDateColumn,
// } from 'typeorm';
// import { User } from '../../users/entity/user.entity'; 

// @Entity('password_reset_tokens')
// @Index(['userId', 'token', 'isValid']) // для быстрого поиска активных токенов пользователя
// export class PasswordResetToken {
//   @PrimaryGeneratedColumn() 
//   id: number;

//   @Column({ name: 'user_id', type: 'bigint' }) 
//   userId: number; 

//   @Column({ type: 'character varying', length: 4 }) 
//   token: string;

//   @Column({ name: 'expires_at', type: 'timestamp with time zone' }) 
//   expiresAt: Date; 

//   @Column({ name: 'is_valid', type: 'boolean', default: true })
//   isValid: boolean; 

//   @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' }) 
//   createdAt: Date;
 
//   @ManyToOne(() => User, (user) => user.passwordResetTokens)
//   @JoinColumn({ name: 'userId', referencedColumnName: 'userId' }) 
//   user: User;
// }




// src/auth/entity/password-reset-token.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entity/user.entity'; // Убедитесь, что путь к User сущности правильный

@Entity('password_reset_tokens')
export class PasswordResetToken {
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * Уникальный токен/код сброса.
   * В случае 4-значного кода, возможно, стоит подумать о стратегии генерации,
   * чтобы минимизировать коллизии, хотя при коротком сроке действия это менее критично.
   */
  @Column({ unique: true, type: 'character varying', length: 6 }) // Изменена длина на 6
  token: string;

  /**
   * Дата и время истечения срока действия токена.
   */
  @Column({ name: 'expires_at' })
  expiresAt: Date;

  /**
   * Флаг, указывающий, активен ли токен (еще не использован и не истек).
   * Явно указываем имя столбца в базе данных 'is_valid'.
   */
  @Column({ default: true, name: 'is_valid' }) // Явно указываем имя столбца в БД
  isValid: boolean; // Свойство в сущности

  /**
   * Дата и время создания токена.
   */
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  /**
   * ID пользователя, связанного с этим токеном.
   * Мы явно указываем имя столбца в базе данных 'user_id'.
   */
  @Column({ name: 'user_id' }) // Явно указываем имя столбца в БД
  userId: number; // Свойство в сущности

  /**
   * Связь Many-to-One с сущностью User.
   * Указываем, что эта связь использует столбец 'user_id' в текущей таблице
   * для связи с первичным ключом сущности User.
   */
  @ManyToOne(() => User, user => user.passwordResetTokens)
  @JoinColumn({ name: 'user_id' }) // Связываем эту ManyToOne связь со столбцом 'user_id'
  user: User; // Свойство для загрузки связанного объекта User
}
