import { createServerFn } from "@tanstack/react-start";
import * as z from "zod";

import { isAdminMiddleware } from "../../auth/server/middleware";
import {
  createCustomEvent as createCustomEventRepo,
  deleteCustomEvent as deleteCustomEventRepo,
  findAllCustomEvents,
  updateCustomEvent as updateCustomEventRepo,
} from "../repository/custom-event";

const CreateCustomEventPayload = z.object({
  name: z.string().min(1),
  eventDate: z.string().min(1),
  location: z.string().nullish(),
  content: z.string().nullish(),
});

const UpdateCustomEventPayload = z.object({
  id: z.uuid(),
  name: z.string().min(1).optional(),
  eventDate: z.string().min(1).optional(),
  location: z.string().nullish(),
  content: z.string().nullish(),
});

const IdPayload = z.object({ id: z.uuid() });

export const getCustomEvents = createServerFn({ method: "GET" }).handler(async () => {
  return findAllCustomEvents();
});

export const createCustomEvent = createServerFn({ method: "POST" })
  .inputValidator(CreateCustomEventPayload)
  .middleware([isAdminMiddleware])
  .handler(async ({ data }) => {
    return createCustomEventRepo({
      name: data.name,
      eventDate: data.eventDate,
      location: data.location ?? null,
      content: data.content ?? null,
    });
  });

export const updateCustomEvent = createServerFn({ method: "POST" })
  .inputValidator(UpdateCustomEventPayload)
  .middleware([isAdminMiddleware])
  .handler(async ({ data }) => {
    const { id, ...updateData } = data;
    return updateCustomEventRepo({ id, data: updateData });
  });

export const deleteCustomEvent = createServerFn({ method: "POST" })
  .inputValidator(IdPayload)
  .middleware([isAdminMiddleware])
  .handler(async ({ data }) => {
    await deleteCustomEventRepo(data.id);
    return { success: true };
  });
