import { QueueService } from './queue.service';
import { CreateQueueDto } from './dto/create-queue.dto';
import { UpdateQueueDto } from './dto/update-queue.dto';
import { QueueDto } from './dto/queue.dto';
import { Request } from 'express';
export declare class QueueController {
    private readonly queuesService;
    constructor(queuesService: QueueService);
    create(createQueueDto: CreateQueueDto, req: Request): Promise<QueueDto>;
    findAll(organizationId?: number): Promise<QueueDto[]>;
    findOne(id: number): Promise<QueueDto>;
    findOneByPrivateLinkToken(token: string): Promise<QueueDto>;
    update(id: number, updateQueueDto: UpdateQueueDto, req: Request): Promise<QueueDto>;
    remove(id: number, req: Request): Promise<void>;
}
