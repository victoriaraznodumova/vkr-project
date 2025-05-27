import { Entry } from '../../entries/entity/entry.entity';
import { JournalStatusEnum } from './journal-status.enum';
import { JournalActionEnum } from './journal-action.enum';
import { User } from '../../users/entity/user.entity';
export declare class Journal {
    logId: number;
    entryId: number;
    action: JournalActionEnum;
    prevStatus: JournalStatusEnum;
    newStatus: JournalStatusEnum;
    logTime: Date;
    initiatedByUserId: number;
    comment: string;
    entry: Entry;
    user: User;
}
