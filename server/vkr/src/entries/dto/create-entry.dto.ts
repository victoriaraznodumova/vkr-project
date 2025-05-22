import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsDateString,
  Min,
  ValidateIf
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { QueueTypeEnum } from 'src/queues/entity/queue.type.enum';

/**DTO для создания новой записи в очереди.
 * Содержит данные, которые клиент предоставляет при записи.
 * Автогенерируемые поля (ID, даты создания) здесь отсутствуют. */
export class CreateEntryDto {
  @ApiProperty({ description: 'ID очереди', example: 1 })
  @IsNotEmpty({ message: 'ID очереди не может быть пустым' })
  @IsNumber({}, { message: 'ID очереди должен быть числом' })
  @Min(1, { message: 'ID очереди должен быть положительным числом' })
  queueId: number; 

  // userId будет получен из токена авторизации на бэкенде, не нужно во входящем DTO

  @ApiProperty({ description: 'Дата записи (для организационных очередей)', example: '2023-10-27', required: false })
  @IsOptional()
  @IsDateString({}, { message: 'Некорректный формат даты' })
  date?: string; 

  @ApiProperty({ description: 'Время записи (для организационных очередей)', example: '10:30', required: false })
  @IsOptional()
  @IsString({ message: 'Время должно быть строкой' })
  time?: string; 

  @ApiProperty({ description: 'Уведомление за N минут до времени записи (для орг. очередей)', example: 15, required: false })
  @IsOptional()
  @IsNumber({}, { message: 'Количество минут для уведомления должно быть числом' })
  @Min(0, { message: 'Количество минут для уведомления не может быть отрицательным' })
  // @ValidateIf(o => o.queueType === QueueType.ORGANIZATIONAL) // Пример условной валидации
  notificationMinutes?: number;

  @ApiProperty({ description: 'Уведомление, когда N человек впереди (для самоорг. очередей)', example: 3, required: false })
  @IsOptional()
  @IsNumber({}, { message: 'Количество человек для уведомления должно быть числом' })
  @Min(1, { message: 'Количество человек для уведомления должно быть положительным числом' })
  // @ValidateIf(o => o.queueType === QueueType.SELF_ORGANIZED) // Пример условной валидации
  notificationPosition?: number;


  @IsOptional()
  comment?: string

  // Примечание: Условная валидация в DTO может потребовать передачи типа очереди с фронтенда.
  // Альтернативно, проверка обязательности date/time/notificationMinutes/notificationPosition
  // выполняется в сервисе после получения типа очереди по queueId.
}