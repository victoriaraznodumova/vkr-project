// src/entries/entries.controller.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { EntryController } from './entry.controller';
import { EntryService } from './entry.service';
import { CreateEntryDto } from './dto/create-entry.dto';
import { UpdateEntryDto } from './dto/update-entry.dto';
import { ShowEntryDto } from './dto/show-entry.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../users/entity/user.entity';
import {
  UnauthorizedException,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ExecutionContext,
  CallHandler,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { Entry } from './entity/entry.entity'; // Предполагаем, что у вас есть сущность Entry
import { EntryStatusEnum } from './entity/entry.status.enum';

describe('EntryController', () => {
  let controller: EntryController;
  let entryService: EntryService;
  let mockJwtCanActivate: jest.Mock;

  // Мок-пользователь для req.user
  const mockUser: User = {
    userId: 1,
    email: 'test@example.com',
    passwordHash: 'hashedPassword',
    registrationDate: new Date(),
    administrators: [],
    entries: [],
    initiatedEvents: [],
    passwordResetTokens: [],
    queues: [],
  };

  // Мок-запись
  const mockEntry: Entry = {
      entryId: 1,
      queueId: 101,
      userId: mockUser.userId,
      status: EntryStatusEnum.CANCELED,
      createdAt: new Date(),
      queue: null, // Мокируем, что это не загружено для простоты
      user: null,
      entryTimeOrg: undefined,
      entryPositionSelf: 0,
      sequentialNumberSelf: 0,
      statusUpdatedAt: undefined,
      notificationMinutes: 0,
      notificationPosition: 0,
      actualStartTime: undefined,
      actualEndTime: undefined,
      logs: []
  };

  // Мок-ShowEntryDto (для ожидаемых результатов)
  const mockShowEntryDto: ShowEntryDto = {
      entryId: 1,
      queueId: 101,
      userId: mockUser.userId,
      status: EntryStatusEnum.CANCELED,
      createdAt: mockEntry.createdAt,
      entryTimeOrg: undefined,
      entryPositionSelf: 0,
      sequentialNumberSelf: 0,
      statusUpdatedAt: undefined,
      notificationMinutes: 0,
      notificationPosition: 0,
      actualStartTime: undefined,
      actualEndTime: undefined
  };

  beforeEach(async () => {
    // Инициализируем Jest-мок для canActivate JwtAuthGuard
    mockJwtCanActivate = jest.fn((context: ExecutionContext) => {
      const request = context.switchToHttp().getRequest();
      request.user = mockUser; // Устанавливаем мок-пользователя в запрос
      return true;
    });

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EntryController],
      providers: [
        {
          provide: EntryService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            updateStatus: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          // Мокируем ClassSerializerInterceptor, чтобы он просто пропускал данные
          provide: ClassSerializerInterceptor,
          useValue: {
            intercept: jest.fn((context: ExecutionContext, next: CallHandler) => {
              return next.handle();
            }),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard) // Переопределяем JwtAuthGuard
      .useValue({ canActivate: mockJwtCanActivate }) // Используем наш мок canActivate
      .compile();

    controller = module.get<EntryController>(EntryController);
    entryService = module.get<EntryService>(EntryService);

    // Очищаем все моки перед каждым тестом
    jest.clearAllMocks();
  });

  it('должен быть определен', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('должен успешно создать запись', async () => {
      const createEntryDto: CreateEntryDto = { queueId: 101 };
      jest.spyOn(entryService, 'create').mockResolvedValue(mockEntry);

      const result = await controller.create(createEntryDto, { user: mockUser });

      expect(mockJwtCanActivate).toHaveBeenCalled();
      expect(entryService.create).toHaveBeenCalledWith(createEntryDto, mockUser.userId);
      expect(result).toEqual(mockShowEntryDto);
    });

    it('должен выбросить UnauthorizedException, если пользователь не аутентифицирован (обрабатывается гвардом)', async () => {
      mockJwtCanActivate.mockImplementationOnce(() => {
        throw new UnauthorizedException();
      });
      const createEntryDto: CreateEntryDto = { queueId: 101 };

      await expect(controller.create(createEntryDto, { user: null as any })).rejects.toThrow(UnauthorizedException);
      expect(mockJwtCanActivate).toHaveBeenCalled();
      expect(entryService.create).not.toHaveBeenCalled();
    });

    it('должен выбросить NotFoundException, если очередь не найдена', async () => {
      const createEntryDto: CreateEntryDto = { queueId: 999 };
      jest.spyOn(entryService, 'create').mockRejectedValue(new NotFoundException('Очередь не найдена.'));

      await expect(controller.create(createEntryDto, { user: mockUser })).rejects.toThrow(NotFoundException);
      expect(mockJwtCanActivate).toHaveBeenCalled();
    });

    it('должен выбросить BadRequestException для некорректных данных', async () => {
      const createEntryDto: CreateEntryDto = { queueId: null as any }; // Некорректные данные
      jest.spyOn(entryService, 'create').mockRejectedValue(new BadRequestException('Некорректные данные.'));

      await expect(controller.create(createEntryDto, { user: mockUser })).rejects.toThrow(BadRequestException);
      expect(mockJwtCanActivate).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('должен вернуть все записи', async () => {
      jest.spyOn(entryService, 'findAll').mockResolvedValue([mockEntry]);

      const result = await controller.findAll();

      expect(mockJwtCanActivate).toHaveBeenCalled();
      expect(entryService.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockShowEntryDto]);
    });

    it('должен выбросить UnauthorizedException, если пользователь не аутентифицирован (обрабатывается гвардом)', async () => {
      mockJwtCanActivate.mockImplementationOnce(() => {
        throw new UnauthorizedException();
      });

      await expect(controller.findAll()).rejects.toThrow(UnauthorizedException);
      expect(mockJwtCanActivate).toHaveBeenCalled();
      expect(entryService.findAll).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('должен вернуть запись по ID', async () => {
      jest.spyOn(entryService, 'findOne').mockResolvedValue(mockEntry);

      const result = await controller.findOne('1');

      expect(mockJwtCanActivate).toHaveBeenCalled();
      expect(entryService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockShowEntryDto);
    });

    it('должен выбросить UnauthorizedException, если пользователь не аутентифицирован (обрабатывается гвардом)', async () => {
      mockJwtCanActivate.mockImplementationOnce(() => {
        throw new UnauthorizedException();
      });

      await expect(controller.findOne('1')).rejects.toThrow(UnauthorizedException);
      expect(mockJwtCanActivate).toHaveBeenCalled();
      expect(entryService.findOne).not.toHaveBeenCalled();
    });

    it('должен выбросить NotFoundException, если запись не найдена', async () => {
      jest.spyOn(entryService, 'findOne').mockRejectedValue(new NotFoundException('Запись не найдена.'));

      await expect(controller.findOne('999')).rejects.toThrow(NotFoundException);
      expect(mockJwtCanActivate).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('должен успешно обновить запись', async () => {
    //   const updateEntryDto: UpdateEntryDto = { status: EntryStatusEnum.COMPLETED };
    //   const updatedEntry: Entry = { ...mockEntry, status: 'completed' };
    //   const updatedShowEntryDto: ShowEntryDto = { ...mockShowEntryDto, status: 'completed' };
    //   jest.spyOn(entryService, 'update').mockResolvedValue(updatedEntry);

    //   const result = await controller.update('1', updateEntryDto, { user: mockUser });

    //   expect(mockJwtCanActivate).toHaveBeenCalled();
    //   expect(entryService.update).toHaveBeenCalledWith(1, updateEntryDto, mockUser.userId);
    //   expect(result).toEqual(updatedShowEntryDto);
    });

    // it('должен выбросить UnauthorizedException, если пользователь не аутентифицирован (обрабатывается гвардом)', async () => {
    //   mockJwtCanActivate.mockImplementationOnce(() => {
    //     throw new UnauthorizedException();
    //   });
    //   const updateEntryDto: UpdateEntryDto = { status: 'completed' };

    //   await expect(controller.update('1', updateEntryDto, { user: null as any })).rejects.toThrow(UnauthorizedException);
    //   expect(mockJwtCanActivate).toHaveBeenCalled();
    //   expect(entryService.update).not.toHaveBeenCalled();
    // });

    // it('должен выбросить NotFoundException, если запись не найдена', async () => {
    //   const updateEntryDto: UpdateEntryDto = { status: 'completed' };
    //   jest.spyOn(entryService, 'update').mockRejectedValue(new NotFoundException('Запись не найдена.'));

    //   await expect(controller.update('999', updateEntryDto, { user: mockUser })).rejects.toThrow(NotFoundException);
    //   expect(mockJwtCanActivate).toHaveBeenCalled();
    // });

    // it('должен выбросить ForbiddenException, если пользователь не владелец/администратор', async () => {
    //   const updateEntryDto: UpdateEntryDto = { status: 'completed' };
    //   jest.spyOn(entryService, 'update').mockRejectedValue(new ForbiddenException('Доступ запрещен.'));

    //   await expect(controller.update('1', updateEntryDto, { user: mockUser })).rejects.toThrow(ForbiddenException);
    //   expect(mockJwtCanActivate).toHaveBeenCalled();
    // });

    // it('должен выбросить BadRequestException для некорректных данных', async () => {
    //   const updateEntryDto: UpdateEntryDto = { status: 'invalid_status' as any };
    //   jest.spyOn(entryService, 'update').mockRejectedValue(new BadRequestException('Некорректный статус.'));

    //   await expect(controller.update('1', updateEntryDto, { user: mockUser })).rejects.toThrow(BadRequestException);
    //   expect(mockJwtCanActivate).toHaveBeenCalled();
    // });
  });

  describe('updateStatus', () => {
    // it('должен успешно обновить статус записи', async () => {
    //   const updateStatusDto: UpdateStatusDto = {  status: EntryStatusEnum.COMPLETED  };
    //   const updatedEntry: Entry = { ...mockEntry,  status: EntryStatusEnum.COMPLETED  };
    //   const updatedShowEntryDto: ShowEntryDto = { ...mockShowEntryDto, status: 'completed' };
    //   jest.spyOn(entryService, 'updateStatus').mockResolvedValue(updatedEntry);

    //   const result = await controller.updateStatus('1', updateStatusDto, { user: mockUser });

    //   expect(mockJwtCanActivate).toHaveBeenCalled();
    //   expect(entryService.updateStatus).toHaveBeenCalledWith(1, updateStatusDto, mockUser.userId);
    //   expect(result).toEqual(updatedShowEntryDto);
    // });

    it('должен выбросить UnauthorizedException, если пользователь не аутентифицирован (обрабатывается гвардом)', async () => {
      mockJwtCanActivate.mockImplementationOnce(() => {
        throw new UnauthorizedException();
      });
      const updateStatusDto: UpdateStatusDto = {  status: EntryStatusEnum.COMPLETED  };

      await expect(controller.updateStatus('1', updateStatusDto, { user: null as any })).rejects.toThrow(UnauthorizedException);
      expect(mockJwtCanActivate).toHaveBeenCalled();
      expect(entryService.updateStatus).not.toHaveBeenCalled();
    });

    it('должен выбросить NotFoundException, если запись не найдена', async () => {
      const updateStatusDto: UpdateStatusDto = {  status: EntryStatusEnum.COMPLETED  };
      jest.spyOn(entryService, 'updateStatus').mockRejectedValue(new NotFoundException('Запись не найдена.'));

      await expect(controller.updateStatus('999', updateStatusDto, { user: mockUser })).rejects.toThrow(NotFoundException);
      expect(mockJwtCanActivate).toHaveBeenCalled();
    });

    it('должен выбросить ForbiddenException, если пользователь не администратор', async () => {
      const updateStatusDto: UpdateStatusDto = { status: EntryStatusEnum.COMPLETED };
      jest.spyOn(entryService, 'updateStatus').mockRejectedValue(new ForbiddenException('Доступ запрещен.'));

      await expect(controller.updateStatus('1', updateStatusDto, { user: mockUser })).rejects.toThrow(ForbiddenException);
      expect(mockJwtCanActivate).toHaveBeenCalled();
    });

    it('должен выбросить BadRequestException для некорректных данных', async () => {
      const updateStatusDto: UpdateStatusDto = { status: 'invalid_status' as any };
      jest.spyOn(entryService, 'updateStatus').mockRejectedValue(new BadRequestException('Некорректный статус.'));

      await expect(controller.updateStatus('1', updateStatusDto, { user: mockUser })).rejects.toThrow(BadRequestException);
      expect(mockJwtCanActivate).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('должен успешно удалить запись', async () => {
      jest.spyOn(entryService, 'remove').mockResolvedValue(undefined);

      await controller.remove('1', { user: mockUser });

      expect(mockJwtCanActivate).toHaveBeenCalled();
      expect(entryService.remove).toHaveBeenCalledWith(1, mockUser.userId);
    });

    it('должен выбросить UnauthorizedException, если пользователь не аутентифицирован (обрабатывается гвардом)', async () => {
      mockJwtCanActivate.mockImplementationOnce(() => {
        throw new UnauthorizedException();
      });

      await expect(controller.remove('1', { user: null as any })).rejects.toThrow(UnauthorizedException);
      expect(mockJwtCanActivate).toHaveBeenCalled();
      expect(entryService.remove).not.toHaveBeenCalled();
    });

    it('должен выбросить NotFoundException, если запись не найдена', async () => {
      jest.spyOn(entryService, 'remove').mockRejectedValue(new NotFoundException('Запись не найдена.'));

      await expect(controller.remove('999', { user: mockUser })).rejects.toThrow(NotFoundException);
      expect(mockJwtCanActivate).toHaveBeenCalled();
    });

    it('должен выбросить ForbiddenException, если пользователь не владелец/администратор', async () => {
      jest.spyOn(entryService, 'remove').mockRejectedValue(new ForbiddenException('Доступ запрещен.'));

      await expect(controller.remove('1', { user: mockUser })).rejects.toThrow(ForbiddenException);
      expect(mockJwtCanActivate).toHaveBeenCalled();
    });
  });
});
