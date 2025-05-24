import { parseStringPromise } from 'xml2js';
import { InboundConverter } from '../interfaces/inbound-converter.interface';
import { InternalFormat } from '../../../common/internal-format.interface';

export class XmlToInternalConverterService implements InboundConverter {
  async convert(rawData: string): Promise<InternalFormat> {
    // console.log('[XmlToInternalConverter]: Начало адаптации XML.');

    if (typeof rawData !== 'string' || rawData.trim().length === 0) {
      throw new Error('Входящие XML данные отсутствуют, пусты или имеют некорректный тип (ожидается непустая строка).');
    }

    // console.log(`[XmlToInternalConverter]: Полученные сырые данные (rawData): "${rawData.substring(0, Math.min(rawData.length, 500))}..."`);
    // console.log(`[XmlToInternalConverter]: Длина rawData: ${rawData.length}`);

    let result: any;
    try {
      result = await parseStringPromise(rawData, { explicitArray: false, mergeAttrs: true });
      // console.log('[XmlToInternalConverter]: Результат парсинга xml2js (result):', JSON.stringify(result, null, 2));

      // проверяем, что есть ровно один корневой элемент
      const rootKeys = Object.keys(result);
      if (rootKeys.length !== 1) {
        throw new Error('Неверный формат XML: Ожидается один корневой элемент.');
      }
      const rootElement = rootKeys[0];

      // Дополнительная проверка: корневой элемент должен быть объектом, содержащим поля
      if (!result[rootElement] || typeof result[rootElement] !== 'object' || Array.isArray(result[rootElement])) {
        throw new Error('Неверный формат XML: Корневой элемент пуст или имеет некорректный формат.');
      }

    } catch (error) {
      // console.error(`[XmlToInternalConverter]: Ошибка парсинга XML: ${error.message}`);
      throw new Error(`Неверный формат XML: ${error.message}`);
    }

    const rootElement = Object.keys(result)[0];
    const data = result[rootElement];
    // console.log(`[XmlToInternalConverter]: Имя корневого элемента: ${rootElement}`);

    // Валидация обязательных полей
    if (data.queueId === undefined || data.queueId === null) {
      throw new Error('Отсутствует обязательное поле: queueId');
    }
    if (data.userId === undefined || data.userId === null) {
      throw new Error('Отсутствует обязательное поле: userId');
    }

    const internalFormat: InternalFormat = {
      queueId: parseInt(data.queueId, 10),
      userId: parseInt(data.userId, 10),
      status: data.status || undefined,
      date: data.date || undefined,
      time: data.time || undefined,
      notificationMinutes: data.notificationMinutes ? parseInt(data.notificationMinutes, 10) : undefined,
      notificationPosition: data.notificationPosition ? parseInt(data.notificationPosition, 10) : undefined,
      comment: data.comment || undefined,
    };

    // console.log('[XmlToInternalConverter]: Сформировано InternalMessage:', internalFormat);
    return internalFormat;
  }
}