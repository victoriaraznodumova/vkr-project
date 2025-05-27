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
exports.User = void 0;
const administrator_entity_1 = require("../../administrators/administrator.entity");
const password_reset_token_entity_1 = require("../../auth/entity/password-reset-token.entity");
const entry_entity_1 = require("../../entries/entity/entry.entity");
const journal_entity_1 = require("../../journal/entity/journal.entity");
const queue_entity_1 = require("../../queues/entity/queue.entity");
const typeorm_1 = require("typeorm");
let User = class User {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'user_id' }),
    __metadata("design:type", Number)
], User.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'email', type: 'character varying' }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'password_hash', type: 'character varying' }),
    __metadata("design:type", String)
], User.prototype, "passwordHash", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'registration_date', type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], User.prototype, "registrationDate", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => entry_entity_1.Entry, (entry) => entry.user),
    __metadata("design:type", Array)
], User.prototype, "entries", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => administrator_entity_1.Administrator, (administrator) => administrator.user),
    __metadata("design:type", Array)
], User.prototype, "administrators", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => queue_entity_1.Queue, (queue) => queue.createdByUserId),
    __metadata("design:type", Array)
], User.prototype, "queues", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => journal_entity_1.Journal, (journal) => journal.initiatedByUserId),
    __metadata("design:type", Array)
], User.prototype, "initiatedEvents", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => password_reset_token_entity_1.PasswordResetToken, (token) => token.user),
    __metadata("design:type", Array)
], User.prototype, "passwordResetTokens", void 0);
User = __decorate([
    (0, typeorm_1.Entity)('users')
], User);
exports.User = User;
//# sourceMappingURL=user.entity.js.map