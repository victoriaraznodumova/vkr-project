// src/queues/queues.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QueueService } from './queue.service';
import { QueueController } from './queue.controller';
import { Queue } from './entity/queue.entity';
import { OrganizationsModule } from '../organizations/organization.module'; // Импортируем OrganizationsModule
import { AuthModule } from '../auth/auth.module'; // Для использования JwtAuthGuard и RolesGuard

/**
 * Модуль для управления очередями.
 * Предоставляет сервис для бизнес-логики и контроллер для API-взаимодействия.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Queue]), // Регистрируем сущность Queue для TypeORM
    OrganizationsModule, // Импортируем OrganizationsModule, так как QueuesService зависит от OrganizationsService
    AuthModule, // Импортируем AuthModule для использования guards
  ],
  providers: [QueueService], // Регистрируем QueuesService как провайдер
  controllers: [QueueController], // Регистрируем QueuesController как контроллер
  exports: [QueueService], // Экспортируем QueuesService, чтобы другие модули могли его использовать (например, EntriesModule)
})
export class QueueModule {}
