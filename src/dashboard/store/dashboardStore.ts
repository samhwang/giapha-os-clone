import { produce } from 'immer';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
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

type DashboardInitialState = Pick<DashboardState, 'memberModalId' | 'showCreateModal' | 'showAvatar' | 'view' | 'rootId'>;

const getInitialState = (): DashboardInitialState => ({
  memberModalId: null as string | null,
  showCreateModal: false,
  showAvatar: true,
  view: 'list' as ViewMode,
  rootId: null as string | null,
});

const readUrlState = (): DashboardInitialState => {
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

export const useDashboardStore = create<DashboardState>()(
  devtools(
    (set) => ({
      ...initial,

      reset: () => {
        set(getInitialState());
      },

      setMemberModalId: (id) => {
        set(
          produce((state: DashboardState) => {
            state.memberModalId = id;
          }),
          undefined,
          'setMemberModalId'
        );
        updateUrl('memberModalId', id);
      },

      setShowCreateModal: (show) => {
        set(
          produce((state: DashboardState) => {
            state.showCreateModal = show;
          }),
          undefined,
          'setShowCreateModal'
        );
      },

      setShowAvatar: (show) => {
        set(
          produce((state: DashboardState) => {
            state.showAvatar = show;
          }),
          undefined,
          'setShowAvatar'
        );
        updateUrl('avatar', show ? null : 'hide');
      },

      setView: (v) => {
        set(
          produce((state: DashboardState) => {
            state.view = v;
          }),
          undefined,
          'setView'
        );
        updateUrl('view', v);
      },

      setRootId: (id) => {
        set(
          produce((state: DashboardState) => {
            state.rootId = id;
          }),
          undefined,
          'setRootId'
        );
        updateUrl('rootId', id);
      },
    }),
    { name: 'dashboard' }
  )
);
