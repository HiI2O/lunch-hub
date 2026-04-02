import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  UseFilters,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { GetUserProfileUseCase } from '../../application/use-cases/get-user-profile.use-case.js';
import { ChangePasswordUseCase } from '../../application/use-cases/change-password.use-case.js';
import { JwtAuthGuard } from '../guards/jwt-auth.guard.js';
import { DomainExceptionFilter } from '../../../../shared/presentation/filters/domain-exception.filter.js';
import { ChangePasswordRequestDto } from '../dto/change-password-request.dto.js';
import {
  CurrentUser,
  type CurrentUserData,
} from '../decorators/current-user.decorator.js';
import type { UserProfileDto } from '../../application/dto/user-profile.dto.js';

@Controller('users')
@UseGuards(JwtAuthGuard)
@UseFilters(DomainExceptionFilter)
export class UserController {
  constructor(
    private readonly getUserProfileUseCase: GetUserProfileUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase,
  ) {}

  @Get('me')
  async getMyProfile(
    @CurrentUser() currentUser: CurrentUserData,
  ): Promise<{ data: UserProfileDto }> {
    const profile = await this.getUserProfileUseCase.execute(
      currentUser.userId,
    );
    return { data: profile };
  }

  @Put('me/password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @CurrentUser() currentUser: CurrentUserData,
    @Body() dto: ChangePasswordRequestDto,
  ): Promise<{ data: { message: string } }> {
    await this.changePasswordUseCase.execute(
      currentUser.userId,
      dto.currentPassword,
      dto.newPassword,
    );

    return { data: { message: 'Password changed successfully' } };
  }
}
