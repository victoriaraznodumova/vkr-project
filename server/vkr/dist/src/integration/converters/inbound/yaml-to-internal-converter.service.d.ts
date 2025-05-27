import { InboundConverter } from '../interfaces/inbound-converter.interface';
import { InternalFormat } from '../../../common/internal-format.interface';
export declare class YamlToInternalConverterService implements InboundConverter {
    convert(yamlString: string): Promise<InternalFormat>;
}
