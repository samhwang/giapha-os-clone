import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import type { ViewMode } from '../components/ViewToggle';

interface DashboardState {
  memberModalId: string | null;
  showCreateModal: boolean;
  showAvatar: boolean;
  view: ViewMode;
  rootId: string | null;
}

interface DashboardAction {
  setMemberModalId: (id: string | null) => void;
  setShowCreateModal: (show: boolean) => void;
  setShowAvatar: (show: boolean) => void;
  setView: (view: ViewMode) => void;
  setRootId: (id: string | null) => void;
  reset: () => void;
}

const updateUrl = (key: string, value: string | null): void => {
  if (typeof window === 'undefined') return;
  const newUrl = new URL(window.location.href);
  if (value) {
    newUrl.searchParams.set(key, value);
  } else {
    newUrl.searchParams.delete(key);
  }
  window.history.replaceState(null, '', newUrl.toString());
};

const getInitialState = (): DashboardState => ({
  memberModalId: null as string | null,
  showCreateModal: false,
  showAvatar: true,
  view: 'list' as ViewMode,
  rootId: null as string | null,
});

const readUrlState = (): DashboardState => {
  if (typeof window === 'undefined') return getInitialState();

  const sp = new URLSearchParams(window.location.search);
  const defaults = getInitialState();

  const avatarParam = sp.get('avatar');
  if (avatarParam === 'hide') defaults.showAvatar = false;

  const viewParam = sp.get('view') as ViewMode;
  if (viewParam) defaults.view = viewParam;

  const rootIdParam = sp.get('rootId');
  if (rootIdParam) defaults.rootId = rootIdParam;

  const modalId = sp.get('memberModalId');
  if (modalId) defaults.memberModalId = modalId;

  return defaults;
};

const initial = readUrlState();

export const useDashboardStore = create<DashboardState & DashboardAction>()(
  devtools(
    (set) => ({
      ...initial,

      reset: () => {
        set(getInitialState());
      },

      setMemberModalId: (id) => {
        set({ memberModalId: id }, undefined, 'setMemberModalId');
        updateUrl('memberModalId', id);
      },

      setShowCreateModal: (show) => {
        set({ showCreateModal: show }, undefined, 'setShowCreateModal');
      },

      setShowAvatar: (show) => {
        set({ showAvatar: show }, undefined, 'setShowAvatar');
        updateUrl('avatar', show ? null : 'hide');
      },

      setView: (v) => {
        set({ view: v }, undefined, 'setView');
        updateUrl('view', v);
      },

      setRootId: (id) => {
        set({ rootId: id }, undefined, 'setRootId');
        updateUrl('rootId', id);
      },
    }),
    { name: 'dashboard' }
  )
);
