import { ApiProperty } from '@nestjs/swagger';
import { Administrator } from 'src/administrators/administrator.entity';
import { QueueEntry } from 'src/queue_entries/queue_entry.entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';



@Entity('users')
export class User {
    @PrimaryGeneratedColumn({name: 'user_id'})
    user_id: number

    @Column({name: 'email', type: 'character varying'})
    email: string

    @Column({name: 'password_hash', type: 'character varying'})
    password_hash: string

    @Column({name: 'registration_date', type: 'timestamp with time zone'})
    registration_date: Date

    @OneToMany(() => QueueEntry, (queue_entry) => queue_entry.user)
    queue_entries: QueueEntry[]

    @OneToMany(() => Administrator, (administrator) => administrator.user)
    administrators: Administrator[]

}