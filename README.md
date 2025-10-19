# OllieAI - AI-Powered Mental Health Coaching Platform

**OllieAI** is a comprehensive mental health support platform that combines AI-powered conversational coaching with validated clinical assessments. Built with Next.js 14 and Google Gemini AI, it provides users with personalized mental health support, progress tracking, and interactive assessments like GAD-7.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black)

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Development](#development)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Key Features Walkthrough](#key-features-walkthrough)
- [Future Enhancements](#future-enhancements)
- [Documentation](#documentation)
- [License](#license)

---

## Features

### Core Functionality
- **User Authentication**: Secure authentication with Google OAuth and email/password support via NextAuth.js
- **AI-Powered Coaching**: Real-time conversations with Google Gemini AI providing empathetic mental health support
- **Multiple Conversations**: Create and manage multiple conversation threads
- **Real-time Streaming**: AI responses stream word-by-word for a natural, engaging experience

### Assessment System
- **Interactive Assessments**: In-chat GAD-7 anxiety assessment with beautiful, interactive UI
- **Dynamic Question Flow**: Questions presented one at a time with smooth animations
- **Instant Scoring**: Backend-calculated scores with clinical interpretation
- **Assessment History**: Track all completed assessments over time

### Progress Tracking
- **Milestone Achievements**: Celebrate progress with animated achievements and confetti
  - First assessment completion
  - Score improvements (5+ points)
  - Category improvements (severity level changes)
  - Consistency milestones
- **Visual Dashboard**: Comprehensive dashboard with statistics and charts
- **Progress Visualization**: Line charts showing assessment scores over time using Recharts
- **Trend Analysis**: Track improvement percentages and patterns

### User Experience
- **Responsive Design**: Fully mobile-responsive interface
- **Modern UI**: Clean, professional design with calming purple color scheme
- **Sticky Input**: Message input always accessible at bottom of screen
- **Markdown Support**: Rich text formatting in AI responses
- **Loading States**: Smooth loading indicators and skeleton screens

---

## Tech Stack

### Frontend
- **[Next.js 14](https://nextjs.org/)** - React framework with App Router
- **[React 18](https://react.dev/)** - UI library
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Recharts](https://recharts.org/)** - Data visualization library
- **[React Markdown](https://github.com/remarkjs/react-markdown)** - Markdown rendering
- **[Canvas Confetti](https://github.com/catdad/canvas-confetti)** - Celebration animations

### Backend
- **[Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)** - Serverless API endpoints
- **[NextAuth.js](https://next-auth.js.org/)** - Authentication solution
- **[Drizzle ORM](https://orm.drizzle.team/)** - TypeScript ORM
- **[Neon](https://neon.tech/)** - Serverless Postgres database
- **[Google Gemini API](https://ai.google.dev/)** - AI conversational model
- **[bcrypt](https://github.com/kelektiv/node.bcrypt.js)** - Password hashing

### Development Tools
- **ESLint** - Code linting
- **TypeScript** - Static type checking
- **Drizzle Kit** - Database migrations

### Deployment
- **[Vercel](https://vercel.com/)** - Hosting and continuous deployment

---

## Prerequisites

Before you begin, ensure you have the following:

- **Node.js 18+** and npm/yarn/pnpm installed
- **Git** for version control
- Accounts for the following services:
  - [Google Cloud Console](https://console.cloud.google.com/) (for OAuth and Gemini API)
  - [Neon](https://neon.tech/) (for PostgreSQL database)
  - [Vercel](https://vercel.com/) (for deployment)

---

## Getting Started

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd OA
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and fill in all required values. See [Environment Variables](#environment-variables) section below.

### 4. Set Up Database

See the [Database Setup](#database-setup) section for detailed instructions.

### 5. Run Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-generate-with-openssl"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Google Gemini AI
GEMINI_API_KEY="your-gemini-api-key"
```

### Generating NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

For detailed setup instructions for each service, see [SETUP.md](./SETUP.md).

---

## Database Setup

### Step 1: Create Neon Database

1. Sign up at [Neon](https://neon.tech/)
2. Create a new project
3. Copy the connection string
4. Add it to your `.env` file as `DATABASE_URL`

### Step 2: Push Database Schema

```bash
npm run db:push
```

This creates all necessary tables using Drizzle ORM.

### Step 3: Seed Initial Data

```bash
npm run db:seed
```

This populates the database with:
- Assessment types (GAD-7, PHQ-9)
- Assessment questions with scoring rules
- Severity level thresholds

### Step 4: Verify Database

You can use Drizzle Studio to browse your database:

```bash
npm run db:studio
```

This opens a web interface to explore your database schema and data.

---

## Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Type checking
npm run type-check

# Database operations
npm run db:push        # Push schema changes
npm run db:seed        # Seed initial data
npm run db:studio      # Open Drizzle Studio
npm run db:generate    # Generate migrations
```

### Project Commands

- **Start Development**: `npm run dev`
- **Build**: `npm run build`
- **Database Studio**: `npm run db:studio`
- **Type Check**: `npm run type-check`

---

## Deployment

### Deploy to Vercel

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Configure Environment Variables**:
   - Add all variables from `.env` to Vercel
   - Update `NEXTAUTH_URL` to your production domain
   - Ensure `DATABASE_URL` points to your production database

4. **Deploy**:
   - Click "Deploy"
   - Vercel will build and deploy automatically

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

---

## Project Structure

```
OA/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── auth/                 # NextAuth endpoints
│   │   ├── conversations/        # Conversation CRUD
│   │   ├── assessments/          # Assessment endpoints
│   │   └── dashboard/            # Dashboard stats
│   ├── auth/                     # Auth pages (signin, signup)
│   ├── dashboard/                # Main app pages
│   │   ├── chat/[id]/           # Chat conversation view
│   │   └── assessments/          # Assessment history
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page
├── components/                   # React components
│   ├── chat/                     # Chat-related components
│   │   ├── ChatInterface.tsx     # Main chat UI
│   │   ├── Message.tsx           # Message display
│   │   ├── AssessmentUI.tsx      # Interactive assessment
│   │   └── MilestoneAchievement.tsx  # Celebration component
│   ├── dashboard/                # Dashboard components
│   │   ├── AssessmentStats.tsx   # Statistics cards
│   │   └── AssessmentChart.tsx   # Progress charts
│   └── ui/                       # Reusable UI components
├── lib/                          # Utility libraries
│   ├── db/                       # Database layer
│   │   ├── client.ts             # Drizzle client
│   │   ├── schema.ts             # Database schema
│   │   └── queries.ts            # Database queries
│   ├── ai/                       # AI integration
│   │   └── gemini.ts             # Gemini API client
│   ├── auth/                     # Auth configuration
│   │   └── config.ts             # NextAuth config
│   ├── assessments/              # Assessment logic
│   │   ├── scoring.ts            # Scoring algorithms
│   │   └── achievements.ts       # Milestone detection
│   └── utils/                    # Utility functions
│       └── stream.ts             # SSE streaming utils
├── hooks/                        # Custom React hooks
│   └── useStreamingChat.ts       # Streaming chat hook
├── types/                        # TypeScript types
│   └── index.ts                  # Shared type definitions
├── scripts/                      # Utility scripts
│   └── seed.ts                   # Database seeding
├── public/                       # Static assets
├── .env                          # Environment variables (not committed)
├── .env.example                  # Environment template
├── tailwind.config.ts            # Tailwind configuration
├── drizzle.config.ts             # Drizzle ORM config
└── package.json                  # Dependencies
```

---

## Key Features Walkthrough

### 1. Authentication
- Users can sign up with email/password or Google OAuth
- Secure session management with NextAuth.js
- Password hashing with bcrypt
- Protected routes throughout the application

### 2. AI Conversations
- Start a new conversation from the dashboard
- Send messages and receive streaming AI responses
- AI powered by Google Gemini 2.0 Flash
- Context-aware responses based on conversation history
- Markdown formatting support for rich text

### 3. GAD-7 Assessment
- AI suggests assessment when anxiety is mentioned
- Interactive UI presents questions one at a time
- Progress bar shows completion status
- Backend calculates score and severity level
- Results stored in database for tracking

### 4. Milestone Celebrations
- **First Assessment**: Welcome celebration
- **Score Improvement**: Triggered by 5+ point improvement
- **Category Improvement**: Moving to a better severity level
- **Consistency**: Maintaining minimal/mild symptoms
- Animated cards with confetti effects

### 5. Progress Dashboard
- View all completed assessments
- Line charts showing score trends over time
- Statistics cards with improvement percentages
- Recent assessment list
- Conversation history

### 6. Streaming Responses
- Real-time text streaming using Server-Sent Events (SSE)
- Smooth 60fps rendering with requestAnimationFrame
- Dynamic component injection during stream
- Milestone achievements appear mid-stream

---

## Future Enhancements

Potential features for future development:

- **Additional Assessments**: PHQ-9 (depression), PSS (stress), more clinical tools
- **Advanced Analytics**: Correlation analysis, trend predictions
- **Journaling**: Daily mood tracking and journal entries
- **Reminders**: Assessment reminders and check-ins
- **Export Data**: Download assessment history as PDF/CSV
- **Therapist Dashboard**: Professional view for monitoring patients
- **Crisis Support**: Emergency resources and hotline integration
- **Mobile App**: React Native companion app
- **Group Support**: Community features and peer support
- **Customization**: Themes, AI personality settings
- **Multi-language**: Internationalization support
- **Voice Input**: Speech-to-text for accessibility
- **Integration**: Connect with wearables, calendar apps

---

## Documentation

Comprehensive documentation is available in the following files:

- **[SETUP.md](./SETUP.md)** - Detailed environment setup guide
- **[DECISIONS.md](./DECISIONS.md)** - Architectural decisions and rationale
- **[API.md](./API.md)** - Complete API documentation
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Vercel deployment guide
- **[SECURITY.md](./SECURITY.md)** - Security measures and best practices
- **[TESTING.md](./TESTING.md)** - Manual testing checklist

---

## License

This project is licensed under the MIT License. See [LICENSE](./LICENSE) for details.

---

## Acknowledgments

- **Google Gemini AI** for powering the conversational experience
- **Neon** for providing serverless PostgreSQL infrastructure
- **Vercel** for seamless deployment and hosting
- **Next.js Team** for the amazing framework
- Clinical assessment scales (GAD-7, PHQ-9) developed and validated by healthcare professionals

---

## Support

For issues, questions, or contributions:

1. Check the [documentation](#documentation) first
2. Review [TESTING.md](./TESTING.md) for common issues
3. Open an issue on GitHub with detailed information

---

**Built with care for mental health support** 💜
