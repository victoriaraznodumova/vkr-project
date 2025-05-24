import { InternalFormat } from '../../../common/internal-format.interface';

export interface OutboundConverter {
  convert(internalFormat: InternalFormat): string;
}