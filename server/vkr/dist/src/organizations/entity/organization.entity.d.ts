import { Queue } from '../../queues/entity/queue.entity';
export declare class Organization {
    organizationId: number;
    name: string;
    city: string;
    address: string;
    queues: Queue[];
}
