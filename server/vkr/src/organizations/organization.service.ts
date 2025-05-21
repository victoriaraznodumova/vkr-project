// src/organizations/organizations.service.ts

import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from './entity/organization.entity';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

/**
 * Сервис для управления организациями.
 * Предоставляет методы для создания, чтения, обновления и удаления организаций.
 */
@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
  ) {}

  /**
   * Создает новую организацию.
   * @param createOrganizationDto DTO с данными для создания организации.
   * @returns Promise с созданной сущностью Organization.
   */
  async create(createOrganizationDto: CreateOrganizationDto): Promise<Organization> {
    // Проверяем, существует ли уже организация с таким именем
    const existingOrganization = await this.organizationRepository.findOne({
      where: { name: createOrganizationDto.name },
    });

    if (existingOrganization) {
      throw new ConflictException(`Organization with name "${createOrganizationDto.name}" already exists.`);
    }

    const organization = this.organizationRepository.create(createOrganizationDto);
    return this.organizationRepository.save(organization);
  }

  /**
   * Находит все организации.
   * @returns Promise с массивом сущностей Organization.
   */
  async findAll(): Promise<Organization[]> {
    return this.organizationRepository.find({ relations: ['queues'] }); // Загружаем связанные очереди
  }

  /**
   * Находит организацию по ее ID.
   * @param id ID организации.
   * @returns Promise с сущностью Organization.
   * @throws NotFoundException если организация не найдена.
   */
  async findOne(id: number): Promise<Organization> {
    const organization = await this.organizationRepository.findOne({
      where: { organizationId: id },
      relations: ['queues'], // Загружаем связанные очереди
    });
    if (!organization) {
      throw new NotFoundException(`Organization with ID ${id} not found.`);
    }
    return organization;
  }

  /**
   * Обновляет существующую организацию.
   * @param id ID организации.
   * @param updateOrganizationDto DTO с данными для обновления.
   * @returns Promise с обновленной сущностью Organization.
   * @throws NotFoundException если организация не найдена.
   * @throws ConflictException если новое имя организации уже занято.
   */
  async update(id: number, updateOrganizationDto: UpdateOrganizationDto): Promise<Organization> {
    const organization = await this.findOne(id); // Используем findOne для проверки существования

    if (updateOrganizationDto.name && updateOrganizationDto.name !== organization.name) {
      const existingOrganization = await this.organizationRepository.findOne({
        where: { name: updateOrganizationDto.name },
      });
      if (existingOrganization && existingOrganization.organizationId !== id) {
        throw new ConflictException(`Organization with name "${updateOrganizationDto.name}" already exists.`);
      }
    }

    // Обновляем только те поля, которые присутствуют в DTO
    Object.assign(organization, updateOrganizationDto);

    return this.organizationRepository.save(organization);
  }

  /**
   * Удаляет организацию по ее ID.
   * @param id ID организации.
   * @returns Promise, который завершается после удаления.
   * @throws NotFoundException если организация не найдена.
   */
  async remove(id: number): Promise<void> {
    const organization = await this.findOne(id); // Используем findOne для проверки существования
    await this.organizationRepository.remove(organization);
  }
}
