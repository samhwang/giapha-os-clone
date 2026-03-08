import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { ViewMode } from '../components/ViewToggle';

export interface DashboardState {
  memberModalId: string | null;
  setMemberModalId: (id: string | null) => void;
  showCreateModal: boolean;
  setShowCreateModal: (show: boolean) => void;
  showAvatar: boolean;
  setShowAvatar: (show: boolean) => void;
  view: ViewMode;
  setView: (view: ViewMode) => void;
  rootId: string | null;
  setRootId: (id: string | null) => void;
  reset: () => void;
}

const updateUrl = (key: string, value: string | null) => {
  if (typeof window === 'undefined') return;
  const newUrl = new URL(window.location.href);
  if (value) {
    newUrl.searchParams.set(key, value);
  } else {
    newUrl.searchParams.delete(key);
  }
  window.history.replaceState(null, '', newUrl.toString());
};

const getInitialState = (): Omit<DashboardState, 'setMemberModalId' | 'setShowCreateModal' | 'setShowAvatar' | 'setView' | 'setRootId' | 'reset'> => {
  if (typeof window === 'undefined') {
    return {
      memberModalId: null,
      showCreateModal: false,
      showAvatar: true,
      view: 'list' as ViewMode,
      rootId: null,
    };
  }

  const sp = new URLSearchParams(window.location.search);

  let showAvatar = true;
  const avatarParam = sp.get('avatar');
  if (avatarParam === 'hide') showAvatar = false;

  let view: ViewMode = 'list';
  const viewParam = sp.get('view') as ViewMode;
  if (viewParam) view = viewParam;

  let rootId: string | null = null;
  const rootIdParam = sp.get('rootId');
  if (rootIdParam) rootId = rootIdParam;

  let memberModalId: string | null = null;
  const modalId = sp.get('memberModalId');
  if (modalId) memberModalId = modalId;

  return {
    memberModalId,
    showCreateModal: false,
    showAvatar,
    view,
    rootId,
  };
};

const initial = getInitialState();

type ImmerSet = typeof import('zustand').create<DashboardState> extends (
  f: (set: (partial: (state: DashboardState) => void) => void) => DashboardState
) => unknown
  ? (partial: (state: DashboardState) => void) => void
  : never;

export const useDashboardStore = create(
  immer((set: ImmerSet) => ({
    ...initial,

    reset: () => {
      const initialState = getInitialState();
      set((state: DashboardState) => {
        state.memberModalId = initialState.memberModalId;
        state.showCreateModal = initialState.showCreateModal;
        state.showAvatar = initialState.showAvatar;
        state.view = initialState.view;
        state.rootId = initialState.rootId;
      });
    },

    setMemberModalId: (id: string | null) => {
      set((state: DashboardState) => {
        state.memberModalId = id;
      });
      updateUrl('memberModalId', id);
    },

    setShowCreateModal: (show: boolean) => {
      set((state: DashboardState) => {
        state.showCreateModal = show;
      });
    },

    setShowAvatar: (show: boolean) => {
      set((state: DashboardState) => {
        state.showAvatar = show;
      });
      updateUrl('avatar', show ? null : 'hide');
    },

    setView: (v: ViewMode) => {
      set((state: DashboardState) => {
        state.view = v;
      });
      updateUrl('view', v);
    },

    setRootId: (id: string | null) => {
      set((state: DashboardState) => {
        state.rootId = id;
      });
      updateUrl('rootId', id);
    },
  })) as unknown as () => DashboardState
);
