"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntryService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entry_entity_1 = require("./entity/entry.entity");
const entry_status_enum_1 = require("./entity/entry-status.enum");
const user_service_1 = require("../users/user.service");
const queue_service_1 = require("../queues/queue.service");
const journal_service_1 = require("../journal/journal.service");
const journal_action_enum_1 = require("../journal/entity/journal-action.enum");
const journal_status_enum_1 = require("../journal/entity/journal-status.enum");
const queue_type_enum_1 = require("../queues/entity/queue-type.enum");
let EntryService = class EntryService {
    constructor(entryRepository, userService, queueService, journalService) {
        this.entryRepository = entryRepository;
        this.userService = userService;
        this.queueService = queueService;
        this.journalService = journalService;
    }
    async create(createEntryDto, userId) {
        const { queueId, date, time, notificationMinutes, notificationPosition } = createEntryDto;
        const user = await this.userService.findOne(userId);
        if (!user) {
            throw new common_1.NotFoundException(`Пользователь с ID ${userId} не найден.`);
        }
        const queue = await this.queueService.findOne(queueId);
        if (!queue) {
            throw new common_1.NotFoundException(`Очередь с ID ${queueId} не найдена.`);
        }
        let entryTimeOrg = null;
        if (queue.type === queue_type_enum_1.QueueTypeEnum.ORGANIZATIONAL) {
            if (!date || !time) {
                throw new common_1.BadRequestException('Для организационной очереди необходимы дата и время записи.');
            }
            try {
                entryTimeOrg = new Date(`${date}T${time}:00.000Z`);
                if (isNaN(entryTimeOrg.getTime())) {
                    throw new Error('Некорректный формат даты или времени.');
                }
            }
            catch (e) {
                throw new common_1.BadRequestException(`Некорректный формат даты или времени: ${e.message}`);
            }
            if (notificationPosition !== undefined && notificationPosition !== null) {
                throw new common_1.BadRequestException('notificationPosition не применим для организационной очереди.');
            }
        }
        else if (queue.type === queue_type_enum_1.QueueTypeEnum.SELF_ORGANIZED) {
            if (date || time || (notificationMinutes !== undefined && notificationMinutes !== null)) {
                throw new common_1.BadRequestException('Дата, время или notificationMinutes не применимы для самоорганизованной очереди.');
            }
        }
        else {
            throw new common_1.BadRequestException('Неизвестный тип очереди.');
        }
        if (queue.type === queue_type_enum_1.QueueTypeEnum.ORGANIZATIONAL) {
            const existingEntry = await this.entryRepository.findOne({
                where: {
                    queueId: queueId,
                    userId: userId,
                    entryTimeOrg: entryTimeOrg,
                },
            });
            if (existingEntry) {
                throw new common_1.BadRequestException('Запись на это время для этого пользователя уже существует в данной очереди.');
            }
        }
        const newEntry = this.entryRepository.create({
            queueId: queueId,
            userId: userId,
            status: entry_status_enum_1.EntryStatusEnum.WAITING,
            entryTimeOrg: entryTimeOrg,
            notificationMinutes: notificationMinutes,
            notificationPosition: notificationPosition,
        });
        const savedEntry = await this.entryRepository.save(newEntry);
        const createJournalDto = {
            entryId: savedEntry.entryId,
            initiatedByUserId: userId,
            action: journal_action_enum_1.JournalActionEnum.JOINED,
            prevStatus: null,
            newStatus: journal_status_enum_1.JournalStatusEnum.WAITING,
            comment: 'Пользователь присоединился к очереди.',
        };
        await this.journalService.logEntryAction(createJournalDto);
        return savedEntry;
    }
    async findAll() {
        return this.entryRepository.find({
            relations: ['user', 'queue', 'logs'],
        });
    }
    async findOne(entryId) {
        const entry = await this.entryRepository.findOne({
            where: { entryId: entryId },
            relations: ['user', 'queue', 'logs'],
        });
        if (!entry) {
            throw new common_1.NotFoundException(`Запись с ID ${entryId} не найдена.`);
        }
        return entry;
    }
    async update(entryId, updateEntryDto, userId) {
        const entry = await this.findOne(entryId);
        const initiatorUser = await this.userService.findOne(userId);
        if (!initiatorUser) {
            throw new common_1.NotFoundException(`Пользователь с ID ${userId} не найден.`);
        }
        const isAdminOfQueue = await this.queueService.isUserAdminOfQueue(userId, entry.queueId);
        const isOwner = entry.userId === userId;
        if (!isOwner && !isAdminOfQueue) {
            throw new common_1.ForbiddenException('У вас нет прав для обновления этой записи.');
        }
        Object.assign(entry, updateEntryDto);
        const updatedEntry = await this.entryRepository.save(entry);
        return updatedEntry;
    }
    async updateStatus(entryId, updateStatusDto, initiatorUserId) {
        const entry = await this.findOne(entryId);
        const oldStatus = entry.status;
        const newStatus = updateStatusDto.status;
        const comment = updateStatusDto.comment || null;
        if (oldStatus === newStatus) {
            return entry;
        }
        const initiatorUser = await this.userService.findOne(initiatorUserId);
        if (!initiatorUser) {
            throw new common_1.NotFoundException(`Пользователь-инициатор с ID ${initiatorUserId} не найден.`);
        }
        const isAdminOfQueue = await this.queueService.isUserAdminOfQueue(initiatorUserId, entry.queueId);
        const isOwner = entry.userId === initiatorUserId;
        switch (oldStatus) {
            case entry_status_enum_1.EntryStatusEnum.WAITING:
                if (newStatus === entry_status_enum_1.EntryStatusEnum.SERVING && !isAdminOfQueue) {
                    throw new common_1.ForbiddenException('Только администратор очереди может изменить статус с "Ожидает" на "Обслуживается".');
                }
                if (newStatus === entry_status_enum_1.EntryStatusEnum.CANCELED && !isAdminOfQueue && !isOwner) {
                    throw new common_1.ForbiddenException('Только администратор очереди или владелец записи может отменить ожидающую запись.');
                }
                if (newStatus === entry_status_enum_1.EntryStatusEnum.NO_SHOW && !isAdminOfQueue) {
                    throw new common_1.ForbiddenException('Только администратор очереди может пометить запись как "Не явился".');
                }
                if (newStatus === entry_status_enum_1.EntryStatusEnum.LATE && !isAdminOfQueue) {
                    throw new common_1.ForbiddenException('Только администратор очереди может пометить запись как "Опаздывает".');
                }
                if (![entry_status_enum_1.EntryStatusEnum.SERVING, entry_status_enum_1.EntryStatusEnum.CANCELED, entry_status_enum_1.EntryStatusEnum.NO_SHOW, entry_status_enum_1.EntryStatusEnum.LATE].includes(newStatus)) {
                    throw new common_1.BadRequestException(`Недопустимый переход статуса из "${oldStatus}" в "${newStatus}".`);
                }
                break;
            case entry_status_enum_1.EntryStatusEnum.SERVING:
                if (!isAdminOfQueue) {
                    throw new common_1.ForbiddenException('Только администратор очереди может изменить статус из "Обслуживается".');
                }
                if (![entry_status_enum_1.EntryStatusEnum.COMPLETED, entry_status_enum_1.EntryStatusEnum.CANCELED, entry_status_enum_1.EntryStatusEnum.NO_SHOW].includes(newStatus)) {
                    throw new common_1.BadRequestException(`Недопустимый переход статуса из "${oldStatus}" в "${newStatus}".`);
                }
                break;
            case entry_status_enum_1.EntryStatusEnum.COMPLETED:
            case entry_status_enum_1.EntryStatusEnum.CANCELED:
            case entry_status_enum_1.EntryStatusEnum.NO_SHOW:
            case entry_status_enum_1.EntryStatusEnum.LATE:
                if (!isAdminOfQueue) {
                    throw new common_1.ForbiddenException(`Статус не может быть изменен из "${oldStatus}". Только администратор очереди может это сделать.`);
                }
                break;
            default:
                throw new common_1.BadRequestException(`Неизвестный старый статус: ${oldStatus}.`);
        }
        entry.status = newStatus;
        entry.statusUpdatedAt = new Date();
        const updatedEntry = await this.entryRepository.save(entry);
        const createJournalDto = {
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
    async remove(entryId, userId) {
        const entry = await this.findOne(entryId);
        const initiatorUser = await this.userService.findOne(userId);
        if (!initiatorUser) {
            throw new common_1.NotFoundException(`Пользователь-инициатор с ID ${userId} не найден.`);
        }
        const isAdminOfQueue = await this.queueService.isUserAdminOfQueue(userId, entry.queueId);
        const isOwner = entry.userId === userId;
        if (!isAdminOfQueue && !isOwner) {
            throw new common_1.ForbiddenException('У вас нет прав для удаления этой записи. Только администратор очереди или владелец записи может это сделать.');
        }
        const oldStatus = entry.status;
        await this.entryRepository.remove(entry);
        const createJournalDto = {
            entryId: entryId,
            initiatedByUserId: userId,
            action: isAdminOfQueue ? journal_action_enum_1.JournalActionEnum.ADMIN_REMOVED : journal_action_enum_1.JournalActionEnum.REMOVED,
            prevStatus: this.mapEntryStatusToJournalStatus(oldStatus),
            newStatus: journal_status_enum_1.JournalStatusEnum.REMOVED,
            comment: isAdminOfQueue ? 'Запись удалена администратором очереди.' : 'Запись удалена пользователем.',
        };
        await this.journalService.logEntryAction(createJournalDto);
    }
    async getEntriesByQueueId(queueId) {
        return this.entryRepository.find({
            where: { queueId: queueId },
            relations: ['user', 'queue', 'logs'],
            order: { createdAt: 'ASC' },
        });
    }
    async getEntryPosition(queueId, entryId) {
        const entriesInQueue = await this.entryRepository.find({
            where: { queueId: queueId, status: entry_status_enum_1.EntryStatusEnum.WAITING },
            order: { createdAt: 'ASC' },
        });
        const index = entriesInQueue.findIndex(entry => entry.entryId === entryId);
        return index !== -1 ? index + 1 : 0;
    }
    async getEntriesForUser(userId) {
        return this.entryRepository.find({
            where: { userId: userId },
            relations: ['user', 'queue', 'logs'],
            order: { createdAt: 'ASC' },
        });
    }
    async getNextEntryInQueue(queueId) {
        const nextEntry = await this.entryRepository.find({
            where: { queueId: queueId, status: entry_status_enum_1.EntryStatusEnum.WAITING },
            order: { createdAt: 'ASC' },
            take: 1,
        });
        return nextEntry.length > 0 ? nextEntry[0] : null;
    }
    getActionFromStatusChange(oldStatus, newStatus, isAdminOfQueue, isOwner) {
        if (oldStatus === entry_status_enum_1.EntryStatusEnum.WAITING && newStatus === entry_status_enum_1.EntryStatusEnum.SERVING) {
            return journal_action_enum_1.JournalActionEnum.STARTED_SERVING;
        }
        if (oldStatus === entry_status_enum_1.EntryStatusEnum.SERVING && newStatus === entry_status_enum_1.EntryStatusEnum.COMPLETED) {
            return journal_action_enum_1.JournalActionEnum.COMPLETED_SERVICE;
        }
        if (newStatus === entry_status_enum_1.EntryStatusEnum.CANCELED) {
            return isOwner ? journal_action_enum_1.JournalActionEnum.USER_CANCELED : journal_action_enum_1.JournalActionEnum.ADMIN_CANCELED;
        }
        if (newStatus === entry_status_enum_1.EntryStatusEnum.NO_SHOW) {
            return journal_action_enum_1.JournalActionEnum.NO_SHOW;
        }
        if (newStatus === entry_status_enum_1.EntryStatusEnum.LATE) {
            return journal_action_enum_1.JournalActionEnum.MARKED_LATE;
        }
        return journal_action_enum_1.JournalActionEnum.STATUS_CHANGED;
    }
    mapEntryStatusToJournalStatus(entryStatus) {
        switch (entryStatus) {
            case entry_status_enum_1.EntryStatusEnum.WAITING:
                return journal_status_enum_1.JournalStatusEnum.WAITING;
            case entry_status_enum_1.EntryStatusEnum.SERVING:
                return journal_status_enum_1.JournalStatusEnum.SERVING;
            case entry_status_enum_1.EntryStatusEnum.COMPLETED:
                return journal_status_enum_1.JournalStatusEnum.COMPLETED;
            case entry_status_enum_1.EntryStatusEnum.CANCELED:
                return journal_status_enum_1.JournalStatusEnum.CANCELED;
            case entry_status_enum_1.EntryStatusEnum.NO_SHOW:
                return journal_status_enum_1.JournalStatusEnum.NO_SHOW;
            case entry_status_enum_1.EntryStatusEnum.LATE:
                return journal_status_enum_1.JournalStatusEnum.LATE;
            default:
                return null;
        }
    }
};
EntryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entry_entity_1.Entry)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        user_service_1.UserService,
        queue_service_1.QueueService,
        journal_service_1.JournalService])
], EntryService);
exports.EntryService = EntryService;
//# sourceMappingURL=entry.service.js.map