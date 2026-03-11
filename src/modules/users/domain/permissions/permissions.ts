import { UserRole } from '../entities/user.entity';
import { PostPermissions } from './post-permissions';

export class Permissions {
  public readonly posts: PostPermissions;

  constructor(userId: string, role: UserRole) {
    this.posts = new PostPermissions(userId, role);
  }
}
