import React, { useState, useMemo } from 'react';
import { ARCHIVE_ISSUES } from '../data';
import { ArchiveIssue, TabId } from '../types';
import { Search, LayoutGrid, List, Clock, ArrowRight, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { Issue1Viewer } from './Issue1Viewer';

interface ArchiveTabProps {
  onNavigate: (tab: TabId) => void;
}

const FILTER_TAGS = ['All', 'Career', 'Events', 'Community', 'Deadlines', 'Social'];

export const ArchiveTab: React.FC<ArchiveTabProps> = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedIssueModal, setSelectedIssueModal] = useState<ArchiveIssue | null>(null);

  const filteredIssues = useMemo(() => {
    return ARCHIVE_ISSUES.filter((issue) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.themeDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
        issue.highlights.some((h) => h.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesTag =
        selectedTag === 'All' ||
        issue.tags.some((t) => t.toLowerCase() === selectedTag.toLowerCase());

      return matchesSearch && matchesTag;
    });
  }, [searchQuery, selectedTag]);

  return (
    <div className="w-full space-y-10 pb-16">
      {/* Header */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
          <h1 className="font-editorial-serif font-bold text-[32px] sm:text-[40px] text-[var(--text-primary)]">
            Past Issues
          </h1>
          <span className="px-3 py-1 rounded-full bg-[#F4B942]/15 text-[#F4B942] border border-[#F4B942]/30 font-bold text-[11px] tracking-[0.08em] uppercase">
            02 Issues Published
          </span>
        </div>
        <p className="text-[15px] sm:text-[16px] text-[var(--text-secondary)]">
          Every issue, every moment. The cohort's memory since 2026.
        </p>
      </div>

      {/* Archive Toolbar */}
      <div className="rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] p-4 sm:p-5 space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              id="archive-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search issues, topics, events..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[var(--bg-page)] border border-[var(--border-color)] text-[14px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[#2774AE] focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Grid / List View Toggle */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            <span className="text-[12px] uppercase tracking-wider font-bold text-[var(--text-muted)] mr-1">
              View:
            </span>
            <button
              id="archive-view-grid-btn"
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
              className={`p-2 rounded border transition-colors ${
                viewMode === 'grid'
                  ? 'bg-[#2774AE] text-white border-[#2774AE]'
                  : 'bg-[var(--bg-page)] border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              id="archive-view-list-btn"
              onClick={() => setViewMode('list')}
              aria-label="List view"
              className={`p-2 rounded border transition-colors ${
                viewMode === 'list'
                  ? 'bg-[#2774AE] text-white border-[#2774AE]'
                  : 'bg-[var(--bg-page)] border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-2 border-t border-[var(--border-color)]">
          <span className="text-[11px] uppercase tracking-wider font-bold text-[var(--text-muted)] mr-2 flex-shrink-0">
            Filter:
          </span>
          {FILTER_TAGS.map((tag) => {
            const isSelected = selectedTag === tag;
            return (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-3 py-1 rounded-full text-[12px] font-semibold tracking-wide whitespace-nowrap transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#F4B942] text-[#003B5C]'
                    : 'bg-[var(--bg-page)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:border-[#F4B942]'
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* Archive Items Grid/List */}
      {filteredIssues.length === 0 ? (
        <div className="rounded-xl p-12 text-center border border-[var(--border-color)] bg-[var(--bg-card)]">
          <p className="text-[16px] text-[var(--text-primary)] font-medium mb-2">
            No issues match that search.
          </p>
          <p className="text-[14px] text-[var(--text-muted)] mb-4">
            Try 'Career' or 'Events' — or browse all issues below.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedTag('All');
            }}
            className="px-4 py-2 rounded text-[13px] font-semibold bg-[#2774AE] text-white hover:bg-[#1e5c8a] transition-colors"
          >
            Reset filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIssues.map((issue) => (
            <article
              key={issue.id}
              className="editorial-card rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] p-6 flex flex-col justify-between shadow-sm relative group"
            >
              <div>
                {/* Header Row: Chip & Date */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="inline-block px-2.5 py-0.5 rounded bg-[#F4B942] text-[#003B5C] font-bold text-[11px] tracking-wider transform rotate-[1.5deg] shadow-sm">
                    {issue.number}
                  </span>

                  {issue.isCurrent ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-[0.08em] bg-[#2ED1BA]/15 text-[#2ED1BA] border border-[#2ED1BA]/40">
                      CURRENT ISSUE
                    </span>
                  ) : (
                    <span className="text-[12px] font-medium text-[var(--text-muted)]">
                      {issue.dateRange}
                    </span>
                  )}
                </div>

                {issue.isCurrent && (
                  <p className="text-[12px] font-medium text-[var(--text-muted)] mb-2">
                    {issue.dateRange}
                  </p>
                )}

                {/* Title */}
                <h3 className="font-editorial-serif font-bold text-[20px] text-[var(--text-primary)] mb-3 leading-snug group-hover:text-[#F4B942] transition-colors">
                  {issue.title}
                </h3>

                {/* Description */}
                <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed mb-5">
                  {issue.themeDescription}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {issue.tags.map((tag, tIdx) => (
                    <span
                      key={tIdx}
                      className="px-2 py-0.5 rounded bg-[var(--bg-page)] text-[var(--text-muted)] border border-[var(--border-color)] text-[11px]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Footer */}
              <div className="pt-4 border-t border-[var(--border-color)] flex items-center justify-between">
                <span className="text-[12px] text-[var(--text-muted)] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {issue.readTime}
                </span>

                <button
                  id={`open-issue-btn-${issue.id}`}
                  onClick={() => {
                    if (issue.isCurrent) {
                      onNavigate('this-week');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    } else {
                      setSelectedIssueModal(issue);
                    }
                  }}
                  className="text-[13px] font-semibold text-[#2774AE] group-hover:text-[#F4B942] transition-colors inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>{issue.isCurrent ? 'View Current Issue' : 'Open issue'}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] divide-y divide-[var(--border-color)] overflow-hidden shadow-sm">
          {filteredIssues.map((issue) => (
            <div
              key={issue.id}
              className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[var(--bg-raised)]/30 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                  <span className="px-2 py-0.5 rounded bg-[#F4B942] text-[#003B5C] font-bold text-[10px] transform rotate-[1.5deg]">
                    {issue.number}
                  </span>
                  <span className="text-[12px] font-medium text-[var(--text-muted)]">
                    {issue.dateRange}
                  </span>
                  {issue.isCurrent && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#2ED1BA]/15 text-[#2ED1BA] border border-[#2ED1BA]/40">
                      CURRENT ISSUE
                    </span>
                  )}
                </div>

                <h3 className="font-editorial-serif font-bold text-[18px] text-[var(--text-primary)] mb-1">
                  {issue.title}
                </h3>
                <p className="text-[14px] text-[var(--text-secondary)] line-clamp-1">
                  {issue.themeDescription}
                </p>
              </div>

              <div className="flex items-center gap-4 sm:flex-shrink-0">
                <span className="text-[12px] text-[var(--text-muted)] hidden md:flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {issue.readTime}
                </span>

                <button
                  onClick={() => {
                    if (issue.isCurrent) {
                      onNavigate('this-week');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    } else {
                      setSelectedIssueModal(issue);
                    }
                  }}
                  className="editorial-btn px-4 py-2 rounded text-[13px] font-semibold bg-[var(--bg-page)] border border-[var(--border-color)] text-[#2774AE] hover:border-[#F4B942] hover:text-[#F4B942] transition-colors inline-flex items-center gap-1"
                >
                  <span>{issue.isCurrent ? 'View Current Issue' : 'Read issue'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Issue Preview / Authentic Viewer */}
      {selectedIssueModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
        >
          <div className="relative w-full max-w-3xl rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] p-5 sm:p-7 max-h-[92vh] overflow-y-auto shadow-2xl">
            <button
              onClick={() => setSelectedIssueModal(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-page)] transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {selectedIssueModal.id === 'issue-01' ? (
              <Issue1Viewer onClose={() => setSelectedIssueModal(null)} />
            ) : (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2.5 py-0.5 rounded bg-[#F4B942] text-[#003B5C] font-bold text-[11px] transform rotate-[1.5deg]">
                    {selectedIssueModal.number}
                  </span>
                  <span className="text-[12px] uppercase tracking-wider text-[var(--text-muted)] font-semibold">
                    {selectedIssueModal.volume} · {selectedIssueModal.dateRange}
                  </span>
                </div>

                <h2 className="font-editorial-serif font-bold text-[26px] sm:text-[30px] text-[var(--text-primary)] mb-3">
                  {selectedIssueModal.title}
                </h2>

                <p className="text-[15px] text-[var(--text-secondary)] italic font-editorial-serif mb-6 leading-relaxed">
                  "{selectedIssueModal.themeDescription}"
                </p>

                <div className="mb-6 p-4 rounded-xl bg-[var(--bg-raised)] border border-[var(--border-color)]">
                  <h4 className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#2774AE] mb-3 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#F4B942]" />
                    Issue Highlights & Archival Record
                  </h4>
                  <ul className="space-y-2 text-[14px] text-[var(--text-primary)]">
                    {selectedIssueModal.highlights.map((hl, hIdx) => (
                      <li key={hIdx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#2ED1BA] flex-shrink-0 mt-0.5" />
                        <span>{hl}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[var(--border-color)]">
                  <span className="text-[12px] text-[var(--text-muted)]">
                    Class of 2028 Cohort Archive
                  </span>
                  <button
                    onClick={() => setSelectedIssueModal(null)}
                    className="px-4 py-2 rounded bg-[#2774AE] text-white text-[13px] font-semibold hover:bg-[#1e5c8a] transition-colors cursor-pointer"
                  >
                    Close preview
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
