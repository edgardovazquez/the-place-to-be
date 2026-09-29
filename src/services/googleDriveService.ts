import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  User,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { PublishedSiteContent, UserSubmission, ChecklistItem, AcademicFeedbackSubmission } from '../types';
import { KEY_DATES, ANNOUNCEMENTS } from '../data';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Provider with Drive scopes
const provider = new GoogleAuthProvider();
export const SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file',
];

SCOPES.forEach((scope) => {
  provider.addScope(scope);
});

// Flag to indicate if we are in the middle of a sign-in flow.
let isSigningIn = false;
// Cache the access token in memory (never localStorage / sessionStorage).
let cachedAccessToken: string | null = null;

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  size?: string;
  modifiedTime?: string;
  createdTime?: string;
}

export interface DriveFolder {
  id: string;
  name: string;
  webViewLink?: string;
}

export interface ProjectSnapshot {
  projectName: string;
  section: string;
  school: string;
  exportedAt: string;
  exportedBy?: {
    displayName: string | null;
    email: string | null;
    uid: string;
  };
  issueMetadata: {
    title: string;
    volume: string;
    number: string;
    dateRange: string;
    tagline: string;
  };
  publishedContent: PublishedSiteContent;
  checklist: ChecklistItem[];
  pendingSubmissions: UserSubmission[];
  academicFeedback?: AcademicFeedbackSubmission[];
  keyDates: typeof KEY_DATES;
  announcements: typeof ANNOUNCEMENTS;
  socialProposals?: any[];
}

/**
 * Initialize auth state listener. Call this on app load.
 */
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user && cachedAccessToken) {
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
    } else {
      if (!isSigningIn) {
        if (onAuthFailure) onAuthFailure();
      }
    }
  });
};

/**
 * Prompt Google Sign-In with Drive scopes
 */
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to obtain Google Drive access token from authentication');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logoutGoogle = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

/**
 * Locate or create the project folder in Google Drive
 */
export async function findOrCreateFolder(
  folderName: string,
  accessToken: string
): Promise<DriveFolder> {
  const query = encodeURIComponent(
    `name='${folderName.replace(/'/g, "\\'")}' and mimeType='application/vnd.google-apps.folder' and trashed=false`
  );
  
  const searchRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,webViewLink)`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!searchRes.ok) {
    const err = await searchRes.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Failed to search Google Drive folders (${searchRes.status})`);
  }

  const searchData = await searchRes.json();
  if (searchData.files && searchData.files.length > 0) {
    return searchData.files[0];
  }

  // Create folder if not found
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files?fields=id,name,webViewLink', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Failed to create folder in Google Drive (${createRes.status})`);
  }

  return await createRes.json();
}

/**
 * Upload or overwrite a file in a specified Drive folder
 */
export async function uploadOrUpdateFile(
  folderId: string,
  fileName: string,
  content: string,
  mimeType: string,
  accessToken: string
): Promise<DriveFileItem> {
  // Check if file exists in the folder
  const query = encodeURIComponent(
    `'${folderId}' in parents and name='${fileName.replace(/'/g, "\\'")}' and trashed=false`
  );
  const searchRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,webViewLink)`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  let fileId: string;
  if (searchRes.ok) {
    const searchData = await searchRes.json();
    if (searchData.files && searchData.files.length > 0) {
      fileId = searchData.files[0].id;
    } else {
      // Create new file metadata
      const createRes = await fetch('https://www.googleapis.com/drive/v3/files?fields=id,name,webViewLink', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: fileName,
          mimeType,
          parents: [folderId],
        }),
      });

      if (!createRes.ok) {
        const err = await createRes.json().catch(() => ({}));
        throw new Error(err?.error?.message || 'Failed to initialize file in Google Drive');
      }

      const createData = await createRes.json();
      fileId = createData.id;
    }
  } else {
    throw new Error('Failed to query existing files in Google Drive');
  }

  // Upload/replace file media
  const uploadRes = await fetch(
    `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': mimeType,
      },
      body: content,
    }
  );

  if (!uploadRes.ok) {
    const err = await uploadRes.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Failed to write content to Google Drive file');
  }

  // Fetch file details with webViewLink and metadata
  const detailsRes = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,mimeType,webViewLink,size,modifiedTime,createdTime`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  return await detailsRes.json();
}

/**
 * List files inside the project folder
 */
export async function listProjectFolderFiles(
  folderId: string,
  accessToken: string
): Promise<DriveFileItem[]> {
  const query = encodeURIComponent(`'${folderId}' in parents and trashed=false`);
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&orderBy=modifiedTime desc&fields=files(id,name,mimeType,webViewLink,size,modifiedTime,createdTime)`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!res.ok) {
    return [];
  }

  const data = await res.json();
  return data.files || [];
}

/**
 * Generates an executive Markdown publication report from project state
 */
export function generateIssueMarkdown(snapshot: ProjectSnapshot): string {
  const now = new Date(snapshot.exportedAt).toLocaleString('en-US', {
    dateStyle: 'full',
    timeStyle: 'short',
  });

  return `# The Place to B — Section B at UCLA Anderson
## ${snapshot.issueMetadata.title}
**${snapshot.issueMetadata.volume} · ${snapshot.issueMetadata.number}** | ${snapshot.issueMetadata.dateRange}  
*${snapshot.issueMetadata.tagline}*

---

### 🌟 Section Spotlights & Buildathon Champions
- **Featured Champions**: Suits Fighter by Lawrence Chung & Walker Chun-Hao Huang
- **B-Green 🌿 B-sustainable**: Bruin Grad Pass guide (FREE for Fall Quarter!)
- **B-Global 🌍 - International Students**: Comprehensive resources, visa check-ins, and cohort support
- **Published Spotlight Image**: \`${snapshot.publishedContent.spotlightImg || 'Default Asset'}\`
- **Section B Cabinet Image**: \`${snapshot.publishedContent.cabinetImg || 'Default Asset'}\`

---

### 🎉 Confirmed Social Mixers & Section Life
1. **Disney Channel Pride Karaoke Night**
   - **Date & Time**: Friday, September 18, 2026 at 7:00 PM
   - **Location**: Pharaoh Karaoke
   - **Details**: Joint mixer with Section D. Costume & karaoke classics from Disney Channel Golden Era!
2. **Fall Quarter Kickoff Social 🍺**
   - **Date & Time**: Saturday, September 19, 2026 from 12:00 PM – 4:00 PM
   - **Location**: All Season Brewing
   - **Details**: Full Class mixer (open to all MBA sections). Celebrating the start of Fall Quarter!

---

### 📅 Key Academic Dates & Deadlines
${snapshot.keyDates.map((kd) => `- **${kd.dateStr}**: ${kd.title} (${kd.timeAndLocation || 'UCLA Anderson'})`).join('\n')}

---

### 📢 Announcements & Workshops
${snapshot.announcements.map((a) => `#### ${a.headline}\n${a.body}\n*Dates*: ${a.dateChips.join(' | ')}${a.ctaUrl ? `\n*Action*: [${a.ctaText || 'Learn More'}](${a.ctaUrl})` : ''}`).join('\n\n')}

---

### 📋 Editorial Checklist Progress
- Total Tasks: ${snapshot.checklist.length}
- Completed: ${snapshot.checklist.filter((c) => c.isCompleted).length}
${snapshot.checklist.map((c) => `- [${c.isCompleted ? 'x' : ' '}] **${c.task}** (${c.section} · ${c.priority})`).join('\n')}

---

### 📥 Pending Community Submissions (${snapshot.pendingSubmissions.length})
${snapshot.pendingSubmissions.length === 0 ? '_No pending submissions at time of export._' : snapshot.pendingSubmissions.map((s, idx) => `${idx + 1}. **${s.headline}** (${s.type}) by ${s.fullName} (${s.uclaEmail})\n   ${s.details}`).join('\n\n')}

---

*Saved to Google Drive on ${now} by ${snapshot.exportedBy?.displayName || snapshot.exportedBy?.email || 'Section B Editor'}.*
*Generated by The Place to B — UCLA Anderson School of Management.*
`;
}

/**
 * Share folder or file with a collaborator by email on Google Drive
 */
export async function shareFolderWithUser(
  folderId: string,
  emailAddress: string,
  role: 'writer' | 'reader',
  accessToken: string
): Promise<{ id: string; role: string; emailAddress?: string }> {
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${folderId}/permissions?sendNotificationEmail=true`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        role,
        type: 'user',
        emailAddress: emailAddress.trim(),
      }),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Failed to grant ${role} permission to ${emailAddress}`);
  }

  return await res.json();
}

/**
 * List existing permissions/collaborators on the Drive folder
 */
export async function listFolderPermissions(
  folderId: string,
  accessToken: string
): Promise<Array<{ id: string; displayName?: string; emailAddress?: string; role: string }>> {
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${folderId}/permissions?fields=permissions(id,displayName,emailAddress,role,type)`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.permissions || [];
}

/**
 * Execute full project save to Google Drive with progress callbacks
 */
export async function saveProjectToGoogleDrive(
  snapshot: ProjectSnapshot,
  accessToken: string,
  onProgress?: (message: string) => void
): Promise<{
  folder: DriveFolder;
  backupFile: DriveFileItem;
  markdownFile: DriveFileItem;
  submissionsFile?: DriveFileItem;
}> {
  onProgress?.('Accessing "The Place to B — UCLA Anderson" folder in Google Drive...');
  const folder = await findOrCreateFolder('The Place to B — UCLA Anderson', accessToken);

  onProgress?.('Saving full project JSON backup...');
  const jsonContent = JSON.stringify(snapshot, null, 2);
  const backupFile = await uploadOrUpdateFile(
    folder.id,
    'The-Place-to-B_Project-Backup.json',
    jsonContent,
    'application/json',
    accessToken
  );

  onProgress?.('Generating and saving publication executive markdown brief...');
  const mdContent = generateIssueMarkdown(snapshot);
  const markdownFile = await uploadOrUpdateFile(
    folder.id,
    'The-Place-to-B_Issue-02_Executive-Brief.md',
    mdContent,
    'text/markdown',
    accessToken
  );

  onProgress?.('Archiving community submissions and social proposals...');
  const communityData = {
    exportedAt: snapshot.exportedAt,
    submissionsCount: snapshot.pendingSubmissions.length,
    submissions: snapshot.pendingSubmissions,
    academicFeedback: snapshot.academicFeedback || [],
    socialProposals: snapshot.socialProposals || [],
  };
  const submissionsFile = await uploadOrUpdateFile(
    folder.id,
    'The-Place-to-B_Submissions-and-Socials.json',
    JSON.stringify(communityData, null, 2),
    'application/json',
    accessToken
  );

  onProgress?.('Completed! All files successfully saved to Google Drive.');

  return {
    folder,
    backupFile,
    markdownFile,
    submissionsFile,
  };
}
