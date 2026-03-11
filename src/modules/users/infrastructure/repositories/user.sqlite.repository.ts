import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UserEntity } from '../../domain/entities/user.entity';
import { UserRepository } from '../../domain/repositories/user.repository';
import { SQLiteUserEntity } from '../entities/user.sqlite.entity';

@Injectable()
export class SQLiteUserRepository implements UserRepository {
  constructor(private readonly dataSource: DataSource) {}

  public async listUsers(): Promise<UserEntity[]> {
    const users = await this.dataSource.getRepository(SQLiteUserEntity).find();

    return users.map((user) => UserEntity.reconstitute({ ...user }));
  }

  public async getUserById(id: string): Promise<UserEntity | undefined> {
    const user = await this.dataSource
      .getRepository(SQLiteUserEntity)
      .findOne({ where: { id } });

    return user ? UserEntity.reconstitute({ ...user }) : undefined;
  }

  public async createUser(input: UserEntity): Promise<void> {
    await this.dataSource.getRepository(SQLiteUserEntity).save(input.toJSON());
  }

  public async updateUser(id: string, input: UserEntity): Promise<void> {
    await this.dataSource
      .getRepository(SQLiteUserEntity)
      .update(id, input.toJSON());
  }

  public async deleteUser(id: string): Promise<void> {
    await this.dataSource.getRepository(SQLiteUserEntity).delete(id);
  }
}
