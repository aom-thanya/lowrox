# Lowrox - เจอคู่ซ้อมที่ใช่ พิชิตเป้าหมายไปด้วยกัน

Lowrox แพลตฟอร์มหาคู่ซ้อมและคอมมูนิตี้ออกกำลังกาย ที่ช่วยจับคู่คนตามระดับความสามารถและเป้าหมาย พร้อมแผนการซ้อมเพื่อพัฒนาไปถึงเป้าหมายด้วยกัน

## 🛠 Tech Stack

- **Frontend Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router DOM
- **Styling**: Vanilla CSS (Global styles with custom design system)
- **Icons**: Lucide React

## ✨ Features

- **Landing Page**: หน้าแรกที่ออกแบบเพื่อนำเสนอวิสัยทัศน์และฟีเจอร์หลักของ Lowrox
- **Authentication**: ระบบ Login แบบ Standalone Page และ Modal
- **Multi-step Onboarding**: ฟอร์ม Onboarding 5 ขั้นตอนสำหรับผู้ใช้ใหม่ เพื่อเก็บข้อมูลพื้นฐาน สถิติ เป้าหมาย ข้อจำกัด และข้อมูลสุขภาพ (Mapping กับ Database Schema แบบ 1:N)
- **State Management**: ใช้ React Context API สำหรับจัดการ Auth State และ Onboarding Form State

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## 🧪 Testing Credentials

โปรเจกต์นี้จำลองข้อมูลการ Login ไว้เพื่อการทดสอบ (Mock Data):

- **ผู้ใช้ที่ผ่าน Onboarding แล้ว (Completed)**
  - Username: `test`
  - Password: `password`
  - *ระบบจะพาไปที่หน้า Profile ทันที*

- **ผู้ใช้ใหม่ที่ยังไม่ทำ Onboarding (Not Started)**
  - Username: `new`
  - Password: `password`
  - *ระบบจะเปิดหน้าต่าง Multi-step Onboarding Modal อัตโนมัติ*

## 📁 Project Structure

- `src/assets/`: รูปภาพและไอคอนต่างๆ (รวมถึง Logo)
- `src/components/`: คอมโพเนนต์ที่ใช้ร่วมกัน เช่น Header, Footer, LoginForm
- `src/components/onboarding/`: คอมโพเนนต์สำหรับ Onboarding Modal แต่ละสเตป
- `src/context/`: Context Provider (AuthContext, OnboardingContext)
- `src/pages/`: หน้าหลักของเว็บไซต์ (Home, Login, Onboarding, Profile)
- `src/style.css`: ไฟล์ CSS หลักที่มี Design System Tokens

## 📄 Documentation

- `design.md`: เอกสารอ้างอิงด้าน Design และ UX/UI Requirements
- `database.md`: เอกสารอ้างอิงโครงสร้าง Database Schema สำหรับนำไปสร้าง API
