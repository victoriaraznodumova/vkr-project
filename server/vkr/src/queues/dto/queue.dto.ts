import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { IsNumber, IsString, IsEnum, IsDate, IsOptional } from 'class-validator';
import { QueueTypeEnum } from '../entity/queue.type.enum'; // Импортируем ENUM типа очереди
import { QueueVisibilityEnum } from '../entity/queue.visibility.enum'; // Импортируем ENUM видимости очереди
import { OrganizationDto } from '../../organizations/dto/organization.dto'; // Предполагается, что у вас есть OrganizationDto
import { UserDto } from '../../users/dto/user.dto'; // Предполагается, что у вас есть UserDto
// Импортируем DTO для связанных сущностей, если они будут подтягиваться
// import { EntryDto } from '../../entries/dto/entry.dto';
// import { AdministratorDto } from '../../administrators/dto/administrator.dto';


/**
 * DTO для представления очереди в ответе API.
 * Использует camelCase для свойств DTO, соответствуя сущности Queue.
 */
export class QueueDto {
  @ApiProperty({ description: 'Уникальный ID очереди', example: 1 })
  @Expose() 
  @IsNumber() 
  queueId: number;

  @ApiProperty({ description: 'Название очереди', example: 'Тестовая Организация: Консультация' })
  @Expose()
  @IsString()
  name: string;

  @ApiProperty({ description: 'ID организации (NULL для самоорганизованных)', example: 1, required: false, nullable: true })
  @Expose()
  @IsOptional()
  @IsNumber()
  organizationId: number | null; 

  @ApiProperty({ description: 'Тип очереди', enum: QueueTypeEnum, example: QueueTypeEnum.ORGANIZATIONAL })
  @Expose()
  @IsEnum(QueueTypeEnum)
  type: QueueTypeEnum;

  @ApiProperty({ description: 'Видимость очереди', enum: QueueVisibilityEnum, example: QueueVisibilityEnum.PUBLIC })
  @Expose()
  @IsEnum(QueueVisibilityEnum)
  visibility: QueueVisibilityEnum;

  @ApiProperty({ description: 'Город', example: 'Москва' })
  @Expose()
  @IsString()
  city: string;

  @ApiProperty({ description: 'Адрес', example: 'ул. Пушкина, 10' })
  @Expose()
  @IsString()
  address: string;

  @ApiProperty({ description: 'Часы работы', example: 'Пн-Пт 9:00-17:00' })
  @Expose()
  @IsString()
  openingHours: string; 

  @ApiProperty({ description: 'Название услуги', example: 'Консультация' })
  @Expose()
  @IsString()
  serviceName: string; 

  @ApiProperty({ description: 'Интервал записи в минутах', example: 15 })
  @Expose()
  @IsNumber()
  intervalMinutes: number;

  @ApiProperty({ description: 'Количество одновременных обслуживаний', example: 1 })
  @Expose()
  @IsNumber()
  concurrentVisitors: number;

  @ApiProperty({ description: 'Токен приватной ссылки', required: false, nullable: true })
  @Expose()
  @IsOptional() 
  @IsString()
  privateLinkToken: string | null;

  @ApiProperty({ description: 'Дата создания очереди', example: '2023-10-27T10:00:00.000Z' })
  @Expose()
  @IsDate()
  createdAt: Date;

  @ApiProperty({ description: 'ID пользователя, создавшего очередь', example: 1 })
  @Expose()
  @IsNumber()
  createdByUserId: number;

  // --- Вложенные DTO для связанных сущностей (если подтягиваются) ---
  // @ApiProperty({ description: 'Связанная организация', type: () => OrganizationDto, required: false })
  // @Expose()
  // @Type(() => OrganizationDto)
  // organization?: OrganizationDto;

  // @ApiProperty({ description: 'Пользователь, создавший очередь', type: () => UserDto, required: false })
  // @Expose()
  // @Type(() => UserDto)
  // createdBy?: UserDto;

  // @ApiProperty({ description: 'Записи в очереди', type: () => [EntryDto], required: false })
  // @Expose()
  // @Type(() => EntryDto)
  // entries?: EntryDto[]; // Используем camelCase

  // @ApiProperty({ description: 'Администраторы очереди', type: () => [AdministratorDto], required: false })
  // @Expose()
  // @Type(() => AdministratorDto)
  // administrators?: AdministratorDto[]; // Используем camelCase


  constructor(partial: Partial<QueueDto>) {
    Object.assign(this, partial);
  }
}