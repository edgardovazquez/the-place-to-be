import React, { useState, useEffect } from 'react';
import {
  X,
  UserPlus,
  Share2,
  HardDrive,
  Copy,
  Check,
  ExternalLink,
  Shield,
  Key,
  Users,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Mail,
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  findOrCreateFolder,
  shareFolderWithUser,
  listFolderPermissions,
  googleSignIn,
  getAccessToken,
  DriveFolder,
} from '../services/googleDriveService';

interface ShareCollaboratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  sharedAppUrl: string;
}

export const ShareCollaboratorModal: React.FC<ShareCollaboratorModalProps> = ({
  isOpen,
  onClose,
  sharedAppUrl,
}) => {
  const [activeTab, setActiveTab] = useState<'app' | 'drive'>('app');
  const [coworkerEmail, setCoworkerEmail] = useState('');
  const [role, setRole] = useState<'writer' | 'reader'>('writer');
  const [isSharingDrive, setIsSharingDrive] = useState(false);
  const [driveSuccessMsg, setDriveSuccessMsg] = useState<string | null>(null);
  const [driveErrorMsg, setDriveErrorMsg] = useState<string | null>(null);
  const [driveFolder, setDriveFolder] = useState<DriveFolder | null>(null);
  const [permissionsList, setPermissionsList] = useState<Array<{ id: string; displayName?: string; emailAddress?: string; role: string }>>([]);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(false);
  const [copiedLink, setCopiedLink] = useState<'invite' | 'url' | 'passkey' | null>(null);

  // Editor passkey
  const EDITOR_PASSKEY = 'TheBestSection2028';
  
  // Construct direct 1-click editor link
  const cleanBaseUrl = sharedAppUrl || window.location.origin;
  const directEditorLink = `${cleanBaseUrl}/?auth=${encodeURIComponent(EDITOR_PASSKEY)}&tab=editor`;

  useEffect(() => {
    if (isOpen) {
      checkDriveFolder();
    }
  }, [isOpen]);

  const checkDriveFolder = async () => {
    const token = await getAccessToken();
    if (!token) return;
    try {
      setIsLoadingPermissions(true);
      const folder = await findOrCreateFolder('The Place to B — UCLA Anderson', token);
      setDriveFolder(folder);
      const perms = await listFolderPermissions(folder.id, token);
      setPermissionsList(perms);
    } catch (err) {
      console.warn('Could not retrieve folder permissions:', err);
    } finally {
      setIsLoadingPermissions(false);
    }
  };

  const handleShareOnGoogleDrive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coworkerEmail.trim()) return;

    let token = await getAccessToken();
    if (!token) {
      try {
        const signinRes = await googleSignIn();
        if (signinRes) {
          token = signinRes.accessToken;
        } else {
          setDriveErrorMsg('Google authentication required to grant Drive permissions.');
          return;
        }
      } catch (err: any) {
        setDriveErrorMsg(err?.message || 'Failed to authenticate with Google.');
        return;
      }
    }

    setIsSharingDrive(true);
    setDriveSuccessMsg(null);
    setDriveErrorMsg(null);

    try {
      const folder = driveFolder || (await findOrCreateFolder('The Place to B — UCLA Anderson', token));
      setDriveFolder(folder);

      await shareFolderWithUser(folder.id, coworkerEmail.trim(), role, token);
      setDriveSuccessMsg(
        `Successfully shared Google Drive project folder with ${coworkerEmail.trim()} as ${role === 'writer' ? 'Editor (Can Edit)' : 'Viewer'}. An invitation notification has been sent.`
      );
      setCoworkerEmail('');
      // Refresh permissions
      const perms = await listFolderPermissions(folder.id, token);
      setPermissionsList(perms);
    } catch (err: any) {
      console.error('Sharing error:', err);
      setDriveErrorMsg(err?.message || 'Failed to share folder. Please ensure the email address is valid.');
    } finally {
      setIsSharingDrive(false);
    }
  };

  const copyToClipboard = (text: string, type: 'invite' | 'url' | 'passkey') => {
    navigator.clipboard?.writeText(text);
    setCopiedLink(type);
    setTimeout(() => setCopiedLink(null), 2500);
  };

  const invitationMessage = `Hi! Here is access to collaborate and edit "The Place to B" (UCLA Anderson Section B):

1. One-Click Co-Editor Access:
${directEditorLink}

2. Shared Application:
${cleanBaseUrl}
Editor Passkey: ${EDITOR_PASSKEY}

3. Google Drive Project Archive:
${driveFolder?.webViewLink || 'Folder: The Place to B — UCLA Anderson'}`;

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
              <UserPlus className="w-5 h-5 text-[#F4B942]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--text-primary)] font-editorial-serif flex items-center gap-2">
                Share Project with Coworker (Edit Access)
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                Grant full editing privileges to collaborators on the live web app & Google Drive
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

        {/* Tab switch: App Co-Editor vs Google Drive */}
        <div className="flex border-b border-[var(--border-color)] bg-[var(--bg-main)]/60 px-6 pt-2">
          <button
            onClick={() => setActiveTab('app')}
            className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'app'
                ? 'border-[#F4B942] text-[#F4B942]'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>1. Web App Co-Editor Access</span>
          </button>
          <button
            onClick={() => setActiveTab('drive')}
            className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'drive'
                ? 'border-[#F4B942] text-[#F4B942]'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>2. Google Drive Edit Permissions</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-[var(--text-primary)]">
          {activeTab === 'app' && (
            <div className="space-y-6">
              {/* Option 1: 1-Click Direct Editor Invite Link */}
              <div className="p-4 rounded-xl bg-[#2774AE]/10 border border-[#2774AE]/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)]">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Instant 1-Click Co-Editor Link</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Recommended
                  </span>
                </div>
                <p className="text-xs text-[var(--text-muted)]">
                  Share this link with your coworker. It automatically authenticates them into the Section B <strong>Editor Hub</strong> so they can immediately edit content, upload spotlight and cabinet photos, manage checklist tasks, and publish changes.
                </p>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={directEditorLink}
                    className="flex-1 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-xs font-mono text-[var(--text-secondary)] select-all outline-none"
                  />
                  <button
                    onClick={() => copyToClipboard(directEditorLink, 'invite')}
                    className="px-4 py-2 bg-[#2774AE] hover:bg-[#1A5B8C] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer flex-shrink-0"
                  >
                    {copiedLink === 'invite' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Passkey & Standard App Link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[var(--bg-main)]/60 border border-[var(--border-color)] space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    <Key className="w-3.5 h-3.5 text-[#F4B942]" />
                    <span>Editor Hub Passkey</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)]">
                    <span className="font-mono text-sm font-bold text-[#F4B942]">
                      {EDITOR_PASSKEY}
                    </span>
                    <button
                      onClick={() => copyToClipboard(EDITOR_PASSKEY, 'passkey')}
                      className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 rounded hover:bg-[var(--border-color)]/30 transition-colors cursor-pointer"
                      title="Copy passkey"
                    >
                      {copiedLink === 'passkey' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    Coworkers can also click "Editor sign-in" in the header and enter this passkey.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[var(--bg-main)]/60 border border-[var(--border-color)] space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    <ExternalLink className="w-3.5 h-3.5 text-[#2774AE]" />
                    <span>Live Shared Web App</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)]">
                    <span className="font-mono text-xs text-[var(--text-secondary)] truncate mr-2">
                      {cleanBaseUrl}
                    </span>
                    <button
                      onClick={() => copyToClipboard(cleanBaseUrl, 'url')}
                      className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 rounded hover:bg-[var(--border-color)]/30 transition-colors cursor-pointer flex-shrink-0"
                      title="Copy URL"
                    >
                      {copiedLink === 'url' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    Permanent shared preview URL accessible across browsers and devices.
                  </p>
                </div>
              </div>

              {/* Complete Message Copy */}
              <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    <Mail className="w-3.5 h-3.5 text-[#F4B942]" />
                    <span>Ready-to-Send Invitation Message</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(invitationMessage, 'invite')}
                    className="text-xs text-[#2774AE] hover:text-[#F4B942] font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy Message</span>
                  </button>
                </div>
                <pre className="p-3 rounded-lg bg-[var(--bg-main)] text-[11px] text-[var(--text-secondary)] font-mono whitespace-pre-wrap border border-[var(--border-color)]/60 leading-relaxed overflow-x-auto">
                  {invitationMessage}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'drive' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-[#003B5C]/20 border border-[#2774AE]/30 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#F4B942]">
                    <HardDrive className="w-4 h-4 text-[#F4B942]" />
                    <span>Google Drive Folder: "The Place to B — UCLA Anderson"</span>
                  </div>
                  {driveFolder?.webViewLink && (
                    <a
                      href={driveFolder.webViewLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#2774AE] hover:underline flex items-center gap-1"
                    >
                      Open in Drive <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <p className="text-xs text-[var(--text-muted)]">
                  Add your coworker's Google email address below to grant them full <strong>Editor</strong> rights on the project folder in Google Drive. They will be able to edit backups, markdown issues, and databases directly.
                </p>
              </div>

              {/* Share Form */}
              <form onSubmit={handleShareOnGoogleDrive} className="space-y-4">
                <div>
                  <label
                    htmlFor="coworker-email-input"
                    className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5"
                  >
                    Coworker's Email Address (UCLA or Google Account)
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      id="coworker-email-input"
                      type="email"
                      required
                      placeholder="coworker@anderson.ucla.edu or name@gmail.com"
                      value={coworkerEmail}
                      onChange={(e) => setCoworkerEmail(e.target.value)}
                      className="flex-1 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg px-3.5 py-2.5 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[#F4B942]"
                    />
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as 'writer' | 'reader')}
                      className="bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-xs font-medium text-[var(--text-primary)] focus:outline-none focus:border-[#F4B942] cursor-pointer"
                    >
                      <option value="writer">Can Edit (Editor)</option>
                      <option value="reader">Can View (Viewer)</option>
                    </select>
                    <button
                      type="submit"
                      disabled={isSharingDrive || !coworkerEmail.trim()}
                      className="px-5 py-2.5 rounded-lg bg-[#F4B942] hover:bg-[#FFD100] text-[#003B5C] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm disabled:opacity-50 flex-shrink-0"
                    >
                      {isSharingDrive ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Granting Access...</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Grant Edit Access</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>

              {/* Status alerts */}
              {driveSuccessMsg && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2.5 text-emerald-300 text-xs animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-400" />
                  <span>{driveSuccessMsg}</span>
                </div>
              )}

              {driveErrorMsg && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-red-300 text-xs animate-fade-in">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-400" />
                  <span>{driveErrorMsg}</span>
                </div>
              )}

              {/* Collaborators list */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  <span>Current Google Drive Collaborators ({permissionsList.length})</span>
                  {isLoadingPermissions && <Loader2 className="w-3 h-3 animate-spin text-[var(--text-muted)]" />}
                </div>

                <div className="border border-[var(--border-color)] rounded-xl bg-[var(--bg-main)]/50 divide-y divide-[var(--border-color)] overflow-hidden text-xs">
                  {permissionsList.length === 0 ? (
                    <div className="p-4 text-center text-[var(--text-muted)]">
                      {isLoadingPermissions ? 'Loading collaborators...' : 'Save the project to Google Drive first to populate collaborators.'}
                    </div>
                  ) : (
                    permissionsList.map((perm) => (
                      <div key={perm.id} className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#2774AE]/20 text-[#2774AE] flex items-center justify-center font-bold text-[10px]">
                            {(perm.displayName || perm.emailAddress || 'U').slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-[var(--text-primary)]">
                              {perm.displayName || perm.emailAddress || 'Collaborator'}
                            </div>
                            {perm.emailAddress && (
                              <div className="text-[11px] text-[var(--text-muted)]">
                                {perm.emailAddress}
                              </div>
                            )}
                          </div>
                        </div>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#F4B942]/15 text-[#F4B942] border border-[#F4B942]/30">
                          {perm.role === 'writer' ? 'Can Edit (Editor)' : perm.role === 'owner' ? 'Owner' : 'Viewer'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-[var(--border-color)] bg-[var(--bg-main)]/50 flex items-center justify-between">
          <p className="text-[11px] text-[var(--text-muted)]">
            Changes to the live site made by any co-editor take effect immediately.
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold rounded-lg bg-[#2774AE] hover:bg-[#1A5B8C] text-white transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
