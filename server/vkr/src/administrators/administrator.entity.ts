import { ApiProperty } from '@nestjs/swagger';
import { Queue } from 'src/queues/queue.entity';
import { User } from 'src/users/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';



@Entity('administrators')
export class Administrator {

   // @ApiProperty({ description: 'Номер пользователя'})
    @PrimaryColumn({name: 'user_id'}) //колонка - идентификатор, значение генерируется автоматически
    user_id: number

    @PrimaryColumn({name: 'queue_id'}) //колонка - идентификатор, значение генерируется автоматически
    queue_id: number

    @ManyToOne(() => Queue, (queue) => queue.administrators)
    @JoinColumn({ name: "queue_id", referencedColumnName: "queue_id" })
    queue: Queue;


    @ManyToOne(() => User, (user) => user.administrators)
    @JoinColumn({ name: "user_id", referencedColumnName: "user_id" })
    user: User;
  
}