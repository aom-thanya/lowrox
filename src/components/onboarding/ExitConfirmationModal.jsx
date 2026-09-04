import React from 'react';

export default function ExitConfirmationModal({ onConfirm, onCancel }) {
  return (
    <div className="modal-backdrop" style={{ zIndex: 3000 }}>
      <div className="modal-content" style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px' }}>
        <h2 className="display-sm" style={{ marginBottom: '16px' }}>จะพักก่อนใช่ไหม?</h2>
        <p className="body-md" style={{ color: 'var(--color-neutral-600)', marginBottom: '32px' }}>
          ข้อมูลที่ยังไม่ได้บันทึกอาจหายเมื่อออกจากหน้านี้
        </p>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button className="btn btn-secondary btn-md w-full" onClick={onConfirm}>
            ออกจาก Onboarding
          </button>
          <button className="btn btn-primary btn-md btn-cta w-full" onClick={onCancel}>
            กรอกต่ออีกนิด
          </button>
        </div>
      </div>
    </div>
  );
}
