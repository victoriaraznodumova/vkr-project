// src/entries/entries.controller.ts

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { EntryService } from './entry.service';
import { CreateEntryDto } from './dto/create-entry.dto';
import { UpdateEntryDto } from './dto/update-entry.dto';
import { ShowEntryDto } from './dto/show-entry.dto'; // Импортируем ShowEntryDto
import { UpdateStatusDto } from './dto/update-status.dto'; // Импортируем UpdateStatusDto
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Предполагается, что у вас есть JwtAuthGuard
import { User } from '../users/entity/user.entity'; // Импортируем сущность User
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'; // Импорты для Swagger

@ApiTags('entries') // Группируем эндпоинты в Swagger
@ApiBearerAuth() // Указываем, что эти эндпоинты требуют JWT токен
@Controller('entries')
@UseInterceptors(ClassSerializerInterceptor) // Применяем интерцептор для преобразования сущностей в DTO
export class EntryController {
  constructor(private readonly entriesService: EntryService) {}

  /**
   * Создает новую запись в очереди.
   * Доступно только аутентифицированным пользователям.
   * @param createEntryDto DTO с данными для создания записи.
   * @param req Объект запроса с аутентифицированным пользователем.
   * @returns Созданная запись в очереди.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Создать новую запись в очереди' })
  @ApiResponse({ status: 201, description: 'Запись успешно создана.', type: ShowEntryDto })
  @ApiResponse({ status: 400, description: 'Некорректные данные запроса.' })
  @ApiResponse({ status: 401, description: 'Неавторизованный доступ.' })
  @ApiResponse({ status: 404, description: 'Очередь или пользователь не найдены.' })
  async create(@Body() createEntryDto: CreateEntryDto, @Request() req: { user: User }): Promise<ShowEntryDto> {
    const entry = await this.entriesService.create(createEntryDto, req.user.userId);
    return entry as unknown as ShowEntryDto; // Преобразуем сущность в DTO
  }

  /**
   * Возвращает все записи в очередях.
   * Доступно только аутентифицированным пользователям (возможно, только администраторам).
   * @returns Список всех записей.
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Получить все записи в очередях' })
  @ApiResponse({ status: 200, description: 'Список записей.', type: [ShowEntryDto] })
  @ApiResponse({ status: 401, description: 'Неавторизованный доступ.' })
  async findAll(): Promise<ShowEntryDto[]> {
    const entries = await this.entriesService.findAll();
    return entries.map(entry => entry as unknown as ShowEntryDto); // Преобразуем каждую сущность в DTO
  }

  /**
   * Возвращает запись по ее ID.
   * Доступно только аутентифицированным пользователям (возможно, только владельцу или администратору).
   * @param entryId ID записи.
   * @returns Запись в очереди.
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Получить запись в очереди по ID' })
  @ApiResponse({ status: 200, description: 'Запись найдена.', type: ShowEntryDto })
  @ApiResponse({ status: 401, description: 'Неавторизованный доступ.' })
  @ApiResponse({ status: 404, description: 'Запись не найдена.' })
  async findOne(@Param('id') entryId: string): Promise<ShowEntryDto> {
    const entry = await this.entriesService.findOne(+entryId); // Преобразуем ID в число
    return entry as unknown as ShowEntryDto;
  }

  /**
   * Обновляет запись в очереди (например, настройки уведомлений).
   * Доступно только аутентифицированным пользователям (владельцу или администратору).
   * @param entryId ID записи.
   * @param updateEntryDto DTO с данными для обновления.
   * @param req Объект запроса с аутентифицированным пользователем.
   * @returns Обновленная запись.
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Обновить запись в очереди' })
  @ApiResponse({ status: 200, description: 'Запись успешно обновлена.', type: ShowEntryDto })
  @ApiResponse({ status: 400, description: 'Некорректные данные запроса.' })
  @ApiResponse({ status: 401, description: 'Неавторизованный доступ.' })
  @ApiResponse({ status: 404, description: 'Запись не найдена.' })
  async update(
    @Param('id') entryId: string,
    @Body() updateEntryDto: UpdateEntryDto,
    @Request() req: { user: User },
  ): Promise<ShowEntryDto> {
    const entry = await this.entriesService.update(+entryId, updateEntryDto, req.user.userId);
    return entry as unknown as ShowEntryDto;
  }

  /**
   * Обновляет статус записи в очереди.
   * Доступно только аутентифицированным пользователям (администраторам).
   * @param entryId ID записи.
   * @param updateStatusDto DTO с новым статусом.
   * @param req Объект запроса с аутентифицированным пользователем.
   * @returns Обновленная запись.
   */
  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard) // TODO: Возможно, нужен отдельный Guard для администраторов
  @ApiOperation({ summary: 'Обновить статус записи в очереди' })
  @ApiResponse({ status: 200, description: 'Статус записи успешно обновлен.', type: ShowEntryDto })
  @ApiResponse({ status: 400, description: 'Некорректные данные запроса.' })
  @ApiResponse({ status: 401, description: 'Неавторизованный доступ.' })
  @ApiResponse({ status: 404, description: 'Запись не найдена.' })
  async updateStatus(
    @Param('id') entryId: string,
    @Body() updateStatusDto: UpdateStatusDto,
    @Request() req: { user: User },
  ): Promise<ShowEntryDto> {
    const entry = await this.entriesService.updateStatus(+entryId, updateStatusDto, req.user.userId);
    return entry as unknown as ShowEntryDto;
  }

  /**
   * Удаляет запись из очереди.
   * Доступно только аутентифицированным пользователям (владельцу или администратору).
   * @param entryId ID записи.
   * @param req Объект запроса с аутентифицированным пользователем.
   * @returns Пустой ответ 204 No Content.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // Статус 204 No Content для успешного удаления
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Удалить запись из очереди' })
  @ApiResponse({ status: 204, description: 'Запись успешно удалена.' })
  @ApiResponse({ status: 401, description: 'Неавторизованный доступ.' })
  @ApiResponse({ status: 404, description: 'Запись не найдена.' })
  async remove(@Param('id') entryId: string, @Request() req: { user: User }): Promise<void> {
    await this.entriesService.remove(+entryId, req.user.userId);
  }
}
