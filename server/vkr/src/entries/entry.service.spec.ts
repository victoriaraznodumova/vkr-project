// src/entries/entry.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EntryService } from '../entries/entry.service';
import { Entry } from '../entries/entity/entry.entity';
import { Queue } from '../queues/entity/queue.entity';
import { User } from '../users/entity/user.entity'; // Убедитесь, что это правильный путь к вашей сущности User
import { CreateEntryDto } from '../entries/dto/create-entry.dto';
import { UpdateEntryDto } from '../entries/dto/update-entry.dto';
import { NotFoundException, BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { EntryStatusEnum } from '../entries/entity/entry.status.enum';
import { QueueService } from '../queues/queue.service';
import { JournalService } from '../journal/journal.service';
import { QueueTypeEnum } from '../queues/entity/queue.type.enum';
import { QueueVisibilityEnum } from '../queues/entity/queue.visibility.enum';
import { UserRoleEnum } from '../users/entity/user-role.enum'; // Убедитесь, что этот импорт существует

// --- Мок-объекты для тестирования ---

const mockUser: User = {
  userId: 1,
  email: 'test@example.com',
  passwordHash: 'hashedpassword_user', // ИСПРАВЛЕНО: password -> passwordHash
  registrationDate: new Date('2023-01-01T00:00:00Z'), // ДОБАВЛЕНО
  role: UserRoleEnum.USER, // ДОБАВЛЕНО
  entries: [],
  administrators: [], // ДОБАВЛЕНО
  queues: [], // ДОБАВЛЕНО
  initiatedEvents: [], // ДОБАВЛЕНО
  passwordResetTokens: [], // ДОБАВЛЕНО
};

const mockAdminUser: User = {
  userId: 100,
  email: 'admin@example.com',
  passwordHash: 'hashedpassword_admin', // ИСПРАВЛЕНО: password -> passwordHash
  registrationDate: new Date('2023-01-01T00:00:00Z'), // ДОБАВЛЕНО
  role: UserRoleEnum.ADMIN, // ДОБАВЛЕНО
  entries: [],
  administrators: [], // ДОБАВЛЕНО
  queues: [], // ДОБАВЛЕНО
  initiatedEvents: [], // ДОБАВЛЕНО
  passwordResetTokens: [], // ДОБАВЛЕНО
};

const mockEntry: Entry = {
  entryId: 1,
  queueId: 1,
  userId: 1,
  status: EntryStatusEnum.WAITING,
  date: '2023-05-20',
  time: '10:00',
  notificationMinutes: 15,
  notificationPosition: 2,
  comment: 'Initial entry',
  createdAt: new Date(),
  updatedAt: new Date(),
  queue: null, // Будет мокироваться отдельно
  user: null, // Будет мокироваться отдельно
};

// Mock Queue entities
const mockOrganizationalQueue: Queue = {
  queueId: 1,
  name: 'Организационная Очередь',
  type: QueueTypeEnum.ORGANIZATIONAL,
  city: 'Город А',
  address: 'Адрес А',
  openingHours: '9:00-17:00',
  serviceName: 'Сервис А',
  intervalMinutes: 15,
  concurrentVisitors: 1,
  privateLinkToken: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  createdByUserId: mockAdminUser.userId, // Создана админом
  visibility: QueueVisibilityEnum.PUBLIC, // Уточняем видимость
  organizationId: null, // Если нет организации, то null
  organization: null, // Связь с организацией
  createdBy: mockAdminUser, // Связь с создателем
  administrators: [mockAdminUser], // Администраторы очереди
  entries: [],
  isActive: true,
};

const mockSelfOrganizedQueue: Queue = {
  queueId: 2,
  name: 'Самоорганизованная Очередь',
  type: QueueTypeEnum.SELF_ORGANIZED,
  city: 'Город Б',
  address: 'Адрес Б',
  openingHours: '24/7',
  serviceName: 'Сервис Б',
  intervalMinutes: 5,
  concurrentVisitors: 2,
  privateLinkToken: 'some-token-123',
  createdAt: new Date(),
  updatedAt: new Date(),
  createdByUserId: mockUser.userId, // Создана обычным пользователем
  visibility: QueueVisibilityEnum.PRIVATE, // Уточняем видимость
  organizationId: null,
  organization: null,
  createdBy: mockUser,
  administrators: [], // У самоорганизованных очередей могут быть администраторы, если логика это позволяет
  entries: [],
  isActive: true,
};

// Моки для зависимых сервисов
const mockQueueService = {
  findOne: jest.fn(),
  isUserAdminOfQueue: jest.fn(),
  // Добавьте другие методы QueueService, которые могут вызываться
};

const mockJournalService = {
  createJournalEntry: jest.fn(),
};

describe('EntryService', () => {
  let service: EntryService;
  let entryRepository: Repository<Entry>;
  let queueService: QueueService;
  let journalService: JournalService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EntryService,
        {
          provide: getRepositoryToken(Entry),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
            find: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: QueueService,
          useValue: mockQueueService,
        },
        {
          provide: JournalService,
          useValue: mockJournalService,
        },
      ],
    }).compile();

    service = module.get<EntryService>(EntryService);
    entryRepository = module.get<Repository<Entry>>(getRepositoryToken(Entry));
    queueService = module.get<QueueService>(QueueService);
    journalService = module.get<JournalService>(JournalService);

    jest.clearAllMocks();
  });

  it('сервис должен быть определен', () => {
    expect(service).toBeDefined();
  });

  // --- Тесты для create ---
  describe('create', () => {
    const createEntryDto: CreateEntryDto = {
      queueId: mockOrganizationalQueue.queueId,
      userId: mockUser.userId,
      date: '2023-05-21',
      time: '11:00',
      comment: 'New entry',
    };

    it('должен успешно создать запись в очереди (публичная очередь)', async () => {
      jest.spyOn(mockQueueService, 'findOne').mockResolvedValue(mockOrganizationalQueue);
      jest.spyOn(entryRepository, 'findOne').mockResolvedValue(undefined); // Запись не существует
      jest.spyOn(entryRepository, 'create').mockReturnValue(mockEntry as Entry);
      jest.spyOn(entryRepository, 'save').mockResolvedValue(mockEntry as Entry);
      jest.spyOn(journalService, 'createJournalEntry').mockResolvedValue(undefined);

      const result = await service.create(createEntryDto);

      expect(mockQueueService.findOne).toHaveBeenCalledWith(createEntryDto.queueId);
      expect(entryRepository.findOne).toHaveBeenCalledWith({
        where: {
          queueId: createEntryDto.queueId,
          userId: createEntryDto.userId,
          date: createEntryDto.date,
          time: createEntryDto.time,
        },
      });
      expect(entryRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        queueId: createEntryDto.queueId,
        userId: createEntryDto.userId,
        status: EntryStatusEnum.WAITING,
      }));
      expect(entryRepository.save).toHaveBeenCalled();
      expect(journalService.createJournalEntry).toHaveBeenCalled();
      expect(result).toEqual(mockEntry);
    });

    it('должен выбросить BadRequestException, если очередь неактивна', async () => {
      const inactiveQueue = { ...mockOrganizationalQueue, isActive: false };
      jest.spyOn(mockQueueService, 'findOne').mockResolvedValue(inactiveQueue);

      await expect(service.create(createEntryDto)).rejects.toThrow(
        new BadRequestException('Очередь неактивна и не принимает новые записи.'),
      );
      expect(entryRepository.save).not.toHaveBeenCalled();
    });

    it('должен выбросить ConflictException, если запись уже существует', async () => {
      jest.spyOn(mockQueueService, 'findOne').mockResolvedValue(mockOrganizationalQueue);
      jest.spyOn(entryRepository, 'findOne').mockResolvedValue(mockEntry); // Запись уже существует

      await expect(service.create(createEntryDto)).rejects.toThrow(
        new ConflictException('Запись на это время для этого пользователя уже существует в данной очереди.'),
      );
      expect(entryRepository.save).not.toHaveBeenCalled();
    });

    it('должен выбросить NotFoundException, если очередь не найдена', async () => {
      jest.spyOn(mockQueueService, 'findOne').mockRejectedValue(new NotFoundException('Очередь не найдена.'));

      await expect(service.create(createEntryDto)).rejects.toThrow(
        new NotFoundException('Очередь не найдена.'),
      );
      expect(entryRepository.save).not.toHaveBeenCalled();
    });

    // Добавьте тесты для логики concurrentVisitors, если она есть в QueueService
    // Например, если createEntryDto.time уже занято максимальным количеством посетителей.
  });

  // --- Тесты для findAll ---
  describe('findAll', () => {
    it('должен вернуть все записи', async () => {
      jest.spyOn(entryRepository, 'find').mockResolvedValue([mockEntry]);
      const result = await service.findAll();
      expect(entryRepository.find).toHaveBeenCalledWith({ relations: ['queue', 'user'] });
      expect(result).toEqual([mockEntry]);
    });
  });

  // --- Тесты для findOne ---
  describe('findOne', () => {
    it('должен вернуть запись по ID', async () => {
      jest.spyOn(entryRepository, 'findOne').mockResolvedValue(mockEntry);
      const result = await service.findOne(mockEntry.entryId);
      expect(entryRepository.findOne).toHaveBeenCalledWith({
        where: { entryId: mockEntry.entryId },
        relations: ['queue', 'user'],
      });
      expect(result).toEqual(mockEntry);
    });

    it('должен выбросить NotFoundException, если запись не найдена', async () => {
      jest.spyOn(entryRepository, 'findOne').mockResolvedValue(undefined);
      await expect(service.findOne(999)).rejects.toThrow(
        new NotFoundException(`Запись с ID 999 не найдена.`),
      );
    });
  });

  // --- Тесты для update ---
  describe('update', () => {
    const updateEntryDto: UpdateEntryDto = {
      status: EntryStatusEnum.COMPLETED,
      comment: 'Updated comment',
    };
    const updatedEntry = { ...mockEntry, ...updateEntryDto };

    it('должен успешно обновить запись (как создатель)', async () => {
      const entryToUpdate = { ...mockEntry, userId: mockUser.userId }; // Пользователь - создатель
      jest.spyOn(entryRepository, 'findOne').mockResolvedValue(entryToUpdate);
      jest.spyOn(entryRepository, 'save').mockResolvedValue(updatedEntry as Entry);
      jest.spyOn(journalService, 'createJournalEntry').mockResolvedValue(undefined);

      const result = await service.update(entryToUpdate.entryId, updateEntryDto, mockUser.userId);

      expect(entryRepository.findOne).toHaveBeenCalledWith({
        where: { entryId: entryToUpdate.entryId },
        relations: ['queue', 'user'],
      });
      expect(entryRepository.save).toHaveBeenCalledWith(expect.objectContaining(updateEntryDto));
      expect(journalService.createJournalEntry).toHaveBeenCalled();
      expect(result).toEqual(updatedEntry);
    });

    it('должен успешно обновить запись (как админ очереди)', async () => {
      const entryToUpdate = { ...mockEntry, queueId: mockOrganizationalQueue.queueId };
      jest.spyOn(entryRepository, 'findOne').mockResolvedValue(entryToUpdate);
      jest.spyOn(mockQueueService, 'isUserAdminOfQueue').mockResolvedValue(true); // Пользователь - админ
      jest.spyOn(entryRepository, 'save').mockResolvedValue(updatedEntry as Entry);
      jest.spyOn(journalService, 'createJournalEntry').mockResolvedValue(undefined);

      const result = await service.update(entryToUpdate.entryId, updateEntryDto, mockAdminUser.userId);

      expect(entryRepository.findOne).toHaveBeenCalledWith({
        where: { entryId: entryToUpdate.entryId },
        relations: ['queue', 'user'],
      });
      expect(mockQueueService.isUserAdminOfQueue).toHaveBeenCalledWith(mockAdminUser.userId, entryToUpdate.queueId);
      expect(entryRepository.save).toHaveBeenCalledWith(expect.objectContaining(updateEntryDto));
      expect(journalService.createJournalEntry).toHaveBeenCalled();
      expect(result).toEqual(updatedEntry);
    });

    it('должен выбросить NotFoundException, если запись не найдена', async () => {
      jest.spyOn(entryRepository, 'findOne').mockResolvedValue(undefined);

      await expect(service.update(999, updateEntryDto, mockUser.userId)).rejects.toThrow(
        new NotFoundException(`Запись с ID 999 не найдена.`),
      );
      expect(entryRepository.save).not.toHaveBeenCalled();
    });

    it('должен выбросить ForbiddenException, если пользователь не создатель и не админ', async () => {
      const entryToUpdate = { ...mockEntry, userId: mockUser.userId };
      const nonCreatorUserId = 99;
      jest.spyOn(entryRepository, 'findOne').mockResolvedValue(entryToUpdate);
      jest.spyOn(mockQueueService, 'isUserAdminOfQueue').mockResolvedValue(false); // Не админ

      await expect(service.update(entryToUpdate.entryId, updateEntryDto, nonCreatorUserId)).rejects.toThrow(
        new ForbiddenException('У вас нет разрешения на обновление этой записи.'),
      );
      expect(entryRepository.save).not.toHaveBeenCalled();
    });

    it('должен выбросить BadRequestException при попытке изменить queueId', async () => {
      const entryToUpdate = { ...mockEntry, userId: mockUser.userId };
      const updateDtoWithQueueId: UpdateEntryDto = { queueId: 99 };
      jest.spyOn(entryRepository, 'findOne').mockResolvedValue(entryToUpdate);

      await expect(service.update(entryToUpdate.entryId, updateDtoWithQueueId, mockUser.userId)).rejects.toThrow(
        new BadRequestException('Нельзя изменить queueId записи.'),
      );
      expect(entryRepository.save).not.toHaveBeenCalled();
    });

    it('должен выбросить BadRequestException при попытке изменить userId', async () => {
      const entryToUpdate = { ...mockEntry, userId: mockUser.userId };
      const updateDtoWithUserId: UpdateEntryDto = { userId: 99 };
      jest.spyOn(entryRepository, 'findOne').mockResolvedValue(entryToUpdate);

      await expect(service.update(entryToUpdate.entryId, updateDtoWithUserId, mockUser.userId)).rejects.toThrow(
        new BadRequestException('Нельзя изменить userId записи.'),
      );
      expect(entryRepository.save).not.toHaveBeenCalled();
    });

    // Добавьте тесты для изменения даты/времени, если это разрешено и есть логика
    // Например, если при изменении даты/времени нужно проверять конфликт.
  });

  // --- Тесты для remove ---
  describe('remove', () => {
    it('должен успешно удалить запись (как создатель)', async () => {
      const entryToRemove = { ...mockEntry, userId: mockUser.userId };
      jest.spyOn(entryRepository, 'findOne').mockResolvedValue(entryToRemove);
      jest.spyOn(entryRepository, 'remove').mockResolvedValue(entryToRemove);
      jest.spyOn(journalService, 'createJournalEntry').mockResolvedValue(undefined);

      await service.remove(entryToRemove.entryId, mockUser.userId);

      expect(entryRepository.findOne).toHaveBeenCalledWith({
        where: { entryId: entryToRemove.entryId },
        relations: ['queue', 'user'],
      });
      expect(entryRepository.remove).toHaveBeenCalledWith(entryToRemove);
      expect(journalService.createJournalEntry).toHaveBeenCalled();
    });

    it('должен успешно удалить запись (как админ очереди)', async () => {
      const entryToRemove = { ...mockEntry, queueId: mockOrganizationalQueue.queueId };
      jest.spyOn(entryRepository, 'findOne').mockResolvedValue(entryToRemove);
      jest.spyOn(mockQueueService, 'isUserAdminOfQueue').mockResolvedValue(true); // Пользователь - админ
      jest.spyOn(entryRepository, 'remove').mockResolvedValue(entryToRemove);
      jest.spyOn(journalService, 'createJournalEntry').mockResolvedValue(undefined);

      await service.remove(entryToRemove.entryId, mockAdminUser.userId);

      expect(entryRepository.findOne).toHaveBeenCalledWith({
        where: { entryId: entryToRemove.entryId },
        relations: ['queue', 'user'],
      });
      expect(mockQueueService.isUserAdminOfQueue).toHaveBeenCalledWith(mockAdminUser.userId, entryToRemove.queueId);
      expect(entryRepository.remove).toHaveBeenCalledWith(entryToRemove);
      expect(journalService.createJournalEntry).toHaveBeenCalled();
    });

    it('должен выбросить NotFoundException, если запись не найдена', async () => {
      jest.spyOn(entryRepository, 'findOne').mockResolvedValue(undefined);

      await expect(service.remove(999, mockUser.userId)).rejects.toThrow(
        new NotFoundException(`Запись с ID 999 не найдена.`),
      );
      expect(entryRepository.remove).not.toHaveBeenCalled();
    });

    it('должен выбросить ForbiddenException, если пользователь не создатель и не админ', async () => {
      const entryToRemove = { ...mockEntry, userId: mockUser.userId };
      const nonCreatorUserId = 99;
      jest.spyOn(entryRepository, 'findOne').mockResolvedValue(entryToRemove);
      jest.spyOn(mockQueueService, 'isUserAdminOfQueue').mockResolvedValue(false); // Не админ

      await expect(service.remove(entryToRemove.entryId, nonCreatorUserId)).rejects.toThrow(
        new ForbiddenException('У вас нет разрешения на удаление этой записи.'),
      );
      expect(entryRepository.remove).not.toHaveBeenCalled();
    });
  });

  // --- Тесты для updateEntryStatus ---
  describe('updateEntryStatus', () => {
    it('должен успешно обновить статус записи', async () => {
      const entryToUpdate = { ...mockEntry, status: EntryStatusEnum.WAITING };
      jest.spyOn(entryRepository, 'findOne').mockResolvedValue(entryToUpdate);
      jest.spyOn(entryRepository, 'save').mockResolvedValue({ ...entryToUpdate, status: EntryStatusEnum.COMPLETED });
      jest.spyOn(journalService, 'createJournalEntry').mockResolvedValue(undefined);

      const result = await service.updateEntryStatus(entryToUpdate.entryId, EntryStatusEnum.COMPLETED);

      expect(entryRepository.findOne).toHaveBeenCalledWith({ where: { entryId: entryToUpdate.entryId } });
      expect(entryRepository.save).toHaveBeenCalledWith(expect.objectContaining({ status: EntryStatusEnum.COMPLETED }));
      expect(journalService.createJournalEntry).toHaveBeenCalled();
      expect(result.status).toEqual(EntryStatusEnum.COMPLETED);
    });

    it('должен выбросить NotFoundException, если запись для обновления статуса не найдена', async () => {
      jest.spyOn(entryRepository, 'findOne').mockResolvedValue(undefined);

      await expect(service.updateEntryStatus(999, EntryStatusEnum.COMPLETED)).rejects.toThrow(
        new NotFoundException(`Запись с ID 999 не найдена.`),
      );
      expect(entryRepository.save).not.toHaveBeenCalled();
    });

    it('не должен обновлять статус, если он уже такой же', async () => {
      const entryToUpdate = { ...mockEntry, status: EntryStatusEnum.WAITING };
      jest.spyOn(entryRepository, 'findOne').mockResolvedValue(entryToUpdate);
      jest.spyOn(entryRepository, 'save').mockResolvedValue(entryToUpdate); // Имитируем, что save не делает изменений

      const result = await service.updateEntryStatus(entryToUpdate.entryId, EntryStatusEnum.WAITING);

      expect(entryRepository.findOne).toHaveBeenCalledWith({ where: { entryId: entryToUpdate.entryId } });
      expect(entryRepository.save).not.toHaveBeenCalled(); // save не должен быть вызван
      expect(journalService.createJournalEntry).not.toHaveBeenCalled(); // Запись в журнал не должна быть создана
      expect(result.status).toEqual(EntryStatusEnum.WAITING);
    });
  });

  // --- Тесты для getEntriesByQueueId ---
  describe('getEntriesByQueueId', () => {
    it('должен вернуть записи для указанной очереди', async () => {
      const queueId = 1;
      const entriesForQueue = [{ ...mockEntry, queueId: 1 }];
      jest.spyOn(entryRepository, 'find').mockResolvedValue(entriesForQueue);

      const result = await service.getEntriesByQueueId(queueId);

      expect(entryRepository.find).toHaveBeenCalledWith({
        where: { queueId: queueId },
        relations: ['queue', 'user'],
        order: { createdAt: 'ASC' }, // Предполагаем сортировку
      });
      expect(result).toEqual(entriesForQueue);
    });

    it('должен вернуть пустой массив, если записей нет', async () => {
      const queueId = 99;
      jest.spyOn(entryRepository, 'find').mockResolvedValue([]);

      const result = await service.getEntriesByQueueId(queueId);

      expect(result).toEqual([]);
    });
  });

  // --- Тесты для getEntryPosition ---
  describe('getEntryPosition', () => {
    it('должен вернуть позицию записи в очереди', async () => {
      const queueId = 1;
      const entryId = 1;
      const entriesInQueue = [
        { ...mockEntry, entryId: 10, createdAt: new Date('2023-01-01T10:00:00Z'), status: EntryStatusEnum.WAITING },
        { ...mockEntry, entryId: 1, createdAt: new Date('2023-01-01T10:05:00Z'), status: EntryStatusEnum.WAITING }, // Наша запись
        { ...mockEntry, entryId: 20, createdAt: new Date('2023-01-01T10:10:00Z'), status: EntryStatusEnum.WAITING },
      ];
      jest.spyOn(entryRepository, 'find').mockResolvedValue(entriesInQueue);

      const result = await service.getEntryPosition(queueId, entryId);

      expect(entryRepository.find).toHaveBeenCalledWith({
        where: { queueId: queueId, status: EntryStatusEnum.WAITING },
        order: { createdAt: 'ASC' },
      });
      expect(result).toEqual(2); // Позиция 2 (индекс 1 + 1)
    });

    it('должен вернуть 0, если запись не найдена в очереди со статусом WAITING', async () => {
      const queueId = 1;
      const entryId = 99;
      const entriesInQueue = [
        { ...mockEntry, entryId: 10, createdAt: new Date('2023-01-01T10:00:00Z'), status: EntryStatusEnum.WAITING },
      ];
      jest.spyOn(entryRepository, 'find').mockResolvedValue(entriesInQueue);

      const result = await service.getEntryPosition(queueId, entryId);

      expect(result).toEqual(0);
    });

    it('должен вернуть 0, если в очереди нет записей', async () => {
      const queueId = 1;
      const entryId = 1;
      jest.spyOn(entryRepository, 'find').mockResolvedValue([]);

      const result = await service.getEntryPosition(queueId, entryId);

      expect(result).toEqual(0);
    });
  });

  // --- Тесты для getEntriesForUser ---
  describe('getEntriesForUser', () => {
    it('должен вернуть записи для указанного пользователя', async () => {
      const userId = 1;
      const entriesForUser = [{ ...mockEntry, userId: 1 }];
      jest.spyOn(entryRepository, 'find').mockResolvedValue(entriesForUser);

      const result = await service.getEntriesForUser(userId);

      expect(entryRepository.find).toHaveBeenCalledWith({
        where: { userId: userId },
        relations: ['queue', 'user'],
        order: { createdAt: 'ASC' },
      });
      expect(result).toEqual(entriesForUser);
    });

    it('должен вернуть пустой массив, если у пользователя нет записей', async () => {
      const userId = 99;
      jest.spyOn(entryRepository, 'find').mockResolvedValue([]);

      const result = await service.getEntriesForUser(userId);

      expect(result).toEqual([]);
    });
  });

  // --- Тесты для getNextEntryInQueue ---
  describe('getNextEntryInQueue', () => {
    it('должен вернуть следующую запись в очереди', async () => {
      const queueId = 1;
      const entriesInQueue = [
        { ...mockEntry, entryId: 10, createdAt: new Date('2023-01-01T10:00:00Z'), status: EntryStatusEnum.WAITING },
        { ...mockEntry, entryId: 20, createdAt: new Date('2023-01-01T10:05:00Z'), status: EntryStatusEnum.WAITING },
      ];
      jest.spyOn(entryRepository, 'find').mockResolvedValue(entriesInQueue);

      const result = await service.getNextEntryInQueue(queueId);

      expect(entryRepository.find).toHaveBeenCalledWith({
        where: { queueId: queueId, status: EntryStatusEnum.WAITING },
        order: { createdAt: 'ASC' },
        take: 1,
      });
      expect(result).toEqual(entriesInQueue[0]);
    });

    it('должен вернуть null, если в очереди нет ожидающих записей', async () => {
      const queueId = 1;
      jest.spyOn(entryRepository, 'find').mockResolvedValue([]);

      const result = await service.getNextEntryInQueue(queueId);

      expect(result).toBeNull();
    });
  });
});
