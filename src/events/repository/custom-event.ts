import type { CustomEventCreateInput, CustomEventCreateManyInput, CustomEventUpdateInput } from '../../database/generated/prisma/models';
import { getDbClient } from '../../database/lib/client';
import type { DbClient } from '../../database/transaction';

export function findAllCustomEvents(client: DbClient = getDbClient()) {
  return client.customEvent.findMany({ orderBy: { eventDate: 'asc' } });
}

export function createCustomEvent(data: CustomEventCreateInput, client: DbClient = getDbClient()) {
  return client.customEvent.create({ data });
}

export function updateCustomEvent(id: string, data: CustomEventUpdateInput, client: DbClient = getDbClient()) {
  return client.customEvent.update({ where: { id }, data });
}

export function deleteCustomEvent(id: string, client: DbClient = getDbClient()) {
  return client.customEvent.delete({ where: { id } });
}

export function deleteAllCustomEvents(client: DbClient = getDbClient()) {
  return client.customEvent.deleteMany();
}

export function createManyCustomEvents(data: CustomEventCreateManyInput | CustomEventCreateManyInput[], client: DbClient = getDbClient()) {
  return client.customEvent.createMany({ data });
}
