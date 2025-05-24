
/**
 * DTO для обновления статуса записи в очереди.
 * Используется, например, администратором очереди.
 */
import { IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EntryStatusEnum } from '../entity/entry-status.enum'; // !!! ОЧЕНЬ ВАЖНО: Убедитесь, что этот импорт правильный и указывает на ваш EntryStatusEnum !!!

/**
 * DTO для обновления статуса записи в очереди.
 * Используется, например, администратором очереди.
 */
export class UpdateStatusDto {
  @ApiProperty({
    description: 'Новый статус записи',
    enum: EntryStatusEnum, // !!! Здесь должен быть EntryStatusEnum, а не какой-либо другой enum !!!
    example: EntryStatusEnum.SERVING, // Пример значения из EntryStatusEnum
  })
  @IsNotEmpty({ message: 'Статус не может быть пустым' })
  @IsEnum(EntryStatusEnum, { message: 'Некорректное значение статуса' }) // !!! Валидация должна быть по EntryStatusEnum !!!
  status: EntryStatusEnum; // !!! Тип этого свойства ДОЛЖЕН быть EntryStatusEnum !!!

  // Примечание: Проверка допустимости перехода из текущего статуса в новый,
  // а также проверка прав пользователя, должны выполняться в сервисе.


  @IsOptional()
  comment?: string;
}

  // Примечание: Проверка допустимости перехода из текущего статуса в новый,
  // а также проверка прав пользователя, должны выполняться в сервисе.
