import { IsEmail, IsNotEmpty, IsString, MinLength, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ description: 'Адрес электронной почты пользователя', example: 'user@example.com' })
  @IsNotEmpty({ message: 'Email не может быть пустым' })
  @IsEmail({}, { message: 'Некорректный формат email' })
  email: string;

  @ApiProperty({ description: 'Код подтверждения из письма', example: '123456' })
  @IsNotEmpty({ message: 'Код подтверждения не может быть пустым' })
  @IsString({ message: 'Код подтверждения должен быть строкой' })
  @Length(6, 6, { message: 'Код подтверждения должен состоять из 6 символов' })
  code: string; // Код нужен для повторной валидации запроса на этом шаге

  @ApiProperty({ description: 'Новый пароль пользователя (минимум 8 символов)', example: 'NewSecurePassword456!' })
  @IsNotEmpty({ message: 'Новый пароль не может быть пустым' })
  @IsString({ message: 'Новый пароль должен быть строкой' })
  @MinLength(8, { message: 'Новый пароль должен быть не менее 8 символов' })
  // Можно добавить более строгие правила для пароля с помощью Matches
  // @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])(?=.{8,})/, { message: 'Пароль слишком простой' })
  newPassword: string;

  @ApiProperty({ description: 'Повтор нового пароля для подтверждения', example: 'NewSecurePassword456!' })
  @IsNotEmpty({ message: 'Повтор пароля не может быть пустым' })
  @IsString({ message: 'Повтор пароля должен быть строкой' })
  // На бэкенде нужно сравнить newPassword и confirmNewPassword в сервисе или пайпе
  confirmNewPassword: string;
}
