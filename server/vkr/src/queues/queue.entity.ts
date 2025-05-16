import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';



@Entity('queues')
export class Queue {
    queue_id
    name
    organization_id
    type
    visibility
    city
    address
    service_name

    opening_hours
    interval_minutes
    concurrent_visitors
    private_link_token
    created_at
    created_by_user_id



}