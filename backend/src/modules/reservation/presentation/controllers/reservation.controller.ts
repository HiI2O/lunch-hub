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
import { DomainExceptionFilter } from '../../../../shared/presentation/filters/domain-exception.filter.js';
import {
  CurrentUser,
  type CurrentUserData,
} from '../../../iam/presentation/decorators/current-user.decorator.js';
import { CreateReservationUseCase } from '../../application/use-cases/create-reservation.use-case.js';
import { CancelReservationUseCase } from '../../application/use-cases/cancel-reservation.use-case.js';
import { ModifyReservationUseCase } from '../../application/use-cases/modify-reservation.use-case.js';
import { GetMyReservationsUseCase } from '../../application/use-cases/get-my-reservations.use-case.js';
import { GetReservationDetailUseCase } from '../../application/use-cases/get-reservation-detail.use-case.js';
import { GetCalendarDataUseCase } from '../../application/use-cases/get-calendar-data.use-case.js';
import { CreateReservationRequestDto } from '../dto/create-reservation-request.dto.js';
import { ModifyReservationRequestDto } from '../dto/modify-reservation-request.dto.js';

@Controller('reservations')
@UseGuards(JwtAuthGuard)
@UseFilters(DomainExceptionFilter)
export class ReservationController {
  constructor(
    private readonly createReservationUseCase: CreateReservationUseCase,
    private readonly cancelReservationUseCase: CancelReservationUseCase,
    private readonly modifyReservationUseCase: ModifyReservationUseCase,
    private readonly getMyReservationsUseCase: GetMyReservationsUseCase,
    private readonly getReservationDetailUseCase: GetReservationDetailUseCase,
    private readonly getCalendarDataUseCase: GetCalendarDataUseCase,
  ) {}

  @Get()
  async getMyReservations(
    @CurrentUser() user: CurrentUserData,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('status') status?: string,
  ): Promise<{ data: unknown[] }> {
    const result = await this.getMyReservationsUseCase.execute({
      userId: user.userId,
      from,
      to,
      status,
    });
    return { data: result };
  }

  @Get('calendar')
  async getCalendarData(
    @CurrentUser() user: CurrentUserData,
    @Query('year') year: string,
    @Query('month') month: string,
  ): Promise<{ data: unknown }> {
    const result = await this.getCalendarDataUseCase.execute({
      userId: user.userId,
      year: parseInt(year, 10),
      month: parseInt(month, 10),
    });
    return { data: result };
  }

  @Get(':id')
  async getReservationDetail(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
  ): Promise<{ data: unknown }> {
    const result = await this.getReservationDetailUseCase.execute({
      reservationId: id,
      userId: user.userId,
    });
    return { data: result };
  }

  @Post()
  async createReservation(
    @CurrentUser() user: CurrentUserData,
    @Body() dto: CreateReservationRequestDto,
  ): Promise<{ data: unknown }> {
    const result = await this.createReservationUseCase.execute({
      userId: user.userId,
      reservationDate: dto.reservationDate,
      paymentMethod: dto.paymentMethod,
      ticketId: dto.ticketId,
    });
    return { data: result };
  }

  @Put(':id')
  async modifyReservation(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
    @Body() dto: ModifyReservationRequestDto,
  ): Promise<{ data: unknown }> {
    const result = await this.modifyReservationUseCase.execute({
      reservationId: id,
      userId: user.userId,
      paymentMethod: dto.paymentMethod,
      ticketId: dto.ticketId,
    });
    return { data: result };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async cancelReservation(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
  ): Promise<{ data: unknown }> {
    const result = await this.cancelReservationUseCase.execute({
      reservationId: id,
      userId: user.userId,
    });
    return { data: result };
  }
}
