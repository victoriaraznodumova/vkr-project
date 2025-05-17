import { ApiProperty } from '@nestjs/swagger';
import { Queue } from 'src/queues/queue.entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';



@Entity('organizations')
export class Organization {
    @PrimaryGeneratedColumn({name: 'organization_id'})
    organization_id: number

    @Column({name: 'name', type: 'character varying'})
    name: string

    @Column({name: 'city', type: 'character varying'})
    city: string

    @Column({name: 'address', type: 'character varying'})
    address: string

    @OneToMany(() => Queue, (queue) => queue.organization)
    queues: Queue[]

}