import { Injectable } from '@nestjs/common';
import { OutboundConverter} from '../interfaces/outbound-converter.interface';
import { InternalFormat } from '../../../common/internal-format.interface';
import { Builder } from 'xml2js';

@Injectable()
export class InternalToXmlConverterService implements OutboundConverter {
  convert(internalFormat: InternalFormat): string {
    console.log('[InternalToXmlConverter]: Преобразование внутреннего формата в XML.');
    const builder = new Builder({ rootName: 'response', headless: true });
    // internalMessage может содержать поля, которые не нужны во внешнем ответе или которые нужно переименовать
    const xml = builder.buildObject(internalFormat);
    return xml;
  }
}