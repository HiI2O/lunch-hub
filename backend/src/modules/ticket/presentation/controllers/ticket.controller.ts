import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
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
import { GetMyTicketsUseCase } from '../../application/use-cases/get-my-tickets.use-case.js';
import { GetTicketDetailUseCase } from '../../application/use-cases/get-ticket-detail.use-case.js';
import { CreateTicketPurchaseReservationUseCase } from '../../application/use-cases/create-ticket-purchase-reservation.use-case.js';
import { CancelTicketPurchaseReservationUseCase } from '../../application/use-cases/cancel-ticket-purchase-reservation.use-case.js';
import { CreatePurchaseReservationRequestDto } from '../dto/create-purchase-reservation-request.dto.js';

@Controller('tickets')
@UseGuards(JwtAuthGuard)
@UseFilters(DomainExceptionFilter)
export class TicketController {
  constructor(
    private readonly getMyTickets: GetMyTicketsUseCase,
    private readonly getTicketDetail: GetTicketDetailUseCase,
    private readonly createPurchaseReservation: CreateTicketPurchaseReservationUseCase,
    private readonly cancelPurchaseReservation: CancelTicketPurchaseReservationUseCase,
  ) {}

  @Get()
  async listMyTickets(
    @CurrentUser() user: CurrentUserData,
  ): Promise<{ data: unknown }> {
    const data = await this.getMyTickets.execute({ userId: user.userId });
    return { data };
  }

  @Get(':id')
  async detail(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData,
  ): Promise<{ data: unknown }> {
    const data = await this.getTicketDetail.execute({
      ticketId: id,
      userId: user.userId,
    });
    return { data };
  }

  @Post('purchase')
  @HttpCode(HttpStatus.CREATED)
  async createPurchase(
    @Body() dto: CreatePurchaseReservationRequestDto,
    @CurrentUser() user: CurrentUserData,
  ): Promise<{ data: unknown }> {
    const data = await this.createPurchaseReservation.execute({
      userId: user.userId,
      purchaseDate: dto.purchaseDate,
      quantity: dto.quantity,
    });
    return { data };
  }

  @Delete('purchase/:id')
  async cancelPurchase(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData,
  ): Promise<{ data: unknown }> {
    const data = await this.cancelPurchaseReservation.execute({
      purchaseReservationId: id,
      userId: user.userId,
    });
    return { data };
  }
}
