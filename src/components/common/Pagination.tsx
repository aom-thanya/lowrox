import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// First, last, and the pages around the current one; gaps become an ellipsis.
export function pageItems(page: number, pageCount: number): (number | 'gap')[] {
  const pages = [...new Set([1, page - 1, page, page + 1, pageCount])].filter(n => n >= 1 && n <= pageCount).sort((a, b) => a - b);
  return pages.flatMap((n, i) => (i > 0 && n - pages[i - 1] > 1 ? ['gap' as const, n] : [n]));
}

export default function Pagination({ page, pageCount, onChange, label = 'เลือกหน้า' }: { page: number; pageCount: number; onChange: (page: number) => void; label?: string }) {
  if (pageCount <= 1) return null;
  return (
    <nav className="pagination" aria-label={label}>
      <button type="button" className="pagination-btn" onClick={() => onChange(page - 1)} disabled={page <= 1} aria-label="หน้าก่อนหน้า">
        <ChevronLeft size={18} aria-hidden="true" />
      </button>
      {pageItems(page, pageCount).map((item, i) => item === 'gap'
        ? <span key={`gap-${i}`} className="pagination-gap" aria-hidden="true">…</span>
        : (
          <button
            key={item}
            type="button"
            className={`pagination-btn${item === page ? ' is-current' : ''}`}
            onClick={() => onChange(item)}
            aria-label={`หน้า ${item}`}
            aria-current={item === page ? 'page' : undefined}
          >
            {item}
          </button>
        ))}
      <button type="button" className="pagination-btn" onClick={() => onChange(page + 1)} disabled={page >= pageCount} aria-label="หน้าถัดไป">
        <ChevronRight size={18} aria-hidden="true" />
      </button>
    </nav>
  );
}
