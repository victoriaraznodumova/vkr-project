import { Module } from '@nestjs/common';
import { IntegrationController } from './integration.controller';
import { FormatProcessingService } from './integration.service';
import { ConverterFactoryService } from './converters/converter-factory.service';
import { QueueModule } from '../queues/queue.module'; // Импортируем ваш QueueModule
import { EntryModule } from 'src/entries/entry.module';

@Module({
  imports: [QueueModule, EntryModule], // Убедитесь, что QueueModule экспортирует QueueService
  controllers: [IntegrationController],
  providers: [
    FormatProcessingService,
    ConverterFactoryService,
    // Адаптеры не нужно явно перечислять здесь, так как они создаются фабрикой.
    // Если бы адаптеры имели свои зависимости, их нужно было бы зарегистрировать
    // как провайдеры и внедрять в ConverterFactory.
  ],
})
export class IntegrationModule {}
