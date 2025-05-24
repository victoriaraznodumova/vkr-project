import { Injectable } from '@nestjs/common';
import { InboundConverter } from './interfaces/inbound-converter.interface';
import { OutboundConverter } from './interfaces/outbound-converter.interface';
import { JsonToInternalConverterService } from './inbound/json-to-internal-converter.service';
import { XmlToInternalConverterService } from './inbound/xml-to-internal-converter.service';
import { YamlToInternalConverterService } from './inbound/yaml-to-internal-converter.service';
import { InternalToJsonConverterService } from './outbound/internal-to-json-converter.service';
import { InternalToXmlConverterService} from './outbound/internal-to-xml-converter.servicer'; // Проверьте имя файла
import { InternalToYamlConverterService } from './outbound/internal-to-yaml-converter.service';

@Injectable()
export class ConverterFactoryService {
  private inboundConverters: Map<string, new () => InboundConverter>;
  private outboundConverters: Map<string, new () => OutboundConverter>;

  constructor() {
    this.inboundConverters = new Map<string, new () => InboundConverter>([
      ['application/json', JsonToInternalConverterService],
      ['application/xml', XmlToInternalConverterService],
      ['text/xml', XmlToInternalConverterService],
      ['application/yaml', YamlToInternalConverterService],
    ]);

    this.outboundConverters = new Map<string, new () => OutboundConverter>([
      ['application/json', InternalToJsonConverterService],
      ['application/xml', InternalToXmlConverterService], // Проверьте имя файла
      ['text/xml', InternalToXmlConverterService],        // Проверьте имя файла
      ['application/yaml', InternalToYamlConverterService],
    ]);
  }

  getInboundConverter(contentType: string | undefined): InboundConverter { // <--- ОБНОВЛЕНО: contentType может быть undefined
    // Добавляем проверку на undefined или null перед вызовом toLowerCase()
    const normalizedContentType = contentType ? contentType.toLowerCase() : ''; // <--- ОБНОВЛЕНО
    
    const ConverterClass = this.inboundConverters.get(normalizedContentType);
    if (!ConverterClass) {
      // Если contentType был undefined, то normalizedContentType будет пустой строкой,
      // и мы выбросим ошибку с 'Content-Type для входящих данных: '.
      // Если вам нужно, чтобы сообщение об ошибке явно содержало 'undefined',
      // можно изменить это:
      // throw new Error(`Неподдерживаемый Content-Type для входящих данных: ${contentType || 'undefined'}`);
      throw new Error(`Неподдерживаемый Content-Type для входящих данных: ${contentType}`);
    }
    return new ConverterClass();
  }

  getOutboundConverter(acceptHeader: string | undefined): OutboundConverter {
    // Эта часть уже корректно обрабатывает undefined
    if (!acceptHeader || acceptHeader.trim() === '' || acceptHeader.includes('*/*')) {
      return new InternalToJsonConverterService();
    }

    const acceptedTypes = acceptHeader.split(',').map(type => type.trim().toLowerCase());

    for (const type of acceptedTypes) {
      const ConverterClass = this.outboundConverters.get(type);
      if (ConverterClass) {
        return new ConverterClass();
      }
    }

    throw new Error(`Неподдерживаемый формат вывода (Accept): ${acceptHeader}`);
  }
}