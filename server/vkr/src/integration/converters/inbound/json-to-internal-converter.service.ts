import { InboundConverter } from '../interfaces/inbound-converter.interface';
import { InternalFormat } from '../../../common/internal-format.interface';

export class JsonToInternalConverterService implements InboundConverter {
  async convert(jsonString: string): Promise<InternalFormat> {
    // console.log('[JsonToInternalConverter]: Преобразование JSON во внутренний формат.');
    let parsedData: any;

    try {
      if (typeof jsonString !== 'string') {
        throw new Error('Входные данные не являются строкой JSON.');
      }
      parsedData = JSON.parse(jsonString);
    } catch (error) {
      console.error(`[JsonToInternalConverter]: Ошибка парсинга JSON: ${error.message}`);
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
    const internalFormat: InternalFormat = {
      queueId: parsedData.queueId,
      userId: parsedData.userId,
      status: parsedData.status,
      date: parsedData.date,
      time: parsedData.time,
      notificationMinutes: parsedData.notificationMinutes,
      notificationPosition: parsedData.notificationPosition,
      comment: parsedData.comment,
    };

    return internalFormat;
  }
}