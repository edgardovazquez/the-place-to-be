import React, { useState, useEffect } from 'react';
import {
  X,
  HardDrive,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  FileJson,
  FileText,
  Folder,
  ShieldCheck,
  RefreshCw,
  LogOut,
  FolderOpen,
  UserPlus,
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  googleSignIn,
  logoutGoogle,
  saveProjectToGoogleDrive,
  findOrCreateFolder,
  listProjectFolderFiles,
  DriveFileItem,
  DriveFolder,
  ProjectSnapshot,
} from '../services/googleDriveService';
import { PublishedSiteContent, UserSubmission, ChecklistItem } from '../types';
import { KEY_DATES, ANNOUNCEMENTS } from '../data';

interface SaveToDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  publishedContent: PublishedSiteContent;
  checklist: ChecklistItem[];
  pendingSubmissions: UserSubmission[];
  onOpenShareModal?: () => void;
}

export const SaveToDriveModal: React.FC<SaveToDriveModalProps> = ({
  isOpen,
  onClose,
  publishedContent,
  checklist,
  pendingSubmissions,
  onOpenShareModal,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [status, setStatus] = useState<'idle' | 'confirming' | 'saving' | 'success' | 'error'>('idle');
  const [progressMsg, setProgressMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [savedFolder, setSavedFolder] = useState<DriveFolder | null>(null);
  const [savedFiles, setSavedFiles] = useState<{
    backupFile?: DriveFileItem;
    markdownFile?: DriveFileItem;
    submissionsFile?: DriveFileItem;
  }>({});
  const [folderFiles, setFolderFiles] = useState<DriveFileItem[]>([]);
  const [isLoadingFolder, setIsLoadingFolder] = useState(false);

  // Sync folder files when authenticated
  useEffect(() => {
    if (token && user && isOpen) {
      loadExistingDriveFolder(token);
    }
  }, [token, user, isOpen]);

  const loadExistingDriveFolder = async (accessToken: string) => {
    try {
      setIsLoadingFolder(true);
      const folder = await findOrCreateFolder('The Place to B — UCLA Anderson', accessToken);
      setSavedFolder(folder);
      const files = await listProjectFolderFiles(folder.id, accessToken);
      setFolderFiles(files);
    } catch (err: any) {
      console.warn('Could not query existing Drive files:', err);
    } finally {
      setIsLoadingFolder(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsSigningIn(true);
    setErrorMsg(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setToken(res.accessToken);
        setStatus('confirming');
        await loadExistingDriveFolder(res.accessToken);
      }
    } catch (err: any) {
      console.error('Google Sign-in failed:', err);
      setErrorMsg(err?.message || 'Failed to sign in with Google. Please check your popup permissions and try again.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleGoogleLogout = async () => {
    await logoutGoogle();
    setUser(null);
    setToken(null);
    setStatus('idle');
    setSavedFolder(null);
    setSavedFiles({});
    setFolderFiles([]);
  };

  const handleStartSaveConfirmation = () => {
    if (!token) {
      handleGoogleLogin();
    } else {
      setStatus('confirming');
      setErrorMsg(null);
    }
  };

  const executeSaveToDrive = async () => {
    if (!token || !user) {
      setStatus('error');
      setErrorMsg('No Google authorization token found. Please sign in with Google.');
      return;
    }

    setStatus('saving');
    setErrorMsg(null);

    try {
      // Gather local academic feedback if any
      let academicFeedback = [];
      try {
        const raw = localStorage.getItem('the_place_to_b_feedback');
        if (raw) academicFeedback = JSON.parse(raw);
      } catch {
        // ignore
      }

      // Gather local social proposals if any
      let socialProposals = [];
      try {
        const raw = localStorage.getItem('the_place_to_b_social_proposals');
        if (raw) socialProposals = JSON.parse(raw);
      } catch {
        // ignore
      }

      const snapshot: ProjectSnapshot = {
        projectName: 'The Place to B — UCLA Anderson Section B',
        section: 'Section B',
        school: 'UCLA Anderson School of Management',
        exportedAt: new Date().toISOString(),
        exportedBy: {
          displayName: user.displayName,
          email: user.email,
          uid: user.uid,
        },
        issueMetadata: {
          title: publishedContent.issueTitle || 'Issue 02 — September 17–30, 2026',
          volume: 'VOL. 1',
          number: 'NO. 2',
          dateRange: 'WEEK OF SEP 17 – SEP 30, 2026',
          tagline: '61 students. One section. One signal.',
        },
        publishedContent,
        checklist,
        pendingSubmissions,
        academicFeedback,
        keyDates: KEY_DATES,
        announcements: ANNOUNCEMENTS,
        socialProposals,
      };

      const result = await saveProjectToGoogleDrive(snapshot, token, (msg) => {
        setProgressMsg(msg);
      });

      setSavedFolder(result.folder);
      setSavedFiles({
        backupFile: result.backupFile,
        markdownFile: result.markdownFile,
        submissionsFile: result.submissionsFile,
      });

      // Refresh folder contents
      const files = await listProjectFolderFiles(result.folder.id, token);
      setFolderFiles(files);

      setStatus('success');
    } catch (err: any) {
      console.error('Save to Drive error:', err);
      setStatus('error');
      setErrorMsg(err?.message || 'An error occurred while saving the project to Google Drive.');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border-color)] bg-[#003B5C]/15">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2774AE]/20 border border-[#2774AE]/40 flex items-center justify-center text-[#F4B942]">
              <HardDrive className="w-5 h-5 text-[#F4B942]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--text-primary)] font-editorial-serif flex items-center gap-2">
                Save Project to Google Drive
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                The Place to B · UCLA Anderson School of Management
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--border-color)]/30 rounded-lg transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-[var(--text-primary)]">
          {/* Auth State & User Bar */}
          {user ? (
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--bg-main)]/70 border border-[var(--border-color)]">
              <div className="flex items-center gap-3">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Google User'}
                    className="w-8 h-8 rounded-full border border-[var(--border-color)]"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#2774AE] text-white flex items-center justify-center font-bold text-xs">
                    {user.email?.slice(0, 2).toUpperCase() || 'U'}
                  </div>
                )}
                <div className="leading-tight">
                  <div className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                    {user.displayName || 'Google Account Connected'}
                    <span className="inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded bg-green-500/20 text-green-400 border border-green-500/30">
                      CONNECTED
                    </span>
                  </div>
                  <div className="text-xs text-[var(--text-muted)]">{user.email}</div>
                </div>
              </div>
              <button
                onClick={handleGoogleLogout}
                className="text-xs text-[var(--text-muted)] hover:text-red-400 flex items-center gap-1 px-2 py-1 rounded hover:bg-red-500/10 transition-colors cursor-pointer"
                title="Disconnect Google Drive account"
              >
                <LogOut className="w-3.5 h-3.5" />
                Disconnect
              </button>
            </div>
          ) : (
            <div className="p-5 rounded-xl border border-dashed border-[#2774AE]/50 bg-[#2774AE]/5 flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#2774AE]/20 flex items-center justify-center text-[#2774AE]">
                <HardDrive className="w-6 h-6 text-[#2774AE]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  Connect Your Google Drive
                </h3>
                <p className="text-xs text-[var(--text-muted)] max-w-md mt-1">
                  Connect your Google Drive account with your permission to securely create, update, and back up the complete Section B project archive, newsletter editions, and editorial submissions.
                </p>
              </div>

              {/* Official Google Sign-in button */}
              <button
                onClick={handleGoogleLogin}
                disabled={isSigningIn}
                className="relative inline-flex items-center justify-center gap-3 px-5 py-2.5 bg-white text-[#3c4043] hover:bg-[#f8f9fa] border border-[#dadce0] rounded-md font-medium text-sm shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {isSigningIn ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#4285F4]" />
                    <span>Connecting to Google...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 48 48">
                      <path
                        fill="#EA4335"
                        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                      />
                      <path
                        fill="#4285F4"
                        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                      />
                      <path
                        fill="#34A853"
                        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                      />
                    </svg>
                    <span>Sign in with Google</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-red-300 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-400" />
              <div className="flex-1">
                <div className="font-semibold text-red-200">Unable to complete request</div>
                <div className="text-xs text-red-300/90 mt-0.5">{errorMsg}</div>
              </div>
            </div>
          )}

          {/* Confirmation & Snapshot Overview (Mandatory User Confirmation Dialog) */}
          {user && status !== 'saving' && status !== 'success' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#003B5C]/20 border border-[#2774AE]/30 space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-[#F4B942]">
                  <Folder className="w-4 h-4 text-[#F4B942]" />
                  <span>Target Destination in Google Drive</span>
                </div>
                <div className="text-xs text-[var(--text-muted)]">
                  Folder: <span className="font-mono text-[var(--text-primary)] font-semibold">The Place to B — UCLA Anderson</span>
                  {savedFolder?.webViewLink && (
                    <a
                      href={savedFolder.webViewLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-[#2774AE] hover:underline inline-flex items-center gap-1"
                    >
                      (View on Drive <ExternalLink className="w-3 h-3 inline" />)
                    </a>
                  )}
                </div>
              </div>

              {/* Items to be saved / updated */}
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Files to be written / synced ({3} files):
                </div>

                <div className="divide-y divide-[var(--border-color)] border border-[var(--border-color)] rounded-xl bg-[var(--bg-main)]/50 overflow-hidden text-xs">
                  <div className="p-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <FileJson className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-[var(--text-primary)]">The-Place-to-B_Project-Backup.json</div>
                        <div className="text-[11px] text-[var(--text-muted)]">
                          Full database snapshot: publication data, checklist ({checklist.length} items), academic feedback, and system configuration.
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                      JSON
                    </span>
                  </div>

                  <div className="p-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-blue-400 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-[var(--text-primary)]">The-Place-to-B_Issue-02_Executive-Brief.md</div>
                        <div className="text-[11px] text-[var(--text-muted)]">
                          Executive publication brief: Buildathon champions (Suits Fighter), B-Green & B-Global guides, mixers (Pharaoh Karaoke & Full Class Mixer), key dates.
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                      MARKDOWN
                    </span>
                  </div>

                  <div className="p-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <FileJson className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-[var(--text-primary)]">The-Place-to-B_Submissions-and-Socials.json</div>
                        <div className="text-[11px] text-[var(--text-muted)]">
                          Active cohort submissions ({pendingSubmissions.length} pending), community proposals, and poll votes.
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      ARCHIVE
                    </span>
                  </div>
                </div>
              </div>

              {/* Explicit Mandatory User Confirmation Notice */}
              <div className="p-3 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-muted)] flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>
                  Please confirm that you want to write and sync the current project data to your Google Drive account. If a previous backup exists in the designated folder, it will be updated with the latest state.
                </span>
              </div>
            </div>
          )}

          {/* Saving In Progress State */}
          {status === 'saving' && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#F4B942]/15 border border-[#F4B942]/30 flex items-center justify-center text-[#F4B942] animate-pulse">
                <Loader2 className="w-7 h-7 animate-spin text-[#F4B942]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">Saving to Google Drive...</h3>
                <p className="text-xs text-[#2ED1BA] font-medium mt-1 animate-fade-in">{progressMsg}</p>
              </div>
            </div>
          )}

          {/* Success State */}
          {status === 'success' && (
            <div className="space-y-5 animate-fade-in">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-emerald-300">
                    Project Successfully Saved to Google Drive!
                  </h4>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    All project data, newsletter issue files, and community archives are saved in your Google Drive folder.
                  </p>
                </div>
              </div>

              {/* Direct Links to Drive Folder and Files */}
              <div className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Access Your Saved Assets on Google Drive:
                </div>

                {savedFolder?.webViewLink && (
                  <a
                    href={savedFolder.webViewLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3.5 rounded-xl bg-[#2774AE]/15 border border-[#2774AE]/40 hover:bg-[#2774AE]/25 transition-all text-xs font-medium text-[var(--text-primary)] group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <FolderOpen className="w-5 h-5 text-[#F4B942]" />
                      <div>
                        <div className="font-semibold text-sm">Open Project Folder in Google Drive</div>
                        <div className="text-[11px] text-[var(--text-muted)]">The Place to B — UCLA Anderson</div>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-[#F4B942] group-hover:translate-x-0.5 transition-transform" />
                  </a>
                )}

                <div className="divide-y divide-[var(--border-color)] border border-[var(--border-color)] rounded-xl bg-[var(--bg-main)]/50 overflow-hidden text-xs">
                  {savedFiles.backupFile?.webViewLink && (
                    <a
                      href={savedFiles.backupFile.webViewLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 flex items-center justify-between hover:bg-[var(--border-color)]/20 transition-colors text-[var(--text-primary)] cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <FileJson className="w-4 h-4 text-emerald-400" />
                        <span>The-Place-to-B_Project-Backup.json</span>
                      </div>
                      <span className="text-[11px] text-[#2774AE] flex items-center gap-1">
                        View JSON <ExternalLink className="w-3 h-3" />
                      </span>
                    </a>
                  )}

                  {savedFiles.markdownFile?.webViewLink && (
                    <a
                      href={savedFiles.markdownFile.webViewLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 flex items-center justify-between hover:bg-[var(--border-color)]/20 transition-colors text-[var(--text-primary)] cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-400" />
                        <span>The-Place-to-B_Issue-02_Executive-Brief.md</span>
                      </div>
                      <span className="text-[11px] text-[#2774AE] flex items-center gap-1">
                        View Brief <ExternalLink className="w-3 h-3" />
                      </span>
                    </a>
                  )}

                  {savedFiles.submissionsFile?.webViewLink && (
                    <a
                      href={savedFiles.submissionsFile.webViewLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 flex items-center justify-between hover:bg-[var(--border-color)]/20 transition-colors text-[var(--text-primary)] cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <FileJson className="w-4 h-4 text-amber-400" />
                        <span>The-Place-to-B_Submissions-and-Socials.json</span>
                      </div>
                      <span className="text-[11px] text-[#2774AE] flex items-center gap-1">
                        View Submissions <ExternalLink className="w-3 h-3" />
                      </span>
                    </a>
                  )}
                </div>

                {onOpenShareModal && (
                  <div className="pt-2 flex items-center justify-between p-3 rounded-xl bg-[#2774AE]/10 border border-[#2774AE]/30">
                    <div className="text-xs">
                      <span className="font-bold text-[var(--text-primary)] block">Need to collaborate with a teammate?</span>
                      <span className="text-[var(--text-muted)]">Grant your coworker edit access on Google Drive or the live web app.</span>
                    </div>
                    <button
                      onClick={() => {
                        onClose();
                        onOpenShareModal();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#2774AE] hover:bg-[#1A5B8C] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer flex-shrink-0"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Share with Coworker</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Existing Drive files in the folder if any */}
          {user && folderFiles.length > 0 && status !== 'saving' && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Files in Drive Folder ({folderFiles.length})
                </span>
                {token && (
                  <button
                    onClick={() => loadExistingDriveFolder(token)}
                    disabled={isLoadingFolder}
                    className="text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className={`w-3 h-3 ${isLoadingFolder ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                )}
              </div>
              <div className="max-h-40 overflow-y-auto border border-[var(--border-color)] rounded-xl bg-[var(--bg-main)]/40 divide-y divide-[var(--border-color)] text-xs">
                {folderFiles.map((file) => (
                  <div key={file.id} className="p-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2 truncate pr-2">
                      {file.mimeType.includes('json') ? (
                        <FileJson className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      ) : (
                        <FileText className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                      )}
                      <span className="truncate text-[var(--text-primary)] font-mono text-[11px]">
                        {file.name}
                      </span>
                    </div>
                    {file.webViewLink && (
                      <a
                        href={file.webViewLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-[#2774AE] hover:underline flex items-center gap-0.5 flex-shrink-0"
                      >
                        Open <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 border-t border-[var(--border-color)] bg-[var(--bg-main)]/50 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg border border-[var(--border-color)] hover:bg-[var(--border-color)]/30 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            {status === 'success' ? 'Close' : 'Cancel'}
          </button>

          <div className="flex items-center gap-3">
            {user && status === 'success' && (
              <button
                onClick={() => setStatus('confirming')}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-[#2774AE]/50 text-[#2774AE] hover:bg-[#2774AE]/10 transition-colors cursor-pointer"
              >
                Save Again
              </button>
            )}

            {!user ? (
              <button
                onClick={handleGoogleLogin}
                disabled={isSigningIn}
                className="px-5 py-2 text-xs font-bold rounded-lg bg-[#2774AE] hover:bg-[#1A5B8C] text-white flex items-center gap-2 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSigningIn ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <HardDrive className="w-3.5 h-3.5" />
                )}
                Connect Google Drive
              </button>
            ) : status === 'saving' ? (
              <button
                disabled
                className="px-5 py-2 text-xs font-bold rounded-lg bg-[#F4B942]/50 text-[#003B5C] flex items-center gap-2 cursor-not-allowed opacity-75"
              >
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Saving to Drive...
              </button>
            ) : status === 'success' ? (
              savedFolder?.webViewLink && (
                <a
                  href={savedFolder.webViewLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2 text-xs font-bold rounded-lg bg-[#F4B942] hover:bg-[#FFD100] text-[#003B5C] flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
                >
                  <FolderOpen className="w-3.5 h-3.5 text-[#003B5C]" />
                  Open in Google Drive
                </a>
              )
            ) : (
              <button
                onClick={executeSaveToDrive}
                className="px-5 py-2 text-xs font-bold rounded-lg bg-[#F4B942] hover:bg-[#FFD100] text-[#003B5C] flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
              >
                <HardDrive className="w-3.5 h-3.5 text-[#003B5C]" />
                Confirm & Save to Google Drive
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
