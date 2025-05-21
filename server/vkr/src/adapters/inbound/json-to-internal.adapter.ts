import { Injectable } from '@nestjs/common';
import { InboundAdapter } from '../interfaces/inbound-adapter.interface';
import { InternalMessage } from '../../common/internal-message.interface';

@Injectable()
export class JsonToInternalAdapter implements InboundAdapter {
  async adapt(rawData: string): Promise<InternalMessage> {
    console.log('[JsonToInternalAdapter]: Преобразование JSON во внутренний формат.');
    try {
      const parsedData = JSON.parse(rawData);
      // Предполагаем, что JSON напрямую соответствует InternalMessage/CreateEntryDto
      const internalMessage: InternalMessage = {
        queueId: parsedData.queueId,
        userId: parsedData.userId,
        date: parsedData.date,
        time: parsedData.time,
        notificationMinutes: parsedData.notificationMinutes,
        notificationPosition: parsedData.notificationPosition,
        // ... другие поля
      };
      return internalMessage;
    } catch (error) {
      console.error(`[JsonToInternalAdapter]: Ошибка парсинга JSON: ${error.message}`);
      throw new Error(`Неверный формат JSON: ${error.message}`);
    }
  }
}