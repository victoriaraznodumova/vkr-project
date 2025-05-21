import { Injectable } from '@nestjs/common';
import { OutboundAdapter } from '../interfaces/outbound-adapter.interface';
import { InternalMessage } from '../../common/internal-message.interface';

@Injectable()
export class InternalToJsonAdapter implements OutboundAdapter {
  adapt(internalMessage: InternalMessage): string {
    console.log('[InternalToJsonAdapter]: Преобразование внутреннего формата в JSON.');
    return JSON.stringify(internalMessage, null, 2);
  }
}