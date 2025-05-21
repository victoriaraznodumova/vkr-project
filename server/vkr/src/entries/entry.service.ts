// src/entries/entries.service.ts

import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Entry } from './entity/entry.entity';
import { CreateEntryDto } from './dto/create-entry.dto';
import { UpdateEntryDto } from './dto/update-entry.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { EntryStatusEnum } from './entity/entry.status.enum';
import { UserService } from '../users/user.service'; // Предполагается, что у вас есть UserService
import { QueueService } from '../queues/queue.service'; // Используем QueuesService (убедитесь, что имя сервиса правильное)
import { JournalService } from '../journal/journal.service'; // Предполагается, что у вас есть JournalService
import { CreateJournalEntryDto } from '../journal/dto/create-journal-entry.dto';
import { JournalActionEnum } from '../journal/entity/journal.action.enum';
import { JournalStatusEnum } from '../journal/entity/journal.status.enum';
import { QueueTypeEnum } from '../queues/entity/queue.type.enum'; // Импортируем QueueTypeEnum

@Injectable()
export class EntryService {
  constructor(
    @InjectRepository(Entry)
    private readonly entryRepository: Repository<Entry>,
    private readonly userService: UserService, // Для проверки существования пользователя
    private readonly queueService: QueueService, // Для получения информации об очереди
    private readonly journalService: JournalService, // Для логирования действий
  ) {}

  /**
   * Создает новую запись в очереди.
   * @param createEntryDto DTO с данными для создания записи.
   * @param userId ID пользователя, создающего запись (из JWT).
   * @returns Promise с созданной сущностью Entry.
   */
  async create(createEntryDto: CreateEntryDto, userId: number): Promise<Entry> {
    const { queueId, date, time, notificationMinutes, notificationPosition } = createEntryDto;

    // 1. Проверяем существование пользователя
    // ИСПРАВЛЕНО: findById -> findOne (если ваш UserService использует findOne)
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new NotFoundException(`Пользователь с ID ${userId} не найден.`);
    }

    // 2. Проверяем существование очереди и получаем ее тип
    // ИСПРАВЛЕНО: findById -> findOne (если ваш QueueService использует findOne)
    const queue = await this.queueService.findOne(queueId);
    if (!queue) {
      throw new NotFoundException(`Очередь с ID ${queueId} не найдена.`);
    }

    // 3. Валидация по типу очереди
    let entryTimeOrg: Date | null = null;

    if (queue.type === QueueTypeEnum.ORGANIZATIONAL) {
      if (!date || !time) {
        throw new BadRequestException('Для организационной очереди необходимы дата и время записи.');
      }
      // Преобразуем дату и время в Date объект
      try {
        entryTimeOrg = new Date(`${date}T${time}:00`); // Предполагаем формат 'YYYY-MM-DDTHH:MM:SS'
        if (isNaN(entryTimeOrg.getTime())) {
          throw new Error('Некорректный формат даты или времени.');
        }
      } catch (e) {
        throw new BadRequestException(`Некорректный формат даты или времени: ${e.message}`);
      }
      // notificationMinutes применим здесь
      if (notificationPosition !== undefined && notificationPosition !== null) {
        throw new BadRequestException('notificationPosition не применим для организационной очереди.');
      }

    } else if (queue.type === QueueTypeEnum.SELF_ORGANIZED) {
      // Для самоорганизованной очереди, дата и время не требуются
      if (date || time || (notificationMinutes !== undefined && notificationMinutes !== null)) {
        throw new BadRequestException('Дата, время или notificationMinutes не применимы для самоорганизованной очереди.');
      }
      // sequentialNumberSelf и entryPositionSelf будут рассчитаны позже
      // notificationPosition применим здесь
    } else {
      throw new BadRequestException('Неизвестный тип очереди.');
    }

    // 4. Создаем новую запись
    const newEntry = this.entryRepository.create({
      queueId: queueId,
      userId: userId,
      status: EntryStatusEnum.WAITING, // Начальный статус
      entryTimeOrg: entryTimeOrg,
      notificationMinutes: notificationMinutes,
      notificationPosition: notificationPosition,
      // sequentialNumberSelf и entryPositionSelf будут установлены при необходимости
    });

    const savedEntry = await this.entryRepository.save(newEntry);

    // 5. Логируем создание записи
    const createJournalDto: CreateJournalEntryDto = {
      entryId: savedEntry.entryId,
      initiatedByUserId: userId, // Инициатор действия
      action: JournalActionEnum.JOINED,
      prevStatus: null, // Нет предыдущего статуса при создании
      newStatus: JournalStatusEnum.WAITING,
      comment: 'Пользователь присоединился к очереди.',
    };
    await this.journalService.logEntryAction(createJournalDto);

    return savedEntry;
  }

  /**
   * Находит все записи в очереди.
   * @returns Promise с массивом сущностей Entry.
   */
  async findAll(): Promise<Entry[]> {
    return this.entryRepository.find({
      relations: ['user', 'queue', 'logs'], // Загружаем связанные сущности
    });
  }

  /**
   * Находит запись по ID.
   * @param entryId ID записи.
   * @returns Promise с сущностью Entry или null.
   */
  async findOne(entryId: number): Promise<Entry | null> {
    const entry = await this.entryRepository.findOne({
      where: { entryId: entryId },
      relations: ['user', 'queue', 'logs'],
    });
    if (!entry) {
      throw new NotFoundException(`Запись с ID ${entryId} не найдена.`);
    }
    return entry;
  }

  /**
   * Обновляет запись в очереди (например, настройки уведомлений).
   * @param entryId ID записи.
   * @param updateEntryDto DTO с данными для обновления.
   * @param userId ID пользователя, выполняющего обновление (для проверки прав/логирования).
   * @returns Promise с обновленной сущностью Entry.
   */
  async update(entryId: number, updateEntryDto: UpdateEntryDto, userId: number): Promise<Entry> {
    const entry = await this.findOne(entryId); // Проверяем существование записи

    // TODO: Добавить проверку прав: только владелец записи или администратор очереди может ее обновить.
    // Пример:
    // const user = await this.userService.findOne(userId);
    // if (!user) {
    //   throw new NotFoundException(`Пользователь с ID ${userId} не найден.`);
    // }
    // const isAdminOfQueue = await this.queueService.isUserAdminOfQueue(userId, entry.queueId); // Предполагается такой метод
    // if (entry.userId !== userId && !isAdminOfQueue) {
    //   throw new ForbiddenException('У вас нет прав для обновления этой записи.');
    // }

    // Обновляем поля записи
    Object.assign(entry, updateEntryDto);

    const updatedEntry = await this.entryRepository.save(entry);

    // TODO: Логировать изменение настроек уведомлений в JournalService
    // Пример:
    // const createJournalDto: CreateJournalEntryDto = {
    //   entryId: updatedEntry.entryId,
    //   initiatedByUserId: userId,
    //   action: JournalActionEnum.STATUS_CHANGED, // Или более специфичное действие
    //   prevStatus: this.mapEntryStatusToJournalStatus(entry.status), // Старый статус до Object.assign
    //   newStatus: this.mapEntryStatusToJournalStatus(updatedEntry.status),
    //   comment: 'Настройки записи обновлены.',
    // };
    // await this.journalService.logEntryAction(createJournalDto);


    return updatedEntry;
  }

  /**
   * Обновляет статус записи в очереди.
   * @param entryId ID записи.
   * @param updateStatusDto DTO с новым статусом.
   * @param initiatorUserId ID пользователя, изменяющего статус (администратор или сам пользователь).
   * @returns Promise с обновленной сущностью Entry.
   */
  async updateStatus(entryId: number, updateStatusDto: UpdateStatusDto, initiatorUserId: number): Promise<Entry> {
    const entry = await this.findOne(entryId); // Проверяем существование записи
    const oldStatus = entry.status;
    const newStatus: EntryStatusEnum = updateStatusDto.status;
    const comment = updateStatusDto.comment || null;

    // Проверка, является ли initiatorUserId администратором или владельцем записи
    const initiatorUser = await this.userService.findOne(initiatorUserId);
    if (!initiatorUser) {
      throw new NotFoundException(`Пользователь-инициатор с ID ${initiatorUserId} не найден.`);
    }

    // В вашей модели нет глобальных ролей, поэтому isAdmin будет определяться
    // на основе того, является ли пользователь администратором *конкретной очереди*.
    // Пока что, для примера, я просто сделаю заглушку.
    // TODO: Реализовать проверку isAdminOfQueue, например, через AdministratorsModule.
    const isAdminOfQueue = false; // Заглушка: замените на реальную проверку
    // Пример: const isAdminOfQueue = await this.queueService.isUserAdminOfQueue(initiatorUserId, entry.queueId);

    const isOwner = entry.userId === initiatorUserId;

    // Логика переходов статусов и прав доступа
    switch (oldStatus) {
      case EntryStatusEnum.WAITING:
        if (newStatus === EntryStatusEnum.SERVING && !isAdminOfQueue) {
          throw new ForbiddenException('Только администратор очереди может изменить статус с "Ожидает" на "Обслуживается".');
        }
        if (newStatus === EntryStatusEnum.CANCELED && !isAdminOfQueue && !isOwner) {
          throw new ForbiddenException('Только администратор очереди или владелец записи может отменить ожидающую запись.');
        }
        if (newStatus === EntryStatusEnum.NO_SHOW && !isAdminOfQueue) {
          throw new ForbiddenException('Только администратор очереди может пометить запись как "Не явился".');
        }
        if (newStatus === EntryStatusEnum.LATE && !isAdminOfQueue) {
          throw new ForbiddenException('Только администратор очереди может пометить запись как "Опаздывает".');
        }
        if (![EntryStatusEnum.SERVING, EntryStatusEnum.CANCELED, EntryStatusEnum.NO_SHOW, EntryStatusEnum.LATE].includes(newStatus)) {
          throw new BadRequestException(`Недопустимый переход статуса из "Ожидает" в "${newStatus}".`);
        }
        break;
      case EntryStatusEnum.SERVING:
        if (!isAdminOfQueue) {
          throw new ForbiddenException('Только администратор очереди может изменить статус из "Обслуживается".');
        }
        if (![EntryStatusEnum.COMPLETED, EntryStatusEnum.CANCELED, EntryStatusEnum.NO_SHOW].includes(newStatus)) {
          throw new BadRequestException(`Недопустимый переход статуса из "Обслуживается" в "${newStatus}".`);
        }
        break;
      case EntryStatusEnum.COMPLETED:
      case EntryStatusEnum.CANCELED:
      case EntryStatusEnum.NO_SHOW:
      case EntryStatusEnum.LATE:
        // Эти статусы считаются конечными, изменение возможно только администратором для исправления
        if (!isAdminOfQueue) {
          throw new ForbiddenException(`Статус не может быть изменен из "${oldStatus}". Только администратор очереди может это сделать.`);
        }
        break;
      default:
        // Неизвестный статус
        throw new BadRequestException(`Неизвестный старый статус: ${oldStatus}.`);
    }

    entry.status = newStatus;
    entry.statusUpdatedAt = new Date();

    const updatedEntry = await this.entryRepository.save(entry);

    // Логируем изменение статуса
    const createJournalDto: CreateJournalEntryDto = {
      entryId: updatedEntry.entryId,
      initiatedByUserId: initiatorUserId,
      action: this.getActionFromStatusChange(oldStatus, newStatus, isAdminOfQueue, isOwner),
      prevStatus: this.mapEntryStatusToJournalStatus(oldStatus),
      newStatus: this.mapEntryStatusToJournalStatus(newStatus),
      comment: comment,
    };
    await this.journalService.logEntryAction(createJournalDto);

    return updatedEntry;
  }

  /**
   * Удаляет запись из очереди.
   * @param entryId ID записи.
   * @param userId ID пользователя, выполняющего удаление (для проверки прав/логирования).
   * @returns Promise, который завершается после удаления.
   */
  async remove(entryId: number, userId: number): Promise<void> {
    const entry = await this.findOne(entryId);

    const initiatorUser = await this.userService.findOne(userId);
    if (!initiatorUser) {
      throw new NotFoundException(`Пользователь-инициатор с ID ${userId} не найден.`);
    }

    // TODO: Реализовать проверку isAdminOfQueue
    const isAdminOfQueue = false; // Заглушка: замените на реальную проверку
    // Пример: const isAdminOfQueue = await this.queueService.isUserAdminOfQueue(userId, entry.queueId);

    const isOwner = entry.userId === userId;

    if (!isAdminOfQueue && !isOwner) {
      throw new ForbiddenException('У вас нет прав для удаления этой записи. Только администратор очереди или владелец записи может это сделать.');
    }

    const oldStatus = entry.status; // Сохраняем статус перед удалением

    await this.entryRepository.remove(entry);

    // Логируем удаление записи
    const createJournalDto: CreateJournalEntryDto = {
      entryId: entryId,
      initiatedByUserId: userId,
      action: isAdminOfQueue ? JournalActionEnum.ADMIN_REMOVED : JournalActionEnum.REMOVED, // Если удаляет админ, то ADMIN_REMOVED
      prevStatus: this.mapEntryStatusToJournalStatus(oldStatus),
      newStatus: JournalStatusEnum.REMOVED, // Новый статус - REMOVED из JournalStatusEnum
      comment: isAdminOfQueue ? 'Запись удалена администратором очереди.' : 'Запись удалена пользователем.',
    };
    await this.journalService.logEntryAction(createJournalDto);
  }

  /**
   * Вспомогательный метод для определения действия журнала на основе изменения статуса.
   * @param oldStatus Предыдущий статус записи.
   * @param newStatus Новый статус записи.
   * @param isAdminOfQueue Флаг, указывающий, является ли пользователь администратором текущей очереди.
   * @param isOwner Флаг, указывающий, является ли пользователь владельцем записи.
   * @returns Соответствующее действие из JournalActionEnum.
   */
  private getActionFromStatusChange(
    oldStatus: EntryStatusEnum,
    newStatus: EntryStatusEnum,
    isAdminOfQueue: boolean,
    isOwner: boolean,
  ): JournalActionEnum {
    if (oldStatus === EntryStatusEnum.WAITING && newStatus === EntryStatusEnum.SERVING) {
      return JournalActionEnum.STARTED_SERVING;
    }
    if (oldStatus === EntryStatusEnum.SERVING && newStatus === EntryStatusEnum.COMPLETED) {
      return JournalActionEnum.COMPLETED_SERVICE;
    }
    if (newStatus === EntryStatusEnum.CANCELED) {
      return isOwner ? JournalActionEnum.USER_CANCELED : JournalActionEnum.ADMIN_CANCELED;
    }
    if (newStatus === EntryStatusEnum.NO_SHOW) {
      return JournalActionEnum.NO_SHOW;
    }
    if (newStatus === EntryStatusEnum.LATE) {
      return JournalActionEnum.MARKED_LATE;
    }
    // Общее изменение статуса, если нет более специфичного действия
    return JournalActionEnum.STATUS_CHANGED;
  }

  /**
   * Вспомогательный метод для маппинга EntryStatusEnum в JournalStatusEnum.
   * @param entryStatus Статус из EntryStatusEnum.
   * @returns Соответствующий статус из JournalStatusEnum.
   */
  private mapEntryStatusToJournalStatus(entryStatus: EntryStatusEnum): JournalStatusEnum {
    switch (entryStatus) {
      case EntryStatusEnum.WAITING:
        return JournalStatusEnum.WAITING;
      case EntryStatusEnum.SERVING:
        return JournalStatusEnum.SERVING;
      case EntryStatusEnum.COMPLETED:
        return JournalStatusEnum.COMPLETED;
      case EntryStatusEnum.CANCELED:
        return JournalStatusEnum.CANCELED;
      case EntryStatusEnum.NO_SHOW:
        return JournalStatusEnum.NO_SHOW;
      case EntryStatusEnum.LATE:
        return JournalStatusEnum.LATE;
      default:
        // Если статус не найден или не должен быть отображен в журнале,
        // можно вернуть null или бросить ошибку в зависимости от логики.
        return null;
    }
  }
}
