import { InternalMessage } from '../../common/internal-message.interface';

export interface InboundAdapter {
  adapt(rawData: string): Promise<InternalMessage>;
}