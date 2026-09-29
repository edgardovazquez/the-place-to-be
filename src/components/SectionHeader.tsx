import React from 'react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle, className = '' }) => {
  return (
    <div className={`mb-6 ${className}`}>
      <h2 className="text-[14px] font-bold uppercase tracking-[0.12em] text-[#2774AE]">
        {title}
      </h2>
      <div className="h-[2px] w-[80px] bg-[#F4B942] mt-2 mb-2" aria-hidden="true" />
      {subtitle && (
        <p className="text-[15px] italic text-[#2774AE] font-editorial-serif mt-1">
          {subtitle}
        </p>
      )}
    </div>
  );
};
