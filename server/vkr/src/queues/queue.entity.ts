import { ApiProperty } from '@nestjs/swagger';
import { Administrator } from 'src/administrators/administrator.entity';
import { Organization } from 'src/organizations/organization.entity';
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

enum QueueType {
  ORGANIZATIONAL = 'organizational',
  SELF_ORGANIZED = 'self_organized'
}

enum QueueVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private'
}

@Entity('queues')
export class Queue {
    @PrimaryGeneratedColumn({name: 'queue_id'})
    queue_id: number

    @Column({name: 'name', type: 'text'})
    name: string

    @Column({name: 'organization_id', type: 'bigint'})
    organization_id: number

    @Column({
        type: 'enum',
        enum: QueueType,
        name: 'type', // если нужно задать имя поля явно
      })
    type: QueueType

    @Column({
        type: 'enum',
        enum: QueueVisibility,
        name: 'visibility', // если нужно задать имя поля явно
      })
    visibility: QueueVisibility

    @Column({name: 'city', type: 'character varying'})
    city: string

    @Column({name: 'address', type: 'text'})
    address: string

    @Column({name: 'service_name', type: 'text'})
    service_name: string

    @Column({name: 'opening_hours', type: 'text'})
    opening_hours: string

    @Column({name: 'interval_minutes', type: 'integer'})
    interval_minutes: number

    @Column({name: 'concurrent_visitors', type: 'integer'})
    concurrent_visitors: number

    @Column({name: 'private_link_token', type: 'text'})
    private_link_token: string

    @Column({name: 'created_at', type: 'timestamp with time zone'})
    created_at: Date
    
    @Column({name: 'created_by_user_id', type: 'bigint'})
    created_by_user_id: number

    @ManyToOne(() => Organization, (organization) => organization.queues)
    @JoinColumn({ name: "organization_id", referencedColumnName: "organization_id" })
    organization: Organization;

    @OneToMany(() => Administrator, (administrator) => administrator.queue)
    administrators: Administrator[]

    @OneToMany(() => QueueEntry, (queue_entry) => queue_entry.queue)
    queue_entries: QueueEntry[]

}