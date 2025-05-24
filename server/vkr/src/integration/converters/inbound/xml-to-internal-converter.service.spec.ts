import { XmlToInternalConverterService } from './xml-to-internal-converter.service';
import { InternalFormat } from '../../../common/internal-format.interface'; // Убедитесь, что путь правильный

describe('XmlToInternalConverter', () => {
  let converter: XmlToInternalConverterService;

  beforeEach(() => {
    converter = new XmlToInternalConverterService();
  });

  it('должен быть определен', () => {
    expect(converter).toBeDefined();
  });

  describe('convert', () => {
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

      const result = await converter.convert(xmlString);
      expect(result).toEqual(expected);
    });

    it('должен преобразовать XML с минимальными полями', async () => {
      const xmlString = `
        <request>
          <queueId>5</queueId>
          <userId>50</userId>
        </request>
      `;

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

      const result = await converter.convert(xmlString);
      expect(result).toEqual(expected);
    });

    it('должен выбросить ошибку для невалидного XML', async () => {
      const invalidXml = '<externalRequest><queueId>1</queueId>'; // Незакрытый тег
      await expect(converter.convert(invalidXml)).rejects.toThrow(/Неверный формат XML: (Unclosed root tag|Non-whitespace content after end-tag)/);
    });

    it('должен выбросить ошибку, если userId отсутствует', async () => {
      const xmlWithoutUserId = `
        <externalRequest>
          <queueId>1</queueId>
        </externalRequest>
      `;
      await expect(converter.convert(xmlWithoutUserId)).rejects.toThrow('Отсутствует обязательное поле: userId');
    });

    it('должен выбросить ошибку, если queueId отсутствует', async () => {
      const xmlWithoutQueueId = `
        <externalRequest>
          <userId>10</userId>
        </externalRequest>
      `;
      await expect(converter.convert(xmlWithoutQueueId)).rejects.toThrow('Отсутствует обязательное поле: queueId');
    });

    it('должен обрабатывать пустую строку как невалидный XML', async () => {
      await expect(converter.convert('')).rejects.toThrow('Входящие XML данные отсутствуют, пусты или имеют некорректный тип (ожидается непустая строка).');
    });

    it('должен обрабатывать null как невалидный XML', async () => {
      await expect(converter.convert(null as any)).rejects.toThrow('Входящие XML данные отсутствуют, пусты или имеют некорректный тип (ожидается непустая строка).');
    });

    it('должен обрабатывать undefined как невалидный XML', async () => {
      await expect(converter.convert(undefined as any)).rejects.toThrow('Входящие XML данные отсутствуют, пусты или имеют некорректный тип (ожидается непустая строка).');
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
      const expected: InternalFormat = {
        queueId: 123,
        userId: 456,
        notificationMinutes: 30,
        notificationPosition: 5,
        status: undefined,
        date: undefined,
        time: undefined,
        comment: undefined,
      };
      const result = await converter.convert(xmlString);
      expect(result).toEqual(expected);
    });

    it('должен обрабатывать XML с другим корневым элементом', async () => {
      const xmlString = `
        <someOtherRoot>
          <queueId>100</queueId>
          <userId>200</userId>
        </someOtherRoot>
      `;
      const expected: InternalFormat = {
        queueId: 100,
        userId: 200,
        status: undefined,
        date: undefined,
        time: undefined,
        notificationMinutes: undefined,
        notificationPosition: undefined,
        comment: undefined,
      };
      const result = await converter.convert(xmlString);
      expect(result).toEqual(expected);
    });
  });
});
