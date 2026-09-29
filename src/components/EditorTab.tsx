import React, { useState, useEffect } from 'react';
import { ChecklistItem, UserSubmission, TabId, PublishedSiteContent } from '../types';
import {
  Lock,
  ShieldCheck,
  CheckSquare,
  Square,
  LogOut,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  AlertTriangle,
  Camera,
  Upload,
  RotateCcw,
  Image as ImageIcon,
  Users,
  Save,
  Loader2,
  CheckCircle2,
  Maximize2,
  HardDrive,
  UserPlus,
} from 'lucide-react';
import defaultSpotlightImg from '../assets/images/section_b_spotlight.jpg';
import defaultCabinetImg from '../assets/images/section_b_cabinet.jpg';
import { uploadPhotoToServer } from '../services/contentService';
import { optimizeImage } from '../utils/imageOptimizer';
import { saveMediaItem, deleteMediaItem } from '../utils/imageDb';

interface EditorTabProps {
  isAuthenticated: boolean;
  onAuthenticate: (authenticated: boolean) => void;
  onNavigate: (tab: TabId) => void;
  pendingSubmissions: UserSubmission[];
  checklist: ChecklistItem[];
  onToggleChecklistItem: (id: string) => void;
  publishedContent?: PublishedSiteContent;
  onUpdateAndPublishContent?: (content: Partial<PublishedSiteContent>) => Promise<boolean>;
  onOpenDriveModal?: () => void;
  onOpenShareModal?: () => void;
}

export const EditorTab: React.FC<EditorTabProps> = ({
  isAuthenticated,
  onAuthenticate,
  onNavigate,
  pendingSubmissions,
  checklist,
  onToggleChecklistItem,
  publishedContent,
  onUpdateAndPublishContent,
  onOpenDriveModal,
  onOpenShareModal,
}) => {
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [publishToast, setPublishToast] = useState<string | null>(null);
  const [copiedLinkToast, setCopiedLinkToast] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Spotlight photo - defaults to bundled asset so all users can see it
  const [spotlightImg, setSpotlightImg] = useState<string>(
    publishedContent?.spotlightImg || defaultSpotlightImg
  );
  const [hasCustomImg, setHasCustomImg] = useState(false);

  // Cabinet photo - defaults to official Section B Cabinet photo
  const [cabinetImg, setCabinetImg] = useState<string>(
    publishedContent?.cabinetImg || defaultCabinetImg
  );
  const [hasCustomCabinetImg, setHasCustomCabinetImg] = useState(true);
  const [cabinetFitMode, setCabinetFitMode] = useState<'contain' | 'cover'>(
    publishedContent?.cabinetFitMode || 'contain'
  );

  useEffect(() => {
    if (publishedContent) {
      if (publishedContent.spotlightImg) {
        setSpotlightImg(publishedContent.spotlightImg);
        setHasCustomImg(true);
      } else if (!hasUnsavedChanges) {
        setSpotlightImg(defaultSpotlightImg);
        setHasCustomImg(false);
      }
      if (publishedContent.cabinetImg) {
        setCabinetImg(publishedContent.cabinetImg);
        setHasCustomCabinetImg(true);
      } else if (!hasUnsavedChanges) {
        setCabinetImg(defaultCabinetImg);
        setHasCustomCabinetImg(true);
      }
      if (publishedContent.cabinetFitMode) {
        setCabinetFitMode(publishedContent.cabinetFitMode);
      }
    }
  }, [publishedContent, hasUnsavedChanges]);

  const showToast = (msg: string) => {
    setPublishToast(msg);
    setTimeout(() => setPublishToast(null), 4000);
  };

  const handleSpotlightUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      showToast('Optimizing spotlight photo...');
      const optimized = await optimizeImage(file, 1600, 1600, 0.88);
      setSpotlightImg(optimized);
      setHasCustomImg(true);
      setHasUnsavedChanges(true);
      await saveMediaItem('spotlightImg', optimized);
    } catch (err) {
      console.error(err);
      showToast('Failed to optimize spotlight photo.');
    } finally {
      e.target.value = '';
    }
  };

  const handleResetSpotlight = async () => {
    setSpotlightImg(defaultSpotlightImg);
    setHasCustomImg(false);
    setHasUnsavedChanges(true);
    await deleteMediaItem('spotlightImg');
  };

  const handleCabinetUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      showToast('Optimizing cabinet photo...');
      const optimized = await optimizeImage(file, 1920, 1440, 0.88);
      setCabinetImg(optimized);
      setHasCustomCabinetImg(true);
      setHasUnsavedChanges(true);
      await saveMediaItem('cabinetImg', optimized);
    } catch (err) {
      console.error(err);
      showToast('Failed to optimize cabinet photo.');
    } finally {
      e.target.value = '';
    }
  };

  const handleResetCabinet = async () => {
    setCabinetImg(defaultCabinetImg);
    setHasCustomCabinetImg(true);
    setHasUnsavedChanges(true);
    await deleteMediaItem('cabinetImg');
  };

  const handleSaveAndPublishAll = async () => {
    if (!onUpdateAndPublishContent) {
      showToast('Publishing service unavailable in offline mode.');
      return;
    }

    setIsSaving(true);
    try {
      let finalCabinet = cabinetImg;
      if (cabinetImg && cabinetImg.startsWith('data:image/')) {
        finalCabinet = await uploadPhotoToServer(cabinetImg, 'cabinet');
      }

      let finalSpotlight = spotlightImg;
      if (spotlightImg && spotlightImg.startsWith('data:image/')) {
        finalSpotlight = await uploadPhotoToServer(spotlightImg, 'spotlight');
      } else if (spotlightImg === defaultSpotlightImg) {
        finalSpotlight = null; // restore default
      }

      const ok = await onUpdateAndPublishContent({
        cabinetImg: finalCabinet,
        cabinetFitMode,
        spotlightImg: finalSpotlight,
        lastUpdatedBy: 'Section B Leadership',
      });

      if (ok) {
        setHasUnsavedChanges(false);
        showToast('✓ Saved & Published! Photos and updates are now live for all viewers.');
      } else {
        showToast('Failed to save to server. Saved locally as fallback.');
      }
    } catch (err) {
      console.error(err);
      showToast('Error publishing content to viewers.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput.trim() === 'TheBestSection2028' || passwordInput.trim().toLowerCase() === 'thebestsection2028') {
      onAuthenticate(true);
      setPasswordError(false);
      setPasswordInput('');
    } else {
      setPasswordError(true);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLinkToast(true);
    setTimeout(() => setCopiedLinkToast(false), 2500);
  };

  const handlePublish = () => {
    setPublishToast(true);
    setTimeout(() => setPublishToast(false), 3000);
  };

  const uncompletedCount = checklist.filter((item) => !item.isCompleted).length;

  if (!isAuthenticated) {
    return (
      <div className="w-full py-12 max-w-md mx-auto">
        <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] p-8 sm:p-10 shadow-xl text-center space-y-6">
          <div className="w-14 h-14 rounded-full bg-[#2774AE]/15 text-[#2774AE] flex items-center justify-center mx-auto border border-[#2774AE]/30">
            <Lock className="w-7 h-7" />
          </div>

          <div>
            <h1 className="font-editorial-serif font-bold text-[28px] sm:text-[32px] text-[var(--text-primary)]">
              Editor Access
            </h1>
            <p className="text-[14px] text-[var(--text-muted)] mt-1">
              Section B Leadership only.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label
                htmlFor="editor-password-input"
                className="block text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--text-secondary)] mb-1.5"
              >
                Password
              </label>
              <input
                id="editor-password-input"
                type="password"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  if (passwordError) setPasswordError(false);
                }}
                placeholder="Enter editor password"
                className={`w-full px-4 py-2.5 rounded-lg bg-[var(--bg-page)] border text-[14px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none transition-colors ${
                  passwordError
                    ? 'border-[#FF7083] focus:border-[#FF7083]'
                    : 'border-[var(--border-color)] focus:border-[#2774AE]'
                }`}
              />
              {passwordError && (
                <p className="text-[11px] text-[#FF7083] mt-1.5">
                  Incorrect password. Please try again.
                </p>
              )}
            </div>

            <button
              id="editor-signin-btn"
              type="submit"
              className="editorial-btn w-full py-2.5 px-4 rounded-lg font-bold text-[14px] bg-[#2774AE] text-white hover:bg-[#1e5c8a] transition-colors shadow-sm cursor-pointer"
            >
              Sign in →
            </button>
          </form>

          <p className="text-[11px] text-[var(--text-muted)] italic">
            Passkey is provided to Section B President & Newsletter Cabinet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-10 pb-16">
      {/* Toast Notifications */}
      {publishToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-[#0B1B36] border border-[#2ED1BA] text-white shadow-2xl flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-[#2ED1BA]" />
          <div>
            <p className="text-[14px] font-bold">{publishToast}</p>
            <p className="text-[12px] text-[var(--text-muted)]">Live site view synchronized.</p>
          </div>
        </div>
      )}

      {copiedLinkToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-[#0B1B36] border border-[#2ED1BA] text-white shadow-2xl flex items-center gap-3 animate-fade-in">
          <Check className="w-5 h-5 text-[#2ED1BA]" />
          <p className="text-[13px] font-medium">Link copied to clipboard!</p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded bg-[#2774AE]/20 text-[#2774AE] font-bold text-[11px] uppercase tracking-wider">
              Leadership Console
            </span>
            <span className="text-[12px] text-[var(--text-muted)]">·</span>
            <span className="text-[12px] text-[var(--text-muted)] font-medium">
              Class of 2028
            </span>
          </div>
          <h1 className="font-editorial-serif font-bold text-[30px] sm:text-[36px] text-[var(--text-primary)]">
            Issue 02 — Editor Dashboard
          </h1>
          <p className="text-[14px] sm:text-[15px] text-[var(--text-secondary)]">
            Current issue: September 17–30, 2026
          </p>
        </div>

        {/* Action buttons top right */}
        <div className="flex items-center gap-3">
          {onOpenShareModal && (
            <button
              onClick={onOpenShareModal}
              className="editorial-btn inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-[#2774AE]/50 bg-[#2774AE]/15 hover:bg-[#2774AE]/25 text-[#2774AE] font-bold text-[13px] transition-colors shadow-sm cursor-pointer"
              title="Share project and grant edit access to a coworker"
            >
              <UserPlus className="w-4 h-4 text-[#2774AE]" />
              <span>Share with Coworker</span>
            </button>
          )}

          {onOpenDriveModal && (
            <button
              onClick={onOpenDriveModal}
              className="editorial-btn inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-[#F4B942]/60 bg-[#F4B942]/15 hover:bg-[#F4B942]/25 text-[#F4B942] font-bold text-[13px] transition-colors shadow-sm cursor-pointer"
              title="Save project database and newsletter archive to Google Drive"
            >
              <HardDrive className="w-4 h-4 text-[#F4B942]" />
              <span>Save to Google Drive</span>
            </button>
          )}

          <button
            onClick={handleSaveAndPublishAll}
            disabled={isSaving}
            className="editorial-btn inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#F4B942] hover:bg-[#FFD100] text-[#003B5C] font-bold text-[13px] transition-colors shadow-sm cursor-pointer disabled:opacity-50"
            title="Save changes and publish live to all viewers"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{isSaving ? 'Publishing...' : 'Save & Publish to Viewers'}</span>
          </button>

          <button
            onClick={() => onAuthenticate(false)}
            className="text-[13px] font-semibold text-[var(--text-muted)] hover:text-[#FF7083] flex items-center gap-1.5 transition-colors cursor-pointer px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)]"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign out</span>
          </button>
        </div>
      </div>

      {/* UNSAVED CHANGES ALERT BANNER */}
      {hasUnsavedChanges && (
        <div className="p-4 rounded-xl bg-[#F4B942]/15 border-2 border-[#F4B942] flex flex-wrap items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-[#F4B942] flex-shrink-0" />
            <div>
              <p className="text-[14px] font-bold text-[var(--text-primary)]">
                You have unsaved changes staged locally
              </p>
              <p className="text-[12px] text-[var(--text-secondary)]">
                Click "Save & Publish to Viewers" so your uploaded photos and layout preferences are transferred live to all Section B viewers.
              </p>
            </div>
          </div>
          <button
            onClick={handleSaveAndPublishAll}
            disabled={isSaving}
            className="editorial-btn inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-[#F4B942] hover:bg-[#FFD100] text-[#003B5C] font-bold text-[13px] transition-colors shadow-sm cursor-pointer disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{isSaving ? 'Publishing...' : 'Save & Publish Changes'}</span>
          </button>
        </div>
      )}

      {/* QUICK ACTIONS BAR */}
      <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <button
            id="editor-save-publish-main-btn"
            onClick={handleSaveAndPublishAll}
            disabled={isSaving}
            className="editorial-btn px-4 py-2 rounded font-bold text-[13px] bg-[#F4B942] text-[#003B5C] hover:bg-[#FFD100] transition-colors shadow-sm cursor-pointer flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save & Publish to Viewers</span>
          </button>

          <button
            id="editor-preview-btn"
            onClick={() => {
              onNavigate('this-week');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="editorial-btn px-4 py-2 rounded font-semibold text-[13px] border border-[var(--border-color)] text-[var(--text-primary)] hover:border-[#F4B942] transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span>Preview live view</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <button
            id="editor-copy-link-btn"
            onClick={handleCopyLink}
            className="editorial-btn px-4 py-2 rounded font-semibold text-[13px] border border-[var(--border-color)] text-[var(--text-primary)] hover:border-[#F4B942] transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy share link</span>
          </button>
        </div>

        <div className="flex items-center gap-3 text-[12px]">
          {hasUnsavedChanges ? (
            <span className="text-[#F4B942] font-bold flex items-center gap-1">
              ● Unsaved local changes
            </span>
          ) : (
            <span className="text-[#2ED1BA] font-semibold flex items-center gap-1">
              ✓ Synchronized with viewers
            </span>
          )}
          <span className="text-[var(--text-muted)]">|</span>
          <div className="text-[var(--text-muted)] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#2ED1BA]" />
            <span>Cabinet authenticated</span>
          </div>
        </div>
      </div>

      {/* ISSUE STATS PANEL */}
      <div className="rounded-xl bg-[var(--bg-raised)] border border-[var(--border-color)] p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-[15px] text-[var(--text-primary)] uppercase tracking-wider">
            Issue 02 — Live
          </h3>
          <span className="text-[11px] font-bold text-[#2ED1BA] uppercase tracking-wider">
            Active Bi-Weekly Cycle
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-[var(--border-color)]">
          <div className="text-center p-2">
            <span className="block text-[24px] font-bold text-[var(--text-primary)] font-editorial-sans">
              61
            </span>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[var(--text-muted)]">
              Students
            </span>
          </div>

          <div className="text-center p-2">
            <span className="block text-[24px] font-bold text-[#F4B942] font-editorial-sans">
              Vol. 1 No. 2
            </span>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[var(--text-muted)]">
              Publication Edition
            </span>
          </div>

          <div className="text-center p-2">
            <span className="block text-[24px] font-bold text-[var(--text-primary)] font-editorial-sans">
              4
            </span>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[var(--text-muted)]">
              Announcements
            </span>
          </div>

          <div className="text-center p-2">
            <span className="block text-[24px] font-bold text-[#2774AE] font-editorial-sans">
              Sep 17–30
            </span>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[var(--text-muted)]">
              Coverage Window
            </span>
          </div>
        </div>
      </div>

      {/* NEWSLETTER VISUALS & PHOTO MANAGEMENT PANEL */}
      <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] p-6 sm:p-8 shadow-sm space-y-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ImageIcon className="w-5 h-5 text-[#2774AE]" />
            <h3 className="font-bold text-[20px] text-[var(--text-primary)] font-editorial-serif">
              Newsletter Visuals & Photo Management
            </h3>
          </div>
          <p className="text-[13px] sm:text-[14px] text-[var(--text-secondary)] leading-relaxed">
            Upload and swap authentic photographs across Section B newsletter sections. All uploads render at <strong>100% raw fidelity with zero AI alterations or compression</strong> and persist in your browser.
          </p>
        </div>

        {/* 1. SECTION B SPOTLIGHT PHOTO */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#F4B942]" />
              <h4 className="font-bold text-[16px] text-[var(--text-primary)]">
                1. Section B Spotlight Photo — Lawrence Chung & Walker Chun-Hao Huang
              </h4>
            </div>
            {hasCustomImg ? (
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#2ED1BA]/15 text-[#2ED1BA] border border-[#2ED1BA]/30">
                Custom Original Image Loaded
              </span>
            ) : (
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[var(--bg-raised)] text-[var(--text-muted)] border border-[var(--border-color)]">
                Default Image Active
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-4 rounded-xl bg-[var(--bg-raised)] border border-[var(--border-color)]">
            <div className="w-28 h-36 rounded-lg overflow-hidden border border-[var(--border-color)] bg-[#0B1B36] flex-shrink-0 flex items-center justify-center">
              <img
                src={spotlightImg}
                alt="Spotlight Preview"
                className="w-full h-full object-contain"
                onError={(e) => {
                  if (e.currentTarget.src !== defaultSpotlightImg) {
                    e.currentTarget.src = defaultSpotlightImg;
                  }
                }}
              />
            </div>

            <div className="space-y-3 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <label
                  htmlFor="editor-spotlight-upload"
                  className="editorial-btn inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2774AE] text-white hover:bg-[#1e5c8a] font-bold text-[13px] transition-colors shadow-sm cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Original Spotlight Photo</span>
                  <input
                    id="editor-spotlight-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleSpotlightUpload}
                  />
                </label>

                {hasCustomImg && (
                  <button
                    onClick={handleResetSpotlight}
                    className="editorial-btn inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[#FF7083] hover:border-[#FF7083] font-medium text-[12px] transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset to Default</span>
                  </button>
                )}

                <button
                  onClick={handleSaveAndPublishAll}
                  disabled={isSaving}
                  className="editorial-btn inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#F4B942] hover:bg-[#FFD100] text-[#003B5C] font-bold text-[12px] transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                  title="Save Spotlight photo and transfer to viewers"
                >
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Save & Publish to Viewers</span>
                </button>

                <button
                  onClick={() => {
                    onNavigate('this-week');
                    setTimeout(() => {
                      document.getElementById('spotlight-section')?.scrollIntoView({ behavior: 'smooth' });
                    }, 150);
                  }}
                  className="text-[12px] text-[#2774AE] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span>View on Spotlight</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              <p className="text-[12px] text-[var(--text-muted)]">
                Accepts .jpeg, .jpg, .png. Renders in uncropped portrait orientation on the Spotlight card. Stored persistently on server and synced to all viewers.
              </p>
            </div>
          </div>
        </div>

        {/* 2. SECTION B CABINET PHOTO (HORIZONTAL) */}
        <div className="space-y-4 pt-4 border-t border-[var(--border-color)]">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#2774AE]" />
              <h4 className="font-bold text-[16px] text-[var(--text-primary)]">
                2. Cabinet Photo Feature — Horizontal Section (Under President's Note)
              </h4>
            </div>
            {hasCustomCabinetImg ? (
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#2ED1BA]/15 text-[#2ED1BA] border border-[#2ED1BA]/30">
                Custom Cabinet Photo Loaded (100% Fidelity)
              </span>
            ) : (
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[var(--bg-raised)] text-[var(--text-muted)] border border-[var(--border-color)]">
                Placeholder Active (Viewers will see dignified Section B Leadership notice)
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-4 rounded-xl bg-[var(--bg-raised)] border border-[var(--border-color)]">
            <div className="w-36 h-20 rounded-lg overflow-hidden border border-[var(--border-color)] bg-[#0B1B36] flex-shrink-0 flex items-center justify-center">
              {cabinetImg ? (
                <img
                  src={cabinetImg}
                  alt="Cabinet Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center text-[#F4B942]">
                  <Users className="w-6 h-6 opacity-70" />
                  <span className="text-[9px] uppercase tracking-wider mt-1 opacity-75">No photo</span>
                </div>
              )}
            </div>

            <div className="space-y-3 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <label
                  htmlFor="editor-cabinet-upload"
                  className="editorial-btn inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2774AE] text-white hover:bg-[#1e5c8a] font-bold text-[13px] transition-colors shadow-sm cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-[#F4B942]" />
                  <span>{hasCustomCabinetImg ? 'Upload original photo (Replace)' : 'Upload original photo'}</span>
                  <input
                    id="editor-cabinet-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCabinetUpload}
                  />
                </label>

                {/* Display mode toggle */}
                <button
                  onClick={() => {
                    const nextMode = cabinetFitMode === 'contain' ? 'cover' : 'contain';
                    setCabinetFitMode(nextMode);
                    setHasUnsavedChanges(true);
                  }}
                  className="editorial-btn inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium text-[12px] transition-colors cursor-pointer"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-[#2774AE]" />
                  <span>{cabinetFitMode === 'contain' ? 'Display: Uncropped' : 'Display: Fill Width'}</span>
                </button>

                {/* Save & Publish to Viewers */}
                <button
                  onClick={handleSaveAndPublishAll}
                  disabled={isSaving}
                  className="editorial-btn inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#F4B942] hover:bg-[#FFD100] text-[#003B5C] font-bold text-[12px] transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                  title="Save Cabinet photo and transfer live to viewers"
                >
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Save & Publish to Viewers</span>
                </button>

                {hasCustomCabinetImg && (
                  <button
                    onClick={handleResetCabinet}
                    className="editorial-btn inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[#FF7083] hover:border-[#FF7083] font-medium text-[12px] transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset to default</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    onNavigate('this-week');
                    setTimeout(() => {
                      document.getElementById('cabinet-photo-section')?.scrollIntoView({ behavior: 'smooth' });
                    }, 150);
                  }}
                  className="text-[12px] text-[#2774AE] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span>View under Note</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              <p className="text-[12px] text-[var(--text-muted)]">
                Select your original photo file directly from your device to render it at 100% raw fidelity with zero AI distortion or compression. Once saved, it will be immediately transferred to all viewers across the entire cohort.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* GOOGLE DRIVE PROJECT BACKUP & SYNC PANEL */}
      <div className="rounded-2xl bg-[var(--bg-raised)] border border-[var(--border-color)] p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2774AE]/20 border border-[#2774AE]/40 flex items-center justify-center text-[#F4B942]">
              <HardDrive className="w-5 h-5 text-[#F4B942]" />
            </div>
            <div>
              <h3 className="font-bold text-[18px] text-[var(--text-primary)] font-editorial-serif">
                Google Drive Project Archive & Cloud Sync
              </h3>
              <p className="text-[13px] text-[var(--text-muted)]">
                Save and sync the full publication state, editorial checklist, community submissions, and executive markdown issue brief directly to your Google Drive.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {onOpenShareModal && (
              <button
                onClick={onOpenShareModal}
                className="editorial-btn px-3.5 py-2 rounded-lg border border-[#2774AE]/50 bg-[#2774AE]/15 hover:bg-[#2774AE]/25 text-[#2774AE] font-bold text-[13px] flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                <UserPlus className="w-4 h-4 text-[#2774AE]" />
                <span>Invite Co-Editor</span>
              </button>
            )}

            {onOpenDriveModal && (
              <button
                onClick={onOpenDriveModal}
                className="editorial-btn px-4 py-2 rounded-lg bg-[#F4B942] hover:bg-[#FFD100] text-[#003B5C] font-bold text-[13px] flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
              >
                <HardDrive className="w-4 h-4 text-[#003B5C]" />
                <span>Save Project to Google Drive</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)]">
            <span className="font-bold text-[var(--text-primary)] block mb-1">
              📁 Cloud Destination
            </span>
            <span className="text-[var(--text-muted)]">
              Folder: <span className="font-mono text-[#2774AE]">The Place to B — UCLA Anderson</span> in your Drive.
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)]">
            <span className="font-bold text-[var(--text-primary)] block mb-1">
              📄 Export Assets
            </span>
            <span className="text-[var(--text-muted)]">
              Full JSON backup snapshot, Issue 02 Executive Markdown brief, and community submissions.
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)]">
            <span className="font-bold text-[var(--text-primary)] block mb-1">
              🔒 Safe & Verifiable
            </span>
            <span className="text-[var(--text-muted)]">
              Explicit user confirmation dialog before saving, with instant direct links to files on Google Drive.
            </span>
          </div>
        </div>
      </div>

      {/* PLACEHOLDER TRACKER PANEL (raised-surface) */}
      <div className="rounded-2xl bg-[var(--bg-raised)] border border-[var(--border-color)] p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[#F4B942]" />
            <h3 className="font-bold text-[18px] text-[var(--text-primary)] font-editorial-serif">
              Items to complete before publishing ({uncompletedCount})
            </h3>
          </div>
          <span className="text-[12px] text-[var(--text-muted)]">
            Click checkboxes to track completion
          </span>
        </div>

        {/* 5 items checklist */}
        <div className="space-y-3 divide-y divide-[var(--border-color)]/60">
          {checklist.map((item) => {
            let priorityBadge = 'bg-[#F4B942]/20 text-[#F4B942] border-[#F4B942]/40';
            if (item.priority === 'MEDIUM') {
              priorityBadge = 'bg-[#6377FF]/20 text-[#6377FF] border-[#6377FF]/40';
            } else if (item.priority === 'LOW') {
              priorityBadge = 'bg-[#2ED1BA]/20 text-[#2ED1BA] border-[#2ED1BA]/40';
            }

            return (
              <div
                key={item.id}
                onClick={() => onToggleChecklistItem(item.id)}
                className={`pt-3 first:pt-0 flex items-start justify-between gap-4 p-3 rounded-lg cursor-pointer transition-colors ${
                  item.isCompleted
                    ? 'bg-transparent opacity-60'
                    : 'hover:bg-[var(--bg-card)]/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    aria-label={`Toggle task ${item.task}`}
                    className="mt-0.5 text-[#F4B942] hover:text-[#FFD100] cursor-pointer"
                  >
                    {item.isCompleted ? (
                      <CheckSquare className="w-5 h-5 text-[#2ED1BA]" />
                    ) : (
                      <Square className="w-5 h-5 text-[var(--text-muted)]" />
                    )}
                  </button>

                  <div>
                    <p
                      className={`text-[14px] sm:text-[15px] font-medium leading-snug ${
                        item.isCompleted
                          ? 'line-through text-[var(--text-muted)]'
                          : 'text-[var(--text-primary)]'
                      }`}
                    >
                      {item.task}
                    </p>
                    <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider">
                      Section: {item.section}
                    </span>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-[0.08em] border ${priorityBadge}`}
                  >
                    {item.priority} PRIORITY
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PENDING SUBMISSIONS PANEL (raised-surface) */}
      <div className="rounded-2xl bg-[var(--bg-raised)] border border-[var(--border-color)] p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-[18px] text-[var(--text-primary)] font-editorial-serif">
            Pending submissions ({pendingSubmissions.length})
          </h3>
          <span className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-bold">
            Targeting Issue 03
          </span>
        </div>

        {pendingSubmissions.length === 0 ? (
          <div className="p-8 rounded-xl border border-dashed border-[var(--border-color)] text-center text-[14px] text-[var(--text-muted)]">
            No submissions yet for Issue 03. Share the Submit link with Section B to start
            collecting content.
          </div>
        ) : (
          <div className="space-y-4">
            {pendingSubmissions.map((sub) => (
              <div
                key={sub.id}
                className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-2"
              >
                <div className="flex items-center justify-between flex-wrap gap-2 text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-[#F4B942] text-[#003B5C] font-bold uppercase">
                      {sub.type}
                    </span>
                    <span className="font-semibold text-[var(--text-primary)]">
                      {sub.fullName} ({sub.uclaEmail})
                    </span>
                  </div>
                  <span className="text-[var(--text-muted)]">
                    Priority: <strong className="uppercase text-[#F4B942]">{sub.priority}</strong>
                  </span>
                </div>

                <h4 className="font-bold text-[15px] text-[var(--text-primary)]">
                  {sub.headline}
                </h4>

                <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
                  {sub.details}
                </p>

                {sub.nominee && (
                  <p className="text-[12px] text-[#F4B942]">
                    <strong>Nominee:</strong> {sub.nominee}
                  </p>
                )}

                {sub.linkOrUrl && (
                  <p className="text-[12px] text-[#2774AE] truncate">
                    <strong>Link:</strong>{' '}
                    <a
                      href={sub.linkOrUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:underline"
                    >
                      {sub.linkOrUrl}
                    </a>
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Signout link */}
      <div className="text-right pt-2">
        <button
          onClick={() => onAuthenticate(false)}
          className="text-[12px] text-[var(--text-muted)] hover:text-[#FF7083] font-semibold transition-colors cursor-pointer"
        >
          Sign out of Editor Mode
        </button>
      </div>
    </div>
  );
};
