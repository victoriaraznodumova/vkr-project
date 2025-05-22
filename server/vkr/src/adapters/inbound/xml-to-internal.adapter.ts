// src/adapters/inbound/xml-to-internal.adapter.ts

import { parseStringPromise } from 'xml2js';
import { InboundAdapter } from '../interfaces/inbound-adapter.interface';
import { InternalMessage } from '../../common/internal-message.interface'; // Убедитесь, что путь правильный

export class XmlToInternalAdapter implements InboundAdapter {
  async adapt(rawData: string): Promise<InternalMessage> {
    console.log('[XmlToInternalAdapter]: Начало адаптации XML.');

    if (typeof rawData !== 'string' || rawData.trim().length === 0) {
      throw new Error('Входящие XML данные отсутствуют, пусты или имеют некорректный тип (ожидается непустая строка).');
    }

    console.log(`[XmlToInternalAdapter]: Полученные сырые данные (rawData): "${rawData.substring(0, Math.min(rawData.length, 500))}..."`);
    console.log(`[XmlToInternalAdapter]: Длина rawData: ${rawData.length}`);

    let result: any;
    try {
      result = await parseStringPromise(rawData, { explicitArray: false, mergeAttrs: true });
      console.log('[XmlToInternalAdapter]: Результат парсинга xml2js (result):', JSON.stringify(result, null, 2));

      // НОВАЯ ПРОВЕРКА: Убедимся, что есть ровно один корневой элемент
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
      console.error(`[XmlToInternalAdapter]: Ошибка парсинга XML: ${error.message}`);
      throw new Error(`Неверный формат XML: ${error.message}`);
    }

    const rootElement = Object.keys(result)[0];
    const data = result[rootElement];
    console.log(`[XmlToInternalAdapter]: Имя корневого элемента: ${rootElement}`);

    // Валидация обязательных полей
    if (data.queueId === undefined || data.queueId === null) {
      throw new Error('Отсутствует обязательное поле: queueId');
    }
    if (data.userId === undefined || data.userId === null) {
      throw new Error('Отсутствует обязательное поле: userId');
    }

    const internalMessage: InternalMessage = {
      queueId: parseInt(data.queueId, 10),
      userId: parseInt(data.userId, 10),
      status: data.status || undefined,
      date: data.date || undefined,
      time: data.time || undefined,
      notificationMinutes: data.notificationMinutes ? parseInt(data.notificationMinutes, 10) : undefined,
      notificationPosition: data.notificationPosition ? parseInt(data.notificationPosition, 10) : undefined,
      comment: data.comment || undefined,
    };

    console.log('[XmlToInternalAdapter]: Сформировано InternalMessage:', internalMessage);
    return internalMessage;
  }
}