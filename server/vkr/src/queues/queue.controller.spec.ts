// src/queues/queues.controller.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { QueueController } from './queue.controller';
import { QueueService } from './queue.service';
import { CreateQueueDto } from './dto/create-queue.dto';
import { UpdateQueueDto } from './dto/update-queue.dto';
import { QueueDto } from './dto/queue.dto';
import { Queue } from './entity/queue.entity';
import { QueueTypeEnum } from './entity/queue-type.enum';
import { QueueVisibilityEnum } from './entity/queue-visibility.enum';
import { NotFoundException, ConflictException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Импортируем для мокирования

// Мок-объект для сущности Queue
const mockQueueEntity: Queue = {
  queueId: 1,
  name: 'Test Queue: Service A',
  type: QueueTypeEnum.ORGANIZATIONAL,
  visibility: QueueVisibilityEnum.PUBLIC,
  organizationId: 101,
  city: 'Moscow',
  address: 'Main St',
  serviceName: 'Service A',
  createdByUserId: 1,
  privateLinkToken: null,
  createdAt: new Date(),
  openingHours: '9:00-18:00',
  intervalMinutes: 15,
  concurrentVisitors: 5,
  organization: null, // Будет заполнено при необходимости
  createdBy: null, // Будет заполнено при необходимости
  entries: [],
  administrators: [],
};

// Мок-объект для DTO очереди
const mockQueueDto: QueueDto = new QueueDto(mockQueueEntity);

describe('QueueController', () => {
  let controller: QueueController;
  let service: QueueService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QueueController],
      providers: [
        {
          provide: QueueService,
          useValue: {
            // Мокируем все методы сервиса
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            findOneByPrivateLinkToken: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard) // Мокируем JwtAuthGuard
      .useValue({ canActivate: jest.fn(() => true) }) // Всегда разрешаем доступ для тестов
      .compile();

    controller = module.get<QueueController>(QueueController);
    service = module.get<QueueService>(QueueService);

    jest.clearAllMocks(); // Очищаем все моки перед каждым тестом
  });

  it('контроллер должен быть определен', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const mockRequest = { user: { userId: 1 } } as any; // Мок объекта запроса

    it('должен создать новую очередь и вернуть QueueDto', async () => {
      const createDto: CreateQueueDto = {
        type: QueueTypeEnum.ORGANIZATIONAL,
        visibility: QueueVisibilityEnum.PUBLIC,
        organizationId: 101,
        city: 'Moscow',
        address: 'Main St',
        serviceName: 'New Service',
        openingHours: '9:00-18:00',
        intervalMinutes: 15,
        concurrentVisitors: 5,
      };
      const createdEntity: Queue = {
        ...mockQueueEntity,
        queueId: 2,
        name: 'Org Name: New Service', // Предполагаемое сгенерированное имя
        createdByUserId: 1,
      };
      const expectedDto = new QueueDto(createdEntity);

      jest.spyOn(service, 'create').mockResolvedValue(createdEntity);

      const result = await controller.create(createDto, mockRequest);

      expect(service.create).toHaveBeenCalledWith(createDto, mockRequest.user.userId);
      expect(result).toEqual(expectedDto);
    });

    it('должен выбросить ConflictException, если очередь с таким именем уже существует', async () => {
      const createDto: CreateQueueDto = {
        type: QueueTypeEnum.ORGANIZATIONAL,
        visibility: QueueVisibilityEnum.PUBLIC,
        organizationId: 101,
        city: 'Moscow',
        address: 'Main St',
        serviceName: 'Existing Service',
        openingHours: '9:00-18:00',
        intervalMinutes: 15,
        concurrentVisitors: 5,
      };
      jest.spyOn(service, 'create').mockRejectedValue(
        new ConflictException(`Queue with name "Org Name: Existing Service" already exists.`),
      );

      await expect(controller.create(createDto, mockRequest)).rejects.toThrow(ConflictException);
      expect(service.create).toHaveBeenCalledWith(createDto, mockRequest.user.userId);
    });

    it('должен выбросить BadRequestException, если имя очереди предоставлено в DTO', async () => {
      const createDtoWithProvidedName: CreateQueueDto & { name?: string } = {
        type: QueueTypeEnum.ORGANIZATIONAL,
        visibility: QueueVisibilityEnum.PUBLIC,
        organizationId: 101,
        city: 'Moscow',
        address: 'Main St',
        serviceName: 'New Service',
        name: 'Custom Name', // Запрещенное поле
        openingHours: '9:00-18:00',
        intervalMinutes: 15,
        concurrentVisitors: 5,
      };
      jest.spyOn(service, 'create').mockRejectedValue(
        new BadRequestException('Queue name is generated automatically and cannot be provided.'),
      );

      await expect(controller.create(createDtoWithProvidedName, mockRequest)).rejects.toThrow(BadRequestException);
      expect(service.create).toHaveBeenCalledWith(createDtoWithProvidedName, mockRequest.user.userId);
    });
  });

  describe('findAll', () => {
    it('должен вернуть массив QueueDto', async () => {
      const entities: Queue[] = [mockQueueEntity, { ...mockQueueEntity, queueId: 2, name: 'Another Queue' }];
      const expectedDtos: QueueDto[] = entities.map(queue => new QueueDto(queue));

      jest.spyOn(service, 'findAll').mockResolvedValue(entities);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledWith(undefined); // Без organizationId
      expect(result).toEqual(expectedDtos);
      expect(result.length).toBe(2);
    });

    it('должен вернуть массив QueueDto, отфильтрованный по organizationId', async () => {
      const organizationId = 101;
      const entities: Queue[] = [mockQueueEntity];
      const expectedDtos: QueueDto[] = entities.map(queue => new QueueDto(queue));

      jest.spyOn(service, 'findAll').mockResolvedValue(entities);

      const result = await controller.findAll(organizationId);

      expect(service.findAll).toHaveBeenCalledWith(organizationId);
      expect(result).toEqual(expectedDtos);
      expect(result.length).toBe(1);
    });

    it('должен вернуть пустой массив, если очередей нет', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue([]);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledWith(undefined);
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('должен вернуть QueueDto по ID', async () => {
      const id = 1;
      jest.spyOn(service, 'findOne').mockResolvedValue(mockQueueEntity);

      const result = await controller.findOne(id);

      expect(service.findOne).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockQueueDto);
    });

    it('должен выбросить NotFoundException, если очередь не найдена', async () => {
      const id = 999;
      jest.spyOn(service, 'findOne').mockRejectedValue(
        new NotFoundException(`Queue with ID ${id} not found.`),
      );

      await expect(controller.findOne(id)).rejects.toThrow(NotFoundException);
      expect(service.findOne).toHaveBeenCalledWith(id);
    });
  });

  describe('findOneByPrivateLinkToken', () => {
    const privateQueueEntity: Queue = {
      ...mockQueueEntity,
      queueId: 3,
      name: 'Private Queue',
      visibility: QueueVisibilityEnum.PRIVATE,
      privateLinkToken: 'some-private-token',
    };
    const privateQueueDto: QueueDto = new QueueDto(privateQueueEntity);

    it('должен вернуть QueueDto по приватному токену', async () => {
      const token = 'some-private-token';
      jest.spyOn(service, 'findOneByPrivateLinkToken').mockResolvedValue(privateQueueEntity);

      const result = await controller.findOneByPrivateLinkToken(token);

      expect(service.findOneByPrivateLinkToken).toHaveBeenCalledWith(token);
      expect(result).toEqual(privateQueueDto);
    });

    it('должен выбросить NotFoundException, если очередь не найдена по приватному токену', async () => {
      const token = 'non-existent-token';
      jest.spyOn(service, 'findOneByPrivateLinkToken').mockRejectedValue(
        new NotFoundException(`Queue with private link token "${token}" not found or is not private.`),
      );

      await expect(controller.findOneByPrivateLinkToken(token)).rejects.toThrow(NotFoundException);
      expect(service.findOneByPrivateLinkToken).toHaveBeenCalledWith(token);
    });
  });

  describe('update', () => {
    const mockRequest = { user: { userId: 1 } } as any; // Мок объекта запроса

    it('должен обновить очередь и вернуть обновленный QueueDto', async () => {
      const id = 1;
      const updateDto: UpdateQueueDto = { serviceName: 'Updated Service Name' };
      const updatedEntity: Queue = { ...mockQueueEntity, serviceName: 'Updated Service Name', name: 'Test Organization: Updated Service Name' };
      const expectedDto = new QueueDto(updatedEntity);

      jest.spyOn(service, 'update').mockResolvedValue(updatedEntity);

      const result = await controller.update(id, updateDto, mockRequest);

      expect(service.update).toHaveBeenCalledWith(id, updateDto, mockRequest.user.userId);
      expect(result).toEqual(expectedDto);
    });

    it('должен выбросить NotFoundException, если очередь для обновления не найдена', async () => {
      const id = 999;
      const updateDto: UpdateQueueDto = { serviceName: 'Non Existent' };
      jest.spyOn(service, 'update').mockRejectedValue(
        new NotFoundException(`Queue with ID ${id} not found.`),
      );

      await expect(controller.update(id, updateDto, mockRequest)).rejects.toThrow(NotFoundException);
      expect(service.update).toHaveBeenCalledWith(id, updateDto, mockRequest.user.userId);
    });

    it('должен выбросить ForbiddenException, если пользователь не является создателем/администратором', async () => {
      const id = 1;
      const updateDto: UpdateQueueDto = { serviceName: 'Unauthorized Update' };
      const unauthorizedRequest = { user: { userId: 99 } } as any; // Другой пользователь
      jest.spyOn(service, 'update').mockRejectedValue(
        new ForbiddenException('У вас нет разрешения на обновление этой очереди.'),
      );

      await expect(controller.update(id, updateDto, unauthorizedRequest)).rejects.toThrow(ForbiddenException);
      expect(service.update).toHaveBeenCalledWith(id, updateDto, unauthorizedRequest.user.userId);
    });

    it('должен выбросить ConflictException, если новое имя очереди уже занято', async () => {
      const id = 1;
      const updateDto: UpdateQueueDto = { serviceName: 'Another Existing Service' };
      jest.spyOn(service, 'update').mockRejectedValue(
        new ConflictException(`Queue with name "Test Organization: Another Existing Service" already exists.`),
      );

      await expect(controller.update(id, updateDto, mockRequest)).rejects.toThrow(ConflictException);
      expect(service.update).toHaveBeenCalledWith(id, updateDto, mockRequest.user.userId);
    });

    it('должен выбросить BadRequestException при попытке изменить organizationId для SELF_ORGANIZED очереди', async () => {
      const id = 1;
      const selfOrganizedQueue: Queue = {
        ...mockQueueEntity,
        queueId: 1,
        type: QueueTypeEnum.SELF_ORGANIZED,
        organizationId: null,
      };
      const updateDto: UpdateQueueDto = { organizationId: 200 };
      jest.spyOn(service, 'update').mockRejectedValue(
        new BadRequestException('Cannot change organizationId for self-organized queues.'),
      );

      await expect(controller.update(id, updateDto, mockRequest)).rejects.toThrow(BadRequestException);
      expect(service.update).toHaveBeenCalledWith(id, updateDto, mockRequest.user.userId);
    });
  });

  describe('remove', () => {
    const mockRequest = { user: { userId: 1 } } as any; // Мок объекта запроса

    it('должен удалить очередь и ничего не вернуть (204 No Content)', async () => {
      const id = 1;
      jest.spyOn(service, 'remove').mockResolvedValue(undefined); // remove возвращает Promise<void>

      const result = await controller.remove(id, mockRequest);

      expect(service.remove).toHaveBeenCalledWith(id, mockRequest.user.userId);
      expect(result).toBeUndefined(); // Проверяем, что ничего не возвращается
    });

    it('должен выбросить NotFoundException, если очередь для удаления не найдена', async () => {
      const id = 999;
      jest.spyOn(service, 'remove').mockRejectedValue(
        new NotFoundException(`Queue with ID ${id} not found.`),
      );

      await expect(controller.remove(id, mockRequest)).rejects.toThrow(NotFoundException);
      expect(service.remove).toHaveBeenCalledWith(id, mockRequest.user.userId);
    });

    it('должен выбросить ForbiddenException, если пользователь не является создателем/администратором', async () => {
      const id = 1;
      const unauthorizedRequest = { user: { userId: 99 } } as any; // Другой пользователь
      jest.spyOn(service, 'remove').mockRejectedValue(
        new ForbiddenException('У вас нет разрешения на удаление этой очереди.'),
      );

      await expect(controller.remove(id, unauthorizedRequest)).rejects.toThrow(ForbiddenException);
      expect(service.remove).toHaveBeenCalledWith(id, unauthorizedRequest.user.userId);
    });
  });
});
