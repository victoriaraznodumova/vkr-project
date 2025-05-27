// src/auth/password-reset-tokens.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { PasswordResetCodesService } from './password-reset-codes.service';
import { PasswordResetCode } from './entity/password-reset-token.entity';
import { User } from '../users/entity/user.entity';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';

// --- Mock Objects for Dependencies ---
const mockPasswordResetCodeRepository = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
};

const mockMailerService = {
  sendMail: jest.fn(),
};

const mockConfigService = {
  get: jest.fn((key: string) => {
    if (key === 'APP_NAME') return 'Test App';
    return null;
  }),
};

// --- Mock Entity Objects ---
const mockUser: User = {
  userId: 1,
  email: 'user@example.com',
  passwordHash: 'hashed_password',
  registrationDate: new Date(),
  entries: [], administrators: [], queues: [], initiatedEvents: [], passwordResetTokens: [],
};

const MOCKED_DATE = new Date('2023-01-01T10:00:00.000Z'); // Фиксированная дата для тестов

const mockPasswordResetCode: PasswordResetCode = {
  id: 1,
  userId: mockUser.userId,
  code: '123456',
  expiresAt: new Date(MOCKED_DATE.getTime() + 15 * 60 * 1000), // MOCKED_DATE + 15 minutes
  isValid: true,
  createdAt: MOCKED_DATE,
  user: mockUser,
};

describe('PasswordResetCodesService', () => {
  let service: PasswordResetCodesService;
  let passwordResetCodeRepository: Repository<PasswordResetCode>;
  let mailerService: MailerService;
  let configService: ConfigService;

  beforeEach(async () => {
    // Используем Jest Fake Timers для контроля времени
    jest.useFakeTimers();
    jest.setSystemTime(MOCKED_DATE); // Устанавливаем системное время на MOCKED_DATE

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PasswordResetCodesService,
        {
          provide: getRepositoryToken(PasswordResetCode),
          useValue: mockPasswordResetCodeRepository,
        },
        {
          provide: MailerService,
          useValue: mockMailerService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<PasswordResetCodesService>(PasswordResetCodesService);
    passwordResetCodeRepository = module.get<Repository<PasswordResetCode>>(getRepositoryToken(PasswordResetCode));
    mailerService = module.get<MailerService>(MailerService);
    configService = module.get<ConfigService>(ConfigService);

    jest.clearAllMocks(); // Clear mocks before each test
  });

  afterEach(() => {
    jest.useRealTimers(); // Восстанавливаем реальные таймеры после каждого теста
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // --- Tests for createCode ---
  describe('createCode', () => {
    it('should invalidate existing codes for the user', async () => {
      jest.spyOn(service as any, 'generateNumericCode').mockReturnValue('987654'); // Mock private method
      mockPasswordResetCodeRepository.create.mockReturnValue(mockPasswordResetCode);
      mockPasswordResetCodeRepository.save.mockResolvedValue(mockPasswordResetCode);
      mockPasswordResetCodeRepository.update.mockResolvedValue({ affected: 1, raw: [] }); // For invalidateCodesForUser

      await service.createCode(mockUser);

      expect(mockPasswordResetCodeRepository.update).toHaveBeenCalledWith(
        { userId: mockUser.userId, isValid: true },
        { isValid: false },
      );
    });

    it('should generate a new 6-digit numeric code', async () => {
      jest.spyOn(service as any, 'generateNumericCode').mockReturnValue('123456'); // Mock private method
      mockPasswordResetCodeRepository.create.mockReturnValue(mockPasswordResetCode);
      mockPasswordResetCodeRepository.save.mockResolvedValue(mockPasswordResetCode);
      mockPasswordResetCodeRepository.update.mockResolvedValue({ affected: 0, raw: [] }); // For invalidateCodesForUser

      const code = await service.createCode(mockUser);

      expect(code.code).toMatch(/^\d{6}$/); // Check format
      expect(code.code).toEqual('123456');
    });

    it('should set expiresAt correctly (15 minutes from now)', async () => {
      jest.spyOn(service as any, 'generateNumericCode').mockReturnValue('123456');
      mockPasswordResetCodeRepository.create.mockReturnValue(mockPasswordResetCode);
      mockPasswordResetCodeRepository.save.mockResolvedValue(mockPasswordResetCode);
      mockPasswordResetCodeRepository.update.mockResolvedValue({ affected: 0, raw: [] }); // For invalidateCodesForUser

      const expectedExpiresAt = new Date(MOCKED_DATE.getTime() + 15 * 60 * 1000); // MOCKED_DATE + 15 minutes

      const code = await service.createCode(mockUser);

      expect(code.expiresAt.toISOString()).toEqual(expectedExpiresAt.toISOString());
    });

    it('should set isValid to true', async () => {
      jest.spyOn(service as any, 'generateNumericCode').mockReturnValue('123456');
      mockPasswordResetCodeRepository.create.mockReturnValue(mockPasswordResetCode);
      mockPasswordResetCodeRepository.save.mockResolvedValue(mockPasswordResetCode);
      mockPasswordResetCodeRepository.update.mockResolvedValue({ affected: 0, raw: [] }); // For invalidateTokensForUser

      const code = await service.createCode(mockUser);

      expect(code.isValid).toBe(true);
    });

    it('should save the new code', async () => {
      jest.spyOn(service as any, 'generateNumericCode').mockReturnValue('123456');
      mockPasswordResetCodeRepository.create.mockReturnValue(mockPasswordResetCode);
      mockPasswordResetCodeRepository.save.mockResolvedValue(mockPasswordResetCode);
      mockPasswordResetCodeRepository.update.mockResolvedValue({ affected: 0, raw: [] }); // For invalidateCodesForUser

      await service.createCode(mockUser);

      expect(mockPasswordResetCodeRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: mockUser.userId,
          code: '123456',
          isValid: true,
        }),
      );
      expect(mockPasswordResetCodeRepository.save).toHaveBeenCalledWith(mockPasswordResetCode);
    });
  });

  // --- Tests for findValidToken ---
  describe('findValidCode', () => {
    it('should return a code if found and valid', async () => {
      mockPasswordResetCodeRepository.findOne.mockResolvedValue(mockPasswordResetCode);

      const result = await service.findValidCode(mockUser.userId, mockPasswordResetCode.code);

      expect(mockPasswordResetCodeRepository.findOne).toHaveBeenCalledWith({
        where: {
          userId: mockUser.userId,
          code: mockPasswordResetCode.code,
          isValid: true,
          expiresAt: MoreThan(MOCKED_DATE), // MoreThan will compare against the mocked system time
        },
        relations: ['user'],
      });
      expect(result).toEqual(mockPasswordResetCode);
    });

    it('should return null if code is not found', async () => {
      mockPasswordResetCodeRepository.findOne.mockResolvedValue(null);

      const result = await service.findValidCode(mockUser.userId, 'nonexistent');

      expect(result).toBeNull();
    });

    it('should return null if code is expired', async () => {
      // Set system time *after* code creation to simulate expiration
      jest.setSystemTime(new Date(MOCKED_DATE.getTime() + 20 * 60 * 1000)); // 20 minutes later

      // findOne with MoreThan(currentDate) will naturally return null for an expired code
      mockPasswordResetCodeRepository.findOne.mockResolvedValue(null);

      const result = await service.findValidCode(mockUser.userId, mockPasswordResetCode.code);

      expect(result).toBeNull();
    });

    it('should return null if code is invalid (isValid: false)', async () => {
      // Mock findOne to return a code that is *not* valid, but the query should filter it out
      const invalidCode = { ...mockPasswordResetCode, isValid: false };
      mockPasswordResetCodeRepository.findOne.mockResolvedValue(null); // The query's `isValid: true` filter will make it return null

      const result = await service.findValidCode(mockUser.userId, invalidCode.code);

      expect(result).toBeNull();
    });
  });

  // --- Tests for invalidateCode ---
  describe('invalidateCode', () => {
    it('should set isValid to false and save the code', async () => {
      const codeToInvalidate = { ...mockPasswordResetCode, isValid: true }; // Simulate active code
      const expectedSavedCode = { ...codeToInvalidate, isValid: false };

      mockPasswordResetCodeRepository.save.mockResolvedValue(expectedSavedCode);

      await service.invalidateCode(codeToInvalidate);

      expect(codeToInvalidate.isValid).toBe(false); // Check mutation
      expect(mockPasswordResetCodeRepository.save).toHaveBeenCalledWith(expectedSavedCode);
    });
  });

  // --- Tests for invalidateCodesForUser ---
  describe('invalidateCodesForUser', () => {
    it('should update all active codes for a user to isValid: false', async () => {
      mockPasswordResetCodeRepository.update.mockResolvedValue({ affected: 2, raw: [] }); // Simulate 2 codes updated

      await service.invalidateCodesForUser(mockUser.userId);

      expect(mockPasswordResetCodeRepository.update).toHaveBeenCalledWith(
        { userId: mockUser.userId, isValid: true },
        { isValid: false },
      );
    });
  });

  // --- Tests for sendPasswordResetCode ---
  describe('sendPasswordResetCode', () => {
    let consoleLogSpy: jest.SpyInstance;
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
      // Мокируем console.log и console.error для чистоты вывода тестов
      consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleLogSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    it('should send an email with the reset code', async () => {
      mockMailerService.sendMail.mockResolvedValue(undefined); // Simulate successful email send

      await service.sendPasswordResetCode(mockUser.email, mockPasswordResetCode.code);

      expect(mailerService.sendMail).toHaveBeenCalledWith({
        to: mockUser.email,
        subject: 'Сброс пароля для вашего аккаунта',
        template: './password-reset',
        context: {
          code: mockPasswordResetCode.code,
          expiresInMinutes: 15,
          appName: 'Test App',
        },
      });
      expect(consoleLogSpy).toHaveBeenCalledWith(`Код сброса (${mockPasswordResetCode.code}) успешно отправлен на email: ${mockUser.email}`);
    });

    it('should log an error but not throw if email sending fails', async () => {
      mockMailerService.sendMail.mockRejectedValue(new Error('Email send failed')); // Simulate email send failure

      await service.sendPasswordResetCode(mockUser.email, mockPasswordResetCode.code);

      expect(mailerService.sendMail).toHaveBeenCalled(); // Still called
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        `Ошибка при отправке кода сброса на email ${mockUser.email}:`,
        expect.any(Error),
      );
      expect(consoleLogSpy).not.toHaveBeenCalled(); // Log success should not be called
    });
  });
});
