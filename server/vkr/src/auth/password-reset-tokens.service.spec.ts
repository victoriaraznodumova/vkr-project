// src/auth/password-reset-tokens.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { PasswordResetTokensService } from './password-reset-tokens.service';
import { PasswordResetToken } from './entity/password-reset-token.entity';
import { User } from '../users/entity/user.entity';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';

// --- Mock Objects for Dependencies ---
const mockPasswordResetTokenRepository = {
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

const mockPasswordResetToken: PasswordResetToken = {
  id: 1,
  userId: mockUser.userId,
  token: '123456',
  expiresAt: new Date(MOCKED_DATE.getTime() + 15 * 60 * 1000), // MOCKED_DATE + 15 minutes
  isValid: true,
  createdAt: MOCKED_DATE,
  user: mockUser,
};

describe('PasswordResetTokensService', () => {
  let service: PasswordResetTokensService;
  let passwordResetTokenRepository: Repository<PasswordResetToken>;
  let mailerService: MailerService;
  let configService: ConfigService;

  beforeEach(async () => {
    // Используем Jest Fake Timers для контроля времени
    jest.useFakeTimers();
    jest.setSystemTime(MOCKED_DATE); // Устанавливаем системное время на MOCKED_DATE

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PasswordResetTokensService,
        {
          provide: getRepositoryToken(PasswordResetToken),
          useValue: mockPasswordResetTokenRepository,
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

    service = module.get<PasswordResetTokensService>(PasswordResetTokensService);
    passwordResetTokenRepository = module.get<Repository<PasswordResetToken>>(getRepositoryToken(PasswordResetToken));
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

  // --- Tests for createToken ---
  describe('createToken', () => {
    it('should invalidate existing tokens for the user', async () => {
      jest.spyOn(service as any, 'generateNumericCode').mockReturnValue('987654'); // Mock private method
      mockPasswordResetTokenRepository.create.mockReturnValue(mockPasswordResetToken);
      mockPasswordResetTokenRepository.save.mockResolvedValue(mockPasswordResetToken);
      mockPasswordResetTokenRepository.update.mockResolvedValue({ affected: 1, raw: [] }); // For invalidateTokensForUser

      await service.createToken(mockUser);

      expect(mockPasswordResetTokenRepository.update).toHaveBeenCalledWith(
        { userId: mockUser.userId, isValid: true },
        { isValid: false },
      );
    });

    it('should generate a new 6-digit numeric token', async () => {
      jest.spyOn(service as any, 'generateNumericCode').mockReturnValue('123456'); // Mock private method
      mockPasswordResetTokenRepository.create.mockReturnValue(mockPasswordResetToken);
      mockPasswordResetTokenRepository.save.mockResolvedValue(mockPasswordResetToken);
      mockPasswordResetTokenRepository.update.mockResolvedValue({ affected: 0, raw: [] }); // For invalidateTokensForUser

      const token = await service.createToken(mockUser);

      expect(token.token).toMatch(/^\d{6}$/); // Check format
      expect(token.token).toEqual('123456');
    });

    it('should set expiresAt correctly (15 minutes from now)', async () => {
      jest.spyOn(service as any, 'generateNumericCode').mockReturnValue('123456');
      mockPasswordResetTokenRepository.create.mockReturnValue(mockPasswordResetToken);
      mockPasswordResetTokenRepository.save.mockResolvedValue(mockPasswordResetToken);
      mockPasswordResetTokenRepository.update.mockResolvedValue({ affected: 0, raw: [] }); // For invalidateTokensForUser

      const expectedExpiresAt = new Date(MOCKED_DATE.getTime() + 15 * 60 * 1000); // MOCKED_DATE + 15 minutes

      const token = await service.createToken(mockUser);

      expect(token.expiresAt.toISOString()).toEqual(expectedExpiresAt.toISOString());
    });

    it('should set isValid to true', async () => {
      jest.spyOn(service as any, 'generateNumericCode').mockReturnValue('123456');
      mockPasswordResetTokenRepository.create.mockReturnValue(mockPasswordResetToken);
      mockPasswordResetTokenRepository.save.mockResolvedValue(mockPasswordResetToken);
      mockPasswordResetTokenRepository.update.mockResolvedValue({ affected: 0, raw: [] }); // For invalidateTokensForUser

      const token = await service.createToken(mockUser);

      expect(token.isValid).toBe(true);
    });

    it('should save the new token', async () => {
      jest.spyOn(service as any, 'generateNumericCode').mockReturnValue('123456');
      mockPasswordResetTokenRepository.create.mockReturnValue(mockPasswordResetToken);
      mockPasswordResetTokenRepository.save.mockResolvedValue(mockPasswordResetToken);
      mockPasswordResetTokenRepository.update.mockResolvedValue({ affected: 0, raw: [] }); // For invalidateTokensForUser

      await service.createToken(mockUser);

      expect(mockPasswordResetTokenRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: mockUser.userId,
          token: '123456',
          isValid: true,
        }),
      );
      expect(mockPasswordResetTokenRepository.save).toHaveBeenCalledWith(mockPasswordResetToken);
    });
  });

  // --- Tests for findValidToken ---
  describe('findValidToken', () => {
    it('should return a token if found and valid', async () => {
      mockPasswordResetTokenRepository.findOne.mockResolvedValue(mockPasswordResetToken);

      const result = await service.findValidToken(mockUser.userId, mockPasswordResetToken.token);

      expect(mockPasswordResetTokenRepository.findOne).toHaveBeenCalledWith({
        where: {
          userId: mockUser.userId,
          token: mockPasswordResetToken.token,
          isValid: true,
          expiresAt: MoreThan(MOCKED_DATE), // MoreThan will compare against the mocked system time
        },
        relations: ['user'],
      });
      expect(result).toEqual(mockPasswordResetToken);
    });

    it('should return null if token is not found', async () => {
      mockPasswordResetTokenRepository.findOne.mockResolvedValue(null);

      const result = await service.findValidToken(mockUser.userId, 'nonexistent');

      expect(result).toBeNull();
    });

    it('should return null if token is expired', async () => {
      // Set system time *after* token creation to simulate expiration
      jest.setSystemTime(new Date(MOCKED_DATE.getTime() + 20 * 60 * 1000)); // 20 minutes later

      // findOne with MoreThan(currentDate) will naturally return null for an expired token
      mockPasswordResetTokenRepository.findOne.mockResolvedValue(null);

      const result = await service.findValidToken(mockUser.userId, mockPasswordResetToken.token);

      expect(result).toBeNull();
    });

    it('should return null if token is invalid (isValid: false)', async () => {
      // Mock findOne to return a token that is *not* valid, but the query should filter it out
      const invalidToken = { ...mockPasswordResetToken, isValid: false };
      mockPasswordResetTokenRepository.findOne.mockResolvedValue(null); // The query's `isValid: true` filter will make it return null

      const result = await service.findValidToken(mockUser.userId, invalidToken.token);

      expect(result).toBeNull();
    });
  });

  // --- Tests for invalidateToken ---
  describe('invalidateToken', () => {
    it('should set isValid to false and save the token', async () => {
      const tokenToInvalidate = { ...mockPasswordResetToken, isValid: true }; // Simulate active token
      const expectedSavedToken = { ...tokenToInvalidate, isValid: false };

      mockPasswordResetTokenRepository.save.mockResolvedValue(expectedSavedToken);

      await service.invalidateToken(tokenToInvalidate);

      expect(tokenToInvalidate.isValid).toBe(false); // Check mutation
      expect(mockPasswordResetTokenRepository.save).toHaveBeenCalledWith(expectedSavedToken);
    });
  });

  // --- Tests for invalidateTokensForUser ---
  describe('invalidateTokensForUser', () => {
    it('should update all active tokens for a user to isValid: false', async () => {
      mockPasswordResetTokenRepository.update.mockResolvedValue({ affected: 2, raw: [] }); // Simulate 2 tokens updated

      await service.invalidateTokensForUser(mockUser.userId);

      expect(mockPasswordResetTokenRepository.update).toHaveBeenCalledWith(
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

      await service.sendPasswordResetCode(mockUser.email, mockPasswordResetToken.token);

      expect(mailerService.sendMail).toHaveBeenCalledWith({
        to: mockUser.email,
        subject: 'Сброс пароля для вашего аккаунта',
        template: './password-reset',
        context: {
          code: mockPasswordResetToken.token,
          expiresInMinutes: 15,
          appName: 'Test App',
        },
      });
      expect(consoleLogSpy).toHaveBeenCalledWith(`Код сброса (${mockPasswordResetToken.token}) успешно отправлен на email: ${mockUser.email}`);
    });

    it('should log an error but not throw if email sending fails', async () => {
      mockMailerService.sendMail.mockRejectedValue(new Error('Email send failed')); // Simulate email send failure

      await service.sendPasswordResetCode(mockUser.email, mockPasswordResetToken.token);

      expect(mailerService.sendMail).toHaveBeenCalled(); // Still called
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        `Ошибка при отправке кода сброса на email ${mockUser.email}:`,
        expect.any(Error),
      );
      expect(consoleLogSpy).not.toHaveBeenCalled(); // Log success should not be called
    });
  });
});
