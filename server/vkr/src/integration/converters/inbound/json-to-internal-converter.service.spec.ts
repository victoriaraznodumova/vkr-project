import { JsonToInternalConverterService } from './json-to-internal-converter.service';
import { InternalFormat } from '../../../common/internal-format.interface'; // Убедитесь, что путь правильный

describe('JsonToInternalConverter', () => {
  let converter: JsonToInternalConverterService;

  beforeEach(() => {
    converter = new JsonToInternalConverterService();
  });

  it('должен быть определен', () => {
    expect(converter).toBeDefined();
  });

  describe('convert', () => {
    it('должен успешно преобразовать валидный JSON в InternalMessage', async () => {
      const jsonString = JSON.stringify({
        queueId: 1,
        userId: 10,
        status: 'waiting',
        date: '2023-01-01',
        time: '10:00',
        notificationMinutes: 15,
        notificationPosition: 2,
        comment: 'Test comment',
      });

      const expected: InternalFormat = {
        queueId: 1,
        userId: 10,
        status: 'waiting',
        date: '2023-01-01',
        time: '10:00',
        notificationMinutes: 15,
        notificationPosition: 2,
        comment: 'Test comment',
      };

      const result = await converter.convert(jsonString);
      expect(result).toEqual(expected);
    });

    it('должен преобразовать JSON с минимальными полями', async () => {
      const jsonString = JSON.stringify({
        queueId: 5,
        userId: 50,
      });

      const expected: InternalFormat = {
        queueId: 5,
        userId: 50,
        status: undefined,
        date: undefined,
        time: undefined,
        notificationMinutes: undefined,
        notificationPosition: undefined,
        comment: undefined,
      };

      const result = await converter.convert(jsonString);
      expect(result).toEqual(expected);
    });

    it('должен выбросить ошибку для невалидного JSON', async () => {
      const invalidJson = '{ "queueId": 1, "userId": 10, }'; // Ошибка синтаксиса (запятая в конце)
      await expect(converter.convert(invalidJson)).rejects.toThrow(/Неверный формат JSON: (Unexpected token }|Expected double-quoted property name)/);
    });

    it('должен выбросить ошибку, если userId отсутствует', async () => {
      const jsonWithoutUserId = JSON.stringify({
        queueId: 1,
      });
      await expect(converter.convert(jsonWithoutUserId)).rejects.toThrow('Отсутствует обязательное поле: userId');
    });

    it('должен выбросить ошибку, если queueId отсутствует', async () => {
      const jsonWithoutQueueId = JSON.stringify({
        userId: 10,
      });
      await expect(converter.convert(jsonWithoutQueueId)).rejects.toThrow('Отсутствует обязательное поле: queueId');
    });

    it('должен обрабатывать пустую строку как невалидный JSON', async () => {
      await expect(converter.convert('')).rejects.toThrow('Неверный формат JSON: Unexpected end of JSON input');
    });

    it('должен обрабатывать null как невалидный JSON', async () => {
      // JSON.parse(null) возвращает null, но наша логика теперь проверяет тип входных данных
      await expect(converter.convert(null as any)).rejects.toThrow('Неверный формат JSON: Входные данные не являются строкой JSON.');
    });

    it('должен обрабатывать undefined как невалидный JSON', async () => {
      await expect(converter.convert(undefined as any)).rejects.toThrow('Неверный формат JSON: Входные данные не являются строкой JSON.');
    });

    it('должен обрабатывать число как невалидный JSON', async () => {
      await expect(converter.convert(123 as any)).rejects.toThrow('Неверный формат JSON: Входные данные не являются строкой JSON.');
    });
  });
});
