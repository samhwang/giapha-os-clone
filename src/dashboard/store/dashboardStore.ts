import { create } from 'zustand';
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

const getInitialState = () => {
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

export const useDashboardStore = create<DashboardState>((set) => {
  const initial = getInitialState();

  return {
    ...initial,

    setMemberModalId: (id) => {
      set({ memberModalId: id });
      updateUrl('memberModalId', id);
    },

    setShowCreateModal: (show) => {
      set({ showCreateModal: show });
    },

    setShowAvatar: (show) => {
      set({ showAvatar: show });
      updateUrl('avatar', show ? null : 'hide');
    },

    setView: (v) => {
      set({ view: v });
      updateUrl('view', v);
    },

    setRootId: (id) => {
      set({ rootId: id });
      updateUrl('rootId', id);
    },
  };
});
