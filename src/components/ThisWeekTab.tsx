import React, { useState, useEffect } from 'react';
import { TabId, PublishedSiteContent } from '../types';
import { KEY_DATES, ANNOUNCEMENTS, SEPTEMBER_BIRTHDAYS } from '../data';
import { SectionHeader } from './SectionHeader';
import { PlaceholderChip } from './PlaceholderBadge';
import { uploadPhotoToServer } from '../services/contentService';
import { optimizeImage } from '../utils/imageOptimizer';
import { saveMediaItem, deleteMediaItem } from '../utils/imageDb';
import {
  ExternalLink,
  Calendar,
  MapPin,
  Sparkles,
  Camera,
  Upload,
  RotateCcw,
  Users,
  Maximize2,
  Key,
  Clock,
  AlertCircle,
  Heart,
  Globe,
  X,
  FileText,
  CheckCircle2,
  ChevronRight,
  Check,
  Save,
  Loader2,
  Leaf,
  Bus,
} from 'lucide-react';
import defaultSpotlightImg from '../assets/images/section_b_spotlight.jpg';
import defaultCabinetImg from '../assets/images/section_b_cabinet.jpg';
import riordanFlyerImg from '../assets/images/riordan_programs_flyer.jpg';

interface ThisWeekTabProps {
  onNavigate: (tab: TabId) => void;
  isEditorAuthenticated?: boolean;
  publishedContent?: PublishedSiteContent;
  onUpdateAndPublishContent?: (content: Partial<PublishedSiteContent>) => Promise<boolean>;
}

export const ThisWeekTab: React.FC<ThisWeekTabProps> = ({
  onNavigate,
  isEditorAuthenticated = false,
  publishedContent,
  onUpdateAndPublishContent,
}) => {
  // Spotlight photo state - defaults to bundled asset so all users can see it
  const [spotlightImg, setSpotlightImg] = useState<string>(
    publishedContent?.spotlightImg || defaultSpotlightImg
  );
  const [hasCustomImg, setHasCustomImg] = useState(false);

  // Cabinet photo state - defaults to the official Section B Cabinet photo
  const [cabinetImg, setCabinetImg] = useState<string>(
    publishedContent?.cabinetImg || defaultCabinetImg
  );
  const [hasCustomCabinetImg, setHasCustomCabinetImg] = useState(true);
  const [cabinetFitMode, setCabinetFitMode] = useState<'contain' | 'cover'>(
    publishedContent?.cabinetFitMode || 'contain'
  );

  // Save / Publish status
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [hasUnsavedCabinetChanges, setHasUnsavedCabinetChanges] = useState(false);
  const [publishToast, setPublishToast] = useState<string | null>(null);

  // Flyer lightbox modal state
  const [isFlyerModalOpen, setIsFlyerModalOpen] = useState(false);

  // Sync state from publishedContent prop if updated from server or editor tab
  useEffect(() => {
    if (publishedContent) {
      // If server or parent provided an actual image, display it
      if (publishedContent.cabinetImg) {
        setCabinetImg(publishedContent.cabinetImg);
        setHasCustomCabinetImg(true);
      } else if (!hasUnsavedCabinetChanges && !isUploadingPhoto) {
        setCabinetImg(defaultCabinetImg);
        setHasCustomCabinetImg(true);
      }

      if (publishedContent.cabinetFitMode) {
        setCabinetFitMode(publishedContent.cabinetFitMode);
      }
      if (publishedContent.spotlightImg) {
        setSpotlightImg(publishedContent.spotlightImg);
        setHasCustomImg(true);
      }
    }
  }, [publishedContent, hasUnsavedCabinetChanges, isUploadingPhoto]);

  const showToast = (msg: string) => {
    setPublishToast(msg);
    setTimeout(() => setPublishToast(null), 3500);
  };

  const handleSpotlightUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      showToast('Optimizing spotlight photo...');
      const optimized = await optimizeImage(file, 1600, 1600, 0.88);
      setSpotlightImg(optimized);
      setHasCustomImg(true);
      await saveMediaItem('spotlightImg', optimized);

      if (onUpdateAndPublishContent) {
        setIsSaving(true);
        const serverUrl = await uploadPhotoToServer(optimized, 'spotlight');
        if (serverUrl && !serverUrl.startsWith('data:')) {
          setSpotlightImg(serverUrl);
        }
        await onUpdateAndPublishContent({ spotlightImg: serverUrl });
        setIsSaving(false);
        showToast('Spotlight photo saved & transferred to viewers!');
      }
    } catch (err) {
      console.error('Spotlight upload error:', err);
      showToast('Could not process spotlight photo.');
    } finally {
      e.target.value = '';
    }
  };

  const handleResetSpotlight = async () => {
    setSpotlightImg(defaultSpotlightImg);
    setHasCustomImg(false);
    await deleteMediaItem('spotlightImg');
    if (onUpdateAndPublishContent) {
      setIsSaving(true);
      await onUpdateAndPublishContent({ spotlightImg: null });
      setIsSaving(false);
      showToast('Spotlight reset to default and updated for viewers.');
    }
  };

  const handleCabinetUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    showToast('Optimizing photo resolution...');

    try {
      // 1. Resize & compress using canvas (turns 10MB+ phone photo into crisp ~300KB web asset)
      const optimized = await optimizeImage(file, 1920, 1440, 0.88);

      // 2. Set in UI immediately with no glitching or flickering
      setCabinetImg(optimized);
      setHasCustomCabinetImg(true);
      setHasUnsavedCabinetChanges(false);

      // 3. Persist to local IndexedDB backup immediately
      await saveMediaItem('cabinetImg', optimized);

      // 4. Upload to server and publish
      if (onUpdateAndPublishContent) {
        setIsSaving(true);
        const serverUrl = await uploadPhotoToServer(optimized, 'cabinet');
        if (serverUrl && !serverUrl.startsWith('data:')) {
          setCabinetImg(serverUrl);
        }
        const ok = await onUpdateAndPublishContent({
          cabinetImg: serverUrl,
          cabinetFitMode,
        });
        setIsSaving(false);
        if (ok) {
          showToast('✓ Photo saved & permanently published to all viewers!');
        } else {
          showToast('Photo saved locally! (Will sync to server on next change)');
        }
      } else {
        showToast('Photo saved locally!');
      }
    } catch (err: any) {
      console.error('Cabinet upload error:', err);
      showToast('Could not process photo. Please try a different image.');
    } finally {
      setIsUploadingPhoto(false);
      e.target.value = '';
    }
  };

  const handleSaveAndPublishCabinet = async () => {
    if (!onUpdateAndPublishContent || !cabinetImg) return;
    setIsSaving(true);
    try {
      let finalImg = cabinetImg;
      if (cabinetImg.startsWith('data:image/')) {
        finalImg = await uploadPhotoToServer(cabinetImg, 'cabinet');
      }
      const ok = await onUpdateAndPublishContent({
        cabinetImg: finalImg,
        cabinetFitMode,
      });
      if (ok) {
        setHasUnsavedCabinetChanges(false);
        showToast('✓ Saved & Published live to all viewers!');
      } else {
        showToast('Failed to save to viewers. Please try again.');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to save to viewers.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleFitMode = async () => {
    const nextMode = cabinetFitMode === 'contain' ? 'cover' : 'contain';
    setCabinetFitMode(nextMode);
    if (onUpdateAndPublishContent && cabinetImg) {
      await onUpdateAndPublishContent({ cabinetFitMode: nextMode });
      showToast(`Display mode updated to ${nextMode === 'contain' ? 'Uncropped' : 'Fill Width'}`);
    }
  };

  const handleResetCabinet = async () => {
    setCabinetImg(defaultCabinetImg);
    setHasCustomCabinetImg(true);
    setHasUnsavedCabinetChanges(false);
    await deleteMediaItem('cabinetImg');
    if (onUpdateAndPublishContent) {
      setIsSaving(true);
      await onUpdateAndPublishContent({ cabinetImg: '/section_b_cabinet.jpg' });
      setIsSaving(false);
      showToast('Cabinet photo reset to Section B Cabinet photo.');
    }
  };

  return (
    <div className="w-full space-y-16 pb-12">
      {/* ──────────────────────────────────────────
          MASTHEAD
          ────────────────────────────────────────── */}
      <section
        id="masthead-section"
        className="relative overflow-hidden rounded-2xl border border-[var(--border-color)] px-6 py-16 sm:px-12 sm:py-24 text-center"
        style={{
          background: `
            radial-gradient(circle at 78% 12%, rgba(244,185,66,0.28), transparent 30%),
            radial-gradient(circle at 16% 34%, rgba(99,119,255,0.22), transparent 34%),
            linear-gradient(145deg, #071426 0%, #0B1B36 55%, #101C3E 100%)
          `,
        }}
      >
        {/* Decorative outlined "B" watermark, top-right, 15% opacity */}
        <div
          className="absolute -top-10 -right-8 pointer-events-none select-none text-[260px] font-editorial-serif font-black text-white/[0.08] leading-none"
          aria-hidden="true"
        >
          B
        </div>

        <div className="relative z-10 max-w-3xl mx-auto">
          {/* Issue Badge */}
          <div className="inline-block mb-4">
            <span className="inline-flex items-center px-3 py-1 rounded bg-[#F4B942] text-[#003B5C] font-bold text-[11px] uppercase tracking-[0.1em] transform rotate-[1.5deg] shadow-sm">
              Issue 02 · Fall Quarter Kickoff
            </span>
          </div>

          <h1 className="font-editorial-serif font-bold text-[48px] sm:text-[64px] lg:text-[72px] leading-[1.05] tracking-tight text-white mb-4">
            The Place to B<span className="text-[#F4B942]">.</span>
          </h1>

          <p className="font-editorial-serif italic text-[16px] sm:text-[18px] text-[#C1CEE5] max-w-2xl mx-auto leading-relaxed">
            UCLA Anderson · everything Section B needs to know before the week begins, published
            bi-weekly and never a day late.
          </p>
        </div>
      </section>

      {/* ──────────────────────────────────────────
          SUMMARY STATS BAR
          ────────────────────────────────────────── */}
      <section
        id="summary-stats-bar"
        aria-label="Issue Summary Statistics"
        className="w-full rounded-xl bg-[var(--bg-raised)] border border-[var(--border-color)] px-6 py-5 shadow-sm"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-0 lg:divide-x lg:divide-[var(--border-color)]">
          {/* Stat 1 */}
          <div className="flex items-center justify-between px-3 text-[11px] font-bold tracking-[0.08em] uppercase text-[var(--text-secondary)]">
            <span>Days on the calendar</span>
            <span className="flex-1 mx-2 border-b border-dotted border-[var(--text-muted)] opacity-40"></span>
            <span className="text-[14px] text-[var(--text-primary)] font-editorial-sans">{KEY_DATES.length}</span>
          </div>

          {/* Stat 2 */}
          <div className="flex items-center justify-between px-3 text-[11px] font-bold tracking-[0.08em] uppercase text-[var(--text-secondary)]">
            <span>Deadlines ahead</span>
            <span className="flex-1 mx-2 border-b border-dotted border-[var(--text-muted)] opacity-40"></span>
            <span className="text-[14px] text-[#F4B942] font-editorial-sans font-black">3</span>
          </div>

          {/* Stat 3 */}
          <div className="flex items-center justify-between px-3 text-[11px] font-bold tracking-[0.08em] uppercase text-[var(--text-secondary)]">
            <span>Announcements</span>
            <span className="flex-1 mx-2 border-b border-dotted border-[var(--text-muted)] opacity-40"></span>
            <span className="text-[14px] text-[var(--text-primary)] font-editorial-sans">4</span>
          </div>

          {/* Stat 4: Birthdays */}
          <div className="relative flex items-center justify-between px-3 text-[11px] font-bold tracking-[0.08em] uppercase text-[var(--text-secondary)]">
            <span>B-Days (Sept)</span>
            <span className="flex-1 mx-2 border-b border-dotted border-[var(--text-muted)] opacity-40"></span>
            <button
              type="button"
              onClick={() => {
                document.getElementById('birthdays-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="cursor-pointer text-[#F4B942] hover:text-[#FFD100] flex items-center gap-1.5 transition-colors"
              title="View September birthdays"
            >
              <span className="text-[14px] font-editorial-sans font-black">4 in Sept</span>
              <span className="text-[12px]">🎂</span>
            </button>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────
          FROM THE PRESIDENT
          ────────────────────────────────────────── */}
      <section id="from-the-president-section">
        <SectionHeader title="FROM THE PRESIDENT" />

        <div className="relative rounded-xl p-6 sm:p-10 border border-[#F4B942]/40 bg-[#F4B942]/[0.03] shadow-sm">
          {/* Large decorative quotation mark */}
          <div
            className="absolute top-4 left-6 text-[72px] leading-none font-editorial-serif text-[#F4B942]/20 select-none pointer-events-none"
            aria-hidden="true"
          >
            “
          </div>

          {/* Top Chip */}
          <div className="mb-6 relative z-10 flex items-center justify-between flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] uppercase font-bold tracking-[0.08em] rounded-full bg-[#F4B942] text-[#003B5C] shadow-sm">
              <span>✨</span> PRESIDENT'S NOTE — ISSUE 02
            </span>
            <span className="text-[11px] font-semibold text-[var(--text-muted)]">
              UCLA Anderson MBA Class of 2028
            </span>
          </div>

          {/* Left Border Note Accent */}
          <div className="border-l-[3px] border-[#F4B942] pl-4 sm:pl-6 my-4 relative z-10 space-y-4">
            <p className="text-[16px] sm:text-[17px] font-bold text-[var(--text-primary)] leading-snug font-editorial-serif">
              Welcome to Fall Quarter, Section B!
            </p>
            <p className="text-[15px] text-[var(--text-secondary)] leading-[1.8] font-editorial-serif">
              I hope everyone had a lovely and restorative break and is feeling geared up for another round of classes, chaos, and memories to come :)
            </p>
            <p className="text-[15px] text-[var(--text-secondary)] leading-[1.8] font-editorial-serif">
              Eddie graciously built this site as a place to find current and past newsletters, as well as other important information, forms, and events. We hope it’ll be a helpful resource for everyone, especially as fall recruitment and coursework start to pick up!
            </p>
            <p className="text-[15px] text-[var(--text-secondary)] leading-[1.8] font-editorial-serif">
              If you know of any deadlines, events, or other information you’d like added to the website, please use the submission forms freely!
            </p>
            <p className="text-[16px] font-bold text-[#F4B942] leading-[1.8] font-editorial-serif">
              We got this, Section 🅱️!!!
            </p>
          </div>

          {/* President Signoff & Avatar */}
          <div className="mt-8 pt-6 border-t border-[var(--border-color)] flex items-center justify-between flex-wrap gap-4 relative z-10">
            <div className="flex items-center gap-3.5">
              <div
                className="w-11 h-11 rounded-full bg-[#0B1B36] border-2 border-[#F4B942] flex items-center justify-center text-[#F4B942] font-bold text-[14px] select-none shadow-md"
                aria-hidden="true"
              >
                SK
              </div>
              <div>
                <h4 className="font-bold text-[16px] text-[var(--text-primary)]">Sabrina Kharrazi</h4>
                <p className="text-[12px] italic text-[var(--text-muted)]">
                  Section B President · UCLA Anderson MBA Class of 2028 · 602-677-9597
                </p>
              </div>
            </div>

            <div className="text-[12px] font-medium text-[#2ED1BA] flex items-center gap-1.5">
              <span>✓ Official Issue 02 Address</span>
            </div>
          </div>
        </div>

        {/* ──────────────────────────────────────────
            CABINET PHOTO SECTION (Horizontal under note)
            ────────────────────────────────────────── */}
        <div id="cabinet-photo-section" className="mt-6">
          {publishToast && (
            <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-[#0B1B36] border border-[#2ED1BA] text-white shadow-2xl flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#2ED1BA]" />
              <p className="text-[13px] font-medium">{publishToast}</p>
            </div>
          )}

          <div className="relative rounded-2xl overflow-hidden border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm">
            {cabinetImg ? (
              <div>
                {/* Header Bar — cleanly outside image so no faces are covered */}
                <div className="px-5 py-3.5 bg-[var(--bg-card)] border-b border-[var(--border-color)] flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#F4B942] text-[#003B5C] shadow-sm">
                      Section B Leadership
                    </span>
                    <h3 className="font-editorial-serif text-[18px] sm:text-[22px] font-bold text-[var(--text-primary)]">
                      Section B Cabinet 2028
                    </h3>
                  </div>
                  <span className="text-[12px] text-[var(--text-muted)] italic hidden md:inline">
                    Leading the charge for the best section at UCLA Anderson
                  </span>
                </div>

                {/* Big, Uncropped Image Display Stage */}
                <div
                  className={`relative w-full ${
                    cabinetFitMode === 'contain'
                      ? 'bg-[var(--bg-card)] p-1 sm:p-3'
                      : 'aspect-[16/9] sm:aspect-[21/9] max-h-[640px] bg-[#060F1E]'
                  } flex items-center justify-center overflow-hidden transition-all`}
                >
                  <img
                    src={cabinetImg}
                    alt="Section B Cabinet"
                    className={`w-full ${
                      cabinetFitMode === 'contain'
                        ? 'h-auto max-h-[920px] object-contain rounded-lg shadow-md'
                        : 'h-full object-cover object-center'
                    } transition-all mx-auto`}
                    onError={(e) => {
                      if (e.currentTarget.src !== defaultCabinetImg) {
                        e.currentTarget.src = defaultCabinetImg;
                      }
                    }}
                  />
                  {isUploadingPhoto && (
                    <div className="absolute inset-0 bg-[#060F1E]/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 text-white z-20">
                      <Loader2 className="w-9 h-9 animate-spin text-[#F4B942]" />
                      <p className="text-[14px] font-bold">Optimizing &amp; saving photo...</p>
                    </div>
                  )}
                </div>

                {/* Editor-Only Action Bar — HIDDEN FROM REGULAR VIEWERS */}
                {isEditorAuthenticated && (
                  <div className="p-3.5 bg-[var(--bg-raised)] border-t border-[var(--border-color)] flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center flex-wrap gap-2.5">
                      <label
                        htmlFor="cabinet-photo-upload-replace"
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#2774AE] hover:bg-[#1e5c8a] text-white text-[12px] font-bold transition-colors cursor-pointer shadow-sm"
                        title="Upload new photo file from device"
                      >
                        <Upload className="w-3.5 h-3.5 text-[#F4B942]" />
                        <span>Replace photo</span>
                        <input
                          id="cabinet-photo-upload-replace"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleCabinetUpload}
                        />
                      </label>

                      {/* Display Mode Toggle */}
                      <button
                        onClick={handleToggleFitMode}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-[12px] font-medium transition-colors cursor-pointer shadow-sm"
                        title="Toggle uncropped vs fill frame"
                      >
                        <Maximize2 className="w-3.5 h-3.5 text-[#2774AE]" />
                        <span>{cabinetFitMode === 'contain' ? 'Display: Uncropped' : 'Display: Fill Width'}</span>
                      </button>

                      {/* Save & Publish to Viewers Button */}
                      <button
                        onClick={handleSaveAndPublishCabinet}
                        disabled={isSaving}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#F4B942] hover:bg-[#FFD100] text-[#003B5C] text-[12px] font-bold transition-colors cursor-pointer shadow-sm disabled:opacity-50"
                        title="Publish saved image to all Section B viewers"
                      >
                        {isSaving ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Save className="w-3.5 h-3.5" />
                        )}
                        <span>{isSaving ? 'Publishing...' : 'Save & Publish to Viewers'}</span>
                      </button>

                      <button
                        onClick={handleResetCabinet}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-[#FF7083] hover:text-[#ff4d64] hover:border-[#FF7083] text-[12px] font-medium transition-colors cursor-pointer shadow-sm"
                        title="Reset to default cabinet placeholder"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset to default</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      {hasUnsavedCabinetChanges && (
                        <span className="text-[11px] font-bold text-[#F4B942] flex items-center gap-1">
                          ● Unsaved changes
                        </span>
                      )}
                      <span className="text-[11px] font-semibold text-[#2774AE] bg-[#2774AE]/10 px-2 py-0.5 rounded border border-[#2774AE]/20">
                        Editor Controls Active
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : isEditorAuthenticated ? (
              /* Editor Mode: Placeholder with Upload Option */
              <div className="relative w-full py-16 sm:py-24 px-6 sm:px-12 min-h-[380px] sm:min-h-[460px] border-[1.5px] border-dashed border-[#F4B942]/40 bg-[#F4B942]/[0.03] flex flex-col items-center justify-center text-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#0B1B36] border border-[#F4B942]/40 flex items-center justify-center mb-4 shadow-inner">
                  <Users className="w-7 h-7 sm:w-8 sm:h-8 text-[#F4B942]" />
                </div>
                <span className="inline-block px-3.5 py-1 rounded-full bg-[#2774AE]/15 text-[#2774AE] font-bold text-[10px] uppercase tracking-wider mb-2">
                  Editor Console · Cabinet Photo Feature
                </span>
                <h3 className="font-editorial-serif font-bold text-[20px] sm:text-[24px] text-[var(--text-primary)] mb-2">
                  Upload Section B Cabinet Photo
                </h3>
                <p className="text-[13px] sm:text-[15px] text-[var(--text-secondary)] max-w-xl mb-5 leading-relaxed">
                  Select your original high-resolution photo from your device. It will be saved to the server and transferred live to all viewers.
                </p>

                {/* Editor Direct Original Photo Loading Button */}
                <div className="flex flex-col items-center gap-2.5">
                  <label
                    htmlFor="cabinet-photo-upload"
                    className={`editorial-btn inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#2774AE] hover:bg-[#1e5c8a] text-white font-bold text-[14px] transition-all shadow-md cursor-pointer hover:shadow-lg ${
                      isUploadingPhoto ? 'opacity-75 pointer-events-none' : ''
                    }`}
                    title="Upload original photo directly from your device"
                  >
                    {isUploadingPhoto ? (
                      <Loader2 className="w-4 h-4 text-[#F4B942] animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4 text-[#F4B942]" />
                    )}
                    <span>
                      {isUploadingPhoto ? 'Optimizing & Saving photo...' : 'Upload & Publish photo to viewers'}
                    </span>
                    <input
                      id="cabinet-photo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={isUploadingPhoto}
                      onChange={handleCabinetUpload}
                    />
                  </label>

                  <p className="text-[12px] text-[var(--text-muted)] max-w-md">
                    Renders in full uncropped fidelity across desktop and mobile screens.
                  </p>
                </div>
              </div>
            ) : (
              /* Regular Viewers: Clean Dignified Placeholder with NO Upload or Edit Buttons */
              <div className="relative w-full py-16 sm:py-20 px-6 sm:px-12 border border-[var(--border-color)] bg-[var(--bg-card)] flex flex-col items-center justify-center text-center">
                <div className="w-14 h-14 rounded-2xl bg-[#0B1B36] border border-[#F4B942]/40 flex items-center justify-center mb-4 shadow-inner">
                  <Users className="w-7 h-7 text-[#F4B942]" />
                </div>
                <span className="inline-block px-3 py-0.5 rounded-full bg-[#F4B942]/15 text-[#F4B942] font-bold text-[10px] uppercase tracking-wider mb-2">
                  Section B Leadership
                </span>
                <h3 className="font-editorial-serif font-bold text-[20px] sm:text-[24px] text-[var(--text-primary)] mb-2">
                  Section B Cabinet 2028
                </h3>
                <p className="text-[14px] text-[var(--text-secondary)] max-w-md leading-relaxed">
                  Official Section B leadership portrait for Cabinet officers, Committee Chairs, and organizers will be published here in an upcoming issue.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────
          SPOTLIGHT
          ────────────────────────────────────────── */}
      <section id="spotlight-section">
        <SectionHeader title="SPOTLIGHT" subtitle="Section B Spotlights!" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Card 1: Lawrence Chung & Walker Chun-Hao Huang (Real Content) */}
          <article className="editorial-card rounded-xl overflow-hidden bg-[var(--bg-card)] border border-[var(--border-color)] flex flex-col shadow-sm">
            {/* Image Container — Uncropped Full Portrait Display ("As it is, no edits") */}
            <div className="relative w-full bg-[#0B1B36] flex flex-col items-center justify-center overflow-hidden border-b border-[var(--border-color)] group">
              <img
                src={spotlightImg}
                alt="Lawrence Chung and Walker Chun-Hao Huang standing in front of the UCLA Anderson School of Management sign in suits giving thumbs up"
                className="w-full max-h-[580px] object-contain mx-auto transition-transform duration-300 group-hover:scale-[1.01]"
                onError={(e) => {
                  // If image fails, safely fallback to the bundled image
                  if (e.currentTarget.src !== defaultSpotlightImg) {
                    e.currentTarget.src = defaultSpotlightImg;
                  }
                }}
              />

              {/* Champions Badge */}
              <div className="absolute top-3 right-3 z-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F4B942] text-[#003B5C] font-bold text-[11px] shadow-md">
                  <span>🏆</span> 1st Place Champions
                </span>
              </div>

              {/* Upload Original / Direct File Selection Control — Available for Editors Only */}
              {isEditorAuthenticated && (
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
                  <label
                    htmlFor="spotlight-photo-upload"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/75 hover:bg-black/90 backdrop-blur-md text-white text-[12px] font-semibold transition-colors cursor-pointer shadow-md"
                    title="Editor Only: Upload original photo as it is with zero edits"
                  >
                    <Camera className="w-3.5 h-3.5 text-[#F4B942]" />
                    <span>{hasCustomImg ? 'Replace photo (Editor)' : 'Upload original photo (Editor)'}</span>
                    <input
                      id="spotlight-photo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleSpotlightUpload}
                    />
                  </label>

                  {hasCustomImg && (
                    <button
                      onClick={handleResetSpotlight}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-black/70 hover:bg-black/90 backdrop-blur-md text-white/80 hover:text-white text-[11px] font-medium transition-colors cursor-pointer"
                      title="Editor Only: Reset to default image"
                    >
                      <RotateCcw className="w-3 h-3 text-[#FF7083]" />
                      <span>Reset</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h3 className="font-bold text-[18px] sm:text-[20px] text-[var(--text-primary)] leading-snug">
                    Lawrence Chung & Walker Chun-Hao Huang
                  </h3>
                  {isEditorAuthenticated && hasCustomImg && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#2ED1BA]/15 text-[#2ED1BA]">
                      Original Photo Loaded
                    </span>
                  )}
                </div>

                <div className="mb-4">
                  <span className="inline-block px-3 py-1 rounded-full bg-[#F4B942] text-[#003B5C] font-bold text-[11px] uppercase tracking-[0.05em]">
                    🏆 UCLA Anderson Inaugural Buildathon — 1st Place
                  </span>
                </div>

                <div className="space-y-3 text-[14px] sm:text-[15px] text-[var(--text-secondary)] leading-relaxed">
                  <p>
                    What happens when you combine the classic arcade energy of Street Fighter with
                    high-stakes interview preparation? You get Suits Fighter — an AI-powered,
                    gamified platform designed to make behavioral and technical interview practice
                    interactive, engaging, and genuinely fun.
                  </p>
                  <p>
                    Lawrence and Walker took first place at UCLA Anderson's Inaugural Buildathon with
                    an idea that's equal parts brilliant and absurd in the best way. Section B built
                    something worth talking about. 🎮
                  </p>
                </div>
              </div>
            </div>
          </article>

          {/* Card 2: Placeholder Spotlight */}
          <article className="rounded-xl p-8 border-[1.5px] border-dashed border-[#F4B942]/50 bg-[#F4B942]/[0.04] flex flex-col justify-between">
            <div>
              <div className="mb-4">
                <PlaceholderChip label="SPOTLIGHT — COMING SOON" />
              </div>

              <h3 className="font-editorial-serif font-bold text-[22px] text-[var(--text-primary)] mb-3">
                Who's next from Section B?
              </h3>

              <p className="text-[15px] italic text-[var(--text-muted)] leading-relaxed mb-6 font-editorial-sans">
                Know someone in Section B worth spotlighting? Submit their name and story through the
                Submit tab. Spotlights celebrate classmates doing interesting, generous, or
                impressive things — inside or outside the classroom.
              </p>
            </div>

            <div className="pt-6 border-t border-[var(--border-color)]">
              <button
                id="nominate-spotlight-btn"
                onClick={() => {
                  onNavigate('submit');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="editorial-btn inline-flex items-center gap-2 px-5 py-2.5 rounded border border-[#F4B942] text-[#F4B942] hover:bg-[#F4B942]/10 font-semibold text-[13px] transition-colors"
              >
                <span>Nominate a classmate</span>
                <span>→</span>
              </button>
            </div>
          </article>
        </div>
      </section>

      {/* ──────────────────────────────────────────
          TWO-COLUMN: UPCOMING KEY DATES + ANNOUNCEMENTS
          ────────────────────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: UPCOMING KEY DATES + B-GOOD + B-GLOBAL (55%) */}
        <div className="lg:col-span-7 space-y-10">
          {/* UPCOMING KEY DATES */}
          <div>
            <SectionHeader title="UPCOMING KEY DATES" />

            <div className="rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] overflow-hidden shadow-sm">
              <div className="divide-y divide-[var(--border-color)]">
                {KEY_DATES.map((item) => {
                  let badgeStyle = 'bg-[#F4B942] text-[#003B5C]';
                  if (item.category === 'SOCIAL') {
                    badgeStyle = 'bg-[#6377FF] text-white';
                  } else if (item.category === 'ACADEMIC') {
                    badgeStyle = 'bg-[#2ED1BA] text-[#003B5C]';
                  }

                  return (
                    <div
                      key={item.id}
                      className="p-4 sm:px-6 sm:py-4 flex items-center justify-between gap-4 hover:bg-[var(--bg-raised)]/40 transition-colors"
                    >
                      <div className="flex items-baseline gap-4 min-w-0">
                        <span className="text-[13px] sm:text-[14px] font-bold text-[#2774AE] tracking-wide whitespace-nowrap">
                          {item.dateStr}
                        </span>
                        <div className="min-w-0">
                          <p className="text-[14px] sm:text-[15px] font-medium text-[var(--text-primary)] truncate">
                            {item.title}
                          </p>
                          {item.timeAndLocation && (
                            <p className="text-[12px] text-[var(--text-muted)] truncate">
                              {item.timeAndLocation}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex-shrink-0">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold tracking-[0.08em] uppercase ${badgeStyle}`}
                        >
                          {item.category}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-4 bg-[var(--bg-card)]/50 border-t border-[var(--border-color)] text-[12px] italic text-[var(--text-muted)]">
                Check Canvas for full course assignment guidelines and deadlines. Flag a missing date in the
                Section B group chat and we'll add it before the next issue.
              </div>
            </div>
          </div>

          {/* First Section: B-Good · B the Change 🌱🤝 - Community Service & Impact */}
          <div id="b-good-section">
            <SectionHeader title="B-Good · B the Change 🌱🤝 - Community Service & Impact" />

            <article className="rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] overflow-hidden shadow-sm flex flex-col">
              {/* Header Banner */}
              <div className="bg-gradient-to-r from-[#003B5C] to-[#2774AE] text-white p-5 sm:p-6 relative">
                <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-bold tracking-[0.08em] uppercase bg-[#FFD100] text-[#003B5C]">
                    <Heart className="w-3.5 h-3.5 fill-[#003B5C]" />
                    <span>UCLA Anderson Riordan Programs</span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded bg-white/15 text-[11px] font-semibold text-white/95">
                    Apply by Oct 16, 2026
                  </span>
                </div>

                <h3 className="font-editorial-serif font-bold text-[22px] sm:text-[24px] text-white leading-tight">
                  Whose Life Have You Impacted Lately?
                </h3>
                <p className="text-[13px] text-white/85 mt-1">
                  Become a Riordan Programs Mentor · Over 150 UCLA Anderson students &amp; alumni serve each year
                </p>
              </div>

              {/* Card Body */}
              <div className="p-5 sm:p-6 space-y-5">
                {/* Visual Flyer & Mission Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-start">
                  {/* Flyer Graphic Thumbnail */}
                  <div className="sm:col-span-5 flex flex-col items-center">
                    <div
                      onClick={() => setIsFlyerModalOpen(true)}
                      className="group relative cursor-pointer rounded-lg overflow-hidden border border-[var(--border-color)] bg-[var(--bg-raised)] shadow-md hover:shadow-xl transition-all duration-300 w-full"
                      title="Click to view full flyer"
                    >
                      <img
                        src={riordanFlyerImg}
                        alt="Riordan Programs Mentorship Recruitment Flyer"
                        className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1.5 font-semibold text-[12px]">
                        <Maximize2 className="w-4 h-4 text-[#FFD100]" />
                        <span>View full flyer</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsFlyerModalOpen(true)}
                      className="mt-2 text-[12px] font-semibold text-[#2774AE] hover:text-[#003B5C] flex items-center gap-1 cursor-pointer"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>Expand Flyer</span>
                    </button>
                  </div>

                  {/* Program Description */}
                  <div className="sm:col-span-7 space-y-4">
                    <div>
                      <h4 className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#2774AE] mb-1">
                        Who We Are
                      </h4>
                      <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
                        The Riordan Programs provide leadership and management training to high school students and recent college graduates from diverse backgrounds and underserved communities through education, mentorship, and professional development.
                      </p>
                    </div>

                    <div>
                      <h4 className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#2774AE] mb-1">
                        Who You Can Be
                      </h4>
                      <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
                        Become a Riordan Programs mentor! Each year, more than 150 UCLA Anderson students and Riordan alumni serve as role models for our program participants. Their commitment is a critical aspect of the programs.
                      </p>
                    </div>

                    {/* C4C Callout */}
                    <div className="p-3 rounded-lg bg-[#F4B942]/15 border border-[#F4B942]/40 text-[12px] text-[var(--text-primary)] flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#F4B942] flex-shrink-0" />
                      <span className="font-medium">
                        <strong>C4C Credit:</strong> Mentor lunches count for Challenge for Charity credit!
                      </span>
                    </div>
                  </div>
                </div>

                {/* Cohort Dates & Requirements */}
                <div className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-raised)]/50 p-4 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-[var(--text-primary)]">
                      Mentorship Programs &amp; Schedule
                    </span>
                    <span className="text-[11px] font-medium text-[var(--text-muted)]">
                      Current UCLA Anderson MBA Students
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    {/* Scholars */}
                    <div className="p-3 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-[12px]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-[#2774AE]">SCHOLARS (10th–11th Grade)</span>
                        <span className="text-[11px] font-semibold text-[var(--text-muted)]">12:30 – 1:30 PM</span>
                      </div>
                      <p className="text-[12px] text-[var(--text-secondary)]">
                        <strong>Dates:</strong> Nov 14 · Jan 23 · Feb 20
                      </p>
                    </div>

                    {/* MBA Fellows */}
                    <div className="p-3 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-[12px]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-[#003B5C] dark:text-[#F4B942]">MBA FELLOWS (College Grads)</span>
                        <span className="text-[11px] font-semibold text-[var(--text-muted)]">12:00 – 1:00 PM</span>
                      </div>
                      <p className="text-[12px] text-[var(--text-secondary)]">
                        <strong>Cohort 1:</strong> Nov 7, Dec (Virtual), Jan 9, Apr 3<br />
                        <strong>Cohort 2:</strong> Nov 7, Jan 9, Mar (Virtual), Apr 3
                      </p>
                    </div>
                  </div>

                  <div className="text-[11px] text-[var(--text-muted)] pt-1">
                    <strong>Mentor Requirements:</strong> Current UCLA Anderson MBA Student • Attend Fall Training Session • Attend Mentor Lunches.
                  </div>
                </div>

                {/* Actions & Links */}
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-[var(--border-color)]">
                  <div className="text-[12px] text-[var(--text-muted)] space-y-0.5">
                    <p>
                      More info:{' '}
                      <a
                        href="mailto:riordan.programs@anderson.ucla.edu"
                        className="text-[#2774AE] hover:underline font-medium"
                      >
                        riordan.programs@anderson.ucla.edu
                      </a>
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <a
                      href="https://ucla.tfaforms.net/996"
                      target="_blank"
                      rel="noreferrer"
                      className="editorial-btn inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#2774AE] text-white hover:bg-[#1e5c8a] font-bold text-[12px] shadow-sm transition-colors cursor-pointer text-center"
                    >
                      <span>Apply for Riordan Mentorship</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </article>
          </div>

          {/* Second Section: B-Global 🌍 - International Students */}
          <div id="b-global-section">
            <SectionHeader title="B-Global 🌍 - International Students" />

            <article className="rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] overflow-hidden shadow-sm flex flex-col">
              {/* Header Badge */}
              <div className="p-5 sm:p-6 pb-4 border-b border-[var(--border-color)] bg-[var(--bg-raised)]/60">
                <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-bold tracking-[0.08em] uppercase bg-[#2774AE] text-white">
                      <Globe className="w-3.5 h-3.5" />
                      <span>Career Workshops</span>
                    </span>
                    <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-bold tracking-[0.08em] uppercase bg-[#6377FF]/15 text-[#6377FF] border border-[#6377FF]/30">
                      International Students Only
                    </span>
                  </div>

                  {/* Urgent deadline badge */}
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-[#FF7083]/15 text-[#FF7083] border border-[#FF7083]/30 text-[11px] font-bold uppercase tracking-wider">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Reg Closes: Sep 17, 5:00 PM</span>
                  </span>
                </div>

                <h3 className="font-editorial-serif font-bold text-[20px] sm:text-[22px] text-[var(--text-primary)] leading-tight mt-2">
                  International Students Only: Mock Networking Reception (PIER)
                </h3>
                <p className="text-[13px] font-medium text-[#2774AE] mt-0.5">
                  UCLA Anderson Parker Career Management Center
                </p>
              </div>

              {/* Event Details */}
              <div className="p-5 sm:p-6 space-y-4">
                <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed">
                  Join the Parker Career Management Center for an interactive mock networking reception specifically curated for international students (PIER). Practice building connections, making conversation in networking environments, and refining your elevator pitch with peers and advisors.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                  {/* Date & Time */}
                  <div className="p-3.5 rounded-lg bg-[var(--bg-raised)] border border-[var(--border-color)] flex items-start gap-3">
                    <Clock className="w-4 h-4 text-[#2774AE] mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                        Date &amp; Time
                      </div>
                      <div className="text-[13px] font-bold text-[var(--text-primary)] mt-0.5">
                        Tuesday, 09/22/2026
                      </div>
                      <div className="text-[12px] text-[var(--text-secondary)]">
                        11:20 AM – 12:40 PM PDT
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="p-3.5 rounded-lg bg-[var(--bg-raised)] border border-[var(--border-color)] flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-[#F4B942] mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                        Location
                      </div>
                      <div className="text-[13px] font-bold text-[var(--text-primary)] mt-0.5">
                        Grand Salon, 5th Floor
                      </div>
                      <div className="text-[12px] text-[var(--text-secondary)]">
                        Marion Anderson Hall (Building G)
                      </div>
                    </div>
                  </div>
                </div>

                {/* Registration Window Box */}
                <div className="p-3.5 rounded-lg bg-[#FFD100]/10 border border-[#FFD100]/30 flex items-center justify-between flex-wrap gap-3">
                  <div className="space-y-0.5">
                    <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#003B5C] dark:text-[#FFD100] flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Registration Period</span>
                    </div>
                    <div className="text-[12px] text-[var(--text-secondary)]">
                      09/03/2026, 6:00 PM – <strong>09/17/2026, 5:00 PM PDT</strong>
                    </div>
                  </div>

                  <a
                    href="https://anderson-ucla.12twenty.com/Login"
                    target="_blank"
                    rel="noreferrer"
                    className="editorial-btn inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#003B5C] text-white hover:bg-[#2774AE] text-[12px] font-bold transition-colors cursor-pointer"
                  >
                    <span>RSVP on Parker myCareer</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </article>
          </div>
        </div>

        {/* Right: ANNOUNCEMENTS & SUSTAINABILITY (45%) */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <SectionHeader title="ANNOUNCEMENTS" />

            <div className="rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] p-6 divide-y divide-[var(--border-color)] shadow-sm">
              {ANNOUNCEMENTS.map((ann, idx) => (
                <div key={ann.id} className={`${idx === 0 ? 'pb-6' : idx === ANNOUNCEMENTS.length - 1 ? 'pt-6' : 'py-6'}`}>
                  <h3 className="font-bold text-[16px] text-[var(--text-primary)] mb-2 leading-snug">
                    {ann.headline}
                  </h3>
                  <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed mb-3">
                    {ann.body}
                  </p>

                  {/* Date Chips */}
                  {ann.dateChips.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {ann.dateChips.map((chip, cIdx) => (
                        <span
                          key={cIdx}
                          className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-[0.05em] uppercase bg-[#F4B942]/15 text-[#F4B942] border border-[#F4B942]/30"
                        >
                          {chip}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* CTA Link */}
                  {ann.ctaText && (
                    <a
                      href={ann.ctaUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#2774AE] hover:text-[#F4B942] transition-colors"
                    >
                      <span>{ann.ctaText}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* B-Green 🌿 B-sustainable — Sustainability Section */}
          <div id="b-green-section">
            <SectionHeader title="B-Green 🌿 B-sustainable " />

            <article className="rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] overflow-hidden shadow-sm flex flex-col">
              {/* Header Banner */}
              <div className="bg-gradient-to-r from-[#1B4D3E] via-[#003B5C] to-[#2774AE] text-white p-5 sm:p-6 relative">
                <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-bold tracking-[0.08em] uppercase bg-[#2ED1BA] text-[#003B5C]">
                    <Leaf className="w-3.5 h-3.5 fill-[#003B5C]" />
                    <span>Transit &amp; Eco-Commute</span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded bg-[#FFD100] text-[#003B5C] font-bold text-[11px] uppercase tracking-wider shadow-sm">
                    🎉 FREE FOR FALL QUARTER · Unlimited Rides
                  </span>
                </div>

                <h3 className="font-editorial-serif font-bold text-[21px] sm:text-[23px] text-white leading-tight">
                  Bruin Grad Pass: Unlimited LA Transit
                </h3>
                <p className="text-[13px] text-white/90 mt-1">
                  Fare-free rides across 7 transit agencies for UCLA Anderson graduate students
                </p>
              </div>

              {/* Body */}
              <div className="p-5 sm:p-6 space-y-4">
                <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed">
                  Cut your carbon footprint, skip Westwood parking fees ($16+/day), and dodge the 405 traffic! The <strong>Bruin Grad Pass</strong> provides eligible UCLA graduate students unlimited, fare-free rides on public transit systems throughout Los Angeles County — and <strong>it is completely FREE for Fall Quarter!</strong>
                </p>

                {/* Transit Agencies Grid */}
                <div className="space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#2774AE] flex items-center gap-1.5">
                    <Bus className="w-3.5 h-3.5" />
                    <span>Included Transit Networks</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[12px]">
                    <div className="p-2.5 rounded-lg bg-[var(--bg-raised)] border border-[var(--border-color)]">
                      <strong className="text-[var(--text-primary)] block">LA Metro</strong>
                      <span className="text-[var(--text-muted)] text-[11px]">
                        All Metro Bus &amp; Rail lines + Metro Micro on-demand
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[var(--bg-raised)] border border-[var(--border-color)]">
                      <strong className="text-[var(--text-primary)] block">Big Blue Bus</strong>
                      <span className="text-[var(--text-muted)] text-[11px]">
                        Lines 1, 2, 8, 17, 18 &amp; Rapid 12 directly to campus
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[var(--bg-raised)] border border-[var(--border-color)]">
                      <strong className="text-[var(--text-primary)] block">Culver CityBus</strong>
                      <span className="text-[var(--text-muted)] text-[11px]">
                        Line 6 &amp; Rapid 6 down Sepulveda to LAX area
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[var(--bg-raised)] border border-[var(--border-color)]">
                      <strong className="text-[var(--text-primary)] block">4 Regional Lines</strong>
                      <span className="text-[var(--text-muted)] text-[11px]">
                        LADOT Commuter, Long Beach, Antelope &amp; Santa Clarita
                      </span>
                    </div>
                  </div>
                </div>

                {/* How to Get It Step-by-Step */}
                <div className="p-3.5 rounded-lg bg-[#2ED1BA]/10 border border-[#2ED1BA]/30 space-y-2 text-[12px]">
                  <div className="font-bold text-[#003B5C] dark:text-[#2ED1BA] flex items-center gap-1.5 text-[13px]">
                    <span>How to Claim &amp; Activate</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-[var(--text-secondary)]">
                    <li>
                      Log in to <a href="https://bruintap.ucla.edu/" target="_blank" rel="noreferrer" className="text-[#2774AE] underline font-medium">BruinTAP</a> using your UCLA Logon ID.
                    </li>
                    <li>Complete the short one-time federally mandated Metro survey.</li>
                    <li>
                      Select <strong>Bruin Grad Pass</strong> and load it digitally onto your smartphone's Apple Wallet / Google Wallet via the TAP app (or opt for a physical card at CTO).
                    </li>
                    <li>Re-order quarterly to keep active (Fall Quarter is 100% FREE with $0 fee, and Summer quarter is also provided at no additional cost!).</li>
                  </ol>
                </div>

                {/* Action Links */}
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-[var(--border-color)]">
                  <div className="text-[12px] text-[var(--text-muted)]">
                    <span className="font-medium text-[#1B4D3E] dark:text-[#2ED1BA]">Special Perk: $0 for Fall Quarter</span> · $11/quarter thereafter with Summer included.
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <a
                      href="https://transportation.ucla.edu/getting-to-ucla/public-transit/bruin-grad-pass"
                      target="_blank"
                      rel="noreferrer"
                      className="editorial-btn inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#1B4D3E] hover:bg-[#143B2F] text-white text-[12px] font-bold transition-colors cursor-pointer text-center"
                    >
                      <span>Bruin Grad Pass Info</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <a
                      href="https://bruintap.ucla.edu/"
                      target="_blank"
                      rel="noreferrer"
                      className="editorial-btn inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[#2ED1BA] text-[var(--text-primary)] text-[12px] font-semibold transition-colors cursor-pointer text-center"
                    >
                      <span>BruinTAP Login</span>
                      <ExternalLink className="w-3 h-3 text-[#2ED1BA]" />
                    </a>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────
          SOCIAL & SECTION LIFE (IN CHRONOLOGICAL ORDER)
          ────────────────────────────────────────── */}
      <section id="social-section">
        <SectionHeader title="SOCIAL & SECTION LIFE" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Social 1: FRI, SEP 18 — Disney Channel Pride Karaoke Night */}
          <article className="editorial-card rounded-xl overflow-hidden bg-[var(--bg-card)] border border-[var(--border-color)] flex flex-col shadow-sm">
            <div className="h-44 w-full bg-gradient-to-tr from-[#6377FF] to-[#E978B1] flex items-center justify-center text-white relative">
              <span className="text-[52px] select-none filter drop-shadow-md">🎤</span>
              <div className="absolute top-3 left-3">
                <span className="px-2.5 py-1 rounded bg-black/40 backdrop-blur-sm text-white font-bold text-[11px] uppercase tracking-wider">
                  FRI, SEP 18 · 7:00 PM
                </span>
              </div>
              <div className="absolute top-3 right-3">
                <span className="px-2.5 py-1 rounded bg-[#2ED1BA] text-[#003B5C] font-bold text-[11px] uppercase tracking-wider shadow-sm">
                  Section D Mixer
                </span>
              </div>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#2ED1BA]/15 text-[#2ED1BA] border border-[#2ED1BA]/30">
                    Section D Mixer
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#F4B942]/15 text-[#F4B942] border border-[#F4B942]/30">
                    Pharaoh · 7:00 PM
                  </span>
                </div>
                <h3 className="font-editorial-serif font-bold text-[20px] text-[var(--text-primary)] mb-2 leading-tight">
                  Disney Channel Pride Karaoke Night 🎤
                </h3>
                <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed mb-4">
                  GPA aside — it's karaoke night and Section B is teaming up with <strong>Section D</strong>! Join us for a joint Section B &amp; Section D mixer at <strong>Pharaoh</strong> starting at <strong>7:00 PM</strong>. Disney Channel Pride edition means iconic anthems, mandatory high energy, and full-throated nostalgia with both sections.
                </p>
              </div>

              <div className="mt-2 pt-3 border-t border-[var(--border-color)] text-[12px] text-[var(--text-muted)] flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#F4B942] flex-shrink-0" />
                  <span className="font-medium text-[var(--text-secondary)]">Pharaoh · 7:00 PM</span>
                </div>
                <span className="text-[11px] font-semibold text-[#2ED1BA] bg-[#2ED1BA]/10 px-2 py-0.5 rounded border border-[#2ED1BA]/20">
                  Joint Mixer w/ Section D
                </span>
              </div>
            </div>
          </article>

          {/* Social 2: SAT, SEP 19 — Fall Quarter Kickoff Social */}
          <article className="editorial-card rounded-xl overflow-hidden bg-[var(--bg-card)] border border-[var(--border-color)] flex flex-col shadow-sm">
            <div className="h-44 w-full bg-gradient-to-tr from-[#0B1B36] to-[#F4B942]/80 flex items-center justify-center text-white relative">
              <span className="text-[52px] select-none filter drop-shadow-md">🍺 ☀️</span>
              <div className="absolute top-3 left-3">
                <span className="px-2.5 py-1 rounded bg-black/40 backdrop-blur-sm text-white font-bold text-[11px] uppercase tracking-wider">
                  SAT, SEP 19 · 12:00 PM – 4:00 PM
                </span>
              </div>
              <div className="absolute top-3 right-3">
                <span className="px-2.5 py-1 rounded bg-[#F4B942] text-[#003B5C] font-bold text-[11px] uppercase tracking-wider shadow-sm">
                  Full Class Mixer
                </span>
              </div>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#2774AE]/15 text-[#2774AE] border border-[#2774AE]/30">
                    Full Class Mixer (All Sections)
                  </span>
                </div>
                <h3 className="font-editorial-serif font-bold text-[20px] text-[var(--text-primary)] mb-2 leading-tight">
                  Fall Quarter Kickoff Social 🍺
                </h3>
                <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed mb-4">
                  The official start of fall quarter deserves a proper celebration across the entire MBA class. Section B is gathering with the full cohort at All Season Brewing for an afternoon of good company, cold drinks, and zero case discussions. This is the one to bring your energy to.
                </p>
              </div>

              <div className="mt-2 pt-3 border-t border-[var(--border-color)] text-[12px] text-[var(--text-muted)] flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#F4B942] flex-shrink-0" />
                  <span>All Season Brewing · 800 S La Brea Ave, Los Angeles, CA</span>
                </div>
                <span className="text-[11px] font-semibold text-[#2774AE] bg-[#2774AE]/10 px-2 py-0.5 rounded border border-[#2774AE]/20">
                  Full Class Event
                </span>
              </div>
            </div>
          </article>

          {/* Social 3: THU, OCT 1 — Who's Got The Tofu? */}
          <article className="editorial-card rounded-xl overflow-hidden bg-[var(--bg-card)] border border-[var(--border-color)] flex flex-col shadow-sm">
            <div className="h-44 w-full bg-gradient-to-tr from-[#0F3854] via-[#1B4D3E] to-[#E5A823]/80 flex items-center justify-center text-white relative">
              <span className="text-[52px] select-none filter drop-shadow-md">🐱 🍸</span>
              <div className="absolute top-3 left-3">
                <span className="px-2.5 py-1 rounded bg-black/40 backdrop-blur-sm text-white font-bold text-[11px] uppercase tracking-wider">
                  THU, OCT 1
                </span>
              </div>
              <div className="absolute top-3 right-3">
                <span className="px-2.5 py-1 rounded bg-[#F4B942] text-[#003B5C] font-bold text-[11px] uppercase tracking-wider shadow-sm">
                  NEW
                </span>
              </div>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-editorial-serif font-bold text-[20px] text-[var(--text-primary)] mb-2 leading-tight">
                  Who's Got The Tofu? 🐱🍸
                </h3>
                <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed mb-4">
                  Another foster cat moves on, so another going away party! Come celebrate tofu’s last night with us &amp; that fact that we don’t have friday classes. Cocktails and snacks will be provided but limited so byob if you want something specific !! Don’t worry it won’t be all tofu.
                </p>

                {/* Building Access & Buzzer Note */}
                <div className="p-3 rounded-lg bg-[var(--bg-raised)] border border-[var(--border-color)] text-[12px] text-[var(--text-secondary)] leading-relaxed space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-[var(--text-primary)] text-[11px] uppercase tracking-wider">
                    <Key className="w-3.5 h-3.5 text-[#F4B942]" />
                    <span>Building Access &amp; Directions</span>
                  </div>
                  <p>
                    Fingers crossed the buzz system will be working so when you get here, press <strong>visitor pass</strong> and use pin <strong>122427</strong>, then turn right till you hit the elevator and take it to the 3rd floor then follow signs for <strong>314</strong> !!!
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[var(--border-color)] text-[12px] text-[var(--text-muted)] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#2ED1BA] flex-shrink-0" />
                <span>Quinn's Place · Santa Monica, CA · Apt 314</span>
              </div>
            </div>
          </article>

          {/* Social 4: Vote Prompt Card */}
          <article className="rounded-xl p-6 bg-[var(--bg-raised)] border border-[var(--border-color)] flex flex-col justify-between shadow-sm">
            <div>
              <div className="w-10 h-10 rounded-lg bg-[#2774AE]/15 text-[#2774AE] flex items-center justify-center mb-4">
                <Sparkles className="w-5 h-5" />
              </div>

              <h3 className="font-editorial-serif font-bold text-[20px] text-[var(--text-primary)] mb-2.5">
                Want to plan the next social?
              </h3>

              <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed mb-6">
                Propose a social event or email Josh Dau (josh.dau.2028@anderson.ucla.edu), Section B
                Co-Social Chair. Popular proposals get added to the Vote on Socials tab where the
                section can upvote what we do next.
              </p>
            </div>

            <div className="pt-4 border-t border-[var(--border-color)]">
              <button
                id="propose-social-cta-btn"
                onClick={() => {
                  onNavigate('vote-socials');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="editorial-btn w-full py-2.5 px-4 rounded border border-[#2774AE] text-[#2774AE] hover:bg-[#2774AE]/10 font-semibold text-[13px] text-center transition-colors cursor-pointer"
              >
                Propose a social to Josh →
              </button>
            </div>
          </article>
        </div>
      </section>

      {/* ──────────────────────────────────────────
          TWO-COLUMN: CLUBS & RECRUITING + BIRTHDAYS THIS WEEK
          ────────────────────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: CLUBS & RECRUITING (60%) */}
        <div className="lg:col-span-7">
          <SectionHeader title="CLUBS & RECRUITING" />

          <div className="rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] p-6 divide-y divide-[var(--border-color)] shadow-sm">
            {/* Item 1 */}
            <div className="pb-6">
              <div className="flex items-center justify-between gap-2 mb-2">
                <h3 className="font-bold text-[16px] text-[var(--text-primary)]">
                  Case Competition Season Begins
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#F4B942]/20 text-[#F4B942]">
                  SEP 21 & SEP 23
                </span>
              </div>
              <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed mb-3">
                Marc Cosentino's two-part workshop series is your on-ramp to case competition season.
                The first session covers competition structure and strategy. The second gets into
                case construction. Both are on myCareer — register now before spots fill.
              </p>
              <a
                href="https://anderson-ucla.12twenty.com/"
                target="_blank"
                rel="noreferrer"
                className="text-[13px] font-semibold text-[#2774AE] hover:text-[#F4B942] transition-colors inline-flex items-center gap-1"
              >
                <span>Register on myCareer</span>
                <span>→</span>
              </a>
            </div>

            {/* Item 2 */}
            <div className="pt-6">
              <h3 className="font-bold text-[16px] text-[var(--text-primary)] mb-2">
                Employer Events — Updated Weekly on myCareer
              </h3>
              <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed mb-3">
                Coffee chats, info sessions, company presentations, and more are being added to
                myCareer regularly. This is your recruiting command center — check it at least twice
                a week during fall quarter.
              </p>
              <a
                href="https://anderson-ucla.12twenty.com/"
                target="_blank"
                rel="noreferrer"
                className="text-[13px] font-semibold text-[#2774AE] hover:text-[#F4B942] transition-colors inline-flex items-center gap-1"
              >
                <span>Open myCareer</span>
                <span>→</span>
              </a>
            </div>
          </div>
        </div>

        {/* Right: B-Days 🎂 · September (40%) */}
        <div className="lg:col-span-5" id="birthdays-section">
          <SectionHeader title="B-Days 🎂 · September" subtitle="Celebrating Section B birthdays" />

          <div className="rounded-xl p-5 sm:p-6 border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#F4B942]/15 border border-[#F4B942]/30 flex items-center justify-center text-[16px] select-none" aria-hidden="true">
                  🎂
                </div>
                <div>
                  <h3 className="font-bold text-[15px] text-[var(--text-primary)]">
                    September Celebrations
                  </h3>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    UCLA Anderson MBA Class of 2028
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#F4B942]/15 text-[#F4B942] border border-[#F4B942]/30">
                4 B-Days
              </span>
            </div>

            {/* Birthday Cards List */}
            <div className="space-y-2.5">
              {SEPTEMBER_BIRTHDAYS.map((bday) => (
                <div
                  key={bday.id}
                  className="flex items-center justify-between p-3 sm:p-3.5 rounded-xl bg-[var(--bg-raised)] border border-[var(--border-color)] hover:border-[#F4B942]/50 hover:bg-[#F4B942]/[0.02] transition-all group shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-lg bg-[#0B1B36] border border-[#F4B942]/40 flex flex-col items-center justify-center text-center shadow-xs flex-shrink-0">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-[#F4B942] leading-none">
                        SEP
                      </span>
                      <span className="text-[15px] font-black text-white leading-none mt-0.5 font-editorial-sans">
                        {bday.day}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-[14px] sm:text-[15px] text-[var(--text-primary)] group-hover:text-[#2774AE] transition-colors">
                        {bday.name}
                      </h4>
                      <p className="text-[11.5px] text-[var(--text-muted)]">
                        {bday.dateStr}
                      </p>
                    </div>
                  </div>

                  <span className="text-[18px] opacity-80 group-hover:scale-125 transition-transform select-none" aria-hidden="true">
                    🎉
                  </span>
                </div>
              ))}
            </div>

            {/* Celebratory footer note */}
            <div className="pt-3 border-t border-[var(--border-color)] flex items-center justify-between flex-wrap gap-2 text-[12px] text-[var(--text-muted)]">
              <span className="italic">
                Wish them a happy birthday when you see them in class! 🥳
              </span>
              <button
                onClick={() => {
                  onNavigate('submit');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="text-[11px] font-bold text-[#2774AE] hover:text-[#F4B942] hover:underline cursor-pointer transition-colors"
              >
                + Submit Birthday
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────
          RIORDAN PROGRAMS FLYER LIGHTBOX MODAL
          ────────────────────────────────────────── */}
      {isFlyerModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
          onClick={() => setIsFlyerModalOpen(false)}
        >
          <div
            className="relative max-w-2xl w-full bg-[var(--bg-card)] rounded-2xl overflow-hidden shadow-2xl border border-[var(--border-color)] flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Top Bar */}
            <div className="p-4 px-6 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--bg-raised)]">
              <div>
                <h3 className="font-bold text-[16px] text-[var(--text-primary)]">
                  The Riordan Programs Mentorship Flyer
                </h3>
                <p className="text-[12px] text-[var(--text-muted)]">
                  UCLA Anderson School of Management · Mentorship Initiative
                </p>
              </div>
              <button
                onClick={() => setIsFlyerModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[var(--bg-card)] border border-[var(--border-color)] hover:bg-[var(--bg-raised)] flex items-center justify-center text-[var(--text-secondary)] cursor-pointer"
                title="Close flyer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Flyer Image */}
            <div className="overflow-y-auto p-4 flex justify-center bg-zinc-950/20">
              <img
                src={riordanFlyerImg}
                alt="The Riordan Programs Full Flyer"
                className="max-h-[70vh] w-auto object-contain rounded-lg shadow-md"
              />
            </div>

            {/* Modal Bottom Bar */}
            <div className="p-4 px-6 border-t border-[var(--border-color)] flex items-center justify-between flex-wrap gap-3 bg-[var(--bg-raised)]">
              <div className="text-[12px] text-[var(--text-secondary)]">
                Deadline to Apply: <strong>October 16, 2026</strong>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href="https://ucla.tfaforms.net/996"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#2774AE] hover:bg-[#1e5c8a] text-white text-[12px] font-bold transition-colors cursor-pointer"
                >
                  <span>Open Application Form</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={() => setIsFlyerModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] hover:bg-[var(--bg-raised)] text-[12px] font-semibold text-[var(--text-primary)] cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
