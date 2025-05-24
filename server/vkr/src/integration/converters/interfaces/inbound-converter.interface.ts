import { InternalFormat } from '../../../common/internal-format.interface';

export interface InboundConverter {
  convert(rawData: string): Promise<InternalFormat>;
}