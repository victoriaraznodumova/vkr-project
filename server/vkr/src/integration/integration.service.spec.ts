import { Test, TestingModule } from '@nestjs/testing';
import { FormatProcessingService } from './integration.service'; // Убедитесь, что путь к файлу верный
import { ConverterFactoryService } from './converters/converter-factory.service';
import { EntryService } from '../entries/entry.service';
import { InternalFormat } from '../common/internal-format.interface';
import { Entry } from '../entries/entity/entry.entity';
import { InboundConverter } from './converters/interfaces/inbound-converter.interface';
import { OutboundConverter } from './converters/interfaces/outbound-converter.interface';

describe('FormatProcessingService', () => {
  let service: FormatProcessingService;
  // Мокирование зависимостей с использованием Jest
  let mockConverterFactoryService: jest.Mocked<ConverterFactoryService>;
  let mockEntryService: jest.Mocked<EntryService>;

  // Моковые данные
  const rawJsonData = '{"queueId": 1, "userId": 100, "date": "2025-05-24", "time": "10:00", "notificationMinutes": 10, "notificationPosition": "before"}';
  const internalFormat: InternalFormat = {
    queueId: 1,
    userId: 100,
    date: '2025-05-24',
    time: '10:00',
    notificationMinutes: 10,
    notificationPosition: 4,
  };
  const createdEntry: Entry = {
      id: 1,
      queueId: 1,
      date: new Date('2025-05-24'),
      time: '10:00',
      notificationMinutes: 10,
      notificationPosition: 'before',
      userId: 100,
      createdAt: new Date(),
      updatedAt: new Date(),
  } as unknown as Entry; // Приводим к Entry, так как Jest мок может не включать все поля
  const finalJsonResponse = '{"message":"Entry created successfully"}';

  beforeEach(async () => {
    // Определяем моки для зависимостей
    mockConverterFactoryService = {
      getInboundConverter: jest.fn(),
      getOutboundConverter: jest.fn(),
    } as unknown as jest.Mocked<ConverterFactoryService>; // Приводим к jest.Mocked

    mockEntryService = {
      create: jest.fn(),
    } as unknown as jest.Mocked<EntryService>; // Приводим к jest.Mocked

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FormatProcessingService,
        {
          provide: ConverterFactoryService,
          useValue: mockConverterFactoryService,
        },
        {
          provide: EntryService,
          useValue: mockEntryService,
        },
      ],
    }).compile();

    service = module.get<FormatProcessingService>(FormatProcessingService);
  });

  afterEach(() => {
    jest.clearAllMocks(); // Очищаем все моки после каждого теста
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('processFormat', () => {
    let mockInboundConverter: jest.Mocked<InboundConverter>;
    let mockOutboundConverter: jest.Mocked<OutboundConverter>;

    beforeEach(() => {
      // Создаем моки для адаптеров, которые будут возвращены фабрикой
      mockInboundConverter = {
        convert: jest.fn().mockResolvedValue(internalFormat),
      };
      mockOutboundConverter = {
        convert: jest.fn().mockReturnValue(finalJsonResponse),
      };

      // Настраиваем фабрику, чтобы она возвращала наши моки
      mockConverterFactoryService.getInboundConverter.mockReturnValue(mockInboundConverter);
      mockConverterFactoryService.getOutboundConverter.mockReturnValue(mockOutboundConverter);

      // Настраиваем EntryService
      mockEntryService.create.mockResolvedValue(createdEntry);

      // Шпионим за console.log/error, чтобы проверить их вызовы
      jest.spyOn(console, 'log').mockImplementation(() => {});
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      // Восстанавливаем оригинальные console.log/error
      (console.log as jest.Mock).mockRestore();
      (console.error as jest.Mock).mockRestore();
    });

    it('should successfully process a valid request from JSON to JSON', async () => {
      const contentType = 'application/json';
      const acceptHeaders = 'application/json';

      const result = await service.processFormat(rawJsonData, contentType, acceptHeaders);

      // Проверяем, что входящий конвертер был получен и использован
      expect(mockConverterFactoryService.getInboundConverter).toHaveBeenCalledWith(contentType);
      expect(mockInboundConverter.convert).toHaveBeenCalledWith(rawJsonData);

      // Проверяем, что EntryService.create был вызван с корректными данными
      expect(mockEntryService.create).toHaveBeenCalledWith(
        {
          queueId: internalFormat.queueId,
          date: internalFormat.date,
          time: internalFormat.time,
          notificationMinutes: internalFormat.notificationMinutes,
          notificationPosition: internalFormat.notificationPosition,
        },
        internalFormat.userId,
      );

      // Проверяем, что исходящий конвертер был получен и использован
      expect(mockConverterFactoryService.getOutboundConverter).toHaveBeenCalledWith(acceptHeaders);
      expect(mockOutboundConverter.convert).toHaveBeenCalledWith(createdEntry);

      // Проверяем возвращаемый результат
      expect(result).toBe(finalJsonResponse);

      // Проверяем, что были вызваны логи успеха
      expect(console.log).toHaveBeenCalledWith(
        `[FormatProcessingService]: Начало обработки сообщения. Content-Type: ${contentType}, Accept: ${acceptHeaders}`
      );
      expect(console.log).toHaveBeenCalledWith(
        '[FormatProcessingService]: Данные преобразованы во внутренний формат:', internalFormat
      );
      expect(console.log).toHaveBeenCalledWith(
        '[FormatProcessingService]: Сформирован CreateEntryDto:', expect.any(Object) // Проверяем наличие DTO
      );
      expect(console.log).toHaveBeenCalledWith(
        '[FormatProcessingService]: Запись успешно добавлена в очередь. Результат:', createdEntry
      );
      expect(console.log).toHaveBeenCalledWith(
        '[FormatProcessingService]: Ответ преобразован в формат клиента.'
      );
      expect(console.error).not.toHaveBeenCalled(); // Убеждаемся, что ошибок не было
    });

    it('should throw an error if inbound conversion fails', async () => {
      const errorMessage = 'Failed to convert inbound data';
      // Настраиваем входящий конвертер на выброс ошибки
      mockInboundConverter.convert.mockRejectedValueOnce(new Error(errorMessage));

      const contentType = 'application/xml'; // Пример другого контент-тайпа
      const acceptHeaders = 'application/json';

      await expect(service.processFormat('<invalid-xml/>', contentType, acceptHeaders)).rejects.toThrow(
        errorMessage,
      );

      // Проверяем, что логи ошибок были вызваны
      expect(console.error).toHaveBeenCalledWith(
        `[FormatProcessingService]: Ошибка обработки: ${errorMessage}`,
      );
      expect(console.log).toHaveBeenCalledWith(
        `[FormatProcessingService]: Начало обработки сообщения. Content-Type: ${contentType}, Accept: ${acceptHeaders}`
      );
      // Остальные логи успеха не должны быть вызваны
      expect(console.log).not.toHaveBeenCalledWith(
        '[FormatProcessingService]: Данные преобразованы во внутренний формат:', expect.any(Object)
      );
    });

    it('should throw an error if entry creation fails', async () => {
      const errorMessage = 'Failed to create entry in database';
      // Настраиваем EntryService на выброс ошибки
      mockEntryService.create.mockRejectedValueOnce(new Error(errorMessage));

      const contentType = 'application/json';
      const acceptHeaders = 'application/json';

      await expect(service.processFormat(rawJsonData, contentType, acceptHeaders)).rejects.toThrow(
        errorMessage,
      );

      // Проверяем, что логи ошибок были вызваны
      expect(console.error).toHaveBeenCalledWith(
        `[FormatProcessingService]: Ошибка обработки: ${errorMessage}`,
      );
      // Проверяем, что предыдущие шаги были выполнены успешно
      expect(mockInboundConverter.convert).toHaveBeenCalledWith(rawJsonData);
      expect(console.log).toHaveBeenCalledWith(
        '[FormatProcessingService]: Данные преобразованы во внутренний формат:', internalFormat
      );
      // Логи после сбоя EntryService не должны быть вызваны
      expect(console.log).not.toHaveBeenCalledWith(
        '[FormatProcessingService]: Запись успешно добавлена в очередь. Результат:', expect.any(Object)
      );
    });

    it('should throw an error if outbound conversion fails', async () => {
      const errorMessage = 'Failed to convert outbound data for client';
      // Настраиваем исходящий конвертер на выброс ошибки
      mockOutboundConverter.convert.mockImplementationOnce(() => {
        throw new Error(errorMessage);
      });

      const contentType = 'application/json';
      const acceptHeaders = 'application/xml'; // Пример другого формата

      await expect(service.processFormat(rawJsonData, contentType, acceptHeaders)).rejects.toThrow(
        errorMessage,
      );

      // Проверяем, что логи ошибок были вызваны
      expect(console.error).toHaveBeenCalledWith(
        `[FormatProcessingService]: Ошибка обработки: ${errorMessage}`,
      );
      // Проверяем, что предыдущие шаги были выполнены успешно
      expect(mockEntryService.create).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith(
        '[FormatProcessingService]: Запись успешно добавлена в очередь. Результат:', createdEntry
      );
      // Логи после сбоя outboundConverter не должны быть вызваны
      expect(console.log).not.toHaveBeenCalledWith(
        '[FormatProcessingService]: Ответ преобразован в формат клиента.'
      );
    });

    it('should handle undefined rawData correctly when throwing an error', async () => {
      const contentType = 'application/json';
      const acceptHeaders = 'application/json';
    
      // Проверяем, что при undefined rawData сервис выбрасывает ошибку
      await expect(service.processFormat(undefined, contentType, acceptHeaders)).rejects.toThrow('Processed data cannot be empty or invalid');
    
      expect(console.error).toHaveBeenCalledWith(
        '[FormatProcessingService]: Ошибка обработки: Processed data cannot be empty or invalid',
      );
      // Убеждаемся, что inboundConverter.convert не был вызван, так как ошибка произошла раньше
      expect(mockInboundConverter.convert).not.toHaveBeenCalled();
    });
  });
});