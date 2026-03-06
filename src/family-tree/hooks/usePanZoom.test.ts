import { act, renderHook } from '@testing-library/react';
import { createRef, type RefObject } from 'react';
import { describe, expect, it } from 'vitest';
import { usePanZoom } from './usePanZoom';

function createContainerRef(): RefObject<HTMLDivElement | null> {
  return createRef<HTMLDivElement>();
}

describe('usePanZoom', () => {
  it('initializes with default values', () => {
    const ref = createContainerRef();
    const { result } = renderHook(() => usePanZoom(ref));

    expect(result.current.scale).toBe(1);
    expect(result.current.isPressed).toBe(false);
    expect(result.current.isDragging).toBe(false);
  });

  it('zooms in by 0.1 step', () => {
    const ref = createContainerRef();
    const { result } = renderHook(() => usePanZoom(ref));

    act(() => result.current.handlers.handleZoomIn());
    expect(result.current.scale).toBeCloseTo(1.1);
  });

  it('zooms out by 0.1 step', () => {
    const ref = createContainerRef();
    const { result } = renderHook(() => usePanZoom(ref));

    act(() => result.current.handlers.handleZoomOut());
    expect(result.current.scale).toBeCloseTo(0.9);
  });

  it('does not zoom in beyond max scale (2)', () => {
    const ref = createContainerRef();
    const { result } = renderHook(() => usePanZoom(ref));

    for (let i = 0; i < 20; i++) {
      act(() => result.current.handlers.handleZoomIn());
    }
    expect(result.current.scale).toBe(2);
  });

  it('does not zoom out below min scale (0.3)', () => {
    const ref = createContainerRef();
    const { result } = renderHook(() => usePanZoom(ref));

    for (let i = 0; i < 20; i++) {
      act(() => result.current.handlers.handleZoomOut());
    }
    expect(result.current.scale).toBeCloseTo(0.3);
  });

  it('resets zoom to 1', () => {
    const ref = createContainerRef();
    const { result } = renderHook(() => usePanZoom(ref));

    act(() => result.current.handlers.handleZoomIn());
    act(() => result.current.handlers.handleZoomIn());
    expect(result.current.scale).toBeCloseTo(1.2);

    act(() => result.current.handlers.handleResetZoom());
    expect(result.current.scale).toBe(1);
  });
});
