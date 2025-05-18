import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { IsNumber, IsString, IsOptional } from 'class-validator';
// Импортируем DTO для связанных очередей, если они будут подтягиваться
// import { QueueDto } from '../../queues/dto/queue.dto';

/**
 * DTO для представления организации в ответе API.
 * Использует camelCase для свойств DTO, соответствуя сущности Organization.
 */
export class OrganizationDto {
  @ApiProperty({ description: 'Уникальный ID организации', example: 1 })
  @Expose() // Включаем это поле в ответ
  @IsNumber() // Валидатор для исходящих данных (опционально, но полезно)
  organizationId: number;

  @ApiProperty({ description: 'Название организации', example: 'Тестовая Организация' })
  @Expose()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Город организации', example: 'Тестовый Город' })
  @Expose()
  @IsString()
  city: string;

  @ApiProperty({ description: 'Адрес организации', example: 'Тестовый Адрес' })
  @Expose()
  @IsString()
  address: string;

  // --- Вложенные DTO для связанных сущностей (если подтягиваются) ---
  // Если вы подтягиваете связанные очереди (relations: ['queues']) в сервисе
  // и используете ClassSerializerInterceptor, раскомментируйте это поле.
  // @ApiProperty({ description: 'Очереди организации', type: () => [QueueDto], required: false })
  // @Expose()
  // @Type(() => QueueDto) // Указываем TypeTransformer для массива QueueDto
  // queues?: QueueDto[]; // Используем camelCase, как в вашей сущности


  // Конструктор для удобства трансформации из сущности
  constructor(partial: Partial<OrganizationDto>) {
    Object.assign(this, partial);
  }
}