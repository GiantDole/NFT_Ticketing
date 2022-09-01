import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { EventsModule } from './events/events.module';
import { TicketsModule } from './tickets/tickets.module';
import { OrganizersModule } from './organizers/organizers.module';
import { BlockchainModule } from './blockchain/blockchain.module';

@Module({
  imports: [
    UsersModule,
    EventsModule,
    TicketsModule,
    OrganizersModule,
    BlockchainModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
