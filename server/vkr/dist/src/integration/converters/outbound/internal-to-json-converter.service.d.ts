import { OutboundConverter } from '../interfaces/outbound-converter.interface';
import { InternalFormat } from '../../../common/internal-format.interface';
export declare class InternalToJsonConverterService implements OutboundConverter {
    convert(internalFormat: InternalFormat): string;
}
