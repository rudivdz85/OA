# Architectural Decisions

This document chronicles all major technical decisions made during the development of OllieAI, explaining the rationale behind each choice and alternatives considered.

---

## Table of Contents

- [Phase 1: Project Foundation](#phase-1-project-foundation)
- [Phase 2: Authentication Strategy](#phase-2-authentication-strategy)
- [Phase 3: Database Design](#phase-3-database-design)
- [Phase 4: AI Integration](#phase-4-ai-integration)
- [Phase 5: Assessment System](#phase-5-assessment-system)
- [Phase 6: UI/UX Design](#phase-6-uiux-design)
- [Phase 7: Dashboard & Visualization](#phase-7-dashboard--visualization)
- [Phase 8: Streaming & Real-time Features](#phase-8-streaming--real-time-features)

---

## Phase 1: Project Foundation

### Decision: Next.js 14 with App Router

**Chosen**: Next.js 14 with App Router

**Why**:
- **Server Components**: Improved performance with server-side rendering by default
- **File-based Routing**: Intuitive folder structure for pages and API routes
- **Built-in Optimizations**: Image optimization, font optimization, automatic code splitting
- **API Routes**: Serverless functions co-located with frontend code
- **React 18 Features**: Native support for Suspense, streaming, and concurrent rendering
- **Developer Experience**: Hot module replacement, fast refresh, TypeScript support out of the box

### Decision: TypeScript

**Chosen**: TypeScript for all code

**Why**:
- **Type Safety**: Catch errors at compile time, not runtime
- **Better IDE Support**: Autocomplete, refactoring, inline documentation
- **Self-Documenting**: Types serve as documentation for functions and data structures
- **Reduced Bugs**: Fewer runtime type errors, especially in large codebases
- **Team Collaboration**: Clearer contracts between components and functions

**Alternatives Considered**:
- **JavaScript with JSDoc**: Type annotations in comments
  - *Rejected*: Less robust, requires discipline, tooling not as good
- **Plain JavaScript**: No type checking
  - *Rejected*: Too error-prone for a production health application

### Decision: Tailwind CSS

**Chosen**: Tailwind CSS for styling

**Why**:
- **Rapid Development**: Utility classes enable fast prototyping
- **Consistency**: Design system built into class names
- **Purging**: Unused styles removed in production (small bundle size)
- **Responsive Design**: Mobile-first utilities built in
- **Customization**: Easy to extend with custom colors, spacing, etc.
- **No Context Switching**: Write styles directly in JSX

---

## Phase 2: Authentication Strategy

### Decision: NextAuth.js

**Chosen**: NextAuth.js for authentication

**Why**:
- **Next.js Integration**: Built specifically for Next.js
- **Multiple Providers**: Easy to add Google, GitHub, email/password, etc.
- **Session Management**: Built-in JWT and database session strategies
- **Security**: CSRF protection, encrypted cookies, secure defaults
- **Community**: Well-documented, active maintenance, large ecosystem
- **Flexibility**: Custom providers, callbacks, and adapters


### Decision: Google OAuth + Email/Password

**Chosen**: Dual authentication methods

**Why**:
- **User Choice**: Different users prefer different login methods
- **Accessibility**: Email/password works for users without Google accounts
- **Convenience**: Google OAuth for one-click login
- **Professional**: Many mental health users prefer Google for professional use
- **Flexibility**: Easy to add more providers later (Facebook, Apple, etc.)

### Decision: JWT Session Strategy

**Chosen**: JWT tokens for session management

**Why**:
- **Stateless**: No database lookup on every request
- **Scalability**: Works across multiple servers without shared state
- **Performance**: Faster than database session lookups
- **Serverless-Friendly**: Compatible with Vercel's edge functions
- **Simple**: No session storage infrastructure needed

**Alternatives Considered**:
- **Database Sessions**: Store sessions in database
  - *Rejected*: Additional database queries, slower, more infrastructure
- **Redis Sessions**: Fast in-memory storage
  - *Rejected*: Additional service dependency, cost, complexity

---

## Phase 3: Database Design

### Decision: Neon PostgreSQL

**Chosen**: Neon serverless PostgreSQL

**Why**:
- **Serverless**: Automatic scaling, pay for what you use
- **PostgreSQL**: Industry-standard, reliable, feature-rich SQL database
- **Developer-Friendly**: Generous free tier, easy setup, great dashboard
- **Branching**: Database branching for development (like Git for databases)
- **Performance**: Fast queries, built-in connection pooling
- **Compatibility**: Works seamlessly with Drizzle ORM

### Decision: Drizzle ORM

**Chosen**: Drizzle ORM for database access

**Why**:
- **Type Safety**: Full TypeScript support with inferred types
- **Lightweight**: No runtime overhead, compiles to SQL
- **Developer Experience**: Great autocomplete, migrations, schema introspection
- **SQL-Like**: Doesn't hide SQL, easy to understand and optimize
- **Migration Tools**: Built-in migration generation and management
- **Drizzle Studio**: Visual database browser


### Decision: Schema Design - Generic Assessment System

**Chosen**: Flexible, database-driven assessment system

**Why**:
- **Scalability**: Easy to add new assessment types (PHQ-9, PSS, etc.) without code changes
- **Flexibility**: Questions and scoring rules in database, not hardcoded
- **Versioning**: Support multiple versions of same assessment
- **Configurability**: Non-technical users could eventually manage assessments
- **Data Integrity**: Referential integrity with foreign keys
- **Analytics**: Rich querying for progress tracking and insights

**Schema Highlights**:
- `assessmentTypes`: Metadata for each assessment (GAD-7, PHQ-9, etc.)
- `assessmentQuestions`: Questions linked to assessment types
- `assessments`: User's completed assessments
- `assessmentAnswers`: Individual question responses
- `conversations`: Chat conversation threads
- `messages`: Individual messages in conversations

### Decision: JSONB for Flexible Data

**Chosen**: Use JSONB for `metadata`, `answers`, and other variable data

**Why**:
- **Flexibility**: Store variable structure data without schema changes
- **PostgreSQL Features**: Queryable, indexable JSON in Postgres
- **Future-Proofing**: Easy to add new fields without migrations
- **Performance**: JSONB is binary format, faster than text JSON

**Use Cases**:
- Message metadata (assessment offers, etc.)
- Assessment scoring details
- User preferences
- AI response metadata (usage stats, model version)

---

## Phase 4: AI Integration

### Decision: Google Gemini API

**Chosen**: Google Gemini 2.0 Flash Experimental

**Why**:
- **Project Requirement**: Specified by assessment brief
- **Performance**: Fast response times, good for real-time chat
- **Cost-Effective**: Competitive pricing, generous free tier
- **Multimodal**: Future potential for image/video understanding
- **Context Window**: Large context window for conversation history
- **Google Ecosystem**: Well-integrated with Google Cloud

### Decision: Migration to @google/genai SDK

**Chosen**: New `@google/genai` SDK instead of legacy Gemini SDK

**Why**:
- **Modern API**: Newer, more actively maintained
- **Better TypeScript Support**: Improved type definitions
- **Simpler Streaming**: Easier async generator pattern
- **Future-Proof**: Google's recommended SDK going forward
- **Better Documentation**: More examples, clearer guides

**Migration Notes**:
- Old SDK: `@google/generative-ai`
- New SDK: `@google/genai`
- Updated all imports and API calls
- Simplified streaming implementation

### Decision: Model Selection - gemini-2.0-flash-exp

**Chosen**: `gemini-2.0-flash-exp` model

**Why**:
- **Speed**: Optimized for low-latency responses
- **Quality**: Excellent balance of speed and response quality
- **Cost**: More affordable than Pro models
- **Streaming**: Works well with streaming responses
- **Experimental Features**: Access to latest capabilities

### Decision: System Prompt Design

**Chosen**: Empathetic mental health coach persona

**Key Characteristics**:
- Warm, supportive, non-judgmental tone
- Active listening and validation
- Evidence-based suggestions (CBT, mindfulness)
- Crisis resources when needed
- Assessment recommendations based on conversation

**Why**:
- **User Safety**: Clear boundaries, not a replacement for therapy
- **Engagement**: Empathetic tone encourages user openness
- **Professionalism**: Maintains therapeutic language
- **Actionable**: Provides concrete coping strategies

---

## Phase 5: Assessment System

### Decision: Backend Scoring

**Chosen**: Calculate scores on the server, not client

**Why**:
- **Security**: Prevent score manipulation
- **Data Integrity**: Single source of truth
- **Consistency**: Centralized scoring logic
- **Auditability**: Server logs for debugging
- **Flexibility**: Easy to update scoring algorithms

### Decision: Database-Driven Questions

**Chosen**: Store questions, options, and scoring in database

**Why**:
- **Maintainability**: Update questions without code deployment
- **Versioning**: Track assessment versions over time
- **Internationalization**: Future support for multiple languages
- **A/B Testing**: Experiment with question wording
- **Clinical Updates**: Reflect updated clinical guidelines

**Implementation**:
- `assessmentQuestions` table with scoring rules
- JSONB field for question options
- Order field for question sequence
- Active flag for question management

### Decision: Interactive UI Components

**Chosen**: Custom React components for assessment flow

**Why**:
- **User Experience**: Better than plain text Q&A
- **Engagement**: Visual progress, smooth animations
- **Accessibility**: Proper ARIA labels, keyboard navigation
- **Mobile-Friendly**: Touch-optimized inputs
- **Professional**: Polished, clinical feel

**Components Built**:
- `AssessmentUI.tsx`: Main assessment container
- `AssessmentOffer.tsx`: Start assessment button
- Progress bar with percentage
- Question cards with animations
- Result display with interpretation

### Decision: Track Incomplete Assessments

**Chosen**: Store in-progress assessments in database

**Why**:
- **Resume Later**: Users can complete assessment later
- **Data Recovery**: Don't lose partial progress
- **Analytics**: Understand drop-off points
- **User Experience**: Reduces frustration

**Implementation**:
- `status` field: 'in_progress' | 'completed' | 'abandoned'
- Store individual answers as they're submitted
- Complete assessment when all questions answered

---

## Phase 6: UI/UX Design

### Decision: Deep Purple Color Scheme

**Chosen**: Purple-based brand colors with gradients

**Why**:
- **Psychology**: Purple associated with calmness, healing, introspection
- **Professional**: Conveys trust and authority in healthcare
- **Differentiation**: Stands out from typical blue healthcare apps
- **Accessibility**: High contrast options, readable text
- **Modern**: Gradients and soft colors feel contemporary

**Color Palette**:
- Primary: Purple/violet shades
- Secondary: Complementary purple tones
- Accent: Warm accent colors for CTAs
- Neutral: Grays for text and backgrounds

### Decision: Component-Based Architecture

**Chosen**: Modular, reusable React components

**Why**:
- **Reusability**: Use components across multiple pages
- **Maintainability**: Easier to update and test
- **Consistency**: Same components = consistent UX
- **Collaboration**: Clear component boundaries
- **Performance**: Easier to optimize individual components

**Component Organization**:
- `/components/chat/`: Chat-specific components
- `/components/dashboard/`: Dashboard widgets
- `/components/ui/`: Reusable UI primitives
- `/components/auth/`: Authentication forms

### Decision: Responsive-First Design

**Chosen**: Mobile-first responsive design

**Why**:
- **User Access**: Many users access mental health resources on mobile
- **Progressive Enhancement**: Start with mobile, enhance for desktop
- **Tailwind Utilities**: Built-in responsive breakpoints
- **Touch-Friendly**: Larger tap targets, swipe gestures

**Breakpoints**:
- Mobile: Default (< 640px)
- Tablet: `md:` (768px+)
- Desktop: `lg:` (1024px+)
- Wide: `xl:` (1280px+)

### Decision: Sticky Input at Bottom

**Chosen**: Fixed input field at bottom of viewport

**Why**:
- **Accessibility**: Always visible, no scrolling needed
- **Familiar Pattern**: Common in messaging apps (WhatsApp, Slack)
- **Efficiency**: Faster message composition
- **Mobile-Friendly**: Natural thumb position on phones

**Implementation**:
- `position: fixed` with `bottom-0`
- Message area with `padding-bottom` for input height
- z-index layering for proper stacking

---

## Phase 7: Dashboard & Visualization

### Decision: Recharts for Data Visualization

**Chosen**: Recharts library for charts and graphs

**Why**:
- **React Integration**: Built for React, component-based
- **Customization**: Highly customizable appearance
- **Responsive**: Automatically adjusts to container size
- **TypeScript Support**: Good type definitions
- **Documentation**: Comprehensive examples and guides
- **Performance**: Efficient rendering with React

### Decision: Progress Tracking Over Time

**Chosen**: Line charts showing assessment scores chronologically

**Why**:
- **Trend Visualization**: Easy to see improvement/decline
- **Motivation**: Visual progress encourages continued use
- **Clinical Value**: Helps identify patterns
- **User Engagement**: Interactive, informative

**Chart Features**:
- Multiple assessment types on same chart
- Color-coded severity zones
- Tooltips with date and score
- Responsive to screen size

### Decision: Statistics Dashboard

**Chosen**: Card-based stats with key metrics

**Why**:
- **At-a-Glance**: Quick overview of progress
- **Motivation**: Highlight improvements
- **Gamification**: Total assessments, streaks, etc.
- **Professional**: Clinical-looking dashboard

**Metrics Displayed**:
- Total assessments completed
- Latest score and severity
- Improvement percentage
- Trend direction (improving/stable/worsening)

---

## Phase 8: Streaming & Real-time Features

### Decision: Server-Sent Events (SSE) for Streaming

**Chosen**: SSE for streaming AI responses

**Why**:
- **Simplicity**: Easier than WebSockets for one-way streaming
- **HTTP-Based**: Works over standard HTTP, no special server setup
- **Automatic Reconnection**: Browser handles reconnection
- **Serverless-Friendly**: Compatible with Vercel edge functions
- **No External Dependencies**: Built into browsers and Node.js

### Decision: requestAnimationFrame Optimization

**Chosen**: Use RAF for smooth text streaming updates

**Why**:
- **Performance**: 60fps updates, synchronized with browser repaint
- **Smooth Animation**: No janky text updates
- **Efficient**: Batches updates, reduces re-renders
- **Battery-Friendly**: Browser optimizes RAF on mobile
- **Debouncing**: Natural debouncing of rapid updates

**Implementation**:
- Accumulate text chunks in a ref (no re-render)
- Schedule UI update with RAF
- Pending flag prevents duplicate scheduling
- Clean up on unmount

### Decision: Milestone Achievements

**Chosen**: Animated celebrations for user progress

**Why**:
- **Motivation**: Positive reinforcement for progress
- **Engagement**: Fun, rewarding experience
- **Clinical Value**: Acknowledge improvement
- **Gamification**: Makes progress tracking enjoyable

**Milestone Types**:
1. **First Assessment**: Welcome and encouragement
2. **Score Improvement**: 5+ point improvement
3. **Category Improvement**: Better severity level
4. **Consistency**: Multiple assessments in minimal/mild zone

**Implementation**:
- Detect milestones server-side after assessment
- Inject milestone components during stream
- Confetti animation with canvas-confetti
- Auto-dismiss after 8 seconds
- Different animations per milestone type

### Decision: Markdown Support in Messages

**Chosen**: react-markdown with remark-gfm

**Why**:
- **Rich Formatting**: Bold, italic, lists, code blocks
- **AI Compatibility**: Gemini uses Markdown formatting
- **Professional**: Cleaner, more readable messages
- **Customizable**: Style components individually
- **GFM Support**: Tables, task lists, strikethrough

**Alternatives Considered**:
- **Plain Text**: No formatting
  - *Rejected*: Less readable, AI uses Markdown anyway
- **HTML Rendering**: dangerouslySetInnerHTML
  - *Rejected*: Security risk (XSS attacks)
- **Custom Parser**: Build our own
  - *Rejected*: Reinventing the wheel, error-prone

---

## Summary

These decisions reflect a balance of:
- **User Experience**: Smooth, engaging, accessible interface
- **Developer Experience**: Modern tools, type safety, good documentation
- **Performance**: Fast loads, smooth animations, efficient rendering
- **Security**: Backend validation, authentication, data protection
- **Scalability**: Serverless architecture, flexible schema
- **Maintainability**: Clean code, modular components, comprehensive types
- **Clinical Appropriateness**: Evidence-based, professional, supportive

Each decision prioritized building a production-ready mental health platform that users can trust and rely on for support.
