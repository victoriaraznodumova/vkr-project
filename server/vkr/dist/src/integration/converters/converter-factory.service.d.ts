import { InboundConverter } from './interfaces/inbound-converter.interface';
import { OutboundConverter } from './interfaces/outbound-converter.interface';
export declare class ConverterFactoryService {
    private inboundConverters;
    private outboundConverters;
    constructor();
    getInboundConverter(contentType: string | undefined): InboundConverter;
    getOutboundConverter(acceptHeader: string | undefined): OutboundConverter;
}
