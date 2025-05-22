// src/organizations/organizations.controller.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationController } from './organization.controller';
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { OrganizationDto } from './dto/organization.dto';
import { Organization } from './entity/organization.entity';
import { NotFoundException, ConflictException } from '@nestjs/common';

// Мок-объект для сущности Organization
const mockOrganizationEntity: Organization = {
    organizationId: 1,
    name: 'Test Organization',
    queues: [],
    city: '',
    address: ''
};

// Мок-объект для DTO организации
const mockOrganizationDto: OrganizationDto = new OrganizationDto(mockOrganizationEntity);

describe('OrganizationController', () => {
  let controller: OrganizationController;
  let service: OrganizationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrganizationController],
      providers: [
        {
          provide: OrganizationService,
          useValue: {
            // Мокируем все методы сервиса
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<OrganizationController>(OrganizationController);
    service = module.get<OrganizationService>(OrganizationService);

    jest.clearAllMocks(); // Очищаем все моки перед каждым тестом
  });

  it('контроллер должен быть определен', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('должен создать новую организацию и вернуть OrganizationDto', async () => {
      const createDto: CreateOrganizationDto = {
          name: 'New Org',
          city: '',
          address: ''
      };
      const createdEntity: Organization = {
        ...mockOrganizationEntity,
        organizationId: 2,
        name: 'New Org',
      };
      const expectedDto = new OrganizationDto(createdEntity);

      jest.spyOn(service, 'create').mockResolvedValue(createdEntity);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(expectedDto);
    });

    it('должен выбросить ConflictException, если организация с таким именем уже существует', async () => {
      const createDto: CreateOrganizationDto = {
          name: 'Existing Org',
          city: '',
          address: ''
      };
      jest.spyOn(service, 'create').mockRejectedValue(
        new ConflictException(`Organization with name "${createDto.name}" already exists.`),
      );

      await expect(controller.create(createDto)).rejects.toThrow(ConflictException);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('должен вернуть массив OrganizationDto', async () => {
      const entities: Organization[] = [mockOrganizationEntity, { ...mockOrganizationEntity, organizationId: 2, name: 'Another Org' }];
      const expectedDtos: OrganizationDto[] = entities.map(org => new OrganizationDto(org));

      jest.spyOn(service, 'findAll').mockResolvedValue(entities);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(expectedDtos);
      expect(result.length).toBe(2);
    });

    it('должен вернуть пустой массив, если организаций нет', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue([]);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('должен вернуть OrganizationDto по ID', async () => {
      const id = 1;
      jest.spyOn(service, 'findOne').mockResolvedValue(mockOrganizationEntity);

      const result = await controller.findOne(id);

      expect(service.findOne).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockOrganizationDto);
    });

    it('должен выбросить NotFoundException, если организация не найдена', async () => {
      const id = 999;
      jest.spyOn(service, 'findOne').mockRejectedValue(
        new NotFoundException(`Organization with ID ${id} not found.`),
      );

      await expect(controller.findOne(id)).rejects.toThrow(NotFoundException);
      expect(service.findOne).toHaveBeenCalledWith(id);
    });
  });

  describe('update', () => {
    it('должен обновить организацию и вернуть обновленный OrganizationDto', async () => {
      const id = 1;
      const updateDto: UpdateOrganizationDto = { name: 'Updated Org Name' };
      const updatedEntity: Organization = { ...mockOrganizationEntity, name: 'Updated Org Name' };
      const expectedDto = new OrganizationDto(updatedEntity);

      jest.spyOn(service, 'update').mockResolvedValue(updatedEntity);

      const result = await controller.update(id, updateDto);

      expect(service.update).toHaveBeenCalledWith(id, updateDto);
      expect(result).toEqual(expectedDto);
    });

    it('должен выбросить NotFoundException, если организация для обновления не найдена', async () => {
      const id = 999;
      const updateDto: UpdateOrganizationDto = { name: 'Non Existent' };
      jest.spyOn(service, 'update').mockRejectedValue(
        new NotFoundException(`Organization with ID ${id} not found.`),
      );

      await expect(controller.update(id, updateDto)).rejects.toThrow(NotFoundException);
      expect(service.update).toHaveBeenCalledWith(id, updateDto);
    });

    it('должен выбросить ConflictException, если новое имя организации уже занято', async () => {
      const id = 1;
      const updateDto: UpdateOrganizationDto = { name: 'Another Existing Org' };
      jest.spyOn(service, 'update').mockRejectedValue(
        new ConflictException(`Organization with name "${updateDto.name}" already exists.`),
      );

      await expect(controller.update(id, updateDto)).rejects.toThrow(ConflictException);
      expect(service.update).toHaveBeenCalledWith(id, updateDto);
    });
  });

  describe('remove', () => {
    it('должен удалить организацию и ничего не вернуть (204 No Content)', async () => {
      const id = 1;
      jest.spyOn(service, 'remove').mockResolvedValue(undefined); // remove возвращает Promise<void>

      const result = await controller.remove(id);

      expect(service.remove).toHaveBeenCalledWith(id);
      expect(result).toBeUndefined(); // Проверяем, что ничего не возвращается
    });

    it('должен выбросить NotFoundException, если организация для удаления не найдена', async () => {
      const id = 999;
      jest.spyOn(service, 'remove').mockRejectedValue(
        new NotFoundException(`Organization with ID ${id} not found.`),
      );

      await expect(controller.remove(id)).rejects.toThrow(NotFoundException);
      expect(service.remove).toHaveBeenCalledWith(id);
    });
  });
});
