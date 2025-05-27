import { Repository } from 'typeorm';
import { Entry } from './entity/entry.entity';
import { CreateEntryDto } from './dto/create-entry.dto';
import { UpdateEntryDto } from './dto/update-entry.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { UserService } from '../users/user.service';
import { QueueService } from '../queues/queue.service';
import { JournalService } from '../journal/journal.service';
export declare class EntryService {
    private readonly entryRepository;
    private readonly userService;
    private readonly queueService;
    private readonly journalService;
    constructor(entryRepository: Repository<Entry>, userService: UserService, queueService: QueueService, journalService: JournalService);
    create(createEntryDto: CreateEntryDto, userId: number): Promise<Entry>;
    findAll(): Promise<Entry[]>;
    findOne(entryId: number): Promise<Entry | null>;
    update(entryId: number, updateEntryDto: UpdateEntryDto, userId: number): Promise<Entry>;
    updateStatus(entryId: number, updateStatusDto: UpdateStatusDto, initiatorUserId: number): Promise<Entry>;
    remove(entryId: number, userId: number): Promise<void>;
    getEntriesByQueueId(queueId: number): Promise<Entry[]>;
    getEntryPosition(queueId: number, entryId: number): Promise<number>;
    getEntriesForUser(userId: number): Promise<Entry[]>;
    getNextEntryInQueue(queueId: number): Promise<Entry | null>;
    private getActionFromStatusChange;
    private mapEntryStatusToJournalStatus;
}
