// src/queues/queue.service.ts

import { Injectable, NotFoundException, BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Queue } from './entity/queue.entity';
import { CreateQueueDto } from './dto/create-queue.dto';
import { UpdateQueueDto } from './dto/update-queue.dto';
import { QueueTypeEnum } from './entity/queue.type.enum';
import { QueueVisibilityEnum } from './entity/queue.visibility.enum';
import { OrganizationService } from '../organizations/organization.service';
import { v4 as uuidv4 } from 'uuid';
import { Administrator } from '../administrators/administrator.entity';
import { User } from '../users/entity/user.entity';

@Injectable()
export class QueueService {
  constructor(
    @InjectRepository(Queue)
    private readonly queueRepository: Repository<Queue>,
    @InjectRepository(Administrator)
    private readonly administratorRepository: Repository<Administrator>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly organizationsService: OrganizationService,
  ) {}

  /**
   * Генерирует имя очереди на основе ее типа и предоставленных данных.
   * @param queueData Объект, содержащий данные для генерации имени очереди (CreateQueueDto или Queue).
   * @returns Сгенерированное имя очереди.
   * @throws BadRequestException если organizationId отсутствует для организационной очереди.
   * @throws NotFoundException если организация не найдена для организационной очереди.
   */
  private async generateQueueName(queueData: CreateQueueDto | Queue): Promise<string> {
    const { type, organizationId, city, address, serviceName } = queueData;
    let name: string;

    if (type === QueueTypeEnum.ORGANIZATIONAL) {
      if (!organizationId) {
        throw new BadRequestException('organizationId is required for organizational queues.');
      }
      const organization = await this.organizationsService.findOne(organizationId);
      if (!organization) {
        throw new NotFoundException(`Organization with ID ${organizationId} not found.`);
      }
      name = `${organization.name}: ${serviceName}`;
    } else { // QueueTypeEnum.SELF_ORGANIZED
      name = `${city}, ${address}: ${serviceName}`;
    }
    return name;
  }

  /**
   * Создает новую очередь.
   * @param createQueueDto DTO для создания очереди.
   * @param createdByUserId ID пользователя, создающего очередь.
   * @returns Созданная очередь.
   * @throws ConflictException если очередь с таким сгенерированным именем уже существует.
   */
  async create(createQueueDto: CreateQueueDto, createdByUserId: number): Promise<Queue> {
    // Проверяем, что поле 'name' не предоставлено в DTO, так как оно генерируется
    if ((createQueueDto as any).name !== undefined && (createQueueDto as any).name !== null) {
      throw new BadRequestException('Queue name is generated automatically and cannot be provided.');
    }

    const name = await this.generateQueueName(createQueueDto);

    const existingQueue = await this.queueRepository.findOne({
      where: { name },
    });

    if (existingQueue) {
      throw new ConflictException(`Queue with name "${name}" already exists.`);
    }

    const queue = this.queueRepository.create({
      type: createQueueDto.type,
      visibility: createQueueDto.visibility,
      organizationId: createQueueDto.organizationId,
      city: createQueueDto.city,
      address: createQueueDto.address,
      serviceName: createQueueDto.serviceName,
      name, // Сгенерированное имя
      createdByUserId,
      createdAt: new Date(),
      privateLinkToken: createQueueDto.privateLinkToken || (createQueueDto.visibility === QueueVisibilityEnum.PRIVATE ? uuidv4() : null),
      isActive: true, // Новые очереди активны по умолчанию
      openingHours: createQueueDto.openingHours, // Добавлено
      intervalMinutes: createQueueDto.intervalMinutes, // Добавлено
      concurrentVisitors: createQueueDto.concurrentVisitors, // Добавлено
    });

    return this.queueRepository.save(queue);
  }

  /**
   * Возвращает все очереди, опционально фильтруя по organizationId.
   * @param organizationId ID организации для фильтрации.
   * @returns Массив очередей.
   */
  async findAll(organizationId?: number): Promise<Queue[]> {
    const findOptions: any = {
      relations: ['organization', 'createdBy'],
    };

    if (organizationId) {
      findOptions.where = { organizationId };
    }

    return this.queueRepository.find(findOptions);
  }

  /**
   * Находит очередь по ее ID.
   * @param id ID очереди.
   * @returns Найденная очередь.
   * @throws NotFoundException если очередь не найдена.
   */
  async findOne(id: number): Promise<Queue> {
    const queue = await this.queueRepository.findOne({
      where: { queueId: id },
      relations: ['organization', 'createdBy', 'entries', 'administrators'],
    });
    if (!queue) {
      throw new NotFoundException(`Queue with ID ${id} not found.`);
    }
    return queue;
  }

  /**
   * Находит очередь по ее приватному токену ссылки.
   * @param token Приватный токен ссылки.
   * @returns Найденная очередь.
   * @throws NotFoundException если очередь не найдена или не является приватной.
   */
  async findOneByPrivateLinkToken(token: string): Promise<Queue> {
    const queue = await this.queueRepository.findOne({
      where: { privateLinkToken: token, visibility: QueueVisibilityEnum.PRIVATE },
      relations: ['organization', 'createdBy', 'entries', 'administrators'],
    });
    if (!queue) {
      throw new NotFoundException(`Queue with private link token "${token}" not found or is not private.`);
    }
    return queue;
  }

  /**
   * Проверяет, является ли пользователь администратором указанной очереди.
   * @param userId ID пользователя.
   * @param queueId ID очереди.
   * @returns Promise<boolean> true, если пользователь является администратором, иначе false.
   */
  async isUserAdminOfQueue(userId: number, queueId: number): Promise<boolean> {
    const adminRecord = await this.administratorRepository.findOne({
      where: {
        user: { userId: userId },
        queue: { queueId: queueId },
      },
    });
    return !!adminRecord;
  }

  /**
   * Обновляет существующую очередь.
   * @param id ID очереди для обновления.
   * @param updateQueueDto DTO с обновленными данными очереди.
   * @param userId ID пользователя, выполняющего обновление.
   * @returns Обновленная очередь.
   * @throws NotFoundException если очередь не найдена.
   * @throws ForbiddenException если у пользователя нет разрешения на обновление.
   * @throws BadRequestException если пытаются изменить organizationId для SELF_ORGANIZED очереди или установить null для ORGANIZATIONAL.
   * @throws ConflictException если новое сгенерированное имя очереди уже занято.
   */
  async update(id: number, updateQueueDto: UpdateQueueDto, userId: number): Promise<Queue> {
    const queue = await this.findOne(id);

    // Проверка прав доступа: только создатель очереди или администратор может ее обновить
    const isAdmin = await this.isUserAdminOfQueue(userId, id);
    if (queue.createdByUserId !== userId && !isAdmin) {
      throw new ForbiddenException('У вас нет разрешения на обновление этой очереди.');
    }

    // Проверка на изменение organizationId для SELF_ORGANIZED очереди
    if (queue.type === QueueTypeEnum.SELF_ORGANIZED && updateQueueDto.organizationId !== undefined && updateQueueDto.organizationId !== null) {
      throw new BadRequestException('Cannot change organizationId for self-organized queues.');
    }

    // Проверка на изменение organizationId для ORGANIZATIONAL очереди
    if (queue.type === QueueTypeEnum.ORGANIZATIONAL && updateQueueDto.organizationId !== undefined && updateQueueDto.organizationId !== queue.organizationId) {
      if (updateQueueDto.organizationId === null) {
        throw new BadRequestException('Cannot set organizationId to null for organizational queues.');
      }
      const newOrganization = await this.organizationsService.findOne(updateQueueDto.organizationId);
      if (!newOrganization) {
        throw new NotFoundException(`Organization with ID ${updateQueueDto.organizationId} not found.`);
      }
    }

    // ИСПРАВЛЕНИЕ: Логика обновления privateLinkToken, если visibility неизменяема
    // privateLinkToken обновляется только если он явно предоставлен в DTO.
    if (updateQueueDto.privateLinkToken !== undefined) {
      queue.privateLinkToken = updateQueueDto.privateLinkToken;
    }

    // Применяем обновленные данные, исключая name, так как оно генерируется
    // и visibility/type, так как они неизменяемы.
    const { name, ...restUpdateDto } = updateQueueDto as any;
    Object.assign(queue, restUpdateDto);

    // Перегенерируем имя, если изменились соответствующие поля
    if (updateQueueDto.city !== undefined || updateQueueDto.address !== undefined || updateQueueDto.serviceName !== undefined || updateQueueDto.organizationId !== undefined) {
      queue.name = await this.generateQueueName(queue);
    }

    // Проверяем, не конфликтует ли новое имя с существующими очередями (кроме текущей)
    const existingQueueWithName = await this.queueRepository.findOne({
      where: { name: queue.name },
    });
    if (existingQueueWithName && existingQueueWithName.queueId !== id) {
      throw new ConflictException(`Queue with name "${queue.name}" already exists.`);
    }

    return this.queueRepository.save(queue);
  }

  /**
   * Удаляет очередь.
   * @param id ID очереди для удаления.
   * @param userId ID пользователя, выполняющего удаление.
   * @throws NotFoundException если очередь не найдена.
   * @throws ForbiddenException если у пользователя нет разрешения на удаление.
   */
  async remove(id: number, userId: number): Promise<void> {
    const queue = await this.findOne(id);

    // Проверка прав доступа: только создатель очереди или администратор может ее удалить
    const isAdmin = await this.isUserAdminOfQueue(userId, id);
    if (queue.createdByUserId !== userId && !isAdmin) {
      throw new ForbiddenException('У вас нет разрешения на удаление этой очереди.');
    }

    await this.queueRepository.remove(queue);
  }
}
