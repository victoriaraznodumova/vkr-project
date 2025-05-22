// src/queues/queue.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { QueueService } from './queue.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Queue } from './entity/queue.entity';
import { CreateQueueDto } from './dto/create-queue.dto';
import { UpdateQueueDto } from './dto/update-queue.dto';
import { QueueTypeEnum } from './entity/queue.type.enum';
import { QueueVisibilityEnum } from './entity/queue.visibility.enum';
import { OrganizationService } from '../organizations/organization.service';
import { Administrator } from '../administrators/administrator.entity';
import { User } from '../users/entity/user.entity';
import { NotFoundException, BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';

// Мокируем uuidv4
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-token'),
}));

describe('QueueService', () => {
  let service: QueueService;
  let queueRepository: Repository<Queue>;
  let administratorRepository: Repository<Administrator>;
  let userRepository: Repository<User>;
  let organizationService: OrganizationService;

  const mockQueueRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    remove: jest.fn(),
  };

  const mockAdministratorRepository = {
    findOne: jest.fn(),
  };

  const mockUserRepository = {
    // В этом сервисе userRepository не используется напрямую для операций,
    // но его нужно мокировать, если он инжектируется.
  };

  const mockOrganizationService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QueueService,
        {
          provide: getRepositoryToken(Queue),
          useValue: mockQueueRepository,
        },
        {
          provide: getRepositoryToken(Administrator),
          useValue: mockAdministratorRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: OrganizationService,
          useValue: mockOrganizationService,
        },
      ],
    }).compile();

    service = module.get<QueueService>(QueueService);
    queueRepository = module.get<Repository<Queue>>(getRepositoryToken(Queue));
    administratorRepository = module.get<Repository<Administrator>>(getRepositoryToken(Administrator));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    organizationService = module.get<OrganizationService>(OrganizationService);

    // Сброс моков перед каждым тестом
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // --- Тесты для generateQueueName ---
  describe('generateQueueName', () => {
    it('should generate name for ORGANIZATIONAL queue', async () => {
      const createQueueDto: CreateQueueDto = {
        type: QueueTypeEnum.ORGANIZATIONAL,
        organizationId: 1,
        city: 'City',
        address: 'Address',
        serviceName: 'Service',
        visibility: QueueVisibilityEnum.PUBLIC,
        openingHours: '9-17',
        intervalMinutes: 15,
        concurrentVisitors: 1,
      };
      mockOrganizationService.findOne.mockResolvedValue({ name: 'OrgName' });
      const name = await (service as any).generateQueueName(createQueueDto);
      expect(name).toBe('OrgName: Service');
      expect(mockOrganizationService.findOne).toHaveBeenCalledWith(1);
    });

    it('should throw BadRequestException if organizationId is missing for ORGANIZATIONAL queue', async () => {
      const createQueueDto: CreateQueueDto = {
        type: QueueTypeEnum.ORGANIZATIONAL,
        organizationId: null, // Missing organizationId
        city: 'City',
        address: 'Address',
        serviceName: 'Service',
        visibility: QueueVisibilityEnum.PUBLIC,
        openingHours: '9-17',
        intervalMinutes: 15,
        concurrentVisitors: 1,
      };
      await expect((service as any).generateQueueName(createQueueDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if organization not found for ORGANIZATIONAL queue', async () => {
      const createQueueDto: CreateQueueDto = {
        type: QueueTypeEnum.ORGANIZATIONAL,
        organizationId: 1,
        city: 'City',
        address: 'Address',
        serviceName: 'Service',
        visibility: QueueVisibilityEnum.PUBLIC,
        openingHours: '9-17',
        intervalMinutes: 15,
        concurrentVisitors: 1,
      };
      mockOrganizationService.findOne.mockResolvedValue(null); // Organization not found
      await expect((service as any).generateQueueName(createQueueDto)).rejects.toThrow(NotFoundException);
    });

    it('should generate name for SELF_ORGANIZED queue', async () => {
      const createQueueDto: CreateQueueDto = {
        type: QueueTypeEnum.SELF_ORGANIZED,
        city: 'MyCity',
        address: 'MyAddress',
        serviceName: 'MyService',
        visibility: QueueVisibilityEnum.PUBLIC,
        openingHours: '9-17',
        intervalMinutes: 15,
        concurrentVisitors: 1,
      };
      const name = await (service as any).generateQueueName(createQueueDto);
      expect(name).toBe('MyCity, MyAddress: MyService');
      expect(mockOrganizationService.findOne).not.toHaveBeenCalled();
    });
  });

  // --- Тесты для create ---
  describe('create', () => {
    const createQueueDto: CreateQueueDto = {
      type: QueueTypeEnum.SELF_ORGANIZED,
      city: 'Test City',
      address: 'Test Address',
      serviceName: 'Test Service',
      visibility: QueueVisibilityEnum.PUBLIC,
      openingHours: 'Mon-Fri 9-5',
      intervalMinutes: 30,
      concurrentVisitors: 1,
    };
    const createdByUserId = 1;
    const expectedQueue: Queue = {
      queueId: 1,
      name: 'Test City, Test Address: Test Service',
      organizationId: null,
      type: QueueTypeEnum.SELF_ORGANIZED,
      visibility: QueueVisibilityEnum.PUBLIC,
      city: 'Test City',
      address: 'Test Address',
      openingHours: 'Mon-Fri 9-5',
      serviceName: 'Test Service',
      intervalMinutes: 30,
      concurrentVisitors: 1,
      privateLinkToken: null,
      createdAt: new Date(),
      createdByUserId: 1,
      isActive: true,
      administrators: [],
      entries: [],
      organization: null,
      createdBy: null,
    };

    it('should successfully create a self-organized queue', async () => {
      mockQueueRepository.findOne.mockResolvedValue(null); // No existing queue
      mockQueueRepository.create.mockReturnValue(expectedQueue);
      mockQueueRepository.save.mockResolvedValue(expectedQueue);

      const result = await service.create(createQueueDto, createdByUserId);

      expect(queueRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: createQueueDto.type,
          visibility: createQueueDto.visibility,
          city: createQueueDto.city,
          address: createQueueDto.address,
          serviceName: createQueueDto.serviceName,
          name: 'Test City, Test Address: Test Service',
          createdByUserId: createdByUserId,
          isActive: true, // Проверяем, что isActive установлен в true
          privateLinkToken: null, // Для публичной очереди
        }),
      );
      expect(queueRepository.save).toHaveBeenCalledWith(expectedQueue);
      expect(result).toEqual(expectedQueue);
    });

    it('should successfully create an organizational queue with private visibility and generate token', async () => {
      const orgQueueDto: CreateQueueDto = {
        type: QueueTypeEnum.ORGANIZATIONAL,
        organizationId: 10,
        city: 'Org City',
        address: 'Org Address',
        serviceName: 'Org Service',
        visibility: QueueVisibilityEnum.PRIVATE,
        openingHours: 'Mon-Fri 9-5',
        intervalMinutes: 30,
        concurrentVisitors: 1,
      };
      const orgExpectedQueue: Queue = {
        ...expectedQueue,
        type: QueueTypeEnum.ORGANIZATIONAL,
        organizationId: 10,
        name: 'Mock Org: Org Service', // Мокируем имя организации
        visibility: QueueVisibilityEnum.PRIVATE,
        privateLinkToken: 'mock-uuid-token',
      };

      mockQueueRepository.findOne.mockResolvedValue(null);
      mockOrganizationService.findOne.mockResolvedValue({ name: 'Mock Org' });
      mockQueueRepository.create.mockReturnValue(orgExpectedQueue);
      mockQueueRepository.save.mockResolvedValue(orgExpectedQueue);

      const result = await service.create(orgQueueDto, createdByUserId);

      expect(queueRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: orgQueueDto.type,
          visibility: orgQueueDto.visibility,
          organizationId: orgQueueDto.organizationId,
          name: 'Mock Org: Org Service',
          privateLinkToken: 'mock-uuid-token', // Проверяем сгенерированный токен
          isActive: true,
        }),
      );
      expect(result).toEqual(orgExpectedQueue);
    });


    it('should throw BadRequestException if name is provided in DTO', async () => {
      const dtoWithName = { ...createQueueDto, name: 'Custom Name' } as CreateQueueDto;
      await expect(service.create(dtoWithName, createdByUserId)).rejects.toThrow(BadRequestException);
      expect(queueRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if queue with generated name already exists', async () => {
      mockQueueRepository.findOne.mockResolvedValue(expectedQueue); // Queue already exists
      await expect(service.create(createQueueDto, createdByUserId)).rejects.toThrow(ConflictException);
      expect(queueRepository.create).not.toHaveBeenCalled();
    });
  });

  // --- Тесты для findAll ---
  describe('findAll', () => {
    it('should return all queues', async () => {
      const queues = [
        { queueId: 1, name: 'Q1' } as Queue,
        { queueId: 2, name: 'Q2' } as Queue,
      ];
      mockQueueRepository.find.mockResolvedValue(queues);

      const result = await service.findAll();
      expect(result).toEqual(queues);
      expect(mockQueueRepository.find).toHaveBeenCalledWith({ relations: ['organization', 'createdBy'] });
    });

    it('should return queues filtered by organizationId', async () => {
      const queues = [{ queueId: 1, name: 'Q1', organizationId: 10 } as Queue];
      mockQueueRepository.find.mockResolvedValue(queues);

      const result = await service.findAll(10);
      expect(result).toEqual(queues);
      expect(mockQueueRepository.find).toHaveBeenCalledWith({
        relations: ['organization', 'createdBy'],
        where: { organizationId: 10 },
      });
    });
  });

  // --- Тесты для findOne ---
  describe('findOne', () => {
    it('should return a queue if found', async () => {
      const queue = { queueId: 1, name: 'Test Queue' } as Queue;
      mockQueueRepository.findOne.mockResolvedValue(queue);

      const result = await service.findOne(1);
      expect(result).toEqual(queue);
      expect(mockQueueRepository.findOne).toHaveBeenCalledWith({
        where: { queueId: 1 },
        relations: ['organization', 'createdBy', 'entries', 'administrators'],
      });
    });

    it('should throw NotFoundException if queue not found', async () => {
      mockQueueRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  // --- Тесты для findOneByPrivateLinkToken ---
  describe('findOneByPrivateLinkToken', () => {
    it('should return a private queue if token matches', async () => {
      const privateQueue = { queueId: 1, name: 'Private Q', privateLinkToken: 'abc', visibility: QueueVisibilityEnum.PRIVATE } as Queue;
      mockQueueRepository.findOne.mockResolvedValue(privateQueue);

      const result = await service.findOneByPrivateLinkToken('abc');
      expect(result).toEqual(privateQueue);
      expect(mockQueueRepository.findOne).toHaveBeenCalledWith({
        where: { privateLinkToken: 'abc', visibility: QueueVisibilityEnum.PRIVATE },
        relations: ['organization', 'createdBy', 'entries', 'administrators'],
      });
    });

    it('should throw NotFoundException if queue not found by token', async () => {
      mockQueueRepository.findOne.mockResolvedValue(null);
      await expect(service.findOneByPrivateLinkToken('non-existent-token')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if queue found but not private', async () => {
      const publicQueue = { queueId: 1, name: 'Public Q', privateLinkToken: 'abc', visibility: QueueVisibilityEnum.PUBLIC } as Queue;
      mockQueueRepository.findOne.mockResolvedValue(publicQueue);
      await expect(service.findOneByPrivateLinkToken('abc')).rejects.toThrow(NotFoundException);
    });
  });

  // --- Тесты для isUserAdminOfQueue ---
  describe('isUserAdminOfQueue', () => {
    it('should return true if user is an admin of the queue', async () => {
      mockAdministratorRepository.findOne.mockResolvedValue({ administratorId: 1 });
      const result = await service.isUserAdminOfQueue(1, 10);
      expect(result).toBe(true);
      expect(mockAdministratorRepository.findOne).toHaveBeenCalledWith({
        where: { user: { userId: 1 }, queue: { queueId: 10 } },
      });
    });

    it('should return false if user is not an admin of the queue', async () => {
      mockAdministratorRepository.findOne.mockResolvedValue(null);
      const result = await service.isUserAdminOfQueue(1, 10);
      expect(result).toBe(false);
    });
  });

  // --- Тесты для update ---
  describe('update', () => {
    const existingQueue: Queue = {
      queueId: 1,
      name: 'Old Name',
      organizationId: null,
      type: QueueTypeEnum.SELF_ORGANIZED,
      visibility: QueueVisibilityEnum.PUBLIC,
      city: 'Old City',
      address: 'Old Address',
      serviceName: 'Old Service',
      openingHours: 'Old Hours',
      intervalMinutes: 10,
      concurrentVisitors: 1,
      privateLinkToken: null,
      createdAt: new Date(),
      createdByUserId: 100, // Creator user ID
      isActive: true,
      administrators: [],
      entries: [],
      organization: null,
      createdBy: null,
    };

    it('should successfully update a queue by creator', async () => {
      const updateDto: UpdateQueueDto = { city: 'New City', serviceName: 'New Service' };
      const updatedQueue = { ...existingQueue, city: 'New City', serviceName: 'New Service', name: 'New City, Old Address: New Service' };

      mockQueueRepository.findOne.mockResolvedValue(existingQueue);
      mockAdministratorRepository.findOne.mockResolvedValue(null); // Not an admin
      mockQueueRepository.save.mockResolvedValue(updatedQueue);
      mockQueueRepository.findOne.mockResolvedValueOnce(existingQueue).mockResolvedValueOnce(null); // For conflict check

      const result = await service.update(1, updateDto, 100); // User 100 is creator

      expect(mockQueueRepository.findOne).toHaveBeenCalledWith({
        where: { queueId: 1 },
        relations: ['organization', 'createdBy', 'entries', 'administrators'],
      });
      expect(mockAdministratorRepository.findOne).toHaveBeenCalledWith({
        where: { user: { userId: 100 }, queue: { queueId: 1 } },
      });
      expect(mockQueueRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          city: 'New City',
          serviceName: 'New Service',
          name: 'New City, Old Address: New Service', // Name should be regenerated
        }),
      );
      expect(result).toEqual(updatedQueue);
    });

    it('should successfully update a queue by an administrator', async () => {
      const updateDto: UpdateQueueDto = { openingHours: 'New Hours' };
      const updatedQueue = { ...existingQueue, openingHours: 'New Hours' };

      mockQueueRepository.findOne.mockResolvedValue(existingQueue);
      mockAdministratorRepository.findOne.mockResolvedValue({ administratorId: 1 }); // Is an admin
      mockQueueRepository.save.mockResolvedValue(updatedQueue);
      mockQueueRepository.findOne.mockResolvedValueOnce(existingQueue).mockResolvedValueOnce(null); // For conflict check

      const result = await service.update(1, updateDto, 200); // User 200 is admin

      expect(mockAdministratorRepository.findOne).toHaveBeenCalledWith({
        where: { user: { userId: 200 }, queue: { queueId: 1 } },
      });
      expect(mockQueueRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          openingHours: 'New Hours',
        }),
      );
      expect(result).toEqual(updatedQueue);
    });

    it('should throw NotFoundException if queue to update is not found', async () => {
      mockQueueRepository.findOne.mockResolvedValue(null); // Queue not found
      await expect(service.update(999, {}, 100)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is neither creator nor admin', async () => {
      mockQueueRepository.findOne.mockResolvedValue(existingQueue);
      mockAdministratorRepository.findOne.mockResolvedValue(null); // Not an admin
      await expect(service.update(1, {}, 999)).rejects.toThrow(ForbiddenException); // User 999 is neither
    });

    it('should throw BadRequestException if trying to change organizationId for SELF_ORGANIZED queue', async () => {
      const updateDto: UpdateQueueDto = { organizationId: 5 };
      mockQueueRepository.findOne.mockResolvedValue(existingQueue); // SELF_ORGANIZED
      await expect(service.update(1, updateDto, 100)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if trying to set organizationId to null for ORGANIZATIONAL queue', async () => {
      const orgQueue: Queue = { ...existingQueue, type: QueueTypeEnum.ORGANIZATIONAL, organizationId: 10 };
      const updateDto: UpdateQueueDto = { organizationId: null };
      mockQueueRepository.findOne.mockResolvedValue(orgQueue);
      await expect(service.update(1, updateDto, 100)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if new organization for ORGANIZATIONAL queue is not found', async () => {
      const orgQueue: Queue = { ...existingQueue, type: QueueTypeEnum.ORGANIZATIONAL, organizationId: 10 };
      const updateDto: UpdateQueueDto = { organizationId: 20 };
      mockQueueRepository.findOne.mockResolvedValue(orgQueue);
      mockOrganizationService.findOne.mockResolvedValue(null); // New organization not found
      await expect(service.update(1, updateDto, 100)).rejects.toThrow(NotFoundException);
    });

    it('should update privateLinkToken if explicitly provided in DTO', async () => {
      const privateQueue: Queue = { ...existingQueue, visibility: QueueVisibilityEnum.PRIVATE, privateLinkToken: 'old-token' };
      const updateDto: UpdateQueueDto = { privateLinkToken: 'new-explicit-token' };
      const updatedQueue = { ...privateQueue, privateLinkToken: 'new-explicit-token' };

      mockQueueRepository.findOne.mockResolvedValue(privateQueue);
      mockAdministratorRepository.findOne.mockResolvedValue(null);
      mockQueueRepository.save.mockResolvedValue(updatedQueue);
      mockQueueRepository.findOne.mockResolvedValueOnce(privateQueue).mockResolvedValueOnce(null);

      const result = await service.update(1, updateDto, 100);
      expect(result.privateLinkToken).toBe('new-explicit-token');
      expect(mockQueueRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ privateLinkToken: 'new-explicit-token' })
      );
    });

    it('should not change privateLinkToken if not provided in DTO', async () => {
      const privateQueue: Queue = { ...existingQueue, visibility: QueueVisibilityEnum.PRIVATE, privateLinkToken: 'existing-token' };
      const updateDto: UpdateQueueDto = { city: 'Updated City' };
      const updatedQueue = { ...privateQueue, city: 'Updated City', name: 'Updated City, Old Address: Old Service' };

      mockQueueRepository.findOne.mockResolvedValue(privateQueue);
      mockAdministratorRepository.findOne.mockResolvedValue(null);
      mockQueueRepository.save.mockResolvedValue(updatedQueue);
      mockQueueRepository.findOne.mockResolvedValueOnce(privateQueue).mockResolvedValueOnce(null);

      const result = await service.update(1, updateDto, 100);
      expect(result.privateLinkToken).toBe('existing-token');
      expect(mockQueueRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ privateLinkToken: 'existing-token' })
      );
    });

    it('should throw ConflictException if new generated name conflicts with another queue', async () => {
      const updateDto: UpdateQueueDto = { serviceName: 'Conflicting Service' };
      const conflictingQueue: Queue = { ...existingQueue, queueId: 2, name: 'Old City, Old Address: Conflicting Service' }; // Another queue with the same new name

      mockQueueRepository.findOne
        .mockResolvedValueOnce(existingQueue) // findOne for current queue
        .mockResolvedValueOnce(conflictingQueue); // findOne for conflict check

      mockAdministratorRepository.findOne.mockResolvedValue(null);

      await expect(service.update(1, updateDto, 100)).rejects.toThrow(ConflictException);
    });
  });

  // --- Тесты для remove ---
  describe('remove', () => {
    const existingQueue: Queue = {
      queueId: 1,
      name: 'Test Queue',
      organizationId: null,
      type: QueueTypeEnum.SELF_ORGANIZED,
      visibility: QueueVisibilityEnum.PUBLIC,
      city: 'City',
      address: 'Address',
      serviceName: 'Service',
      openingHours: 'Hours',
      intervalMinutes: 10,
      concurrentVisitors: 1,
      privateLinkToken: null,
      createdAt: new Date(),
      createdByUserId: 100, // Creator user ID
      isActive: true,
      administrators: [],
      entries: [],
      organization: null,
      createdBy: null,
    };

    it('should successfully remove a queue by creator', async () => {
      mockQueueRepository.findOne.mockResolvedValue(existingQueue);
      mockAdministratorRepository.findOne.mockResolvedValue(null); // Not an admin
      mockQueueRepository.remove.mockResolvedValue(undefined);

      await service.remove(1, 100); // User 100 is creator
      expect(mockQueueRepository.remove).toHaveBeenCalledWith(existingQueue);
    });

    it('should successfully remove a queue by an administrator', async () => {
      mockQueueRepository.findOne.mockResolvedValue(existingQueue);
      mockAdministratorRepository.findOne.mockResolvedValue({ administratorId: 1 }); // Is an admin
      mockQueueRepository.remove.mockResolvedValue(undefined);

      await service.remove(1, 200); // User 200 is admin
      expect(mockQueueRepository.remove).toHaveBeenCalledWith(existingQueue);
    });

    it('should throw NotFoundException if queue to remove is not found', async () => {
      mockQueueRepository.findOne.mockResolvedValue(null);
      await expect(service.remove(999, 100)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is neither creator nor admin', async () => {
      mockQueueRepository.findOne.mockResolvedValue(existingQueue);
      mockAdministratorRepository.findOne.mockResolvedValue(null);
      await expect(service.remove(1, 999)).rejects.toThrow(ForbiddenException);
    });
  });
});
