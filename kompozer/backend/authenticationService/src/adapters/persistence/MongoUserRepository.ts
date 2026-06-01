// MongoUserRepository — Implementazione MongoDB di UserRepository.
// Usa Mongoose per le operazioni CRUD sulla collection `users`.
// Il metodo toEntity() isola il codice di dominio dalla struttura del documento Mongo
// (nessuna fuga di tipi Mongoose verso il dominio).
import { User } from '../../domain/entities/User';
import { UserRole } from '../../domain/entities/UserRole';
import { UserRepository } from '../../domain/ports/UserRepository';
import { UserModel } from './schemas/userSchema';

export class MongoUserRepository implements UserRepository {
  async save(user: User): Promise<void> {
    await UserModel.create({
      _id: user.id,
      username: user.username,
      passwordHash: user.passwordHash,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }

  async findById(id: string): Promise<User | null> {
    const doc = await UserModel.findById(id).lean();
    return doc ? this.toEntity(doc) : null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const doc = await UserModel.findOne({ username }).lean();
    return doc ? this.toEntity(doc) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const doc = await UserModel.findOne({ email }).lean();
    return doc ? this.toEntity(doc) : null;
  }

  async update(user: User): Promise<void> {
    await UserModel.findByIdAndUpdate(user.id, {
      username: user.username,
      passwordHash: user.passwordHash,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      updatedAt: user.updatedAt,
    });
  }

  private toEntity(doc: {
    _id: string;
    username: string;
    passwordHash: string;
    email: string;
    role: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): User {
    return {
      id: doc._id,
      username: doc.username,
      passwordHash: doc.passwordHash,
      email: doc.email,
      role: doc.role as UserRole,
      isActive: doc.isActive,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
