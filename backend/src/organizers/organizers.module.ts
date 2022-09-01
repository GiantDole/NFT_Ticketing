import { Module } from '@nestjs/common';
import { OrganizersService } from './organizers.service';
import { OrganizersController } from './organizers.controller';

@Module({
  controllers: [OrganizersController],
  providers: [OrganizersService],
})
export class OrganizersModule {}
