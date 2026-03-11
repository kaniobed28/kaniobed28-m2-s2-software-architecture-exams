import { v4 } from 'uuid';
import { Permissions } from '../permissions/permissions';
import { UserUsername } from '../value-objects/user-username.value-object';

export type UserRole = 'user' | 'moderator' | 'admin' | 'writer';

export class UserEntity {
  private _username: UserUsername;
  private _role: UserRole;
  private _password: string;
  public readonly permissions: Permissions;

  private constructor(
    readonly id: string,
    username: UserUsername,
    role: UserRole,
    password: string,
  ) {
    this._username = username;
    this._role = role;
    this._password = password;

    this.permissions = new Permissions(this.id, role);
  }

  get role(): UserRole {
    return this._role;
  }

  get username(): string {
    return this._username.toString();
  }

  public static create(
    username: string,
    role: UserRole,
    password: string,
  ): UserEntity {
    return new UserEntity(v4(), new UserUsername(username), role, password);
  }

  public toJSON() {
    return {
      id: this.id,
      role: this._role,
      username: this._username.toString(),
      password: this._password,
    };
  }

  public update(username?: string, role?: UserRole): void {
    if (username) {
      this._username = new UserUsername(username);
    }
    if (role) {
      this._role = role;
    }
  }

  public static reconstitute(input: Record<string, unknown>): UserEntity {
    return new UserEntity(
      input.id as string,
      new UserUsername(input.username as string),
      input.role as UserRole,
      input.password as string,
    );
  }

  public checkPassword(password: string): boolean {
    return this._password === password;
  }
}
