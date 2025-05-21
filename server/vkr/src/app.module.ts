// src/app.module.ts

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './users/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { OrganizationsModule } from './organizations/organization.module';
import { QueueModule } from './queues/queue.module';
import { JournalModule } from './journal/journal.module';
import { EntryModule } from './entries/entry.module';
import { IntegrationModule } from './integration/integration.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.${process.env.NODE_ENV}.env`,
      isGlobal: true, // Сделаем ConfigModule глобальным для удобства
    }),
    TypeOrmModule.forRoot({
      type: 'postgres', //тип подключаемой БД
      port: Number(process.env.POSTGRES_PORT), //порт
      username: process.env.POSTGRES_USER, //имя пользователя
      password: process.env.POSTGRES_PASSWORD, //пароль
      host: process.env.POSTGRES_HOST, //хост, в нашем случае БД развернута локально
      database: process.env.POSTGRES_DB,
      synchronize: false, //отключаем автосинхронизацию(в противном случае при каждом перезапуске наша БД будет создаваться заново)
      logging: 'all', //включим логирование для удобства отслеживания процессов
      entities: ['dist/**/*.entity{.ts,.js}'], //указываем путь к сущностям

    }),
    UserModule,
    AuthModule,
    OrganizationsModule,
    QueueModule,
    JournalModule, 
    EntryModule,
    IntegrationModule, 

    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('EMAIL_HOST'),
          port: configService.get<number>('EMAIL_PORT'),
          secure: configService.get<boolean>('EMAIL_SECURE'),
          auth: {
            user: configService.get<string>('EMAIL_USER'),
            pass: configService.get<string>('EMAIL_PASSWORD'),
          },
        },
        defaults: {
          from: configService.get<string>('EMAIL_FROM'), // От кого по умолчанию
        },
        template: {
          dir: join(__dirname, '..', 'src', 'mail'), // Путь к директории с шаблонами писем
          adapter: new HandlebarsAdapter(), // Используем Handlebars в качестве шаблонизатора
          options: {
            strict: true, // Строгий режим для шаблонов
          },
        },
      }),
      inject: [ConfigService],
    }),

],
  // controllers: [AppController], // Раскомментируйте, если у вас есть AppController
  // providers: [AppService], // Раскомментируйте, если у вас есть AppService
})
export class AppModule {}
