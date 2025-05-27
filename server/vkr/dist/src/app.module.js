"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const user_module_1 = require("./users/user.module");
const config_1 = require("@nestjs/config");
const auth_module_1 = require("./auth/auth.module");
const mailer_1 = require("@nestjs-modules/mailer");
const path_1 = require("path");
const handlebars_adapter_1 = require("@nestjs-modules/mailer/dist/adapters/handlebars.adapter");
const organization_module_1 = require("./organizations/organization.module");
const queue_module_1 = require("./queues/queue.module");
const journal_module_1 = require("./journal/journal.module");
const entry_module_1 = require("./entries/entry.module");
const integration_module_1 = require("./integration/integration.module");
let AppModule = class AppModule {
};
AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                envFilePath: `.${process.env.NODE_ENV}.env`,
                isGlobal: true,
            }),
            typeorm_1.TypeOrmModule.forRoot({
                type: 'postgres',
                port: Number(process.env.POSTGRES_PORT),
                username: process.env.POSTGRES_USER,
                password: process.env.POSTGRES_PASSWORD,
                host: process.env.POSTGRES_HOST,
                database: process.env.POSTGRES_DB,
                synchronize: false,
                logging: 'all',
                entities: ['dist/**/*.entity{.ts,.js}'],
                migrations: [__dirname + '/migration/*{.ts,.js}'],
                migrationsRun: true,
            }),
            user_module_1.UserModule,
            auth_module_1.AuthModule,
            organization_module_1.OrganizationsModule,
            queue_module_1.QueueModule,
            journal_module_1.JournalModule,
            entry_module_1.EntryModule,
            integration_module_1.IntegrationModule,
            mailer_1.MailerModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => ({
                    transport: {
                        host: configService.get('EMAIL_HOST'),
                        port: configService.get('EMAIL_PORT'),
                        secure: configService.get('EMAIL_SECURE'),
                        auth: {
                            user: configService.get('EMAIL_USER'),
                            pass: configService.get('EMAIL_PASSWORD'),
                        },
                    },
                    defaults: {
                        from: configService.get('EMAIL_FROM'),
                    },
                    template: {
                        dir: (0, path_1.join)(__dirname, '..', 'src', 'mail'),
                        adapter: new handlebars_adapter_1.HandlebarsAdapter(),
                        options: {
                            strict: true,
                        },
                    },
                }),
                inject: [config_1.ConfigService],
            }),
        ],
    })
], AppModule);
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map