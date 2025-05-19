import { Strategy } from 'passport-local'; 
import { PassportStrategy } from '@nestjs/passport'; 
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { User } from '../../users/entity/user.entity'; 

/**
 * Passport Strategy для локальной аутентификации (по email и паролю).
 * Используется LocalAuthGuard.
 */
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email', // Указываем, какое поле в теле запроса использовать как "имя пользователя"
      passwordField: 'password', // Указываем, какое поле использовать как "пароль"
    });
  }

  /**
   * Метод валидации, который вызывается Passport.js при попытке локальной аутентификации.
   * @param email Значение из usernameField.
   * @param password Значение из passwordField.
   * @returns Promise с объектом пользователя, если валидация успешна, иначе null или выбрасывает UnauthorizedException.
   */
  async validate(email: string, password: string): Promise<User> {
    // Используем метод validateUser из AuthService для проверки учетных данных
    const user = await this.authService.validateUser(email, password);

    // Если validateUser вернул null (неверные учетные данные), выбрасываем исключение
    if (!user) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    // Если валидация успешна, возвращаем объект пользователя.
    // Этот объект будет добавлен в req.user в контроллере при использовании LocalAuthGuard.
    // Важно: не возвращайте здесь хеш пароля!
    return user; // Возвращаем сущность User (без хеша пароля, т.к. он excluded в DTO)
  }
}
