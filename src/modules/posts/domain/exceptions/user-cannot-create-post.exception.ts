import { DomainException } from '../../../shared/errors/domain/exceptions/domain.exception';

export class UserCannotCreatePostException extends DomainException {
  constructor() {
    super(
      'You do not have permission to create posts',
      'USER_CANNOT_CREATE_POST',
    );
  }
}
