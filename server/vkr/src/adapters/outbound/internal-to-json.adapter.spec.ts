// src/adapters/outbound/internal-to-json.adapter.spec.ts

import { InternalToJsonAdapter } from './internal-to-json.adapter';
import { InternalMessage } from '../../common/internal-message.interface'; // Убедитесь, что путь правильный

describe('InternalToJsonAdapter', () => {
  let adapter: InternalToJsonAdapter;

  beforeEach(() => {
    adapter = new InternalToJsonAdapter();
  });

  it('должен быть определен', () => {
    expect(adapter).toBeDefined();
  });

  describe('adapt', () => {
    it('должен преобразовать InternalMessage в JSON-строку', () => {
      const internalMessage: InternalMessage = {
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

      const result = adapter.adapt(internalMessage);
      expect(result).toEqual(expectedJson);
    });

    it('должен преобразовать InternalMessage с минимальными полями', () => {
      const internalMessage: InternalMessage = {
        queueId: 5,
        userId: 50,
      };

      const expectedJson = '{"queueId":5,"userId":50}';

      const result = adapter.adapt(internalMessage);
      expect(result).toEqual(expectedJson);
    });

    it('должен корректно обрабатывать пустые строки и null значения', () => {
      const internalMessage: InternalMessage = {
        queueId: 1,
        userId: 10,
        status: '', // Пустая строка
        comment: null, // Null значение
        date: undefined, // Undefined поле не должно быть включено
      };

      // Undefined поля не сериализуются в JSON
      const expectedJson = '{"queueId":1,"userId":10,"status":"","comment":null}';

      const result = adapter.adapt(internalMessage);
      expect(result).toEqual(expectedJson);
    });

    it('должен корректно обрабатывать все необязательные поля как undefined', () => {
      const internalMessage: InternalMessage = {
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

      const result = adapter.adapt(internalMessage);
      expect(result).toEqual(expectedJson);
    });
  });
});
