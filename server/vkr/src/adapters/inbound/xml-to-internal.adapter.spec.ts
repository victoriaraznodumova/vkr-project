// src/adapters/inbound/xml-to-internal.adapter.spec.ts

import { XmlToInternalAdapter } from './xml-to-internal.adapter';
import { InternalMessage } from '../../common/internal-message.interface'; // Убедитесь, что путь правильный

describe('XmlToInternalAdapter', () => {
  let adapter: XmlToInternalAdapter;

  beforeEach(() => {
    adapter = new XmlToInternalAdapter();
  });

  it('должен быть определен', () => {
    expect(adapter).toBeDefined();
  });

  describe('adapt', () => {
    it('должен успешно преобразовать валидный XML в InternalMessage', async () => {
      const xmlString = `
        <externalRequest>
          <queueId>1</queueId>
          <userId>10</userId>
          <status>waiting</status>
          <date>2023-01-01</date>
          <time>10:00</time>
          <notificationMinutes>15</notificationMinutes>
          <notificationPosition>2</notificationPosition>
          <comment>Test comment</comment>
        </externalRequest>
      `;

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

      const result = await adapter.adapt(xmlString);
      expect(result).toEqual(expected);
    });

    it('должен преобразовать XML с минимальными полями', async () => {
      const xmlString = `
        <request>
          <queueId>5</queueId>
          <userId>50</userId>
        </request>
      `;

      const expected: InternalMessage = {
        queueId: 5,
        userId: 50,
        status: undefined,
        date: undefined,
        time: undefined,
        notificationMinutes: undefined,
        notificationPosition: undefined,
        comment: undefined,
      };

      const result = await adapter.adapt(xmlString);
      expect(result).toEqual(expected);
    });

    it('должен выбросить ошибку для невалидного XML', async () => {
      const invalidXml = '<externalRequest><queueId>1</queueId>'; // Незакрытый тег
      await expect(adapter.adapt(invalidXml)).rejects.toThrow(/Неверный формат XML: (Unclosed root tag|Non-whitespace content after end-tag)/);
    });

    it('должен выбросить ошибку, если userId отсутствует', async () => {
      const xmlWithoutUserId = `
        <externalRequest>
          <queueId>1</queueId>
        </externalRequest>
      `;
      await expect(adapter.adapt(xmlWithoutUserId)).rejects.toThrow('Отсутствует обязательное поле: userId');
    });

    it('должен выбросить ошибку, если queueId отсутствует', async () => {
      const xmlWithoutQueueId = `
        <externalRequest>
          <userId>10</userId>
        </externalRequest>
      `;
      await expect(adapter.adapt(xmlWithoutQueueId)).rejects.toThrow('Отсутствует обязательное поле: queueId');
    });

    it('должен обрабатывать пустую строку как невалидный XML', async () => {
      await expect(adapter.adapt('')).rejects.toThrow('Входящие XML данные отсутствуют, пусты или имеют некорректный тип (ожидается непустая строка).');
    });

    it('должен обрабатывать null как невалидный XML', async () => {
      await expect(adapter.adapt(null as any)).rejects.toThrow('Входящие XML данные отсутствуют, пусты или имеют некорректный тип (ожидается непустая строка).');
    });

    it('должен обрабатывать undefined как невалидный XML', async () => {
      await expect(adapter.adapt(undefined as any)).rejects.toThrow('Входящие XML данные отсутствуют, пусты или имеют некорректный тип (ожидается непустая строка).');
    });

    it('должен обрабатывать числовые поля как числа', async () => {
      const xmlString = `
        <data>
          <queueId>123</queueId>
          <userId>456</userId>
          <notificationMinutes>30</notificationMinutes>
          <notificationPosition>5</notificationPosition>
        </data>
      `;
      const expected: InternalMessage = {
        queueId: 123,
        userId: 456,
        notificationMinutes: 30,
        notificationPosition: 5,
        status: undefined,
        date: undefined,
        time: undefined,
        comment: undefined,
      };
      const result = await adapter.adapt(xmlString);
      expect(result).toEqual(expected);
    });

    it('должен обрабатывать XML с другим корневым элементом', async () => {
      const xmlString = `
        <someOtherRoot>
          <queueId>100</queueId>
          <userId>200</userId>
        </someOtherRoot>
      `;
      const expected: InternalMessage = {
        queueId: 100,
        userId: 200,
        status: undefined,
        date: undefined,
        time: undefined,
        notificationMinutes: undefined,
        notificationPosition: undefined,
        comment: undefined,
      };
      const result = await adapter.adapt(xmlString);
      expect(result).toEqual(expected);
    });
  });
});
