import { InboundConverter } from '../interfaces/inbound-converter.interface';
import { InternalFormat } from '../../../common/internal-format.interface';
export declare class JsonToInternalConverterService implements InboundConverter {
    convert(jsonString: string): Promise<InternalFormat>;
}
