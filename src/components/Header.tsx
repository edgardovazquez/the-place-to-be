import React, { useEffect, useState } from 'react';
import { TabId } from '../types';
import { Sun, Moon, Shield, HardDrive, UserPlus } from 'lucide-react';

interface HeaderProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  isEditorAuthenticated: boolean;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenDriveModal?: () => void;
  onOpenShareModal?: () => void;
}

const TABS: { id: TabId; label: string }[] = [
  { id: 'this-week', label: 'THIS WEEK' },
  { id: 'archive', label: 'ARCHIVE' },
  { id: 'submit', label: 'SUBMIT AN ITEM' },
  { id: 'vote-socials', label: 'VOTE ON SOCIALS' },
  { id: 'academic-feedback', label: 'ACADEMIC FEEDBACK' },
  { id: 'editor', label: 'EDITOR' },
];

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  isEditorAuthenticated,
  theme,
  onToggleTheme,
  onOpenDriveModal,
  onOpenShareModal,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      id="main-navigation"
      className={`sticky top-0 z-50 w-full transition-all duration-200 border-b border-[var(--border-color)] ${
        isScrolled
          ? 'bg-[#0F2344]/85 backdrop-blur-[18px] shadow-lg'
          : 'bg-[#0F2344]'
      }`}
      style={{
        backgroundColor: isScrolled
          ? theme === 'light'
            ? 'rgba(255, 255, 255, 0.88)'
            : 'rgba(15, 35, 68, 0.85)'
          : undefined,
      }}
    >
      {/* Row 1: Primary Navigation */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Wordmark */}
          <div className="flex-shrink-0 flex items-center gap-2">
            <button
              id="nav-brand-btn"
              onClick={() => onTabChange('this-week')}
              className="text-left group cursor-pointer focus:outline-none"
              title="Return to This Week"
            >
              <span className="font-editorial-serif font-bold text-[22px] sm:text-[24px] text-[#F4B942] tracking-tight group-hover:text-[#FFD100] transition-colors">
                The Place to B<span className="text-[#F4B942]">.</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)] font-semibold">
                UCLA Anderson
              </span>
            </button>
          </div>

          {/* Nav Tabs (horizontal scroll on mobile) */}
          <nav
            aria-label="Main publication navigation"
            className="flex-1 flex items-center justify-center overflow-x-auto no-scrollbar scroll-smooth whitespace-nowrap px-2"
          >
            <div className="flex items-center space-x-1 md:space-x-2 py-1">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    id={`nav-tab-${tab.id}`}
                    onClick={() => onTabChange(tab.id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`relative px-3 py-2 text-[12px] md:text-[13px] font-bold tracking-[0.05em] uppercase transition-colors rounded-sm cursor-pointer ${
                      isActive
                        ? 'text-[var(--text-primary)]'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {tab.label}
                    {isActive && (
                      <span
                        className="absolute bottom-0 left-2 right-2 h-[2.5px] bg-[#F4B942] rounded-full"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Right Controls */}
          <div className="flex-shrink-0 flex items-center gap-2 sm:gap-3">
            {/* Save to Google Drive Button */}
            {onOpenDriveModal && (
              <button
                id="header-save-drive-btn"
                onClick={onOpenDriveModal}
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#F4B942]/40 bg-[#F4B942]/10 hover:bg-[#F4B942]/20 text-[#F4B942] hover:text-[#FFD100] transition-colors text-xs font-semibold cursor-pointer"
                title="Save Project to Google Drive"
              >
                <HardDrive className="w-3.5 h-3.5 text-[#F4B942]" />
                <span>Save to Drive</span>
              </button>
            )}

            {/* Share / Invite Coworker Button */}
            {onOpenShareModal && (
              <button
                id="header-share-btn"
                onClick={onOpenShareModal}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#2774AE]/50 bg-[#2774AE]/15 hover:bg-[#2774AE]/25 text-[#2774AE] hover:text-white transition-colors text-xs font-semibold cursor-pointer"
                title="Share project with coworker (Edit Access)"
              >
                <UserPlus className="w-3.5 h-3.5 text-[#2774AE]" />
                <span className="hidden md:inline">Share with Coworker</span>
                <span className="md:hidden">Share</span>
              </button>
            )}

            <div className="hidden lg:flex flex-col items-end text-right">
              <span className="text-[10px] tracking-[0.08em] uppercase font-bold text-[var(--text-muted)]">
                SECTION B · {isEditorAuthenticated ? 'EDITOR' : 'READER'}
              </span>
              <button
                id="header-editor-toggle-btn"
                onClick={() => onTabChange('editor')}
                className="text-[11px] text-[#2774AE] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Shield className="w-3 h-3 inline" />
                {isEditorAuthenticated ? 'Editor Hub' : 'Editor sign-in'}
              </button>
            </div>

            {/* Theme Toggle */}
            <button
              id="theme-toggle-btn"
              onClick={onToggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="p-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:border-[#F4B942] transition-colors cursor-pointer"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-[#F4B942]" fill="currentColor" strokeWidth={2.5} />
              ) : (
                <Moon className="w-4 h-4 text-[#2774AE]" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Row 2: Issue Metadata Bar */}
      <div className="border-t border-[var(--border-color)] bg-[var(--bg-card)]/70 py-1.5 px-4 sm:px-8 lg:px-12 text-[11px] tracking-[0.08em] uppercase text-[var(--text-muted)]">
        <div className="max-w-[1200px] mx-auto flex flex-wrap items-center justify-between gap-y-1">
          <div className="flex items-center gap-3">
            <span className="font-bold text-[var(--text-primary)]">VOL. 1 · NO. 2</span>
            <span className="text-[var(--border-color)]">|</span>
            <span className="font-medium text-[#2774AE]">WEEK OF SEP 17 – SEP 30, 2026</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline">LOS ANGELES, CALIFORNIA</span>
            <span className="hidden sm:inline text-[var(--border-color)]">|</span>
            <span className="text-[#2ED1BA] font-semibold">FREE TO THE SECTION</span>
          </div>
        </div>
      </div>
    </header>
  );
};
