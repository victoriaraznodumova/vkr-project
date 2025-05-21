// src/journal/journal.controller.ts

import { Controller, Get, Param, Query, ParseIntPipe, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { JournalService } from './journal.service';
import { Journal } from './entity/journal.entity'; // Изменено с JournalEntry на Journal
import { QueryJournalEntriesDto } from './dto/query-journal-entries.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { JournalDto } from './dto/journal.dto'; // Импортируем JournalDto

/**
 * Контроллер для работы с записями журнала.
 * Предоставляет эндпоинты для получения данных журнала.
 */
@ApiTags('journal') // Группировка в Swagger UI
@Controller('journal')
@UseInterceptors(ClassSerializerInterceptor) // Используем для преобразования сущностей в DTO
export class JournalController {
  constructor(private readonly journalService: JournalService) {}

  /**
   * Получает все записи журнала с возможностью фильтрации.
   * @param queryDto DTO для фильтрации записей.
   * @returns Promise с массивом записей журнала.
   */
  @Get()
  @ApiOperation({ summary: 'Получить все записи журнала' })
  @ApiResponse({ status: 200, description: 'Возвращает список записей журнала.', type: [JournalDto] }) // Используем JournalDto
  @ApiQuery({ name: 'entryId', required: false, description: 'Фильтр по ID записи очереди' })
  @ApiQuery({ name: 'initiatedByUserId', required: false, description: 'Фильтр по ID пользователя, инициировавшего событие' })
  @ApiQuery({ name: 'action', required: false, description: 'Фильтр по типу действия (например, "joined", "removed")' })
  async findAll(@Query() queryDto: QueryJournalEntriesDto): Promise<JournalDto[]> {
    const journalEntries = await this.journalService.findAll(queryDto);
    return journalEntries.map(entry => new JournalDto(entry)); // Преобразуем сущности в DTO
  }

  /**
   * Получает одну запись журнала по ее ID.
   * @param id ID записи журнала.
   * @returns Promise с записью журнала.
   */
  @Get(':id')
  @ApiOperation({ summary: 'Получить запись журнала по ID' })
  @ApiResponse({ status: 200, description: 'Возвращает запись журнала по указанному ID.', type: JournalDto }) // Используем JournalDto
  @ApiResponse({ status: 404, description: 'Запись журнала не найдена.' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<JournalDto | null> {
    const journalEntry = await this.journalService.findOne(id);
    return journalEntry ? new JournalDto(journalEntry) : null; // Преобразуем сущность в DTO
  }
}
