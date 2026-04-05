import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { ReservationEntity } from './infrastructure/persistence/entities/reservation.entity.js';
import { GuestEntity } from './infrastructure/persistence/entities/guest.entity.js';

// Mappers
import { ReservationMapper } from './infrastructure/mappers/reservation.mapper.js';
import { GuestMapper } from './infrastructure/mappers/guest.mapper.js';

// Domain repository interfaces
import { IReservationRepository } from './domain/repositories/reservation.repository.js';
import { IGuestRepository } from './domain/repositories/guest.repository.js';

// Infrastructure implementations
import { TypeormReservationRepository } from './infrastructure/persistence/typeorm-reservation.repository.js';
import { TypeormGuestRepository } from './infrastructure/persistence/typeorm-guest.repository.js';

// Use cases
import { CreateReservationUseCase } from './application/use-cases/create-reservation.use-case.js';
import { CancelReservationUseCase } from './application/use-cases/cancel-reservation.use-case.js';
import { ModifyReservationUseCase } from './application/use-cases/modify-reservation.use-case.js';
import { GetMyReservationsUseCase } from './application/use-cases/get-my-reservations.use-case.js';
import { GetReservationDetailUseCase } from './application/use-cases/get-reservation-detail.use-case.js';
import { GetCalendarDataUseCase } from './application/use-cases/get-calendar-data.use-case.js';
import { GetAllReservationsUseCase } from './application/use-cases/get-all-reservations.use-case.js';
import { CreateGuestUseCase } from './application/use-cases/create-guest.use-case.js';
import { CreateGuestReservationUseCase } from './application/use-cases/create-guest-reservation.use-case.js';

// Presentation
import { ReservationController } from './presentation/controllers/reservation.controller.js';
import { StaffReservationController } from './presentation/controllers/staff-reservation.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([ReservationEntity, GuestEntity])],
  controllers: [ReservationController, StaffReservationController],
  providers: [
    // Mappers
    ReservationMapper,
    GuestMapper,

    // Infrastructure bindings
    { provide: IReservationRepository, useClass: TypeormReservationRepository },
    { provide: IGuestRepository, useClass: TypeormGuestRepository },

    // Use cases
    {
      provide: CreateReservationUseCase,
      useFactory: (repo: IReservationRepository): CreateReservationUseCase =>
        new CreateReservationUseCase(repo),
      inject: [IReservationRepository],
    },
    {
      provide: CancelReservationUseCase,
      useFactory: (repo: IReservationRepository): CancelReservationUseCase =>
        new CancelReservationUseCase(repo),
      inject: [IReservationRepository],
    },
    {
      provide: ModifyReservationUseCase,
      useFactory: (repo: IReservationRepository): ModifyReservationUseCase =>
        new ModifyReservationUseCase(repo),
      inject: [IReservationRepository],
    },
    {
      provide: GetMyReservationsUseCase,
      useFactory: (repo: IReservationRepository): GetMyReservationsUseCase =>
        new GetMyReservationsUseCase(repo),
      inject: [IReservationRepository],
    },
    {
      provide: GetReservationDetailUseCase,
      useFactory: (repo: IReservationRepository): GetReservationDetailUseCase =>
        new GetReservationDetailUseCase(repo),
      inject: [IReservationRepository],
    },
    {
      provide: GetCalendarDataUseCase,
      useFactory: (repo: IReservationRepository): GetCalendarDataUseCase =>
        new GetCalendarDataUseCase(repo),
      inject: [IReservationRepository],
    },
    {
      provide: GetAllReservationsUseCase,
      useFactory: (repo: IReservationRepository): GetAllReservationsUseCase =>
        new GetAllReservationsUseCase(repo),
      inject: [IReservationRepository],
    },
    {
      provide: CreateGuestUseCase,
      useFactory: (repo: IGuestRepository): CreateGuestUseCase =>
        new CreateGuestUseCase(repo),
      inject: [IGuestRepository],
    },
    {
      provide: CreateGuestReservationUseCase,
      useFactory: (
        reservationRepo: IReservationRepository,
        guestRepo: IGuestRepository,
      ): CreateGuestReservationUseCase =>
        new CreateGuestReservationUseCase(reservationRepo, guestRepo),
      inject: [IReservationRepository, IGuestRepository],
    },
  ],
})
export class ReservationModule {}
