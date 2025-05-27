import { Repository } from 'typeorm';
import { Journal } from './entity/journal.entity';
import { CreateJournalEntryDto } from './dto/create-journal-entry.dto';
import { QueryJournalEntriesDto } from './dto/query-journal-entries.dto';
export declare class JournalService {
    private readonly journalRepository;
    constructor(journalRepository: Repository<Journal>);
    logEntryAction(createJournalEntryDto: CreateJournalEntryDto): Promise<Journal>;
    findAll(queryDto: QueryJournalEntriesDto): Promise<Journal[]>;
    findOne(id: number): Promise<Journal | null>;
}
