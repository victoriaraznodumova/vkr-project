// src/organizations/organizations.controller.ts

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseInterceptors,
  ClassSerializerInterceptor,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { OrganizationDto } from './dto/organization.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';

/**
 * Контроллер для работы с организациями.
 * Предоставляет RESTful API для создания, чтения, обновления и удаления организаций.
 */
@ApiTags('organizations') // Группировка в Swagger UI
@Controller('organizations')
@UseInterceptors(ClassSerializerInterceptor) // Используем для преобразования сущностей в DTO
export class OrganizationController {
  constructor(private readonly organizationsService: OrganizationService) {}

  /**
   * Создает новую организацию.
   * @param createOrganizationDto DTO с данными для создания организации.
   * @returns Promise с созданной организацией.
   */
  @Post()
  @ApiOperation({ summary: 'Создать новую организацию' })
  @ApiBody({ type: CreateOrganizationDto, description: 'Данные для создания организации' })
  @ApiResponse({ status: 201, description: 'Организация успешно создана.', type: OrganizationDto })
  @ApiResponse({ status: 400, description: 'Неверные входные данные.' })
  @ApiResponse({ status: 409, description: 'Организация с таким именем уже существует.' })
  async create(@Body() createOrganizationDto: CreateOrganizationDto): Promise<OrganizationDto> {
    const organization = await this.organizationsService.create(createOrganizationDto);
    return new OrganizationDto(organization);
  }

  /**
   * Получает все организации.
   * @returns Promise с массивом организаций.
   */
  @Get()
  @ApiOperation({ summary: 'Получить все организации' })
  @ApiResponse({ status: 200, description: 'Возвращает список всех организаций.', type: [OrganizationDto] })
  async findAll(): Promise<OrganizationDto[]> {
    const organizations = await this.organizationsService.findAll();
    return organizations.map(org => new OrganizationDto(org));
  }

  /**
   * Получает организацию по ее ID.
   * @param id ID организации.
   * @returns Promise с организацией.
   */
  @Get(':id')
  @ApiOperation({ summary: 'Получить организацию по ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Уникальный ID организации' })
  @ApiResponse({ status: 200, description: 'Возвращает организацию по указанному ID.', type: OrganizationDto })
  @ApiResponse({ status: 404, description: 'Организация не найдена.' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<OrganizationDto> {
    const organization = await this.organizationsService.findOne(id);
    return new OrganizationDto(organization);
  }

  /**
   * Обновляет существующую организацию.
   * @param id ID организации.
   * @param updateOrganizationDto DTO с данными для обновления.
   * @returns Promise с обновленной организацией.
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Обновить организацию по ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Уникальный ID организации' })
  @ApiBody({ type: UpdateOrganizationDto, description: 'Данные для обновления организации' })
  @ApiResponse({ status: 200, description: 'Организация успешно обновлена.', type: OrganizationDto })
  @ApiResponse({ status: 404, description: 'Организация не найдена.' })
  @ApiResponse({ status: 409, description: 'Организация с таким именем уже существует.' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateOrganizationDto: UpdateOrganizationDto): Promise<OrganizationDto> {
    const organization = await this.organizationsService.update(id, updateOrganizationDto);
    return new OrganizationDto(organization);
  }

  /**
   * Удаляет организацию по ее ID.
   * @param id ID организации.
   * @returns Promise, который завершается после удаления.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // Возвращаем 204 No Content при успешном удалении
  @ApiOperation({ summary: 'Удалить организацию по ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Уникальный ID организации' })
  @ApiResponse({ status: 204, description: 'Организация успешно удалена.' })
  @ApiResponse({ status: 404, description: 'Организация не найдена.' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.organizationsService.remove(id);
  }
}
