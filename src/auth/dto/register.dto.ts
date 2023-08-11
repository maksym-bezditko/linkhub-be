import { IsEmail, IsString, MinLength, ValidateIf } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  userName: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  fullName: string;

  @IsString()
  @ValidateIf((_, value) => value !== null)
  bio!: string | null;

  @IsString()
  @ValidateIf((_, value) => value !== null)
  profileLink: string | null;
}
