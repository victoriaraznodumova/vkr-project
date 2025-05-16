import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';



@Entity('queue_entries')
export class QueueEntry {


    

    entry_id
    queue_id: number
    user_id



    status


    created_at
    entry_time_org

    entry_position_self
    sequential_number_self
    status_updated_at
    notification_minutes
    notification_position
    actual_start_time
    actual_end_time











}