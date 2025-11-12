import { Controller, Get } from '@nestjs/common';
import UserType from 'src/lib/types/user';

@Controller('me')
export class MeController {
  @Get()
  getMe() {
    return 'Hello me';
  }
}
