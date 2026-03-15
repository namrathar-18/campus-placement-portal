import type { PendingProfileUpdate, ZenithProfile } from '../types';

export const OUT_OF_SCOPE_REPLY =
  "I'm Zenith, your Placement Assistant. I can help only with placement-related queries.";

export const UNAVAILABLE_DATA_REPLY =
  "I don't have access to that information. Please contact Placement Cell.";

type ZenithIntent =
  | 'show_profile'
  | 'show_cgpa'
  | 'show_skills'
  | 'recommend_companies'
  | 'upcoming_drives'
  | 'resume_feedback'
  | 'placement_resources'
  | 'edit_profile_help'
  | 'application_policy'
  | 'cgpa_edit_policy'
  | 'placed_application_policy'
  | 'profile_update_request'
  | 'unknown_placement'
  | 'out_of_scope';

const placementKeywords = [
  'placement',
  'company',
  'companies',
  'eligibility',
  'drive',
  'drives',
  'application',
  'status',
  'deadline',
  'resume',
  'interview',
  'cgpa',
  'gpa',
  'skills',
  'profile',
  'internship',
  'job',
  'portal',
  'announcement',
];

const outOfScopeKeywords = [
  'admission',
  'fees',
  'academics',
  'syllabus',
  'exam',
  'attendance',
  'hostel',
  'transport',
  'scholarship',
  'marks',
  'result',
  'canteen',
  'personal advice',
];

const resourceKeywords = [
  'resource',
  'resources',
  'link',
  'links',
  'roadmap',
  'course',
  'courses',
  'youtube',
  'material',
  'materials',
  'study plan',
  'prep sources',
];

const normalize = (value: string) => value.toLowerCase().trim().replace(/\s+/g, ' ');

const hasKeyword = (text: string, keywords: string[]) => keywords.some((keyword) => text.includes(keyword));

export const isYes = (value: string) => /^(yes|y|confirm|proceed|ok|sure)$/i.test(value.trim());
export const isNo = (value: string) => /^(no|n|cancel|stop)$/i.test(value.trim());

export const detectIntent = (rawQuery: string): ZenithIntent => {
  const query = normalize(rawQuery);
  const asksCompanyDetailOrUrl =
    /(company\s+(url|website|details)|placed\s+company|my\s+company\s+details|where\s+i\s+am\s+placed)/.test(query);

  if (/show\s+my\s+profile|view\s+my\s+profile|my\s+profile/.test(query)) return 'show_profile';
  if (/what\s+is\s+my\s+cgpa|my\s+cgpa|my\s+gpa/.test(query)) return 'show_cgpa';
  if (/what\s+skills\s+do\s+i\s+have|my\s+skills|show\s+my\s+skills/.test(query)) return 'show_skills';
  if (/best\s+companies|recommend|recommendation/.test(query)) return 'recommend_companies';
  if (/upcoming\s+drives|next\s+drives|upcoming\s+companies/.test(query)) return 'upcoming_drives';
  if (/resume\s+feedback|review\s+my\s+resume|ats/.test(query)) return 'resume_feedback';
  if (asksCompanyDetailOrUrl) return 'unknown_placement';
  if (
    hasKeyword(query, resourceKeywords) &&
    (!hasKeyword(query, outOfScopeKeywords) || hasKeyword(query, placementKeywords))
  ) {
    return 'placement_resources';
  }
  if (/edit\s+my\s+profile|update\s+profile|change\s+profile/.test(query)) return 'edit_profile_help';
  if (
    /can\s+i\s+apply\s+to\s+multiple\s+companies|how\s+many\s+companies\s+can\s+i\s+apply|already\s+applied|apply\s+again|same\s+company\s+again|apply\s+twice/.test(
      query,
    )
  ) {
    return 'application_policy';
  }
  if (/update\s+my\s+(cgpa|gpa)|change\s+my\s+(cgpa|gpa)|edit\s+my\s+(cgpa|gpa)|gpa\s+locked/.test(query)) {
    return 'cgpa_edit_policy';
  }
  if (
    (/placed/.test(query) && /can\s+(i|we|a\s+student)\s+apply.*(other|another|more)/.test(query)) ||
    /(already\s+placed|once\s+placed|after\s+getting\s+placed|i\s+am\s+placed).*(apply|application)/.test(query) ||
    /(apply|application).*(after|once).*(placed)/.test(query)
  ) {
    return 'placed_application_policy';
  }

  if (/update\s+my\s+phone(\s+number)?\s+to\s+/.test(query) || /change\s+my\s+skills\s+to\s+/.test(query)) {
    return 'profile_update_request';
  }

  if (hasKeyword(query, outOfScopeKeywords) && !hasKeyword(query, placementKeywords)) {
    return 'out_of_scope';
  }

  if (!hasKeyword(query, placementKeywords)) {
    return 'out_of_scope';
  }

  return 'unknown_placement';
};

const cleanText = (value: string) => value.replace(/[<>$]/g, '').trim();

export const parseProfileUpdateRequest = (rawQuery: string): PendingProfileUpdate | null => {
  const query = rawQuery.trim();

  const phoneMatch = query.match(/(?:update|change)\s+my\s+phone(?:\s+number)?\s+to\s+([+\d\s-]{10,20})/i);
  if (phoneMatch?.[1]) {
    const phone = phoneMatch[1].replace(/\s|-/g, '');
    if (!/^\+?[0-9]{10,15}$/.test(phone)) {
      return null;
    }

    return {
      payload: { phone },
      summary: `Update phone number to ${phone}`,
    };
  }

  const skillMatch = query.match(/(?:update|change)\s+my\s+skills\s+to\s+(.+)/i);
  if (skillMatch?.[1]) {
    const skills = skillMatch[1]
      .split(',')
      .map((item) => cleanText(item))
      .filter(Boolean)
      .slice(0, 20);

    if (!skills.length) {
      return null;
    }

    return {
      payload: { skills },
      summary: `Update skills to: ${skills.join(', ')}`,
    };
  }

  return null;
};

export const formatProfile = (profile: ZenithProfile) => {
  const skillsText = profile.skills.length ? profile.skills.join(', ') : 'Not updated';
  const placementStatus = profile.isPlaced ? 'Placed' : 'Not placed yet';

  return [
    'Your profile details:',
    `Name: ${profile.name}`,
    `Email: ${profile.email}`,
    `Register Number: ${profile.registerNumber || 'Not updated'}`,
    `Department: ${profile.department || 'Not updated'}`,
    `Section: ${profile.section || 'Not updated'}`,
    `CGPA: ${typeof profile.gpa === 'number' ? profile.gpa : 'Not updated'}`,
    `Placement Status: ${placementStatus}`,
    `Phone: ${profile.phone || 'Not updated'}`,
    `Skills: ${skillsText}`,
  ].join('\n');
};

export const buildPlacementResourcesReply = (rawQuery: string) => {
  const query = normalize(rawQuery);
  const lines: string[] = ['Trusted external placement resources:'];

  if (/dsa|coding|technical|algorithm|data\s*structure|leetcode/.test(query)) {
    lines.push('');
    lines.push('Technical interview preparation:');
    lines.push('1. LeetCode: https://leetcode.com/problemset/');
    lines.push('2. NeetCode Roadmap: https://neetcode.io/roadmap');
    lines.push('3. GeeksforGeeks DSA: https://www.geeksforgeeks.org/data-structures/');
  }

  if (/aptitude|quant|logical|reasoning|verbal/.test(query)) {
    lines.push('');
    lines.push('Aptitude and reasoning:');
    lines.push('1. IndiaBIX Aptitude: https://www.indiabix.com/aptitude/questions-and-answers/');
    lines.push('2. PrepInsta Aptitude: https://prepinsta.com/aptitude/');
  }

  if (/resume|cv|ats/.test(query)) {
    lines.push('');
    lines.push('Resume and ATS optimization:');
    lines.push('1. Overleaf Resume Templates: https://www.overleaf.com/latex/templates/tagged/cv');
    lines.push('2. Harvard Resume Guide: https://ocs.fas.harvard.edu/resumes-cvs-cover-letters/');
    lines.push('3. Resume Worded (ATS tips): https://resumeworded.com/resume-scanner');
  }

  if (/hr|behavioral|behavioural|mock|communication|group\s*discussion|gd/.test(query)) {
    lines.push('');
    lines.push('HR and communication rounds:');
    lines.push('1. Big Interview: https://biginterview.com/');
    lines.push('2. The Muse Interview Questions: https://www.themuse.com/advice/interview-questions-and-answers');
  }

  if (lines.length === 1) {
    lines.push('');
    lines.push('General placement preparation:');
    lines.push('1. LeetCode: https://leetcode.com/');
    lines.push('2. GeeksforGeeks Placement Prep: https://www.geeksforgeeks.org/placements-gq/');
    lines.push('3. IndiaBIX Aptitude: https://www.indiabix.com/');
    lines.push('4. Harvard Resume Guide: https://ocs.fas.harvard.edu/resumes-cvs-cover-letters/');
  }

  lines.push('');
  lines.push('Share your target role and I can narrow this to a 2-week prep plan.');

  return lines.join('\n');
};

export const normalizeAssistantText = (value: string) => {
  return value
    .replace(/\r\n/g, '\n')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\s*\*\s+/gm, '- ')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/\*(\S[^*]*?)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};
