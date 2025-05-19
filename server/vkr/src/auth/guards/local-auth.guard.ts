import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport'; // Импортируем AuthGuard из @nestjs/passport

/**
 * Passport Guard для локальной аутентификации.
 * Использует LocalStrategy ('local').
 */
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {} // 'local' соответствует имени стратегии LocalStrategy
