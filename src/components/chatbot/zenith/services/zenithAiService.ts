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
  | 'edit_profile_help'
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

const normalize = (value: string) => value.toLowerCase().trim().replace(/\s+/g, ' ');

const hasKeyword = (text: string, keywords: string[]) => keywords.some((keyword) => text.includes(keyword));

export const isYes = (value: string) => /^(yes|y|confirm|proceed|ok|sure)$/i.test(value.trim());
export const isNo = (value: string) => /^(no|n|cancel|stop)$/i.test(value.trim());

export const detectIntent = (rawQuery: string): ZenithIntent => {
  const query = normalize(rawQuery);

  if (/show\s+my\s+profile|view\s+my\s+profile|my\s+profile/.test(query)) return 'show_profile';
  if (/what\s+is\s+my\s+cgpa|my\s+cgpa|my\s+gpa/.test(query)) return 'show_cgpa';
  if (/what\s+skills\s+do\s+i\s+have|my\s+skills|show\s+my\s+skills/.test(query)) return 'show_skills';
  if (/best\s+companies|recommend|recommendation/.test(query)) return 'recommend_companies';
  if (/upcoming\s+drives|next\s+drives|upcoming\s+companies/.test(query)) return 'upcoming_drives';
  if (/resume\s+feedback|review\s+my\s+resume|ats/.test(query)) return 'resume_feedback';
  if (/edit\s+my\s+profile|update\s+profile|change\s+profile/.test(query)) return 'edit_profile_help';

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

  return [
    'Your profile details:',
    `Name: ${profile.name}`,
    `Email: ${profile.email}`,
    `Register Number: ${profile.registerNumber || 'Not updated'}`,
    `Department: ${profile.department || 'Not updated'}`,
    `Section: ${profile.section || 'Not updated'}`,
    `CGPA: ${typeof profile.gpa === 'number' ? profile.gpa : 'Not updated'}`,
    `Phone: ${profile.phone || 'Not updated'}`,
    `Skills: ${skillsText}`,
  ].join('\n');
};
