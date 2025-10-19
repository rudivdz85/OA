# Gemini API Setup Guide

## Problem
Getting 404 errors when trying to use Gemini models despite having a valid API key.

```
Error: models/gemini-1.5-flash is not found for API version v1beta
```

## Root Cause
Your API key doesn't have permission to access the Gemini API endpoints. This is an **API key permission issue**, not a code issue.

## Solution

### Step 1: Get a New Gemini API Key

1. Go to **Google AI Studio**: https://aistudio.google.com/app/apikey

2. Click "Get API key" or "Create API key"

3. Choose:
   - **Create API key in new project** (recommended)
   - OR select an existing Google Cloud project

4. Copy the new API key (starts with `AIzaSy...`)

### Step 2: Update Your Environment Variable

1. Open `/Users/RudiV/Repos/OA/.env.local`

2. Replace the existing `GEMINI_API_KEY` value:
   ```env
   GEMINI_API_KEY="your-new-api-key-here"
   ```

3. Save the file

### Step 3: Restart Your Development Server

```bash
# Stop the current server (Ctrl+C)
npm run dev
```

### Step 4: Test the API

Run the test script:

```bash
node scripts/test-gemini-models.js
```

You should see:
```
✅ SUCCESS: models/gemini-1.5-flash-latest
Response: Hello! 👋  How can I help you today?
```

## Troubleshooting

### If you still get 404 errors:

1. **Check Google Cloud Console**:
   - Go to: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com
   - Make sure "Generative Language API" is **enabled**

2. **Verify your account**:
   - Google AI Studio requires a Google account
   - Some regions may have restrictions

3. **Check API quotas**:
   - Free tier: 60 requests per minute
   - If exceeded, wait a minute and try again

### If you get permission/billing errors:

1. The free tier should work for development
2. Check: https://aistudio.google.com/app/apikey for any warnings
3. You may need to enable billing in Google Cloud Console for production use

## Verification

Once your API key works, you'll see these console logs when starting the app:

```
Gemini API Key loaded: Yes
Gemini API Key length: 39
```

And you'll be able to:
- Send messages to the AI coach
- Get AI responses
- See auto-generated conversation titles

## Alternative: Use OpenAI Instead

If Gemini continues to have issues, we can switch to OpenAI's API:

1. Get an OpenAI API key: https://platform.openai.com/api-keys
2. Let me know and I'll update the code to use OpenAI's GPT models instead

## Current Code Configuration

The code is set to use:
- **Model**: `models/gemini-1.5-flash-latest`
- **API Endpoint**: `v1beta` (automatic via SDK)
- **SDK Version**: `@google/generative-ai@0.24.1`

This is the correct configuration - the only issue is the API key permissions.
