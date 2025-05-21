import { InternalMessage } from '../../common/internal-message.interface';

export interface OutboundAdapter {
  adapt(internalMessage: InternalMessage): string;
}