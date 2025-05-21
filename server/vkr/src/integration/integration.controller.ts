// src/integration/integration.controller.ts
import { Controller, Post, Headers, Res, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { MessageProcessingFacade } from './integration.facade';
import { Response, Request } from 'express';
import { ApiTags, ApiConsumes, ApiProduces, ApiResponse, ApiBody, getSchemaPath } from '@nestjs/swagger'; // Добавляем ApiProduces

import { InternalToXmlAdapter } from '../adapters/outbound/internal-to-xml.adapter';
import { InternalToJsonAdapter } from '../adapters/outbound/internal-to-json.adapter';

import { CreateEntryDto } from '../entries/dto/create-entry.dto'; // Предполагаемый DTO

@ApiTags('integrate')
@Controller('integrate')
export class IntegrationController {
  constructor(private readonly messageProcessingFacade: MessageProcessingFacade) {}

  @Post('process')
  @HttpCode(HttpStatus.OK)
  @ApiConsumes('application/json', 'application/xml', 'text/xml') // Заявленные форматы для входящих данных
  @ApiProduces('application/json', 'application/xml') // <--- НОВОЕ: Заявленные форматы для исходящих данных
  @ApiResponse({
    status: 200,
    description: 'Сообщение успешно обработано.',
    // Важно: явно указываем content для каждого типа ответа
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Запись успешно создана' },
            entryId: { type: 'number', example: 7 },
            queueId: { type: 'number', example: 1 }, // Добавляем поля, которые могут быть в ответе
            userId: { type: 'number', example: 2 },
            status: { type: 'string', example: 'waiting' },
          },
        },
      },
      'application/xml': {
        schema: {
          type: 'string',
          format: 'xml',
          example: '<response><message>Запись успешно создана</message><entryId>7</entryId><queueId>1</queueId><userId>2</userId><status>waiting</status></response>',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Некорректный запрос или неподдерживаемый формат.',
    content: { // Также явно указываем контент для ошибок
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            statusCode: { type: 'number', example: 400 },
            message: { type: 'string', example: 'Неверный формат XML: ...' },
            error: { type: 'string', example: 'Bad Request' },
          },
        },
      },
      'application/xml': {
        schema: {
          type: 'string',
          format: 'xml',
          example: '<error><statusCode>400</statusCode><message>Неверный формат XML: ...</message><error>Bad Request</error></error>',
        },
      },
    },
  })
  @ApiBody({
    description: 'Тело запроса для обработки внешних данных. Может быть в JSON или XML.',
    schema: {
      oneOf: [
        {
          title: 'JSON Request Body',
          $ref: getSchemaPath(CreateEntryDto),
          example: {
            queueId: 123,
            userId: 456,
            someExternalData: 'Пример JSON данных',
          },
        },
        {
          title: 'XML Request Body',
          type: 'string',
          format: 'xml',
          example: '<externalRequest><queueId>789</queueId><userId>101</userId><externalField>Значение из XML</externalField></externalRequest>',
        },
      ],
    },
  })
  async handleIntegrationRequest(
    @Headers('content-type') contentType: string,
    @Headers('accept') acceptHeader: string,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ): Promise<string | object> {
    let actualRawData: string = '';

    console.log(`[IntegrationController]: Debugging request body...`);
    console.log(`[IntegrationController]: req.body type: ${typeof req.body}, value: ${JSON.stringify(req.body).substring(0, 100)}...`);
    console.log(`[IntegrationController]: req.rawBody type: ${req.rawBody instanceof Buffer ? 'Buffer' : typeof req.rawBody}, length: ${req.rawBody instanceof Buffer ? req.rawBody.length : 0}`);

    if (contentType && (contentType.includes('application/xml') || contentType.includes('text/xml'))) {
      if (typeof req.body === 'string' && req.body.trim().length > 0) {
        actualRawData = req.body;
        console.log('[IntegrationController]: Using req.body (string) for XML.');
      } else if (req.rawBody instanceof Buffer && req.rawBody.length > 0) {
        actualRawData = req.rawBody.toString('utf8');
        console.log('[IntegrationController]: Using req.rawBody (Buffer) for XML as fallback.');
      } else {
        console.warn('[IntegrationController]: XML body is empty or not captured correctly for XML Content-Type.');
      }
    } else if (contentType && contentType.includes('application/json')) {
      if (typeof req.body === 'object' && req.body !== null) {
        actualRawData = JSON.stringify(req.body);
        console.log('[IntegrationController]: Using req.body (object) for JSON, stringifying.');
      } else if (typeof req.body === 'string' && req.body.trim().length > 0) {
        actualRawData = req.body;
        console.log('[IntegrationController]: Using req.body (string) for JSON, no stringify needed.');
      } else if (req.rawBody instanceof Buffer && req.rawBody.length > 0) {
        actualRawData = req.rawBody.toString('utf8');
        console.log('[IntegrationController]: Using req.rawBody (Buffer) for JSON as fallback.');
      } else {
        console.warn('[IntegrationController]: JSON body is empty or not captured correctly for JSON Content-Type.');
      }
    } else {
      if (typeof req.body === 'string' && req.body.trim().length > 0) {
        actualRawData = req.body;
        console.log('[IntegrationController]: Using req.body (string) for generic content.');
      } else if (req.rawBody instanceof Buffer && req.rawBody.length > 0) {
        actualRawData = req.rawBody.toString('utf8');
        console.log('[IntegrationController]: Using req.rawBody (Buffer) for generic content.');
      } else {
        console.warn('[IntegrationController]: Could not determine raw data from req.body or req.rawBody for generic content.');
      }
    }

    console.log(`[IntegrationController]: Итоговые сырые данные для адаптера (первые 100 символов): "${actualRawData.substring(0, 100)}..."`);
    console.log(`[IntegrationController]: Длина итоговых rawData: ${actualRawData.length}`);
    console.log(`[IntegrationController]: Content-Type: ${contentType}, Accept: ${acceptHeader}`);

    try {
      const responseData = await this.messageProcessingFacade.processMessage(
        actualRawData,
        contentType,
        acceptHeader,
      );

      const outboundAdapter = this.messageProcessingFacade['adapterFactory'].getOutboundAdapter(acceptHeader);
      if (outboundAdapter instanceof InternalToXmlAdapter) {
        res.setHeader('Content-Type', 'application/xml');
      } else if (outboundAdapter instanceof InternalToJsonAdapter) {
        res.setHeader('Content-Type', 'application/json');
      }

      // Возвращаем простой объект или строку, которую адаптер уже сформировал
      // Для успешного ответа можно вернуть что-то вроде:
      return responseData; // Фасад уже возвращает строку (XML или JSON)
    } catch (error) {
      console.error(`[IntegrationController]: Ошибка при обработке запроса: ${error.message}`);
      res.status(HttpStatus.BAD_REQUEST);
      // Возвращаем объект ошибки, который будет сериализован в JSON или XML
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: error.message,
        error: 'Bad Request',
      };
    }
  }
}
