import { act, renderHook } from "@testing-library/react";
import { createRef, type MouseEvent, type RefObject } from "react";
import { describe, expect, it, vi } from "vitest";

import { usePanZoom } from "./usePanZoom";

function createContainerRef(): RefObject<HTMLDivElement | null> {
  return createRef<HTMLDivElement>();
}

function createMockContainerRef() {
  return { current: { scrollLeft: 0, scrollTop: 0 } as HTMLDivElement };
}

function mockMouseEvent(overrides = {}) {
  return {
    pageX: 0,
    pageY: 0,
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    ...overrides,
  } as unknown as MouseEvent<HTMLElement>;
}

describe("usePanZoom", () => {
  it("initializes with default values", () => {
    const ref = createContainerRef();
    const { result } = renderHook(() => usePanZoom(ref));

    expect(result.current.scale).toBe(1);
    expect(result.current.isPressed).toBe(false);
    expect(result.current.isDragging).toBe(false);
  });

  it("zooms in by 0.1 step", () => {
    const ref = createContainerRef();
    const { result } = renderHook(() => usePanZoom(ref));

    act(() => result.current.handlers.handleZoomIn());
    expect(result.current.scale).toBeCloseTo(1.1);
  });

  it("zooms out by 0.1 step", () => {
    const ref = createContainerRef();
    const { result } = renderHook(() => usePanZoom(ref));

    act(() => result.current.handlers.handleZoomOut());
    expect(result.current.scale).toBeCloseTo(0.9);
  });

  it("does not zoom in beyond max scale (2)", () => {
    const ref = createContainerRef();
    const { result } = renderHook(() => usePanZoom(ref));

    for (let i = 0; i < 20; i++) {
      act(() => result.current.handlers.handleZoomIn());
    }
    expect(result.current.scale).toBe(2);
  });

  it("does not zoom out below min scale (0.3)", () => {
    const ref = createContainerRef();
    const { result } = renderHook(() => usePanZoom(ref));

    for (let i = 0; i < 20; i++) {
      act(() => result.current.handlers.handleZoomOut());
    }
    expect(result.current.scale).toBeCloseTo(0.3);
  });

  it("resets zoom to 1", () => {
    const ref = createContainerRef();
    const { result } = renderHook(() => usePanZoom(ref));

    act(() => result.current.handlers.handleZoomIn());
    act(() => result.current.handlers.handleZoomIn());
    expect(result.current.scale).toBeCloseTo(1.2);

    act(() => result.current.handlers.handleResetZoom());
    expect(result.current.scale).toBe(1);
  });
});

describe("usePanZoom mouse handlers", () => {
  it("handleMouseDown sets isPressed to true", () => {
    const ref = createMockContainerRef();
    const { result } = renderHook(() => usePanZoom(ref));

    act(() => result.current.handlers.handleMouseDown(mockMouseEvent({ pageX: 10, pageY: 20 })));

    expect(result.current.isPressed).toBe(true);
  });

  it("handleMouseUpOrLeave resets isPressed and isDragging", () => {
    const ref = createMockContainerRef();
    const { result } = renderHook(() => usePanZoom(ref));

    act(() => result.current.handlers.handleMouseDown(mockMouseEvent({ pageX: 0, pageY: 0 })));
    expect(result.current.isPressed).toBe(true);

    act(() => result.current.handlers.handleMouseUpOrLeave());

    expect(result.current.isPressed).toBe(false);
    expect(result.current.isDragging).toBe(false);
  });

  it("handleMouseMove with large displacement triggers isDragging", () => {
    const ref = createMockContainerRef();
    const { result } = renderHook(() => usePanZoom(ref));

    act(() => result.current.handlers.handleMouseDown(mockMouseEvent({ pageX: 0, pageY: 0 })));

    act(() => result.current.handlers.handleMouseMove(mockMouseEvent({ pageX: 50, pageY: 50 })));

    expect(result.current.isDragging).toBe(true);
  });

  it("handleMouseMove without press does nothing", () => {
    const ref = createMockContainerRef();
    const { result } = renderHook(() => usePanZoom(ref));

    act(() => result.current.handlers.handleMouseMove(mockMouseEvent({ pageX: 50, pageY: 50 })));

    expect(result.current.isDragging).toBe(false);
    expect(result.current.isPressed).toBe(false);
  });

  it("handleMouseMove without containerRef does nothing", () => {
    const ref = { current: null };
    const { result } = renderHook(() => usePanZoom(ref));

    act(() => result.current.handlers.handleMouseDown(mockMouseEvent({ pageX: 0, pageY: 0 })));
    act(() => result.current.handlers.handleMouseMove(mockMouseEvent({ pageX: 50, pageY: 50 })));

    expect(result.current.isDragging).toBe(false);
  });

  it("handleMouseMove scrolls the container when dragging", () => {
    const ref = createMockContainerRef();
    ref.current.scrollLeft = 100;
    ref.current.scrollTop = 100;
    const { result } = renderHook(() => usePanZoom(ref));

    act(() => result.current.handlers.handleMouseDown(mockMouseEvent({ pageX: 50, pageY: 50 })));

    const moveEvent = mockMouseEvent({ pageX: 80, pageY: 80 });
    act(() => result.current.handlers.handleMouseMove(moveEvent));

    // oxlint-disable-next-line typescript-eslint/unbound-method -- vi.fn() mock
    expect(moveEvent.preventDefault).toHaveBeenCalled();
    // scrollStart (100) - dx (30) = 70
    expect(ref.current.scrollLeft).toBe(70);
    expect(ref.current.scrollTop).toBe(70);
  });

  it("handleMouseMove below threshold does not trigger dragging", () => {
    const ref = createMockContainerRef();
    const { result } = renderHook(() => usePanZoom(ref));

    act(() => result.current.handlers.handleMouseDown(mockMouseEvent({ pageX: 0, pageY: 0 })));

    act(() => result.current.handlers.handleMouseMove(mockMouseEvent({ pageX: 2, pageY: 2 })));

    expect(result.current.isDragging).toBe(false);
  });

  it("handleClickCapture stops propagation after drag", () => {
    const ref = createMockContainerRef();
    const { result } = renderHook(() => usePanZoom(ref));

    // Perform a drag
    act(() => result.current.handlers.handleMouseDown(mockMouseEvent({ pageX: 0, pageY: 0 })));
    act(() => result.current.handlers.handleMouseMove(mockMouseEvent({ pageX: 50, pageY: 50 })));

    expect(result.current.isDragging).toBe(true);

    const clickEvent = mockMouseEvent();
    act(() => result.current.handlers.handleClickCapture(clickEvent));

    /* oxlint-disable typescript-eslint/unbound-method -- vi.fn() mocks */
    expect(clickEvent.stopPropagation).toHaveBeenCalled();
    expect(clickEvent.preventDefault).toHaveBeenCalled();
    /* oxlint-enable typescript-eslint/unbound-method */
  });

  it("handleClickCapture does not stop propagation without prior drag", () => {
    const ref = createMockContainerRef();
    const { result } = renderHook(() => usePanZoom(ref));

    const clickEvent = mockMouseEvent();
    act(() => result.current.handlers.handleClickCapture(clickEvent));

    /* oxlint-disable typescript-eslint/unbound-method -- vi.fn() mocks */
    expect(clickEvent.stopPropagation).not.toHaveBeenCalled();
    expect(clickEvent.preventDefault).not.toHaveBeenCalled();
    /* oxlint-enable typescript-eslint/unbound-method */
  });

  it("handleMouseDown with container records scroll position", () => {
    const ref = createMockContainerRef();
    ref.current.scrollLeft = 50;
    ref.current.scrollTop = 75;
    const { result } = renderHook(() => usePanZoom(ref));

    act(() => result.current.handlers.handleMouseDown(mockMouseEvent({ pageX: 10, pageY: 20 })));

    // Move to verify scrollStart was recorded correctly
    act(() => result.current.handlers.handleMouseMove(mockMouseEvent({ pageX: 20, pageY: 30 })));

    // scrollStart.left (50) - dx (10) = 40
    expect(ref.current.scrollLeft).toBe(40);
    // scrollStart.top (75) - dy (10) = 65
    expect(ref.current.scrollTop).toBe(65);
  });
});
