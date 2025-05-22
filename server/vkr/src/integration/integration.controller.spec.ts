// src/integration/integration.controller.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { IntegrationController } from './integration.controller';
import { MessageProcessingFacade } from './integration.facade';
import { Response, Request } from 'express';
import { BadRequestException, HttpStatus } from '@nestjs/common';
import { CreateEntryDto } from '../entries/dto/create-entry.dto'; // Предполагаемый DTO

// Импортируем реальные классы адаптеров, чтобы instanceof работал
import { InternalToXmlAdapter } from '../adapters/outbound/internal-to-xml.adapter';
import { InternalToJsonAdapter } from '../adapters/outbound/internal-to-json.adapter';

// --- Мок-классы для адаптеров ---
class MockInternalToXmlAdapter extends InternalToXmlAdapter {
  constructor() { super(); }
}

class MockInternalToJsonAdapter extends InternalToJsonAdapter {
  constructor() { super(); }
}

describe('IntegrationController', () => {
  let controller: IntegrationController;
  let messageProcessingFacade: MessageProcessingFacade;
  let mockInternalToXmlAdapter: MockInternalToXmlAdapter;
  let mockInternalToJsonAdapter: MockInternalToJsonAdapter;

  // Мокируем объекты Express Request и Response
  const mockResponse = () => {
    const res: Partial<Response> = {
      setHeader: jest.fn(),
      send: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    return res as Response;
  };

  const mockRequest = (
    body: any,
    contentType: string = 'application/json',
    rawBody?: Buffer,
  ): Request => {
    const req: Partial<Request> = {
      body: body,
      headers: {
        'content-type': contentType,
      },
      rawBody: rawBody,
    };
    return req as Request;
  };

  beforeEach(async () => {
    const mockAdapterFactory = {
      getOutboundAdapter: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [IntegrationController],
      providers: [
        {
          provide: MessageProcessingFacade,
          useValue: {
            processMessage: jest.fn(),
            adapterFactory: mockAdapterFactory,
          },
        },
        { provide: InternalToXmlAdapter, useClass: MockInternalToXmlAdapter },
        { provide: InternalToJsonAdapter, useClass: MockInternalToJsonAdapter },
      ],
    }).compile();

    controller = module.get<IntegrationController>(IntegrationController);
    messageProcessingFacade = module.get<MessageProcessingFacade>(MessageProcessingFacade);
    mockInternalToXmlAdapter = module.get<MockInternalToXmlAdapter>(InternalToXmlAdapter);
    mockInternalToJsonAdapter = module.get<MockInternalToJsonAdapter>(InternalToJsonAdapter);

    (messageProcessingFacade as any)['adapterFactory'].getOutboundAdapter.mockImplementation((acceptHeader: string) => {
      if (acceptHeader && acceptHeader.includes('application/xml')) {
        return mockInternalToXmlAdapter;
      }
      return mockInternalToJsonAdapter;
    });

    jest.clearAllMocks();
  });

  it('контроллер должен быть определен', () => {
    expect(controller).toBeDefined();
  });

  describe('handleIntegrationRequest (JSON Input, JSON Output)', () => {
    it('должен обработать JSON-вход и вернуть JSON-ответ', async () => {
      const inputJson: CreateEntryDto = {
        queueId: 1,
        date: '2025-05-25',
        time: '10:00',
        comment: 'Test JSON entry',
      };
      const facadeOutputObject = {
        message: 'Запись успешно создана',
        entryId: 7,
        queueId: 1,
        userId: 2,
        status: 'waiting',
      };
      const facadeOutputString = JSON.stringify(facadeOutputObject);

      jest.spyOn(messageProcessingFacade, 'processMessage').mockResolvedValue(facadeOutputString);

      const req = mockRequest(inputJson, 'application/json');
      req.headers['accept'] = 'application/json';
      const res = mockResponse();

      const result = await controller.handleIntegrationRequest(
        req.headers['content-type'] as string,
        req.headers['accept'] as string,
        res,
        req,
      );

      expect(messageProcessingFacade.processMessage).toHaveBeenCalledWith(
        JSON.stringify(inputJson),
        'application/json',
        'application/json',
      );
      expect((messageProcessingFacade as any)['adapterFactory'].getOutboundAdapter).toHaveBeenCalledWith('application/json');
      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
      expect(result).toEqual(facadeOutputString);
      expect(res.send).not.toHaveBeenCalled();
    });

    it('должен обработать JSON-вход и вернуть JSON-ответ (без Accept header, дефолт)', async () => {
      const inputJson: CreateEntryDto = {
        queueId: 1,
        date: '2025-05-25',
        time: '10:00',
        comment: 'Test JSON entry',
      };
      const facadeOutputObject = {
        message: 'Запись успешно создана',
        entryId: 7,
        queueId: 1,
        userId: 2,
        status: 'waiting',
      };
      const facadeOutputString = JSON.stringify(facadeOutputObject);

      jest.spyOn(messageProcessingFacade, 'processMessage').mockResolvedValue(facadeOutputString);

      const req = mockRequest(inputJson, 'application/json');
      const res = mockResponse();

      const result = await controller.handleIntegrationRequest(
        req.headers['content-type'] as string,
        undefined,
        res,
        req,
      );

      expect(messageProcessingFacade.processMessage).toHaveBeenCalledWith(
        JSON.stringify(inputJson),
        'application/json',
        undefined,
      );
      expect((messageProcessingFacade as any)['adapterFactory'].getOutboundAdapter).toHaveBeenCalledWith(undefined);
      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
      expect(result).toEqual(facadeOutputString);
      expect(res.send).not.toHaveBeenCalled();
    });
  });

  describe('handleIntegrationRequest (XML Input, JSON Output)', () => {
    it('должен обработать XML-вход (req.body string) и вернуть JSON-ответ', async () => {
      const inputXml = '<entry><queueId>1</queueId><userId>2</userId><date>2025-05-25</date><time>10:00</time><comment>Test XML entry</comment></entry>';
      const facadeOutputObject = {
        message: 'Запись успешно создана из XML',
        entryId: 8,
        queueId: 1,
        userId: 2,
        status: 'waiting',
      };
      const facadeOutputString = JSON.stringify(facadeOutputObject);

      jest.spyOn(messageProcessingFacade, 'processMessage').mockResolvedValue(facadeOutputString);

      const req = mockRequest(inputXml, 'application/xml');
      req.headers['accept'] = 'application/json';
      const res = mockResponse();

      const result = await controller.handleIntegrationRequest(
        req.headers['content-type'] as string,
        req.headers['accept'] as string,
        res,
        req,
      );

      expect(messageProcessingFacade.processMessage).toHaveBeenCalledWith(
        inputXml,
        'application/xml',
        'application/json',
      );
      expect((messageProcessingFacade as any)['adapterFactory'].getOutboundAdapter).toHaveBeenCalledWith('application/json');
      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
      expect(result).toEqual(facadeOutputString);
      expect(res.send).not.toHaveBeenCalled();
    });

    it('должен обработать XML-вход (req.rawBody Buffer) и вернуть JSON-ответ', async () => {
      const inputXml = '<entry><queueId>1</queueId><userId>2</userId><date>2025-05-25</date><time>10:00</time><comment>Test XML entry</comment></entry>';
      const facadeOutputObject = {
        message: 'Запись успешно создана из XML',
        entryId: 8,
        queueId: 1,
        userId: 2,
        status: 'waiting',
      };
      const facadeOutputString = JSON.stringify(facadeOutputObject);

      jest.spyOn(messageProcessingFacade, 'processMessage').mockResolvedValue(facadeOutputString);

      // ИСПРАВЛЕНО: req.body = null, чтобы активировать логику rawBody
      const req = mockRequest(null, 'application/xml', Buffer.from(inputXml, 'utf8'));
      req.headers['accept'] = 'application/json';
      const res = mockResponse();

      const result = await controller.handleIntegrationRequest(
        req.headers['content-type'] as string,
        req.headers['accept'] as string,
        res,
        req,
      );

      expect(messageProcessingFacade.processMessage).toHaveBeenCalledWith(
        inputXml,
        'application/xml',
        'application/json',
      );
      expect((messageProcessingFacade as any)['adapterFactory'].getOutboundAdapter).toHaveBeenCalledWith('application/json');
      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
      expect(result).toEqual(facadeOutputString);
      expect(res.send).not.toHaveBeenCalled();
    });

    it('должен обработать text/xml-вход и вернуть JSON-ответ', async () => {
      const inputXml = '<entry><queueId>1</queueId><userId>2</userId><date>2025-05-25</date><time>10:00</time><comment>Test text/xml entry</comment></entry>';
      const facadeOutputObject = {
        message: 'Запись успешно создана из text/xml',
        entryId: 9,
        queueId: 1,
        userId: 2,
        status: 'waiting',
      };
      const facadeOutputString = JSON.stringify(facadeOutputObject);

      jest.spyOn(messageProcessingFacade, 'processMessage').mockResolvedValue(facadeOutputString);

      const req = mockRequest(inputXml, 'text/xml');
      req.headers['accept'] = 'application/json';
      const res = mockResponse();

      const result = await controller.handleIntegrationRequest(
        req.headers['content-type'] as string,
        req.headers['accept'] as string,
        res,
        req,
      );

      expect(messageProcessingFacade.processMessage).toHaveBeenCalledWith(
        inputXml,
        'text/xml',
        'application/json',
      );
      expect((messageProcessingFacade as any)['adapterFactory'].getOutboundAdapter).toHaveBeenCalledWith('application/json');
      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
      expect(result).toEqual(facadeOutputString);
      expect(res.send).not.toHaveBeenCalled();
    });
  });

  describe('handleIntegrationRequest (JSON Input, XML Output)', () => {
    it('должен обработать JSON-вход и вернуть XML-ответ', async () => {
      const inputJson: CreateEntryDto = {
        queueId: 1,
        date: '2025-05-25',
        time: '10:00',
        comment: 'Test JSON entry for XML output',
      };
      const facadeOutputXmlString = '<response><message>Запись успешно создана</message><entryId>10</entryId><queueId>1</queueId><userId>2</userId><status>waiting</status></response>';

      jest.spyOn(messageProcessingFacade, 'processMessage').mockResolvedValue(facadeOutputXmlString);

      const req = mockRequest(inputJson, 'application/json');
      req.headers['accept'] = 'application/xml';
      const res = mockResponse();

      const result = await controller.handleIntegrationRequest(
        req.headers['content-type'] as string,
        req.headers['accept'] as string,
        res,
        req,
      );

      expect(messageProcessingFacade.processMessage).toHaveBeenCalledWith(
        JSON.stringify(inputJson),
        'application/json',
        'application/xml',
      );
      expect((messageProcessingFacade as any)['adapterFactory'].getOutboundAdapter).toHaveBeenCalledWith('application/xml');
      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/xml');
      expect(result).toEqual(facadeOutputXmlString);
      expect(res.send).not.toHaveBeenCalled();
    });
  });

  describe('handleIntegrationRequest (XML Input, XML Output)', () => {
    it('должен обработать XML-вход и вернуть XML-ответ', async () => {
      const inputXml = '<request><queueId>1</queueId><userId>2</userId><data>XML data</data></request>';
      const facadeOutputXmlString = '<response><message>Запись успешно создана из XML</message><entryId>11</entryId><queueId>1</queueId><userId>2</userId><status>waiting</status></response>';

      jest.spyOn(messageProcessingFacade, 'processMessage').mockResolvedValue(facadeOutputXmlString);

      const req = mockRequest(inputXml, 'application/xml');
      req.headers['accept'] = 'application/xml';
      const res = mockResponse();

      const result = await controller.handleIntegrationRequest(
        req.headers['content-type'] as string,
        req.headers['accept'] as string,
        res,
        req,
      );

      expect(messageProcessingFacade.processMessage).toHaveBeenCalledWith(
        inputXml,
        'application/xml',
        'application/xml',
      );
      expect((messageProcessingFacade as any)['adapterFactory'].getOutboundAdapter).toHaveBeenCalledWith('application/xml');
      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/xml');
      expect(result).toEqual(facadeOutputXmlString);
      expect(res.send).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('должен вернуть BadRequestException для неподдерживаемого Content-Type', async () => {
      const inputData = { some: 'data' };
      const req = mockRequest(inputData, 'text/plain'); // Неподдерживаемый Content-Type
      req.headers['accept'] = 'application/json';
      const res = mockResponse();

      const result = await controller.handleIntegrationRequest(
        req.headers['content-type'] as string,
        req.headers['accept'] as string,
        res,
        req,
      );

      // processMessage НЕ должен быть вызван, так как контроллер возвращает ошибку раньше
      expect(messageProcessingFacade.processMessage).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(result).toEqual({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Неподдерживаемый Content-Type: text/plain',
        error: 'Bad Request',
      });
      expect(res.send).not.toHaveBeenCalled();
    });

    it('должен вернуть BadRequestException для неподдерживаемого Accept header', async () => {
      const inputData: CreateEntryDto = {
        queueId: 1,
        date: '2025-05-25',
        time: '10:00',
        comment: 'Test',
      };
      const req = mockRequest(inputData, 'application/json');
      req.headers['accept'] = 'text/html'; // Неподдерживаемый Accept header
      const res = mockResponse();

      const result = await controller.handleIntegrationRequest(
        req.headers['content-type'] as string,
        req.headers['accept'] as string,
        res,
        req,
      );

      // processMessage НЕ должен быть вызван, так как контроллер возвращает ошибку раньше
      expect(messageProcessingFacade.processMessage).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(result).toEqual({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Неподдерживаемый Accept header: text/html',
        error: 'Bad Request',
      });
      expect(res.send).not.toHaveBeenCalled();
    });

    it('должен обработать ошибки от фасада (например, BadRequestException) и вернуть JSON-ошибку', async () => {
      const inputJson: CreateEntryDto = {
        queueId: 1,
        date: '2025-05-25',
        time: '10:00',
        comment: 'Invalid data',
      };
      const errorMessage = 'Некорректные входные данные.';
      jest.spyOn(messageProcessingFacade, 'processMessage').mockRejectedValue(new BadRequestException(errorMessage));

      const req = mockRequest(inputJson, 'application/json');
      req.headers['accept'] = 'application/json';
      const res = mockResponse();

      const result = await controller.handleIntegrationRequest(
        req.headers['content-type'] as string,
        req.headers['accept'] as string,
        res,
        req,
      );

      expect(messageProcessingFacade.processMessage).toHaveBeenCalledWith(
        JSON.stringify(inputJson),
        'application/json',
        'application/json',
      );
      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(result).toEqual({
        statusCode: HttpStatus.BAD_REQUEST,
        message: errorMessage,
        error: 'Bad Request',
      });
      expect(res.send).not.toHaveBeenCalled();
    });

    it('должен обработать ошибки от фасада и вернуть XML-ошибку, если Accept: application/xml', async () => {
      const inputJson: CreateEntryDto = {
        queueId: 1,
        date: '2025-05-25',
        time: '10:00',
        comment: 'Invalid data',
      };
      const errorMessage = 'Некорректные входные данные.';
      jest.spyOn(messageProcessingFacade, 'processMessage').mockRejectedValue(new BadRequestException(errorMessage));

      const req = mockRequest(inputJson, 'application/json');
      req.headers['accept'] = 'application/xml';
      const res = mockResponse();

      const result = await controller.handleIntegrationRequest(
        req.headers['content-type'] as string,
        req.headers['accept'] as string,
        res,
        req,
      );

      expect(messageProcessingFacade.processMessage).toHaveBeenCalledWith(
        JSON.stringify(inputJson),
        'application/json',
        'application/xml',
      );
      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(result).toEqual({
        statusCode: HttpStatus.BAD_REQUEST,
        message: errorMessage,
        error: 'Bad Request',
      });
      expect(res.send).not.toHaveBeenCalled();
    });

    it('должен корректно обрабатывать пустой req.body для XML Content-Type, если rawBody присутствует', async () => {
      const inputXml = '<data>some xml</data>';
      jest.spyOn(messageProcessingFacade, 'processMessage').mockResolvedValue('OK');

      // ИСПРАВЛЕНО: req.body = null, чтобы активировать логику rawBody
      const req = mockRequest(null, 'application/xml', Buffer.from(inputXml));
      req.headers['accept'] = 'application/json';
      const res = mockResponse();

      const result = await controller.handleIntegrationRequest(
        req.headers['content-type'] as string,
        req.headers['accept'] as string,
        res,
        req,
      );

      expect(messageProcessingFacade.processMessage).toHaveBeenCalledWith(inputXml, 'application/xml', 'application/json');
      expect(result).toBe('OK');
    });

    it('должен корректно обрабатывать пустой req.body для JSON Content-Type, если rawBody присутствует', async () => {
      const inputJson = '{"data": "some json"}';
      jest.spyOn(messageProcessingFacade, 'processMessage').mockResolvedValue('OK');

      // ИСПРАВЛЕНО: req.body = null, чтобы активировать логику rawBody
      const req = mockRequest(null, 'application/json', Buffer.from(inputJson));
      req.headers['accept'] = 'application/json';
      const res = mockResponse();

      const result = await controller.handleIntegrationRequest(
        req.headers['content-type'] as string,
        req.headers['accept'] as string,
        res,
        req,
      );

      expect(messageProcessingFacade.processMessage).toHaveBeenCalledWith(inputJson, 'application/json', 'application/json');
      expect(result).toBe('OK');
    });

    it('должен корректно обрабатывать пустой req.body для generic Content-Type, если rawBody присутствует', async () => {
      const inputGeneric = 'plain text data';
      jest.spyOn(messageProcessingFacade, 'processMessage').mockResolvedValue('OK');

      // ИСПРАВЛЕНО: req.body = null, чтобы активировать логику rawBody
      const req = mockRequest(null, 'text/plain', Buffer.from(inputGeneric));
      req.headers['accept'] = 'application/json';
      const res = mockResponse();

      const result = await controller.handleIntegrationRequest(
        req.headers['content-type'] as string,
        req.headers['accept'] as string,
        res,
        req,
      );

      expect(messageProcessingFacade.processMessage).toHaveBeenCalledWith(inputGeneric, 'text/plain', 'application/json');
      expect(result).toBe('OK');
    });

    it('должен корректно обрабатывать пустой req.body и rawBody для XML Content-Type', async () => {
      jest.spyOn(messageProcessingFacade, 'processMessage').mockResolvedValue('');

      const req = mockRequest({}, 'application/xml', undefined); // req.body = {}, rawBody = undefined
      req.headers['accept'] = 'application/json';
      const res = mockResponse();

      const result = await controller.handleIntegrationRequest(
        req.headers['content-type'] as string,
        req.headers['accept'] as string,
        res,
        req,
      );

      // ИСПРАВЛЕНО: Ожидаем "{}" если req.body был {}, а rawBody отсутствовал
      expect(messageProcessingFacade.processMessage).toHaveBeenCalledWith(JSON.stringify({}), 'application/xml', 'application/json');
      expect(result).toBe('');
    });

    it('должен корректно обрабатывать пустой req.body и rawBody для JSON Content-Type', async () => {
      jest.spyOn(messageProcessingFacade, 'processMessage').mockResolvedValue('');

      const req = mockRequest({}, 'application/json', undefined); // req.body = {}, rawBody = undefined
      req.headers['accept'] = 'application/json';
      const res = mockResponse();

      const result = await controller.handleIntegrationRequest(
        req.headers['content-type'] as string,
        req.headers['accept'] as string,
        res,
        req,
      );

      // ИСПРАВЛЕНО: Ожидаем "{}" если req.body был {}, а rawBody отсутствовал
      expect(messageProcessingFacade.processMessage).toHaveBeenCalledWith(JSON.stringify({}), 'application/json', 'application/json');
      expect(result).toBe('');
    });
  });
});
