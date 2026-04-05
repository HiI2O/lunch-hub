import {
  Controller,
  Get,
  Post,
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
import { GetOrdersUseCase } from '../../application/use-cases/get-orders.use-case.js';
import { PlaceOrderUseCase } from '../../application/use-cases/place-order.use-case.js';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('STAFF', 'ADMINISTRATOR')
@UseFilters(DomainExceptionFilter)
export class OrderController {
  constructor(
    private readonly getOrders: GetOrdersUseCase,
    private readonly placeOrder: PlaceOrderUseCase,
  ) {}

  @Get()
  async list(
    @Query('from') from: string,
    @Query('to') to: string,
  ): Promise<{ data: unknown }> {
    const data = await this.getOrders.execute({ from, to });
    return { data };
  }

  @Post(':id/place')
  @HttpCode(HttpStatus.OK)
  async place(@Param('id') id: string): Promise<{ data: unknown }> {
    const data = await this.placeOrder.execute({ orderId: id });
    return { data };
  }
}
