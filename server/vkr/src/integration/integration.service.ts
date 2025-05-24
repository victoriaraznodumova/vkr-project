import { Injectable } from '@nestjs/common';
import { ConverterFactoryService } from './converters/converter-factory.service';
import { InternalFormat } from '../common/internal-format.interface'; 
import { EntryService } from '../entries/entry.service'; 
import { CreateEntryDto } from '../entries/dto/create-entry.dto';
import { Entry } from '../entries/entity/entry.entity';

@Injectable()
export class FormatProcessingService {
  constructor(
    private readonly converterFactory: ConverterFactoryService,
    private readonly entryService: EntryService, 
  ) {}

  async processFormat(rawData: string, contentType: string, acceptHeaders: string): Promise<string> {
    console.log(`[FormatProcessingService]: Начало обработки сообщения. Content-Type: ${contentType}, Accept: ${acceptHeaders}`);
    try {
      // Получаем входящий адаптер
      const inboundConverter = this.converterFactory.getInboundConverter(contentType);

      // Адаптируем входящие данные во внутренний формат (InternalFormat)
      const internalFormat: InternalFormat = await inboundConverter.convert(rawData);
      console.log('[FormatProcessingService]: Данные преобразованы во внутренний формат:', internalFormat);

      // Формируем CreateEntryDto из InternalFormat
      const createEntryDto: CreateEntryDto = {
        queueId: internalFormat.queueId,
        // Маппинг других полей из InternalFormat в CreateEntryDto
        date: internalFormat.date, 
        time: internalFormat.time,
        notificationMinutes: internalFormat.notificationMinutes, 
        notificationPosition: internalFormat.notificationPosition,
      };
      console.log('[FormatProcessingService]: Сформирован CreateEntryDto:', createEntryDto);

      // Передаем DTO и userId в EntryService для создания записи
      const newEntry: Entry = await this.entryService.create(createEntryDto, internalFormat.userId);
      console.log('[FormatProcessingService]: Запись успешно добавлена в очередь. Результат:', newEntry);

      // Получаем исходящий адаптер
      const outboundConverter = this.converterFactory.getOutboundConverter(acceptHeaders);

      // Адаптируем для клиента результат из InternalFormat в нужный ему формат
      const responseData: string = outboundConverter.convert(newEntry as InternalFormat);
      console.log('[FormatProcessingService]: Ответ преобразован в формат клиента.');

      return responseData;
    } catch (error) {
      console.error(`[FormatProcessingService]: Ошибка обработки: ${error.message}`);
      throw error;
    }
  }
}