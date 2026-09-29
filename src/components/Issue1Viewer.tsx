import React, { useState } from 'react';
import { ISSUE_1_CABINET, ISSUE_1_DATES, ISSUE_1_LETTER } from '../data/issue1Data';
import { Calendar, Phone, Sparkles, BookOpen } from 'lucide-react';

interface Issue1ViewerProps {
  onClose: () => void;
}

export const Issue1Viewer: React.FC<Issue1ViewerProps> = ({ onClose }) => {
  const [activePage, setActivePage] = useState<1 | 2>(1);

  return (
    <div className="w-full">
      {/* Page Tabs */}
      <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3 mb-5 flex-wrap gap-2">
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-[var(--bg-raised)] border border-[var(--border-color)]">
          <button
            onClick={() => setActivePage(1)}
            className={`px-3 py-1.5 rounded text-[12px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              activePage === 1
                ? 'bg-[#2774AE] text-white shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Page 1: Welcome & Dates
          </button>
          <button
            onClick={() => setActivePage(2)}
            className={`px-3 py-1.5 rounded text-[12px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              activePage === 2
                ? 'bg-[#2774AE] text-white shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Page 2: Meet the Cabinet
          </button>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)] font-medium">
          <BookOpen className="w-3.5 h-3.5 text-[#F4B942]" />
          <span>Original Section B Issue 1 · Class of 2028</span>
        </div>
      </div>

      {/* PAGE 1 CONTENT */}
      {activePage === 1 && (
        <div className="space-y-6 font-editorial-sans animate-fade-in">
          {/* Masthead Banner */}
          <div className="border-b-2 border-[#003B5C] pb-3">
            <div className="flex items-center justify-between text-[11px] font-bold tracking-[0.1em] uppercase text-[#2774AE] mb-1">
              <span>UCLA Anderson</span>
              <span>SECTION B NEWSLETTER</span>
            </div>
            <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-[var(--text-muted)] border-t border-[var(--border-color)] pt-1">
              <span>VOLUME 1 | ISSUE 1</span>
              <span className="px-2 py-0.5 rounded bg-[#F4B942] text-[#003B5C] font-black tracking-wider">
                FINALS WEEK | FALL 2026
              </span>
            </div>
          </div>

          {/* Section B Hero Block */}
          <div className="rounded-xl overflow-hidden bg-gradient-to-r from-[#003B5C] via-[#0B2545] to-[#2774AE] p-6 text-white text-center shadow-md relative">
            <div className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#FFD100] mb-1">
              Class of 2028 Inaugural Issue
            </div>
            <h1 className="font-editorial-serif font-black text-[38px] sm:text-[46px] tracking-tight text-white leading-none">
              SECTION B
            </h1>
            <p className="text-[13px] text-white/80 font-editorial-serif italic mt-1">
              The Weekly B · Welcoming our MBA family
            </p>
          </div>

          {/* Welcome Article */}
          <article className="space-y-4 text-[14.5px] leading-relaxed text-[var(--text-primary)] bg-[var(--bg-card)] p-5 sm:p-6 rounded-xl border border-[var(--border-color)]">
            <h2 className="font-editorial-serif font-bold text-[24px] sm:text-[28px] text-[#003B5C] dark:text-[#F4B942] tracking-tight">
              WELCOME TO THE WEEKLY B
            </h2>

            <p className="font-semibold text-[#2774AE] italic text-[15px]">
              {ISSUE_1_LETTER.greeting}
            </p>

            {ISSUE_1_LETTER.paragraphs.map((p, idx) => (
              <p key={idx} className="text-[var(--text-secondary)] leading-relaxed">
                {p}
              </p>
            ))}

            {/* Signoff */}
            <div className="pt-4 border-t border-[var(--border-color)] flex items-center justify-between flex-wrap gap-3">
              <div>
                <div className="text-[20px] mb-1">🐝</div>
                <div className="font-bold text-[16px] text-[var(--text-primary)] font-editorial-serif">
                  — {ISSUE_1_LETTER.signoff}
                </div>
                <div className="text-[12px] text-[#2774AE] font-semibold">
                  {ISSUE_1_LETTER.title} · Class of 2028
                </div>
              </div>
              <a
                href={`tel:${ISSUE_1_LETTER.phone}`}
                className="text-[12px] text-[var(--text-muted)] hover:text-[#2774AE] flex items-center gap-1 font-mono bg-[var(--bg-raised)] px-2.5 py-1 rounded border border-[var(--border-color)]"
              >
                <Phone className="w-3.5 h-3.5 text-[#F4B942]" />
                {ISSUE_1_LETTER.phone}
              </a>
            </div>
          </article>

          {/* Important Dates Box */}
          <div className="p-5 sm:p-6 rounded-xl bg-[#FFF9E6] dark:bg-[#1E2638] border border-[#F4B942]/60 text-[var(--text-primary)]">
            <h3 className="font-editorial-serif font-bold text-[18px] text-[#003B5C] dark:text-[#FFD100] uppercase tracking-wider mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#F4B942]" />
              IMPORTANT DATES
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* THIS WEEK */}
              <div>
                <h4 className="text-[12px] font-black uppercase tracking-[0.1em] text-[#2774AE] pb-1 border-b border-[#F4B942]/40 mb-2.5">
                  THIS WEEK
                </h4>
                <div className="space-y-2 text-[13px]">
                  {ISSUE_1_DATES.thisWeek.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-2">
                      <span className="font-medium text-[var(--text-primary)]">{item.name}</span>
                      <span className="text-[12px] text-[var(--text-muted)] font-mono text-right whitespace-nowrap">
                        {item.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* COMING UP */}
              <div>
                <h4 className="text-[12px] font-black uppercase tracking-[0.1em] text-[#2774AE] pb-1 border-b border-[#F4B942]/40 mb-2.5">
                  COMING UP
                </h4>
                <div className="space-y-2 text-[13px]">
                  {ISSUE_1_DATES.comingUp.map((item, idx) => (
                    <div key={idx} className="space-y-0.5">
                      <div className="text-[11px] font-bold text-[#F4B942] uppercase tracking-wider">
                        {item.date}
                      </div>
                      <div className="font-medium text-[var(--text-primary)]">{item.event}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-[var(--text-muted)] pt-2 border-t border-[var(--border-color)]">
            <span>UCLA ANDERSON | SECTION B</span>
            <span>PAGE 1</span>
          </div>
        </div>
      )}

      {/* PAGE 2 CONTENT */}
      {activePage === 2 && (
        <div className="space-y-6 font-editorial-sans animate-fade-in">
          {/* Header Banner */}
          <div className="border-b-2 border-[#003B5C] pb-3 flex items-center justify-between flex-wrap gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[22px]">🐻</span>
                <h2 className="font-editorial-serif font-black text-[26px] sm:text-[30px] text-[#003B5C] dark:text-[#F4B942] leading-tight">
                  Meet the Section B Cabinet
                </h2>
              </div>
              <div className="text-[11px] uppercase tracking-[0.15em] text-[#2774AE] font-bold mt-0.5">
                LEAD · SUPPORT · BUILD · BELONG
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded bg-[#2774AE]/15 text-[#2774AE] text-[11px] font-bold uppercase tracking-wider">
              Class of 2028 Leadership
            </span>
          </div>

          {/* Cabinet Grid (6 members) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ISSUE_1_CABINET.map((member, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-2 flex flex-col justify-between hover:border-[#F4B942] transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="font-editorial-serif font-bold text-[18px] text-[var(--text-primary)]">
                      {member.name} {member.flag && <span>{member.flag}</span>}
                    </h3>
                    {member.phone && (
                      <span className="text-[11px] text-[var(--text-muted)] font-mono flex items-center gap-1">
                        <Phone className="w-3 h-3 text-[#F4B942]" />
                        {member.phone}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] font-black uppercase tracking-[0.08em] text-[#2774AE] mb-2">
                    {member.role}
                  </div>
                  <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
                    {member.bio}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Announcements & Birthdays Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Announcements */}
            <div className="p-4 rounded-xl bg-[var(--bg-raised)] border border-[var(--border-color)] space-y-2">
              <div className="flex items-center gap-1.5 text-[12px] font-black uppercase tracking-wider text-[#2774AE]">
                <Sparkles className="w-3.5 h-3.5 text-[#F4B942]" />
                <span>ANNOUNCEMENTS</span>
              </div>
              <h4 className="font-bold text-[14px] text-[var(--text-primary)]">
                Recruiting events are now live in myCareer!
              </h4>
              <p className="text-[12.5px] text-[var(--text-secondary)] leading-relaxed">
                Sign up for company presentations, networking receptions, and coffee chats to learn
                more about companies, explore industries, and connect with recruiters and
                professionals.
              </p>
            </div>

            {/* Birthdays */}
            <div className="p-4 rounded-xl bg-[var(--bg-raised)] border border-[var(--border-color)] space-y-2">
              <div className="flex items-center gap-1.5 text-[12px] font-black uppercase tracking-wider text-[#2774AE]">
                <span>🎂</span>
                <span>BIRTHDAYS</span>
              </div>
              <p className="text-[13px] text-[var(--text-secondary)] italic">
                "Get list from Brin"
              </p>
              <p className="text-[11.5px] text-[var(--text-muted)]">
                Submissions and updates are compiled weekly by Brin (Inclusive Excellence).
              </p>
            </div>
          </div>

          {/* Footer of Page 2 */}
          <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-[var(--text-muted)] pt-3 border-t border-[var(--border-color)]">
            <span className="font-bold text-[#2774AE]">SECTION B | Go Bruins! 🐻</span>
            <span>UCLA ANDERSON | PAGE 2</span>
          </div>
        </div>
      )}

      {/* Modal Actions */}
      <div className="mt-6 pt-4 border-t border-[var(--border-color)] flex items-center justify-between flex-wrap gap-3">
        <span className="text-[12px] text-[var(--text-muted)]">
          Section B Cohort Archives · Class of 2028
        </span>
        <button
          onClick={onClose}
          className="px-5 py-2 rounded bg-[#2774AE] text-white text-[13px] font-semibold hover:bg-[#1e5c8a] transition-colors cursor-pointer"
        >
          Close Issue 1
        </button>
      </div>
    </div>
  );
};
