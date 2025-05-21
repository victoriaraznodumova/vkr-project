// src/entries/entries.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Entry } from './entity/entry.entity';
import { EntryService } from './entry.service';
import { EntryController } from './entry.controller';
import { UserModule } from '../users/user.module'; // Импортируем UserModule для UserService
import { QueueModule } from '../queues/queue.module'; // Импортируем QueueModule для QueueService (предполагается его существование)
import { JournalModule } from '../journal/journal.module'; // Импортируем JournalModule для JournalService (предполагается его существование)

@Module({
  imports: [
    TypeOrmModule.forFeature([Entry]), // Регистрируем сущность Entry для этого модуля
    UserModule, // Необходим для UserService
    QueueModule, // Необходим для QueueService
    JournalModule, // Необходим для JournalService
  ],
  providers: [EntryService],
  controllers: [EntryController],
  exports: [EntryService], // Экспортируем EntriesService, если он будет использоваться в других модулях
})
export class EntryModule {}
