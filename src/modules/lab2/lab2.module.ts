import { Module } from '@nestjs/common';
import { Lab2Service } from './lab2.service';
import { Lab2Controller } from './lab2.controller';
import { PrismaService } from '../database/prisma.service';

@Module({
  controllers: [Lab2Controller],
  providers: [Lab2Service, PrismaService],
})
export class Lab2Module {}
