import React from 'react';

interface PlaceholderChipProps {
  label: string;
  className?: string;
}

export const PlaceholderChip: React.FC<PlaceholderChipProps> = ({ label, className = '' }) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] uppercase font-bold tracking-[0.08em] rounded-[4px] bg-[#F4B942]/15 text-[#F4B942] border border-[#F4B942]/30 ${className}`}
    >
      <span>✏️</span>
      <span>{label}</span>
    </span>
  );
};

interface PlaceholderEmptyStateProps {
  emoji?: string;
  headline: string;
  subtext: string;
  chipText?: string;
  ctaText?: string;
  onCtaClick?: () => void;
  className?: string;
}

export const PlaceholderEmptyState: React.FC<PlaceholderEmptyStateProps> = ({
  emoji,
  headline,
  subtext,
  chipText,
  ctaText,
  onCtaClick,
  className = '',
}) => {
  return (
    <div
      className={`rounded-xl p-8 text-center border-[1.5px] border-dashed border-[#F4B942]/50 bg-[#F4B942]/[0.04] flex flex-col items-center justify-center ${className}`}
    >
      {emoji && <div className="text-[48px] mb-3 leading-none select-none">{emoji}</div>}
      <h3 className="text-[18px] font-bold font-editorial-serif text-[var(--text-primary)] mb-2">
        {headline}
      </h3>
      <p className="text-[14px] italic text-[var(--text-muted)] max-w-md mb-4 leading-relaxed">
        {subtext}
      </p>
      {ctaText && onCtaClick && (
        <button
          onClick={onCtaClick}
          className="editorial-btn px-4 py-2 text-[13px] font-semibold rounded bg-[#F4B942] text-[#003B5C] hover:bg-[#FFD100] transition-colors mb-4 shadow-sm"
        >
          {ctaText}
        </button>
      )}
      {chipText && <PlaceholderChip label={chipText} className="mt-1" />}
    </div>
  );
};
