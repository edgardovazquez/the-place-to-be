import React, { useState } from 'react';
import { SubmissionType, SubmissionPriority, UserSubmission, TabId } from '../types';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface SubmitTabProps {
  onNavigate: (tab: TabId) => void;
  onSubmissionSuccess: (submission: UserSubmission) => void;
  defaultType?: SubmissionType;
}

const SUBMISSION_TYPES: SubmissionType[] = [
  'Event',
  'Deadline',
  'Career Opportunity',
  'Shoutout',
  'Recap/Photo',
  'Club News',
  'Birthday',
  'Resource',
  'Other',
];

const LOOKING_FOR_CHIPS = [
  'Events',
  'Deadlines',
  'Career Opps',
  'Shoutouts',
  'Recaps',
  'Club News',
  'Birthdays',
  'Resources',
];

export const SubmitTab: React.FC<SubmitTabProps> = ({
  onNavigate,
  onSubmissionSuccess,
  defaultType = 'Event',
}) => {
  const [fullName, setFullName] = useState('');
  const [uclaEmail, setUclaEmail] = useState('');
  const [type, setType] = useState<SubmissionType>(defaultType);
  const [headline, setHeadline] = useState('');
  const [details, setDetails] = useState('');
  const [dateOrDeadline, setDateOrDeadline] = useState('');
  const [linkOrUrl, setLinkOrUrl] = useState('');
  const [nominee, setNominee] = useState('');
  const [priority, setPriority] = useState<SubmissionPriority>('standard');
  const [consent, setConsent] = useState(false);

  // Interaction / Validation states
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<UserSubmission | null>(null);
  const [formErrorBanner, setFormErrorBanner] = useState<string | null>(null);

  // Email validation rule
  const isEmailValid =
    uclaEmail.trim() !== '' &&
    (uclaEmail.toLowerCase().endsWith('@anderson.ucla.edu') ||
      uclaEmail.toLowerCase().endsWith('@ucla.edu'));

  const isFullNameValid = fullName.trim().length > 1;
  const isHeadlineValid = headline.trim().length > 0 && headline.length <= 60;
  const isDetailsValid = details.trim().length > 0 && details.length <= 350;
  const isConsentValid = consent === true;
  const isNomineeValid = type !== 'Shoutout' || nominee.trim().length > 0;

  const isFormValid =
    isFullNameValid && isEmailValid && isHeadlineValid && isDetailsValid && isConsentValid && isNomineeValid;

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      fullName: true,
      uclaEmail: true,
      headline: true,
      details: true,
      consent: true,
      nominee: true,
    });

    if (!isFormValid) {
      setFormErrorBanner('Something didn’t go through. Check the fields above and try again.');
      return;
    }

    setFormErrorBanner(null);
    setIsSubmitting(true);

    const submission: UserSubmission = {
      id: `sub-${Date.now()}`,
      fullName,
      uclaEmail,
      type,
      headline,
      details,
      dateOrDeadline: dateOrDeadline || undefined,
      linkOrUrl: linkOrUrl || undefined,
      nominee: type === 'Shoutout' ? nominee : undefined,
      priority,
      consent,
      submittedAt: new Date().toISOString(),
    };

    // Simulate polite network transmission
    setTimeout(() => {
      onSubmissionSuccess(submission);
      setSubmittedData(submission);
      setIsSubmitting(false);

      // Attempt to launch default mail client with prefilled submission to edgardovazquez@ucla.edu
      try {
        const mailtoUrl = generateSubmitMailto(submission);
        window.location.href = mailtoUrl;
      } catch {
        // user can still use manual button in success screen
      }
    }, 600);
  };

  const generateSubmitMailto = (sub: UserSubmission) => {
    const isEvent = sub.type === 'Event';
    const subject = `[Section B Newsletter] ${sub.type}: ${sub.headline}`;
    const body = `Hi ${isEvent ? 'Edgardo and Josh' : 'Edgardo'},

Here is a submission for "The Place to B" Section B Newsletter (Class of 2028):

• Type: ${sub.type}
• Headline: ${sub.headline}
• Submitter: ${sub.fullName} (${sub.uclaEmail})
• Priority: ${sub.priority.toUpperCase()}
${sub.nominee ? `• Nominee: ${sub.nominee}\n` : ''}${sub.dateOrDeadline ? `• Date / Deadline: ${sub.dateOrDeadline}\n` : ''}${sub.linkOrUrl ? `• Link: ${sub.linkOrUrl}\n` : ''}
Details:
${sub.details}

Best,
${sub.fullName}`;

    if (isEvent) {
      return `mailto:edgardovazquez@g.ucla.edu?cc=josh.dau.2028@anderson.ucla.edu&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }
    return `mailto:edgardovazquez@g.ucla.edu?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleReset = () => {
    setFullName('');
    setUclaEmail('');
    setType('Event');
    setHeadline('');
    setDetails('');
    setDateOrDeadline('');
    setLinkOrUrl('');
    setNominee('');
    setPriority('standard');
    setConsent(false);
    setTouched({});
    setSubmittedData(null);
    setFormErrorBanner(null);
  };

  const firstName = fullName.trim().split(' ')[0] || 'there';

  return (
    <div className="w-full pb-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* LEFT COLUMN: Pitch Guide */}
        <div className="lg:col-span-5 space-y-8">
          <div>
            <h1 className="font-editorial-serif font-bold text-[36px] sm:text-[42px] text-[var(--text-primary)] mb-3 leading-tight">
              Got something for B?
            </h1>
            <p className="text-[16px] text-[var(--text-secondary)] leading-relaxed">
              Every spotlight, event, deadline, and shoutout in this newsletter came from a
              classmate. Here's how to add yours to Issue 03.
            </p>
          </div>

          {/* What we're looking for chips */}
          <div>
            <h3 className="text-[12px] font-bold uppercase tracking-[0.1em] text-[#2774AE] mb-3">
              What we're looking for
            </h3>
            <div className="flex flex-wrap gap-2">
              {LOOKING_FOR_CHIPS.map((chip, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-full text-[12px] font-semibold bg-[var(--bg-raised)] text-[var(--text-primary)] border border-[var(--border-color)]"
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>

          {/* Three editorial rules */}
          <div className="space-y-4">
            <h3 className="text-[12px] font-bold uppercase tracking-[0.1em] text-[#2774AE]">
              Three Editorial Rules
            </h3>

            <div className="space-y-3 text-[14px] text-[var(--text-secondary)]">
              <div className="flex items-start gap-3 p-3.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)]">
                <span className="text-[#F4B942] font-bold text-[16px] leading-none">1.</span>
                <p>Keep it specific. A date, a link, and a reason to care.</p>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)]">
                <span className="text-[#F4B942] font-bold text-[16px] leading-none">2.</span>
                <p>One submission per event. We handle the copy.</p>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)]">
                <span className="text-[#F4B942] font-bold text-[16px] leading-none">3.</span>
                <p>
                  <strong className="text-[var(--text-primary)]">Issue 03 deadline:</strong> September
                  30 at 11:59 PM.
                </p>
              </div>
            </div>
          </div>

          {/* Editor Note Card */}
          <div className="p-5 rounded-xl bg-[#0F2344]/70 backdrop-blur-[18px] border border-[var(--border-color)] text-[13px] text-[var(--text-muted)] italic leading-relaxed">
            <p>
              "We read every submission. If we can't include it this issue, we carry it to the next."
            </p>
            <p className="not-italic text-[12px] font-semibold text-[#2774AE] mt-2">
              — Section B Leadership
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Form Card or Success State */}
        <div className="lg:col-span-7">
          <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] p-6 sm:p-10 shadow-lg relative">
            {submittedData ? (
              /* SUCCESS STATE */
              <div className="text-center py-8 space-y-6">
                <div className="w-16 h-16 rounded-full bg-[#2ED1BA]/15 text-[#2ED1BA] flex items-center justify-center mx-auto mb-2 border border-[#2ED1BA]/30">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <h2 className="font-editorial-serif font-bold text-[28px] sm:text-[32px] text-[var(--text-primary)]">
                  Received, {firstName}.
                </h2>

                <div className="max-w-md mx-auto p-4 rounded-xl bg-[var(--bg-raised)] border border-[var(--border-color)] text-left text-[14px] space-y-2">
                  <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-bold">
                    <span>{submittedData.type}</span>
                    <span className="text-[#2ED1BA]">Confirmed</span>
                  </div>
                  <p className="font-semibold text-[var(--text-primary)] text-[15px]">
                    "{submittedData.headline}"
                  </p>
                  <p className="text-[13px] text-[var(--text-secondary)] line-clamp-2">
                    {submittedData.details}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#2774AE]/10 border border-[#2774AE]/30 max-w-md mx-auto text-left text-[12px] text-[var(--text-secondary)] space-y-1">
                  <div className="flex items-center gap-1.5 text-[#2774AE] font-bold uppercase tracking-wider text-[11px]">
                    <span>📬 Direct Request Route</span>
                  </div>
                  <p>
                    Sent to <strong>edgardovazquez@g.ucla.edu</strong> and queued for Section B Leadership review.
                  </p>
                </div>

                <p className="text-[15px] text-[var(--text-secondary)] max-w-md mx-auto leading-relaxed">
                  We'll review and include it in Issue 03 if it meets our criteria. You'll see it live
                  on October 1.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                  <a
                    href={generateSubmitMailto(submittedData)}
                    className="editorial-btn px-5 py-2.5 rounded text-[13px] font-bold bg-[#F4B942] text-[#003B5C] hover:bg-[#FFD100] transition-colors shadow-sm inline-flex items-center gap-1.5"
                  >
                    <span>Send via email app to Edgardo →</span>
                  </a>
                  <button
                    onClick={handleReset}
                    className="editorial-btn px-5 py-2.5 rounded text-[13px] font-semibold border border-[var(--border-color)] text-[var(--text-primary)] hover:border-[#F4B942] transition-colors"
                  >
                    Submit another
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('this-week');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="editorial-btn px-5 py-2.5 rounded text-[13px] font-semibold bg-[#2774AE] text-white hover:bg-[#1e5c8a] transition-colors"
                  >
                    Read latest issue
                  </button>
                </div>
              </div>
            ) : (
              /* FORM STATE */
              <form onSubmit={handleSubmit} noValidate className="space-y-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#2774AE]/15 text-[#2774AE] text-[11px] font-bold uppercase tracking-wider mb-2">
                    <span>Direct recipient: edgardovazquez@g.ucla.edu</span>
                  </div>
                  <h2 className="font-editorial-serif font-bold text-[24px] text-[var(--text-primary)]">
                    Submit to The Place to B
                  </h2>
                  <p className="text-[13px] text-[var(--text-muted)] mt-1">
                    Fields marked with an asterisk (*) are required. Requests are routed directly to Edgardo Vazquez.
                  </p>
                </div>

                {/* Error Banner */}
                {formErrorBanner && (
                  <div
                    role="alert"
                    className="p-4 rounded-lg bg-[#FF7083]/15 border border-[#FF7083]/40 text-[#FF7083] text-[13px] font-medium flex items-center gap-2"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{formErrorBanner}</span>
                  </div>
                )}

                {/* Full Name */}
                <div>
                  <label
                    htmlFor="submit-full-name"
                    className="block text-[12px] font-bold uppercase tracking-[0.08em] text-[var(--text-secondary)] mb-1.5"
                  >
                    Full Name*
                  </label>
                  <input
                    id="submit-full-name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    onBlur={() => handleBlur('fullName')}
                    placeholder="e.g., Lawrence Chung"
                    className={`w-full px-4 py-2.5 rounded-lg bg-[var(--bg-page)] border text-[14px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none transition-colors ${
                      touched.fullName && !isFullNameValid
                        ? 'border-[#FF7083] focus:border-[#FF7083]'
                        : 'border-[var(--border-color)] focus:border-[#2774AE]'
                    }`}
                  />
                  {touched.fullName && !isFullNameValid && (
                    <p className="text-[11px] text-[#FF7083] mt-1">
                      Please provide your full name so editors know who to follow up with.
                    </p>
                  )}
                </div>

                {/* UCLA Email */}
                <div>
                  <label
                    htmlFor="submit-ucla-email"
                    className="block text-[12px] font-bold uppercase tracking-[0.08em] text-[var(--text-secondary)] mb-1.5"
                  >
                    UCLA Email*
                  </label>
                  <input
                    id="submit-ucla-email"
                    type="email"
                    value={uclaEmail}
                    onChange={(e) => setUclaEmail(e.target.value)}
                    onBlur={() => handleBlur('uclaEmail')}
                    placeholder="e.g., lchung@anderson.ucla.edu"
                    className={`w-full px-4 py-2.5 rounded-lg bg-[var(--bg-page)] border text-[14px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none transition-colors ${
                      touched.uclaEmail && !isEmailValid
                        ? 'border-[#FF7083] focus:border-[#FF7083]'
                        : 'border-[var(--border-color)] focus:border-[#2774AE]'
                    }`}
                  />
                  {touched.uclaEmail && !isEmailValid && (
                    <p className="text-[11px] text-[#FF7083] mt-1">
                      Must be a valid UCLA address ending in @anderson.ucla.edu or @ucla.edu.
                    </p>
                  )}
                </div>

                {/* Submission Type — Segmented Control */}
                <div>
                  <label className="block text-[12px] font-bold uppercase tracking-[0.08em] text-[var(--text-secondary)] mb-2">
                    Submission Type*
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {SUBMISSION_TYPES.map((st) => {
                      const isSelected = type === st;
                      return (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setType(st)}
                          className={`py-2 px-2 text-[12px] font-semibold rounded-lg border text-center transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-[#F4B942] text-[#003B5C] border-[#F4B942] font-bold shadow-sm'
                              : 'bg-[var(--bg-page)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-[#F4B942]'
                          }`}
                        >
                          {st}
                        </button>
                      );
                    })}
                  </div>
                  {type === 'Event' && (
                    <div className="mt-2 p-2.5 rounded-lg bg-[#2774AE]/10 border border-[#2774AE]/25 text-[12px] text-[var(--text-secondary)] flex items-center gap-2">
                      <span className="text-[#2774AE] font-bold">🎉 Social Event Note:</span>
                      <span>
                        Event submissions are also shared with Josh Dau (josh.dau.2028@anderson.ucla.edu), Co-Social Chair.
                      </span>
                    </div>
                  )}
                </div>

                {/* Headline */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="submit-headline"
                      className="text-[12px] font-bold uppercase tracking-[0.08em] text-[var(--text-secondary)]"
                    >
                      Headline*
                    </label>
                    <span
                      className={`text-[11px] font-mono ${
                        headline.length > 60 ? 'text-[#FF7083] font-bold' : 'text-[var(--text-muted)]'
                      }`}
                    >
                      {headline.length} / 60
                    </span>
                  </div>
                  <input
                    id="submit-headline"
                    type="text"
                    maxLength={60}
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    onBlur={() => handleBlur('headline')}
                    placeholder="e.g., Case comp team forming — 2 spots open"
                    className={`w-full px-4 py-2.5 rounded-lg bg-[var(--bg-page)] border text-[14px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none transition-colors ${
                      touched.headline && !isHeadlineValid
                        ? 'border-[#FF7083] focus:border-[#FF7083]'
                        : 'border-[var(--border-color)] focus:border-[#2774AE]'
                    }`}
                  />
                  {touched.headline && !isHeadlineValid && (
                    <p className="text-[11px] text-[#FF7083] mt-1">
                      Headline is required (up to 60 characters).
                    </p>
                  )}
                </div>

                {/* Details */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="submit-details"
                      className="text-[12px] font-bold uppercase tracking-[0.08em] text-[var(--text-secondary)]"
                    >
                      Details*
                    </label>
                    <span
                      className={`text-[11px] font-mono ${
                        details.length > 350 ? 'text-[#FF7083] font-bold' : 'text-[var(--text-muted)]'
                      }`}
                    >
                      {details.length} / 350
                    </span>
                  </div>
                  <textarea
                    id="submit-details"
                    rows={4}
                    maxLength={350}
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    onBlur={() => handleBlur('details')}
                    placeholder="Date, time, location, link, and why it matters to Section B."
                    className={`w-full px-4 py-2.5 rounded-lg bg-[var(--bg-page)] border text-[14px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none transition-colors ${
                      touched.details && !isDetailsValid
                        ? 'border-[#FF7083] focus:border-[#FF7083]'
                        : 'border-[var(--border-color)] focus:border-[#2774AE]'
                    }`}
                  />
                  {touched.details && !isDetailsValid && (
                    <p className="text-[11px] text-[#FF7083] mt-1">
                      Details are required (up to 350 characters).
                    </p>
                  )}
                </div>

                {/* Date / Deadline (Optional) & Link or RSVP URL (Optional) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="submit-date"
                      className="block text-[12px] font-bold uppercase tracking-[0.08em] text-[var(--text-secondary)] mb-1.5"
                    >
                      Date / Deadline (optional)
                    </label>
                    <input
                      id="submit-date"
                      type="date"
                      value={dateOrDeadline}
                      onChange={(e) => setDateOrDeadline(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-[var(--bg-page)] border border-[var(--border-color)] text-[14px] text-[var(--text-primary)] focus:border-[#2774AE] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="submit-link"
                      className="block text-[12px] font-bold uppercase tracking-[0.08em] text-[var(--text-secondary)] mb-1.5"
                    >
                      Link or RSVP URL (optional)
                    </label>
                    <input
                      id="submit-link"
                      type="url"
                      value={linkOrUrl}
                      onChange={(e) => setLinkOrUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-4 py-2 rounded-lg bg-[var(--bg-page)] border border-[var(--border-color)] text-[14px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[#2774AE] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Conditional Shoutout Nominee field */}
                {type === 'Shoutout' && (
                  <div className="p-4 rounded-xl bg-[var(--bg-raised)] border border-[var(--border-color)] space-y-2 animate-fade-in">
                    <label
                      htmlFor="submit-nominee"
                      className="block text-[12px] font-bold uppercase tracking-[0.08em] text-[#F4B942]"
                    >
                      Nominating a classmate?*
                    </label>
                    <input
                      id="submit-nominee"
                      type="text"
                      value={nominee}
                      onChange={(e) => setNominee(e.target.value)}
                      onBlur={() => handleBlur('nominee')}
                      placeholder="Who are you recognizing, and what did they do?"
                      className="w-full px-4 py-2.5 rounded-lg bg-[var(--bg-page)] border border-[var(--border-color)] text-[14px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[#2774AE] focus:outline-none"
                    />
                    {touched.nominee && !isNomineeValid && (
                      <p className="text-[11px] text-[#FF7083]">
                        Please state who you are recognizing.
                      </p>
                    )}
                  </div>
                )}

                {/* Priority Radio Group */}
                <div>
                  <span className="block text-[12px] font-bold uppercase tracking-[0.08em] text-[var(--text-secondary)] mb-2">
                    Priority
                  </span>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-2.5 rounded-lg bg-[var(--bg-page)] border border-[var(--border-color)] cursor-pointer hover:border-[#F4B942]/50 transition-colors">
                      <input
                        type="radio"
                        name="priority"
                        value="critical"
                        checked={priority === 'critical'}
                        onChange={() => setPriority('critical')}
                        className="text-[#F4B942] focus:ring-[#F4B942]"
                      />
                      <span className="text-[13px] text-[var(--text-primary)]">
                        <strong className="text-[#FF7083]">Critical</strong> (time-sensitive, affects most of B)
                      </span>
                    </label>

                    <label className="flex items-center gap-3 p-2.5 rounded-lg bg-[var(--bg-page)] border border-[var(--border-color)] cursor-pointer hover:border-[#F4B942]/50 transition-colors">
                      <input
                        type="radio"
                        name="priority"
                        value="standard"
                        checked={priority === 'standard'}
                        onChange={() => setPriority('standard')}
                        className="text-[#F4B942] focus:ring-[#F4B942]"
                      />
                      <span className="text-[13px] text-[var(--text-primary)]">
                        <strong>Standard announcement</strong>
                      </span>
                    </label>

                    <label className="flex items-center gap-3 p-2.5 rounded-lg bg-[var(--bg-page)] border border-[var(--border-color)] cursor-pointer hover:border-[#F4B942]/50 transition-colors">
                      <input
                        type="radio"
                        name="priority"
                        value="space_permits"
                        checked={priority === 'space_permits'}
                        onChange={() => setPriority('space_permits')}
                        className="text-[#F4B942] focus:ring-[#F4B942]"
                      />
                      <span className="text-[13px] text-[var(--text-primary)]">
                        Include if space allows
                      </span>
                    </label>
                  </div>
                </div>

                {/* Consent Checkbox */}
                <div>
                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      id="submit-consent-checkbox"
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => {
                        setConsent(e.target.checked);
                        handleBlur('consent');
                      }}
                      className="mt-1 h-4 w-4 rounded border-[var(--border-color)] text-[#2774AE] focus:ring-[#2774AE]"
                    />
                    <span className="text-[13px] text-[var(--text-secondary)] leading-normal">
                      I confirm this is accurate and I have permission to share it with Section B.*
                    </span>
                  </label>
                  {touched.consent && !isConsentValid && (
                    <p className="text-[11px] text-[#FF7083] mt-1">
                      Confirmation is required before sending.
                    </p>
                  )}
                </div>

                {/* SUBMIT BUTTON — 3 states */}
                <div className="pt-2">
                  <button
                    id="submit-form-send-btn"
                    type="submit"
                    disabled={!isFormValid || isSubmitting}
                    className={`editorial-btn w-full py-3.5 px-6 rounded-lg font-bold text-[14px] flex items-center justify-center gap-2 transition-all ${
                      isSubmitting
                        ? 'bg-[#F4B942] text-[#003B5C] opacity-80 cursor-wait'
                        : isFormValid
                        ? 'bg-[#F4B942] text-[#003B5C] hover:bg-[#FFD100] shadow-md cursor-pointer'
                        : 'bg-[var(--bg-raised)] text-[var(--text-muted)] cursor-not-allowed border border-[var(--border-color)]'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <span>Send to B →</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
