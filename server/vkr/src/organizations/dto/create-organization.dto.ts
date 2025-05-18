import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO для создания новой организации.
 * Содержит данные, которые клиент предоставляет при создании организации.
 * organizationId генерируется автоматически и отсутствует здесь.
 */
export class CreateOrganizationDto {
  @ApiProperty({ description: 'Название организации', example: 'Тестовая Организация' })
  @IsNotEmpty({ message: 'Название организации не может быть пустым' })
  @IsString({ message: 'Название организации должно быть строкой' })
  name: string;

  @ApiProperty({ description: 'Город организации', example: 'Тестовый Город' })
  @IsNotEmpty({ message: 'Город организации не может быть пустым' })
  @IsString({ message: 'Город организации должен быть строкой' })
  city: string;

  @ApiProperty({ description: 'Адрес организации', example: 'Тестовый Адрес' })
  @IsNotEmpty({ message: 'Адрес организации не может быть пустым' })
  @IsString({ message: 'Адрес организации должен быть строкой' })
  address: string;

  // createdByUserId может быть получен из токена авторизации на бэкенде
}