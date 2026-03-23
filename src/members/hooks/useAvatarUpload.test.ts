import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAvatarUpload } from './useAvatarUpload';

beforeEach(() => {
  vi.stubGlobal('URL', { ...URL, createObjectURL: vi.fn(() => 'blob:mock-url') });
});

describe('useAvatarUpload', () => {
  it('should initialize with null file and null preview', () => {
    const { result } = renderHook(() => useAvatarUpload());

    expect(result.current.avatarFile).toBeNull();
    expect(result.current.avatarPreview).toBeNull();
  });

  it('should initialize with provided initialUrl as preview', () => {
    const { result } = renderHook(() => useAvatarUpload({ initialUrl: '/api/uploads/avatars/p1/photo.jpg' }));

    expect(result.current.avatarFile).toBeNull();
    expect(result.current.avatarPreview).toBe('/api/uploads/avatars/p1/photo.jpg');
  });

  it('should set file and create blob preview on selectFile', () => {
    const { result } = renderHook(() => useAvatarUpload());
    const file = new File(['data'], 'photo.jpg', { type: 'image/jpeg' });

    act(() => {
      result.current.selectFile(file);
    });

    expect(result.current.avatarFile).toBe(file);
    expect(result.current.avatarPreview).toBe('blob:mock-url');
  });

  it('should reset both file and preview on clear', () => {
    const { result } = renderHook(() => useAvatarUpload());
    const file = new File(['data'], 'photo.jpg', { type: 'image/jpeg' });

    act(() => {
      result.current.selectFile(file);
    });
    act(() => {
      result.current.clear();
    });

    expect(result.current.avatarFile).toBeNull();
    expect(result.current.avatarPreview).toBeNull();
  });

  it('should throw on toBase64 when no file is selected', async () => {
    const { result } = renderHook(() => useAvatarUpload());

    await expect(result.current.toBase64()).rejects.toThrow('No avatar file selected');
  });
});
