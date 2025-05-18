import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO для обновления существующей организации.
 * Содержит поля, которые могут быть изменены.
 */
export class UpdateOrganizationDto {
  @ApiProperty({ description: 'Название организации', example: 'Обновленное Название', required: false })
  @IsOptional() // Все поля опциональны для обновления
  @IsString({ message: 'Название организации должно быть строкой' })
  name?: string;

  @ApiProperty({ description: 'Город организации', example: 'Новый Город', required: false })
  @IsOptional()
  @IsString({ message: 'Город должен быть строкой' })
  city?: string;

  @ApiProperty({ description: 'Адрес организации', example: 'Новый Адрес', required: false })
  @IsOptional()
  @IsString({ message: 'Адрес должен быть строкой' })
  address?: string;
}