import { InternalToYamlConverterService } from './internal-to-yaml-converter.service';
import { InternalFormat } from '../../../common/internal-format.interface'; // Убедитесь, что путь верен
import * as yaml from 'js-yaml'; // Импортируем js-yaml для верификации вывода

describe('InternalToYamlConverterService', () => {
  let service: InternalToYamlConverterService;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    service = new InternalToYamlConverterService();
    // Мокаем console.error, чтобы избежать вывода в консоль во время тестов ошибок
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Восстанавливаем оригинальный console.error после каждого теста
    consoleErrorSpy.mockRestore();
  });

  // --- Тесты успешного преобразования ---
  describe('convert (success scenarios)', () => {
    it('should successfully convert a complete InternalFormat object to a YAML string', () => {
      const internalFormat: InternalFormat = {
        queueId: 1,
        userId: 100,
        status: 'waiting',
        date: '2025-05-24',
        time: '14:30',
        notificationMinutes: 15,
        notificationPosition: 3,
        comment: 'This is a test entry.',
      };

      const expectedYamlString = `queueId: 1
userId: 100
status: waiting
date: '2025-05-24'
time: '14:30'
notificationMinutes: 15
notificationPosition: 3
comment: This is a test entry.
`;  // Обратите внимание на новую строку в конце, yaml.dump добавляет ее по умолчанию

      const result = service.convert(internalFormat);
      expect(result).toBe(expectedYamlString);
      // Опционально: можно использовать yaml.load для обратной проверки
      expect(yaml.load(result)).toEqual(internalFormat);
    });

    it('should correctly handle undefined/null optional fields (omit them from YAML)', () => {
      const internalFormat: InternalFormat = {
        queueId: 2,
        userId: 200,
        status: 'completed',
        // Все остальные поля undefined
      };

      const expectedYamlString = `queueId: 2
userId: 200
status: completed
`;

      const result = service.convert(internalFormat);
      expect(result).toBe(expectedYamlString);
      expect(yaml.load(result)).toEqual(internalFormat); // Проверяем обратное преобразование
    });

    it('should handle all optional fields being undefined/null', () => {
      const internalFormat: InternalFormat = {
        queueId: 3,
        userId: 300,
        status: undefined, // Можем явно указать undefined
        date: undefined,
        time: undefined,
        notificationMinutes: undefined,
        notificationPosition: undefined,
        comment: undefined,
      };

      const expectedYamlString = `queueId: 3
userId: 300
`;

      const result = service.convert(internalFormat);
      expect(result).toBe(expectedYamlString);
      // Для сравнения с originalFormat нужно убедиться, что undefined поля обрабатываются одинаково
      expect(yaml.load(result)).toEqual({ queueId: 3, userId: 300 });
    });
  });

  // --- Тесты обработки ошибок ---
  describe('convert (error scenarios)', () => {
    it('should throw an error if internalFormat causes yaml.dump to fail (e.g., circular reference)', () => {
      // Создаем объект с циклической ссылкой, который yaml.dump не может обработать
      const circularObject: any = {
        queueId: 1,
        userId: 100,
      };
      circularObject.self = circularObject; // Создаем циклическую ссылку

      // Мокаем yaml.dump, чтобы он выбросил ошибку для имитации сбоя
      const yamlDumpSpy = jest.spyOn(yaml, 'dump').mockImplementation(() => {
        throw new Error('Mocked YAML dump error: circular structure');
      });

      expect(() => service.convert(circularObject)).toThrow(
        'Не удалось преобразовать во внутренний формат YAML: Mocked YAML dump error: circular structure'
      );
      expect(consoleErrorSpy).toHaveBeenCalled(); // Проверяем, что ошибка была залогирована
      yamlDumpSpy.mockRestore(); // Восстанавливаем оригинальный dump
    });
  });
});