import { UserEntity } from '../entities/user.entity';

export abstract class UserRepository {
  public abstract listUsers(): Promise<UserEntity[]>;
  public abstract getUserById(id: string): Promise<UserEntity | undefined>;
  public abstract createUser(input: UserEntity): Promise<void>;
  public abstract updateUser(id: string, input: UserEntity): Promise<void>;
  public abstract deleteUser(id: string): Promise<void>;
}
