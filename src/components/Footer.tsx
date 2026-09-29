import React from 'react';
import { TabId } from '../types';
import { HardDrive } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: TabId) => void;
  onOpenDriveModal?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenDriveModal }) => {
  return (
    <footer className="w-full mt-16">
      {/* Top CTA Bar */}
      <div className="w-full bg-[var(--bg-raised)] border-t border-[var(--border-color)] py-10 px-6 sm:px-12 lg:px-20">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column */}
          <div className="lg:col-span-5">
            <h3 className="font-editorial-serif font-bold text-[19px] text-[var(--text-primary)] mb-2">
              Got something for Issue 03?
            </h3>
            <p className="text-[15px] text-[var(--text-secondary)] leading-relaxed">
              Submit by September 30 — spotlights, birthdays, club news, recruiting tips, apartment
              sublets, intramural glory.
            </p>
          </div>

          {/* Center Column: Two Buttons */}
          <div className="lg:col-span-4 flex flex-wrap sm:flex-nowrap gap-3 items-center">
            <button
              id="footer-submit-btn"
              onClick={() => {
                onNavigate('submit');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="editorial-btn flex-1 px-5 py-2.5 text-[14px] font-semibold rounded bg-[#2774AE] text-white hover:bg-[#1f5d8c] transition-colors shadow-sm text-center"
            >
              Submit an item
            </button>
            <button
              id="footer-feedback-btn"
              onClick={() => {
                onNavigate('academic-feedback');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="editorial-btn flex-1 px-5 py-2.5 text-[14px] font-semibold rounded border border-[var(--text-secondary)] text-[var(--text-primary)] hover:border-[#F4B942] hover:text-[#F4B942] transition-colors text-center"
            >
              Give academic feedback
            </button>
          </div>

          {/* Right Column: Past issues link & Save to Drive */}
          <div className="lg:col-span-3 flex flex-col items-start lg:items-end gap-3 text-left lg:text-right">
            <button
              id="footer-archive-link"
              onClick={() => {
                onNavigate('archive');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-[#2774AE] hover:text-[#F4B942] transition-colors font-semibold text-[14px] group inline-flex items-center gap-1 cursor-pointer"
            >
              Read past issues <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>

            {onOpenDriveModal && (
              <button
                id="footer-drive-btn"
                onClick={onOpenDriveModal}
                className="text-xs font-semibold text-[#F4B942] hover:text-[#FFD100] flex items-center gap-1.5 transition-colors cursor-pointer py-1 px-2 rounded hover:bg-[#F4B942]/10"
              >
                <HardDrive className="w-3.5 h-3.5 text-[#F4B942]" />
                <span>Save Project to Google Drive</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Thin Footer Bottom */}
      <div className="w-full bg-[#003B5C] border-t border-[#F4B942] py-8 px-6 sm:px-12 lg:px-20 text-center text-[12px] text-white/80 leading-relaxed">
        <div className="max-w-[1200px] mx-auto flex flex-col items-center gap-2">
          <p className="font-medium tracking-wide">
            The Place to B · Section B · UCLA Anderson School of Management · Class of 2028
          </p>
          <p className="text-white/60">
            Made with 💙 by Section B Leadership
          </p>
          <p className="text-[11px] text-white/40 max-w-2xl mt-1">
            This newsletter is a student-produced publication and is not an official communication
            of UCLA Anderson School of Management.
          </p>
        </div>
      </div>
    </footer>
  );
};
