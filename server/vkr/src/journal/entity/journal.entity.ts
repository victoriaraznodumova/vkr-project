import { ApiProperty } from '@nestjs/swagger';
import { Entry } from 'src/entries/entity/entry.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { JournalStatusEnum } from './journal.status.enum';
import { JournalActionEnum } from './journal.action.enum';
import { User } from 'src/users/entity/user.entity';

@Entity('journal')
export class Journal {

    @PrimaryGeneratedColumn({name: 'log_id'})
    logId: number

    @Column({name: 'entry_id', type: 'bigint'})
    entryId: number

    @Column({
        type: 'enum',
        enum: JournalActionEnum,
        name: 'action', // если нужно задать имя поля явно
      })
    action: JournalActionEnum


    @Column({
        type: 'enum',
        enum: JournalStatusEnum,
        name: 'prev_status', // если нужно задать имя поля явно
        nullable: true
      })
    prevStatus: JournalStatusEnum

        @Column({
        type: 'enum',
        enum: JournalStatusEnum,
        name: 'new_status', // если нужно задать имя поля явно
        nullable: true
      })
    newStatus: JournalStatusEnum

    @Column({name: 'log_time', type: 'timestamp with time zone'})
    logTime: Date

    @Column({name: 'initiated_by_user_id', type: 'bigint'})
    initiatedByUserId: number

    @Column({name: 'comment', type: 'text', nullable: true})
    comment: string

    @ManyToOne(() => Entry, (entry) => entry.logs)
    @JoinColumn({ name: "entry_id", referencedColumnName: "entry_id" })
    entry: Entry;

    @ManyToOne(() => User, (user) => user.initiatedEvents)
    @JoinColumn({ name: "initiated_by_user_id", referencedColumnName: "user_id" })
    user: User;

}