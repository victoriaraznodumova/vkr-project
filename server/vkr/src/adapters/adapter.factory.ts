// src/adapters/adapter.factory.ts

import { Injectable } from '@nestjs/common';
import { InboundAdapter } from './interfaces/inbound-adapter.interface';
import { OutboundAdapter } from './interfaces/outbound-adapter.interface';
import { JsonToInternalAdapter } from './inbound/json-to-internal.adapter';
import { XmlToInternalAdapter } from './inbound/xml-to-internal.adapter';
import { InternalToJsonAdapter } from './outbound/internal-to-json.adapter';
import { InternalToXmlAdapter } from './outbound/internal-to-xml.adapter';

@Injectable()
export class AdapterFactory {
  private inboundAdapters: Map<string, new () => InboundAdapter>;
  private outboundAdapters: Map<string, new () => OutboundAdapter>;

  constructor() {
    this.inboundAdapters = new Map<string, new () => InboundAdapter>([
      ['application/json', JsonToInternalAdapter],
      ['application/xml', XmlToInternalAdapter],
      ['text/xml', XmlToInternalAdapter],
    ]);

    this.outboundAdapters = new Map<string, new () => OutboundAdapter>([
      ['application/json', InternalToJsonAdapter],
      ['application/xml', InternalToXmlAdapter],
      ['text/xml', InternalToXmlAdapter],
    ]);
  }

  getInboundAdapter(contentType: string): InboundAdapter {
    console.log(`[AdapterFactory]: Запрос входящего адаптера для Content-Type: ${contentType}`);
    const normalizedContentType = contentType.toLowerCase();
    const AdapterClass = this.inboundAdapters.get(normalizedContentType);
    if (!AdapterClass) {
      throw new Error(`Неподдерживаемый Content-Type для входящих данных: ${contentType}`);
    }
    return new AdapterClass();
  }

  // Изменения здесь:
  getOutboundAdapter(acceptHeader: string | undefined): OutboundAdapter {
    console.log(`[AdapterFactory]: Запрос исходящего адаптера для Accept: ${acceptHeader}`);

    // Обработка случаев по умолчанию: undefined, пустая строка или */*
    if (!acceptHeader || acceptHeader.trim() === '' || acceptHeader.includes('*/*')) {
      return new InternalToJsonAdapter();
    }

    const acceptedTypes = acceptHeader.split(',').map(type => type.trim().toLowerCase());

    // Перебираем запрошенные типы в порядке их появления в заголовке
    for (const type of acceptedTypes) {
      const AdapterClass = this.outboundAdapters.get(type);
      if (AdapterClass) {
        return new AdapterClass();
      }
    }

    // Если ни один поддерживаемый адаптер не найден, выбрасываем ошибку
    throw new Error(`Неподдерживаемый формат вывода (Accept): ${acceptHeader}`);
  }
}
