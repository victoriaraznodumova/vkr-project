import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport'; 

/**
 * Passport Guard для аутентификации с использованием JWT.
 * Использует JwtStrategy ('jwt').
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {} // 'jwt' соответствует имени стратегии JwtStrategy
