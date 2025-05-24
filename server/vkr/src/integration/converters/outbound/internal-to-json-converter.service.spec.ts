import { InternalToJsonConverterService } from './internal-to-json-converter.service';
import { InternalFormat } from '../../../common/internal-format.interface'; 

describe('InternalToJsonConverter', () => {
  let converter: InternalToJsonConverterService;

  beforeEach(() => {
    converter = new InternalToJsonConverterService();
  });

  it('должен быть определен', () => {
    expect(converter).toBeDefined();
  });

  describe('convert', () => {
    it('должен преобразовать InternalMessage в JSON-строку', () => {
      const internalFormat: InternalFormat = {
        queueId: 1,
        userId: 10,
        status: 'completed',
        date: '2023-01-01',
        time: '12:00',
        notificationMinutes: 30,
        notificationPosition: 1,
        comment: 'Entry processed.',
      };

      // Ожидаемая строка JSON должна быть без форматирования (одна строка)
      const expectedJson = '{"queueId":1,"userId":10,"status":"completed","date":"2023-01-01","time":"12:00","notificationMinutes":30,"notificationPosition":1,"comment":"Entry processed."}';

      const result = converter.convert(internalFormat);
      expect(result).toEqual(expectedJson);
    });

    it('должен преобразовать InternalMessage с минимальными полями', () => {
      const internalMessage: InternalFormat = {
        queueId: 5,
        userId: 50,
      };

      const expectedJson = '{"queueId":5,"userId":50}';

      const result = converter.convert(internalMessage);
      expect(result).toEqual(expectedJson);
    });

    it('должен корректно обрабатывать пустые строки и null значения', () => {
      const internalMessage: InternalFormat = {
        queueId: 1,
        userId: 10,
        status: '', // Пустая строка
        comment: null, // Null значение
        date: undefined, // Undefined поле не должно быть включено
      };

      // Undefined поля не сериализуются в JSON
      const expectedJson = '{"queueId":1,"userId":10,"status":"","comment":null}';

      const result = converter.convert(internalMessage);
      expect(result).toEqual(expectedJson);
    });

    it('должен корректно обрабатывать все необязательные поля как undefined', () => {
      const internalMessage: InternalFormat = {
        queueId: 1,
        userId: 10,
        status: undefined,
        date: undefined,
        time: undefined,
        notificationMinutes: undefined,
        notificationPosition: undefined,
        comment: undefined,
      };

      const expectedJson = '{"queueId":1,"userId":10}'; // Только обязательные поля

      const result = converter.convert(internalMessage);
      expect(result).toEqual(expectedJson);
    });
  });
});
