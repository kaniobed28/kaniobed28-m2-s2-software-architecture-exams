import { UserEntity } from '../../../../users/domain/entities/user.entity';

export abstract class AuthRepository {
  public abstract findUserByUsername(
    username: string,
  ): Promise<UserEntity | undefined>;
  public abstract findUserById(id: string): Promise<UserEntity | undefined>;
}
