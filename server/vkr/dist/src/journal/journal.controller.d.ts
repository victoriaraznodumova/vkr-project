import { JournalService } from './journal.service';
import { QueryJournalEntriesDto } from './dto/query-journal-entries.dto';
import { JournalDto } from './dto/journal.dto';
export declare class JournalController {
    private readonly journalService;
    constructor(journalService: JournalService);
    findAll(queryDto: QueryJournalEntriesDto): Promise<JournalDto[]>;
    findOne(id: number): Promise<JournalDto | null>;
}
