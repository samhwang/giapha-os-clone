import type { LoginResult, TestCookie, TestHelpers } from "better-auth/plugins";

import type { UserRole } from "../src/auth/types";

import { auth } from "../src/auth/server";

let _test: TestHelpers | null = null;

async function getTestCtx(): Promise<TestHelpers> {
  if (!_test) {
    const ctx = await auth.$context;
    // testUtils plugin adds `test` to context when VITEST or E2E_TEST_UTILS is set
    _test = (ctx as unknown as { test: TestHelpers }).test;
  }
  return _test;
}

interface TestUserOptions {
  email?: string;
  name?: string;
  role?: UserRole;
  isActive?: boolean;
}

export async function createAndSaveTestUser(
  opts: TestUserOptions = {},
): Promise<{ id: string; email: string }> {
  const test = await getTestCtx();
  const user = test.createUser({
    email: opts.email ?? `test-${crypto.randomUUID()}@test.local`,
    name: opts.name ?? "Test User",
    role: opts.role ?? "member",
    isActive: opts.isActive ?? true,
    emailVerified: true,
  });
  return test.saveUser(user);
}

export async function deleteTestUser(userId: string): Promise<void> {
  const test = await getTestCtx();
  return test.deleteUser(userId);
}

export async function getTestAuthHeaders(userId: string): Promise<Headers> {
  const test = await getTestCtx();
  return test.getAuthHeaders({ userId });
}

export async function getTestAuthCookies(
  userId: string,
  domain = "localhost",
): Promise<TestCookie[]> {
  const test = await getTestCtx();
  return test.getCookies({ userId, domain });
}

export async function loginTestUser(userId: string): Promise<LoginResult> {
  const test = await getTestCtx();
  return test.login({ userId });
}
