// src/users/user.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entity/user.entity';
// import e from 'express'; // <-- Удален ненужный импорт

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Находит пользователя по его ID.
   * @param userId ID пользователя.
   * @returns Promise с сущностью User.
   * @throws NotFoundException если пользователь не найден.
   */
  async findOne(userId: number): Promise<User> { // <-- findById переименован в findOne
    if (!Number.isInteger(userId) || userId <= 0) { // Упрощенная проверка
      throw new NotFoundException(`Некорректный ID пользователя: ${userId}.`);
    }
    const user = await this.userRepository.findOne({ where: { userId } });
    if (!user) {
      throw new NotFoundException(`Пользователь с ID ${userId} не найден.`);
    }
    return user;
  }

  /**
   * Находит пользователя по его email.
   * Используется, например, при аутентификации в AuthService.
   * @param email Email пользователя.
   * @returns Promise с сущностью User или null.
   */
  async findByEmail(email: string): Promise<User | null> {
    if (!email || typeof email !== "string" || !email.includes('@')) {
      return null; // Возвращаем null для некорректных входных данных
    }
    const user = await this.userRepository.findOne({ where: { email } });
    return user;
  }

  /**
   * Создает нового пользователя.
   * @param userData Частичные данные пользователя для создания.
   * @returns Promise с созданной сущностью User.
   */
  async create(userData: Partial<User>): Promise<User> {
    const newUser = this.userRepository.create(userData);
    return this.userRepository.save(newUser);
  }
}
