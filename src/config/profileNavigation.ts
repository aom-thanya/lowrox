import { UserRound, ClipboardList, Settings } from 'lucide-react';

export const profileNavigation = [
  { to: '/profile', label: 'ดูและแก้ไขโปรไฟล์', description: 'จัดการข้อมูลส่วนตัวและโปรไฟล์ของคุณ', icon: UserRound },
  { to: '/profile/onboarding', label: 'แก้ไขข้อมูลจาก Onboarding', description: 'อัปเดตเป้าหมายและความต้องการในการหา Buddy', icon: ClipboardList },
  { to: '/profile/settings', label: 'ตั้งค่าบัญชี', description: 'จัดการการตั้งค่าบัญชีของคุณ', icon: Settings },
];
