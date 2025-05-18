import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConfirmPasswordResetDto {
  @ApiProperty({ description: 'Адрес электронной почты пользователя', example: 'user@example.com' })
  @IsNotEmpty({ message: 'Email не может быть пустым' })
  @IsEmail({}, { message: 'Некорректный формат email' })
  email: string;

  @ApiProperty({ description: 'Четырехзначный код подтверждения', example: '1234' })
  @IsNotEmpty({ message: 'Код подтверждения не может быть пустым' })
  @IsString({ message: 'Код подтверждения должен быть строкой' })
  @Length(4, 4, { message: 'Код подтверждения должен состоять из 4 символов' })
  code: string;
}