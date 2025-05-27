import { JournalStatusEnum } from '../entity/journal-status.enum';
import { JournalActionEnum } from '../entity/journal-action.enum';
import { UserDto } from '../../users/dto/user.dto';
export declare class JournalDto {
    logId: number;
    entryId: number;
    action: JournalActionEnum;
    prevStatus: JournalStatusEnum | null;
    newStatus: JournalStatusEnum | null;
    logTime: Date;
    initiatedByUserId: number;
    comment: string | null;
    user?: UserDto;
    constructor(partial: Partial<JournalDto>);
}
