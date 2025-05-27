import { EntryService } from './entry.service';
import { CreateEntryDto } from './dto/create-entry.dto';
import { UpdateEntryDto } from './dto/update-entry.dto';
import { ShowEntryDto } from './dto/show-entry.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { User } from '../users/entity/user.entity';
export declare class EntryController {
    private readonly entriesService;
    constructor(entriesService: EntryService);
    create(createEntryDto: CreateEntryDto, req: {
        user: User;
    }): Promise<ShowEntryDto>;
    findAll(): Promise<ShowEntryDto[]>;
    findOne(entryId: string): Promise<ShowEntryDto>;
    update(entryId: string, updateEntryDto: UpdateEntryDto, req: {
        user: User;
    }): Promise<ShowEntryDto>;
    updateStatus(entryId: string, updateStatusDto: UpdateStatusDto, req: {
        user: User;
    }): Promise<ShowEntryDto>;
    remove(entryId: string, req: {
        user: User;
    }): Promise<void>;
}
