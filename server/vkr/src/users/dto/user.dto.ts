import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { IsNumber, IsString, IsDate, IsOptional, IsEmail } from 'class-validator';
// Импортируем DTO для связанных сущностей, если они будут подтягиваться
// import { EntryDto } from '../../entries/dto/entry.dto';
// import { AdministratorDto } from '../../administrators/dto/administrator.dto';
// import { QueueDto } from '../../queues/dto/queue.dto';
// import { JournalDto } from '../../journal/dto/journal.dto';


/**
 * DTO для представления данных пользователя в ответе API.
 * Исключает чувствительные поля, такие как хеш пароля.
 * Использует camelCase для свойств DTO, соответствуя сущности User.
 */
export class UserDto {
  @ApiProperty({ description: 'Уникальный ID пользователя', example: 1 })
  @Expose()
  @IsNumber()
  userId: number;

  @ApiProperty({ description: 'Адрес электронной почты пользователя', example: 'user@example.com' })
  @Expose()
  @IsEmail()
  email: string;

  @Exclude() // Исключаем это поле из ответа API
  passwordHash: string;

  @ApiProperty({ description: 'Дата регистрации пользователя', example: '2023-10-27T10:00:00.000Z' })
  @Expose()
  @IsDate() // Ожидаем объект Date после трансформации
  registrationDate: Date;

  // --- Вложенные DTO для связанных сущностей (если они подтягиваются и должны быть в ответе) ---
  // Эти свойства будут заполнены, если вы подтягиваете связи в сервисе (relations: ['entries', 'administrators', 'queues', 'initiatedEvents'])
  // и используете ClassSerializerInterceptor.
  // Раскомментируйте соответствующие поля и убедитесь, что у вас есть DTO для этих сущностей.

  // @ApiProperty({ description: 'Записи пользователя в очередях', type: () => [EntryDto], required: false })
  // @Expose()
  // @Type(() => EntryDto) // Указываем TypeTransformer для массива EntryDto
  // entries?: EntryDto[]; // Используем camelCase, как в вашей сущности User

  // @ApiProperty({ description: 'Назначения администратором очередей', type: () => [AdministratorDto], required: false })
  // @Expose()
  // @Type(() => AdministratorDto) // Указываем TypeTransformer для массива AdministratorDto
  // administrators?: AdministratorDto[]; // Используем camelCase, как в вашей сущности User

  // @ApiProperty({ description: 'Очереди, созданные пользователем', type: () => [QueueDto], required: false })
  // @Expose()
  // @Type(() => QueueDto) // Указываем TypeTransformer для массива QueueDto
  // queues?: QueueDto[]; // Используем camelCase, как в вашей сущности User

  // @ApiProperty({ description: 'События истории записей, инициированные пользователем', type: () => [JournalDto], required: false })
  // @Expose()
  // @Type(() => JournalDto) // Указываем TypeTransformer для массива JournalDto
  // initiatedEvents?: JournalDto[]; // Используем camelCase, как в вашей сущности User


  // Конструктор для удобства трансформации из сущности
  constructor(partial: Partial<UserDto>) {
    Object.assign(this, partial);
  }
}