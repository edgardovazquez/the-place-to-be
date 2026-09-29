export interface CabinetMember {
  name: string;
  role: string;
  bio: string;
  phone?: string;
  flag?: string;
}

export const ISSUE_1_CABINET: CabinetMember[] = [
  {
    name: 'Eddie',
    role: 'VICE PRESIDENT, ACADEMIC AFFAIRS',
    bio: "Hello, my beloved Section B family! Thank you for making this summer so memorable! I'm excited to continue supporting all of you throughout the rest of our MBA journey.\n\nBefore Anderson, I spent eight years in the mobility and transportation industry, leading operations, business development, and customer success. I've always enjoyed bringing people together to solve problems, improve experiences, and make things work better. I'm excited to bring that same mindset to our section and make sure everyone feels heard and included.\n\nOutside of Anderson, you'll usually find me traveling, trying new restaurants, exploring LA, or grabbing drinks with friends. I'm always down for good food, good conversations, and discovering new places.\n\nAs your liaison to our professors and administrators, please feel free to reach out with ideas, feedback, questions, or anything you'd like to see from our section. Use the Item Submission tab to share ideas and requests, and the Academic Feedback form to share feedback anonymously or with your name.\n\nLooking forward to an amazing year with all of you! Feel free to reach out via email or text me at 323-440-8427 anytime. 💙🐻💛",
    phone: '323-440-8427',
  },
  {
    name: 'Quinn',
    role: 'COMMUNITY IMPACT',
    bio: "Hi section B! I'm Quinn and I'm so excited to be your director of community impact!\n\nI'm originally from Miami but have been living in NYC for the past couple years before moving here for Anderson! I started a charity when I was in college that focused on environmental education in elementary schools so I am excited to put my impact hat back on for our section.\n\nI want to make sure we do events and focus on charities that matter to us so if there is any special causes to you please let me know!!\n\nPlease feel free to reach out to me at anytime with ideas, suggestions, or requests. My number is 305-467-8988!\n\nSo excited to have a great year with the best section!",
    phone: '305-467-8988',
  },
  {
    name: 'Brin',
    role: 'INCLUSIVE EXCELLENCE',
    bio: "Hi everyone! My name is Brin, I'm a SoCal native and a banana slug.\n\nI've been in Los Angeles for the past 3 years, doing freelance film work and business development at a boutique law firm.\n\nI am first generation Mexican-American; I am currently trying to get into bouldering and doing some production work on short films.\n\nI am super happy to be your director of inclusive excellence, please say hi if you see me around!!!",
  },
  {
    name: 'Luis',
    role: 'SUSTAINABILITY',
    bio: "Hi Section B!\n\nMy name is Luis Guzman, and I'm stoked to be your Section Director of Sustainability.\n\nI grew up in Chicago and have lived in Philadelphia, Las Vegas, and right here in Los Angeles for the past six years. I taught upper elementary school through Teach For America before coming to UCLA.\n\nI'm deeply passionate about public transit, affordable housing, and transit-oriented development. I'm also a big fan of biophilic architecture and slightly obsessed with solarpunk design.\n\nOn the weekends, I play a ton of beach volleyball. I'd love to get our section out to see the best beaches in SoCal. I love going to music festivals and my favorite foods are Ceviche, Sushi and Ramen - and I especially love Sushirritos!\n\nI'm excited to spend the year with you all. Let's start reducing, reusing, and recycling (and try taking Metro or biking around LA whenever you can!)",
  },
  {
    name: 'Tomaso',
    role: 'INTERNATIONAL RELATIONSHIPS',
    flag: '🇮🇹',
    bio: "I'm Tommaso Castelli, and I'm excited to be your Director of International Relationships.\n\nI grew up in Venice, Italy 🇮🇹, studied Management Engineering in Milan, and for the past few years I've been running two companies back home and in Germany. Outside of Anderson, I love traveling, sports (especially soccer!), cooking, and discovering new places — especially ones immersed in nature!\n\nAs your point of contact for international students, I want to make sure our international classmates feel fully connected to the section — and that folks from the US feel just as connected to the international community. We are the b-cause together we anytime with ideas, questions, or just to say hi (310-963-5115). Looking forward to a great year together!",
    phone: '310-963-5115',
  },
  {
    name: 'Ethan',
    role: 'CO-SOCIAL CHAIR',
    bio: "Hi everyone! I'm Ethan Fisk, this is going to be awesome.\n\nI'm from Raleigh NC, I've got a background in chemistry and worked in life sciences consulting ever since undergrad. Additionally, I helped fundraise for companies and screen for VC funds on the side.\n\nOutside of Anderson, I love to golf, play videogames, and generally have a good time. I'm super into food & wine, and I've got a big family so I'm usually pretty loud & outgoing.\n\nI'm 1/2 social chairs and want to plan fun events where we can make some memories as a class/section. I don't know much about LA, but I know people and I can get the people going.\n\nThis is going to be an amazing year and I'm super excited!",
  },
];

export const ISSUE_1_LETTER = {
  greeting: 'Hello my Busy B’s,',
  paragraphs: [
    "Welcome to our first finals week and the last week of our first quarter as classmates! It's hard to believe it's already been six weeks since we embarked on this journey together. It's been such an honor getting to know all of you and watching our Section B family — and all of its many personalities and talents — come together!",
    "Starting in the fall, we'll be sending out a Section B newsletter each week with important deadlines and dates, section updates, feedback forms, and other relevant info.",
    "We're still figuring out exactly what this newsletter will look like as we wait for ASA to return and provide further guidance, but ultimately, we can make it our own. If you're interested in helping with the design, template/format, or focus, please reach out! I'd love for this to be something we build together that reflects what our section wants and needs.",
    "Before we officially make it through this quarter, I also want to celebrate everything we've already accomplished. Beyond all the hard work in our classes, Section B showed up in the case competition and Build-a-thon, with Tyler, Oscar, Will, Sojeong, Roger, Eddie, and Jenny making it to the finals — and Lawrence winning the Build-a-thon! 🏆 We also topped the AOC Olympics in chess, 3-legged race, and have earned a reputation as the section to beat in more ways than one.",
    "I'm really proud of us for almost making it through our first quarter together, and I can't wait to celebrate with everyone in Vegas and in the fall!",
    "However you spend your post-exam vacation time, I hope you all get some well-deserved time to rest and do the things you love.",
  ],
  signoff: 'Sabrina Kharrazi',
  title: 'Section B President',
  phone: '602-677-9597',
};

export const ISSUE_1_DATES = {
  thisWeek: [
    { name: 'Marketing Group Assignment', time: 'Thurs., 11:59 PM' },
    { name: 'Final Accounting Problem Set', time: 'Thurs., 11:59 PM' },
    { name: 'Finance Final', time: 'Thurs., 9:00 AM–12:00 PM' },
    { name: 'Accounting Final', time: 'Fri., 9:00 AM–12:00 PM' },
    { name: 'Marketing Final', time: 'Fri., 1:00–4:00 PM' },
    { name: 'Vegas at Club Omnia', time: 'Fri., after 10:00 PM' },
  ],
  comingUp: [
    { date: 'Thurs., Sept. 17', event: 'First Day of Classes + Section B Karaoke Night' },
    { date: 'Sat., Sept. 19', event: 'Cohort - Wide Fall Welcome Party' },
    { date: 'Thurs., Sept. 24', event: 'Anderson Club Fair' },
  ],
};
