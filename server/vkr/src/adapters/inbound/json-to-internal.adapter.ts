// src/adapters/inbound/json-to-internal.adapter.ts

import { InboundAdapter } from '../interfaces/inbound-adapter.interface';
import { InternalMessage } from '../../common/internal-message.interface'; // Убедитесь, что путь правильный

export class JsonToInternalAdapter implements InboundAdapter {
  async adapt(jsonString: string): Promise<InternalMessage> {
    console.log('[JsonToInternalAdapter]: Преобразование JSON во внутренний формат.');
    let parsedData: any;

    try {
      if (typeof jsonString !== 'string') {
        throw new Error('Входные данные не являются строкой JSON.');
      }
      parsedData = JSON.parse(jsonString);
    } catch (error) {
      console.error(`[JsonToInternalAdapter]: Ошибка парсинга JSON: ${error.message}`);
      throw new Error(`Неверный формат JSON: ${error.message}`);
    }

    // Валидация обязательных полей
    if (parsedData.queueId === undefined || parsedData.queueId === null) {
      throw new Error('Отсутствует обязательное поле: queueId');
    }
    if (parsedData.userId === undefined || parsedData.userId === null) {
      throw new Error('Отсутствует обязательное поле: userId');
    }

    // Создание InternalMessage с маппингом всех полей
    const internalMessage: InternalMessage = {
      queueId: parsedData.queueId,
      userId: parsedData.userId,
      status: parsedData.status,
      date: parsedData.date,
      time: parsedData.time,
      notificationMinutes: parsedData.notificationMinutes,
      notificationPosition: parsedData.notificationPosition,
      comment: parsedData.comment,
    };

    return internalMessage;
  }
}
