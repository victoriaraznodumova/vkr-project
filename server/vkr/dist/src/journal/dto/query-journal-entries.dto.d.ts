import { JournalActionEnum } from '../entity/journal-action.enum';
export declare class QueryJournalEntriesDto {
    entryId?: string;
    initiatedByUserId?: string;
    action?: JournalActionEnum;
}
