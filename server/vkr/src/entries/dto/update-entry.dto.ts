import { IsOptional, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO для обновления записи в очереди (настройки уведомлений).
 * Содержит поля, которые пользователь может изменить после создания записи.
 */
export class UpdateEntryDto {
  @ApiProperty({ description: 'Уведомление за N минут до времени записи', example: 10, required: false })
  @IsOptional() // Поле опционально для обновления
  @IsNumber({}, { message: 'Количество минут для уведомления должно быть числом' })
  @Min(0, { message: 'Количество минут для уведомления не может быть отрицательным' })
  notificationMinutes?: number; 

  @ApiProperty({ description: 'Уведомление, когда N человек впереди', example: 2, required: false })
  @IsOptional() // Поле опционально для обновления
  @IsNumber({}, { message: 'Количество человек для уведомления должно быть числом' })
  @Min(1, { message: 'Количество человек для уведомления должно быть положительным числом' })
  notificationPosition?: number; 

  // Примечание: Валидация того, какие настройки уведомлений применимы к типу очереди,
  // должна выполняться в сервисе.
}