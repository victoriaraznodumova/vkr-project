import { JournalStatusEnum } from '../entity/journal-status.enum';
import { JournalActionEnum } from '../entity/journal-action.enum';
export declare class CreateJournalEntryDto {
    entryId: number;
    action: JournalActionEnum;
    prevStatus?: JournalStatusEnum | null;
    newStatus?: JournalStatusEnum | null;
    initiatedByUserId: number;
    comment?: string | null;
}
