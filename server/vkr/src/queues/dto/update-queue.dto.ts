import {
  IsOptional,
  IsString,
  IsNumber,
  Min,
  IsEnum,
  ValidateIf,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { QueueTypeEnum } from '../entity/queue.type.enum'; // Импортируем ENUM типа очереди
import { QueueVisibilityEnum } from '../entity/queue.visibility.enum'; // Импортируем ENUM видимости очереди

/**
 * DTO для обновления существующей очереди.
 * Содержит поля, которые могут быть изменены.
 * Поля 'type' и 'visibility' неизменяемы и отсутствуют здесь.
 */
export class UpdateQueueDto {
  @ApiProperty({ description: 'Название очереди (если разрешено редактировать)', required: false })
  @IsOptional() // Все поля опциональны для обновления
  @IsString({ message: 'Название очереди должно быть строкой' })
  name?: string;

  @ApiProperty({ description: 'ID организации (для организационных очередей)', example: 1, required: false, nullable: true })
  @IsOptional() 
  @IsNumber({}, { message: 'ID организации должен быть числом' })
  @Min(1, { message: 'ID организации должен быть положительным числом' })
  organizationId?: number | null; 

  @ApiProperty({ description: 'Город очереди', example: 'Новый Город', required: false })
  @IsOptional()
  @IsString({ message: 'Город должен быть строкой' })
  city?: string;

  @ApiProperty({ description: 'Адрес очереди', example: 'Новый Адрес', required: false })
  @IsOptional()
  @IsString({ message: 'Адрес должен быть строкой' })
  address?: string;

  @ApiProperty({ description: 'Часы работы', example: 'Пн-Пт 10:00-18:00', required: false })
  @IsOptional()
  @IsString({ message: 'Часы работы должны быть строкой' })
  openingHours?: string;

  @ApiProperty({ description: 'Название услуги', required: false })
  @IsOptional()
  @IsString({ message: 'Название услуги должно быть строкой' })
  serviceName?: string;

  @ApiProperty({ description: 'Интервал записи в минутах', example: 20, required: false })
  @IsOptional()
  @IsNumber({}, { message: 'Интервал записи должен быть числом' })
  @Min(1, { message: 'Интервал записи должен быть положительным числом' })
  intervalMinutes?: number;

  @ApiProperty({ description: 'Количество посетителей, обслуживаемых одновременно', example: 2, required: false })
  @IsOptional()
  @IsNumber({}, { message: 'Количество одновременных обслуживаний должно быть числом' })
  @Min(1, { message: 'Количество одновременных обслуживаний должно быть не менее 1' })
  concurrentVisitors?: number; 

  @ApiProperty({ description: 'Токен приватной ссылки', required: false, nullable: true })
  @IsOptional()
  @IsString({ message: 'Токен приватной ссылки должен быть строкой' })
  privateLinkToken?: string | null;

  // createdByUserId - неизменяемо
  // createdAt - неизменяемо
}