import { ConverterFactoryService } from './converter-factory.service';
import { JsonToInternalConverterService } from './inbound/json-to-internal-converter.service';
import { XmlToInternalConverterService } from './inbound/xml-to-internal-converter.service';
import { YamlToInternalConverterService } from './inbound/yaml-to-internal-converter.service';
import { InternalToJsonConverterService } from './outbound/internal-to-json-converter.service';
import { InternalToXmlConverterService } from './outbound/internal-to-xml-converter.servicer'; // Обратите внимание на опечатку в имени файла .servicer (проверить реальное имя файла)
import { InternalToYamlConverterService } from './outbound/internal-to-yaml-converter.service';

describe('ConverterFactoryService', () => {
  let factory: ConverterFactoryService;

  beforeEach(() => {
    factory = new ConverterFactoryService();
  });

  // --- Тесты для getInboundConverter ---
  describe('getInboundConverter', () => {
    it('should return JsonToInternalConverterService for application/json', () => {
      const converter = factory.getInboundConverter('application/json');
      expect(converter).toBeInstanceOf(JsonToInternalConverterService);
    });

    it('should return XmlToInternalConverterService for application/xml', () => {
      const converter = factory.getInboundConverter('application/xml');
      expect(converter).toBeInstanceOf(XmlToInternalConverterService);
    });

    it('should return XmlToInternalConverterService for text/xml', () => {
      const converter = factory.getInboundConverter('text/xml');
      expect(converter).toBeInstanceOf(XmlToInternalConverterService);
    });

    it('should return YamlToInternalConverterService for application/yaml', () => {
      const converter = factory.getInboundConverter('application/yaml');
      expect(converter).toBeInstanceOf(YamlToInternalConverterService);
    });

    it('should handle case-insensitivity for inbound Content-Type', () => {
      let converter = factory.getInboundConverter('APPLICATION/JSON');
      expect(converter).toBeInstanceOf(JsonToInternalConverterService);

      converter = factory.getInboundConverter('Application/XmL');
      expect(converter).toBeInstanceOf(XmlToInternalConverterService);

      converter = factory.getInboundConverter('ApPlIcAtIoN/YaMl');
      expect(converter).toBeInstanceOf(YamlToInternalConverterService);
    });

    it('should throw an error for an unsupported inbound Content-Type', () => {
      expect(() => factory.getInboundConverter('application/csv')).toThrow(
        'Неподдерживаемый Content-Type для входящих данных: application/csv',
      );
    });

    it('should throw an error for an empty inbound Content-Type', () => {
      expect(() => factory.getInboundConverter('')).toThrow(
        'Неподдерживаемый Content-Type для входящих данных: ',
      );
    });

    it('should throw an error for undefined inbound Content-Type', () => {
      // @ts-ignore - intentionally passing undefined to test error handling
      expect(() => factory.getInboundConverter(undefined)).toThrow(
        'Неподдерживаемый Content-Type для входящих данных: undefined',
      );
    });
  });

  // --- Тесты для getOutboundConverter ---
  describe('getOutboundConverter', () => {
    it('should return InternalToJsonConverterService by default (undefined acceptHeader)', () => {
      const converter = factory.getOutboundConverter(undefined);
      expect(converter).toBeInstanceOf(InternalToJsonConverterService);
    });

    it('should return InternalToJsonConverterService when acceptHeader is empty', () => {
      const converter = factory.getOutboundConverter('');
      expect(converter).toBeInstanceOf(InternalToJsonConverterService);
    });

    it('should return InternalToJsonConverterService when acceptHeader is */*', () => {
      const converter = factory.getOutboundConverter('*/*');
      expect(converter).toBeInstanceOf(InternalToJsonConverterService);
    });

    it('should return InternalToJsonConverterService for application/json acceptHeader', () => {
      const converter = factory.getOutboundConverter('application/json');
      expect(converter).toBeInstanceOf(InternalToJsonConverterService);
    });

    it('should return InternalToXmlConverterService for application/xml acceptHeader', () => {
      const converter = factory.getOutboundConverter('application/xml');
      expect(converter).toBeInstanceOf(InternalToXmlConverterService);
    });

    it('should return InternalToXmlConverterService for text/xml acceptHeader', () => {
      const converter = factory.getOutboundConverter('text/xml');
      expect(converter).toBeInstanceOf(InternalToXmlConverterService);
    });

    it('should return InternalToYamlConverterService for application/yaml acceptHeader', () => {
      const converter = factory.getOutboundConverter('application/yaml');
      expect(converter).toBeInstanceOf(InternalToYamlConverterService);
    });

    it('should handle case-insensitivity for outbound Accept header', () => {
      let converter = factory.getOutboundConverter('APPLICATION/JSON');
      expect(converter).toBeInstanceOf(InternalToJsonConverterService);

      converter = factory.getOutboundConverter('Application/XmL');
      expect(converter).toBeInstanceOf(InternalToXmlConverterService);

      converter = factory.getOutboundConverter('ApPlIcAtIoN/YaMl');
      expect(converter).toBeInstanceOf(InternalToYamlConverterService);
    });

    it('should return the first supported converter when multiple types are requested', () => {
      let converter = factory.getOutboundConverter('application/xml, application/json');
      expect(converter).toBeInstanceOf(InternalToXmlConverterService); // XML идет первым

      converter = factory.getOutboundConverter('application/json, application/xml');
      expect(converter).toBeInstanceOf(InternalToJsonConverterService); // JSON идет первым

      converter = factory.getOutboundConverter('application/yaml, application/json, application/xml');
      expect(converter).toBeInstanceOf(InternalToYamlConverterService); // YAML идет первым
    });

    it('should throw an error for an unsupported outbound Accept header', () => {
      expect(() => factory.getOutboundConverter('application/pdf')).toThrow(
        'Неподдерживаемый формат вывода (Accept): application/pdf',
      );
    });

    it('should throw an error if no supported type is found in a list', () => {
      expect(() => factory.getOutboundConverter('application/csv, application/pdf')).toThrow(
        'Неподдерживаемый формат вывода (Accept): application/csv, application/pdf',
      );
    });
  });
});