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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Entry = void 0;
const journal_entity_1 = require("../../journal/entity/journal.entity");
const queue_entity_1 = require("../../queues/entity/queue.entity");
const user_entity_1 = require("../../users/entity/user.entity");
const typeorm_1 = require("typeorm");
const entry_status_enum_1 = require("./entry-status.enum");
let Entry = class Entry {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'entry_id' }),
    __metadata("design:type", Number)
], Entry.prototype, "entryId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'queue_id', type: 'bigint' }),
    __metadata("design:type", Number)
], Entry.prototype, "queueId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', type: 'bigint' }),
    __metadata("design:type", Number)
], Entry.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: entry_status_enum_1.EntryStatusEnum,
        name: 'status',
    }),
    __metadata("design:type", String)
], Entry.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], Entry.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'entry_time_org', type: 'timestamp with time zone', nullable: true }),
    __metadata("design:type", Date)
], Entry.prototype, "entryTimeOrg", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'entry_position_self', type: 'integer', nullable: true }),
    __metadata("design:type", Number)
], Entry.prototype, "entryPositionSelf", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sequential_number_self', type: 'integer', nullable: true }),
    __metadata("design:type", Number)
], Entry.prototype, "sequentialNumberSelf", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'status_updated_at', type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], Entry.prototype, "statusUpdatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'notification_minutes', type: 'integer', nullable: true }),
    __metadata("design:type", Number)
], Entry.prototype, "notificationMinutes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'notification_position', type: 'integer', nullable: true }),
    __metadata("design:type", Number)
], Entry.prototype, "notificationPosition", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'actual_start_time', type: 'timestamp with time zone', nullable: true }),
    __metadata("design:type", Date)
], Entry.prototype, "actualStartTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'actual_end_time', type: 'timestamp with time zone', nullable: true }),
    __metadata("design:type", Date)
], Entry.prototype, "actualEndTime", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.entries),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], Entry.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => queue_entity_1.Queue, (queue) => queue.entries),
    (0, typeorm_1.JoinColumn)({ name: 'queue_id' }),
    __metadata("design:type", queue_entity_1.Queue)
], Entry.prototype, "queue", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => journal_entity_1.Journal, (journal) => journal.entry),
    __metadata("design:type", Array)
], Entry.prototype, "logs", void 0);
Entry = __decorate([
    (0, typeorm_1.Entity)('entries')
], Entry);
exports.Entry = Entry;
//# sourceMappingURL=entry.entity.js.map