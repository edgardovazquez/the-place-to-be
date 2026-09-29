import React, { useState } from 'react';
import { TabId } from '../types';
import { PlaceholderChip } from './PlaceholderBadge';
import { Mail, Calendar, MapPin, DollarSign, Send, CheckCircle2, X } from 'lucide-react';

interface VoteSocialsTabProps {
  onNavigate: (tab: TabId) => void;
}

export const VoteSocialsTab: React.FC<VoteSocialsTabProps> = ({ onNavigate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [location, setLocation] = useState('');
  const [vibeCost, setVibeCost] = useState('');
  const [proposerName, setProposerName] = useState('');
  const [proposerEmail, setProposerEmail] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const generateMailtoUrl = () => {
    const subject = `[Section B Social Proposal] ${eventName || 'New Event Idea'}`;
    const body = `Hi Josh,

Here is a social event proposal for Section B (Class of 2028):

• Event Name / Concept: ${eventName}
• Proposed Date / Time: ${eventDate || 'TBD / Flexible'}
• Location / Venue: ${location || 'TBD'}
• Estimated Cost & Vibe: ${vibeCost || 'Casual'}
• Proposed by: ${proposerName} (${proposerEmail})

Details & Description:
${description || 'N/A'}

Looking forward to seeing this on the Section B calendar!

Best,
${proposerName}`;

    return `mailto:josh.dau.2028@anderson.ucla.edu?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleProposalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventName.trim() || !proposerName.trim() || !proposerEmail.trim()) return;

    setIsSubmitted(true);
    try {
      window.location.href = generateMailtoUrl();
    } catch {
      // User can click button in modal
    }
  };

  const handleResetModal = () => {
    setIsModalOpen(false);
    setIsSubmitted(false);
    setEventName('');
    setEventDate('');
    setLocation('');
    setVibeCost('');
    setProposerName('');
    setProposerEmail('');
    setDescription('');
  };

  return (
    <div className="w-full space-y-10 pb-16 font-editorial-sans">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#2774AE]/15 text-[#2774AE] text-[11px] font-bold uppercase tracking-wider mb-2">
          <span>Social Chair Contact: josh.dau.2028@anderson.ucla.edu</span>
        </div>
        <h1 className="font-editorial-serif font-bold text-[32px] sm:text-[40px] text-[var(--text-primary)] mb-2">
          Vote on Socials
        </h1>
        <p className="text-[15px] sm:text-[16px] text-[var(--text-secondary)] max-w-2xl">
          Your votes shape what Section B does next. Upvote anything you're in for. Propose something new directly to Josh Dau.
        </p>
      </div>

      {/* Social Co-Chair Routing Card */}
      <div className="p-4 sm:p-5 rounded-xl bg-[var(--bg-card)] border border-[#2774AE]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#2774AE]/15 text-[#2774AE] flex items-center justify-center font-bold text-[14px]">
            JD
          </div>
          <div>
            <h4 className="font-bold text-[15px] text-[var(--text-primary)]">
              Josh Dau · Co-Social Chair (Class of 2028)
            </h4>
            <p className="text-[13px] text-[var(--text-muted)]">
              Direct all social event pitches, venue ideas, and joint section mixers to{' '}
              <a
                href="mailto:josh.dau.2028@anderson.ucla.edu"
                className="text-[#2774AE] font-semibold hover:underline"
              >
                josh.dau.2028@anderson.ucla.edu
              </a>
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="editorial-btn px-4 py-2 rounded text-[13px] font-semibold bg-[#2774AE] text-white hover:bg-[#1e5c8a] transition-colors whitespace-nowrap self-start sm:self-center"
        >
          Propose an event to Josh →
        </button>
      </div>

      {/* Main Warm Placeholder Empty State */}
      <div className="max-w-2xl mx-auto rounded-2xl p-8 sm:p-14 border-[1.5px] border-dashed border-[#F4B942]/50 bg-[#F4B942]/[0.04] text-center flex flex-col items-center justify-center shadow-sm">
        {/* Large Emoji */}
        <div className="text-[64px] mb-4 select-none leading-none" aria-hidden="true">
          🗳️
        </div>

        {/* Headline */}
        <h2 className="font-editorial-serif font-bold text-[24px] sm:text-[28px] text-[var(--text-primary)] mb-3 leading-snug">
          No proposals yet — be the first.
        </h2>

        {/* Body Copy */}
        <p className="text-[15px] sm:text-[16px] text-[var(--text-secondary)] max-w-[480px] mx-auto leading-relaxed mb-6">
          Social events start with someone raising their hand. Submit an idea directly to Josh Dau, and once reviewed, it'll show up here for the section to upvote. The Fall
          Quarter Kickoff Social on September 19 is already locked in — what should Section B do next?
        </p>

        {/* CTA Button */}
        <button
          id="propose-social-event-btn"
          onClick={() => setIsModalOpen(true)}
          className="editorial-btn px-6 py-3 rounded-lg font-bold text-[14px] bg-[#F4B942] text-[#003B5C] hover:bg-[#FFD100] transition-colors shadow-md mb-6 cursor-pointer inline-flex items-center gap-2"
        >
          <span>Propose a social event</span>
          <span>→</span>
        </button>

        {/* Small Editorial Chip */}
        <PlaceholderChip label="Directly dispatched to Josh Dau (josh.dau.2028@anderson.ucla.edu)" />
      </div>

      {/* Confirmed Anchor Banners in Chronological Order */}
      <div className="max-w-2xl mx-auto space-y-3">
        <div className="rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] p-5 flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#2ED1BA]">
                Scheduled · Fri, Sep 18 · 7:00 PM
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#2ED1BA]/15 text-[#2ED1BA] border border-[#2ED1BA]/30">
                Section D Mixer
              </span>
            </div>
            <h4 className="font-bold text-[15px] text-[var(--text-primary)]">
              Disney Channel Pride Karaoke Night 🎤
            </h4>
            <p className="text-[12px] text-[var(--text-muted)]">
              Friday, September 18 · 7:00 PM at Pharaoh · Joint mixer with Section D
            </p>
          </div>
          <button
            onClick={() => onNavigate('this-week')}
            className="text-[12px] font-semibold text-[#2774AE] hover:underline whitespace-nowrap cursor-pointer"
          >
            View in newsletter →
          </button>
        </div>

        <div className="rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] p-5 flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#2ED1BA]">
                Locked In On Calendar · Sat, Sep 19
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#F4B942]/15 text-[#F4B942] border border-[#F4B942]/30">
                Full Class Mixer
              </span>
            </div>
            <h4 className="font-bold text-[15px] text-[var(--text-primary)]">
              Fall Quarter Kickoff Social @ All Season Brewing 🍺
            </h4>
            <p className="text-[12px] text-[var(--text-muted)]">
              Saturday, September 19 · 12:00 PM – 4:00 PM · All Season Brewing (Full Class Mixer)
            </p>
          </div>
          <button
            onClick={() => onNavigate('this-week')}
            className="text-[12px] font-semibold text-[#2774AE] hover:underline whitespace-nowrap cursor-pointer"
          >
            View in newsletter →
          </button>
        </div>

        <div className="rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] p-5 flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#2ED1BA]">
              Locked In On Calendar · Thu, Oct 1
            </span>
            <h4 className="font-bold text-[15px] text-[var(--text-primary)]">
              Who's Got The Tofu? 🐱🍸 @ Quinn's Place
            </h4>
            <p className="text-[12px] text-[var(--text-muted)]">
              Thursday, October 1 · Santa Monica, CA · Apt 314 (Visitor PIN: 122427)
            </p>
          </div>
          <button
            onClick={() => onNavigate('this-week')}
            className="text-[12px] font-semibold text-[#2774AE] hover:underline whitespace-nowrap cursor-pointer"
          >
            View in newsletter →
          </button>
        </div>
      </div>

      {/* PROPOSE SOCIAL EVENT MODAL */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
        >
          <div className="relative w-full max-w-lg rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl">
            <button
              onClick={handleResetModal}
              className="absolute top-4 right-4 p-2 rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-page)] transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {!isSubmitted ? (
              <form onSubmit={handleProposalSubmit} className="space-y-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#2774AE]/15 text-[#2774AE] text-[11px] font-bold uppercase tracking-wider mb-2">
                    <Mail className="w-3 h-3" />
                    <span>Recipient: josh.dau.2028@anderson.ucla.edu</span>
                  </div>
                  <h2 className="font-editorial-serif font-bold text-[24px] text-[var(--text-primary)]">
                    Propose a Section B Social
                  </h2>
                  <p className="text-[13px] text-[var(--text-secondary)]">
                    Pitch your idea to Josh Dau (Co-Social Chair). Approved ideas get featured in the newsletter and section voting poll.
                  </p>
                </div>

                {/* Event Name */}
                <div>
                  <label className="block text-[13px] font-bold text-[var(--text-primary)] mb-1">
                    Event Idea / Concept <span className="text-[#FF7083]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    placeholder="e.g., Beach Bonfire at Dockweiler, Trivia Night, Topgolf"
                    className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-page)] text-[14px] text-[var(--text-primary)] focus:outline-none focus:border-[#2774AE]"
                  />
                </div>

                {/* Date & Location Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[12px] font-bold text-[var(--text-secondary)] mb-1 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#F4B942]" />
                      Suggested Date/Time
                    </label>
                    <input
                      type="text"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      placeholder="e.g., Mid-October Saturday"
                      className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-page)] text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-[#2774AE]"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-bold text-[var(--text-secondary)] mb-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#2ED1BA]" />
                      Location / Neighborhood
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g., Santa Monica / Culver City"
                      className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-page)] text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-[#2774AE]"
                    />
                  </div>
                </div>

                {/* Cost / Vibe */}
                <div>
                  <label className="block text-[12px] font-bold text-[var(--text-secondary)] mb-1 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-[#F4B942]" />
                    Estimated Cost & Vibe
                  </label>
                  <input
                    type="text"
                    value={vibeCost}
                    onChange={(e) => setVibeCost(e.target.value)}
                    placeholder="e.g., Free / Low Cost / Partners & +1s welcome"
                    className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-page)] text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-[#2774AE]"
                  />
                </div>

                {/* Details */}
                <div>
                  <label className="block text-[12px] font-bold text-[var(--text-secondary)] mb-1">
                    Description & Why Section B would love it
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Give Josh context on how you envision the event working..."
                    className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-page)] text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-[#2774AE]"
                  />
                </div>

                {/* Proposer Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[var(--border-color)]">
                  <div>
                    <label className="block text-[12px] font-bold text-[var(--text-primary)] mb-1">
                      Your Name <span className="text-[#FF7083]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={proposerName}
                      onChange={(e) => setProposerName(e.target.value)}
                      placeholder="Your Full Name"
                      className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-page)] text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-[#2774AE]"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-[var(--text-primary)] mb-1">
                      UCLA Email <span className="text-[#FF7083]">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={proposerEmail}
                      onChange={(e) => setProposerEmail(e.target.value)}
                      placeholder="name@anderson.ucla.edu"
                      className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-page)] text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-[#2774AE]"
                    />
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleResetModal}
                    className="px-4 py-2 rounded text-[13px] font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="editorial-btn px-5 py-2.5 rounded-lg text-[13px] font-bold bg-[#2774AE] text-white hover:bg-[#1e5c8a] transition-colors shadow-sm inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Proposal to Josh Dau →</span>
                  </button>
                </div>
              </form>
            ) : (
              /* Confirmation Screen */
              <div className="text-center py-6 space-y-4">
                <div className="w-14 h-14 rounded-full bg-[#2ED1BA]/15 text-[#2ED1BA] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-editorial-serif font-bold text-[22px] text-[var(--text-primary)]">
                  Proposal Recorded!
                </h3>
                <div className="p-3 rounded-xl bg-[#2774AE]/10 border border-[#2774AE]/30 max-w-sm mx-auto text-left text-[12px] text-[var(--text-secondary)] space-y-1">
                  <div className="text-[#2774AE] font-bold uppercase tracking-wider text-[11px]">
                    📬 Routed to Co-Social Chair
                  </div>
                  <p>
                    Sent to <strong>josh.dau.2028@anderson.ucla.edu</strong> for Section B programming review.
                  </p>
                </div>
                <p className="text-[14px] text-[var(--text-secondary)] max-w-sm mx-auto">
                  Josh will review the idea and reach out to help organize or put it up for a section vote!
                </p>
                <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
                  <a
                    href={generateMailtoUrl()}
                    className="editorial-btn px-5 py-2.5 rounded text-[13px] font-bold bg-[#F4B942] text-[#003B5C] hover:bg-[#FFD100] transition-colors shadow-sm inline-flex items-center gap-1.5"
                  >
                    <span>Send copy via email app →</span>
                  </a>
                  <button
                    onClick={handleResetModal}
                    className="editorial-btn px-4 py-2.5 rounded text-[13px] font-semibold border border-[var(--border-color)] text-[var(--text-primary)] hover:border-[#F4B942] transition-colors cursor-pointer"
                  >
                    Done
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
