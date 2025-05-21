// src/auth/decorators/roles.decorator.ts

import { SetMetadata } from '@nestjs/common';
import { UserRoleEnum } from '../../users/entity/user-role.enum'; // Убедитесь, что путь правильный

/**
 * Ключ, используемый для хранения метаданных ролей.
 */
export const ROLES_KEY = 'roles';

/**
 * Пользовательский декоратор для назначения необходимых ролей обработчику маршрута.
 * @param roles Массив значений UserRoleEnum, которым разрешен доступ к маршруту.
 * @returns Функция-декоратор, которая устанавливает метаданные для ролей.
 */
export const Roles = (...roles: UserRoleEnum[]) => SetMetadata(ROLES_KEY, roles);
