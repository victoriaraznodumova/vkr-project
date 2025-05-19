import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './users/user.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';



@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.${process.env.NODE_ENV}.env`
    }),
    TypeOrmModule.forRoot({
      type: 'postgres', //тип подключаемой БД
      port: Number(process.env.POSTGRES_PORT), //порт      
      username: process.env.POSTGRES_USER, //имя пользователя
      password: process.env.POSTGRES_PASSWORD, //пароль
      host: process.env.POSTGRES_HOST, //хост, в нашем случае БД развернута локально
      database: process.env.POSTGRES_DB,
      synchronize: false, //отключаем автосинхронизацию(в противном случае при каждом перезапуске наша БД будет создаваться заново)
      logging: 'all', //включим логирование для удобства отслеживания процессов
	  entities: ['dist/**/*.entity{.ts,.js}'], //указываем путь к сущностям
    
    }),
    UserModule,
    AuthModule

],
  // controllers: [AppController],
  // providers: [AppService],
})
export class AppModule {}
