import React, { useEffect } from 'react';
export default function Toast({ message, onDismiss }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [message, onDismiss]);
  return <div className="toast-region" role="status" aria-live="polite">{message && <div className="toast">{message}</div>}</div>;
}
