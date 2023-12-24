import { Controller, Post, Body } from '@nestjs/common';
import { Lab2Service } from './lab2.service';

@Controller('lab2')
export class Lab2Controller {
  constructor(private readonly lab2Service: Lab2Service) {}

  @Post('executeRawQuery')
  executeRawQuery(@Body() dto: { rawQuery: string }) {
    return this.lab2Service.executeRawQuery(dto.rawQuery);
  }
}
