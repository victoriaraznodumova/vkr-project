import { InboundConverter } from '../interfaces/inbound-converter.interface';
import { InternalFormat } from '../../../common/internal-format.interface';
import * as yaml from 'js-yaml'; // Импортируем библиотеку js-yaml

export class YamlToInternalConverterService implements InboundConverter {
  async convert(yamlString: string): Promise<InternalFormat> {
    // console.log('[YamlToInternalConverter]: Преобразование YAML во внутренний формат.');
    let parsedData: any;

    try {
      if (typeof yamlString !== 'string' || yamlString.trim().length === 0) {
        throw new Error('Входные данные отсутствуют, пусты или имеют некорректный тип (ожидается непустая строка YAML).');
      }
      // Используем js-yaml для парсинга YAML строки
      parsedData = yaml.load(yamlString);

      // Проверяем, что результат парсинга является объектом, а не простым значением
      if (typeof parsedData !== 'object' || parsedData === null || Array.isArray(parsedData)) {
        throw new Error('Неверный формат YAML: Ожидается корневой объект.');
      }

    } catch (error) {
      console.error(`[YamlToInternalConverter]: Ошибка парсинга YAML: ${error.message}`);
      throw new Error(`Неверный формат YAML: ${error.message}`);
    }

    // Валидация обязательных полей, аналогично JSON и XML адаптерам
    if (parsedData.queueId === undefined || parsedData.queueId === null) {
      throw new Error('Отсутствует обязательное поле: queueId');
    }
    if (parsedData.userId === undefined || parsedData.userId === null) {
      throw new Error('Отсутствует обязательное поле: userId');
    }

    // Создание InternalFormat с маппингом всех полей
    // Обратите внимание: YAML не имеет строгой типизации по умолчанию,
    // поэтому парсинг чисел может быть необязателен, если js-yaml уже справился.
    // Однако явное преобразование в число через parseInt для безопасности не помешает,
    // если данные могут приходить в виде строк (как в XML).
    const internalFormat: InternalFormat = {
      queueId: typeof parsedData.queueId === 'string' ? parseInt(parsedData.queueId, 10) : parsedData.queueId,
      userId: typeof parsedData.userId === 'string' ? parseInt(parsedData.userId, 10) : parsedData.userId,
      status: parsedData.status || undefined,
      date: parsedData.date || undefined,
      time: parsedData.time || undefined,
      notificationMinutes: parsedData.notificationMinutes ? (typeof parsedData.notificationMinutes === 'string' ? parseInt(parsedData.notificationMinutes, 10) : parsedData.notificationMinutes) : undefined,
      notificationPosition: parsedData.notificationPosition ? (typeof parsedData.notificationPosition === 'string' ? parseInt(parsedData.notificationPosition, 10) : parsedData.notificationPosition) : undefined,
      comment: parsedData.comment || undefined,
    };

    return internalFormat;
  }
}