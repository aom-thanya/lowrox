# Requirements for Profile Onboarding Editor

## 1. เนื้อหาและการแสดงผลบนหน้า (UI & Content)
- [x] **หัวข้อ**: แสดงคำว่า "แก้ไขข้อมูลจาก Onboarding"
- [x] **คำอธิบาย**: แสดงคำว่า "อัปเดตเป้าหมายและความต้องการ เพื่อหา Buddy ที่เหมาะกับคุณ"
- [x] **แสดงข้อมูล 5 sections เรียงตามลำดับ**: มีการนำเข้า Step 1 ถึง Step 5 มาแสดงเรียงต่อกัน
- [x] **โครงสร้าง Section**: แต่ละ section จะต้องมีชื่อบอกชัดเจน คำอธิบาย และช่องกรอกข้อมูล
- [x] **โหลดข้อมูลเดิม**: ค่าเริ่มต้นในฟอร์มถูกโหลดข้อมูลเดิมที่บันทึกไว้ (ผ่าน `initialData` ที่ส่งเข้า Context)
- [x] **ลบ UI ที่ไม่เกี่ยวข้อง**: ไม่มีภาพประกอบ (Illustration), ไม่มีปุ่ม Next/Back หรือ Progress Bar เหมือนใน Modal (ทำผ่าน prop `isEditor={true}`)
- [x] **Sidebar & Layout**: แสดงผลภายใต้ Profile Layout โดยใช้ `<AccountLayout>` เหมือนเมนูการตั้งค่าอื่นๆ

## 2. การจัดการแบบฟอร์มและการทำงาน (Form & Behavior)
- [x] **Component Reusability**: นำโค้ดฟอร์มจาก Onboarding 5 ตัวมาใช้ซ้ำ (Reuse Component) และไม่ไปกระทบการทำงานของ Onboarding เดิม
- [x] **Validation รวบยอด**: เมื่อกดปุ่ม "บันทึก" ระบบจะทำการ Validate ทุกๆ ฟอร์มผ่าน `ref.current.validate()` และหากมี Error จะโชว์ขึ้นที่ฟอร์มนั้นทันที
- [x] **Confirm Dialog (Unsaved Changes)**: หากมีการแก้ไขแล้วกดเมนูอื่นเพื่อเปลี่ยนหน้า จะต้องแจ้งเตือนการสูญหายของข้อมูล (ทำผ่าน `useUnsavedChanges` และเช็คความเปลี่ยนเปลงของข้อมูลเทียบกับ `initialData`)
- [x] **Loading & Feedback (Toast)**: แสดงสถานะ Loading ระหว่างดึงข้อมูลและบันทึก และแจ้งเตือนด้วย Toast เมื่อสำเร็จ

## 3. การทดสอบ (Testing)
- [x] **เพิ่ม Unit Test**: สร้าง Test Case อย่างครอบคลุมลงใน `tests/` เพื่อตรวจสอบการบันทึกข้อมูล `onboardingData`
- [ ] **Test Coverage**: เช็คว่ามีกรณีไหนยังไม่ได้ทดสอบหรือขาดตกบกพร่องตาม Requirements ข้างต้น (กำลังดำเนินการ)
