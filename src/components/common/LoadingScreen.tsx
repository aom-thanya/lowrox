import React from 'react';

export default function LoadingScreen({ label = 'กำลังโหลด...' }: { label?: string }) {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center" role="status">
      <p>{label}</p>
    </div>
  );
}
