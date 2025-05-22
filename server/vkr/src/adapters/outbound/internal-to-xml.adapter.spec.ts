// src/adapters/outbound/internal-to-xml.adapter.spec.ts

import { InternalToXmlAdapter } from './internal-to-xml.adapter';
import { InternalMessage } from '../../common/internal-message.interface'; // Убедитесь, что путь правильный
import { parseStringPromise } from 'xml2js'; // Для проверки сгенерированного XML

describe('InternalToXmlAdapter', () => {
  let adapter: InternalToXmlAdapter;

  beforeEach(() => {
    adapter = new InternalToXmlAdapter();
  });

  it('должен быть определен', () => {
    expect(adapter).toBeDefined();
  });

  describe('adapt', () => {
    it('должен преобразовать InternalMessage в XML-строку', async () => {
      const internalMessage: InternalMessage = {
        queueId: 1,
        userId: 10,
        status: 'completed',
        date: '2023-01-01',
        time: '10:00',
        notificationMinutes: 15,
        notificationPosition: 2,
        comment: 'Entry processed.',
      };
      const expectedXml = `<?xml version="1.0" encoding="UTF-8"?><response><queueId>1</queueId><userId>10</userId><status>completed</status><date>2023-01-01</date><time>10:00</time><notificationMinutes>15</notificationMinutes><notificationPosition>2</notificationPosition><comment>Entry processed.</comment></response>`;

      const result = adapter.adapt(internalMessage);
      // Проверяем, что XML валиден и содержит нужные данные
      const parsedResult = await parseStringPromise(result, { explicitArray: false, mergeAttrs: true });
      const parsedExpected = await parseStringPromise(expectedXml, { explicitArray: false, mergeAttrs: true });

      expect(parsedResult).toEqual(parsedExpected);
    });

    it('должен преобразовать InternalMessage с минимальными полями', async () => {
      const internalMessage: InternalMessage = {
        queueId: 5,
        userId: 50,
      };
      const expectedXml = `<?xml version="1.0" encoding="UTF-8"?><response><queueId>5</queueId><userId>50</userId></response>`;

      const result = adapter.adapt(internalMessage);
      const parsedResult = await parseStringPromise(result, { explicitArray: false, mergeAttrs: true });
      const parsedExpected = await parseStringPromise(expectedXml, { explicitArray: false, mergeAttrs: true });

      expect(parsedResult).toEqual(parsedExpected);
    });

    it('должен корректно обрабатывать пустые строки и null значения', async () => {
      const internalMessage: InternalMessage = {
        queueId: 1,
        userId: 10,
        comment: null,
        status: '',
      };
      // Обратите внимание: xmlbuilder может исключать null/undefined поля по умолчанию
      // и включать пустые строки. Убедитесь, что это соответствует вашему ожидаемому поведению.
      const expectedXml = `<?xml version="1.0" encoding="UTF-8"?><response><queueId>1</queueId><userId>10</userId><status></status><comment></comment></response>`;

      const result = adapter.adapt(internalMessage);
      const parsedResult = await parseStringPromise(result, { explicitArray: false, mergeAttrs: true });
      const parsedExpected = await parseStringPromise(expectedXml, { explicitArray: false, mergeAttrs: true });

      expect(parsedResult).toEqual(parsedExpected);
    });

    it('должен корректно обрабатывать числовые поля', async () => {
      const internalMessage: InternalMessage = {
        queueId: 123,
        userId: 456,
        notificationMinutes: 30,
        notificationPosition: 5,
      };
      const expectedXml = `<?xml version="1.0" encoding="UTF-8"?><response><queueId>123</queueId><userId>456</userId><notificationMinutes>30</notificationMinutes><notificationPosition>5</notificationPosition></response>`;

      const result = adapter.adapt(internalMessage);
      const parsedResult = await parseStringPromise(result, { explicitArray: false, mergeAttrs: true });
      const parsedExpected = await parseStringPromise(expectedXml, { explicitArray: false, mergeAttrs: true });

      expect(parsedResult).toEqual(parsedExpected);
    });
  });
});
