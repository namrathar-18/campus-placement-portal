export type ZenithIntent =
  | "greeting"
  | "upcoming_drives"
  | "resume_tips"
  | "interview_preparation"
  | "eligibility_criteria"
  | "application_status_deadline"
  | "selection_rounds"
  | "portal_usage"
  | "internship_opportunities"
  | "important_announcements"
  | "faq"
  | "unknown_placement"
  | "out_of_scope";

interface KeywordIntentRule {
  intent: ZenithIntent;
  keywords: string[];
}

const PLACEMENT_CONTEXT_KEYWORDS = [
  "placement",
  "company",
  "companies",
  "drive",
  "drives",
  "eligibility",
  "application",
  "apply",
  "status",
  "deadline",
  "resume",
  "cv",
  "interview",
  "round",
  "aptitude",
  "internship",
  "job",
  "recruiter",
  "portal",
  "announcement",
];

const OUT_OF_SCOPE_KEYWORDS = [
  "admission",
  "fees",
  "fee",
  "tuition",
  "exam",
  "semester",
  "syllabus",
  "attendance",
  "hostel",
  "transport",
  "scholarship",
  "result",
  "marks",
  "academics",
  "canteen",
];

const GREETING_KEYWORDS = ["hi", "hello", "hey", "good morning", "good evening", "good afternoon"];

const INTENT_RULES: KeywordIntentRule[] = [
  {
    intent: "upcoming_drives",
    keywords: ["upcoming drives", "upcoming drive", "new drive", "next drive", "drive schedule"],
  },
  {
    intent: "resume_tips",
    keywords: ["resume", "cv", "resume tips", "resume format", "resume guideline"],
  },
  {
    intent: "interview_preparation",
    keywords: ["interview", "prepare", "preparation", "technical", "hr round", "mock interview"],
  },
  {
    intent: "eligibility_criteria",
    keywords: ["eligibility", "eligible", "criteria", "cgpa", "backlog", "requirements"],
  },
  {
    intent: "application_status_deadline",
    keywords: ["application status", "status", "deadline", "last date", "applied", "application"],
  },
  {
    intent: "selection_rounds",
    keywords: ["selection rounds", "rounds", "selection process", "aptitude round", "gd", "group discussion"],
  },
  {
    intent: "portal_usage",
    keywords: ["how to use", "portal", "upload", "profile", "navigate", "dashboard"],
  },
  {
    intent: "internship_opportunities",
    keywords: ["internship", "intern", "internship opportunities"],
  },
  {
    intent: "important_announcements",
    keywords: ["announcement", "announcements", "notice", "update"],
  },
  {
    intent: "faq",
    keywords: ["faq", "frequently asked", "common questions", "help"],
  },
];

const OUT_OF_SCOPE_MESSAGE = "I'm Zenith, your Placement Assistant. I can help only with placement-related queries.";

const normalize = (text: string) => text.toLowerCase().trim().replace(/\s+/g, " ");

const includesAny = (text: string, keywords: string[]) => keywords.some((keyword) => text.includes(keyword));

const detectIntent = (query: string): ZenithIntent => {
  const normalized = normalize(query);

  if (includesAny(normalized, GREETING_KEYWORDS)) {
    return "greeting";
  }

  for (const rule of INTENT_RULES) {
    if (includesAny(normalized, rule.keywords)) {
      return rule.intent;
    }
  }

  const hasPlacementContext = includesAny(normalized, PLACEMENT_CONTEXT_KEYWORDS);
  const hasOutOfScopeTopic = includesAny(normalized, OUT_OF_SCOPE_KEYWORDS);

  if (!hasPlacementContext || hasOutOfScopeTopic) {
    return "out_of_scope";
  }

  return "unknown_placement";
};

export interface ZenithResponseContext {
  upcomingDrivesSummary?: string;
  applicationStatusSummary?: string;
  deadlineSummary?: string;
}

export const getZenithResponse = (query: string, context?: ZenithResponseContext) => {
  const intent = detectIntent(query);

  switch (intent) {
    case "greeting":
      return "Zenith is ready to help with placement-related queries such as drives, eligibility, applications, resume guidance, and interview preparation.";

    case "upcoming_drives":
      return context?.upcomingDrivesSummary
        ? `Upcoming drives: ${context.upcomingDrivesSummary}`
        : "To view upcoming drives, open the Companies or Notifications section in the portal. If the latest schedule is not visible, contact the Placement Cell.";

    case "resume_tips":
      return "Keep your resume one page, highlight measurable achievements, list relevant projects and skills, and tailor keywords to each company role. Keep formatting clean and consistent.";

    case "interview_preparation":
      return "Prepare core CS fundamentals, practice aptitude and coding questions, review your projects deeply, and rehearse concise HR answers. Focus on communication clarity and structured problem solving.";

    case "eligibility_criteria":
      return "Eligibility usually depends on minimum GPA, backlog policy, branch requirements, and graduation year. Check the company listing details for exact criteria before applying.";

    case "application_status_deadline":
      return [
        context?.applicationStatusSummary ? `Application status: ${context.applicationStatusSummary}` : "Check your current status in Student > Applications.",
        context?.deadlineSummary
          ? `Deadlines: ${context.deadlineSummary}`
          : "For company deadlines, open each company card and verify the listed last date.",
      ].join(" ");

    case "selection_rounds":
      return "Most companies follow aptitude/online assessment, technical interview, and HR interview. Some may add coding rounds, case discussions, or group discussions.";

    case "portal_usage":
      return "Complete your profile, upload resume, review company eligibility, apply before deadlines, and track updates in Applications and Notifications. Keep your profile data current.";

    case "internship_opportunities":
      return "Internship opportunities are posted in company listings. Use filters and role details to identify internship openings and apply before the deadline.";

    case "important_announcements":
      return "Important placement updates are available in Notifications and announcements within the portal. If an expected update is missing, contact the Placement Cell.";

    case "faq":
      return "Common topics include eligibility, application steps, resume standards, interview rounds, and result timelines. Ask any placement-specific question and Zenith will guide you.";

    case "unknown_placement":
      return "I do not have enough information for that placement query right now. Please contact the Placement Cell for exact details.";

    case "out_of_scope":
    default:
      return OUT_OF_SCOPE_MESSAGE;
  }
};

export const zenithOutOfScopeMessage = OUT_OF_SCOPE_MESSAGE;
