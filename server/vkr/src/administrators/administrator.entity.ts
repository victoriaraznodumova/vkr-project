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

  @ManyToOne(() => Queue, (queue) => queue.administrators)
  @JoinColumn({ name: "queue_id", referencedColumnName: "queue_id" })
  queue: Queue;

  @ManyToOne(() => User, (user) => user.administrators)
  @JoinColumn({ name: "user_id", referencedColumnName: "user_id" })
  user: User;
}