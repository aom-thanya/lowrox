import React, { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';

// Native dialog provides modal focus containment and restores the invoking focus.
export default function Dialog({ open, title, children, onClose }) {
  const ref = useRef(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
    return () => { if (dialog.open) dialog.close(); };
  }, [open]);
  return createPortal(
    <dialog ref={ref} className="common-dialog" aria-labelledby={titleId} onCancel={(event) => { event.preventDefault(); onClose(); }}>
      <h2 id={titleId} className="heading-4">{title}</h2>
      {children}
    </dialog>, document.body,
  );
}
