import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginWithEmailDto } from './dto/login-with-email.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UsePipes(new ValidationPipe())
  @Post('/register')
  async createUser(@Body() dto: RegisterDto) {
    return this.authService.createUser(dto);
  }

  @UsePipes(new ValidationPipe())
  @Post('/login')
  async loginWithEmail(@Body() dto: LoginWithEmailDto) {
    return this.authService.loginWithEmail(dto);
  }
}
