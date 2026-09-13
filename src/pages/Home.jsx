import React, { useState } from 'react';
import Image from '../components/common/Image';
import { Target, Activity, Clock } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import FeatureCard from '../components/home/FeatureCard';
import heroImg from '../assets/hero.png';

export default function Home() {
  const [heroFailed, setHeroFailed] = useState(false);
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="home-main">
        {/* Hero Section */}
        <section className="home-hero">
          <div className="container">
            <div className="home-hero-grid">
              <div className="home-hero-copy">
                <h1 className="heading-1">หาเพื่อนออกกำลังกาย ในจังหวะที่ใช่สำหรับคุณ</h1>
                <p className="body-lg text-neutral-600">
                  เริ่มจากเป้าหมายและเวลาที่สะดวก แล้วหา Buddy ที่พร้อมไปด้วยกัน
                </p>
                
                <div className="home-hero-actions">
                  <Link to="/events" className="btn btn-primary btn-md btn-cta">
                    ดูกิจกรรม
                  </Link>
                  <a href="#how-it-works" className="btn btn-secondary btn-md">
                    ดูวิธีใช้งาน
                  </a>
                </div>
                <p className="text-sm text-neutral-500">เพิ่งเริ่มหรือออกเป็นประจำ ก็หา Buddy ได้</p>
              </div>
              
              <div className="home-hero-visual">
                {/* Use the existing hero.png asset */}
                <div className="home-hero-image">
                  {heroFailed ? (
                    <div className="home-hero-fallback" role="img" aria-label="ออกกำลังกายด้วยกัน">
                      <Activity size={120} aria-hidden="true" />
                    </div>
                  ) : (
                    <Image
                      src={heroImg}
                      alt="People exercising together"
                      className="home-hero-art"
                      loading="eager"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Highlights Section */}
        <section className="home-section home-highlights">
          <div className="container">
            <div className="home-section-heading">
              <h2 className="heading-2">หา Buddy ที่เข้ากับคุณ</h2>
            </div>
            
            <div className="home-feature-grid">
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
        <section id="how-it-works" className="home-section">
          <div className="container">
            <div className="home-section-heading">
              <h2 className="heading-2">เริ่มหา Buddy ใน 3 ขั้นตอน</h2>
            </div>
            
            <div className="home-feature-grid">
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
                description="เมื่ออีกฝ่ายยอมรับ ตกลงวัน เวลา และสถานที่ออกกำลังกายด้วยกัน"
              />
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="home-section home-cta">
          <div className="container home-cta-content">
            <h2 className="heading-2">พร้อมมีเพื่อนไปออกกำลังกายด้วยกันหรือยัง?</h2>
            <p className="body-lg text-neutral-600">
              เริ่มจากบอกเราเกี่ยวกับคุณ แล้วไปหา Buddy กัน
            </p>
            <Link to="/events" className="btn btn-primary btn-md btn-cta">
              ดูกิจกรรม
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
