import { Injectable } from '@nestjs/common';
import { OutboundAdapter } from '../interfaces/outbound-adapter.interface';
import { InternalMessage } from '../../common/internal-message.interface';
import { Builder } from 'xml2js'; // Для построения XML

@Injectable()
export class InternalToXmlAdapter implements OutboundAdapter {
  adapt(internalMessage: InternalMessage): string {
    console.log('[InternalToXmlAdapter]: Преобразование внутреннего формата в XML.');
    const builder = new Builder({ rootName: 'response', headless: true }); // rootName - корневой элемент ответа
    // internalMessage может содержать поля, которые не нужны во внешнем ответе,
    // или которые нужно переименовать. Здесь простой пример.
    const xml = builder.buildObject(internalMessage);
    return xml;
  }
}