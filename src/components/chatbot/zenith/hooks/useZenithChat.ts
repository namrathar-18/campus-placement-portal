import { useEffect, useMemo, useRef, useState } from 'react';
import type { PendingProfileUpdate, ZenithMessage, ZenithProfile } from '../types';
import { zenithApi } from '../services/zenithApi';
import {
  OUT_OF_SCOPE_REPLY,
  UNAVAILABLE_DATA_REPLY,
  detectIntent,
  formatProfile,
  isNo,
  isYes,
  parseProfileUpdateRequest,
} from '../services/zenithAiService';
import { getZenithResponse, type ChatHistoryEntry } from '../../zenithEngine';

interface UseZenithChatOptions {
  userId: string;
}

interface SessionContext {
  lastIntent?: string;
  lastProfile?: ZenithProfile;
  pendingUpdate: PendingProfileUpdate | null;
}

const makeMessage = (sender: ZenithMessage['sender'], text: string): ZenithMessage => ({
  id: `${sender}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  sender,
  text,
  createdAt: new Date().toISOString(),
});

const welcomeText =
  'Zenith – AI Placement Assistant is active. Ask placement-related questions about profile, eligibility, upcoming drives, recommendations, and resume feedback.';

export const useZenithChat = ({ userId }: UseZenithChatOptions) => {
  const [messages, setMessages] = useState<ZenithMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const contextRef = useRef<SessionContext>({ pendingUpdate: null });
  const timerRef = useRef<number | null>(null);
  const geminiHistory = useRef<ChatHistoryEntry[]>([]);
  const portalContextRef = useRef<string | undefined>(undefined);

  const storageKey = useMemo(() => `zenith-advanced-chat:${userId}`, [userId]);

  useEffect(() => {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as ZenithMessage[];
        if (Array.isArray(parsed) && parsed.length) {
          setMessages(parsed);
        } else {
          setMessages([makeMessage('assistant', welcomeText)]);
        }
      } catch {
        setMessages([makeMessage('assistant', welcomeText)]);
      }
    } else {
      setMessages([makeMessage('assistant', welcomeText)]);
    }

    setIsHydrated(true);

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, [storageKey]);

  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem(storageKey, JSON.stringify(messages));
  }, [messages, isHydrated, storageKey]);

  const respond = async (input: string) => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    const userMessage = makeMessage('user', trimmedInput);
    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    const execute = async () => {
      const pendingUpdate = contextRef.current.pendingUpdate;

      if (pendingUpdate) {
        if (isYes(trimmedInput)) {
          try {
            const updatedProfile = await zenithApi.updateProfile(pendingUpdate.payload);
            contextRef.current.pendingUpdate = null;
            contextRef.current.lastProfile = updatedProfile;
            setMessages((prev) => [
              ...prev,
              makeMessage('assistant', `Profile updated successfully.\n${formatProfile(updatedProfile)}`),
            ]);
          } catch (error: any) {
            contextRef.current.pendingUpdate = null;
            setMessages((prev) => [
              ...prev,
              makeMessage('assistant', error?.message || UNAVAILABLE_DATA_REPLY),
            ]);
          }
          setIsTyping(false);
          return;
        }

        if (isNo(trimmedInput)) {
          contextRef.current.pendingUpdate = null;
          setMessages((prev) => [...prev, makeMessage('assistant', 'Update request cancelled.')]);
          setIsTyping(false);
          return;
        }

        setMessages((prev) => [
          ...prev,
          makeMessage('assistant', 'Please reply with yes to confirm or no to cancel the pending profile update.'),
        ]);
        setIsTyping(false);
        return;
      }

      const updateRequest = parseProfileUpdateRequest(trimmedInput);
      if (updateRequest) {
        contextRef.current.pendingUpdate = updateRequest;
        setMessages((prev) => [
          ...prev,
          makeMessage('assistant', `Please confirm this change:\n${updateRequest.summary}\nReply yes to continue or no to cancel.`),
        ]);
        setIsTyping(false);
        return;
      }

      const intent = detectIntent(trimmedInput);
      contextRef.current.lastIntent = intent;

      try {
        if (intent === 'show_profile') {
          const profile = await zenithApi.getProfile();
          contextRef.current.lastProfile = profile;
          setMessages((prev) => [...prev, makeMessage('assistant', formatProfile(profile))]);
          setIsTyping(false);
          return;
        }

        if (intent === 'show_cgpa') {
          const profile = contextRef.current.lastProfile || (await zenithApi.getProfile());
          contextRef.current.lastProfile = profile;
          setMessages((prev) => [
            ...prev,
            makeMessage(
              'assistant',
              typeof profile.gpa === 'number' ? `Your CGPA is ${profile.gpa}.` : UNAVAILABLE_DATA_REPLY,
            ),
          ]);
          setIsTyping(false);
          return;
        }

        if (intent === 'show_skills') {
          const profile = contextRef.current.lastProfile || (await zenithApi.getProfile());
          contextRef.current.lastProfile = profile;
          setMessages((prev) => [
            ...prev,
            makeMessage(
              'assistant',
              profile.skills.length ? `Your skills are: ${profile.skills.join(', ')}.` : 'Skills are not updated in your profile.',
            ),
          ]);
          setIsTyping(false);
          return;
        }

        if (intent === 'recommend_companies') {
          const recommendations = await zenithApi.getRecommendations();
          if (!recommendations.length) {
            setMessages((prev) => [...prev, makeMessage('assistant', UNAVAILABLE_DATA_REPLY)]);
            setIsTyping(false);
            return;
          }

          const summary = recommendations
            .slice(0, 3)
            .map(
              (item, index) => {
                const pkg = item.salary || (item.package ? `${item.package} LPA` : null);
                const deadline = new Date(item.deadline).toLocaleDateString();
                return `${index + 1}. ${item.name} — ${item.role}${pkg ? ` | ${pkg}` : ''} | Deadline: ${deadline}`;
              }
            )
            .join('\n');

          setMessages((prev) => [...prev, makeMessage('assistant', `Top matching companies:\n${summary}`)]);
          setIsTyping(false);
          return;
        }

        if (intent === 'upcoming_drives') {
          const upcoming = await zenithApi.getUpcomingDrives();
          if (!upcoming.length) {
            setMessages((prev) => [...prev, makeMessage('assistant', UNAVAILABLE_DATA_REPLY)]);
            setIsTyping(false);
            return;
          }

          const summary = upcoming
            .map((item, index) => {
              const date = new Date(item.deadline).toLocaleDateString();
              return `${index + 1}. ${item.name} (${item.role}) - Deadline: ${date}, Min CGPA: ${item.minGpa}`;
            })
            .join('\n');

          setMessages((prev) => [...prev, makeMessage('assistant', `Upcoming drives:\n${summary}`)]);
          setIsTyping(false);
          return;
        }

        if (intent === 'resume_feedback') {
          const feedback = await zenithApi.getResumeFeedback();
          const missingKeywords = feedback.missingKeywords.length
            ? `Missing keywords: ${feedback.missingKeywords.join(', ')}`
            : 'Missing keywords: No major keyword gaps detected.';
          const improvements = feedback.improvements.length
            ? `Improvements: ${feedback.improvements.join(' | ')}`
            : 'Improvements: Add measurable project outcomes and role-specific keywords.';

          setMessages((prev) => [...prev, makeMessage('assistant', `${missingKeywords}\n${improvements}`)]);
          setIsTyping(false);
          return;
        }

        if (intent === 'edit_profile_help') {
          setMessages((prev) => [
            ...prev,
            makeMessage(
              'assistant',
              'You can update profile details through chat commands.\nExamples:\n- Update my phone number to 9876543210\n- Change my skills to React, Node, SQL',
            ),
          ]);
          setIsTyping(false);
          return;
        }

        // unknown_placement or out_of_scope — let Gemini answer with live portal data
        if (!portalContextRef.current) {
          try {
            const [profile, drives, recs] = await Promise.all([
              zenithApi.getProfile(),
              zenithApi.getUpcomingDrives(),
              zenithApi.getRecommendations(),
            ]);
            contextRef.current.lastProfile = profile;
            const driveLines = drives.map(
              (d) => `  - ${d.name} | Role: ${d.role} | Deadline: ${new Date(d.deadline).toLocaleDateString()} | Min CGPA: ${d.minGpa}${d.salary ? ` | Package: ${d.salary}` : ''}`
            ).join('\n') || '  None currently.';
            const recLines = recs.map(
              (r) => {
                const pkg = r.salary || (r.package ? `${r.package} LPA` : null);
                return `  - ${r.name} (${r.role})${pkg ? ` | ${pkg}` : ''} | Min CGPA: ${r.minGpa} | CGPA eligible: ${r.gpaEligible ? 'Yes' : 'No'}`;
              }
            ).join('\n') || '  None.';
            portalContextRef.current = [
              `Student Name: ${profile.name}`,
              `Department: ${profile.department || 'N/A'}`,
              `Section: ${profile.section || 'N/A'}`,
              `CGPA: ${profile.gpa ?? 'N/A'}`,
              `Skills: ${profile.skills.length ? profile.skills.join(', ') : 'None listed'}`,
              `Certifications: ${profile.certifications.length ? profile.certifications.join(', ') : 'None listed'}`,
              `Projects: ${profile.projects.length ? profile.projects.join(', ') : 'None listed'}`,
              `Resume Summary: ${profile.resumeText ? profile.resumeText.slice(0, 500) : 'Not uploaded'}`,
              `\nUpcoming Drives:\n${driveLines}`,
              `\nTop Company Recommendations:\n${recLines}`,
            ].join('\n');
          } catch {
            // context fetch failed — Gemini will still answer generically
          }
        }
        const geminiReply = await getZenithResponse(trimmedInput, geminiHistory.current, portalContextRef.current);
        geminiHistory.current = [
          ...geminiHistory.current,
          { role: 'user', parts: [{ text: trimmedInput }] },
          { role: 'model', parts: [{ text: geminiReply }] },
        ];
        setMessages((prev) => [...prev, makeMessage('assistant', geminiReply)]);
      } catch (error: any) {
        setMessages((prev) => [
          ...prev,
          makeMessage('assistant', error?.message || UNAVAILABLE_DATA_REPLY),
        ]);
      } finally {
        setIsTyping(false);
      }
    };

    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }

    timerRef.current = window.setTimeout(() => {
      void execute();
    }, 650);
  };

  const clearChat = () => {
    contextRef.current = { pendingUpdate: null };
    geminiHistory.current = [];
    portalContextRef.current = undefined;
    const initial = [makeMessage('assistant', welcomeText)];
    setMessages(initial);
    localStorage.setItem(storageKey, JSON.stringify(initial));
  };

  return {
    messages,
    isTyping,
    respond,
    clearChat,
  };
};
