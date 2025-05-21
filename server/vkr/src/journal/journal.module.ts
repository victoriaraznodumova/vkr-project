import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JournalService } from './journal.service';
import { JournalController } from './journal.controller';
import { Journal } from './entity/journal.entity'; // Изменено с JournalEntry на Journal

/**
 * Модуль для управления журналом действий.
 * Предоставляет сервис для логирования и контроллер для доступа к данным журнала.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Journal]), // Регистрируем сущность Journal для TypeORM
  ],
  providers: [JournalService], // Регистрируем JournalService как провайдер
  controllers: [JournalController], // Регистрируем JournalController как контроллер
  exports: [JournalService], // Экспортируем JournalService, чтобы другие модули могли его использовать
})
export class JournalModule {}
