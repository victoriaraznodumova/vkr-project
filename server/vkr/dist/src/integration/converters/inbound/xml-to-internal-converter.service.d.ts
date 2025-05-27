import { InboundConverter } from '../interfaces/inbound-converter.interface';
import { InternalFormat } from '../../../common/internal-format.interface';
export declare class XmlToInternalConverterService implements InboundConverter {
    convert(rawData: string): Promise<InternalFormat>;
}
