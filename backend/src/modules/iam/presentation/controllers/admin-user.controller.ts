import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  UseFilters,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { InviteUserUseCase } from '../../application/use-cases/invite-user.use-case.js';
import { GetUserListUseCase } from '../../application/use-cases/get-user-list.use-case.js';
import { ResendInvitationUseCase } from '../../application/use-cases/resend-invitation.use-case.js';
import { CancelInvitationUseCase } from '../../application/use-cases/cancel-invitation.use-case.js';
import { DeactivateUserUseCase } from '../../application/use-cases/deactivate-user.use-case.js';
import { ReactivateUserUseCase } from '../../application/use-cases/reactivate-user.use-case.js';
import { ChangeRoleUseCase } from '../../application/use-cases/change-role.use-case.js';
import { ForceLogoutUseCase } from '../../application/use-cases/force-logout.use-case.js';
import { JwtAuthGuard } from '../guards/jwt-auth.guard.js';
import { RolesGuard } from '../guards/roles.guard.js';
import { Roles } from '../decorators/roles.decorator.js';
import { DomainExceptionFilter } from '../../../../shared/presentation/filters/domain-exception.filter.js';
import { InviteRequestDto } from '../dto/invite-request.dto.js';
import { ChangeRoleRequestDto } from '../dto/change-role-request.dto.js';
import {
  CurrentUser,
  type CurrentUserData,
} from '../decorators/current-user.decorator.js';
import type { UserProfileDto } from '../../application/dto/user-profile.dto.js';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMINISTRATOR')
@UseFilters(DomainExceptionFilter)
export class AdminUserController {
  constructor(
    private readonly inviteUserUseCase: InviteUserUseCase,
    private readonly getUserListUseCase: GetUserListUseCase,
    private readonly resendInvitationUseCase: ResendInvitationUseCase,
    private readonly cancelInvitationUseCase: CancelInvitationUseCase,
    private readonly deactivateUserUseCase: DeactivateUserUseCase,
    private readonly reactivateUserUseCase: ReactivateUserUseCase,
    private readonly changeRoleUseCase: ChangeRoleUseCase,
    private readonly forceLogoutUseCase: ForceLogoutUseCase,
  ) {}

  @Post('invite')
  @HttpCode(HttpStatus.CREATED)
  async invite(
    @Body() dto: InviteRequestDto,
    @CurrentUser() currentUser: CurrentUserData,
  ): Promise<{ data: { userId: string; email: string } }> {
    const result = await this.inviteUserUseCase.execute(
      { email: dto.email, role: dto.role },
      currentUser.userId,
    );

    return { data: { userId: result.userId, email: result.email } };
  }

  @Get()
  async list(): Promise<{ data: readonly UserProfileDto[] }> {
    const users = await this.getUserListUseCase.execute();
    return { data: users };
  }

  @Post(':id/resend-invitation')
  @HttpCode(HttpStatus.OK)
  async resendInvitation(
    @Param('id') id: string,
  ): Promise<{ data: { message: string } }> {
    await this.resendInvitationUseCase.execute(id);
    return { data: { message: 'Invitation resent' } };
  }

  @Delete(':id/invitation')
  @HttpCode(HttpStatus.OK)
  async cancelInvitation(
    @Param('id') id: string,
  ): Promise<{ data: { message: string } }> {
    await this.cancelInvitationUseCase.execute(id);
    return { data: { message: 'Invitation cancelled' } };
  }

  @Put(':id/deactivate')
  @HttpCode(HttpStatus.OK)
  async deactivate(
    @Param('id') id: string,
  ): Promise<{ data: { message: string } }> {
    await this.deactivateUserUseCase.execute(id);
    return { data: { message: 'User deactivated' } };
  }

  @Put(':id/reactivate')
  @HttpCode(HttpStatus.OK)
  async reactivate(
    @Param('id') id: string,
  ): Promise<{ data: { message: string } }> {
    await this.reactivateUserUseCase.execute(id);
    return { data: { message: 'User reactivated' } };
  }

  @Put(':id/role')
  @HttpCode(HttpStatus.OK)
  async changeRole(
    @Param('id') id: string,
    @Body() dto: ChangeRoleRequestDto,
  ): Promise<{ data: { message: string } }> {
    await this.changeRoleUseCase.execute(id, dto.role);
    return { data: { message: 'Role changed' } };
  }

  @Post(':id/force-logout')
  @HttpCode(HttpStatus.OK)
  async forceLogout(
    @Param('id') id: string,
  ): Promise<{ data: { message: string } }> {
    await this.forceLogoutUseCase.execute(id);
    return { data: { message: 'User sessions cleared' } };
  }
}
