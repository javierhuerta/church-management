import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UserRole } from '../../common/entities/user-role.enum';

interface AuthenticatedRequest {
  user?: { id: string; role: UserRole };
  params?: { departmentId?: string };
}

@Injectable()
export class IsDepartmentDirectorGuard implements CanActivate {
  constructor(private readonly dataSource: DataSource) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<AuthenticatedRequest>();

    const user = request.user;
    if (!user) {
      throw new ForbiddenException('Not authenticated');
    }

    // Admins always pass
    if (user.role === UserRole.Admin) {
      return true;
    }

    const departmentId = request.params?.departmentId;
    if (!departmentId) {
      throw new ForbiddenException('Department ID not found in request');
    }

    // Check if user is a director of this department via user_departments
    const rows = await this.dataSource.query<{ count: string }[]>(
      `SELECT COUNT(*) as count
       FROM user_departments
       WHERE user_id = $1 AND department_id = $2`,
      [user.id, departmentId],
    );

    const count = parseInt(rows[0]?.count ?? '0', 10);
    if (count === 0) {
      throw new ForbiddenException(
        'You are not a director of this department',
      );
    }

    return true;
  }
}
