# Lowrox - เจอคู่ซ้อมที่ใช่ พิชิตเป้าหมายไปด้วยกัน

Lowrox แพลตฟอร์มหาคู่ซ้อมและคอมมูนิตี้ออกกำลังกาย ที่ช่วยจับคู่คนตามระดับความสามารถและเป้าหมาย พร้อมแผนการซ้อมเพื่อพัฒนาไปถึงเป้าหมายด้วยกัน

## 🛠 Tech Stack

- **Frontend Framework**: React 19
- **Language**: TypeScript (`strict` mode)
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

3. Check TypeScript types (application, tests, and Vite configuration):
```bash
npm run typecheck
```

4. Run tests:
```bash
npm test
```

5. Build for production (includes type checking):
```bash
npm run build
```

## 🗄 Database (Supabase)

แอปอ่านและเขียนข้อมูลจริงจาก Supabase โดยใช้ตาราง `ms_*` / `txn_*` ชุดเดียวกับที่ ETL ([daruntoey/lowrox_etl](https://github.com/daruntoey/lowrox_etl)) อ่าน

**ตั้งค่าครั้งแรก**

1. รัน SQL ใน Supabase → SQL Editor ตามลำดับ: `lowrox_etl/sql/01_schema.sql`, `02_seed.sql`, `03_auth_and_rls.sql` (ถ้ายังไม่ได้รัน) แล้วรัน `supabase/04_frontend_integration.sql` ของ repo นี้ (รันซ้ำได้)
2. (ไม่บังคับ) `supabase/05_drop_unprefixed_duplicates.sql` ลบตาราง `users`, `events`, … ชุดเก่าที่ไม่มีใครใช้ สคริปต์จะไม่ลบถ้ายังมีข้อมูล
3. Supabase → Authentication → URL Configuration: ตั้ง **Site URL** = `https://lowrox.vercel.app` และเพิ่ม **Redirect URLs** `https://lowrox.vercel.app/**` กับ `http://localhost:5173/**`
4. Authentication → Email Templates → **Magic Link**: เพิ่ม `{{ .Token }}` ในเนื้อหา เพื่อให้อีเมลมีรหัส 6 หลักด้วย (ลิงก์ใช้ได้อยู่แล้ว)
5. Vercel → Settings → Environment Variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` แล้ว Redeploy

**การเข้าสู่ระบบ** ใช้อีเมล (ลิงก์หรือรหัส 6 หลัก) ผ่าน Supabase Auth ผู้ใช้ใหม่ได้บัญชีอัตโนมัติ ส่วน LINE Login ยังเป็น mock และจะแสดงเฉพาะโหมด offline

**โหมด offline / unit test** `npm test` และ `VITE_DATA_SOURCE=local npm run dev` ใช้ข้อมูลจำลองใน localStorage แบบเดิม ไม่แตะฐานข้อมูล

> ห้ามใส่ `SUPABASE_SECRET_KEY` เป็นตัวแปร `VITE_*` เพราะ Vite จะฝังลงในไฟล์ JavaScript ที่ทุกคนโหลดได้

## 📁 Project Structure

- `src/assets/`: รูปภาพและไอคอนต่างๆ (รวมถึง Logo)
- `src/components/`: คอมโพเนนต์ที่ใช้ร่วมกัน เช่น Header, Footer, LoginForm
- `src/components/onboarding/`: คอมโพเนนต์สำหรับ Onboarding Modal แต่ละสเตป
- `src/context/`: Context Provider (AuthContext, OnboardingContext)
- `src/services/`: repositories ที่หน้าเว็บเรียกใช้ เลือก Supabase หรือข้อมูลจำลองให้อัตโนมัติ
- `src/services/supabase/`: การเรียก Supabase และการแปลงแถวในตารางเป็น model ของแอป
- `supabase/`: SQL migration สำหรับหน้าเว็บ
- `src/pages/`: หน้าหลักของเว็บไซต์ (Home, Login, Onboarding, Profile)
- `src/types/models.ts`: Shared types for users, profiles, events, comments, and onboarding forms
- `tsconfig.json`: Strict TypeScript configuration
- `src/style.css`: ไฟล์ CSS หลักที่มี Design System Tokens

## 📄 Documentation

- `design.md`: เอกสารอ้างอิงด้าน Design และ UX/UI Requirements
- `database.md`: เอกสารอ้างอิงโครงสร้าง Database Schema สำหรับนำไปสร้าง API
