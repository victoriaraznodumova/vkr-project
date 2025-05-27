// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';
// import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

// async function bootstrap() {
//   const PORT = process.env.PORT;
//   const app = await NestFactory.create(AppModule);

//   //добавила из лабы со второго курса
//   const config = new DocumentBuilder()
//     .setTitle('Education API')
//     .setVersion('1.0')
//     .build(); // Конфигурируем сборщик документации
//   const document = SwaggerModule.createDocument(app, config); // создаем апи документацию
//   SwaggerModule.setup('api_docs', app, document); //включаем документацию Swagger по пути localhost:3000/api_docs




//   await app.listen(PORT)
//   // await app.listen(3000);
//   //добавила из лабы со второго курса
//   await app.setGlobalPrefix('/api'); //глобальный префикс для роутов контроллера
// }
// bootstrap();




// src/main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe, ClassSerializerInterceptor, Logger } from '@nestjs/common'; // Импортируем Logger и другие интерцепторы/пайпы
import { ConfigService } from '@nestjs/config'; // Импортируем ConfigService
import * as bodyParser from 'body-parser';

async function bootstrap() {
  // Получаем порт из переменных окружения ДО создания приложения, если нужно для логирования
  const PORT = process.env.PORT || 3000; // Устанавливаем порт по умолчанию, если переменная не задана

  // Создаем приложение NestJS
  // !!! Важно: Устанавливаем уровень логирования здесь для отладки !!!
  const app = await NestFactory.create(AppModule, { rawBody: true , logger: ['log', 'error', 'warn', 'debug', 'verbose']}); // Включаем rawBody для доступа к сырым данным

  // Настраиваем body-parser для обработки различных типов контента
  // Это важно, чтобы контроллер мог получить сырые данные для адаптеров
  // Порядок важен: сначала более специфичные текстовые/XML, затем JSON и URL-encoded.
  // Это позволяет вашим адаптерам получать сырые данные, если они ожидают text/xml.

  // *** ПОРЯДОК MIDDLEWARE BODY-PARSER КРИТИЧЕН ***
  app.use(bodyParser.text({ type: 'application/xml' }));
  app.use(bodyParser.text({ type: 'text/xml' }));
  app.use(bodyParser.json()); // Для JSON
  app.use(bodyParser.text({ type: 'application/yaml'})); // <--- ДОБАВЬТЕ ЭТУ СТРОКУ
  app.use(bodyParser.urlencoded({ extended: true })); // Для form-urlencoded



  

 
  // Получаем ConfigService после создания приложения, если он нужен для других настроек
  const configService = app.get(ConfigService);

  // !!! Важно: Устанавливаем глобальный префикс ДО вызова app.listen() !!!
  app.setGlobalPrefix('api'); // Глобальный префикс для всех маршрутов контроллеров

  // Настройка глобальных пайпов и интерцепторов (рекомендуется)
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Удалять поля, отсутствующие в DTO
    forbidNonWhitelisted: true, // Запрещать запросы с "лишними" полями
    transform: true, // Автоматически преобразовывать типы входящих данных
  }));
  // Используем ClassSerializerInterceptor для автоматического преобразования сущностей в DTO
  // и применения декораторов @Exclude()/@Expose()

  //костыль, потому что иначе падала 500
  //app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(ConfigService)));


  // Настройка Swagger документации
  const config = new DocumentBuilder()
    .setTitle('Education API')
    .setDescription('API documentation for the Education project') // Добавьте описание
    .setVersion('1.0')
    .addBearerAuth() // Добавляем поддержку JWT авторизации в Swagger UI
    .build();
  const document = SwaggerModule.createDocument(app, config);
  // Путь для доступа к документации Swagger UI
  SwaggerModule.setup('api_docs', app, document); // Доступно по /api/api_docs, т.к. установлен глобальный префикс /api

  app.enableCors({
    origin: ['https://servis-ocheredey.onrender.com/'], // или укажи массив с разрешёнными доменами
    credentials: true,
  });

  // Запускаем приложение на прослушивание указанного порта
  await app.listen(PORT);
  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(`Swagger documentation available at: ${await app.getUrl()}/api_docs`); // Указываем правильный путь к Swagger
}
bootstrap();
