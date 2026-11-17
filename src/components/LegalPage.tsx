import React from 'react';
import { Link } from 'react-router-dom';
import PageShell from './common/PageShell';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

// Who runs the service and how to reach them — shown on both legal pages.
export const LEGAL = {
  operator: 'ทีมงาน LOWROX',
  contactEmail: 'contact@lowrox.app',
  updated: '17 พฤศจิกายน 2569',
};

export interface LegalSection { title: string; body: React.ReactNode }

export default function LegalPage({ title, intro, sections, other }: {
  title: string;
  intro: React.ReactNode;
  sections: LegalSection[];
  other: { to: string; label: string };
}) {
  useDocumentTitle(`${title} | Lowrox`);
  return (
    <PageShell className="legal-page">
      <article className="page-container legal-article">
        <header className="legal-header">
          <h1 className="heading-2">{title}</h1>
          <p className="body-sm legal-updated">ปรับปรุงล่าสุด {LEGAL.updated}</p>
          <div className="body-md">{intro}</div>
        </header>
        <nav className="legal-toc" aria-label="สารบัญ">
          <ol>
            {sections.map((section, index) => (
              <li key={section.title}><a href={`#section-${index + 1}`}>{section.title}</a></li>
            ))}
          </ol>
        </nav>
        {sections.map((section, index) => (
          <section key={section.title} id={`section-${index + 1}`} className="legal-section">
            <h2 className="heading-4">{index + 1}. {section.title}</h2>
            <div className="body-md">{section.body}</div>
          </section>
        ))}
        <p className="body-sm legal-footer">
          ติดต่อเรา: <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a> · อ่าน<Link to={other.to}>{other.label}</Link>
        </p>
      </article>
    </PageShell>
  );
}
