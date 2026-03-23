/** Path where seeded user IDs are stored for teardown */
export const SEED_DATA_PATH = '.playwright/e2e-seed-data.json';

export interface SeedData {
  userIds: string[];
  adminUserId: string;
  editorUserId: string;
  memberUserId: string;
  personName: string;
}
