import Modal from '../common/Modal';
import ModalBody from '../common/ModalBody';
import ModalFooter from '../common/ModalFooter';

export default function ExitConfirmationModal({ onConfirm, onCancel }) {
  return (
    <Modal isOpen={true} hideCloseButton={true} zIndex={3000} className="max-w-[400px] w-[90%] !h-auto">
      <ModalBody className="p-24">
        <h2 className="heading-2 mb-8">จะพักก่อนใช่ไหม?</h2>
        <p className="body-md text-neutral-600 mb-32">
          ข้อมูลที่ยังไม่ได้บันทึกอาจหายเมื่อออกจากหน้านี้
        </p>
      </ModalBody>
      <ModalFooter className="p-24 pt-0 border-none justify-end flex-col sm:flex-row">
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
