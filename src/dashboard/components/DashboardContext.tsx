import { createContext, useContext, useEffect, useState } from 'react';
import type { ViewMode } from './ViewToggle';

interface DashboardState {
  memberModalId: string | null;
  setMemberModalId: (id: string | null) => void;
  showAvatar: boolean;
  setShowAvatar: (show: boolean) => void;
  view: ViewMode;
  setView: (view: ViewMode) => void;
  rootId: string | null;
  setRootId: (id: string | null) => void;
}

export const DashboardContext = createContext<DashboardState | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [memberModalId, setMemberModalId] = useState<string | null>(null);
  const [showAvatar, setShowAvatarState] = useState(true);
  const [view, setViewState] = useState<ViewMode>('list');
  const [rootId, setRootIdState] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const sp = new URLSearchParams(window.location.search);

    const avatarParam = sp.get('avatar');
    if (avatarParam === 'hide') setShowAvatarState(false);

    const viewParam = sp.get('view') as ViewMode;
    if (viewParam) setViewState(viewParam);

    const rootIdParam = sp.get('rootId');
    if (rootIdParam) setRootIdState(rootIdParam);

    const modalId = sp.get('memberModalId');
    if (modalId) setMemberModalId(modalId);
  }, []);

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

  const updateModalId = (id: string | null) => {
    setMemberModalId(id);
    updateUrl('memberModalId', id);
  };

  const setShowAvatar = (show: boolean) => {
    setShowAvatarState(show);
    updateUrl('avatar', show ? null : 'hide');
  };

  const setView = (v: ViewMode) => {
    setViewState(v);
    updateUrl('view', v);
  };

  const setRootId = (id: string | null) => {
    setRootIdState(id);
    updateUrl('rootId', id);
  };

  return (
    <DashboardContext.Provider
      value={{
        memberModalId,
        setMemberModalId: updateModalId,
        showAvatar,
        setShowAvatar,
        view,
        setView,
        rootId,
        setRootId,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard(): DashboardState {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    return {
      memberModalId: null,
      setMemberModalId: () => {},
      showAvatar: true,
      setShowAvatar: () => {},
      view: 'list',
      setView: () => {},
      rootId: null,
      setRootId: () => {},
    };
  }
  return context;
}
