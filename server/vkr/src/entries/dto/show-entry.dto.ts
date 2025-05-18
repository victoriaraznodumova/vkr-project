import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { IsNumber, IsString, IsEnum, IsDate, IsOptional } from 'class-validator';
import { EntryStatusEnum } from '../entity/entry.status.enum'; // Импортируем ENUM статусов
import { UserDto } from '../../users/dto/user.dto'; // Предполагается, что у вас есть UserDto
import { QueueDto } from '../../queues/dto/queue.dto'; // Предполагается, что у вас есть QueueDto
import { JournalDto } from '../../journal/dto/journal.dto'; // Предполагается, что у вас есть JournalDto


/**
 * DTO для представления записи в очереди (Entry) в ответе API.
 * Использует camelCase для свойств DTO, соответствуя сущности Entry.
 * Включает сгенерированный ID и автоматически заполняемые поля.
 */
export class ShowEntryDto {
  @ApiProperty({ description: 'Уникальный ID записи в очереди', example: 1 })
  @Expose() // Включаем это поле в ответ
  @IsNumber() // Валидатор для исходящих данных (опционально, но полезно)
  entryId: number; 

  @ApiProperty({ description: 'ID очереди', example: 10 })
  @Expose()
  @IsNumber()
  queueId: number;

  @ApiProperty({ description: 'ID пользователя', example: 1 })
  @Expose()
  @IsNumber()
  userId: number;

  @ApiProperty({ description: 'Текущий статус записи', enum: EntryStatusEnum, example: EntryStatusEnum.WAITING })
  @Expose()
  @IsEnum(EntryStatusEnum)
  status: EntryStatusEnum;

  @ApiProperty({ description: 'Время, когда пользователь встал в очередь', example: '2023-10-27T10:00:00.000Z' })
  @Expose()
  @IsDate()
  createdAt: Date; 

  @ApiProperty({ description: 'Запланированное время записи для орг. очереди (может быть NULL)', example: '2023-10-27T10:30:00.000Z', required: false, nullable: true })
  @Expose()
  @IsOptional()
  @IsDate()
  entryTimeOrg: Date | null;

  @ApiProperty({ description: 'Позиция в очереди для самоорг. (FIFO) (может быть NULL)', example: 5, required: false, nullable: true })
  @Expose()
  @IsOptional()
  @IsNumber()
  entryPositionSelf: number | null;

  @ApiProperty({ description: 'Уникальный порядковый номер в самоорг. очереди (начиная с 1) (может быть NULL)', example: 15, required: false, nullable: true })
  @Expose()
  @IsOptional()
  @IsNumber()
  sequentialNumberSelf: number | null;

  @ApiProperty({ description: 'Время последнего обновления статуса', example: '2023-10-27T10:15:00.000Z' })
  @Expose()
  @IsDate()
  statusUpdatedAt: Date;

  @ApiProperty({ description: 'Уведомление за N минут до времени записи (для организации) (может быть NULL)', example: 15, required: false, nullable: true })
  @Expose()
  @IsOptional()
  @IsNumber()
  notificationMinutes: number | null; 

  @ApiProperty({ description: 'Уведомление, когда N человек впереди (для самоорганизации) (может быть NULL)', example: 3, required: false, nullable: true })
  @Expose()
  @IsOptional()
  @IsNumber()
  notificationPosition: number | null;

  @ApiProperty({ description: 'Фактическое время начала обслуживания (может быть NULL)', example: '2023-10-27Т10:35:00.000Z', required: false, nullable: true })
  @Expose()
  @IsOptional()
  @IsDate()
  actualStartTime: Date | null; 

  @ApiProperty({ description: 'Фактическое время завершения обслуживания (может быть NULL)', example: '2023-10-27Т10:50:00.000Z', required: false, nullable: true })
  @Expose()
  @IsOptional()
  @IsDate()
  actualEndTime: Date | null; 

  // --- Вложенные DTO для связанных сущностей ---
  // Эти свойства будут заполнены, если вы подтягиваете связи в сервисе (relations: ['user', 'queue', 'logs'])
  // и используете ClassSerializerInterceptor

  @ApiProperty({ description: 'Связанный пользователь', type: () => UserDto, required: false })
  @Expose()
  @Type(() => UserDto) // Указываем TypeTransformer, чтобы он преобразовал вложенный объект в UserDto
  user?: UserDto; // Опционально, если связь не всегда подтягивается

  @ApiProperty({ description: 'Связанная очередь', type: () => QueueDto, required: false })
  @Expose()
  @Type(() => QueueDto) // Указываем TypeTransformer для QueueDto
  queue?: QueueDto; // Опционально

  @ApiProperty({ description: 'История событий записи', type: () => [JournalDto], required: false })
  @Expose()
  @Type(() => JournalDto) // Указываем TypeTransformer для массива JournalDto
  logs?: JournalDto[]; // Используем camelCase, как в вашей сущности, Опционально

  // Конструктор для удобства трансформации из сущности
  constructor(partial: Partial<ShowEntryDto>) {
    Object.assign(this, partial);
  }
}
