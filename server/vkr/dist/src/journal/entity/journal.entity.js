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
exports.Journal = void 0;
const entry_entity_1 = require("../../entries/entity/entry.entity");
const typeorm_1 = require("typeorm");
const journal_status_enum_1 = require("./journal-status.enum");
const journal_action_enum_1 = require("./journal-action.enum");
const user_entity_1 = require("../../users/entity/user.entity");
let Journal = class Journal {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'log_id' }),
    __metadata("design:type", Number)
], Journal.prototype, "logId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'entry_id', type: 'bigint' }),
    __metadata("design:type", Number)
], Journal.prototype, "entryId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: journal_action_enum_1.JournalActionEnum,
        name: 'action',
    }),
    __metadata("design:type", String)
], Journal.prototype, "action", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: journal_status_enum_1.JournalStatusEnum,
        name: 'prev_status',
        nullable: true
    }),
    __metadata("design:type", String)
], Journal.prototype, "prevStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: journal_status_enum_1.JournalStatusEnum,
        name: 'new_status',
        nullable: true
    }),
    __metadata("design:type", String)
], Journal.prototype, "newStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'log_time', type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], Journal.prototype, "logTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'initiated_by_user_id', type: 'bigint' }),
    __metadata("design:type", Number)
], Journal.prototype, "initiatedByUserId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'comment', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Journal.prototype, "comment", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => entry_entity_1.Entry, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'entry_id' }),
    __metadata("design:type", entry_entity_1.Entry)
], Journal.prototype, "entry", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.initiatedEvents),
    (0, typeorm_1.JoinColumn)({ name: 'initiated_by_user_id' }),
    __metadata("design:type", user_entity_1.User)
], Journal.prototype, "user", void 0);
Journal = __decorate([
    (0, typeorm_1.Entity)('journal')
], Journal);
exports.Journal = Journal;
//# sourceMappingURL=journal.entity.js.map