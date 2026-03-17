import type { TransactionClient } from './generated/prisma/internal/prismaNamespace';
import { getDbClient } from './lib/client';

export type DbClient = TransactionClient;

export function withTransaction<T>(fn: (tx: DbClient) => Promise<T>): Promise<T> {
  return getDbClient().$transaction(fn);
}
