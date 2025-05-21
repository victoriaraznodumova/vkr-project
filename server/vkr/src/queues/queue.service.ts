// src/queues/queues.service.ts

import { Injectable, NotFoundException, BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Queue } from './entity/queue.entity';
import { CreateQueueDto } from './dto/create-queue.dto';
import { UpdateQueueDto } from './dto/update-queue.dto';
import { QueueTypeEnum } from './entity/queue.type.enum';
import { QueueVisibilityEnum } from './entity/queue.visibility.enum';
import { OrganizationService } from '../organizations/organization.service'; // Для получения имени организации
import { v4 as uuidv4 } from 'uuid'; // Для генерации UUID для приватных ссылок

/**
 * Сервис для управления очередями.
 * Предоставляет методы для создания, чтения, обновления и удаления очередей.
 */
@Injectable()
export class QueueService {
  constructor(
    @InjectRepository(Queue)
    private readonly queueRepository: Repository<Queue>,
    private readonly organizationsService: OrganizationService, // Инжектируем OrganizationsService
  ) {}

  /**
   * Генерирует имя очереди на основе ее типа и предоставленных данных.
   * @param createQueueDto DTO для создания очереди.
   * @returns Сгенерированное имя очереди.
   */
  private async generateQueueName(createQueueDto: CreateQueueDto | Queue): Promise<string> {
    const { type, organizationId, city, address, serviceName } = createQueueDto;
    let name: string;

    if (type === QueueTypeEnum.ORGANIZATIONAL) {
      if (!organizationId) {
        throw new BadRequestException('organizationId is required for organizational queues.');
      }
      const organization = await this.organizationsService.findOne(organizationId);
      name = `${organization.name}: ${serviceName}`;
    } else { // QueueTypeEnum.SELF_ORGANIZED
      name = `${city}, ${address}: ${serviceName}`;
    }
    return name;
  }

  /**
   * Создает новую очередь.
   * @param createQueueDto DTO с данными для создания очереди.
   * @param createdByUserId ID пользователя, создающего очередь.
   * @returns Promise с созданной сущностью Queue.
   */
  async create(createQueueDto: CreateQueueDto, createdByUserId: number): Promise<Queue> {
    const name = await this.generateQueueName(createQueueDto);

    // Проверяем, существует ли уже очередь с таким именем
    const existingQueue = await this.queueRepository.findOne({
      where: { name },
    });

    if (existingQueue) {
      throw new ConflictException(`Queue with name "${name}" already exists.`);
    }

    const queue = this.queueRepository.create({
      ...createQueueDto,
      name,
      createdByUserId,
      createdAt: new Date(), // Устанавливаем дату создания
      privateLinkToken: createQueueDto.privateLinkToken || (createQueueDto.visibility === QueueVisibilityEnum.PRIVATE ? uuidv4() : null), // Генерируем токен, если приватная и не предоставлен
    });

    return this.queueRepository.save(queue);
  }

  /**
   * Находит все очереди.
   * @param organizationId (опционально) Фильтр по ID организации.
   * @returns Promise с массивом сущностей Queue.
   */
  async findAll(organizationId?: number): Promise<Queue[]> {
    const findOptions: any = {
      relations: ['organization', 'createdBy'], // Загружаем связанные сущности
    };

    if (organizationId) {
      findOptions.where = { organizationId };
    }

    return this.queueRepository.find(findOptions);
  }

  /**
   * Находит очередь по ее ID.
   * @param id ID очереди.
   * @returns Promise с сущностью Queue.
   * @throws NotFoundException если очередь не найдена.
   */
  async findOne(id: number): Promise<Queue> {
    const queue = await this.queueRepository.findOne({
      where: { queueId: id },
      relations: ['organization', 'createdBy', 'entries', 'administrators'], // Загружаем все связанные сущности
    });
    if (!queue) {
      throw new NotFoundException(`Queue with ID ${id} not found.`);
    }
    return queue;
  }

  /**
   * Находит очередь по ее приватному токену.
   * @param token Приватный токен очереди.
   * @returns Promise с сущностью Queue.
   * @throws NotFoundException если очередь не найдена или токен недействителен.
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
   * Обновляет существующую очередь.
   * @param id ID очереди.
   * @param updateQueueDto DTO с данными для обновления.
   * @param userId ID пользователя, выполняющего обновление.
   * @returns Promise с обновленной сущностью Queue.
   * @throws NotFoundException если очередь не найдена.
   * @throws ForbiddenException если пользователь не является создателем очереди.
   * @throws BadRequestException если попытка изменить organizationId для SELF_ORGANIZED очереди.
   * @throws ConflictException если новое имя очереди уже занято.
   */
  async update(id: number, updateQueueDto: UpdateQueueDto, userId: number): Promise<Queue> {
    const queue = await this.findOne(id); // Используем findOne для проверки существования и загрузки связей

    // Проверка прав доступа: только создатель очереди может ее обновить
    if (queue.createdByUserId !== userId) {
      throw new ForbiddenException('У вас нет разрешения на обновление этой очереди.');
    }

    // Запрет изменения organizationId для SELF_ORGANIZED очереди
    if (queue.type === QueueTypeEnum.SELF_ORGANIZED && updateQueueDto.organizationId !== undefined && updateQueueDto.organizationId !== null) {
      throw new BadRequestException('Cannot change organizationId for self-organized queues.');
    }

    // Если меняется organizationId для ORGANIZATIONAL очереди
    if (queue.type === QueueTypeEnum.ORGANIZATIONAL && updateQueueDto.organizationId !== undefined && updateQueueDto.organizationId !== queue.organizationId) {
      if (updateQueueDto.organizationId === null) {
        throw new BadRequestException('Cannot set organizationId to null for organizational queues.');
      }
      // Проверяем существование новой организации
      await this.organizationsService.findOne(updateQueueDto.organizationId);
    }

    // Обновляем только те поля, которые присутствуют в DTO
    Object.assign(queue, updateQueueDto);

    // Если меняются поля, влияющие на имя, перегенерируем его
    if (updateQueueDto.city || updateQueueDto.address || updateQueueDto.serviceName || updateQueueDto.organizationId) {
      queue.name = await this.generateQueueName(queue); // Передаем обновленную сущность для генерации имени
    }

    // Проверяем уникальность имени после потенциальной перегенерации
    const existingQueueWithName = await this.queueRepository.findOne({
      where: { name: queue.name },
    });
    if (existingQueueWithName && existingQueueWithName.queueId !== id) {
      throw new ConflictException(`Queue with name "${queue.name}" already exists.`);
    }

    return this.queueRepository.save(queue);
  }

  /**
   * Удаляет очередь по ее ID.
   * @param id ID очереди.
   * @param userId ID пользователя, выполняющего удаление.
   * @returns Promise, который завершается после удаления.
   * @throws NotFoundException если очередь не найдена.
   * @throws ForbiddenException если пользователь не является создателем очереди.
   */
  async remove(id: number, userId: number): Promise<void> {
    const queue = await this.findOne(id); // Используем findOne для проверки существования

    // Проверка прав доступа: только создатель очереди может ее удалить
    if (queue.createdByUserId !== userId) {
      throw new ForbiddenException('У вас нет разрешения на удаление этой очереди.');
    }

    await this.queueRepository.remove(queue);
  }
}
