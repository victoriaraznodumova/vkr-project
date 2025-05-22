// src/users/user.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from '../users/user.service';
import { User } from '../users/entity/user.entity';
import { RegisterUserDto } from '../auth/dto/register-user.dto';
import { NotFoundException } from '@nestjs/common';

// --- Мок-объекты для тестирования ---
const mockUser: User = {
  userId: 1,
  email: 'test@example.com',
  passwordHash: 'hashedpassword',
  registrationDate: new Date('2023-01-01T00:00:00.000Z'),
  entries: [],
  administrators: [],
  queues: [],
  initiatedEvents: [],
  passwordResetTokens: [],
};

const mockRegisterUserDto: RegisterUserDto = {
  email: 'newuser@example.com',
  password: 'newsecurepassword',
};

// --- Тестовый набор для UserService ---
describe('UserService', () => {
  let service: UserService;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
            merge: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));

    jest.clearAllMocks();
  });

  it('должен быть определен', () => {
    expect(service).toBeDefined();
  });

  // --- Тесты для findOne ---
  describe('findOne', () => {
    it('должен вернуть пользователя, если найден по ID', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);

      const user = await service.findOne(mockUser.userId);

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { userId: mockUser.userId } });
      expect(user).toEqual(mockUser);
    });

    it('должен выбросить NotFoundException, если пользователь не найден по ID', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(undefined);

      await expect(service.findOne(999)).rejects.toThrow(
        new NotFoundException(`Пользователь с ID 999 не найден.`)
      );
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { userId: 999 } });
    });
  });

  // --- Тесты для findByEmail ---
  describe('findByEmail', () => {
    it('должен вернуть пользователя, если найден по email', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);

      const user = await service.findByEmail(mockUser.email);

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { email: mockUser.email } });
      expect(user).toEqual(mockUser);
    });

    it('должен вернуть undefined, если пользователь не найден по email', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(undefined);

      const user = await service.findByEmail('nonexistent@example.com');

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { email: 'nonexistent@example.com' } });
      expect(user).toBeUndefined();
    });
  });

  // --- Тесты для create ---
  describe('create', () => {
    it('должен успешно создать нового пользователя', async () => {
      const userToSave = { ...mockUser, email: mockRegisterUserDto.email, passwordHash: mockRegisterUserDto.password };
      jest.spyOn(userRepository, 'create').mockReturnValue(userToSave as User);
      jest.spyOn(userRepository, 'save').mockResolvedValue(userToSave as User);

      const createdUser = await service.create(mockRegisterUserDto);

      expect(userRepository.create).toHaveBeenCalledWith(mockRegisterUserDto);
      expect(userRepository.save).toHaveBeenCalledWith(userToSave);
      expect(createdUser.email).toEqual(mockRegisterUserDto.email);
      expect(createdUser.passwordHash).toEqual(mockRegisterUserDto.password);
    });
  });

 
  
});
