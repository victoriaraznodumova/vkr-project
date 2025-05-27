import { Repository } from 'typeorm';
import { Queue } from './entity/queue.entity';
import { CreateQueueDto } from './dto/create-queue.dto';
import { UpdateQueueDto } from './dto/update-queue.dto';
import { OrganizationService } from '../organizations/organization.service';
import { Administrator } from '../administrators/administrator.entity';
import { User } from '../users/entity/user.entity';
export declare class QueueService {
    private readonly queueRepository;
    private readonly administratorRepository;
    private readonly userRepository;
    private readonly organizationsService;
    constructor(queueRepository: Repository<Queue>, administratorRepository: Repository<Administrator>, userRepository: Repository<User>, organizationsService: OrganizationService);
    private generateQueueName;
    create(createQueueDto: CreateQueueDto, createdByUserId: number): Promise<Queue>;
    findAll(organizationId?: number): Promise<Queue[]>;
    findOne(id: number): Promise<Queue>;
    findOneByPrivateLinkToken(token: string): Promise<Queue>;
    isUserAdminOfQueue(userId: number, queueId: number): Promise<boolean>;
    update(id: number, updateQueueDto: UpdateQueueDto, userId: number): Promise<Queue>;
    remove(id: number, userId: number): Promise<void>;
}
