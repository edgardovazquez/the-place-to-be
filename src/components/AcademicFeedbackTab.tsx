import React, { useState } from 'react';
import { AcademicFeedbackSubmission } from '../types';
import { PlaceholderChip } from './PlaceholderBadge';
import { CheckCircle2, ShieldCheck, MessageSquare } from 'lucide-react';

interface AcademicFeedbackTabProps {
  onFeedbackSubmitted?: (feedback: AcademicFeedbackSubmission) => void;
}

const COURSES = [
  'MGMTFT 420: Business Strategy',
  'MGMTFT 405: Managerial Economics',
  'MGMTFT 402: Data and Decisions',
  'General Section Feedback',
  'Other',
];

export const AcademicFeedbackTab: React.FC<AcademicFeedbackTabProps> = ({
  onFeedbackSubmitted,
}) => {
  const [course, setCourse] = useState(COURSES[0]);
  const [feedbackType, setFeedbackType] = useState<AcademicFeedbackSubmission['feedbackType']>('working_well');
  const [details, setDetails] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [touched, setTouched] = useState(false);
  const [lastSubmission, setLastSubmission] = useState<AcademicFeedbackSubmission | null>(null);

  const isDetailsValid = details.trim().length > 5 && details.length <= 500;

  const generateFeedbackMailto = (sub: AcademicFeedbackSubmission) => {
    const feedbackTypeLabel =
      sub.feedbackType === 'working_well'
        ? "What's working well"
        : sub.feedbackType === 'needs_improvement'
        ? 'What needs improvement'
        : sub.feedbackType === 'specific_request'
        ? 'A specific request'
        : 'General comment';

    const subject = `[Section B Academic Feedback] ${sub.course} — ${feedbackTypeLabel}`;
    const body = `Hi Edgardo,

Here is academic feedback for Section B:

• Course: ${sub.course}
• Type: ${feedbackTypeLabel}
• Privacy: ${sub.isAnonymous ? 'Anonymous' : 'Identified'}

Feedback Details:
${sub.details}

Submitted via Section B Hub.`;
    return `mailto:edgardovazquez@g.ucla.edu?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);

    if (!isDetailsValid) return;

    const submission: AcademicFeedbackSubmission = {
      id: `fb-${Date.now()}`,
      course,
      feedbackType,
      details,
      isAnonymous,
      submittedAt: new Date().toISOString(),
    };

    if (onFeedbackSubmitted) {
      onFeedbackSubmitted(submission);
    }

    setLastSubmission(submission);
    setIsSubmitted(true);

    try {
      window.location.href = generateFeedbackMailto(submission);
    } catch {
      // user can use explicit button
    }
  };

  const handleReset = () => {
    setDetails('');
    setFeedbackType('working_well');
    setIsAnonymous(true);
    setTouched(false);
    setIsSubmitted(false);
    setLastSubmission(null);
  };

  return (
    <div className="w-full space-y-10 pb-16">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#2774AE]/15 text-[#2774AE] text-[11px] font-bold uppercase tracking-wider mb-2">
          <span>Routing: edgardovazquez@g.ucla.edu</span>
        </div>
        <h1 className="font-editorial-serif font-bold text-[32px] sm:text-[40px] text-[var(--text-primary)] mb-2">
          Academic Feedback
        </h1>
        <p className="text-[15px] sm:text-[16px] text-[var(--text-secondary)]">
          Share what's working and what needs attention. This goes directly to Edgardo Vazquez (edgardovazquez@g.ucla.edu) &amp; Section B leadership —
          not to faculty or administration.
        </p>
      </div>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Feedback Form */}
        <div className="lg:col-span-7">
          <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] p-6 sm:p-8 shadow-sm">
            {isSubmitted ? (
              <div className="text-center py-8 space-y-4 animate-fade-in">
                <div className="w-14 h-14 rounded-full bg-[#2ED1BA]/15 text-[#2ED1BA] flex items-center justify-center mx-auto border border-[#2ED1BA]/40">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-editorial-serif font-bold text-[22px] text-[var(--text-primary)]">
                  Feedback received.
                </h3>
                <div className="p-3.5 rounded-xl bg-[#2774AE]/10 border border-[#2774AE]/30 max-w-md mx-auto text-left text-[12px] text-[var(--text-secondary)] space-y-1">
                  <div className="flex items-center gap-1.5 text-[#2774AE] font-bold uppercase tracking-wider text-[11px]">
                    <span>📬 Routed to Leadership</span>
                  </div>
                  <p>
                    Sent to <strong>edgardovazquez@g.ucla.edu</strong> for Section B academic review.
                  </p>
                </div>
                <p className="text-[14px] text-[var(--text-secondary)] max-w-md mx-auto leading-relaxed">
                  We review all submissions before each issue and surface themes to the section. Thank
                  you for helping Section B stay ahead.
                </p>
                <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
                  {lastSubmission && (
                    <a
                      href={generateFeedbackMailto(lastSubmission)}
                      className="editorial-btn px-5 py-2.5 rounded text-[13px] font-bold bg-[#F4B942] text-[#003B5C] hover:bg-[#FFD100] transition-colors shadow-sm inline-flex items-center gap-1.5"
                    >
                      <span>Send copy to Edgardo via email app →</span>
                    </a>
                  )}
                  <button
                    onClick={handleReset}
                    className="editorial-btn px-5 py-2.5 rounded text-[13px] font-semibold border border-[var(--border-color)] text-[var(--text-primary)] hover:border-[#F4B942] transition-colors cursor-pointer"
                  >
                    Share more feedback
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h3 className="text-[14px] font-bold uppercase tracking-[0.1em] text-[#2774AE] mb-1">
                    Direct Leadership Channel (edgardovazquez@g.ucla.edu)
                  </h3>
                  <p className="text-[13px] text-[var(--text-muted)]">
                    All inputs are routed directly to Edgardo Vazquez and reviewed during weekly Section B cabinet meetings.
                  </p>
                </div>

                {/* Course Selector Dropdown */}
                <div>
                  <label
                    htmlFor="course-select"
                    className="block text-[12px] font-bold uppercase tracking-[0.08em] text-[var(--text-secondary)] mb-1.5"
                  >
                    Course selector
                  </label>
                  <select
                    id="course-select"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-[var(--bg-page)] border border-[var(--border-color)] text-[14px] text-[var(--text-primary)] focus:border-[#2774AE] focus:outline-none"
                  >
                    {COURSES.map((c) => (
                      <option key={c} value={c} className="bg-[var(--bg-card)] text-[var(--text-primary)]">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Feedback Type Radio */}
                <div>
                  <span className="block text-[12px] font-bold uppercase tracking-[0.08em] text-[var(--text-secondary)] mb-2">
                    Feedback type
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <label className="flex items-center gap-2.5 p-2.5 rounded-lg bg-[var(--bg-page)] border border-[var(--border-color)] cursor-pointer hover:border-[#F4B942]/50 transition-colors">
                      <input
                        type="radio"
                        name="feedback-type"
                        value="working_well"
                        checked={feedbackType === 'working_well'}
                        onChange={() => setFeedbackType('working_well')}
                        className="text-[#2774AE]"
                      />
                      <span className="text-[13px] text-[var(--text-primary)]">
                        What's working well
                      </span>
                    </label>

                    <label className="flex items-center gap-2.5 p-2.5 rounded-lg bg-[var(--bg-page)] border border-[var(--border-color)] cursor-pointer hover:border-[#F4B942]/50 transition-colors">
                      <input
                        type="radio"
                        name="feedback-type"
                        value="needs_improvement"
                        checked={feedbackType === 'needs_improvement'}
                        onChange={() => setFeedbackType('needs_improvement')}
                        className="text-[#2774AE]"
                      />
                      <span className="text-[13px] text-[var(--text-primary)]">
                        What needs improvement
                      </span>
                    </label>

                    <label className="flex items-center gap-2.5 p-2.5 rounded-lg bg-[var(--bg-page)] border border-[var(--border-color)] cursor-pointer hover:border-[#F4B942]/50 transition-colors">
                      <input
                        type="radio"
                        name="feedback-type"
                        value="specific_request"
                        checked={feedbackType === 'specific_request'}
                        onChange={() => setFeedbackType('specific_request')}
                        className="text-[#2774AE]"
                      />
                      <span className="text-[13px] text-[var(--text-primary)]">
                        A specific request
                      </span>
                    </label>

                    <label className="flex items-center gap-2.5 p-2.5 rounded-lg bg-[var(--bg-page)] border border-[var(--border-color)] cursor-pointer hover:border-[#F4B942]/50 transition-colors">
                      <input
                        type="radio"
                        name="feedback-type"
                        value="general_comment"
                        checked={feedbackType === 'general_comment'}
                        onChange={() => setFeedbackType('general_comment')}
                        className="text-[#2774AE]"
                      />
                      <span className="text-[13px] text-[var(--text-primary)]">
                        General comment
                      </span>
                    </label>
                  </div>
                </div>

                {/* Textarea */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="feedback-textarea"
                      className="text-[12px] font-bold uppercase tracking-[0.08em] text-[var(--text-secondary)]"
                    >
                      Feedback textarea*
                    </label>
                    <span
                      className={`text-[11px] font-mono ${
                        details.length > 500 ? 'text-[#FF7083] font-bold' : 'text-[var(--text-muted)]'
                      }`}
                    >
                      {details.length} / 500
                    </span>
                  </div>
                  <textarea
                    id="feedback-textarea"
                    rows={4}
                    maxLength={500}
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Be specific. The more detail you give, the more actionable it is for leadership."
                    className={`w-full px-4 py-2.5 rounded-lg bg-[var(--bg-page)] border text-[14px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none transition-colors ${
                      touched && !isDetailsValid
                        ? 'border-[#FF7083]'
                        : 'border-[var(--border-color)] focus:border-[#2774AE]'
                    }`}
                  />
                  {touched && !isDetailsValid && (
                    <p className="text-[11px] text-[#FF7083] mt-1">
                      Please enter your feedback (at least 5 characters).
                    </p>
                  )}
                </div>

                {/* Anonymous Toggle (on by default) */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-page)] border border-[var(--border-color)]">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-[#2ED1BA]" />
                    <span className="text-[13px] font-medium text-[var(--text-primary)]">
                      Submit anonymously
                    </span>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isAnonymous}
                    onClick={() => setIsAnonymous(!isAnonymous)}
                    className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                      isAnonymous ? 'bg-[#2774AE]' : 'bg-[var(--border-color)]'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        isAnonymous ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Submit Button: "Share feedback →" UCLA Blue fill, white text */}
                <button
                  id="academic-feedback-submit-btn"
                  type="submit"
                  disabled={!isDetailsValid}
                  className={`editorial-btn w-full py-3 px-6 rounded-lg font-bold text-[14px] transition-all ${
                    isDetailsValid
                      ? 'bg-[#2774AE] text-white hover:bg-[#1e5c8a] shadow-md cursor-pointer'
                      : 'bg-[var(--bg-raised)] text-[var(--text-muted)] cursor-not-allowed border border-[var(--border-color)]'
                  }`}
                >
                  Share feedback →
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Right Column: Themes Panel */}
        <div className="lg:col-span-5">
          <div className="rounded-2xl bg-[var(--bg-raised)] border border-[var(--border-color)] p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[16px] text-[var(--text-primary)] flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#F4B942]" />
                What Section B is saying
              </h3>
              <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                Issue 02
              </span>
            </div>

            {/* Placeholder state for Issue 02 */}
            <div className="rounded-xl p-8 border-[1.5px] border-dashed border-[#F4B942]/50 bg-[#F4B942]/[0.04] text-center flex flex-col items-center justify-center">
              <div className="text-[48px] mb-3 select-none" aria-hidden="true">
                💬
              </div>

              <h4 className="font-bold text-[16px] text-[var(--text-primary)] mb-2">
                Feedback themes will appear here.
              </h4>

              <p className="text-[14px] italic text-[var(--text-muted)] leading-relaxed mb-5 max-w-xs font-editorial-sans">
                As classmates submit academic feedback, leadership will surface key themes in this
                panel each issue. Your voice shapes how Section B advocates for itself.
              </p>

              <PlaceholderChip label="Populate with feedback themes after first submissions come in" />
            </div>

            <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[12px] text-[var(--text-secondary)] leading-relaxed">
              <span className="font-bold text-[#2774AE] uppercase tracking-wider block mb-1">
                How Academic Reps Use This
              </span>
              Submissions are aggregated by reps to address pacing, grading transparency, case
              prep resources, and team dynamics directly with professors.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
