// src/integration/message-processing.facade.ts

import { Injectable } from '@nestjs/common';
import { AdapterFactory } from '../adapters/adapter.factory';
import { InternalMessage } from '../common/internal-message.interface'; // Убедитесь, что InternalMessage определен и содержит userId
// import { QueuesService } from '../queues/queues.service'; // <-- УДАЛЯЕМ: QueuesService не создает записи
import { EntryService } from '../entries/entry.service'; // <-- ДОБАВЛЯЕМ: EntryService создает записи
import { CreateEntryDto } from '../entries/dto/create-entry.dto'; // Убедитесь, что CreateEntryDto не содержит userId
import { Entry } from '../entries/entity/entry.entity'; // Убедитесь, что путь правильный

@Injectable()
export class MessageProcessingFacade {
  constructor(
    private readonly adapterFactory: AdapterFactory,
    // private readonly queuesService: QueuesService, // <-- УДАЛЯЕМ: QueuesService не нужен здесь для создания записи
    private readonly entryService: EntryService, // <-- ДОБАВЛЯЕМ: Инжектируем EntryService
  ) {}

  async processMessage(rawData: string, contentType: string, acceptHeaders: string): Promise<string> {
    console.log(`[MessageProcessingFacade]: Начало обработки сообщения. Content-Type: ${contentType}, Accept: ${acceptHeaders}`);

    try {
      // 1. Получить входящий адаптер
      const inboundAdapter = this.adapterFactory.getInboundAdapter(contentType);

      // 2. Адаптировать входящие данные во внутренний формат (InternalMessage)
      const internalMessage: InternalMessage = await inboundAdapter.adapt(rawData);
      console.log('[MessageProcessingFacade]: Данные преобразованы во внутренний формат:', internalMessage);

      // 3. Сформировать CreateEntryDto из InternalMessage
      const createEntryDto: CreateEntryDto = {
        queueId: internalMessage.queueId,
        // Маппинг других полей из internalMessage в CreateEntryDto
        date: internalMessage.date, // Если internalMessage имеет 'date'
        time: internalMessage.time, // Если internalMessage имеет 'time'
        notificationMinutes: internalMessage.notificationMinutes, // Если internalMessage имеет 'notificationMinutes'
        notificationPosition: internalMessage.notificationPosition, // Если internalMessage имеет 'notificationPosition'
        // Добавьте другие поля, которые ожидаются в CreateEntryDto
      };
      console.log('[MessageProcessingFacade]: Сформирован CreateEntryDto:', createEntryDto);

      // 4. Передать данные в EntryService для создания записи.
      // ИСПРАВЛЕНО: Вызываем entryService.create, передавая DTO и userId ОТДЕЛЬНО
      const newEntry: Entry = await this.entryService.create(createEntryDto, internalMessage.userId);
      console.log('[MessageProcessingFacade]: Запись успешно добавлена в очередь. Результат:', newEntry);

      // 5. Получить исходящий адаптер
      const outboundAdapter = this.adapterFactory.getOutboundAdapter(acceptHeaders);

      // 6. Адаптировать результат для клиента
      const responseData: string = outboundAdapter.adapt(newEntry as InternalMessage); // Приводим Entry к InternalMessage для адаптера
      console.log('[MessageProcessingFacade]: Ответ преобразован в формат клиента.');

      return responseData;
    } catch (error) {
      console.error(`[MessageProcessingFacade]: Ошибка обработки: ${error.message}`);
      throw error;
    }
  }
}