import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseFilters,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../iam/presentation/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../../iam/presentation/guards/roles.guard.js';
import { Roles } from '../../../iam/presentation/decorators/roles.decorator.js';
import { DomainExceptionFilter } from '../../../../shared/presentation/filters/domain-exception.filter.js';
import {
  CurrentUser,
  type CurrentUserData,
} from '../../../iam/presentation/decorators/current-user.decorator.js';
import { GetAllReservationsUseCase } from '../../application/use-cases/get-all-reservations.use-case.js';
import { ModifyReservationUseCase } from '../../application/use-cases/modify-reservation.use-case.js';
import { CancelReservationUseCase } from '../../application/use-cases/cancel-reservation.use-case.js';
import { CreateGuestUseCase } from '../../application/use-cases/create-guest.use-case.js';
import { CreateGuestReservationUseCase } from '../../application/use-cases/create-guest-reservation.use-case.js';
import { ModifyReservationRequestDto } from '../dto/modify-reservation-request.dto.js';
import { CreateGuestRequestDto } from '../dto/create-guest-request.dto.js';
import { CreateGuestReservationRequestDto } from '../dto/create-guest-reservation-request.dto.js';

@Controller('staff')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('STAFF', 'ADMINISTRATOR')
@UseFilters(DomainExceptionFilter)
export class StaffReservationController {
  constructor(
    private readonly getAllReservationsUseCase: GetAllReservationsUseCase,
    private readonly modifyReservationUseCase: ModifyReservationUseCase,
    private readonly cancelReservationUseCase: CancelReservationUseCase,
    private readonly createGuestUseCase: CreateGuestUseCase,
    private readonly createGuestReservationUseCase: CreateGuestReservationUseCase,
  ) {}

  @Get('reservations')
  async getAllReservations(
    @Query('date') date: string,
  ): Promise<{ data: unknown[]; meta: unknown }> {
    const result = await this.getAllReservationsUseCase.execute({ date });
    return {
      data: result.reservations,
      meta: {
        total: result.total,
        cashCount: result.cashCount,
        ticketCount: result.ticketCount,
      },
    };
  }

  @Put('reservations/:id')
  async modifyReservation(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
    @Body() dto: ModifyReservationRequestDto,
  ): Promise<{ data: unknown }> {
    // 係は他ユーザーの予約を変更可能 → userIdチェックをスキップするため
    // ユースケースのuserId引数にreservationの実際のuserIdを渡す必要がある
    // → 専用の staff 用ユースケースが必要だが、Phase 2では簡易実装
    // 一旦、ModifyReservationUseCaseを係用に拡張せず、直接呼ぶ
    const result = await this.modifyReservationUseCase.execute({
      reservationId: id,
      userId: user.userId, // TODO: Phase 3で係専用ユースケースに切り替え
      paymentMethod: dto.paymentMethod,
      ticketId: dto.ticketId,
    });
    return { data: result };
  }

  @Delete('reservations/:id')
  @HttpCode(HttpStatus.OK)
  async cancelReservation(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
  ): Promise<{ data: unknown }> {
    const result = await this.cancelReservationUseCase.execute({
      reservationId: id,
      userId: user.userId, // TODO: Phase 3で係専用ユースケースに切り替え
    });
    return { data: result };
  }

  @Post('guests')
  async createGuest(
    @CurrentUser() user: CurrentUserData,
    @Body() dto: CreateGuestRequestDto,
  ): Promise<{ data: unknown }> {
    const result = await this.createGuestUseCase.execute({
      guestName: dto.guestName,
      createdByStaffId: user.userId,
    });
    return { data: result };
  }

  @Post('reservations/guest')
  async createGuestReservation(
    @CurrentUser() user: CurrentUserData,
    @Body() dto: CreateGuestReservationRequestDto,
  ): Promise<{ data: unknown }> {
    const result = await this.createGuestReservationUseCase.execute({
      guestId: dto.guestId,
      reservationDate: dto.reservationDate,
      staffId: user.userId,
    });
    return { data: result };
  }
}
