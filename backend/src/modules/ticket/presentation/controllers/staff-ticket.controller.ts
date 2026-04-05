import {
  Controller,
  Post,
  Param,
  UseGuards,
  UseFilters,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../iam/presentation/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../../iam/presentation/guards/roles.guard.js';
import { Roles } from '../../../iam/presentation/decorators/roles.decorator.js';
import { DomainExceptionFilter } from '../../../../shared/presentation/filters/domain-exception.filter.js';
import { ReceiveTicketUseCase } from '../../application/use-cases/receive-ticket.use-case.js';

@Controller('staff/tickets')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('STAFF', 'ADMINISTRATOR')
@UseFilters(DomainExceptionFilter)
export class StaffTicketController {
  constructor(private readonly receiveTicket: ReceiveTicketUseCase) {}

  @Post(':purchaseReservationId/receive')
  @HttpCode(HttpStatus.OK)
  async receive(
    @Param('purchaseReservationId') prId: string,
  ): Promise<{ data: unknown }> {
    const data = await this.receiveTicket.execute({
      purchaseReservationId: prId,
    });
    return { data };
  }
}
