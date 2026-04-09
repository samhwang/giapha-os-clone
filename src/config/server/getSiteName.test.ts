import { describe, expect, it } from 'vitest';

import { ClientRuntimeEnv, clientEnv } from '../lib/env.server';

describe('getSiteName (env parsing logic)', () => {
  it('clientEnv has SITE_NAME property', () => {
    expect(clientEnv).toHaveProperty('SITE_NAME');
  });

  it('clientEnv.SITE_NAME is a non-empty string', () => {
    expect(typeof clientEnv.SITE_NAME).toBe('string');
    expect(clientEnv.SITE_NAME.length).toBeGreaterThan(0);
  });

  it('ClientRuntimeEnv schema defaults SITE_NAME to "Gia Phả OS"', () => {
    const result = ClientRuntimeEnv.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.SITE_NAME).toBe('Gia Phả OS');
    }
  });

  it('ClientRuntimeEnv schema accepts valid SITE_NAME', () => {
    const result = ClientRuntimeEnv.safeParse({ SITE_NAME: 'My Family Tree' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.SITE_NAME).toBe('My Family Tree');
    }
  });

  it('ClientRuntimeEnv schema rejects empty SITE_NAME', () => {
    const result = ClientRuntimeEnv.safeParse({ SITE_NAME: '' });
    expect(result.success).toBe(false);
  });
});
