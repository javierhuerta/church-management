import { Request } from 'express';
import { UserRole } from '../entities/user-role.enum';

/**
 * Shape of the user attached to the request by `JwtStrategy.validate()`.
 * Used everywhere a controller needs `req.user` after `JwtAuthGuard` (or
 * `OptionalJwtAuthGuard`) has run.
 */
export interface AuthUser {
  userId: string;
  email: string;
  role: UserRole;
  name?: string;
}

export interface RequestWithUser extends Request {
  user?: AuthUser;
}
