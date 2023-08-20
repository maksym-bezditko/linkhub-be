import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class RtJwtGuard extends AuthGuard('jwt-rt') {}
