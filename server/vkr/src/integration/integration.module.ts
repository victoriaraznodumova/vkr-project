import { Module } from '@nestjs/common';
import { IntegrationController } from './integration.controller';
import { MessageProcessingFacade } from './integration.facade';
import { AdapterFactory } from '../adapters/adapter.factory';
import { QueueModule } from '../queues/queue.module'; // Импортируем ваш QueueModule
import { EntryModule } from 'src/entries/entry.module';

@Module({
  imports: [QueueModule, EntryModule], // Убедитесь, что QueueModule экспортирует QueueService
  controllers: [IntegrationController],
  providers: [
    MessageProcessingFacade,
    AdapterFactory,
    // Адаптеры не нужно явно перечислять здесь, так как они создаются фабрикой.
    // Если бы адаптеры имели свои зависимости, их нужно было бы зарегистрировать
    // как провайдеры и внедрять в AdapterFactory.
  ],
})
export class IntegrationModule {}
