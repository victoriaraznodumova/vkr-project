import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  Min,
  IsEnum,
  ValidateIf,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { QueueTypeEnum } from '../entity/queue-type.enum'; // Импортируем ENUM типа очереди
import { QueueVisibilityEnum } from '../entity/queue-visibility.enum'; // Импортируем ENUM видимости очереди

/**
 * DTO для создания новой очереди.
 * Содержит данные, которые клиент предоставляет при создании очереди.
 * queueId, createdAt, createdByUserId генерируются на бэкенде и отсутствуют здесь.
 */
export class CreateQueueDto {
  // Название очереди (name) генерируется на бэкенде на основе type и других полей.
  // Не нужно во входящем DTO, если только вы не разрешаете пользователю задавать его вручную.

  @ApiProperty({ description: 'ID организации (для организационных очередей)', example: 1, required: false, nullable: true })
  @IsOptional() // organizationId может быть null для самоорганизаций
  @IsNumber({}, { message: 'ID организации должен быть числом' })
  @Min(1, { message: 'ID организации должен быть положительным числом' })
  // ValidateIf(o => o.type === QueueTypeEnum.ORGANIZATIONAL) // Условная валидация, если тип известен на фронтенде
  organizationId?: number | null;

  @ApiProperty({ description: 'Тип очереди', enum: QueueTypeEnum, example: QueueTypeEnum.ORGANIZATIONAL })
  @IsNotEmpty({ message: 'Тип очереди не может быть пустым' })
  @IsEnum(QueueTypeEnum, { message: 'Некорректный тип очереди' })
  type: QueueTypeEnum;

  @ApiProperty({ description: 'Видимость очереди', enum: QueueVisibilityEnum, example: QueueVisibilityEnum.PUBLIC })
  @IsNotEmpty({ message: 'Видимость очереди не может быть пустой' })
  @IsEnum(QueueVisibilityEnum, { message: 'Некорректная видимость очереди' })
  visibility: QueueVisibilityEnum;

  @ApiProperty({ description: 'Город, где находится очередь', example: 'Москва' })
  @IsNotEmpty({ message: 'Город не может быть пустым' })
  @IsString({ message: 'Город должен быть строкой' })
  city: string;

  @ApiProperty({ description: 'Адрес очереди', example: 'ул. Пушкина, 10' })
  @IsNotEmpty({ message: 'Адрес не может быть пустым' })
  @IsString({ message: 'Адрес должен быть строкой' })
  address: string;

  @ApiProperty({ description: 'Часы работы (для организационных очередей)', example: 'Пн-Пт 9:00-17:00' })
  @IsNotEmpty({ message: 'Часы работы не могут быть пустыми' })
  @IsString({ message: 'Часы работы должны быть строкой' })
  // ValidateIf(o => o.type === QueueTypeEnum.ORGANIZATIONAL) // Условная валидация, если применимо только к орг.
  openingHours: string;

  @ApiProperty({ description: 'Название услуги (для организационных очередей)', example: 'Консультация' })
  @IsNotEmpty({ message: 'Название услуги не может быть пустым' })
  @IsString({ message: 'Название услуги должно быть строкой' })
  // ValidateIf(o => o.type === QueueTypeEnum.ORGANIZATIONAL) // Условная валидация, если применимо только к орг.
  serviceName: string;

  @ApiProperty({ description: 'Интервал записи в минутах (для организационных очередей)', example: 15 })
  @IsNotEmpty({ message: 'Интервал записи не может быть пустым' })
  @IsNumber({}, { message: 'Интервал записи должен быть числом' })
  @Min(1, { message: 'Интервал записи должен быть положительным числом' })
  // ValidateIf(o => o.type === QueueTypeEnum.ORGANIZATIONAL) // Условная валидация, если применимо только к орг.
  intervalMinutes: number;

  @ApiProperty({ description: 'Количество посетителей, обслуживаемых одновременно', example: 1 })
  @IsNotEmpty({ message: 'Количество одновременных обслуживаний не может быть пустым' })
  @IsNumber({}, { message: 'Количество одновременных обслуживаний должно быть числом' })
  @Min(1, { message: 'Количество одновременных обслуживаний должно быть не менее 1' })
  concurrentVisitors: number;

  @ApiProperty({ description: 'Токен приватной ссылки (может быть NULL)', required: false, nullable: true })
  @IsOptional() // privateLinkToken nullable 
  @IsString({ message: 'Токен приватной ссылки должен быть строкой' })
  privateLinkToken?: string | null;

  // createdByUserId - берется из токена авторизации на бэкенде
}