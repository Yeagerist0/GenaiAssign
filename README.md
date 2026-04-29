# Assignment 01 — Persona-Based AI Chatbot

A working persona-based AI chatbot built for Prompt Engineering assignment requirements.  
The app supports three personas with distinct prompting styles:

1. Anshuman Singh  
2. Abhimanyu Saxena  
3. Kshitij Mishra

## Live Project

- **Deployed URL:** Add after deployment (Vercel/Netlify/Railway)

## Features Implemented

- Persona switcher with three personalities
- Conversation reset when persona changes
- Distinct system prompts per persona (with few-shot examples, constraints, internal reasoning instruction, output format guidance)
- Suggestion chips per persona
- Typing indicator during API call
- Responsive UI for mobile + desktop
- Graceful API error handling
- Environment-variable based API key handling

## Tech Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- OpenAI SDK

## Local Setup

```bash
git clone https://github.com/Yeagerist0/GenaiAssign.git
cd GenaiAssign
npm install
cp .env.example .env.local
```

Fill `.env.local`:

```bash
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-4o-mini
```

Run the app:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Deployment (Vercel Recommended)

1. Push this repository to GitHub.
2. Import it in Vercel.
3. Add environment variables:
   - `OPENAI_API_KEY`
   - `OPENAI_MODEL` (optional)
4. Deploy and paste the live URL above.

## Project Files Required by Assignment

- `prompts.md` — all three system prompts with annotations
- `reflection.md` — 300–500 word reflection
- `.env.example` — environment variable template

## Screenshots

Add screenshots after deployment and update this section:

- `screenshots/home.png`
- `screenshots/mobile.png`
