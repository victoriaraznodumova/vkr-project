import { FormatProcessingService } from './integration.service';
import { Response, Request } from 'express';
export declare class IntegrationController {
    private readonly messageProcessingFacade;
    constructor(messageProcessingFacade: FormatProcessingService);
    handleIntegrationRequest(contentType: string, acceptHeader: string, res: Response, req: Request): Promise<string | object>;
}
