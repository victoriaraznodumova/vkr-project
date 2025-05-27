import { ConverterFactoryService } from './converters/converter-factory.service';
import { EntryService } from '../entries/entry.service';
export declare class FormatProcessingService {
    private readonly converterFactory;
    private readonly entryService;
    constructor(converterFactory: ConverterFactoryService, entryService: EntryService);
    processFormat(rawData: string, contentType: string, acceptHeaders: string): Promise<string>;
}
