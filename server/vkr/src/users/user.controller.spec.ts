// src/users/user.controller.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from './entity/user.entity'; // Предполагаемая сущность User
import { NotFoundException } from '@nestjs/common';

// Мок-объект для сущности User
const mockUserEntity: User = {
    userId: 1,
    email: 'test@example.com',
    passwordHash: 'hashedpassword',
    registrationDate: undefined,
    entries: [],
    administrators: [],
    queues: [],
    initiatedEvents: [],
    passwordResetTokens: []
};

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            // Мокируем все методы сервиса, которые используются в контроллере
            findOne: jest.fn(),
            findByEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);

    jest.clearAllMocks(); // Очищаем все моки перед каждым тестом
  });

  it('контроллер должен быть определен', () => {
    expect(controller).toBeDefined();
  });

  describe('getUserById', () => {
    it('должен вернуть пользователя по ID', async () => {
      const id = 1;
      jest.spyOn(service, 'findOne').mockResolvedValue(mockUserEntity);

      const result = await controller.getUserById(id);

      expect(service.findOne).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockUserEntity);
    });

    it('должен выбросить NotFoundException, если пользователь не найден по ID', async () => {
      const id = 999;
      jest.spyOn(service, 'findOne').mockRejectedValue(
        new NotFoundException(`Пользователь с ID ${id} не найден.`),
      );

      await expect(controller.getUserById(id)).rejects.toThrow(NotFoundException);
      expect(service.findOne).toHaveBeenCalledWith(id);
    });

    it('должен выбросить NotFoundException для некорректного ID', async () => {
      const id = -1; // Некорректный ID
      jest.spyOn(service, 'findOne').mockRejectedValue(
        new NotFoundException(`Некорректный ID пользователя: ${id}.`),
      );

      await expect(controller.getUserById(id)).rejects.toThrow(NotFoundException);
      expect(service.findOne).toHaveBeenCalledWith(id);
    });
  });

  describe('getUserByEmail', () => {
    it('должен вернуть пользователя по email', async () => {
      const email = 'test@example.com';
      jest.spyOn(service, 'findByEmail').mockResolvedValue(mockUserEntity);

      const result = await controller.getUserByEmail(email);

      expect(service.findByEmail).toHaveBeenCalledWith(email);
      expect(result).toEqual(mockUserEntity);
    });

    it('должен вернуть null, если пользователь не найден по email', async () => {
      const email = 'nonexistent@example.com';
      jest.spyOn(service, 'findByEmail').mockResolvedValue(null);

      const result = await controller.getUserByEmail(email);

      expect(service.findByEmail).toHaveBeenCalledWith(email);
      expect(result).toBeNull();
    });

    it('должен вернуть null для некорректного email', async () => {
      const email = 'invalid-email';
      jest.spyOn(service, 'findByEmail').mockResolvedValue(null); // Сервис сам обрабатывает некорректный email

      const result = await controller.getUserByEmail(email);

      expect(service.findByEmail).toHaveBeenCalledWith(email);
      expect(result).toBeNull();
    });
  });
});
