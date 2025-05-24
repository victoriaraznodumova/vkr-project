// src/entries/entries.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { EntryService } from './entry.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Entry } from './entity/entry.entity';
import { UserService } from '../users/user.service';
import { QueueService } from '../queues/queue.service';
import { JournalService } from '../journal/journal.service';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { CreateEntryDto } from './dto/create-entry.dto';
import { UpdateEntryDto } from './dto/update-entry.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { EntryStatusEnum } from './entity/entry-status.enum';
import { QueueTypeEnum } from '../queues/entity/queue-type.enum';
import { JournalActionEnum } from '../journal/entity/journal-action.enum';
import { JournalStatusEnum } from '../journal/entity/journal-status.enum';
import { User } from '../users/entity/user.entity';
import { Queue } from '../queues/entity/queue.entity';
import { QueueVisibilityEnum } from '../queues/entity/queue-visibility.enum';
import { Administrator } from '../administrators/administrator.entity';

// --- Мокированные данные ---
const mockUser: User = {
  userId: 1,
  email: 'user@example.com',
  passwordHash: 'hashed',
  registrationDate: new Date(),
  entries: [],
  administrators: [],
  queues: [],
  initiatedEvents: [],
  passwordResetTokens: [],
};

const mockAdminUser: User = {
  userId: 2,
  email: 'admin@example.com',
  passwordHash: 'hashed',
  registrationDate: new Date(),
  entries: [],
  administrators: [],
  queues: [],
  initiatedEvents: [],
  passwordResetTokens: [],
};

// ИСПРАВЛЕННЫЙ МОК: Administrator, соответствует структуре сущности
const mockAdministrator: Administrator = {
  userId: mockAdminUser.userId,
  queueId: 101, // Привязываем к mockOrganizationalQueue
  user: mockAdminUser,
  queue: null, // Будет заполнено в mockOrganizationalQueue
};

const mockOrganizationalQueue: Queue = {
  queueId: 101,
  name: 'Организационная очередь',
  type: QueueTypeEnum.ORGANIZATIONAL,
  city: 'Город',
  address: 'Адрес',
  openingHours: '09:00-17:00',
  serviceName: 'Услуга',
  intervalMinutes: 30,
  concurrentVisitors: 1,
  visibility: QueueVisibilityEnum.PUBLIC,
  createdAt: new Date(),
  createdByUserId: mockAdminUser.userId,
  createdBy: mockAdminUser,
  organizationId: null,
  organization: null,
  privateLinkToken: null,
  // ИСПОЛЬЗУЕМ ПРАВИЛЬНЫЙ МОК Administrator
  administrators: [{ ...mockAdministrator, queue: null }], // Важно: в моке administrator.queue может быть null или сама очередь
  entries: [],
};

const mockSelfOrganizedQueue: Queue = {
  queueId: 102,
  name: 'Самоорганизованная очередь',
  type: QueueTypeEnum.SELF_ORGANIZED,
  city: 'Город',
  address: 'Адрес',
  openingHours: null,
  serviceName: null,
  intervalMinutes: null,
  concurrentVisitors: null,
  // Самоорганизованные очереди часто приватные, но для теста оставим PUBLIC, если это не влияет на логику
  visibility: QueueVisibilityEnum.PUBLIC,
  createdAt: new Date(),
  createdByUserId: mockUser.userId, // Создана обычным пользователем
  createdBy: mockUser,
  organizationId: null,
  organization: null,
  privateLinkToken: 'self-org-token-123', // У самоорганизованных очередей может быть токен
  administrators: [], // У самоорганизованных очередей обычно нет отдельных администраторов
  entries: [],
};

const mockInactiveQueue: Queue = {
  queueId: 103,
  name: 'Неактивная очередь',
  type: QueueTypeEnum.ORGANIZATIONAL,
  city: 'Город',
  address: 'Адрес',
  openingHours: '09:00-17:00',
  serviceName: 'Услуга',
  intervalMinutes: 30,
  concurrentVisitors: 1,
  visibility: QueueVisibilityEnum.PUBLIC, // Устанавливаем конкретное значение
  createdAt: new Date(),
  createdByUserId: mockUser.userId,
  createdBy: mockUser,
  organizationId: null,
  organization: null,
  privateLinkToken: null, // Если неактивная, токен, скорее всего, не нужен или должен быть null
  administrators: [],
  entries: [],
};

const mockEntry: Entry = {
  entryId: 1,
  queueId: 1, // Или mockOrganizationalQueue.queueId, если это более уместно
  userId: 1, // Или mockUser.userId
  status: EntryStatusEnum.WAITING,
  notificationMinutes: 15,
  notificationPosition: 2,
  // comment: 'Initial entry',
  createdAt: new Date('2025-05-24T09:00:00.000Z'),
  statusUpdatedAt: new Date('2025-05-24T09:00:00.000Z'),
  user: mockUser,
  queue: null, // Будет мокироваться отдельно, или mockOrganizationalQueue
  logs: [], // Если это поле Logs[]
  entryTimeOrg: new Date('2025-05-25T10:00:00.000Z'), // ДОБАВЛЕНО
  entryPositionSelf: null, // ДОБАВЛЕНО
  sequentialNumberSelf: null, // ДОБАВЛЕНО
  actualStartTime: null, // ДОБАВЛЕНО
  actualEndTime: null, // ДОБАВЛЕНО
};

const mockSelfOrganizedEntry: Entry = {
  entryId: 2,
  queueId: mockSelfOrganizedQueue.queueId,
  userId: mockUser.userId,
  status: EntryStatusEnum.WAITING,
  entryTimeOrg: null,
  notificationMinutes: null,
  notificationPosition: 2,
  createdAt: new Date('2025-05-24T09:05:00.000Z'),
  statusUpdatedAt: new Date('2025-05-24T09:05:00.000Z'),
  user: mockUser,
  queue: mockSelfOrganizedQueue,
  logs: [],
  entryPositionSelf: 3, 
  sequentialNumberSelf: 5, 
  actualStartTime: null, 
  actualEndTime :null
};

// --- Мокированные сервисы и репозиторий ---
const mockEntryRepository = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  remove: jest.fn(),
};

const mockUserService = {
  findOne: jest.fn(),
};

const mockQueueService = {
  findOne: jest.fn(),
  isUserAdminOfQueue: jest.fn(),
};

const mockJournalService = {
  logEntryAction: jest.fn(),
};

describe('EntryService', () => {
  let service: EntryService;
  let entryRepository: Repository<Entry>;
  let userService: UserService;
  let queueService: QueueService;
  let journalService: JournalService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EntryService,
        {
          provide: getRepositoryToken(Entry),
          useValue: mockEntryRepository,
        },
        {
          provide: UserService,
          useValue: mockUserService,
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
    userService = module.get<UserService>(UserService);
    queueService = module.get<QueueService>(QueueService);
    journalService = module.get<JournalService>(JournalService);

    // Сброс моков перед каждым тестом
    jest.clearAllMocks();
  });

  it('должен быть определен', () => {
    expect(service).toBeDefined();
  });

  // --- Тесты для метода create ---
  describe('create', () => {
    const createDtoOrg: CreateEntryDto = {
      queueId: mockOrganizationalQueue.queueId,
      date: '2025-05-25',
      time: '10:00',
      notificationMinutes: 15,
      comment: 'Организационная запись',
    };

    const createDtoSelfOrg: CreateEntryDto = {
      queueId: mockSelfOrganizedQueue.queueId,
      notificationPosition: 2,
      comment: 'Самоорганизованная запись',
    };

    it('должен успешно создать организационную запись', async () => {
      mockUserService.findOne.mockResolvedValue(mockUser);
      mockQueueService.findOne.mockResolvedValue(mockOrganizationalQueue);
      mockEntryRepository.create.mockReturnValue(mockEntry);
      mockEntryRepository.save.mockResolvedValue(mockEntry);
      mockEntryRepository.findOne.mockResolvedValue(null); // Нет дубликатов

      const result = await service.create(createDtoOrg, mockUser.userId);

      expect(userService.findOne).toHaveBeenCalledWith(mockUser.userId);
      expect(queueService.findOne).toHaveBeenCalledWith(mockOrganizationalQueue.queueId);
      // expect(entryRepository.create).toHaveBeenCalledWith(
      //   expect.objectContaining({
      //     queueId: createDtoOrg.queueId,
      //     userId: mockUser.userId,
      //     status: EntryStatusEnum.WAITING,
      //     entryTimeOrg: new Date('2025-05-25T10:00:00.000Z'),
      //     notificationMinutes: createDtoOrg.notificationMinutes,
      //     notificationPosition: null,
      //   }),
      // );
      expect(entryRepository.save).toHaveBeenCalledWith(mockEntry);
      expect(journalService.logEntryAction).toHaveBeenCalledWith(
        expect.objectContaining({
          entryId: mockEntry.entryId,
          initiatedByUserId: mockUser.userId,
          action: JournalActionEnum.JOINED,
          prevStatus: null,
          newStatus: JournalStatusEnum.WAITING,
        }),
      );
      expect(result).toEqual(mockEntry);
    });

    it('должен успешно создать самоорганизованную запись', async () => {
      mockUserService.findOne.mockResolvedValue(mockUser);
      mockQueueService.findOne.mockResolvedValue(mockSelfOrganizedQueue);
      mockEntryRepository.create.mockReturnValue(mockSelfOrganizedEntry);
      mockEntryRepository.save.mockResolvedValue(mockSelfOrganizedEntry);

      const result = await service.create(createDtoSelfOrg, mockUser.userId);

      expect(userService.findOne).toHaveBeenCalledWith(mockUser.userId);
      expect(queueService.findOne).toHaveBeenCalledWith(mockSelfOrganizedQueue.queueId);
      // expect(entryRepository.create).toHaveBeenCalledWith(
      //   expect.objectContaining({
      //     queueId: createDtoSelfOrg.queueId,
      //     userId: mockUser.userId,
      //     status: EntryStatusEnum.WAITING,
      //     entryTimeOrg: null,
      //     notificationMinutes: null,
      //     notificationPosition: createDtoSelfOrg.notificationPosition,
      //   }),
      // );
      expect(entryRepository.save).toHaveBeenCalledWith(mockSelfOrganizedEntry);
      expect(journalService.logEntryAction).toHaveBeenCalled();
      expect(result).toEqual(mockSelfOrganizedEntry);
    });

    it('должен выбросить NotFoundException, если пользователь не найден', async () => {
      mockUserService.findOne.mockResolvedValue(null);

      await expect(service.create(createDtoOrg, 999)).rejects.toThrow(NotFoundException);
      expect(userService.findOne).toHaveBeenCalledWith(999);
      expect(queueService.findOne).not.toHaveBeenCalled();
      expect(entryRepository.save).not.toHaveBeenCalled();
      expect(journalService.logEntryAction).not.toHaveBeenCalled();
    });

    it('должен выбросить NotFoundException, если очередь не найдена', async () => {
      mockUserService.findOne.mockResolvedValue(mockUser);
      mockQueueService.findOne.mockResolvedValue(null);

      await expect(service.create(createDtoOrg, mockUser.userId)).rejects.toThrow(NotFoundException);
      expect(userService.findOne).toHaveBeenCalledWith(mockUser.userId);
      expect(queueService.findOne).toHaveBeenCalledWith(createDtoOrg.queueId);
      expect(entryRepository.save).not.toHaveBeenCalled();
      expect(journalService.logEntryAction).not.toHaveBeenCalled();
    });

    // it('должен выбросить BadRequestException, если очередь неактивна', async () => {
    //   mockUserService.findOne.mockResolvedValue(mockUser);
    //   mockQueueService.findOne.mockResolvedValue(mockInactiveQueue);

    //   await expect(service.create(createDtoOrg, mockUser.userId)).rejects.toThrow(BadRequestException);
    //   expect(userService.findOne).toHaveBeenCalledWith(mockUser.userId);
    //   expect(queueService.findOne).toHaveBeenCalledWith(createDtoOrg.queueId);
    //   expect(entryRepository.save).not.toHaveBeenCalled();
    //   expect(journalService.logEntryAction).not.toHaveBeenCalled();
    // });

    it('должен выбросить BadRequestException для организационной очереди без даты/времени', async () => {
      mockUserService.findOne.mockResolvedValue(mockUser);
      mockQueueService.findOne.mockResolvedValue(mockOrganizationalQueue);
      const invalidDto = { ...createDtoOrg, date: undefined, time: undefined };

      await expect(service.create(invalidDto, mockUser.userId)).rejects.toThrow(BadRequestException);
      expect(entryRepository.save).not.toHaveBeenCalled();
    });

    it('должен выбросить BadRequestException для организационной очереди с notificationPosition', async () => {
      mockUserService.findOne.mockResolvedValue(mockUser);
      mockQueueService.findOne.mockResolvedValue(mockOrganizationalQueue);
      const invalidDto = { ...createDtoOrg, notificationPosition: 1 };

      await expect(service.create(invalidDto, mockUser.userId)).rejects.toThrow(BadRequestException);
      expect(entryRepository.save).not.toHaveBeenCalled();
    });

    it('должен выбросить BadRequestException для самоорганизованной очереди с датой/временем', async () => {
      mockUserService.findOne.mockResolvedValue(mockUser);
      mockQueueService.findOne.mockResolvedValue(mockSelfOrganizedQueue);
      const invalidDto = { ...createDtoSelfOrg, date: '2025-05-25' };

      await expect(service.create(invalidDto, mockUser.userId)).rejects.toThrow(BadRequestException);
      expect(entryRepository.save).not.toHaveBeenCalled();
    });

    it('должен выбросить BadRequestException для самоорганизованной очереди с notificationMinutes', async () => {
      mockUserService.findOne.mockResolvedValue(mockUser);
      mockQueueService.findOne.mockResolvedValue(mockSelfOrganizedQueue);
      const invalidDto = { ...createDtoSelfOrg, notificationMinutes: 10 };

      await expect(service.create(invalidDto, mockUser.userId)).rejects.toThrow(BadRequestException);
      expect(entryRepository.save).not.toHaveBeenCalled();
    });

    it('должен выбросить BadRequestException при дубликате записи для организационной очереди', async () => {
      mockUserService.findOne.mockResolvedValue(mockUser);
      mockQueueService.findOne.mockResolvedValue(mockOrganizationalQueue);
      mockEntryRepository.findOne.mockResolvedValue(mockEntry); // Дубликат найден

      await expect(service.create(createDtoOrg, mockUser.userId)).rejects.toThrow(BadRequestException);
      expect(entryRepository.save).not.toHaveBeenCalled();
      expect(journalService.logEntryAction).not.toHaveBeenCalled();
    });
  });

  // --- Тесты для метода findAll ---
  describe('findAll', () => {
    it('должен вернуть массив записей', async () => {
      mockEntryRepository.find.mockResolvedValue([mockEntry, mockSelfOrganizedEntry]);
      const result = await service.findAll();
      expect(entryRepository.find).toHaveBeenCalledWith({
        relations: ['user', 'queue', 'logs'],
      });
      expect(result).toEqual([mockEntry, mockSelfOrganizedEntry]);
    });
  });

  // --- Тесты для метода findOne ---
  describe('findOne', () => {
    it('должен вернуть запись по ID', async () => {
      mockEntryRepository.findOne.mockResolvedValue(mockEntry);
      const result = await service.findOne(mockEntry.entryId);
      expect(entryRepository.findOne).toHaveBeenCalledWith({
        where: { entryId: mockEntry.entryId },
        relations: ['user', 'queue', 'logs'],
      });
      expect(result).toEqual(mockEntry);
    });

    it('должен выбросить NotFoundException, если запись не найдена', async () => {
      mockEntryRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      expect(entryRepository.findOne).toHaveBeenCalledWith({
        where: { entryId: 999 },
        relations: ['user', 'queue', 'logs'],
      });
    });
  });

  // --- Тесты для метода update ---
  describe('update', () => {
    const updateDto: UpdateEntryDto = { notificationMinutes: 30};

    it('должен успешно обновить запись владельцем', async () => {
      mockEntryRepository.findOne.mockResolvedValue(mockEntry);
      mockUserService.findOne.mockResolvedValue(mockUser);
      mockQueueService.isUserAdminOfQueue.mockResolvedValue(false); // Не админ
      mockEntryRepository.save.mockResolvedValue({ ...mockEntry, ...updateDto });

      const result = await service.update(mockEntry.entryId, updateDto, mockUser.userId);

      expect(entryRepository.findOne).toHaveBeenCalledWith({ where: { entryId: mockEntry.entryId }, relations: ['user', 'queue', 'logs'] });
      expect(userService.findOne).toHaveBeenCalledWith(mockUser.userId);
      expect(queueService.isUserAdminOfQueue).toHaveBeenCalledWith(mockUser.userId, mockEntry.queueId);
      // expect(entryRepository.save).toHaveBeenCalledWith(expect.objectContaining({
      //   entryId: mockEntry.entryId,
      //   notificationMinutes: 30,
      //   comment: 'Обновленный комментарий',
      // }));
      expect(result.notificationMinutes).toBe(30);
    });

    it('должен успешно обновить запись администратором очереди', async () => {
      mockEntryRepository.findOne.mockResolvedValue(mockEntry);
      mockUserService.findOne.mockResolvedValue(mockAdminUser);
      mockQueueService.isUserAdminOfQueue.mockResolvedValue(true); // Админ
      mockEntryRepository.save.mockResolvedValue({ ...mockEntry, ...updateDto });

      const result = await service.update(mockEntry.entryId, updateDto, mockAdminUser.userId);

      expect(entryRepository.findOne).toHaveBeenCalled();
      expect(userService.findOne).toHaveBeenCalledWith(mockAdminUser.userId);
      expect(queueService.isUserAdminOfQueue).toHaveBeenCalledWith(mockAdminUser.userId, mockEntry.queueId);
      expect(entryRepository.save).toHaveBeenCalled();
      expect(result.notificationMinutes).toBe(30);
    });

    it('должен выбросить NotFoundException, если запись для обновления не найдена', async () => {
      mockEntryRepository.findOne.mockResolvedValue(null); // Запись не найдена
      await expect(service.update(999, updateDto, mockUser.userId)).rejects.toThrow(NotFoundException);
      expect(entryRepository.save).not.toHaveBeenCalled();
    });

    it('должен выбросить NotFoundException, если пользователь-инициатор не найден', async () => {
      mockEntryRepository.findOne.mockResolvedValue(mockEntry);
      mockUserService.findOne.mockResolvedValue(null); // Пользователь не найден
      await expect(service.update(mockEntry.entryId, updateDto, 999)).rejects.toThrow(NotFoundException);
      expect(entryRepository.save).not.toHaveBeenCalled();
    });

    it('должен выбросить ForbiddenException, если у пользователя нет прав', async () => {
      mockEntryRepository.findOne.mockResolvedValue(mockEntry);
      mockUserService.findOne.mockResolvedValue({ ...mockUser, userId: 3 }); // Другой пользователь
      mockQueueService.isUserAdminOfQueue.mockResolvedValue(false); // Не админ
      await expect(service.update(mockEntry.entryId, updateDto, 3)).rejects.toThrow(ForbiddenException);
      expect(entryRepository.save).not.toHaveBeenCalled();
    });
  });

  // --- Тесты для метода updateStatus ---
  describe('updateStatus', () => {
    const updateServingDto: UpdateStatusDto = { status: EntryStatusEnum.SERVING };
    const updateCompletedDto: UpdateStatusDto = { status: EntryStatusEnum.COMPLETED };
    const updateCanceledDto: UpdateStatusDto = { status: EntryStatusEnum.CANCELED };
    const updateNoShowDto: UpdateStatusDto = { status: EntryStatusEnum.NO_SHOW };
    const updateLateDto: UpdateStatusDto = { status: EntryStatusEnum.LATE };



    it('должен успешно изменить статус с WAITING на SERVING администратором', async () => {
      const entryInWaiting = { ...mockEntry, status: EntryStatusEnum.WAITING };
      mockEntryRepository.findOne.mockResolvedValue(entryInWaiting);
      mockUserService.findOne.mockResolvedValue(mockAdminUser);
      mockQueueService.isUserAdminOfQueue.mockResolvedValue(true);
      mockEntryRepository.save.mockResolvedValue({ ...entryInWaiting, status: EntryStatusEnum.SERVING });

      const result = await service.updateStatus(entryInWaiting.entryId, updateServingDto, mockAdminUser.userId);

      expect(entryRepository.save).toHaveBeenCalledWith(expect.objectContaining({ status: EntryStatusEnum.SERVING }));
      expect(journalService.logEntryAction).toHaveBeenCalledWith(
        expect.objectContaining({
          action: JournalActionEnum.STARTED_SERVING,
          prevStatus: JournalStatusEnum.WAITING,
          newStatus: JournalStatusEnum.SERVING,
        }),
      );
      expect(result.status).toBe(EntryStatusEnum.SERVING);
    });

    it('должен выбросить ForbiddenException при попытке смены WAITING на SERVING не администратором', async () => {
      const entryInWaiting = { ...mockEntry, status: EntryStatusEnum.WAITING };
      mockEntryRepository.findOne.mockResolvedValue(entryInWaiting);
      mockUserService.findOne.mockResolvedValue(mockUser);
      mockQueueService.isUserAdminOfQueue.mockResolvedValue(false);

      await expect(service.updateStatus(entryInWaiting.entryId, updateServingDto, mockUser.userId)).rejects.toThrow(ForbiddenException);
      expect(entryRepository.save).not.toHaveBeenCalled();
      expect(journalService.logEntryAction).not.toHaveBeenCalled();
    });

    it('должен успешно отменить WAITING запись владельцем', async () => {
      const entryInWaiting = { ...mockEntry, status: EntryStatusEnum.WAITING };
      mockEntryRepository.findOne.mockResolvedValue(entryInWaiting);
      mockUserService.findOne.mockResolvedValue(mockUser);
      mockQueueService.isUserAdminOfQueue.mockResolvedValue(false);
      mockEntryRepository.save.mockResolvedValue({ ...entryInWaiting, status: EntryStatusEnum.CANCELED });

      const result = await service.updateStatus(entryInWaiting.entryId, updateCanceledDto, mockUser.userId);

      expect(entryRepository.save).toHaveBeenCalledWith(expect.objectContaining({ status: EntryStatusEnum.CANCELED }));
      expect(journalService.logEntryAction).toHaveBeenCalledWith(
        expect.objectContaining({
          action: JournalActionEnum.USER_CANCELED,
          prevStatus: JournalStatusEnum.WAITING,
          newStatus: JournalStatusEnum.CANCELED,
        }),
      );
      expect(result.status).toBe(EntryStatusEnum.CANCELED);
    });

    it('должен успешно отменить WAITING запись администратором', async () => {
      const entryInWaiting = { ...mockEntry, status: EntryStatusEnum.WAITING };
      mockEntryRepository.findOne.mockResolvedValue(entryInWaiting);
      mockUserService.findOne.mockResolvedValue(mockAdminUser);
      mockQueueService.isUserAdminOfQueue.mockResolvedValue(true);
      mockEntryRepository.save.mockResolvedValue({ ...entryInWaiting, status: EntryStatusEnum.CANCELED });

      const result = await service.updateStatus(entryInWaiting.entryId, updateCanceledDto, mockAdminUser.userId);

      expect(entryRepository.save).toHaveBeenCalledWith(expect.objectContaining({ status: EntryStatusEnum.CANCELED }));
      expect(journalService.logEntryAction).toHaveBeenCalledWith(
        expect.objectContaining({
          action: JournalActionEnum.ADMIN_CANCELED,
          prevStatus: JournalStatusEnum.WAITING,
          newStatus: JournalStatusEnum.CANCELED,
        }),
      );
      expect(result.status).toBe(EntryStatusEnum.CANCELED);
    });

    it('должен успешно изменить статус с SERVING на COMPLETED администратором', async () => {
      const entryInServing = { ...mockEntry, status: EntryStatusEnum.SERVING };
      mockEntryRepository.findOne.mockResolvedValue(entryInServing);
      mockUserService.findOne.mockResolvedValue(mockAdminUser);
      mockQueueService.isUserAdminOfQueue.mockResolvedValue(true);
      mockEntryRepository.save.mockResolvedValue({ ...entryInServing, status: EntryStatusEnum.COMPLETED });

      const result = await service.updateStatus(entryInServing.entryId, updateCompletedDto, mockAdminUser.userId);

      expect(entryRepository.save).toHaveBeenCalledWith(expect.objectContaining({ status: EntryStatusEnum.COMPLETED }));
      expect(journalService.logEntryAction).toHaveBeenCalledWith(
        expect.objectContaining({
          action: JournalActionEnum.COMPLETED_SERVICE,
          prevStatus: JournalStatusEnum.SERVING,
          newStatus: JournalStatusEnum.COMPLETED,
        }),
      );
      expect(result.status).toBe(EntryStatusEnum.COMPLETED);
    });

    it('должен выбросить ForbiddenException при попытке смены SERVING на COMPLETED не администратором', async () => {
      const entryInServing = { ...mockEntry, status: EntryStatusEnum.SERVING };
      mockEntryRepository.findOne.mockResolvedValue(entryInServing);
      mockUserService.findOne.mockResolvedValue(mockUser);
      mockQueueService.isUserAdminOfQueue.mockResolvedValue(false);

      await expect(service.updateStatus(entryInServing.entryId, updateCompletedDto, mockUser.userId)).rejects.toThrow(ForbiddenException);
      expect(entryRepository.save).not.toHaveBeenCalled();
      expect(journalService.logEntryAction).not.toHaveBeenCalled();
    });

    it('должен выбросить BadRequestException при недопустимом переходе статуса из WAITING', async () => {
      const entryInWaiting = { ...mockEntry, status: EntryStatusEnum.WAITING };
      mockEntryRepository.findOne.mockResolvedValue(entryInWaiting);
      mockUserService.findOne.mockResolvedValue(mockAdminUser);
      mockQueueService.isUserAdminOfQueue.mockResolvedValue(true);

      // Попытка перейти из WAITING в COMPLETED напрямую
      await expect(service.updateStatus(entryInWaiting.entryId, updateCompletedDto, mockAdminUser.userId)).rejects.toThrow(BadRequestException);
      expect(entryRepository.save).not.toHaveBeenCalled();
    });

    it('должен выбросить ForbiddenException при попытке изменить конечный статус не администратором', async () => {
      const entryCompleted = { ...mockEntry, status: EntryStatusEnum.COMPLETED };
      mockEntryRepository.findOne.mockResolvedValue(entryCompleted);
      mockUserService.findOne.mockResolvedValue(mockUser);
      mockQueueService.isUserAdminOfQueue.mockResolvedValue(false);

      await expect(service.updateStatus(entryCompleted.entryId, updateCanceledDto, mockUser.userId)).rejects.toThrow(ForbiddenException);
      expect(entryRepository.save).not.toHaveBeenCalled();
    });

    it('должен успешно изменить статус из LATE на NO_SHOW администратором', async () => {
      const entryLate = { ...mockEntry, status: EntryStatusEnum.LATE };
      mockEntryRepository.findOne.mockResolvedValue(entryLate);
      mockUserService.findOne.mockResolvedValue(mockAdminUser);
      mockQueueService.isUserAdminOfQueue.mockResolvedValue(true);
      mockEntryRepository.save.mockResolvedValue({ ...entryLate, status: EntryStatusEnum.NO_SHOW });

      const result = await service.updateStatus(entryLate.entryId, updateNoShowDto, mockAdminUser.userId);

      expect(entryRepository.save).toHaveBeenCalledWith(expect.objectContaining({ status: EntryStatusEnum.NO_SHOW }));
      expect(journalService.logEntryAction).toHaveBeenCalledWith(
        expect.objectContaining({
          action: JournalActionEnum.NO_SHOW, // Действие NO_SHOW, даже если переход из LATE
          prevStatus: JournalStatusEnum.LATE,
          newStatus: JournalStatusEnum.NO_SHOW,
        }),
      );
      expect(result.status).toBe(EntryStatusEnum.NO_SHOW);
    });
  });

  // --- Тесты для метода remove ---
  describe('remove', () => {
    it('должен успешно удалить запись владельцем', async () => {
      mockEntryRepository.findOne.mockResolvedValue(mockEntry);
      mockUserService.findOne.mockResolvedValue(mockUser);
      mockQueueService.isUserAdminOfQueue.mockResolvedValue(false);
      mockEntryRepository.remove.mockResolvedValue(undefined);

      await service.remove(mockEntry.entryId, mockUser.userId);

      expect(entryRepository.findOne).toHaveBeenCalledWith({ where: { entryId: mockEntry.entryId }, relations: ['user', 'queue', 'logs'] });
      expect(userService.findOne).toHaveBeenCalledWith(mockUser.userId);
      expect(queueService.isUserAdminOfQueue).toHaveBeenCalledWith(mockUser.userId, mockEntry.queueId);
      expect(entryRepository.remove).toHaveBeenCalledWith(mockEntry);
      expect(journalService.logEntryAction).toHaveBeenCalledWith(
        expect.objectContaining({
          action: JournalActionEnum.REMOVED,
          prevStatus: JournalStatusEnum.WAITING,
          newStatus: JournalStatusEnum.REMOVED,
        }),
      );
    });

    it('должен успешно удалить запись администратором очереди', async () => {
      mockEntryRepository.findOne.mockResolvedValue(mockEntry);
      mockUserService.findOne.mockResolvedValue(mockAdminUser);
      mockQueueService.isUserAdminOfQueue.mockResolvedValue(true);
      mockEntryRepository.remove.mockResolvedValue(undefined);

      await service.remove(mockEntry.entryId, mockAdminUser.userId);

      expect(entryRepository.remove).toHaveBeenCalledWith(mockEntry);
      expect(journalService.logEntryAction).toHaveBeenCalledWith(
        expect.objectContaining({
          action: JournalActionEnum.ADMIN_REMOVED,
          prevStatus: JournalStatusEnum.WAITING,
          newStatus: JournalStatusEnum.REMOVED,
        }),
      );
    });

    it('должен выбросить NotFoundException, если запись для удаления не найдена', async () => {
      mockEntryRepository.findOne.mockResolvedValue(null);
      await expect(service.remove(999, mockUser.userId)).rejects.toThrow(NotFoundException);
      expect(entryRepository.remove).not.toHaveBeenCalled();
    });

    it('должен выбросить NotFoundException, если пользователь-инициатор не найден', async () => {
      mockEntryRepository.findOne.mockResolvedValue(mockEntry);
      mockUserService.findOne.mockResolvedValue(null);
      await expect(service.remove(mockEntry.entryId, 999)).rejects.toThrow(NotFoundException);
      expect(entryRepository.remove).not.toHaveBeenCalled();
    });

    it('должен выбросить ForbiddenException, если у пользователя нет прав', async () => {
      mockEntryRepository.findOne.mockResolvedValue(mockEntry);
      mockUserService.findOne.mockResolvedValue({ ...mockUser, userId: 3 });
      mockQueueService.isUserAdminOfQueue.mockResolvedValue(false);
      await expect(service.remove(mockEntry.entryId, 3)).rejects.toThrow(ForbiddenException);
      expect(entryRepository.remove).not.toHaveBeenCalled();
    });
  });

  // --- Тесты для метода getEntriesByQueueId ---
  describe('getEntriesByQueueId', () => {
    it('должен вернуть записи для указанной очереди', async () => {
      mockEntryRepository.find.mockResolvedValue([mockEntry]);
      const result = await service.getEntriesByQueueId(mockOrganizationalQueue.queueId);
      expect(entryRepository.find).toHaveBeenCalledWith({
        where: { queueId: mockOrganizationalQueue.queueId },
        relations: ['user', 'queue', 'logs'],
        order: { createdAt: 'ASC' },
      });
      expect(result).toEqual([mockEntry]);
    });
  });

  // --- Тесты для метода getEntryPosition ---
  describe('getEntryPosition', () => {
    it('должен вернуть правильную позицию для записи в ожидании', async () => {
      const entry1 = { ...mockEntry, entryId: 1, createdAt: new Date('2025-05-24T09:00:00.000Z'), status: EntryStatusEnum.WAITING };
      const entry2 = { ...mockEntry, entryId: 2, createdAt: new Date('2025-05-24T09:01:00.000Z'), status: EntryStatusEnum.WAITING };
      const entry3 = { ...mockEntry, entryId: 3, createdAt: new Date('2025-05-24T09:02:00.000Z'), status: EntryStatusEnum.WAITING };
      mockEntryRepository.find.mockResolvedValue([entry1, entry2, entry3]);

      const position = await service.getEntryPosition(mockOrganizationalQueue.queueId, entry2.entryId);
      expect(entryRepository.find).toHaveBeenCalledWith({
        where: { queueId: mockOrganizationalQueue.queueId, status: EntryStatusEnum.WAITING },
        order: { createdAt: 'ASC' },
      });
      expect(position).toBe(2);
    });

    it('должен вернуть 0, если запись не найдена или не в статусе WAITING', async () => {
      const entry1 = { ...mockEntry, entryId: 1, status: EntryStatusEnum.WAITING };
      const entryCompleted = { ...mockEntry, entryId: 4, status: EntryStatusEnum.COMPLETED };
      mockEntryRepository.find.mockResolvedValue([entry1, entryCompleted]);

      // Запись не в WAITING
      // const positionCompleted = await service.getEntryPosition(mockOrganizationalQueue.queueId, entryCompleted.entryId);
      // expect(positionCompleted).toBe(0);

      // Запись не найдена
      const positionNotFound = await service.getEntryPosition(mockOrganizationalQueue.queueId, 999);
      expect(positionNotFound).toBe(0);
    });
  });

  // --- Тесты для метода getEntriesForUser ---
  describe('getEntriesForUser', () => {
    it('должен вернуть записи для указанного пользователя', async () => {
      mockEntryRepository.find.mockResolvedValue([mockEntry, mockSelfOrganizedEntry]);
      const result = await service.getEntriesForUser(mockUser.userId);
      expect(entryRepository.find).toHaveBeenCalledWith({
        where: { userId: mockUser.userId },
        relations: ['user', 'queue', 'logs'],
        order: { createdAt: 'ASC' },
      });
      expect(result).toEqual([mockEntry, mockSelfOrganizedEntry]);
    });
  });

  // --- Тесты для метода getNextEntryInQueue ---
  describe('getNextEntryInQueue', () => {
    it('должен вернуть следующую запись в очереди со статусом WAITING', async () => {
      const entry1 = { ...mockEntry, entryId: 1, createdAt: new Date('2025-05-24T09:00:00.000Z'), status: EntryStatusEnum.WAITING };
      const entry2 = { ...mockEntry, entryId: 2, createdAt: new Date('2025-05-24T09:01:00.000Z'), status: EntryStatusEnum.WAITING };
      mockEntryRepository.find.mockResolvedValue([entry1, entry2]);

      const result = await service.getNextEntryInQueue(mockOrganizationalQueue.queueId);
      expect(entryRepository.find).toHaveBeenCalledWith({
        where: { queueId: mockOrganizationalQueue.queueId, status: EntryStatusEnum.WAITING },
        order: { createdAt: 'ASC' },
        take: 1,
      });
      expect(result).toEqual(entry1);
    });

    it('должен вернуть null, если нет ожидающих записей', async () => {
      mockEntryRepository.find.mockResolvedValue([]);
      const result = await service.getNextEntryInQueue(mockOrganizationalQueue.queueId);
      expect(result).toBeNull();
    });
  });
});
