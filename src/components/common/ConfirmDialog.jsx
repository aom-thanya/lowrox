import React from 'react';
import Dialog from './Dialog';
import Button from './Button';

export default function ConfirmDialog({ open, message, onCancel, onConfirm }) {
  return <Dialog open={open} title="การเปลี่ยนแปลงที่ยังไม่ได้บันทึก" onClose={onCancel}>
    <p>{message}</p>
    <div className="form-actions">
      <Button variant="secondary" onClick={onCancel} autoFocus>แก้ไขต่อ</Button>
      <Button onClick={onConfirm}>ออกโดยไม่บันทึก</Button>
    </div>
  </Dialog>;
}
