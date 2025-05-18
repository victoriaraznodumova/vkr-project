import { IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EntryStatusEnum } from '../entity/entry.status.enum'; // Импортируем ENUM статусов

export enum UpdateStatusEnum {
    WAITING = 'Ожидает',
    SERVING = 'Обслуживается',
    LATE = 'Опаздывает',
    COMPLETED = 'Завершено',
    CANCELED = 'Отменено',
}

/**
 * DTO для обновления статуса записи в очереди.
 * Используется, например, администратором очереди.
 */
export class UpdateStatusDto {
  @ApiProperty({ description: 'Новый статус записи', enum: UpdateStatusEnum, example: 'обслуживается' })
  @IsNotEmpty({ message: 'Статус не может быть пустым' })
  @IsEnum(UpdateStatusEnum, { message: 'Некорректное значение статуса' })
  status: UpdateStatusEnum; 

  // Примечание: Проверка допустимости перехода из текущего статуса в новый,
  // а также проверка прав пользователя, должны выполняться в сервисе.
}