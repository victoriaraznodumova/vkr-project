import { Injectable, Type } from '@nestjs/common';
import { InboundAdapter } from './interfaces/inbound-adapter.interface';
import { OutboundAdapter } from './interfaces/outbound-adapter.interface';
import { XmlToInternalAdapter } from './inbound/xml-to-internal.adapter';
import { JsonToInternalAdapter } from './inbound/json-to-internal.adapter';
import { InternalToXmlAdapter } from './outbound/internal-to-xml.adapter';
import { InternalToJsonAdapter } from './outbound/internal-to-json.adapter';

@Injectable()
export class AdapterFactory {
  private readonly inboundAdapters = new Map<string, Type<InboundAdapter>>();
  private readonly outboundAdapters = new Map<string, Type<OutboundAdapter>>();

  constructor() {
    this.inboundAdapters.set('application/xml', XmlToInternalAdapter);
    this.inboundAdapters.set('text/xml', XmlToInternalAdapter);
    this.inboundAdapters.set('application/json', JsonToInternalAdapter);

    this.outboundAdapters.set('application/xml', InternalToXmlAdapter);
    this.outboundAdapters.set('text/xml', InternalToXmlAdapter);
    this.outboundAdapters.set('application/json', InternalToJsonAdapter);
  }

  getInboundAdapter(contentType: string): InboundAdapter {
    console.log(`[AdapterFactory]: Запрос входящего адаптера для Content-Type: ${contentType}`);
    const AdapterClass = this.inboundAdapters.get(contentType.toLowerCase());
    if (!AdapterClass) {
      throw new Error(`Неподдерживаемый Content-Type для входящих данных: ${contentType}`);
    }
    return new AdapterClass();
  }

  getOutboundAdapter(acceptHeader: string): OutboundAdapter {
    console.log(`[AdapterFactory]: Запрос исходящего адаптера для Accept: ${acceptHeader}`);
    const acceptedTypes = acceptHeader.split(',').map(type => type.trim().toLowerCase());
    for (const type of acceptedTypes) {
      const AdapterClass = this.outboundAdapters.get(type);
      if (AdapterClass) {
        return new AdapterClass();
      }
    }
    throw new Error(`Неподдерживаемый формат вывода (Accept): ${acceptHeader}`);
  }
}