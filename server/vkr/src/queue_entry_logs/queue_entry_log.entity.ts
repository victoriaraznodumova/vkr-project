import { ApiProperty } from '@nestjs/swagger';
import { QueueEntry } from 'src/queue_entries/queue_entry.entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

enum QueueEntryLogAction {
  JOINED = 'joined',
  ADMIN_ADDED = 'admin_added',
  STARTED_SERVING = 'started_serving',
  COMPLETED_SERVICE = 'completed_service',
  CANCELED_BY_USER = 'canceled_by_user',
  CANCELED_BY_ADMIN = 'canceled_by_admin',
  MARKED_LATE = 'marked_late',
  DELAYED = 'delayed',
  NOTIFICATION_SENT = 'notification_sent'
}

enum QueueEntryStatus {
  WAITING = 'waiting',
  SERVING = 'serving',
  COMPLETED = 'completed',
  CANCELED = 'canceled',
  LATE = 'late'
}

@Entity('queue_entry_logs')
export class QueueEntryLog {

    @PrimaryGeneratedColumn({name: 'log_id'})
    log_id: number

    @Column({name: 'entry_id', type: 'bigint'})
    entry_id: number

    @Column({
        type: 'enum',
        enum: QueueEntryLogAction,
        name: 'action', // если нужно задать имя поля явно
      })
    action: QueueEntryLogAction


    @Column({
        type: 'enum',
        enum: QueueEntryStatus,
        name: 'prev_status', // если нужно задать имя поля явно
        nullable: true
      })
    prev_status: QueueEntryStatus

        @Column({
        type: 'enum',
        enum: QueueEntryStatus,
        name: 'new_status', // если нужно задать имя поля явно
        nullable: true
      })
    new_status: QueueEntryStatus

    @Column({name: 'log_time', type: 'timestamp with time zone'})
    log_time: Date

    @Column({name: 'initiated_by_user_id', type: 'bigint'})
    initiated_by_user_id: number

    @Column({name: 'comment', type: 'text', nullable: true})
    comment: string

    @ManyToOne(() => QueueEntry, (queue_entry) => queue_entry.queue_entry_logs)
    @JoinColumn({ name: "entry_id", referencedColumnName: "entry_id" })
    queue_entry: QueueEntry;

}