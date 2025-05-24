import { YamlToInternalConverterService } from './yaml-to-internal-converter.service';
import { InternalFormat } from '../../../common/internal-format.interface'; // Убедитесь, что путь верен

describe('YamlToInternalConverterService', () => {
  let service: YamlToInternalConverterService;

  beforeEach(() => {
    service = new YamlToInternalConverterService();
  });

  // --- Тесты успешного преобразования ---
  describe('convert (success scenarios)', () => {
    it('should successfully convert a valid YAML string to InternalFormat', async () => {
      const yamlString = `
        queueId: 123
        userId: 456
        status: "active"
        date: "2025-05-24"
        time: "10:00"
        notificationMinutes: 10
        notificationPosition: 2
        comment: "Test comment from YAML"
      `;

      const expectedInternalFormat: InternalFormat = {
        queueId: 123,
        userId: 456,
        status: "active",
        date: "2025-05-24",
        time: "10:00",
        notificationMinutes: 10,
        notificationPosition: 2,
        comment: "Test comment from YAML",
      };

      const result = await service.convert(yamlString);
      expect(result).toEqual(expectedInternalFormat);
    });

    it('should handle missing optional fields gracefully', async () => {
      const yamlString = `
        queueId: 789
        userId: 101
        status: "pending"
      `;

      const expectedInternalFormat: InternalFormat = {
        queueId: 789,
        userId: 101,
        status: "pending",
        date: undefined, // Ожидаем undefined для отсутствующих полей
        time: undefined,
        notificationMinutes: undefined,
        notificationPosition: undefined,
        comment: undefined,
      };

      const result = await service.convert(yamlString);
      expect(result).toEqual(expectedInternalFormat);
    });

    it('should correctly parse numbers even if they are strings in YAML', async () => {
      const yamlString = `
        queueId: "111"
        userId: "222"
        notificationMinutes: "15"
      `;

      const expectedInternalFormat: InternalFormat = {
        queueId: 111,
        userId: 222,
        status: undefined,
        date: undefined,
        time: undefined,
        notificationMinutes: 15,
        notificationPosition: undefined,
        comment: undefined,
      };

      const result = await service.convert(yamlString);
      expect(result).toEqual(expectedInternalFormat);
    });
  });

  // --- Тесты обработки ошибок ---
  describe('convert (error scenarios)', () => {
    it('should throw an error if the YAML string is empty', async () => {
      const yamlString = '';
      await expect(service.convert(yamlString)).rejects.toThrow(
        'Входные данные отсутствуют, пусты или имеют некорректный тип (ожидается непустая строка YAML).'
      );
    });

    it('should throw an error if the YAML string is just whitespace', async () => {
      const yamlString = '   \n  ';
      await expect(service.convert(yamlString)).rejects.toThrow(
        'Входные данные отсутствуют, пусты или имеют некорректный тип (ожидается непустая строка YAML).'
      );
    });

    it('should throw an error if the input is not a string', async () => {
      // @ts-ignore: Intentionally passing a non-string for testing validation
      await expect(service.convert(null)).rejects.toThrow(
        'Входные данные отсутствуют, пусты или имеют некорректный тип (ожидается непустая строка YAML).'
      );
      // @ts-ignore
      await expect(service.convert(undefined)).rejects.toThrow(
        'Входные данные отсутствуют, пусты или имеют некорректный тип (ожидается непустая строка YAML).'
      );
      // @ts-ignore
      await expect(service.convert(123)).rejects.toThrow(
        'Входные данные отсутствуют, пусты или имеют некорректный тип (ожидается непустая строка YAML).'
      );
    });

    it('should throw an error for invalid YAML syntax', async () => {
      const invalidYaml = `
        queueId: 123
        userId: 456
        invalid: [item1, item2
      `; // Некорректный синтаксис YAML

      await expect(service.convert(invalidYaml)).rejects.toThrow(
        'Неверный формат YAML:'
      );
    });

    it('should throw an error if queueId is missing', async () => {
      const yamlString = `
        userId: 456
      `;
      await expect(service.convert(yamlString)).rejects.toThrow(
        'Отсутствует обязательное поле: queueId'
      );
    });

    it('should throw an error if userId is missing', async () => {
      const yamlString = `
        queueId: 123
      `;
      await expect(service.convert(yamlString)).rejects.toThrow(
        'Отсутствует обязательное поле: userId'
      );
    });

    it('should throw an error if queueId is null', async () => {
      const yamlString = `
        queueId: null
        userId: 456
      `;
      await expect(service.convert(yamlString)).rejects.toThrow(
        'Отсутствует обязательное поле: queueId'
      );
    });

    it('should throw an error if userId is null', async () => {
      const yamlString = `
        queueId: 123
        userId: null
      `;
      await expect(service.convert(yamlString)).rejects.toThrow(
        'Отсутствует обязательное поле: userId'
      );
    });

    it('should throw an error if YAML is a scalar, not an object', async () => {
      const scalarYaml = 'just_a_string';
      await expect(service.convert(scalarYaml)).rejects.toThrow(
        'Неверный формат YAML: Ожидается корневой объект.'
      );
      const numberYaml = '123';
      await expect(service.convert(numberYaml)).rejects.toThrow(
        'Неверный формат YAML: Ожидается корневой объект.'
      );
      const listYaml = '- item1\n- item2';
      await expect(service.convert(listYaml)).rejects.toThrow(
        'Неверный формат YAML: Ожидается корневой объект.'
      );
    });
  });
});