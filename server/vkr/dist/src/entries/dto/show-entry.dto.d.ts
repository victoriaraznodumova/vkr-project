import { EntryStatusEnum } from '../entity/entry-status.enum';
import { UserDto } from '../../users/dto/user.dto';
import { QueueDto } from '../../queues/dto/queue.dto';
import { JournalDto } from '../../journal/dto/journal.dto';
export declare class ShowEntryDto {
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
    user?: UserDto;
    queue?: QueueDto;
    logs?: JournalDto[];
    constructor(partial: Partial<ShowEntryDto>);
}
