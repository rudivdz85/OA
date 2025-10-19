# Environment Setup Guide

This guide walks you through setting up all the services and environment variables needed to run OllieAI locally.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Google Cloud Setup](#google-cloud-setup)
3. [Neon Database Setup](#neon-database-setup)
4. [NextAuth Configuration](#nextauth-configuration)
5. [Environment Variables](#environment-variables)
6. [Database Initialization](#database-initialization)
7. [Verification](#verification)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** installed ([Download](https://nodejs.org/))
- **npm**, **yarn**, or **pnpm** package manager
- **Git** for version control
- A **Google Account** (for OAuth and Gemini API)
- A **GitHub Account** (for deployment)

---

## Google Cloud Setup

You'll need two things from Google Cloud:
1. **OAuth Credentials** (for Google Sign-In)
2. **Gemini API Key** (for AI conversations)

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" at the top
3. Click "New Project"
4. Enter project name (e.g., "OllieAI")
5. Click "Create"

### Step 2: Enable APIs

1. In your project, go to "APIs & Services" > "Library"
2. Search for and enable:
   - **Google+ API** (for OAuth)
   - **Gemini API** (for AI)

### Step 3: Set Up OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type
3. Click "Create"
4. Fill in required fields:
   - **App name**: OllieAI
   - **User support email**: Your email
   - **Developer contact**: Your email
5. Click "Save and Continue"
6. Scopes: Click "Save and Continue" (no additional scopes needed)
7. Test users: Add your email for testing
8. Click "Save and Continue"

### Step 4: Create OAuth Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Application type: **Web application**
4. Name: "OllieAI Web Client"
5. Authorized JavaScript origins:
   - `http://localhost:3000`
   - Add your production URL later (e.g., `https://yourapp.vercel.app`)
6. Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - Add production callback later (e.g., `https://yourapp.vercel.app/api/auth/callback/google`)
7. Click "Create"
8. **Copy your Client ID and Client Secret** - you'll need these!

### Step 5: Get Gemini API Key

**Option A: Using Google AI Studio (Recommended for Development)**

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Get API Key"
3. Click "Create API key in new project" or select existing project
4. **Copy your API key** - save it securely!

**Option B: Using Google Cloud Console**

1. In Google Cloud Console, go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the API key
4. (Recommended) Click "Restrict Key":
   - API restrictions: Select "Gemini API"
   - Application restrictions: Set based on your needs
5. Save the key

---

## Neon Database Setup

### Step 1: Create Neon Account

1. Go to [Neon](https://neon.tech/)
2. Click "Sign Up" and create account (can use GitHub)
3. Verify your email

### Step 2: Create a New Project

1. Click "Create a project"
2. Project name: "ollieai" (or your choice)
3. Region: Choose closest to your users
4. Postgres version: 15 (default)
5. Click "Create project"

### Step 3: Get Connection String

1. After project creation, you'll see the connection details
2. Copy the **Connection string**
   - It looks like: `postgresql://username:password@host/database?sslmode=require`
3. You can always find this in:
   - Project dashboard > "Connection Details"
   - Click "Copy" next to the connection string

### Step 4: Database Configuration

Neon automatically creates:
- A default database (usually named `neondb`)
- A user with password
- SSL is required and enabled by default

**Important Notes**:
- Keep your connection string secret!
- The connection string contains your password
- Free tier includes: 0.5 GB storage, 1 compute unit

---

## NextAuth Configuration

### Generate NEXTAUTH_SECRET

This is a random string used to encrypt JWT tokens and sessions.

**On macOS/Linux**:
```bash
openssl rand -base64 32
```

**On Windows** (PowerShell):
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Alternative** (using a website):
- Go to [generate-secret.vercel.app](https://generate-secret.vercel.app/32)
- Copy the generated secret

**Save this secret** - you'll add it to `.env` as `NEXTAUTH_SECRET`.

### Set NEXTAUTH_URL

For local development:
```
NEXTAUTH_URL=http://localhost:3000
```

For production (update when deploying):
```
NEXTAUTH_URL=https://your-domain.vercel.app
```

---

## Environment Variables

### Step 1: Create .env File

In your project root, copy the example file:

```bash
cp .env.example .env
```

### Step 2: Fill in Environment Variables

Edit `.env` with your values:

```env
# Database (from Neon)
DATABASE_URL="postgresql://user:password@host.neon.tech/neondb?sslmode=require"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-generated-secret-from-openssl"

# Google OAuth (from Google Cloud Console)
GOOGLE_CLIENT_ID="123456789-abcdefg.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-your-secret-here"

# Google Gemini AI (from Google AI Studio)
GEMINI_API_KEY="AIzaSy-your-api-key-here"
```

### Step 3: Verify .env is in .gitignore

**IMPORTANT**: Never commit `.env` to Git!

Check `.gitignore` includes:
```
.env
.env.local
.env*.local
```

---

## Database Initialization

### Step 1: Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### Step 2: Push Database Schema

This creates all tables in your Neon database:

```bash
npm run db:push
```

You should see output like:
```
...
✓ Successfully pushed schema to database
```

This creates:
- `users` table
- `accounts` table (for OAuth)
- `sessions` table
- `conversations` table
- `messages` table
- `assessment_types` table
- `assessment_questions` table
- `assessments` table
- `assessment_answers` table

### Step 3: Seed Initial Data

This populates assessment types and questions:

```bash
npm run db:seed
```

You should see:
```
Seeding GAD-7 assessment...
Seeding PHQ-9 assessment...
Database seeded successfully!
```

This creates:
- GAD-7 assessment type with 7 questions
- PHQ-9 assessment type with 9 questions
- Scoring rules and severity thresholds

### Step 4: Verify Database (Optional)

Open Drizzle Studio to browse your database:

```bash
npm run db:studio
```

This opens a web interface at `https://local.drizzle.studio` where you can:
- View all tables
- Browse seeded data
- Verify schema structure

---

## Verification

### Step 1: Start Development Server

```bash
npm run dev
```

You should see:
```
 ▲ Next.js 14.x.x
  - Local:        http://localhost:3000
  - Ready in X.Xs
```

### Step 2: Test the Application

1. **Open app**: Navigate to [http://localhost:3000](http://localhost:3000)

2. **Test Sign Up**:
   - Click "Get Started" or "Sign Up"
   - Create account with email/password
   - Verify you're redirected to dashboard

3. **Test Google OAuth**:
   - Sign out
   - Click "Sign In"
   - Click "Continue with Google"
   - Verify Google login works

4. **Test Conversation**:
   - Click "Start a Conversation"
   - Send a message
   - Verify AI response streams in

5. **Test Assessment**:
   - In a conversation, mention "anxiety"
   - AI should offer GAD-7 assessment
   - Click "Start GAD-7"
   - Complete the assessment
   - Verify results are displayed

6. **Test Dashboard**:
   - Navigate to dashboard
   - Verify stats show completed assessment
   - Check chart displays assessment score

---

## Troubleshooting

### Database Connection Issues

**Problem**: `Error: connect ECONNREFUSED` or database connection fails

**Solutions**:
1. Verify `DATABASE_URL` is correct
2. Ensure it includes `?sslmode=require`
3. Check Neon project is not paused (free tier pauses after inactivity)
4. Test connection in Neon dashboard

**Test connection**:
```bash
# Install postgres client
npm install -g pg

# Test connection (replace with your URL)
psql "postgresql://user:pass@host/db?sslmode=require"
```

### OAuth Errors

**Problem**: "Error 400: redirect_uri_mismatch"

**Solutions**:
1. Verify redirect URI in Google Cloud Console matches exactly:
   - `http://localhost:3000/api/auth/callback/google` (no trailing slash!)
2. Ensure `NEXTAUTH_URL` in `.env` is `http://localhost:3000`
3. Clear browser cookies and try again

**Problem**: "Error: Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET"

**Solutions**:
1. Check `.env` file has both variables
2. Restart dev server after changing `.env`
3. Ensure no extra quotes or spaces in values

### Gemini API Errors

**Problem**: "Error: API key not valid"

**Solutions**:
1. Verify API key is copied correctly (no spaces)
2. Check API key is not restricted to wrong APIs
3. Ensure Gemini API is enabled in Google Cloud project
4. Try generating a new API key

**Problem**: "Error 429: Rate limit exceeded"

**Solutions**:
1. You've hit free tier limits
2. Wait a few minutes and retry
3. Check [AI Studio quotas](https://makersuite.google.com/app/apikey)
4. Consider upgrading to paid tier

### NextAuth Errors

**Problem**: "Error: NEXTAUTH_SECRET is not set"

**Solutions**:
1. Generate secret: `openssl rand -base64 32`
2. Add to `.env`: `NEXTAUTH_SECRET="your-secret"`
3. Restart dev server

**Problem**: "Error: Invalid token"

**Solutions**:
1. Clear cookies in browser
2. Regenerate `NEXTAUTH_SECRET`
3. Sign in again

### General Issues

**Problem**: Changes to `.env` not working

**Solutions**:
1. **Restart dev server** (Next.js doesn't hot-reload `.env`)
2. Kill all Node processes: `killall node`
3. Start again: `npm run dev`

**Problem**: "Module not found" errors

**Solutions**:
1. Delete `node_modules`: `rm -rf node_modules`
2. Delete lock file: `rm package-lock.json` (or yarn.lock)
3. Reinstall: `npm install`
4. Restart dev server

**Problem**: Database schema out of sync

**Solutions**:
1. Push schema again: `npm run db:push`
2. If errors persist, reset database (WARNING: deletes all data):
   - Go to Neon dashboard
   - Delete project
   - Create new project
   - Update `DATABASE_URL`
   - Push schema and seed again

---

## Development Tips

### Hot Reload

- Next.js auto-reloads on file changes
- `.env` changes require **manual restart**
- Database schema changes need `npm run db:push`

### Database Management

View schema changes:
```bash
npm run db:studio
```

Generate migration files (if not using db:push):
```bash
npm run db:generate
```

### Port Already in Use

If port 3000 is taken:

```bash
# Find process using port 3000
lsof -ti:3000

# Kill the process
kill -9 <PID>

# Or use a different port
PORT=3001 npm run dev
```

### Clear All Data

To start fresh (WARNING: destructive):

```bash
# Reset database (in Neon dashboard)
# Delete node_modules
rm -rf node_modules

# Clear Next.js cache
rm -rf .next

# Reinstall and restart
npm install
npm run db:push
npm run db:seed
npm run dev
```

---

## Security Reminders

- **Never commit `.env` to Git**
- **Never share API keys publicly**
- **Rotate secrets if accidentally exposed**
- **Use different credentials for production**
- **Enable 2FA on Google account**

---

## Next Steps

Once everything is working:

1. Read [API.md](./API.md) to understand available endpoints
2. Review [TESTING.md](./TESTING.md) for testing checklist
3. Check [DEPLOYMENT.md](./DEPLOYMENT.md) when ready to deploy
4. Review [SECURITY.md](./SECURITY.md) for production best practices

---

## Getting Help

If you're still stuck:

1. Check error messages carefully
2. Review [Troubleshooting](#troubleshooting) section
3. Search GitHub issues
4. Check Next.js, NextAuth, Drizzle docs
5. Ask for help in project discussions

**Happy coding!** 🚀
