import { ApiProperty } from '@nestjs/swagger';
import { Administrator } from '../../administrators/administrator.entity';
import { PasswordResetToken } from '../../auth/entity/password-reset-token.entity';
import { Entry } from '../../entries/entity/entry.entity';
import { Journal } from '../../journal/entity/journal.entity';
import { Queue } from '../../queues/entity/queue.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserRoleEnum } from './user-role.enum';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn({name: 'user_id'})
    userId: number

    @Column({name: 'email', type: 'character varying'})
    email: string

    @Column({name: 'password_hash', type: 'character varying'})
    passwordHash: string

    @CreateDateColumn({name: 'registration_date', type: 'timestamp with time zone'})
    registrationDate: Date

    @OneToMany(() => Entry, (entry) => entry.user)
    entries: Entry[]

    @OneToMany(() => Administrator, (administrator) => administrator.user)
    administrators: Administrator[]

    @OneToMany(() => Queue, (queue) => queue.createdByUserId)
    queues: Queue[]

    @OneToMany(() => Journal, (journal) => journal.initiatedByUserId)
    initiatedEvents: Journal[]

    @OneToMany(() => PasswordResetToken, (token) => token.user)
    passwordResetTokens: PasswordResetToken[];

}