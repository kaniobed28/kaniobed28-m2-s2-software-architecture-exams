import { UserEntity } from '../../modules/users/domain/entities/user.entity';

export function makeUserWithPermission(): UserEntity {
  return {
    id: 'user-1',
    permissions: {
      posts: {
        canCreate: () => true,
      },
    },
  } as unknown as UserEntity;
}

export function makeUserWithoutPermission(): UserEntity {
  return {
    id: 'user-2',
    permissions: {
      posts: {
        canCreate: () => false,
      },
    },
  } as unknown as UserEntity;
}
