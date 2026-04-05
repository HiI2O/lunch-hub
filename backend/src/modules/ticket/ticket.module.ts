import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { TicketEntity } from './infrastructure/persistence/entities/ticket.entity.js';
import { TicketPurchaseReservationEntity } from './infrastructure/persistence/entities/ticket-purchase-reservation.entity.js';

// Mappers
import { TicketMapper } from './infrastructure/mappers/ticket.mapper.js';
import { TicketPurchaseReservationMapper } from './infrastructure/mappers/ticket-purchase-reservation.mapper.js';

// Domain repository interfaces
import { ITicketRepository } from './domain/repositories/ticket.repository.js';
import { ITicketPurchaseReservationRepository } from './domain/repositories/ticket-purchase-reservation.repository.js';

// Infrastructure implementations
import { TypeormTicketRepository } from './infrastructure/persistence/typeorm-ticket.repository.js';
import { TypeormTicketPurchaseReservationRepository } from './infrastructure/persistence/typeorm-ticket-purchase-reservation.repository.js';

// Use cases
import { GetMyTicketsUseCase } from './application/use-cases/get-my-tickets.use-case.js';
import { GetTicketDetailUseCase } from './application/use-cases/get-ticket-detail.use-case.js';
import { CreateTicketPurchaseReservationUseCase } from './application/use-cases/create-ticket-purchase-reservation.use-case.js';
import { CancelTicketPurchaseReservationUseCase } from './application/use-cases/cancel-ticket-purchase-reservation.use-case.js';
import { ReceiveTicketUseCase } from './application/use-cases/receive-ticket.use-case.js';

// Presentation
import { TicketController } from './presentation/controllers/ticket.controller.js';
import { StaffTicketController } from './presentation/controllers/staff-ticket.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([TicketEntity, TicketPurchaseReservationEntity]),
  ],
  controllers: [TicketController, StaffTicketController],
  providers: [
    // Mappers
    TicketMapper,
    TicketPurchaseReservationMapper,

    // Infrastructure bindings
    { provide: ITicketRepository, useClass: TypeormTicketRepository },
    {
      provide: ITicketPurchaseReservationRepository,
      useClass: TypeormTicketPurchaseReservationRepository,
    },

    // Use cases
    {
      provide: GetMyTicketsUseCase,
      useFactory: (repo: ITicketRepository): GetMyTicketsUseCase =>
        new GetMyTicketsUseCase(repo),
      inject: [ITicketRepository],
    },
    {
      provide: GetTicketDetailUseCase,
      useFactory: (repo: ITicketRepository): GetTicketDetailUseCase =>
        new GetTicketDetailUseCase(repo),
      inject: [ITicketRepository],
    },
    {
      provide: CreateTicketPurchaseReservationUseCase,
      useFactory: (
        ticketRepo: ITicketRepository,
        prRepo: ITicketPurchaseReservationRepository,
      ): CreateTicketPurchaseReservationUseCase =>
        new CreateTicketPurchaseReservationUseCase(ticketRepo, prRepo),
      inject: [ITicketRepository, ITicketPurchaseReservationRepository],
    },
    {
      provide: CancelTicketPurchaseReservationUseCase,
      useFactory: (
        prRepo: ITicketPurchaseReservationRepository,
      ): CancelTicketPurchaseReservationUseCase =>
        new CancelTicketPurchaseReservationUseCase(prRepo),
      inject: [ITicketPurchaseReservationRepository],
    },
    {
      provide: ReceiveTicketUseCase,
      useFactory: (
        ticketRepo: ITicketRepository,
        prRepo: ITicketPurchaseReservationRepository,
      ): ReceiveTicketUseCase => new ReceiveTicketUseCase(ticketRepo, prRepo),
      inject: [ITicketRepository, ITicketPurchaseReservationRepository],
    },
  ],
})
export class TicketModule {}
