import { OutboundConverter } from '../interfaces/outbound-converter.interface';
import { InternalFormat } from '../../../common/internal-format.interface';
export declare class InternalToXmlConverterService implements OutboundConverter {
    convert(internalFormat: InternalFormat): string;
}
