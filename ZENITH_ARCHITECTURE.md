# Zenith – AI Placement Assistant

## Overview
Zenith is implemented as a student-only placement assistant with secure backend APIs and a modular frontend architecture.

## Access Control
- JWT authentication enforced through `protect` middleware.
- Student-only authorization enforced through `authorize('student')` on Zenith routes.
- Profile APIs always use `req.user._id` so a student cannot access another student's data.

## Backend Routes
Base path: `/api/zenith`

- `GET /profile`
  - Returns logged-in student profile used by chatbot.
- `PATCH /profile`
  - Updates allowed fields only (`phone`, `skills`, `certifications`, `projects`, `department`, `section`, `registerNumber`, `resumeText`, `gpa`).
  - Enforces `gpaLocked` restriction.
- `GET /recommendations`
  - Returns top 3 company matches with score and reasons.
- `GET /upcoming-drives`
  - Returns upcoming active drives sorted by deadline.
- `POST /resume-feedback`
  - Returns keyword gaps and ATS-oriented improvement suggestions from resume text.

## Database Schema Example (MongoDB)
```js
{
  _id: ObjectId,
  name: String,
  email: String,
  role: 'student' | 'student_representative' | 'placement_officer' | 'admin',
  registerNumber: String,
  phone: String,
  department: String,
  section: String,
  gpa: Number,
  gpaLocked: Boolean,
  skills: [String],
  certifications: [String],
  projects: [String],
  resumeText: String,
  resumeUrl: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Frontend Architecture
- UI component: `src/components/chatbot/zenith/ZenithAssistant.tsx`
- Chat logic controller: `src/components/chatbot/zenith/hooks/useZenithChat.ts`
- AI service layer: `src/components/chatbot/zenith/services/zenithAiService.ts`
- API service layer: `src/components/chatbot/zenith/services/zenithApi.ts`
- Shared types: `src/components/chatbot/zenith/types.ts`
- Quick replies: `src/components/chatbot/zenith/quickReplies.ts`

## Scalability for OpenAI Integration
Current architecture keeps NLP and backend access separate.
To integrate OpenAI later:
1. Add server-side provider module (e.g., `server/services/aiProvider.js`).
2. Route selected intents through provider.
3. Keep authorization and data retrieval in existing Zenith APIs.
4. Keep frontend unchanged except for invoking new API endpoints.
