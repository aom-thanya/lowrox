import Modal from '../common/Modal';
import ModalBody from '../common/ModalBody';
import ModalFooter from '../common/ModalFooter';

export default function ExitConfirmationModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <Modal isOpen={true} hideCloseButton={true} zIndex={3000} overlayClassName="onboarding-exit-backdrop" className="onboarding-exit-dialog">
      <ModalBody className="p-6">
        <h2 className="heading-2 mb-2">จะพักก่อนใช่ไหม?</h2>
        <p className="body-md text-neutral-600 mb-8">
          ข้อมูลที่ยังไม่ได้บันทึกอาจหายเมื่อออกจากหน้านี้
        </p>
      </ModalBody>
      <ModalFooter className="onboarding-exit-actions">
        <button className="btn btn-secondary btn-md w-full sm:w-auto" onClick={onConfirm}>
          ออกจาก Onboarding
        </button>
        <button className="btn btn-primary btn-md btn-cta w-full sm:w-auto" onClick={onCancel}>
          กรอกต่ออีกนิด
        </button>
      </ModalFooter>
    </Modal>
  );
}
