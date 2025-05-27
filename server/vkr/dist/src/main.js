"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const swagger_1 = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const bodyParser = require("body-parser");
async function bootstrap() {
    const PORT = process.env.PORT || 3000;
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { rawBody: true, logger: ['log', 'error', 'warn', 'debug', 'verbose'] });
    app.use(bodyParser.text({ type: 'application/xml' }));
    app.use(bodyParser.text({ type: 'text/xml' }));
    app.use(bodyParser.json());
    app.use(bodyParser.text({ type: 'application/yaml' }));
    app.use(bodyParser.urlencoded({ extended: true }));
    const configService = app.get(config_1.ConfigService);
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Education API')
        .setDescription('API documentation for the Education project')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api_docs', app, document);
    app.enableCors({
        origin: ['https://servis-ocheredey.onrender.com/'],
        credentials: true,
    });
    await app.listen(PORT);
    console.log(`Application is running on: ${await app.getUrl()}`);
    console.log(`Swagger documentation available at: ${await app.getUrl()}/api_docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map