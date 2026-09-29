export type TabId = 
  | 'this-week'
  | 'archive'
  | 'submit'
  | 'vote-socials'
  | 'academic-feedback'
  | 'editor';

export type Category = 'CAREER' | 'SOCIAL' | 'ACADEMIC' | 'COMMUNITY' | 'RESOURCES';

export interface KeyDateItem {
  id: string;
  dateStr: string;
  title: string;
  timeAndLocation?: string;
  category: Category;
}

export interface AnnouncementItem {
  id: string;
  headline: string;
  body: string;
  dateChips: string[];
  ctaText?: string;
  ctaUrl?: string;
}

export interface ArchiveIssue {
  id: string;
  volume: string;
  number: string;
  dateRange: string;
  title: string;
  themeDescription: string;
  tags: string[];
  readTime: string;
  isCurrent?: boolean;
  highlights: string[];
}

export interface BirthdayItem {
  id: string;
  name: string;
  month: string;
  day: number;
  dateStr: string;
}

export type SubmissionType =
  | 'Event'
  | 'Deadline'
  | 'Career Opportunity'
  | 'Shoutout'
  | 'Recap/Photo'
  | 'Club News'
  | 'Birthday'
  | 'Resource'
  | 'Other';

export type SubmissionPriority = 'critical' | 'standard' | 'space_permits';

export interface UserSubmission {
  id: string;
  fullName: string;
  uclaEmail: string;
  type: SubmissionType;
  headline: string;
  details: string;
  dateOrDeadline?: string;
  linkOrUrl?: string;
  nominee?: string;
  priority: SubmissionPriority;
  consent: boolean;
  submittedAt: string;
}

export interface AcademicFeedbackSubmission {
  id: string;
  course: string;
  feedbackType: 'working_well' | 'needs_improvement' | 'specific_request' | 'general_comment';
  details: string;
  isAnonymous: boolean;
  submittedAt: string;
}

export interface ChecklistItem {
  id: string;
  task: string;
  section: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  isCompleted: boolean;
}

export interface SocialProposal {
  id: string;
  title: string;
  proposer: string;
  details: string;
  votes: number;
  userHasVoted?: boolean;
}

export interface PublishedSiteContent {
  cabinetImg: string | null;
  cabinetFitMode: 'contain' | 'cover';
  spotlightImg: string | null;
  publishedAt?: string;
  lastUpdatedBy?: string;
  issueTitle?: string;
}

