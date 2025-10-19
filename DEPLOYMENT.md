# Deployment Guide

Complete guide to deploying OllieAI to Vercel.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [GitHub Repository Setup](#github-repository-setup)
4. [Vercel Deployment](#vercel-deployment)
5. [Environment Variables Configuration](#environment-variables-configuration)
6. [Database Configuration](#database-configuration)
7. [Post-Deployment Testing](#post-deployment-testing)
8. [Custom Domain Setup](#custom-domain-setup-optional)
9. [Monitoring and Logs](#monitoring-and-logs)
10. [Troubleshooting](#troubleshooting)
11. [CI/CD and Updates](#cicd-and-updates)

---

## Prerequisites

Before deploying, ensure you have:

- ✅ **GitHub account** for repository hosting
- ✅ **Vercel account** ([sign up](https://vercel.com/signup))
- ✅ **Working local build** (`npm run build` succeeds)
- ✅ **Production database** (Neon project with seeded data)
- ✅ **Production API keys** (Google OAuth, Gemini API)
- ✅ **Environment variables** ready
- ✅ **Tests passing** (see [TESTING.md](./TESTING.md))

---

## Pre-Deployment Checklist

### 1. Test Production Build Locally

```bash
# Build the application
npm run build

# Start production server locally
npm run start
```

Visit `http://localhost:3000` and verify everything works.

### 2. Type Check

```bash
npm run type-check
```

Fix any TypeScript errors before deploying.

### 3. Review Environment Variables

Ensure `.env` has all required variables:
- `DATABASE_URL` (production Neon database)
- `NEXTAUTH_URL` (will update to production URL)
- `NEXTAUTH_SECRET` (strong secret for production)
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GEMINI_API_KEY`

### 4. Database Seeding

Ensure your production database is seeded:

```bash
# Using production DATABASE_URL
npm run db:push
npm run db:seed
```

### 5. Security Review

- Remove any `console.log` statements with sensitive data
- Ensure `.env` is in `.gitignore`
- Review API routes for proper authentication checks
- Verify no hardcoded secrets in code

---

## GitHub Repository Setup

### 1. Initialize Git (if not already done)

```bash
git init
git add .
git commit -m "Initial commit: OllieAI ready for deployment"
```

### 2. Create GitHub Repository

1. Go to [GitHub](https://github.com/new)
2. Create a new repository
3. Name it (e.g., "ollieai")
4. **Don't** initialize with README, .gitignore, or license (already have these)
5. Click "Create repository"

### 3. Push to GitHub

```bash
# Add remote
git remote add origin https://github.com/yourusername/ollieai.git

# Push code
git branch -M main
git push -u origin main
```

### 4. Verify Push

Visit your GitHub repository and ensure all files are there (except `.env`!).

---

## Vercel Deployment

### Method 1: Vercel Dashboard (Recommended)

#### Step 1: Import Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository:
   - Click "Import" next to your repository
   - If not listed, configure GitHub integration

#### Step 2: Configure Project

Vercel auto-detects Next.js. Verify settings:

- **Framework Preset**: Next.js
- **Root Directory**: `./` (default)
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `.next` (auto-detected)
- **Install Command**: `npm install` (auto-detected)

#### Step 3: Environment Variables

Click "Environment Variables" and add ALL variables from your `.env`:

**Required Variables**:
```
DATABASE_URL = postgresql://user:pass@host.neon.tech/db?sslmode=require
NEXTAUTH_SECRET = your-production-secret
NEXTAUTH_URL = https://your-app.vercel.app (leave blank for now, add after deployment)
GOOGLE_CLIENT_ID = your-google-client-id
GOOGLE_CLIENT_SECRET = your-google-client-secret
GEMINI_API_KEY = your-gemini-api-key
```

**Important**:
- For each variable, select "Production", "Preview", and "Development" (or just "All")
- Values are encrypted and secure in Vercel

#### Step 4: Deploy

1. Click "Deploy"
2. Vercel will:
   - Clone your repository
   - Install dependencies
   - Build the project
   - Deploy to production

Watch the build logs in real-time.

#### Step 5: Get Deployment URL

After deployment:
1. Note your production URL (e.g., `https://ollieai.vercel.app`)
2. This is your `NEXTAUTH_URL`

---

### Method 2: Vercel CLI (Alternative)

Install Vercel CLI:
```bash
npm install -g vercel
```

Login:
```bash
vercel login
```

Deploy:
```bash
vercel
```

Follow prompts:
- Link to existing project or create new? **Create new**
- Project name? **ollieai** (or your choice)
- Directory? **./** (current directory)

For production deployment:
```bash
vercel --prod
```

---

## Environment Variables Configuration

### Update NEXTAUTH_URL

After first deployment:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Find `NEXTAUTH_URL`
3. Update value to your production URL: `https://your-app.vercel.app`
4. Click "Save"
5. **Redeploy** for changes to take effect:
   - Go to Deployments tab
   - Click "..." menu on latest deployment
   - Click "Redeploy"

### Update Google OAuth Redirect URIs

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to "APIs & Services" → "Credentials"
3. Click your OAuth 2.0 Client ID
4. Under "Authorized redirect URIs", add:
   ```
   https://your-app.vercel.app/api/auth/callback/google
   ```
5. Click "Save"

**Note**: Keep localhost redirect for local development.

### Secure Production Secrets

Best practices:
- **Never** commit `.env` to Git
- Use different secrets for production vs development
- Rotate secrets if compromised
- Use strong `NEXTAUTH_SECRET` (min 32 characters)
- Restrict API keys to production domains when possible

---

## Database Configuration

### Verify Production Database

1. Go to [Neon Dashboard](https://console.neon.tech/)
2. Select your production project
3. Verify connection string matches `DATABASE_URL` in Vercel
4. Check database has tables (use Neon SQL Editor or Drizzle Studio)

### Connection Pooling

Neon automatically handles connection pooling. No additional configuration needed for Vercel.

### Database Backups

Enable automatic backups in Neon:
1. Go to your Neon project
2. Settings → Backups
3. Enable point-in-time recovery (paid plans)

---

## Post-Deployment Testing

### 1. Visit Your Site

Navigate to `https://your-app.vercel.app`

### 2. Test Authentication

**Sign Up**:
- Click "Get Started"
- Create account with email/password
- Verify redirect to dashboard

**Google OAuth**:
- Sign out
- Click "Sign In"
- Click "Continue with Google"
- Verify Google login flow works

### 3. Test Core Features

Follow the [TESTING.md](./TESTING.md) checklist:
- Create conversation
- Send messages
- Verify AI streaming works
- Complete GAD-7 assessment
- Check milestone celebrations
- View dashboard charts

### 4. Test Mobile

- Open site on mobile device
- Verify responsive design
- Test touch interactions
- Check input field is accessible

### 5. Check Performance

Use Vercel Analytics or:
- [Lighthouse](https://pagespeed.web.dev/)
- [GTmetrix](https://gtmetrix.com/)
- [WebPageTest](https://www.webpagetest.org/)

Target scores:
- Performance: 90+
- Accessibility: 90+
- Best Practices: 90+
- SEO: 90+

---

## Custom Domain Setup (Optional)

### 1. Purchase Domain

Buy domain from:
- [Namecheap](https://www.namecheap.com/)
- [Google Domains](https://domains.google/)
- [Cloudflare](https://www.cloudflare.com/products/registrar/)

### 2. Add Domain in Vercel

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Enter your domain (e.g., `ollieai.com`)
3. Click "Add"

### 3. Configure DNS

Vercel provides DNS records to add:

**For apex domain** (ollieai.com):
```
Type: A
Name: @
Value: 76.76.21.21
```

**For www subdomain**:
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

Add these in your domain registrar's DNS settings.

### 4. Wait for DNS Propagation

- Can take 1-48 hours
- Check status in Vercel dashboard
- Use [DNS Checker](https://dnschecker.org/) to verify propagation

### 5. Update Environment Variables

Update `NEXTAUTH_URL` to your custom domain:
```
NEXTAUTH_URL=https://ollieai.com
```

Also update Google OAuth redirect URIs.

### 6. SSL Certificate

Vercel automatically provisions SSL certificates. Your site will be HTTPS.

---

## Monitoring and Logs

### Vercel Dashboard

**Real-time Logs**:
1. Go to Your Project → Deployments
2. Click latest deployment
3. View "Function Logs" tab
4. See real-time server logs

**Analytics**:
- Enable Vercel Analytics (Settings → Analytics)
- Track page views, performance, user behavior

**Speed Insights**:
- Enable Speed Insights (Settings → Speed Insights)
- Monitor Core Web Vitals

### Error Tracking

Consider integrating:
- **Sentry**: Error monitoring and tracking
- **LogRocket**: Session replay and logging
- **Datadog**: Full-stack monitoring

Example Sentry integration:
```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

### Database Monitoring

In Neon Dashboard:
- Monitor queries
- Check connection usage
- Review slow queries
- Set up alerts

---

## Troubleshooting

### Build Failures

**Error**: "Build failed"

**Solutions**:
1. Check build logs in Vercel dashboard
2. Verify `npm run build` works locally
3. Ensure all dependencies in `package.json`
4. Check for TypeScript errors: `npm run type-check`

**Common issues**:
- Missing environment variables
- Type errors
- Import errors
- Dependency version conflicts

### Runtime Errors

**Error**: "500 Internal Server Error"

**Solutions**:
1. Check Function Logs in Vercel
2. Verify environment variables are set
3. Test database connection
4. Check API endpoint authentication

### Database Connection Issues

**Error**: "connect ECONNREFUSED" or timeout

**Solutions**:
1. Verify `DATABASE_URL` is correct in Vercel
2. Ensure Neon project is not paused (free tier)
3. Check SSL mode: `?sslmode=require`
4. Verify IP allowlist in Neon (should allow all for Vercel)

### OAuth Errors

**Error**: "redirect_uri_mismatch"

**Solutions**:
1. Verify `NEXTAUTH_URL` matches your deployment URL
2. Add redirect URI in Google Cloud Console:
   ```
   https://your-app.vercel.app/api/auth/callback/google
   ```
3. Ensure no trailing slash in URLs
4. Clear browser cookies and retry

### Environment Variables Not Updating

**Solutions**:
1. After changing variables, **redeploy**:
   - Deployments → Latest → Redeploy
2. Verify variables are set for "Production" environment
3. Check variable names are exact (case-sensitive)

### Slow Performance

**Solutions**:
1. Enable Vercel Speed Insights
2. Check database query performance in Neon
3. Optimize images (use Next.js Image component)
4. Implement caching strategies
5. Review API route response times

---

## CI/CD and Updates

### Automatic Deployments

Vercel automatically deploys when you push to GitHub:

```bash
# Make changes locally
git add .
git commit -m "Add new feature"
git push origin main
```

Vercel will:
1. Detect the push
2. Start a new deployment
3. Run build
4. Deploy to production (if main/master branch)

### Preview Deployments

Every pull request gets a preview deployment:
1. Create a branch
2. Push changes
3. Open pull request
4. Vercel comments with preview URL

Test changes before merging to production.

### Rollback

To rollback to previous deployment:
1. Go to Deployments tab
2. Find working deployment
3. Click "..." menu → "Promote to Production"

### Environment-Specific Branches

Configure different environments:
- `main` → Production
- `staging` → Preview/Staging
- `develop` → Development

Set up in Vercel → Settings → Git.

---

## Production Checklist

Before going live:

- [ ] All environment variables set correctly
- [ ] `NEXTAUTH_URL` points to production domain
- [ ] Google OAuth redirects configured
- [ ] Database is production-ready and seeded
- [ ] SSL certificate active (HTTPS working)
- [ ] All features tested on production
- [ ] Mobile responsiveness verified
- [ ] Performance benchmarks met (Lighthouse > 90)
- [ ] Error tracking configured (Sentry, etc.)
- [ ] Analytics enabled
- [ ] Custom domain configured (if applicable)
- [ ] Backups enabled (database)
- [ ] Monitoring alerts set up
- [ ] Documentation updated
- [ ] Security review completed

---

## Scaling Considerations

As your app grows:

### Vercel Limits

Free tier includes:
- 100 GB bandwidth/month
- Unlimited deployments
- Serverless function execution limits

[Upgrade plans](https://vercel.com/pricing) for:
- More bandwidth
- Team features
- Advanced analytics
- Priority support

### Database Scaling

Neon free tier:
- 0.5 GB storage
- 1 compute unit

Upgrade for:
- More storage
- Compute units
- Branching
- Point-in-time recovery

### API Rate Limits

Monitor and optimize:
- **Gemini API**: Track quota usage
- **Database**: Index optimization, query optimization
- **Implement caching**: Redis, Vercel KV

---

## Security in Production

- Enable Vercel's security features
- Use strong `NEXTAUTH_SECRET` (32+ characters)
- Rotate secrets periodically
- Monitor logs for suspicious activity
- Set up rate limiting (consider Vercel WAF)
- Keep dependencies updated: `npm audit`
- Enable HTTPS-only (Vercel default)
- Configure CSP headers (Content Security Policy)

---

## Support and Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Neon Documentation](https://neon.tech/docs/introduction)
- [Vercel Community](https://github.com/vercel/vercel/discussions)
- [Next.js Discord](https://discord.gg/nextjs)

---

**Congratulations on deploying OllieAI!** 🎉

Your mental health coaching platform is now live and helping users.

Monitor your deployment, gather user feedback, and iterate. Good luck!
