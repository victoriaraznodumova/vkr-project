// src/adapters/adapter.factory.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { AdapterFactory } from './adapter.factory';
import { JsonToInternalAdapter } from './inbound/json-to-internal.adapter';
import { XmlToInternalAdapter } from './inbound/xml-to-internal.adapter';
import { InternalToJsonAdapter } from './outbound/internal-to-json.adapter';
import { InternalToXmlAdapter } from './outbound/internal-to-xml.adapter';

describe('AdapterFactory', () => {
  let factory: AdapterFactory;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdapterFactory],
    }).compile();

    factory = module.get<AdapterFactory>(AdapterFactory);
  });

  it('должен быть определен', () => {
    expect(factory).toBeDefined();
  });

  // --- Тесты для getInboundAdapter ---
  describe('getInboundAdapter', () => {
    it('должен вернуть JsonToInternalAdapter для application/json', () => {
      const adapter = factory.getInboundAdapter('application/json');
      expect(adapter).toBeInstanceOf(JsonToInternalAdapter);
    });

    it('должен вернуть XmlToInternalAdapter для application/xml', () => {
      const adapter = factory.getInboundAdapter('application/xml');
      expect(adapter).toBeInstanceOf(XmlToInternalAdapter);
    });

    it('должен вернуть XmlToInternalAdapter для text/xml', () => {
      const adapter = factory.getInboundAdapter('text/xml');
      expect(adapter).toBeInstanceOf(XmlToInternalAdapter);
    });

    it('должен выбросить ошибку для неподдерживаемого Content-Type', () => {
      expect(() => factory.getInboundAdapter('application/unsupported')).toThrow(
        'Неподдерживаемый Content-Type для входящих данных: application/unsupported',
      );
    });

    it('должен обрабатывать Content-Type без учета регистра', () => {
      const adapter = factory.getInboundAdapter('Application/Json');
      expect(adapter).toBeInstanceOf(JsonToInternalAdapter);
    });
  });

  // --- Тесты для getOutboundAdapter ---
  describe('getOutboundAdapter', () => {
    it('должен вернуть InternalToJsonAdapter для application/json', () => {
      const adapter = factory.getOutboundAdapter('application/json');
      expect(adapter).toBeInstanceOf(InternalToJsonAdapter);
    });

    it('должен вернуть InternalToXmlAdapter для application/xml', () => {
      const adapter = factory.getOutboundAdapter('application/xml');
      expect(adapter).toBeInstanceOf(InternalToXmlAdapter);
    });

    it('должен вернуть InternalToXmlAdapter для text/xml', () => {
      const adapter = factory.getOutboundAdapter('text/xml');
      expect(adapter).toBeInstanceOf(InternalToXmlAdapter);
    });

    it('должен вернуть InternalToJsonAdapter по умолчанию для */*', () => {
      const adapter = factory.getOutboundAdapter('*/*');
      expect(adapter).toBeInstanceOf(InternalToJsonAdapter);
    });

    it('должен вернуть InternalToJsonAdapter по умолчанию для пустого Accept', () => {
      const adapter = factory.getOutboundAdapter('');
      expect(adapter).toBeInstanceOf(InternalToJsonAdapter);
    });

    it('должен вернуть InternalToJsonAdapter по умолчанию для undefined Accept', () => {
      const adapter = factory.getOutboundAdapter(undefined);
      expect(adapter).toBeInstanceOf(InternalToJsonAdapter);
    });

    it('должен вернуть первый поддерживаемый адаптер, если Accept содержит несколько типов', () => {
      const adapter = factory.getOutboundAdapter('text/plain, application/xml, application/json');
      expect(adapter).toBeInstanceOf(InternalToXmlAdapter); // XML идет первым в списке поддерживаемых
    });

    it('должен выбросить ошибку для неподдерживаемого Accept', () => {
      expect(() => factory.getOutboundAdapter('application/unsupported')).toThrow(
        'Неподдерживаемый формат вывода (Accept): application/unsupported',
      );
    });

    it('должен обрабатывать Accept без учета регистра', () => {
      const adapter = factory.getOutboundAdapter('Application/Json');
      expect(adapter).toBeInstanceOf(InternalToJsonAdapter);
    });
  });
});
