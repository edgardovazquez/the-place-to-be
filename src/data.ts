import { KeyDateItem, AnnouncementItem, ArchiveIssue, ChecklistItem, BirthdayItem } from './types';

export const KEY_DATES: KeyDateItem[] = [
  {
    id: 'kd-0',
    dateStr: 'SEP 17',
    title: 'First Day of Class — Fall Quarter Begins',
    timeAndLocation: 'UCLA Anderson School of Management',
    category: 'ACADEMIC',
  },
  {
    id: 'kd-1',
    dateStr: 'SEP 21',
    title: 'Welcome Survey',
    timeAndLocation: 'Business Strategy · Individual Assignment',
    category: 'ACADEMIC',
  },
  {
    id: 'kd-2',
    dateStr: 'SEP 25',
    title: 'Problem Set #1',
    timeAndLocation: 'Econ · Group Assignment',
    category: 'ACADEMIC',
  },
  {
    id: 'kd-3',
    dateStr: 'SEP 28',
    title: 'Group Memo: Walmart',
    timeAndLocation: 'Business Strategy · Group Assignment',
    category: 'ACADEMIC',
  },
];

export const ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: 'ann-1',
    headline: 'Marc Cosentino Virtual Workshops — Case In Point',
    body: 'Two back-to-back workshops with the author of Case In Point. First up: MBA Case Competition Workshop on Monday, September 21 from 4:30–6:30 PM. Agenda covers what case competitions are, why they matter, and how to build your case from the ground up. Second session: Case Starts on Wednesday, September 23 from 5:00–6:30 PM. Register for both through UCLA Anderson myCareer.',
    dateChips: ['MON SEP 21 · 4:30 PM', 'WED SEP 23 · 5:00 PM'],
    ctaText: 'Register on myCareer →',
    ctaUrl: 'https://anderson-ucla.12twenty.com/',
  },
  {
    id: 'ann-2',
    headline: 'Club Fair — Get Ready to Sign Up',
    body: 'The second-years are almost back on campus which means the Club Fair is coming. This is your best opportunity to explore every club at Anderson, meet board members face to face, and sign up before rosters fill. More details to come — mark September 24 at 4:30 PM in your calendar now.',
    dateChips: ['SEP 24 · 4:30 PM'],
  },
  {
    id: 'ann-3',
    headline: 'New Workshop: Designing Your Life with Matthew Temple',
    body: 'Still figuring out how your career and life fit together? This interactive workshop is for you. Join Matthew Temple on Tuesday, September 22 from 4:15–5:45 PM to build three Odyssey Plans for the next five years. Spots are limited — RSVP now through myCareer before it fills.',
    dateChips: ['TUE SEP 22 · 4:15 PM'],
    ctaText: 'RSVP on myCareer →',
    ctaUrl: 'https://anderson-ucla.12twenty.com/',
  },
  {
    id: 'ann-4',
    headline: 'Employer Events — Check myCareer',
    body: 'Multiple employer events are happening across the next two weeks. From info sessions to coffee chats, the full recruiting calendar lives in UCLA Anderson myCareer. Check it regularly — opportunities move fast and seats fill without warning.',
    dateChips: [],
    ctaText: 'Open myCareer →',
    ctaUrl: 'https://anderson-ucla.12twenty.com/',
  },
  {
    id: 'ann-5',
    headline: 'B-Green 🌿 Bruin Grad Pass — FREE for Fall Quarter',
    body: 'All registered UCLA graduate students have access to fare-free rides on LA Metro, Santa Monica Big Blue Bus, Culver CityBus, and 4 other transit agencies — completely FREE for Fall Quarter ($0)! Claim and activate your pass on BruinTAP.',
    dateChips: ['B-GREEN', 'FREE FOR FALL', 'UNLIMITED TRANSIT'],
    ctaText: 'Bruin Grad Pass Details →',
    ctaUrl: 'https://transportation.ucla.edu/getting-to-ucla/public-transit/bruin-grad-pass',
  },
];

export const ARCHIVE_ISSUES: ArchiveIssue[] = [
  {
    id: 'issue-02',
    volume: 'VOL. 1',
    number: 'NO. 2',
    dateRange: 'Sep 17–30, 2026',
    title: 'THE FALL QUARTER KICKOFF ISSUE',
    themeDescription:
      'Buildathon champions, case comp season, Designing Your Life, and Section B’s first big social of fall quarter.',
    tags: ['Career', 'Events', 'Spotlight', 'Social', 'Sustainability'],
    readTime: '5 min read',
    isCurrent: true,
    highlights: [
      'Inaugural Buildathon Champions: Suits Fighter by Lawrence Chung & Walker Huang',
      'B-Green 🌿 B-sustainable: Bruin Grad Pass guide (FREE for Fall Quarter!)',
      'Marc Cosentino Case In Point Workshop series dates',
      'Designing Your Life with Matthew Temple RSVP',
      'Disney Channel Pride Karaoke Night: Section D Mixer at Pharaoh (Fri, Sep 18 · 7 PM)',
      'Fall Quarter Kickoff Full Class Mixer at All Season Brewing (Sat, Sep 19)',
    ],
  },
  {
    id: 'issue-01',
    volume: 'VOLUME 1',
    number: 'ISSUE 1',
    dateRange: 'Finals Week · Fall 2026',
    title: 'WELCOME TO THE WEEKLY B',
    themeDescription:
      'Welcome to our first finals week and the last week of our first quarter as classmates. First issue sent out to Section B Class of 2028 with presidential letter by Sabrina Kharrazi and Meet the Cabinet.',
    tags: ['Community', 'Cabinet', 'Events', 'Finals'],
    readTime: '4 min read',
    isCurrent: false,
    highlights: [
      'Letter from President Sabrina Kharrazi (Class of 2028)',
      'Celebration of Build-a-thon champions Lawrence Chung & team finalists',
      'Important Dates: Finals schedule & Fall kickoff events',
      'Meet the Section B Cabinet: Eddie, Quinn, Brin, Luis, Tomaso, and Ethan',
      'myCareer recruiting updates & birthdays list with Brin',
    ],
  },
];

export const SEPTEMBER_BIRTHDAYS: BirthdayItem[] = [
  {
    id: 'bday-1',
    name: 'Roger Huang',
    month: 'September',
    day: 2,
    dateStr: 'September 2',
  },
  {
    id: 'bday-2',
    name: 'Lawrence Chung',
    month: 'September',
    day: 9,
    dateStr: 'September 9',
  },
  {
    id: 'bday-3',
    name: 'Sophia Rokni',
    month: 'September',
    day: 9,
    dateStr: 'September 9',
  },
  {
    id: 'bday-4',
    name: 'Yuta Nomura',
    month: 'September',
    day: 22,
    dateStr: 'September 22',
  },
];

export const INITIAL_CHECKLIST: ChecklistItem[] = [
  {
    id: 'chk-1',
    task: "President's note — Sabrina's Fall Quarter address published",
    section: 'From the President',
    priority: 'HIGH',
    isCompleted: true,
  },
  {
    id: 'chk-2',
    task: 'Section birthdays — September birthdays confirmed and published in B-Days 🎂 · September section and Stats Bar',
    section: 'Birthdays & Stats',
    priority: 'HIGH',
    isCompleted: true,
  },
  {
    id: 'chk-4',
    task: 'Karaoke Night — Confirmed location at Pharaoh at 7:00 PM and joint mixer with Section D published',
    section: 'Social & Section Life',
    priority: 'MEDIUM',
    isCompleted: true,
  },
  {
    id: 'chk-5',
    task: 'Vote on Socials — Add social proposals if any have been submitted, or leave tab open',
    section: 'Vote on Socials',
    priority: 'LOW',
    isCompleted: false,
  },
];
