// src/journal/dto/journal.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { IsNumber, IsString, IsEnum, IsDate, IsOptional } from 'class-validator';
import { JournalStatusEnum } from '../entity/journal-status.enum'; // Импортируем ENUM статусов
import { JournalActionEnum } from '../entity/journal-action.enum'; // Импортируем ENUM действий
import { UserDto } from '../../users/dto/user.dto'; // Предполагается, что у вас есть UserDto
// import { EntryDto } from '../../entries/dto/entry.dto'; // Если нужно включать данные записи

/**
 * DTO для представления записи в журнале (истории) записи в очереди в ответе API.
 * Использует camelCase для свойств DTO, соответствуя сущности Journal.
 */
export class JournalDto {
  @ApiProperty({ description: 'Уникальный ID записи в журнале', example: 1 })
  @Expose() // Включаем это поле в ответ
  @IsNumber() // Валидатор для исходящих данных (опционально)
  logId: number; // Используем camelCase, как в вашей сущности

  @ApiProperty({ description: 'ID записи в очереди, к которой относится событие', example: 10 })
  @Expose()
  @IsNumber()
  entryId: number;

  @ApiProperty({ description: 'Тип события (действие)', enum: JournalActionEnum, example: JournalActionEnum.ADMIN_ADDED })
  @Expose()
  @IsEnum(JournalActionEnum)
  action: JournalActionEnum;

  @ApiProperty({ description: 'Предыдущий статус записи (если применимо)', enum: JournalStatusEnum, example: JournalStatusEnum.WAITING, required: false, nullable: true })
  @Expose()
  @IsOptional() // Поле опционально, т.к. nullable в сущности
  @IsEnum(JournalStatusEnum)
  prevStatus: JournalStatusEnum | null;

  @ApiProperty({ description: 'Новый статус записи (если применимо)', enum: JournalStatusEnum, example: JournalStatusEnum.SERVING, required: false, nullable: true })
  @Expose()
  @IsOptional() // Поле опционально, т.к. nullable в сущности
  @IsEnum(JournalStatusEnum)
  newStatus: JournalStatusEnum | null;

  @ApiProperty({ description: 'Время, когда произошло событие', example: '2023-10-27T10:05:00.000Z' })
  @Expose()
  @IsDate() // Ожидаем объект Date после трансформации
  logTime: Date;

  @ApiProperty({ description: 'ID пользователя, инициировавшего событие', example: 1 })
  @Expose()
  @IsNumber()
  initiatedByUserId: number;

  @ApiProperty({ description: 'Комментарий к событию (если применимо)', example: 'Изменен администратором', required: false, nullable: true })
  @Expose()
  @IsOptional() // Поле опционально, т.к. nullable в сущности
  @IsString()
  comment: string | null;

  // --- Вложенные DTO для связанных сущностей (если подтягиваются) ---
  // Эти свойства будут заполнены, если вы подтягиваете связи в сервисе (relations: ['user', 'entry'])
  // и используете ClassSerializerInterceptor

  @ApiProperty({ description: 'Пользователь, инициировавший событие', type: () => UserDto, required: false })
  @Expose()
  @Type(() => UserDto) // Указываем TypeTransformer, чтобы он преобразовал вложенный объект в UserDto
  user?: UserDto; // Используем camelCase, как в вашей сущности. Опционально, если связь не всегда подтягивается

  // @ApiProperty({ description: 'Связанная запись в очереди', type: () => EntryDto, required: false })
  // @Expose()
  // @Type(() => EntryDto)
  // entry?: EntryDto; // Используем camelCase, как в вашей сущности. Опционально.


  // Конструктор для удобства трансформации из сущности
  constructor(partial: Partial<JournalDto>) {
    Object.assign(this, partial);
  }
}