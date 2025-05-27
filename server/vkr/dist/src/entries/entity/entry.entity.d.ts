import { Journal } from '../../journal/entity/journal.entity';
import { Queue } from '../../queues/entity/queue.entity';
import { User } from '../../users/entity/user.entity';
import { EntryStatusEnum } from './entry-status.enum';
export declare class Entry {
    entryId: number;
    queueId: number;
    userId: number;
    status: EntryStatusEnum;
    createdAt: Date;
    entryTimeOrg: Date | null;
    entryPositionSelf: number | null;
    sequentialNumberSelf: number | null;
    statusUpdatedAt: Date;
    notificationMinutes: number | null;
    notificationPosition: number | null;
    actualStartTime: Date | null;
    actualEndTime: Date | null;
    user: User;
    queue: Queue;
    logs: Journal[];
}
