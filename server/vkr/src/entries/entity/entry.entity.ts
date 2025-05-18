import { ApiProperty } from '@nestjs/swagger';
import { Journal } from '../../journal/entity/journal.entity';
import { Queue } from '../../queues/entity/queue.entity';
import { User } from '../../users/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EntryStatusEnum } from '../enum/entry.status.enum';

@Entity('entries')
export class Entry {

  @PrimaryGeneratedColumn({name: 'entry_id'})
  entryId: number

  @Column({name: 'queue_id', type: 'bigint'})
  queueId: number

  @Column({name: 'user_id', type: 'bigint'})
  userId: number

  @Column({
      type: 'enum',
      enum: EntryStatusEnum,
      name: 'status', // если нужно задать имя поля явно
    })
  status: EntryStatusEnum

  @CreateDateColumn({name: 'created_at', type: 'timestamp with time zone'})
  createdAt: Date

  @Column({name: 'entry_time_org', type: 'timestamp with time zone', nullable: true})
  entryTimeOrg: Date| null;

  @Column({name: 'entry_position_self', type: 'integer', nullable: true })
  entryPositionSelf: number | null;

  @Column({name: 'sequential_number_self', type: 'integer', nullable: true })
  sequentialNumberSelf: number | null;

  @UpdateDateColumn({name: 'status_updated_at', type: 'timestamp with time zone'})
  statusUpdatedAt: Date

  @Column({name: 'notification_minutes', type: 'integer', nullable: true })
  notificationMinutes: number | null;

  @Column({name: 'notification_position', type: 'integer', nullable: true })
  notificationPosition: number | null;

  @Column({name: 'actual_start_time', type: 'timestamp with time zone', nullable: true })
  actualStartTime: Date | null;

  @Column({name: 'actual_end_time', type: 'timestamp with time zone', nullable: true })  
  actualEndTime: Date | null;

  @ManyToOne(() => User, (user) => user.entries)
  @JoinColumn({ name: "user_id", referencedColumnName: "user_id" })
  user: User;

  @ManyToOne(() => Queue, (queue) => queue.entries)
  @JoinColumn({ name: "queue_id", referencedColumnName: "queue_id" })
  queue: Queue;

  @OneToMany(() => Journal, (journal) => journal.entry)
  logs: Journal[]

}