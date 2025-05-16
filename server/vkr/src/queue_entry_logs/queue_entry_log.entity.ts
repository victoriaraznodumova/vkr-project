import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';



@Entity('queue_entry_log')
export class QueueEntryLog {


    log_id: number

    entry_id

    action

    prev_status

    new_status
    log_time
    initiated_by_user_id
    comment









}