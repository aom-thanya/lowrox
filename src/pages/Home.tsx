import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Crown, Gauge, PlayCircle, ShieldCheck, Trophy, TrendingUp, Users } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LoginModal from '../components/LoginModal';
import { useAuth } from '../context/AuthContext';
import { getLoginDestination } from '../utils/authRedirect';
import FeatureCard from '../components/home/FeatureCard';
import HeroLevelCard from '../components/home/HeroLevelCard';
import Marquee from '../components/home/Marquee';
import PartyCard from '../components/home/PartyCard';
import Reveal from '../components/home/Reveal';
import Sparkles from '../components/common/Sparkles';
import '../styles/home.css';

const MARQUEE_TOP = ['HYROX', 'Buddy Doubles', 'วิ่ง 5K', 'Functional Race', 'Same-Level Training', 'Trail Run', 'ตั้งหัวตี้'];
const MARQUEE_BOTTOM = ['รู้เลเวลตัวเอง', 'แผนซ้อมทีละขั้น', 'หาบัดดี้เลเวลเดียวกัน', 'ซ้อมแบบไม่กดดัน', 'พร้อมลงสนามจริง', 'อัปเลเวลไปด้วยกัน'];

const PAINS = [
  {
    icon: Gauge,
    pain: 'ซ้อมทุกวัน แต่ไม่รู้ว่าตัวเองอยู่เลเวลไหน',
    title: 'เห็นเลเวลชัด',
    description: 'ใส่สถิติจริง เช่น วิ่ง 5 กม. ใช้เวลาเท่าไร แล้วรู้ทันทีว่าคุณอยู่ระดับ Beginner, Intermediate หรือ Advanced'
  },
  {
    icon: ShieldCheck,
    pain: 'กังวลเรื่องความปลอดภัยก่อนลงสนามโหด ๆ',
    title: 'Safety check ก่อนซ้อม',
    description: 'บอกข้อจำกัดด้านสุขภาพไว้ตั้งแต่ต้น เราปรับคำแนะนำให้ค่อย ๆ เพิ่มความหนักอย่างเหมาะสม'
  },
  {
    icon: Users,
    pain: 'อยากลงแข่งแบบคู่ แต่ไม่มีบัดดี้',
    title: 'จับคู่เลเวลเดียวกัน',
    description: 'เจอคู่ซ้อมที่ระดับใกล้กัน เป้าหมายคล้ายกัน และว่างช่วงเวลาเดียวกัน พร้อมไปลง Doubles ด้วยกัน'
  },
  {
    icon: TrendingUp,
    pain: 'ซ้อมกับเทรนเนอร์แล้วกดดัน เพราะเขาเก่งเกินไป',
    title: 'แผนซ้อมทีละขั้น',
    description: 'ขยับจากเลเวลปัจจุบันทีละก้าว พร้อมคลิปเทรนนิ่งที่เหมาะกับระดับของคุณ ไม่ต้องตามใครให้ทัน'
  }
];

const LEVEL_STOPS = [
  { level: 'Beginner', record: '5 กม. · 60 นาที' },
  { level: 'Intermediate', record: '5 กม. · 50 นาที' },
  { level: 'เป้าหมาย', record: '5 กม. · 40 นาที' }
];

const CTA_SPARKLES = [
  { top: '18%', left: '8%', size: 22, delay: 0 },
  { top: '70%', left: '14%', size: 14, delay: 1.1 },
  { top: '24%', left: '86%', size: 16, delay: 0.6 },
  { top: '76%', left: '90%', size: 24, delay: 1.7 },
  { top: '8%', left: '52%', size: 10, delay: 2.2 },
];

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  // Signed-in users skip straight to their level (or onboarding); guests sign in first.
  const startLevelCheck = () => (user ? navigate(getLoginDestination(user)) : setIsLoginModalOpen(true));

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="home-main">
        {/* Hero */}
        <section className="home-hero">
          <div className="home-hero-bg" aria-hidden="true" />
          <div className="page-container home-hero-grid">
            <div className="home-hero-copy">
              <span className="home-eyebrow">สำหรับสาย HYROX · วิ่ง · Functional Fitness</span>
              <h1 className="display-lg">
                รู้เลเวล หาบัดดี้ <span className="home-shimmer">พิชิตสนามจริง</span>
              </h1>
              <p className="body-lg">
                ประเมินระดับความฟิตจากสถิติจริงของคุณ รับแผนซ้อมทีละขั้น
                แล้วจับคู่ซ้อมกับคนเลเวลใกล้กัน ซ้อมสนุก ไม่กดดัน พร้อมลงแข่งแบบ Buddy
              </p>
              <div className="home-hero-actions">
                <button type="button" onClick={startLevelCheck} className="btn btn-primary btn-md btn-cta home-btn-glow">
                  เช็กเลเวลฟรี <ArrowRight size={18} />
                </button>
                <Link to="/events" className="btn btn-md home-btn-ghost">ดูตี้ซ้อมทั้งหมด</Link>
              </div>
              <p className="home-hero-note"><Check size={16} /> เริ่มฟรี ใช้เวลาประมาณ 3 นาที</p>
            </div>

            <div className="home-hero-visual">
              <HeroLevelCard />
            </div>
          </div>
        </section>

        {/* Ticker */}
        <section className="home-ticker" aria-label="สิ่งที่ทำได้บน Lowrox">
          <Marquee items={MARQUEE_TOP} />
          <Marquee items={MARQUEE_BOTTOM} reverse />
        </section>

        {/* Consumer pains → gains */}
        <section className="home-section">
          <div className="page-container">
            <Reveal className="home-section-heading">
              <span className="home-kicker">ปัญหาที่เรารู้ดี</span>
              <h2 className="heading-2">ออกกำลังกายเป็นประจำ แต่อยากไปให้ไกลกว่าเดิม</h2>
            </Reveal>

            <div className="home-pain-grid">
              {PAINS.map(({ icon: Icon, pain, title, description }, index) => (
                <Reveal key={title} from={index % 2 === 0 ? 'left' : 'right'} delay={index * 80}>
                  <article className="home-pain-card">
                    <span className="home-pain-icon"><Icon size={24} /></span>
                    <p className="home-pain-before">{pain}</p>
                    <h3 className="heading-4">{title}</h3>
                    <p className="body-md">{description}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Level-up journey */}
        <section className="home-section home-journey">
          <div className="page-container home-split">
            <Reveal from="left" className="home-split-copy">
              <span className="home-kicker">Level Up</span>
              <h2 className="heading-2">จาก 5 กม. 60 นาที สู่ 40 นาที ทีละก้าว</h2>
              <p className="body-lg">
                ระบบดูว่าคุณอยู่ตรงไหน แล้ววางแผนซ้อมให้ขยับไปเลเวลถัดไปแบบปลอดภัย
              </p>
              <ul className="home-check-list">
                <li><Check size={18} /> แผนซ้อมรายสัปดาห์ตามเลเวลของคุณ</li>
                <li><PlayCircle size={18} /> คลิปเทรนนิ่งและเทคนิคที่เหมาะกับระดับ</li>
                <li><TrendingUp size={18} /> เห็นพัฒนาการทุกครั้งที่บันทึกผลซ้อม</li>
              </ul>
            </Reveal>

            <Reveal from="right" className="home-track-card">
              <div className="home-track" aria-hidden="true">
                <div className="home-track-line"><i /></div>
                <div className="home-track-lane"><span className="home-track-runner" /></div>
              </div>
              <ol className="home-track-stops">
                {LEVEL_STOPS.map(stop => (
                  <li key={stop.level}>
                    <strong>{stop.level}</strong>
                    <span>{stop.record}</span>
                  </li>
                ))}
              </ol>
            </Reveal>
          </div>
        </section>

        {/* Producer: open a party */}
        <section className="home-section home-party">
          <div className="page-container home-split is-reversed">
            <Reveal from="right" className="home-split-copy">
              <span className="home-kicker">ตั้งหัวตี้</span>
              <h2 className="heading-2">ใครก็เป็นหัวตี้ได้ แล้วรอคนเลเวลเดียวกันมาจอย</h2>
              <p className="body-lg">
                เปิดตี้ซ้อมได้ง่ายเหมือนเปิดตี้สั่งอาหาร ระบบช่วยชวนคนที่ระดับใกล้กันเข้ามา
                ได้ทั้งเพื่อนซ้อมและบัดดี้ลงแข่ง
              </p>
              <div className="home-trainer-note">
                <Trophy size={22} />
                <p><strong>สำหรับเทรนเนอร์</strong> สะสมแต้มและรับรางวัลเมื่อลูกตี้ของคุณสมัครสมาชิกต่อบน Lowrox</p>
              </div>
              <Link to="/events" className="btn btn-primary btn-md btn-cta home-btn-glow">ดูตี้ที่เปิดอยู่ <ArrowRight size={18} /></Link>
            </Reveal>

            <Reveal from="left" className="home-party-visual">
              <Sparkles points={[{ top: '-6%', left: '6%', size: 16, delay: 0.3 }, { top: '88%', left: '94%', size: 20, delay: 1.4 }, { top: '40%', left: '98%', size: 10, delay: 0.9 }]} />
              <PartyCard />
            </Reveal>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="home-section">
          <div className="page-container">
            <Reveal className="home-section-heading">
              <span className="home-kicker">วิธีใช้งาน</span>
              <h2 className="heading-2">เริ่มได้ใน 3 ขั้นตอน</h2>
            </Reveal>
            <div className="home-feature-grid">
              {[
                { step: '1', title: 'เช็กเลเวลของคุณ', description: 'ตอบคำถามเรื่องสถิติ เป้าหมาย และเวลาที่สะดวก ใช้เวลาประมาณ 3 นาที' },
                { step: '2', title: 'จอยหรือตั้งตี้ซ้อม', description: 'เลือกตี้ที่เลเวลใกล้กัน หรือเปิดตี้เองแล้วรอบัดดี้มาจอย' },
                { step: '3', title: 'ซ้อมแล้วอัปเลเวล', description: 'ทำตามแผนซ้อม บันทึกผล แล้วดูเลเวลของคุณขยับขึ้นไปด้วยกัน' }
              ].map((item, index) => (
                <Reveal key={item.step} delay={index * 120}>
                  <FeatureCard step={item.step} title={item.title} description={item.description} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Free vs member */}
        <section id="plans" className="home-section home-plans">
          <div className="page-container">
            <Reveal className="home-section-heading">
              <span className="home-kicker">แพ็กเกจ</span>
              <h2 className="heading-2">เริ่มฟรี แล้วอัปเกรดเมื่อพร้อมไปต่อ</h2>
            </Reveal>
            <div className="home-plan-grid">
              <Reveal from="left">
                <article className="home-plan-card">
                  <h3 className="heading-4">Free</h3>
                  <p className="home-plan-tagline">รู้จักตัวเองและหาเพื่อนซ้อม</p>
                  <ul className="home-check-list">
                    <li><Check size={18} /> ประเมินเลเวลและโชว์บนโปรไฟล์</li>
                    <li><Check size={18} /> จอยและตั้งตี้ซ้อม</li>
                    <li><Check size={18} /> Safety check ก่อนเริ่มซ้อม</li>
                  </ul>
                </article>
              </Reveal>
              <Reveal from="right" delay={100}>
                <article className="home-plan-card is-member">
                  <span className="home-plan-badge"><Crown size={14} /> Member</span>
                  <h3 className="heading-4">Member</h3>
                  <p className="home-plan-tagline">ทุกอย่างที่ต้องใช้เพื่ออัปเลเวล</p>
                  <ul className="home-check-list">
                    <li><Check size={18} /> แผนซ้อมอัปเลเวลแบบทีละขั้น</li>
                    <li><Check size={18} /> คลิปสอนและเทคนิคตามเลเวล</li>
                    <li><Check size={18} /> ติดตามพัฒนาการแบบละเอียด</li>
                  </ul>
                </article>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="home-cta">
          <Sparkles points={CTA_SPARKLES} />
          <Reveal className="page-container home-cta-content">
            <h2 className="heading-2">พร้อมรู้เลเวลตัวเองหรือยัง?</h2>
            <p className="body-lg">เช็กเลเวลฟรี แล้วไปหาบัดดี้ที่พร้อมพิชิตสนามจริงไปด้วยกัน</p>
            <button type="button" onClick={startLevelCheck} className="btn btn-primary btn-md btn-cta home-btn-glow">
              เช็กเลเวลฟรี <ArrowRight size={18} />
            </button>
          </Reveal>
        </section>
      </main>

      <Footer />
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </div>
  );
}
