import { UserRound, ClipboardList, Settings, Watch } from 'lucide-react';

export const profileNavigation = [
  { to: '/profile', label: 'ดูและแก้ไขโปรไฟล์', description: 'จัดการข้อมูลส่วนตัวและโปรไฟล์ของคุณ', icon: UserRound },
  { to: '/profile/onboarding', label: 'แก้ไขข้อมูลจาก Onboarding', description: 'อัปเดตเป้าหมายและความต้องการในการหา Buddy', icon: ClipboardList },
  { to: '/profile/devices', label: 'เชื่อมต่ออุปกรณ์', description: 'เชื่อมนาฬิกา Garmin, COROS หรือ Strava ให้การวิ่งเข้ามาเอง', icon: Watch },
  { to: '/profile/settings', label: 'ตั้งค่าบัญชี', description: 'จัดการการตั้งค่าบัญชีของคุณ', icon: Settings },
];
