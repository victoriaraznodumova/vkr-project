// src/queues/queues.controller.ts

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
  Query,
  Req,
  UseGuards,
  ForbiddenException, // Добавляем ForbiddenException для случаев отказа в доступе
} from '@nestjs/common';
import { QueueService } from './queue.service';
import { CreateQueueDto } from './dto/create-queue.dto';
import { UpdateQueueDto } from './dto/update-queue.dto';
import { QueueDto } from './dto/queue.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express'; // Для доступа к user из запроса
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Предполагается, что у вас есть JwtAuthGuard
// Импорты, связанные с ролями, удалены, так как переходим на ABAC

/**
 * Контроллер для работы с очередями.
 * Предоставляет RESTful API для создания, чтения, обновления и удаления очередей.
 */
@ApiTags('queues') // Группировка в Swagger UI
@Controller('queues')
@UseInterceptors(ClassSerializerInterceptor) // Используем для преобразования сущностей в DTO
export class QueueController {
  constructor(private readonly queuesService: QueueService) {}

  /**
   * Создает новую очередь.
   * Требует авторизации.
   * @param createQueueDto DTO с данными для создания очереди.
   * @param req Объект запроса для получения ID пользователя.
   * @returns Promise с созданной очередью.
   */
  @Post()
  @UseGuards(JwtAuthGuard) // Защита эндпоинта
  @ApiBearerAuth() // Указывает, что эндпоинт требует токен
  @ApiOperation({ summary: 'Создать новую очередь' })
  @ApiBody({ type: CreateQueueDto, description: 'Данные для создания очереди' })
  @ApiResponse({ status: 201, description: 'Очередь успешно создана.', type: QueueDto })
  @ApiResponse({ status: 400, description: 'Неверные входные данные или отсутствует organizationId для организационной очереди.' })
  @ApiResponse({ status: 401, description: 'Неавторизованный доступ.' })
  @ApiResponse({ status: 409, description: 'Очередь с таким именем уже существует.' })
  async create(@Body() createQueueDto: CreateQueueDto, @Req() req: Request): Promise<QueueDto> {
    // Предполагается, что userId доступен в req.user после JwtAuthGuard
    const createdByUserId = (req.user as any).userId;
    const queue = await this.queuesService.create(createQueueDto, createdByUserId);
    return new QueueDto(queue);
  }

  /**
   * Получает все очереди.
   * @param organizationId (опционально) Фильтр по ID организации.
   * @returns Promise с массивом очередей.
   */
  @Get()
  @ApiOperation({ summary: 'Получить все очереди' })
  @ApiQuery({ name: 'organizationId', type: Number, required: false, description: 'Фильтр по ID организации' })
  @ApiResponse({ status: 200, description: 'Возвращает список всех очередей.', type: [QueueDto] })
  async findAll(@Query('organizationId', new ParseIntPipe({ optional: true })) organizationId?: number): Promise<QueueDto[]> {
    const queues = await this.queuesService.findAll(organizationId);
    return queues.map(queue => new QueueDto(queue));
  }

  /**
   * Получает очередь по ее ID.
   * @param id ID очереди.
   * @returns Promise с очередью.
   */
  @Get(':id')
  @ApiOperation({ summary: 'Получить очередь по ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Уникальный ID очереди' })
  @ApiResponse({ status: 200, description: 'Возвращает очередь по указанному ID.', type: QueueDto })
  @ApiResponse({ status: 404, description: 'Очередь не найдена.' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<QueueDto> {
    const queue = await this.queuesService.findOne(id);
    return new QueueDto(queue);
  }

  /**
   * Получает очередь по ее приватному токену.
   * @param token Приватный токен очереди.
   * @returns Promise с очередью.
   */
  @Get('private/:token')
  @ApiOperation({ summary: 'Получить очередь по приватному токену' })
  @ApiParam({ name: 'token', type: String, description: 'Приватный токен очереди' })
  @ApiResponse({ status: 200, description: 'Возвращает очередь по приватному токену.', type: QueueDto })
  @ApiResponse({ status: 404, description: 'Очередь не найдена или токен недействителен.' })
  async findOneByPrivateLinkToken(@Param('token') token: string): Promise<QueueDto> {
    const queue = await this.queuesService.findOneByPrivateLinkToken(token);
    return new QueueDto(queue);
  }

  /**
   * Обновляет существующую очередь.
   * Требует авторизации. Только создатель очереди может ее обновить.
   * @param id ID очереди.
   * @param updateQueueDto DTO с данными для обновления.
   * @param req Объект запроса для получения ID пользователя.
   * @returns Promise с обновленной очередью.
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard) // Защита эндпоинта только по JWT
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Обновить очередь по ID (только для создателя)' })
  @ApiParam({ name: 'id', type: Number, description: 'Уникальный ID очереди' })
  @ApiBody({ type: UpdateQueueDto, description: 'Данные для обновления очереди' })
  @ApiResponse({ status: 200, description: 'Очередь успешно обновлена.', type: QueueDto })
  @ApiResponse({ status: 400, description: 'Неверные входные данные или попытка изменить organizationId для самоорганизованной очереди.' })
  @ApiResponse({ status: 401, description: 'Неавторизованный доступ.' })
  @ApiResponse({ status: 403, description: 'Недостаточно прав (пользователь не является создателем очереди).' })
  @ApiResponse({ status: 404, description: 'Очередь не найдена.' })
  @ApiResponse({ status: 409, description: 'Очередь с таким именем уже существует.' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateQueueDto: UpdateQueueDto,
    @Req() req: Request, // Добавляем req для получения userId
  ): Promise<QueueDto> {
    const userId = (req.user as any).userId; // Получаем ID текущего пользователя
    // Логика проверки владения ресурсом перемещается в сервис
    const queue = await this.queuesService.update(id, updateQueueDto, userId);
    return new QueueDto(queue);
  }

  /**
   * Удаляет очередь по ее ID.
   * Требует авторизации. Только создатель очереди может ее удалить.
   * @param id ID очереди.
   * @param req Объект запроса для получения ID пользователя.
   * @returns Promise, который завершается после удаления.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // Возвращаем 204 No Content при успешном удалении
  @UseGuards(JwtAuthGuard) // Защита эндпоинта только по JWT
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Удалить очередь по ID (только для создателя)' })
  @ApiParam({ name: 'id', type: Number, description: 'Уникальный ID очереди' })
  @ApiResponse({ status: 204, description: 'Очередь успешно удалена.' })
  @ApiResponse({ status: 401, description: 'Неавторизованный доступ.' })
  @ApiResponse({ status: 403, description: 'Недостаточно прав (пользователь не является создателем очереди).' })
  @ApiResponse({ status: 404, description: 'Очередь не найдена.' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request, // Добавляем req для получения userId
  ): Promise<void> {
    const userId = (req.user as any).userId; // Получаем ID текущего пользователя
    // Логика проверки владения ресурсом перемещается в сервис
    await this.queuesService.remove(id, userId);
  }
}
