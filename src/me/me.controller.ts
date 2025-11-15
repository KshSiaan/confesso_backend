import { Controller, Get, Headers, Patch, UseGuards } from '@nestjs/common';
import { MeService } from './me.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('me')
export class MeController {
  constructor(private readonly MeService: MeService) {}
  @Get()
  async getMe(@Headers('authorization') authHeader: string) {
    const token = authHeader?.split(' ')[1];
    return await this.MeService.getMe(token);
  }
  @Patch()
  @UseGuards(AuthGuard)
  updateMe() {
    return 'Update me hit!';
  }
}
