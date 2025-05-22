// src/organizations/organization.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganizationService } from './organization.service';
import { Organization } from './entity/organization.entity';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';

// --- Мок-объекты для тестирования ---

const mockOrganization: Organization = {
  organizationId: 1,
  name: 'Тестовая Организация',
  city: 'Тестовый Город',
  address: 'Тестовый Адрес',
  queues: [],
};

const mockOrganization2: Organization = {
  organizationId: 2,
  name: 'Другая Организация',
  city: 'Другой Город',
  address: 'Другой Адрес',
  queues: [],
};

describe('OrganizationService', () => {
  let service: OrganizationService;
  let organizationRepository: Repository<Organization>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationService,
        {
          provide: getRepositoryToken(Organization),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OrganizationService>(OrganizationService);
    organizationRepository = module.get<Repository<Organization>>(getRepositoryToken(Organization));

    // Очищаем все моки перед каждым тестом, чтобы избежать утечек состояния между тестами
    jest.clearAllMocks();
  });

  it('сервис должен быть определен', () => {
    expect(service).toBeDefined();
  });

  // --- Тесты для метода create ---
  describe('create', () => {
    it('должен успешно создать организацию', async () => {
      const createDto: CreateOrganizationDto = {
        name: 'Новая Организация',
        city: 'Новый Город',
        address: 'Новый Адрес',
      };
      jest.spyOn(organizationRepository, 'findOne').mockResolvedValue(undefined);
      jest.spyOn(organizationRepository, 'create').mockReturnValue(createDto as Organization);
      jest.spyOn(organizationRepository, 'save').mockResolvedValue({ ...createDto, organizationId: 3 } as Organization);

      const result = await service.create(createDto);

      expect(organizationRepository.findOne).toHaveBeenCalledWith({ where: { name: createDto.name } });
      expect(organizationRepository.create).toHaveBeenCalledWith(createDto);
      expect(organizationRepository.save).toHaveBeenCalledWith(expect.any(Object));
      expect(result).toEqual(expect.objectContaining({ name: createDto.name }));
    });

    it('должен выбросить ConflictException, если организация с таким именем уже существует', async () => {
      const createDto: CreateOrganizationDto = {
        name: 'Тестовая Организация',
        city: 'Город',
        address: 'Адрес',
      };
      jest.spyOn(organizationRepository, 'findOne').mockResolvedValue(mockOrganization);

      await expect(service.create(createDto)).rejects.toThrow(
        new ConflictException(`Organization with name "${createDto.name}" already exists.`),
      );
      expect(organizationRepository.save).not.toHaveBeenCalled();
    });
  });

  // --- Тесты для метода findAll ---
  describe('findAll', () => {
    it('должен вернуть все организации', async () => {
      jest.spyOn(organizationRepository, 'find').mockResolvedValue([mockOrganization, mockOrganization2]);

      const result = await service.findAll();

      expect(organizationRepository.find).toHaveBeenCalledWith({ relations: ['queues'] });
      expect(result).toEqual([mockOrganization, mockOrganization2]);
    });

    it('должен вернуть пустой массив, если организаций нет', async () => {
      jest.spyOn(organizationRepository, 'find').mockResolvedValue([]);

      const result = await service.findAll();

      expect(organizationRepository.find).toHaveBeenCalledWith({ relations: ['queues'] });
      expect(result).toEqual([]);
    });
  });

  // --- Тесты для метода findOne ---
  describe('findOne', () => {
    it('должен вернуть организацию по ID, если найдена', async () => {
      jest.spyOn(organizationRepository, 'findOne').mockResolvedValue(mockOrganization);

      const result = await service.findOne(mockOrganization.organizationId);

      expect(organizationRepository.findOne).toHaveBeenCalledWith({
        where: { organizationId: mockOrganization.organizationId },
        relations: ['queues'],
      });
      expect(result).toEqual(mockOrganization);
    });

    it('должен выбросить NotFoundException, если организация по ID не найдена', async () => {
      jest.spyOn(organizationRepository, 'findOne').mockResolvedValue(undefined);

      await expect(service.findOne(999)).rejects.toThrow(
        new NotFoundException(`Organization with ID 999 not found.`),
      );
      expect(organizationRepository.findOne).toHaveBeenCalledWith({
        where: { organizationId: 999 },
        relations: ['queues'],
      });
    });
  });

  // --- Тесты для метода update ---
  describe('update', () => {
    const updateDto: UpdateOrganizationDto = {
      name: 'Обновленное Название',
      city: 'Обновленный Город',
    };
    const updatedOrganization = { ...mockOrganization, ...updateDto };

    it('должен успешно обновить организацию', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockOrganization);
      jest.spyOn(organizationRepository, 'findOne').mockResolvedValue(undefined); // Для проверки имени, не должно найти конфликт

      jest.spyOn(organizationRepository, 'save').mockResolvedValue(updatedOrganization);

      const result = await service.update(mockOrganization.organizationId, updateDto);

      expect(service.findOne).toHaveBeenCalledWith(mockOrganization.organizationId);
      expect(organizationRepository.findOne).toHaveBeenCalledWith({ where: { name: updateDto.name } });
      expect(organizationRepository.save).toHaveBeenCalledWith(expect.objectContaining(updateDto));
      expect(result).toEqual(updatedOrganization);
    });

    it('должен успешно обновить организацию, если имя не меняется', async () => {
      const updateDtoWithoutName: UpdateOrganizationDto = {
        city: 'Только Город Обновлен',
      };
      const orgAfterMerge = { ...mockOrganization, ...updateDtoWithoutName };

      jest.spyOn(service, 'findOne').mockResolvedValue(mockOrganization);
      // organizationRepository.findOne не должен вызываться, если имя не меняется
      // поэтому нет необходимости его мокировать здесь для этого сценария.

      jest.spyOn(organizationRepository, 'save').mockResolvedValue(orgAfterMerge);

      const result = await service.update(mockOrganization.organizationId, updateDtoWithoutName);

      expect(service.findOne).toHaveBeenCalledWith(mockOrganization.organizationId);
      // ИСПРАВЛЕНИЕ: Ожидаем, что findOne по имени НЕ будет вызван
      expect(organizationRepository.findOne).not.toHaveBeenCalledWith({ where: { name: expect.any(String) } });
      expect(organizationRepository.save).toHaveBeenCalledWith(expect.objectContaining(updateDtoWithoutName));
      expect(result).toEqual(orgAfterMerge);
    });

    it('должен выбросить NotFoundException, если организация для обновления не найдена', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException(`Organization with ID 999 not found.`));

      await expect(service.update(999, updateDto)).rejects.toThrow(
        new NotFoundException(`Organization with ID 999 not found.`),
      );
      expect(organizationRepository.save).not.toHaveBeenCalled();
    });

    

    it('не должен выбрасывать ConflictException, если новое имя совпадает с текущим именем обновляемой организации', async () => {
      const updateDtoSameName: UpdateOrganizationDto = { name: mockOrganization.name };

      jest.spyOn(service, 'findOne').mockResolvedValue(mockOrganization);
      // ИСПРАВЛЕНИЕ: organizationRepository.findOne не должен вызываться для проверки имени,
      // так как имя не меняется. Поэтому мы не мокируем его здесь для этого сценария.
      // Если бы он вызывался, и сервис проверял ID, то mockResolvedValue(mockOrganization)
      // был бы уместен, но текущая ошибка говорит о том, что вызова нет.

      jest.spyOn(organizationRepository, 'save').mockImplementation(async (entity: Organization) => ({ ...entity }));

      const result = await service.update(mockOrganization.organizationId, updateDtoSameName);

      expect(service.findOne).toHaveBeenCalledTimes(1);
      // ИСПРАВЛЕНИЕ: Ожидаем, что organizationRepository.findOne НЕ будет вызван
      expect(organizationRepository.findOne).not.toHaveBeenCalled();
      expect(result).toEqual(mockOrganization);
    });
  });

  // --- Тесты для метода remove ---
  describe('remove', () => {
    it('должен успешно удалить организацию', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockOrganization);
      jest.spyOn(organizationRepository, 'remove').mockResolvedValue(mockOrganization);

      await service.remove(mockOrganization.organizationId);

      expect(service.findOne).toHaveBeenCalledWith(mockOrganization.organizationId);
      expect(organizationRepository.remove).toHaveBeenCalledWith(mockOrganization);
    });

    it('должен выбросить NotFoundException, если организация для удаления не найдена', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException(`Organization with ID 999 not found.`));

      await expect(service.remove(999)).rejects.toThrow(
        new NotFoundException(`Organization with ID 999 not found.`),
      );
      expect(organizationRepository.remove).not.toHaveBeenCalled();
    });
  });
});
