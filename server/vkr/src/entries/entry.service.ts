// src/entries/entries.service.ts

import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Entry } from './entity/entry.entity';
import { CreateEntryDto } from './dto/create-entry.dto';
import { UpdateEntryDto } from './dto/update-entry.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { EntryStatusEnum } from './entity/entry.status.enum';
import { UserService } from '../users/user.service';
import { QueueService } from '../queues/queue.service';
import { JournalService } from '../journal/journal.service';
import { CreateJournalEntryDto } from '../journal/dto/create-journal-entry.dto';
import { JournalActionEnum } from '../journal/entity/journal.action.enum';
import { JournalStatusEnum } from '../journal/entity/journal.status.enum';
import { QueueTypeEnum } from '../queues/entity/queue.type.enum';

@Injectable()
export class EntryService {
  constructor(
    @InjectRepository(Entry)
    private readonly entryRepository: Repository<Entry>,
    private readonly userService: UserService,
    private readonly queueService: QueueService,
    private readonly journalService: JournalService,
  ) {}

  /**
   * Создает новую запись в очереди.
   * @param createEntryDto DTO с данными для создания записи.
   * @param userId ID пользователя, создающего запись (из JWT).
   * @returns Promise с созданной сущностью Entry.
   */
  async create(createEntryDto: CreateEntryDto, userId: number): Promise<Entry> {
    const { queueId, date, time, notificationMinutes, notificationPosition } = createEntryDto;

    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new NotFoundException(`Пользователь с ID ${userId} не найден.`);
    }

    const queue = await this.queueService.findOne(queueId);
    if (!queue) {
      throw new NotFoundException(`Очередь с ID ${queueId} не найдена.`);
    }

    let entryTimeOrg: Date | null = null;

    if (queue.type === QueueTypeEnum.ORGANIZATIONAL) {
      if (!date || !time) {
        throw new BadRequestException('Для организационной очереди необходимы дата и время записи.');
      }
      try {
        // ИСПРАВЛЕНО: Создаем Date в UTC, чтобы избежать проблем с часовыми поясами
        entryTimeOrg = new Date(`${date}T${time}:00.000Z`); // Добавляем .000Z для явного UTC
        if (isNaN(entryTimeOrg.getTime())) {
          throw new Error('Некорректный формат даты или времени.');
        }
      } catch (e) {
        throw new BadRequestException(`Некорректный формат даты или времени: ${e.message}`);
      }
      if (notificationPosition !== undefined && notificationPosition !== null) {
        throw new BadRequestException('notificationPosition не применим для организационной очереди.');
      }
    } else if (queue.type === QueueTypeEnum.SELF_ORGANIZED) {
      if (date || time || (notificationMinutes !== undefined && notificationMinutes !== null)) {
        throw new BadRequestException('Дата, время или notificationMinutes не применимы для самоорганизованной очереди.');
      }
    } else {
      throw new BadRequestException('Неизвестный тип очереди.');
    }

    const newEntry = this.entryRepository.create({
      queueId: queueId,
      userId: userId,
      status: EntryStatusEnum.WAITING,
      entryTimeOrg: entryTimeOrg,
      notificationMinutes: notificationMinutes,
      notificationPosition: notificationPosition,
    });

    const savedEntry = await this.entryRepository.save(newEntry);

    // ИСПРАВЛЕНО: Логируем создание записи ПОСЛЕ успешного сохранения
    const createJournalDto: CreateJournalEntryDto = {
      entryId: savedEntry.entryId,
      initiatedByUserId: userId,
      action: JournalActionEnum.JOINED,
      prevStatus: null,
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
      relations: ['user', 'queue', 'logs'],
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
    const entry = await this.findOne(entryId);

    // ИСПРАВЛЕНО: Активируем проверку прав
    const initiatorUser = await this.userService.findOne(userId);
    if (!initiatorUser) {
      throw new NotFoundException(`Пользователь с ID ${userId} не найден.`);
    }

    const isAdminOfQueue = await this.queueService.isUserAdminOfQueue(userId, entry.queueId);
    const isOwner = entry.userId === userId;

    if (!isOwner && !isAdminOfQueue) {
      throw new ForbiddenException('У вас нет прав для обновления этой записи.');
    }

    Object.assign(entry, updateEntryDto);
    const updatedEntry = await this.entryRepository.save(entry);

    // TODO: Логировать изменение настроек уведомлений в JournalService
    // Пример:
    // const createJournalDto: CreateJournalEntryDto = {
    //   entryId: updatedEntry.entryId,
    //   initiatedByUserId: userId,
    //   action: JournalActionEnum.SETTINGS_CHANGED, // Или более специфичное действие
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
    const entry = await this.findOne(entryId);
    const oldStatus = entry.status;
    const newStatus: EntryStatusEnum = updateStatusDto.status;
    const comment = updateStatusDto.comment || null;

    const initiatorUser = await this.userService.findOne(initiatorUserId);
    if (!initiatorUser) {
      throw new NotFoundException(`Пользователь-инициатор с ID ${initiatorUserId} не найден.`);
    }

    // ИСПРАВЛЕНО: Активируем проверку прав
    const isAdminOfQueue = await this.queueService.isUserAdminOfQueue(initiatorUserId, entry.queueId);
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
        // ИСПРАВЛЕНО: Убедимся, что используем enum value для сравнения
        if (![EntryStatusEnum.SERVING, EntryStatusEnum.CANCELED, EntryStatusEnum.NO_SHOW, EntryStatusEnum.LATE].includes(newStatus)) {
          throw new BadRequestException(`Недопустимый переход статуса из "${oldStatus}" в "${newStatus}".`);
        }
        break;
      case EntryStatusEnum.SERVING:
        if (!isAdminOfQueue) {
          throw new ForbiddenException('Только администратор очереди может изменить статус из "Обслуживается".');
        }
        // ИСПРАВЛЕНО: Убедимся, что используем enum value для сравнения
        if (![EntryStatusEnum.COMPLETED, EntryStatusEnum.CANCELED, EntryStatusEnum.NO_SHOW].includes(newStatus)) {
          throw new BadRequestException(`Недопустимый переход статуса из "${oldStatus}" в "${newStatus}".`);
        }
        break;
      case EntryStatusEnum.COMPLETED:
      case EntryStatusEnum.CANCELED:
      case EntryStatusEnum.NO_SHOW:
      case EntryStatusEnum.LATE:
        if (!isAdminOfQueue) {
          throw new ForbiddenException(`Статус не может быть изменен из "${oldStatus}". Только администратор очереди может это сделать.`);
        }
        break;
      default:
        throw new BadRequestException(`Неизвестный старый статус: ${oldStatus}.`);
    }

    entry.status = newStatus;
    entry.statusUpdatedAt = new Date();

    const updatedEntry = await this.entryRepository.save(entry);

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

    // ИСПРАВЛЕНО: Активируем проверку прав
    const isAdminOfQueue = await this.queueService.isUserAdminOfQueue(userId, entry.queueId);
    const isOwner = entry.userId === userId;

    if (!isAdminOfQueue && !isOwner) {
      throw new ForbiddenException('У вас нет прав для удаления этой записи. Только администратор очереди или владелец записи может это сделать.');
    }

    const oldStatus = entry.status;

    await this.entryRepository.remove(entry);

    const createJournalDto: CreateJournalEntryDto = {
      entryId: entryId,
      initiatedByUserId: userId,
      action: isAdminOfQueue ? JournalActionEnum.ADMIN_REMOVED : JournalActionEnum.REMOVED,
      prevStatus: this.mapEntryStatusToJournalStatus(oldStatus),
      newStatus: JournalStatusEnum.REMOVED,
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
        return null; // Или выбросить ошибку, если это не ожидается
    }
  }
}
