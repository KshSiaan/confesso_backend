import { Body, Controller, Get, Headers, Patch, UseGuards } from '@nestjs/common';
import { MeService } from './me.service';
import type UserType from 'src/lib/types/user';

@Controller('me')
export class MeController {
  constructor(private readonly MeService: MeService) {}
  @Get()
  async getMe(@Headers('authorization') authHeader: string) {
    const token = authHeader?.split(' ')[1];
    return await this.MeService.getMe(token);
  }
  @Patch()
  async updateMe(@Headers('authorization') authHeader: string,@Body() body: UserType,) {
    const token = authHeader?.split(' ')[1];
    
    return await this.MeService.updateMe(token,body);
  }
}
