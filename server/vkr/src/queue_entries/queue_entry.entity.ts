import { ApiProperty } from '@nestjs/swagger';
import { QueueEntryLog } from 'src/queue_entry_logs/queue_entry_log.entity';
import { Queue } from 'src/queues/queue.entity';
import { User } from 'src/users/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';


enum QueueEntryStatus {
  WAITING = 'waiting',
  SERVING = 'serving',
  COMPLETED = 'completed',
  CANCELED = 'canceled',
  LATE = 'late'
}

@Entity('queue_entries')
export class QueueEntry {

    @PrimaryGeneratedColumn({name: 'entry_id'})
    entry_id: number

    @Column({name: 'queue_id', type: 'bigint'})
    queue_id: number

    @Column({name: 'user_id', type: 'bigint'})
    user_id: number

    @Column({
        type: 'enum',
        enum: QueueEntryStatus,
        name: 'status', // если нужно задать имя поля явно
      })
    status: QueueEntryStatus

    @Column({name: 'created_at', type: 'timestamp with time zone'})
    created_at: Date

    @Column({name: 'entry_time_org', type: 'timestamp with time zone'})
    entry_time_org: Date

    @Column({name: 'entry_position_self', type: 'integer'})
    entry_position_self: number

    @Column({name: 'sequential_number_self', type: 'integer'})
    sequential_number_self: number

    @Column({name: 'status_updated_at', type: 'timestamp with time zone'})
    status_updated_at: Date

    @Column({name: 'notification_minutes', type: 'integer'})
    notification_minutes: number

    @Column({name: 'notification_position', type: 'integer'})
    notification_position: number

    @Column({name: 'actual_start_time', type: 'timestamp with time zone'})
    actual_start_time: Date

    @Column({name: 'actual_end_time', type: 'timestamp with time zone'})  
    actual_end_time: Date

    @ManyToOne(() => User, (user) => user.queue_entries)
    @JoinColumn({ name: "user_id", referencedColumnName: "user_id" })
    user: User;

    @ManyToOne(() => Queue, (queue) => queue.queue_entries)
    @JoinColumn({ name: "queue_id", referencedColumnName: "queue_id" })
    queue: Queue;

    @OneToMany(() => QueueEntryLog, (queue_entry_log) => queue_entry_log.queue_entry)
    queue_entry_logs: QueueEntryLog[]

}