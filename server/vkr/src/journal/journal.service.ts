import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';
import { Journal } from './entity/journal.entity'; // Изменено с JournalEntry на Journal
import { CreateJournalEntryDto } from './dto/create-journal-entry.dto';
import { QueryJournalEntriesDto } from './dto/query-journal-entries.dto';
import { JournalStatusEnum } from './entity/journal-status.enum'; // Импортируем новый enum
import { JournalActionEnum } from './entity/journal-action.enum'; // Импортируем новый enum

/**
 * Сервис для управления записями в журнале действий.
 * Отвечает за логирование и получение данных журнала.
 */
@Injectable()
export class JournalService {
  constructor(
    @InjectRepository(Journal) // Изменено с JournalEntry на Journal
    private readonly journalRepository: Repository<Journal>, // Изменено имя репозитория
  ) {}

  /**
   * Логирует действие, связанное с записью в очереди.
   * @param createJournalEntryDto DTO с данными для создания записи журнала.
   * @returns Promise с созданной сущностью Journal.
   */
  async logEntryAction(createJournalEntryDto: CreateJournalEntryDto): Promise<Journal> {
    // logTime будет автоматически установлен благодаря @CreateDateColumn
    const journalEntry = this.journalRepository.create(createJournalEntryDto);
    return this.journalRepository.save(journalEntry);
  }

  /**
   * Находит все записи в журнале с возможностью фильтрации.
   * @param queryDto DTO для фильтрации записей.
   * @returns Promise с массивом сущностей Journal.
   */
  async findAll(queryDto: QueryJournalEntriesDto): Promise<Journal[]> {
    const findOptions: FindManyOptions<Journal> = {
      relations: ['entry', 'user'], // Загружаем связанные сущности
      where: {},
      order: {
        logTime: 'DESC', // Сортируем по времени по убыванию, чтобы видеть последние события первыми
      },
    };

    if (queryDto.entryId) {
      findOptions.where['entryId'] = parseInt(queryDto.entryId, 10);
    }
    if (queryDto.initiatedByUserId) {
      findOptions.where['initiatedByUserId'] = parseInt(queryDto.initiatedByUserId, 10);
    }
    if (queryDto.action) {
      findOptions.where['action'] = queryDto.action;
    }

    return this.journalRepository.find(findOptions);
  }

  /**
   * Находит запись в журнале по ее ID.
   * @param id ID записи журнала.
   * @returns Promise с сущностью Journal или null.
   */
  async findOne(id: number): Promise<Journal | null> {
    return this.journalRepository.findOne({
      where: { logId: id }, // Изменено с id на logId
      relations: ['entry', 'user'],
    });
  }
}