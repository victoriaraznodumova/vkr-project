// src/journal/journal.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JournalService } from './journal.service';
import { Journal } from './entity/journal.entity';
import { CreateJournalEntryDto } from './dto/create-journal-entry.dto';
import { QueryJournalEntriesDto } from './dto/query-journal-entries.dto';
import { JournalActionEnum } from './entity/journal.action.enum';
import { JournalStatusEnum } from './entity/journal.status.enum';
import { User } from '../users/entity/user.entity'; // Assuming User entity path
import { Entry } from '../entries/entity/entry.entity'; // Assuming Entry entity path
import { EntryStatusEnum } from '../entries/entity/entry.status.enum';

// --- Mock Objects for Testing ---

// Mock User entity (simplified for Journal tests)
const mockUser: User = {
  userId: 1,
  email: 'initiator@example.com',
  passwordHash: 'hashedpass',
  registrationDate: new Date(),
  entries: [],
  administrators: [],
  queues: [],
  initiatedEvents: [],
  passwordResetTokens: [],
};

// Mock Entry entity (simplified for Journal tests)
const mockEntry: Entry = {
  entryId: 10,
  queueId: 1,
  userId: 1,
  status: EntryStatusEnum.WAITING,
  createdAt: new Date(),
  entryTimeOrg: null,
  entryPositionSelf: null,
  sequentialNumberSelf: null,
  statusUpdatedAt: new Date(),
  notificationMinutes: null,
  notificationPosition: null,
  actualStartTime: null,
  actualEndTime: null,
  queue: null, // Relations can be null/undefined for mocks if not needed
  user: null,
  logs: null
};

// Mock Journal entity
const mockJournalEntry: Journal = {
  logId: 1,
  entryId: mockEntry.entryId,
  action: JournalActionEnum.JOINED,
  prevStatus: null,
  newStatus: JournalStatusEnum.WAITING,
  logTime: new Date('2023-10-27T10:00:00.000Z'),
  initiatedByUserId: mockUser.userId,
  comment: 'User joined the queue.',
  entry: mockEntry, // Simplified relation
  user: mockUser,   // Simplified relation
};

const mockJournalEntry2: Journal = {
  logId: 2,
  entryId: mockEntry.entryId,
  action: JournalActionEnum.STATUS_CHANGED,
  prevStatus: JournalStatusEnum.WAITING,
  newStatus: JournalStatusEnum.SERVING,
  logTime: new Date('2023-10-27T10:05:00.000Z'),
  initiatedByUserId: mockUser.userId,
  comment: 'Admin changed status.',
  entry: mockEntry,
  user: mockUser,
};

const mockJournalEntry3: Journal = {
  logId: 3,
  entryId: 11, // Different entry
  action: JournalActionEnum.LEFT,
  prevStatus: JournalStatusEnum.SERVING,
  newStatus: JournalStatusEnum.COMPLETED,
  logTime: new Date('2023-10-27T10:10:00.000Z'),
  initiatedByUserId: 2, // Different user
  comment: 'User left.',
  entry: null,
  user: null,
};


describe('JournalService', () => {
  let service: JournalService;
  let journalRepository: Repository<Journal>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JournalService,
        {
          provide: getRepositoryToken(Journal),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<JournalService>(JournalService);
    journalRepository = module.get<Repository<Journal>>(getRepositoryToken(Journal));

    jest.clearAllMocks(); // Clear mocks before each test
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // --- Tests for logEntryAction ---
  describe('logEntryAction', () => {
    it('should successfully log a new journal entry', async () => {
      const createDto: CreateJournalEntryDto = {
        entryId: 12,
        action: JournalActionEnum.JOINED,
        prevStatus: null,
        newStatus: JournalStatusEnum.WAITING,
        initiatedByUserId: 3,
        comment: 'New user joined.',
      };
      // Mock create to return a partial entity, save to return the full saved entity
      const journalEntryToSave = { ...createDto, logTime: new Date() }; // Simulate what create would return
      const savedJournalEntry = { ...journalEntryToSave, logId: 4 }; // Simulate what save would return

      jest.spyOn(journalRepository, 'create').mockReturnValue(journalEntryToSave as Journal);
      jest.spyOn(journalRepository, 'save').mockResolvedValue(savedJournalEntry as Journal);

      const result = await service.logEntryAction(createDto);

      expect(journalRepository.create).toHaveBeenCalledWith(createDto);
      expect(journalRepository.save).toHaveBeenCalledWith(journalEntryToSave);
      expect(result).toEqual(savedJournalEntry);
    });
  });

  // --- Tests for findAll ---
  describe('findAll', () => {
    it('should return all journal entries when no filters are applied', async () => {
      const queryDto: QueryJournalEntriesDto = {};
      jest.spyOn(journalRepository, 'find').mockResolvedValue([mockJournalEntry3, mockJournalEntry2, mockJournalEntry]); // Sorted DESC by logTime

      const result = await service.findAll(queryDto);

      expect(journalRepository.find).toHaveBeenCalledWith({
        relations: ['entry', 'user'],
        where: {},
        order: { logTime: 'DESC' },
      });
      expect(result).toEqual([mockJournalEntry3, mockJournalEntry2, mockJournalEntry]);
    });

    it('should filter entries by entryId', async () => {
      const queryDto: QueryJournalEntriesDto = { entryId: mockEntry.entryId.toString() };
      jest.spyOn(journalRepository, 'find').mockResolvedValue([mockJournalEntry2, mockJournalEntry]);

      const result = await service.findAll(queryDto);

      expect(journalRepository.find).toHaveBeenCalledWith({
        relations: ['entry', 'user'],
        where: { entryId: mockEntry.entryId },
        order: { logTime: 'DESC' },
      });
      expect(result).toEqual([mockJournalEntry2, mockJournalEntry]);
    });

    it('should filter entries by initiatedByUserId', async () => {
      const queryDto: QueryJournalEntriesDto = { initiatedByUserId: mockUser.userId.toString() };
      jest.spyOn(journalRepository, 'find').mockResolvedValue([mockJournalEntry2, mockJournalEntry]);

      const result = await service.findAll(queryDto);

      expect(journalRepository.find).toHaveBeenCalledWith({
        relations: ['entry', 'user'],
        where: { initiatedByUserId: mockUser.userId },
        order: { logTime: 'DESC' },
      });
      expect(result).toEqual([mockJournalEntry2, mockJournalEntry]);
    });

    it('should filter entries by action', async () => {
      const queryDto: QueryJournalEntriesDto = { action: JournalActionEnum.LEFT };
      jest.spyOn(journalRepository, 'find').mockResolvedValue([mockJournalEntry3]);

      const result = await service.findAll(queryDto);

      expect(journalRepository.find).toHaveBeenCalledWith({
        relations: ['entry', 'user'],
        where: { action: JournalActionEnum.LEFT },
        order: { logTime: 'DESC' },
      });
      expect(result).toEqual([mockJournalEntry3]);
    });

    it('should filter entries by multiple criteria', async () => {
      const queryDto: QueryJournalEntriesDto = {
        entryId: mockEntry.entryId.toString(),
        action: JournalActionEnum.STATUS_CHANGED,
      };
      jest.spyOn(journalRepository, 'find').mockResolvedValue([mockJournalEntry2]);

      const result = await service.findAll(queryDto);

      expect(journalRepository.find).toHaveBeenCalledWith({
        relations: ['entry', 'user'],
        where: { entryId: mockEntry.entryId, action: JournalActionEnum.STATUS_CHANGED },
        order: { logTime: 'DESC' },
      });
      expect(result).toEqual([mockJournalEntry2]);
    });

    it('should return empty array if no entries match filters', async () => {
      const queryDto: QueryJournalEntriesDto = { entryId: '999' };
      jest.spyOn(journalRepository, 'find').mockResolvedValue([]);

      const result = await service.findAll(queryDto);

      expect(journalRepository.find).toHaveBeenCalledWith({
        relations: ['entry', 'user'],
        where: { entryId: 999 },
        order: { logTime: 'DESC' },
      });
      expect(result).toEqual([]);
    });
  });

  // --- Tests for findOne ---
  describe('findOne', () => {
    it('should return a journal entry if found by ID', async () => {
      jest.spyOn(journalRepository, 'findOne').mockResolvedValue(mockJournalEntry);

      const result = await service.findOne(mockJournalEntry.logId);

      expect(journalRepository.findOne).toHaveBeenCalledWith({
        where: { logId: mockJournalEntry.logId },
        relations: ['entry', 'user'],
      });
      expect(result).toEqual(mockJournalEntry);
    });

    it('should return null if journal entry not found by ID', async () => {
      jest.spyOn(journalRepository, 'findOne').mockResolvedValue(null);

      const result = await service.findOne(999);

      expect(journalRepository.findOne).toHaveBeenCalledWith({
        where: { logId: 999 },
        relations: ['entry', 'user'],
      });
      expect(result).toBeNull();
    });
  });
});
