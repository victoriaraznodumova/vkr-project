import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../users/user.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entity/user.entity';
import { PasswordResetToken } from './entity/password-reset-token.entity';
import { PasswordResetTokensService } from './password-reset-tokens.service';
import { ConfigModule, ConfigService } from '@nestjs/config'; // Импортируем ConfigModule и ConfigService

@Module({
  imports: [
    UserModule,
    TypeOrmModule.forFeature([PasswordResetToken]),
    PassportModule,

    // Используем registerAsync для асинхронной конфигурации JwtModule
    JwtModule.registerAsync({
      imports: [ConfigModule], // Импортируем ConfigModule, чтобы использовать ConfigService
      useFactory: async (configService: ConfigService) => ({
        // Получаем секретный ключ из ConfigService
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '60m' },
      }),
      inject: [ConfigService], // Инжектируем ConfigService в useFactory
    }),
  ],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    PasswordResetTokensService,
  ],
  controllers: [AuthController],
  exports: [AuthService, JwtModule, PassportModule],
})
export class AuthModule {}
