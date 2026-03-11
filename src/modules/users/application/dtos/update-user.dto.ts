import { UserRole } from '../../domain/entities/user.entity';

export class UpdateUserDto {
  username?: string;
  role?: UserRole;
}
