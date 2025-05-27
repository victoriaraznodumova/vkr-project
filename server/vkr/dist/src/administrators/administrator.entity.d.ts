import { Queue } from '../queues/entity/queue.entity';
import { User } from '../users/entity/user.entity';
export declare class Administrator {
    userId: number;
    queueId: number;
    queue: Queue;
    user: User;
}
