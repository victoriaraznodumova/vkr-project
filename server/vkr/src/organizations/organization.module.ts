// src/organizations/organizations.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationService } from './organization.service';
import { OrganizationController } from './organization.controller';
import { Organization } from './entity/organization.entity';

/**
 * Модуль для управления организациями.
 * Предоставляет сервис для бизнес-логики и контроллер для API-взаимодействия.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Organization]), // Регистрируем сущность Organization для TypeORM
  ],
  providers: [OrganizationService], // Регистрируем OrganizationsService как провайдер
  controllers: [OrganizationController], // Регистрируем OrganizationsController как контроллер
  exports: [OrganizationService], // Экспортируем OrganizationsService, чтобы другие модули могли его использовать (например, QueuesModule)
})
export class OrganizationsModule {}
