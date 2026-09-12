import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Outlet, useBlocker } from 'react-router-dom';
import ConfirmDialog from '../components/common/ConfirmDialog';

const UnsavedChangesContext = createContext(null);

export function UnsavedChangesProvider() {
  const dirtyRef = useRef(false);
  const [dirty, setDirtyState] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const setDirty = useCallback((value) => { dirtyRef.current = value; setDirtyState(value); }, []);
  const blocker = useBlocker(useCallback(({ currentLocation, nextLocation }) => (
    dirtyRef.current && (currentLocation.pathname !== nextLocation.pathname || currentLocation.search !== nextLocation.search)
  ), []));
  useEffect(() => {
    if (!dirty) return;
    const beforeUnload = (event) => { if (dirtyRef.current) { event.preventDefault(); event.returnValue = ''; } };
    window.addEventListener('beforeunload', beforeUnload);
    return () => window.removeEventListener('beforeunload', beforeUnload);
  }, [dirty]);
  const requestAction = useCallback((action) => {
    if (dirtyRef.current) setPendingAction(() => action);
    else action();
  }, []);
  const cancel = () => {
    setPendingAction(null);
    if (blocker.state === 'blocked') blocker.reset();
  };
  const confirm = () => {
    setDirty(false);
    if (pendingAction) { const action = pendingAction; setPendingAction(null); action(); }
    else if (blocker.state === 'blocked') blocker.proceed();
  };
  return <UnsavedChangesContext.Provider value={{ setDirty, requestAction }}>
    <Outlet />
    <ConfirmDialog open={Boolean(pendingAction) || blocker.state === 'blocked'}
      message="คุณมีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก ต้องการออกจากหน้านี้ไหม?"
      onCancel={cancel} onConfirm={confirm} />
  </UnsavedChangesContext.Provider>;
}

export const useUnsavedChanges = () => useContext(UnsavedChangesContext);
