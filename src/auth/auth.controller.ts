import {
  Body,
  Controller,
  HttpCode,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginWithEmailDto } from './dto/login-with-email.dto';
import { UserIdFromJwt } from 'src/decorators/user-id.decorator';
import { AtJwtGuard } from './guards/jwt-at.guard';
import { RtJwtGuard } from './guards/jwt-rt.guard';
import { RefreshTokenFroId } from 'src/decorators/refresh-token.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UsePipes(new ValidationPipe())
  @Post('/register')
  async createUser(@Body() dto: RegisterDto) {
    return this.authService.createUser(dto);
  }

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post('/login')
  async loginWithEmail(@Body() dto: LoginWithEmailDto) {
    return this.authService.loginWithEmail(dto);
  }

  @UseGuards(AtJwtGuard)
  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post('/logout')
  async logout(@UserIdFromJwt() userId: string) {
    return this.authService.logout(userId);
  }

  @UseGuards(RtJwtGuard)
  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post('/refresh')
  async refresh(
    @UserIdFromJwt() userId: string,
    @RefreshTokenFroId() refreshToken: string,
  ) {
    return this.authService.refreshToken(userId, refreshToken);
  }
}
