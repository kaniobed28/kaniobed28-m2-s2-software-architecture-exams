import { UserRole } from '../../domain/entities/user.entity';

export class CreateUserDto {
  username: string;
  role: UserRole;
  password: string;
}
