import { ApiProperty } from '@nestjs/swagger';
import { Administrator } from 'src/administrators/administrator.entity';
import { Organization } from 'src/organizations/entity/organization.entity';
import { Entry } from 'src/entries/entity/entry.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { QueueTypeEnum } from './queue.type.enum';
import { QueueVisibilityEnum } from './queue.visibility.enum';
import { User } from 'src/users/entity/user.entity';

@Entity('queues')
export class Queue {
    @PrimaryGeneratedColumn({name: 'queue_id'})
    queueId: number

    @Column({name: 'name', type: 'text'})
    name: string

    @Column({name: 'organization_id', type: 'bigint', nullable: true})
    organizationId: number | null

    @Column({
        type: 'enum',
        enum: QueueTypeEnum,
        name: 'type',
      })
    type: QueueTypeEnum

    @Column({
        type: 'enum',
        enum: QueueVisibilityEnum,
        name: 'visibility', 
      })
    visibility: QueueVisibilityEnum

    @Column({name: 'city', type: 'character varying'})
    city: string

    @Column({name: 'address', type: 'text'})
    address: string

    @Column({name: 'opening_hours', type: 'text'})
    openingHours: string

    @Column({name: 'service_name', type: 'text'})
    serviceName: string 

    @Column({name: 'interval_minutes', type: 'integer'})
    intervalMinutes: number

    @Column({name: 'concurrent_visitors', type: 'integer'})
    concurrentVisitors: number

    @Column({name: 'private_link_token', type: 'text', nullable: true})
    privateLinkToken: string | null

    @CreateDateColumn({name: 'created_at', type: 'timestamp with time zone'})
    createdAt: Date
    
    @Column({name: 'created_by_user_id', type: 'bigint'})
    createdByUserId: number

    @OneToMany(() => Administrator, (administrator) => administrator.queue)
    administrators: Administrator[];

    @OneToMany(() => Entry, (entry) => entry.queue)
    entries: Entry[];

    @ManyToOne(() => Organization, (organization) => organization.queues)
    @JoinColumn({ name: "organization_id", referencedColumnName: "organization_id" })
    organization: Organization;

    @ManyToOne(() => User, (user) => user.queues)
    @JoinColumn({ name: "created_by_user_id", referencedColumnName: "user_id" })
    createdBy: User;

}

export { QueueTypeEnum };
