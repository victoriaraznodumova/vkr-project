// src/adapters/inbound/json-to-internal.adapter.spec.ts

import { JsonToInternalAdapter } from './json-to-internal.adapter';
import { InternalMessage } from '../../common/internal-message.interface'; // Убедитесь, что путь правильный

describe('JsonToInternalAdapter', () => {
  let adapter: JsonToInternalAdapter;

  beforeEach(() => {
    adapter = new JsonToInternalAdapter();
  });

  it('должен быть определен', () => {
    expect(adapter).toBeDefined();
  });

  describe('adapt', () => {
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

      const expected: InternalMessage = {
        queueId: 1,
        userId: 10,
        status: 'waiting',
        date: '2023-01-01',
        time: '10:00',
        notificationMinutes: 15,
        notificationPosition: 2,
        comment: 'Test comment',
      };

      const result = await adapter.adapt(jsonString);
      expect(result).toEqual(expected);
    });

    it('должен преобразовать JSON с минимальными полями', async () => {
      const jsonString = JSON.stringify({
        queueId: 5,
        userId: 50,
      });

      const expected: InternalMessage = {
        queueId: 5,
        userId: 50,
        status: undefined, // Ожидаем undefined для отсутствующих необязательных полей
        date: undefined,
        time: undefined,
        notificationMinutes: undefined,
        notificationPosition: undefined,
        comment: undefined,
      };

      const result = await adapter.adapt(jsonString);
      expect(result).toEqual(expected);
    });

    it('должен выбросить ошибку для невалидного JSON', async () => {
      const invalidJson = '{ "queueId": 1, "userId": 10, }'; // Ошибка синтаксиса (запятая в конце)
      await expect(adapter.adapt(invalidJson)).rejects.toThrow(/Неверный формат JSON: (Unexpected token }|Expected double-quoted property name)/);
    });

    it('должен выбросить ошибку, если userId отсутствует', async () => {
      const jsonWithoutUserId = JSON.stringify({
        queueId: 1,
      });
      await expect(adapter.adapt(jsonWithoutUserId)).rejects.toThrow('Отсутствует обязательное поле: userId');
    });

    it('должен выбросить ошибку, если queueId отсутствует', async () => {
      const jsonWithoutQueueId = JSON.stringify({
        userId: 10,
      });
      await expect(adapter.adapt(jsonWithoutQueueId)).rejects.toThrow('Отсутствует обязательное поле: queueId');
    });

    it('должен обрабатывать пустую строку как невалидный JSON', async () => {
      await expect(adapter.adapt('')).rejects.toThrow('Неверный формат JSON: Unexpected end of JSON input');
    });

    it('должен обрабатывать null как невалидный JSON', async () => {
      // JSON.parse(null) возвращает null, но наша логика теперь проверяет тип входных данных
      await expect(adapter.adapt(null as any)).rejects.toThrow('Неверный формат JSON: Входные данные не являются строкой JSON.');
    });

    it('должен обрабатывать undefined как невалидный JSON', async () => {
      await expect(adapter.adapt(undefined as any)).rejects.toThrow('Неверный формат JSON: Входные данные не являются строкой JSON.');
    });

    it('должен обрабатывать число как невалидный JSON', async () => {
      await expect(adapter.adapt(123 as any)).rejects.toThrow('Неверный формат JSON: Входные данные не являются строкой JSON.');
    });
  });
});
