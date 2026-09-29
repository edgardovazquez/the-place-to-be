import { useState, useEffect } from 'react';
import { TabId, UserSubmission, AcademicFeedbackSubmission, ChecklistItem, PublishedSiteContent } from './types';
import { INITIAL_CHECKLIST } from './data';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ThisWeekTab } from './components/ThisWeekTab';
import { ArchiveTab } from './components/ArchiveTab';
import { SubmitTab } from './components/SubmitTab';
import { VoteSocialsTab } from './components/VoteSocialsTab';
import { AcademicFeedbackTab } from './components/AcademicFeedbackTab';
import { EditorTab } from './components/EditorTab';
import { SaveToDriveModal } from './components/SaveToDriveModal';
import { ShareCollaboratorModal } from './components/ShareCollaboratorModal';
import { fetchPublishedContent, saveAndPublishContent } from './services/contentService';
import { AnimatePresence, motion } from 'motion/react';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (
        tabParam &&
        ['this-week', 'archive', 'submit', 'vote-socials', 'academic-feedback', 'editor'].includes(tabParam)
      ) {
        return tabParam as TabId;
      }
    } catch {
      // ignore
    }
    return 'this-week';
  });
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isEditorAuthenticated, setIsEditorAuthenticated] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (
        params.get('auth') === 'TheBestSection2028' ||
        params.get('auth')?.toLowerCase() === 'thebestsection2028' ||
        params.get('editor') === 'true'
      ) {
        sessionStorage.setItem('section_b_editor_auth', 'true');
        return true;
      }
      return sessionStorage.getItem('section_b_editor_auth') === 'true';
    } catch {
      return false;
    }
  });

  // Published site content shared across viewers & editor (initialized from local cache to prevent null flash)
  const [publishedContent, setPublishedContent] = useState<PublishedSiteContent>(() => {
    try {
      const cached = localStorage.getItem('section_b_published_content');
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {
      // ignore
    }
    return {
      cabinetImg: '/section_b_cabinet.jpg',
      cabinetFitMode: 'contain',
      spotlightImg: '/section_b_spotlight.jpg',
      publishedAt: '2026-09-17T00:00:00.000Z',
      lastUpdatedBy: 'Section B Cabinet',
      issueTitle: 'Issue 02 — September 17–30, 2026',
    };
  });

  // Load latest published content from server / storage on initial mount
  useEffect(() => {
    fetchPublishedContent().then((data) => {
      if (data) {
        setPublishedContent(data);
      }
    });
  }, []);

  const handleUpdateAndPublishContent = async (
    updates: Partial<PublishedSiteContent>
  ): Promise<boolean> => {
    const res = await saveAndPublishContent(updates);
    if (res.success && res.content) {
      setPublishedContent(res.content);
      return true;
    }
    return false;
  };

  const handleSetEditorAuthenticated = (auth: boolean) => {
    setIsEditorAuthenticated(auth);
    try {
      if (auth) {
        sessionStorage.setItem('section_b_editor_auth', 'true');
      } else {
        sessionStorage.removeItem('section_b_editor_auth');
      }
    } catch {
      // ignore
    }
  };

  // Submissions persisted to localStorage
  const [pendingSubmissions, setPendingSubmissions] = useState<UserSubmission[]>(() => {
    try {
      const saved = localStorage.getItem('the_place_to_b_submissions');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Editor checklist
  const [checklist, setChecklist] = useState<ChecklistItem[]>(() => {
    try {
      const saved = localStorage.getItem('the_place_to_b_checklist');
      return saved ? JSON.parse(saved) : INITIAL_CHECKLIST;
    } catch {
      return INITIAL_CHECKLIST;
    }
  });

  // Theme synchronization with document.body
  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
  }, [theme]);

  // Persist submissions
  useEffect(() => {
    try {
      localStorage.setItem('the_place_to_b_submissions', JSON.stringify(pendingSubmissions));
    } catch {
      // ignore
    }
  }, [pendingSubmissions]);

  // Persist checklist
  useEffect(() => {
    try {
      localStorage.setItem('the_place_to_b_checklist', JSON.stringify(checklist));
    } catch {
      // ignore
    }
  }, [checklist]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleToggleChecklistItem = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isCompleted: !item.isCompleted } : item
      )
    );
  };

  const handleAddSubmission = (submission: UserSubmission) => {
    setPendingSubmissions((prev) => [submission, ...prev]);
  };

  const handleFeedbackSubmitted = (feedback: AcademicFeedbackSubmission) => {
    try {
      const saved = localStorage.getItem('the_place_to_b_feedback');
      const list = saved ? JSON.parse(saved) : [];
      localStorage.setItem('the_place_to_b_feedback', JSON.stringify([feedback, ...list]));
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-[#F4B942] selection:text-[#003B5C]">
      {/* Sticky Header with 2 rows */}
      <Header
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        isEditorAuthenticated={isEditorAuthenticated}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenDriveModal={() => setIsDriveModalOpen(true)}
        onOpenShareModal={() => setIsShareModalOpen(true)}
      />

      {/* Main Container: max 1200px, 24px mobile, 48px tablet, 80px desktop */}
      <main className="flex-1 w-full max-w-[1200px] mx-auto px-6 sm:px-12 lg:px-20 pt-8 sm:pt-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="w-full"
          >
            {activeTab === 'this-week' && (
              <ThisWeekTab
                onNavigate={(tab) => setActiveTab(tab)}
                isEditorAuthenticated={isEditorAuthenticated}
                publishedContent={publishedContent}
                onUpdateAndPublishContent={handleUpdateAndPublishContent}
              />
            )}

            {activeTab === 'archive' && (
              <ArchiveTab onNavigate={(tab) => setActiveTab(tab)} />
            )}

            {activeTab === 'submit' && (
              <SubmitTab
                onNavigate={(tab) => setActiveTab(tab)}
                onSubmissionSuccess={handleAddSubmission}
              />
            )}

            {activeTab === 'vote-socials' && (
              <VoteSocialsTab onNavigate={(tab) => setActiveTab(tab)} />
            )}

            {activeTab === 'academic-feedback' && (
              <AcademicFeedbackTab onFeedbackSubmitted={handleFeedbackSubmitted} />
            )}

            {activeTab === 'editor' && (
              <EditorTab
                isAuthenticated={isEditorAuthenticated}
                onAuthenticate={handleSetEditorAuthenticated}
                onNavigate={(tab) => setActiveTab(tab)}
                pendingSubmissions={pendingSubmissions}
                checklist={checklist}
                onToggleChecklistItem={handleToggleChecklistItem}
                publishedContent={publishedContent}
                onUpdateAndPublishContent={handleUpdateAndPublishContent}
                onOpenDriveModal={() => setIsDriveModalOpen(true)}
                onOpenShareModal={() => setIsShareModalOpen(true)}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer CTA & Legal Bar */}
      <Footer
        onNavigate={(tab) => setActiveTab(tab)}
        onOpenDriveModal={() => setIsDriveModalOpen(true)}
      />

      {/* Google Drive Project Backup & Sync Modal */}
      <SaveToDriveModal
        isOpen={isDriveModalOpen}
        onClose={() => setIsDriveModalOpen(false)}
        publishedContent={publishedContent}
        checklist={checklist}
        pendingSubmissions={pendingSubmissions}
        onOpenShareModal={() => setIsShareModalOpen(true)}
      />

      {/* Share with Coworker / Co-Editor Modal */}
      <ShareCollaboratorModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        sharedAppUrl="https://ais-pre-ykwshuop6inuwp65md7jfd-779775129600.us-east1.run.app"
      />
    </div>
  );
}
