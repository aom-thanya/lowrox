import type { NavigationItem } from '../types/models';
import React from 'react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import PageHeader from '../components/common/PageHeader';
import ContentCard from '../components/common/ContentCard';

export default function Profile({ page }: { page: NavigationItem & { description: string } }) {
  const Icon = page.icon;
  useDocumentTitle(`${page.label} | My Profile | Lowrox`);

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
