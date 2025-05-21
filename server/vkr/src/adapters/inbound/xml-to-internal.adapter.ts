import { Injectable } from '@nestjs/common';
import { InboundAdapter } from '../interfaces/inbound-adapter.interface';
import { InternalMessage } from '../../common/internal-message.interface';
import { parseStringPromise } from 'xml2js';

@Injectable()
export class XmlToInternalAdapter implements InboundAdapter {
  async adapt(rawData: string): Promise<InternalMessage> {
    console.log('[XmlToInternalAdapter]: Начало адаптации XML.');
    console.log(`[XmlToInternalAdapter]: Полученные сырые данные (rawData): "${rawData.substring(0, 500)}..."`); // Логируем начало данных
    console.log(`[XmlToInternalAdapter]: Длина rawData: ${rawData ? rawData.length : 0}`);

    if (!rawData || typeof rawData !== 'string' || rawData.trim().length === 0) {
      throw new Error('Входящие XML данные отсутствуют, пусты или имеют некорректный тип (ожидается непустая строка).');
    }

    let result: any;
    try {
      result = await parseStringPromise(rawData, { explicitArray: false, mergeAttrs: true });
      console.log('[XmlToInternalAdapter]: Результат парсинга xml2js (result):', JSON.stringify(result, null, 2));

      if (typeof result !== 'object' || result === null || Object.keys(result).length === 0) {
        // Эта проверка теперь должна ловить случаи, когда xml2js не может распарсить XML в валидный объект
        throw new Error('Результат парсинга XML не является валидным объектом. Возможно, XML некорректен.');
      }

      const rootElementNames = Object.keys(result);
      const rootElementName = rootElementNames[0];
      console.log('[XmlToInternalAdapter]: Имя корневого элемента:', rootElementName);

      const data = result[rootElementName];
      if (typeof data !== 'object' || data === null) {
        throw new Error('Данные корневого элемента XML не являются объектом или пусты после парсинга.');
      }

      // Маппинг данных из XML в InternalMessage
      const internalMessage: InternalMessage = {
        queueId: data.queueId ? parseInt(data.queueId, 10) : undefined,
        userId: data.userId ? parseInt(data.userId, 10) : undefined,
        date: data.date || undefined,
        time: data.time || undefined,
        notificationMinutes: data.notificationMinutes ? parseInt(data.notificationMinutes, 10) : undefined,
        notificationPosition: data.notificationPosition ? parseInt(data.notificationPosition, 10) : undefined,
        // Добавьте другие поля по мере необходимости
        // someExternalField: data.someExternalField || undefined, // Если нужно маппить
      };

      // Проверка обязательных полей
      if (typeof internalMessage.queueId !== 'number' || isNaN(internalMessage.queueId)) {
        throw new Error('Поле queueId отсутствует или имеет некорректный формат.');
      }
      if (typeof internalMessage.userId !== 'number' || isNaN(internalMessage.userId)) {
        throw new Error('Поле userId отсутствует или имеет некорректный формат.');
      }

      console.log('[XmlToInternalAdapter]: Сформировано InternalMessage:', internalMessage);
      return internalMessage;
    } catch (error) {
      console.error(`[XmlToInternalAdapter]: Ошибка парсинга XML: ${error.message}`);
      // Перебрасываем более информативное сообщение об ошибке
      throw new Error(`Неверный формат XML: ${error.message}`);
    }
  }
}