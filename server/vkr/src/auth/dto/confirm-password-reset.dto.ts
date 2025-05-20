import { IsEmail, IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConfirmPasswordResetDto {
  @ApiProperty({ description: 'Адрес электронной почты пользователя', example: 'user@example.com' })
  @IsNotEmpty({ message: 'Email не может быть пустым' })
  @IsEmail({}, { message: 'Некорректный формат email' })
  email: string;

  @ApiProperty({ description: 'Шестизначный код подтверждения', example: '123456' })
  @IsNotEmpty({ message: 'Код подтверждения не может быть пустым' })
  @IsString({ message: 'Код подтверждения должен быть строкой' })
  @Length(6, 6, { message: 'Код подтверждения должен состоять из 6 символов' })
  @Matches(/^\d{6}$/, { message: 'Код подтверждения должен состоять из 6 цифр' })
  code: string;
}