import React from 'react';
import { Target, Activity, Clock } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FindBuddyCTA from '../components/home/FindBuddyCTA';
import FeatureCard from '../components/home/FeatureCard';
import heroImg from '../assets/hero.png';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="main-content flex-grow">
        {/* Hero Section */}
        <section className="pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
          <div className="container">
            <div className="flex flex-col-reverse md:flex-row items-center gap-12 md:gap-8">
              <div className="w-full md:w-1/2 flex flex-col items-start text-left">
                <h1 className="heading-1 mb-6">หาเพื่อนออกกำลังกาย ในจังหวะที่ใช่สำหรับคุณ</h1>
                <p className="body-lg text-neutral-600 mb-8">
                  เริ่มจากเป้าหมายและเวลาที่สะดวก แล้วหา Buddy ที่พร้อมไปด้วยกัน
                </p>
                
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <FindBuddyCTA variant="primary" />
                  <a href="#how-it-works" className="btn btn-secondary btn-md">
                    ดูวิธีใช้งาน
                  </a>
                </div>
                <p className="text-sm text-neutral-500">เพิ่งเริ่มหรือออกเป็นประจำ ก็หา Buddy ได้</p>
              </div>
              
              <div className="w-full md:w-1/2 flex justify-center">
                {/* Use the existing hero.png asset */}
                <div className="relative w-full max-w-[500px] aspect-square rounded-2xl overflow-hidden bg-brand-50 flex items-center justify-center">
                  <img 
                    src={heroImg} 
                    alt="People exercising together" 
                    className="w-full h-full object-contain p-8"
                    onError={(e) => {
                      // Fallback placeholder if hero.png fails to load
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="absolute inset-0 hidden items-center justify-center text-brand-500">
                    <Activity size={120} opacity={0.2} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Highlights Section */}
        <section className="py-16 md:py-24 bg-neutral-50">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="heading-2">หา Buddy ที่เข้ากับคุณ</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FeatureCard 
                icon={Target}
                title="เป้าหมายใกล้กัน"
                description="หาเพื่อนที่อยากไปในทิศทางเดียวกัน"
              />
              <FeatureCard 
                icon={Activity}
                title="จังหวะที่เข้ากัน"
                description="เลือกระดับการออกกำลังกายที่คุณรู้สึกสบายใจ"
              />
              <FeatureCard 
                icon={Clock}
                title="เวลาที่ลงตัว"
                description="หาคนที่สะดวกออกกำลังกายในช่วงเวลาใกล้กัน"
              />
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section id="how-it-works" className="py-16 md:py-24">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="heading-2">เริ่มหา Buddy ใน 3 ขั้นตอน</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FeatureCard 
                step="1"
                title="บอกเราเกี่ยวกับคุณ"
                description="ตั้งโปรไฟล์และตอบคำถามเกี่ยวกับเป้าหมายและการออกกำลังกาย"
              />
              <FeatureCard 
                step="2"
                title="เลือก Buddy ที่สนใจ"
                description="ดูโปรไฟล์และส่งคำขอเชื่อมต่อ"
              />
              <FeatureCard 
                step="3"
                title="คุยแล้วนัดกัน"
                description="เมื่ออีกฝ่ายยอมรับ เริ่มแชทเพื่อตกลงวัน เวลา และสถานที่"
              />
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 md:py-32 bg-brand-50 text-center">
          <div className="container max-w-[600px]">
            <h2 className="heading-2 mb-4">พร้อมมีเพื่อนไปออกกำลังกายด้วยกันหรือยัง?</h2>
            <p className="body-lg text-neutral-600 mb-8">
              เริ่มจากบอกเราเกี่ยวกับคุณ แล้วไปหา Buddy กัน
            </p>
            <FindBuddyCTA variant="primary" />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
