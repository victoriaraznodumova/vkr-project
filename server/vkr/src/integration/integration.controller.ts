import { Controller, Post, Headers, Res, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { FormatProcessingService } from './integration.service';
import { Response, Request } from 'express';
// Добавляем InternalToYamlConverterService для проверки типа исходящего адаптера
import { ApiTags, ApiConsumes, ApiProduces, ApiResponse, ApiBody, getSchemaPath } from '@nestjs/swagger'; 
import { InternalToXmlConverterService } from './converters/outbound/internal-to-xml-converter.servicer';
import { InternalToJsonConverterService } from './converters/outbound/internal-to-json-converter.service';
import { InternalToYamlConverterService } from './converters/outbound/internal-to-yaml-converter.service'; // <--- НОВЫЙ ИМПОРТ
import { CreateEntryDto } from '../entries/dto/create-entry.dto';

@ApiTags('integrate')
@Controller('integrate')
export class IntegrationController {
  constructor(private readonly messageProcessingFacade: FormatProcessingService) {}

  @Post('process')
  @HttpCode(HttpStatus.OK)
  // Заявленные форматы для входящих данных: добавляем application/yaml
  @ApiConsumes('application/json', 'application/xml', 'text/xml', 'application/yaml') 
  // Заявленные форматы для исходящих данных: добавляем application/yaml
  @ApiProduces('application/json', 'application/xml', 'application/yaml') 
  @ApiResponse({
    status: 200,
    description: 'Сообщение успешно обработано.',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Запись успешно создана' },
            entryId: { type: 'number', example: 7 },
            queueId: { type: 'number', example: 1 },
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
      // Добавляем пример для YAML успешного ответа
      'application/yaml': { // <--- НОВОЕ: Схема для YAML ответа
        schema: {
          type: 'string',
          format: 'yaml',
          example: 'message: Запись успешно создана\nentryId: 7\nqueueId: 1\nuserId: 2\nstatus: waiting',
        },
      },
    },
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Некорректный запрос или неподдерживаемый формат.',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            statusCode: { type: 'number', example: 400 },
            message: { type: 'string', example: 'Неверный формат JSON: ...' },
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
      // Добавляем пример для YAML ошибки
      'application/yaml': { // <--- НОВОЕ: Схема для YAML ошибки
        schema: {
          type: 'string',
          format: 'yaml',
          example: 'statusCode: 400\nmessage: Неверный формат YAML: ...\nerror: Bad Request',
        },
      },
    },
  })
  @ApiBody({
    description: 'Тело запроса для обработки внешних данных. Может быть в JSON, XML или YAML.',
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
        // Добавляем пример для YAML тела запроса
        { // <--- НОВОЕ: Схема для YAML запроса
          title: 'YAML Request Body',
          type: 'string',
          format: 'yaml',
          example: 'queueId: 123\nuserId: 456\nsomeExternalData: Пример YAML данных',
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
    const normalizedContentType = contentType ? contentType.toLowerCase() : ''; // Нормализуем для удобства

    // Логика извлечения сырых данных из тела запроса
    // Добавляем условие для YAML
    if (normalizedContentType.includes('application/xml') || normalizedContentType.includes('text/xml')) {
      if (typeof req.body === 'string' && req.body.trim().length > 0) {
        actualRawData = req.body;
      } else if (req.rawBody instanceof Buffer && req.rawBody.length > 0) {
        actualRawData = req.rawBody.toString('utf8');
      }
    } else if (normalizedContentType.includes('application/json')) {
      if (typeof req.body === 'object' && req.body !== null) {
        actualRawData = JSON.stringify(req.body);
      } else if (typeof req.body === 'string' && req.body.trim().length > 0) {
        actualRawData = req.body;
      } else if (req.rawBody instanceof Buffer && req.rawBody.length > 0) {
        actualRawData = req.rawBody.toString('utf8');
      }
    } else if (normalizedContentType.includes('application/yaml')) { // <--- НОВОЕ: Обработка YAML Content-Type
      if (typeof req.body === 'string' && req.body.trim().length > 0) {
        actualRawData = req.body;
      } else if (req.rawBody instanceof Buffer && req.rawBody.length > 0) {
        actualRawData = req.rawBody.toString('utf8');
      } else {
        console.warn('[IntegrationController]: YAML body is empty or not captured correctly for YAML Content-Type.');
      }
    } else {
      // Если Content-Type не распознан, пытаемся взять данные как есть (может быть текстовым телом)
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

    try {
      const responseData = await this.messageProcessingFacade.processFormat(
        actualRawData,
        contentType,
        acceptHeader,
      );

      // Устанавливаем Content-Type для ответа на основе выбранного исходящего конвертера
      const outboundConverter = this.messageProcessingFacade['converterFactory'].getOutboundConverter(acceptHeader);
      
      if (outboundConverter instanceof InternalToXmlConverterService) {
        res.setHeader('Content-Type', 'application/xml');
      } else if (outboundConverter instanceof InternalToJsonConverterService) {
        res.setHeader('Content-Type', 'application/json');
      } else if (outboundConverter instanceof InternalToYamlConverterService) { // <--- НОВОЕ: Установка Content-Type для YAML
        res.setHeader('Content-Type', 'application/yaml');
      }

      // Возвращаем данные, которые фасад уже преобразовал в нужный формат (строку или объект)
      return responseData;
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST);
      // При ошибке также пытаемся вернуть данные в запрошенном формате, если это возможно.
      // В данном случае, возвращаем объект, который NestJS по умолчанию сериализует в JSON.
      // Если нужен XML/YAML ответ для ошибки, потребуется дополнительная логика сериализации здесь.
      // Для простоты, оставим JSON по умолчанию для ошибок.
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: error.message,
        error: 'Bad Request',
      };
    }
  }
}