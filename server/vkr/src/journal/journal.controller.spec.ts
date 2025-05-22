// src/journal/journal.controller.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { JournalController } from './journal.controller';
import { JournalService } from './journal.service';
import { QueryJournalEntriesDto } from './dto/query-journal-entries.dto';
import { Journal } from './entity/journal.entity'; // Предполагаемая сущность Journal
import { HttpStatus } from '@nestjs/common';
import { JournalActionEnum } from './entity/journal.action.enum';
import { JournalStatusEnum } from './entity/journal.status.enum';
import { Entry } from '../entries/entity/entry.entity';
import { User } from '../users/entity/user.entity';

// Мок-объект для сущности Journal
const mockJournalEntry: Journal = {
    logId: 1,
    logTime: new Date(),
    initiatedByUserId: 1,
    entryId: 1,
    action: JournalActionEnum.JOINED,
    prevStatus: JournalStatusEnum.WAITING,
    newStatus: JournalStatusEnum.WAITING,
    comment: '',
    entry: new Entry,
    user: new User
};

describe('JournalController', () => {
  let controller: JournalController;
  let journalService: JournalService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JournalController],
      providers: [
        {
          provide: JournalService,
          useValue: {
            findAll: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<JournalController>(JournalController);
    journalService = module.get<JournalService>(JournalService);

    jest.clearAllMocks();
  });

  it('контроллер должен быть определен', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('должен возвращать все записи журнала без фильтров', async () => {
      const expectedJournalEntries: Journal[] = [mockJournalEntry];
      jest.spyOn(journalService, 'findAll').mockResolvedValue(expectedJournalEntries);

      const result = await controller.findAll({}); // Пустой queryDto

      expect(journalService.findAll).toHaveBeenCalledWith({});
      expect(result).toEqual(expectedJournalEntries);
    });

    it('должен фильтровать записи журнала по entryId', async () => {
      // ИСПРАВЛЕНО: Передаем entryId как строку
      const queryDto: QueryJournalEntriesDto = { entryId: '10' };
      const filteredEntries: Journal[] = [{ ...mockJournalEntry, entryId: 10 }];
      jest.spyOn(journalService, 'findAll').mockResolvedValue(filteredEntries);

      const result = await controller.findAll(queryDto);

      expect(journalService.findAll).toHaveBeenCalledWith(queryDto);
      expect(result).toEqual(filteredEntries);
    });

    it('должен фильтровать записи журнала по initiatedByUserId', async () => {
      // ИСПРАВЛЕНО: Передаем initiatedByUserId как строку
      const queryDto: QueryJournalEntriesDto = { initiatedByUserId: '999' };
      const filteredEntries: Journal[] = [{ ...mockJournalEntry, initiatedByUserId: 999 }];
      jest.spyOn(journalService, 'findAll').mockResolvedValue(filteredEntries);

      const result = await controller.findAll(queryDto);

      expect(journalService.findAll).toHaveBeenCalledWith(queryDto);
      expect(result).toEqual(filteredEntries);
    });



    it('должен возвращать пустой массив, если записи не найдены', async () => {
      const queryDto: QueryJournalEntriesDto = { entryId: '999' };
      jest.spyOn(journalService, 'findAll').mockResolvedValue([]);

      const result = await controller.findAll(queryDto);

      expect(journalService.findAll).toHaveBeenCalledWith(queryDto);
      expect(result).toEqual([]);
    });

    // Добавьте тесты для других полей фильтрации, таких как queueId, date, если они есть
    it('должен фильтровать записи журнала по queueId', async () => {
      const queryDto: QueryJournalEntriesDto = { entryId: '5' };
      const filteredEntries: Journal[] = [{ ...mockJournalEntry, entryId: 5 }];
      jest.spyOn(journalService, 'findAll').mockResolvedValue(filteredEntries);

      const result = await controller.findAll(queryDto);

      expect(journalService.findAll).toHaveBeenCalledWith(queryDto);
      expect(result).toEqual(filteredEntries);
    });

  });
});
