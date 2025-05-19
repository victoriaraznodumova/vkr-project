import { ApiProperty } from '@nestjs/swagger';
import { Queue } from 'src/queues/entity/queue.entity';
import { User } from 'src/users/entity/user.entity';
import {
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn
} from 'typeorm';


@Entity('administrators')
export class Administrator {

  // @ApiProperty({ description: 'Номер пользователя'})
  @PrimaryColumn({name: 'user_id'}) 
  userId: number

  @PrimaryColumn({name: 'queue_id'})
  queueId: number

  @ManyToOne(() => Queue, (queue: Queue) => queue.administrators)
  queue: Queue;

  @ManyToOne(() => User, (user: User) => user.administrators)
  user: User;
}