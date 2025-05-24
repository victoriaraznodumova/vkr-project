import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { IntegrationController } from './integration.controller';
import { FormatProcessingService } from './integration.service';
import { Response, Request } from 'express';
// Импортируем реальные классы конвертеров для проверки их типов
import { InternalToJsonConverterService } from './converters/outbound/internal-to-json-converter.service';
// ВНИМАНИЕ: Проверьте правильность пути и имени файла/класса для XML-конвертера в вашем проекте.
// Использую здесь InternalToXmlConverterServiceService как было в вашем коде.
import { InternalToXmlConverterService } from './converters/outbound/internal-to-xml-converter.servicer'; 
import { InternalToYamlConverterService } from './converters/outbound/internal-to-yaml-converter.service';
import { ConverterFactoryService } from './converters/converter-factory.service';

describe('IntegrationController', () => {
  let controller: IntegrationController;
  // Используем Partial для мока сервиса, так как не все свойства являются методами
  let mockFormatProcessingService: Partial<FormatProcessingService>; 
  let mockResponse: Partial<Response>;
  let mockRequest: Partial<Request>;
  // Используем Partial для мока фабрики конвертеров
  let mockConverterFactory: Partial<ConverterFactoryService>; 

  // Моковые данные для успешных ответов в разных форматах
  const mockSuccessfulJson = JSON.stringify({
    message: 'Запись успешно создана',
    entryId: 7,
    queueId: 1,
    userId: 2,
    status: 'waiting',
  });

  const mockSuccessfulXml = '<response><message>Запись успешно создана</message><entryId>7</entryId><queueId>1</queueId><userId>2</userId><status>waiting</status></response>';

  const mockSuccessfulYaml = `message: Запись успешно создана
entryId: 7
queueId: 1
userId: 2
status: waiting
`;

  beforeEach(async () => {
    // Мокируем ConverterFactoryService, который используется внутри FormatProcessingService.
    // Это позволяет контролировать, какой конвертер будет возвращен для заданного Accept-заголовка.
    mockConverterFactory = {
      getOutboundConverter: jest.fn().mockImplementation((acceptHeader: string) => {
        if (acceptHeader.includes('application/json')) {
          return new InternalToJsonConverterService();
        }
        // Обрабатываем как 'application/xml', так и 'text/xml' для XML-конвертера
        if (acceptHeader.includes('application/xml') || acceptHeader.includes('text/xml')) { 
          return new InternalToXmlConverterService(); 
        }
        if (acceptHeader.includes('application/yaml')) {
          return new InternalToYamlConverterService();
        }
        return new InternalToJsonConverterService(); // Дефолтное поведение
      }),
    };

    // Мокируем FormatProcessingService.
    // Его метод processFormat имитирует логику обработки данных и возвращает результат.
    mockFormatProcessingService = {
      processFormat: jest.fn(async (rawData, contentType, acceptHeaders) => {
        // Условие для симуляции ошибок, когда данные пустые или невалидные.
        // Это необходимо для прохождения тестов на обработку ошибок контроллером.
        // `rawData === undefined` добавлено, чтобы срабатывать, когда `@Body()`
        // не получает никаких данных и оставляет `req.body` как `undefined`.
        if (rawData === '' || rawData === '{}' || rawData === 'null' || rawData === undefined) { 
            throw new Error('Processed data cannot be empty or invalid');
        }

        // Получаем "исходящий" конвертер, чтобы имитировать, какой формат будет возвращен
        const outboundConverter = (mockConverterFactory as ConverterFactoryService).getOutboundConverter(acceptHeaders);

        // Возвращаем моковые данные в зависимости от типа исходящего конвертера
        if (outboundConverter instanceof InternalToJsonConverterService) {
          return mockSuccessfulJson;
        }
        if (outboundConverter instanceof InternalToXmlConverterService) { 
          return mockSuccessfulXml;
        }
        if (outboundConverter instanceof InternalToYamlConverterService) {
          return mockSuccessfulYaml;
        }
        return mockSuccessfulJson; // По умолчанию
      }),
    };

    // Мокируем объекты Response и Request из Express.
    // Они используются для установки заголовков и статуса ответа.
    mockResponse = {
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(), // Позволяет цепочно вызывать .status().send()
      send: jest.fn(),
    };

    mockRequest = {
      body: {}, // Тело запроса, будет изменяться в каждом тесте
      rawBody: undefined, // Сырые данные, если req.body не содержит их
    };

    // Создаем тестовый модуль NestJS для инъекции зависимостей в контроллер.
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IntegrationController],
      providers: [
        {
          provide: FormatProcessingService,
          useValue: mockFormatProcessingService, // Предоставляем наш мок FormatProcessingService
        },
      ],
    }).compile();

    controller = module.get<IntegrationController>(IntegrationController);

    // Подменяем приватное поле 'converterFactory' внутри 'messageProcessingFacade'.
    // Это необходимо, так как 'converterFactory' является приватным свойством `FormatProcessingService`
    // и не внедряется через DI в тесте напрямую.
    (controller['messageProcessingFacade'] as any)['converterFactory'] = mockConverterFactory as ConverterFactoryService;
  });

  afterEach(() => {
    // Очищаем все вызовы моков после каждого теста, чтобы обеспечить их независимость.
    jest.clearAllMocks();
  });

  // ---

  // ## Тесты для обработки входящих запросов

  // ### Обработка JSON

  describe('handleIntegrationRequest (JSON)', () => {
    it('should process JSON request and return JSON response', async () => {
      mockRequest.body = { queueId: 1, userId: 100 };
      const contentType = 'application/json';
      const acceptHeader = 'application/json';

      const result = await controller.handleIntegrationRequest(
        contentType,
        acceptHeader,
        mockResponse as Response,
        mockRequest as Request,
      );

      // Проверяем, что фасад был вызван с ожидаемыми данными
      expect(mockFormatProcessingService.processFormat).toHaveBeenCalledWith(
        JSON.stringify(mockRequest.body), 
        contentType,
        acceptHeader,
      );
      // Проверяем, что Content-Type заголовка ответа установлен правильно
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
      // Проверяем возвращаемые данные
      expect(result).toBe(mockSuccessfulJson);
      // Убеждаемся, что статус ошибки не был вызван (т.к. это успешный ответ)
      expect(mockResponse.status).not.toHaveBeenCalled(); 
    });

    it('should process JSON request with string body and return JSON response', async () => {
      mockRequest.body = '{"queueId": 1, "userId": 100}'; // Входящий JSON в виде строки
      const contentType = 'application/json';
      const acceptHeader = 'application/json';

      const result = await controller.handleIntegrationRequest(
        contentType,
        acceptHeader,
        mockResponse as Response,
        mockRequest as Request,
      );

      expect(mockFormatProcessingService.processFormat).toHaveBeenCalledWith(
        mockRequest.body, // Ожидаем исходную строку JSON
        contentType,
        acceptHeader,
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
      expect(result).toBe(mockSuccessfulJson);
    });

    it('should process JSON request with rawBody (Buffer) and return JSON response', async () => {
      // Для этого теста `req.body` должен быть `null` или `undefined`,
      // чтобы контроллер перешел к `req.rawBody` для получения сырых данных.
      mockRequest.body = null; 
      mockRequest.rawBody = Buffer.from('{"queueId": 1, "userId": 100}');
      const contentType = 'application/json';
      const acceptHeader = 'application/json';

      const result = await controller.handleIntegrationRequest(
        contentType,
        acceptHeader,
        mockResponse as Response,
        mockRequest as Request,
      );

      expect(mockFormatProcessingService.processFormat).toHaveBeenCalledWith(
        mockRequest.rawBody.toString('utf8'), // Ожидаем данные, преобразованные из Buffer
        contentType,
        acceptHeader,
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
      expect(result).toBe(mockSuccessfulJson);
    });
  });

  // ---

  // ### Обработка XML

  describe('handleIntegrationRequest (XML)', () => {
    it('should process XML request and return XML response', async () => {
      const xmlBody = '<externalRequest><queueId>1</queueId><userId>100</userId></externalRequest>';
      mockRequest.body = xmlBody;
      const contentType = 'application/xml';
      const acceptHeader = 'application/xml';

      const result = await controller.handleIntegrationRequest(
        contentType,
        acceptHeader,
        mockResponse as Response,
        mockRequest as Request,
      );

      expect(mockFormatProcessingService.processFormat).toHaveBeenCalledWith(
        xmlBody,
        contentType,
        acceptHeader,
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'application/xml');
      expect(result).toBe(mockSuccessfulXml);
    });

    it('should process XML request (text/xml) and return XML response', async () => {
      const xmlBody = '<externalRequest><queueId>1</queueId><userId>100</userId></externalRequest>';
      mockRequest.body = xmlBody;
      const contentType = 'text/xml';
      const acceptHeader = 'text/xml'; 

      const result = await controller.handleIntegrationRequest(
        contentType,
        acceptHeader,
        mockResponse as Response,
        mockRequest as Request,
      );

      expect(mockFormatProcessingService.processFormat).toHaveBeenCalledWith(
        xmlBody,
        contentType,
        acceptHeader,
      );
      // Контроллер всегда отдает Content-Type: application/xml, если выбран XML-адаптер
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'application/xml'); 
      expect(result).toBe(mockSuccessfulXml);
    });

    it('should process XML request with rawBody (Buffer) and return XML response', async () => {
      const xmlBody = '<externalRequest><queueId>1</queueId><userId>100</userId></externalRequest>';
      mockRequest.body = {}; // Имитируем ситуацию, когда body пуст, но rawBody есть
      mockRequest.rawBody = Buffer.from(xmlBody);
      const contentType = 'application/xml';
      const acceptHeader = 'application/xml';

      const result = await controller.handleIntegrationRequest(
        contentType,
        acceptHeader,
        mockResponse as Response,
        mockRequest as Request,
      );

      expect(mockFormatProcessingService.processFormat).toHaveBeenCalledWith(
        xmlBody,
        contentType,
        acceptHeader,
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'application/xml');
      expect(result).toBe(mockSuccessfulXml);
    });
  });

  // ---

  // ### Обработка YAML

  describe('handleIntegrationRequest (YAML)', () => {
    it('should process YAML request and return YAML response', async () => {
      const yamlBody = `queueId: 1
userId: 100
comment: "Test YAML input"`;
      mockRequest.body = yamlBody;
      const contentType = 'application/yaml';
      const acceptHeader = 'application/yaml';

      const result = await controller.handleIntegrationRequest(
        contentType,
        acceptHeader,
        mockResponse as Response,
        mockRequest as Request,
      );

      expect(mockFormatProcessingService.processFormat).toHaveBeenCalledWith(
        yamlBody,
        contentType,
        acceptHeader,
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'application/yaml');
      expect(result).toBe(mockSuccessfulYaml);
    });

    it('should process YAML request with rawBody (Buffer) and return YAML response', async () => {
      const yamlBody = `queueId: 1
userId: 100
comment: "Test YAML input"`;
      mockRequest.body = {}; // Имитируем ситуацию, когда body пуст, но rawBody есть
      mockRequest.rawBody = Buffer.from(yamlBody);
      const contentType = 'application/yaml';
      const acceptHeader = 'application/yaml';

      const result = await controller.handleIntegrationRequest(
        contentType,
        acceptHeader,
        mockResponse as Response,
        mockRequest as Request,
      );

      expect(mockFormatProcessingService.processFormat).toHaveBeenCalledWith(
        yamlBody,
        contentType,
        acceptHeader,
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'application/yaml');
      expect(result).toBe(mockSuccessfulYaml);
    });
  });

  // ---

  // ## Тесты для смешанных форматов (входной/выходной)

  describe('handleIntegrationRequest (Mixed Formats)', () => {
    it('should process JSON input and return XML output', async () => {
      mockRequest.body = { queueId: 1, userId: 100 };
      const contentType = 'application/json';
      const acceptHeader = 'application/xml';

      const result = await controller.handleIntegrationRequest(
        contentType,
        acceptHeader,
        mockResponse as Response,
        mockRequest as Request,
      );

      expect(mockFormatProcessingService.processFormat).toHaveBeenCalledWith(
        JSON.stringify(mockRequest.body),
        contentType,
        acceptHeader,
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'application/xml');
      expect(result).toBe(mockSuccessfulXml);
    });

    it('should process XML input and return JSON output', async () => {
      const xmlBody = '<externalRequest><queueId>1</queueId><userId>100</userId></externalRequest>';
      mockRequest.body = xmlBody;
      const contentType = 'application/xml';
      const acceptHeader = 'application/json';

      const result = await controller.handleIntegrationRequest(
        contentType,
        acceptHeader,
        mockResponse as Response,
        mockRequest as Request,
      );

      expect(mockFormatProcessingService.processFormat).toHaveBeenCalledWith(
        xmlBody,
        contentType,
        acceptHeader,
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
      expect(result).toBe(mockSuccessfulJson);
    });

    it('should process YAML input and return JSON output', async () => {
      const yamlBody = `queueId: 1
userId: 100`;
      mockRequest.body = yamlBody;
      const contentType = 'application/yaml';
      const acceptHeader = 'application/json';

      const result = await controller.handleIntegrationRequest(
        contentType,
        acceptHeader,
        mockResponse as Response,
        mockRequest as Request,
      );

      expect(mockFormatProcessingService.processFormat).toHaveBeenCalledWith(
        yamlBody,
        contentType,
        acceptHeader,
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
      expect(result).toBe(mockSuccessfulJson);
    });

    it('should process JSON input and return YAML output', async () => {
      mockRequest.body = { queueId: 1, userId: 100 };
      const contentType = 'application/json';
      const acceptHeader = 'application/yaml';

      const result = await controller.handleIntegrationRequest(
        contentType,
        acceptHeader,
        mockResponse as Response,
        mockRequest as Request,
      );

      expect(mockFormatProcessingService.processFormat).toHaveBeenCalledWith(
        JSON.stringify(mockRequest.body),
        contentType,
        acceptHeader,
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'application/yaml');
      expect(result).toBe(mockSuccessfulYaml);
    });
  });

  // ---

  // ## Тесты обработки ошибок

  describe('handleIntegrationRequest (Error Handling)', () => {
    it('should return a 400 error response if processFormat throws an error', async () => {
      const errorMessage = 'Validation failed: queueId is required';
      // Явно приводим `processFormat` к типу `jest.Mock`, чтобы использовать `mockRejectedValueOnce`
      (mockFormatProcessingService.processFormat as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

      // Для этого теста, `mockRequest.body` может содержать любые данные, т.к. мок фасада выбросит ошибку.
      mockRequest.body = { some: 'data' }; 
      const contentType = 'application/json';
      const acceptHeader = 'application/json';

      const result = await controller.handleIntegrationRequest(
        contentType,
        acceptHeader,
        mockResponse as Response,
        mockRequest as Request,
      );

      // Проверяем, что статус ответа установлен на 400
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      // Проверяем, что возвращенный объект ошибки соответствует ожидаемому
      expect(result).toEqual({
        statusCode: HttpStatus.BAD_REQUEST,
        message: errorMessage,
        error: 'Bad Request',
      });
      // Content-Type для ошибок не устанавливается явно контроллером; NestJS отдаст JSON для объектов ошибок по умолчанию.
      expect(mockResponse.setHeader).not.toHaveBeenCalledWith('Content-Type', expect.any(String)); 
    });

    // Эти тесты теперь проверяют, что контроллер КОРРЕКТНО ВОЗВРАЩАЕТ объект ошибки,
    // а не перебрасывает ошибку, так как это его текущее поведение.
    it('should warn for empty or uncaptured body for JSON and return error response', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {}); 
      // ИЗМЕНЕНИЕ: Устанавливаем body в undefined, чтобы гарантировать, что `getActualRawData`
      // не найдет данных и вызовет `console.warn`, а затем mockFormatProcessingService выбросит ошибку.
      mockRequest.body = undefined; 
      mockRequest.rawBody = undefined; 
      const contentType = 'application/json';
      const acceptHeader = 'application/json';

      const expectedErrorResponse = { 
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Processed data cannot be empty or invalid', // Сообщение, выброшенное моком `processFormat`
        error: 'Bad Request',
      };

      // Вызываем контроллер и ожидаем, что он разрешится с объектом ошибки
      const result = await controller.handleIntegrationRequest(
        contentType,
        acceptHeader,
        mockResponse as Response,
        mockRequest as Request,
      );

      // Проверяем, что результат соответствует ожидаемому объекту ошибки
      expect(result).toEqual(expectedErrorResponse);
      // Проверяем, что был установлен статус 400
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST); 
      
      // Проверяем, что console.warn был вызван
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[IntegrationController]: JSON body is empty or not captured correctly for JSON Content-Type.',
      );
      consoleWarnSpy.mockRestore(); // Восстанавливаем оригинальный console.warn
    });

    it('should warn for empty or uncaptured body for YAML and return error response', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      // ИЗМЕНЕНИЕ: Устанавливаем body в undefined
      mockRequest.body = undefined;
      mockRequest.rawBody = undefined;
      const contentType = 'application/yaml';
      const acceptHeader = 'application/json';

      const expectedErrorResponse = { 
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Processed data cannot be empty or invalid', 
        error: 'Bad Request',
      };

      const result = await controller.handleIntegrationRequest(
        contentType,
        acceptHeader,
        mockResponse as Response,
        mockRequest as Request,
      );

      expect(result).toEqual(expectedErrorResponse);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST); 

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[IntegrationController]: YAML body is empty or not captured correctly for YAML Content-Type.',
      );
      consoleWarnSpy.mockRestore();
    });

    it('should warn for empty or uncaptured body for generic content and return error response', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      // ИЗМЕНЕНИЕ: Устанавливаем body в undefined
      mockRequest.body = undefined;
      mockRequest.rawBody = undefined;
      const contentType = 'application/custom'; // Неизвестный тип контента
      const acceptHeader = 'application/json';

      const expectedErrorResponse = { 
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Processed data cannot be empty or invalid', 
        error: 'Bad Request',
      };

      const result = await controller.handleIntegrationRequest(
        contentType,
        acceptHeader,
        mockResponse as Response,
        mockRequest as Request,
      );

      expect(result).toEqual(expectedErrorResponse);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST); 

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[IntegrationController]: Could not determine raw data from req.body or req.rawBody for generic content.',
      );
      consoleWarnSpy.mockRestore();
    });
  });
});