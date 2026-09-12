import React from 'react';

export default function ExitConfirmationModal({ onConfirm, onCancel }) {
  return (
    <div className="modal-backdrop z-[3000]">
      <div className="onboarding-modal-body bg-white p-24 rounded-2xl max-w-[400px] w-[90%]">
        <h2 className="heading-2 mb-8">จะพักก่อนใช่ไหม?</h2>
        <p className="body-md text-neutral-600 mb-32">
          ข้อมูลที่ยังไม่ได้บันทึกอาจหายเมื่อออกจากหน้านี้
        </p>
        <div className="onboarding-modal-footer p-0 border-none bg-transparent">
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
