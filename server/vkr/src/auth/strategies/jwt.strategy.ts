// import { ExtractJwt, Strategy } from 'passport-jwt';
// import { PassportStrategy } from '@nestjs/passport'; 
// import { Injectable, UnauthorizedException } from '@nestjs/common';
// import { AuthService } from '../auth.service'; 
// import { User } from '../../users/entity/user.entity'; 

// /**
//  * Passport Strategy для аутентификации с использованием JWT-токена.
//  * Используется JwtAuthGuard.
//  */
// @Injectable()
// export class JwtStrategy extends PassportStrategy(Strategy) {
//   constructor(private authService: AuthService) {
//     super({
//       // Метод для извлечения JWT из запроса (например, из заголовка Authorization: Bearer <token>)
//       jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//       // Секретный ключ должен совпадать с тем, что используется в JwtModule.register
//       secretOrKey: process.env.JWT_SECRET || 'YOUR_SUPER_SECRET_KEY',
//       // Игнорировать ли токены с истекшим сроком действия (обычно false, чтобы Passport обрабатывал истечение)
//       ignoreExpiration: false,
//     });
//   }

//   /**
//    * Метод валидации, который вызывается Passport.js после успешной верификации JWT.
//    * @param payload Данные из полезной нагрузки JWT (то, что мы поместили в токен при входе).
//    * @returns Promise с объектом пользователя, если валидация успешна, иначе null или выбрасывает UnauthorizedException.
//    */
//   async validate(payload: any): Promise<User> {
//     // Payload должен содержать информацию, достаточную для идентификации пользователя (например, userId)
//     // Предполагаем, что payload имеет структуру { email: string, sub: number } (где sub - это userId)
//     const userId = payload.sub;

//     // Находим пользователя в базе данных по ID из токена, используя AuthService
//     const user = await this.authService.getAuthenticatedUser(userId);

//     // Если пользователь не найден (например, удален после выдачи токена), выбрасываем исключение
//     if (!user) {
//       throw new UnauthorizedException('Пользователь не найден');
//     }

//     // Этот объект будет добавлен в req.user в контроллерах, использующих JwtAuthGuard.
//     // не возвращать здесь хеш пароля!
//     return user; 
//   }
// }






// src/auth/strategies/jwt.strategy.ts

import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common'; // Импортируем Logger
import { AuthService } from '../auth.service';
import { User } from '../../users/entity/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name); // Создаем логгер

  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET , // Убедитесь, что здесь правильный секрет
      ignoreExpiration: false,
    });
  }

  async validate(payload: any): Promise<User> {
    this.logger.debug(`Validating JWT payload: ${JSON.stringify(payload)}`); // Логируем полезную нагрузку

    const userId = payload.sub; // Получаем userId из полезной нагрузки

    if (!userId) {
        this.logger.warn('JWT payload does not contain userId (sub)');
        throw new UnauthorizedException('Invalid token payload');
    }

    // Находим пользователя в базе данных по ID из токена
    const user = await this.authService.getAuthenticatedUser(userId);
    this.logger.debug(`User found for userId ${userId}: ${user ? 'Yes' : 'No'}`); // Логируем, найден ли пользователь

    // Если пользователь не найден (например, удален после выдачи токена), выбрасываем исключение
    if (!user) {
      this.logger.warn(`User with ID ${userId} not found during JWT validation`);
      throw new UnauthorizedException('Пользователь не найден');
    }

    // Если валидация успешна, возвращаем объект пользователя.
    // Этот объект будет добавлен в req.user в контроллерах.
    return user;
  }
}

