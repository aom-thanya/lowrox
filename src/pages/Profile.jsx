import React, { useEffect } from 'react';
import PageHeader from '../components/common/PageHeader';
import ContentCard from '../components/common/ContentCard';

export default function Profile({ page }) {
  const Icon = page.icon;
  useEffect(() => {
    const previousTitle = document.title;
    document.title = `${page.label} | My Profile | Lowrox`;
    return () => { document.title = previousTitle; };
  }, [page.label]);

  return (
    <>
      <PageHeader title={page.label} description={page.description} />
      <ContentCard>
        <div className="content-placeholder">
          <span className="content-placeholder-icon"><Icon size={32} aria-hidden="true" /></span>
          <h2 className="heading-4">พื้นที่สำหรับ{page.label}</h2>
          <p className="body-md">เนื้อหาส่วนนี้จะพร้อมใช้งานในภายหลัง</p>
        </div>
      </ContentCard>
    </>
  );
}
