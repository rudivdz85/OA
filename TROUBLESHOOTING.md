# Troubleshooting Guide

## Common Issues and Solutions

### Build Cache Corruption ("Cannot find module" errors)

**Symptoms:**
```
Error: Cannot find module './996.js'
Error: Cannot find module './vendor-chunks/drizzle-orm.js'
GET /api/auth/session 500
```

**Root Cause:**
Next.js 15 build cache (`.next` folder) can become corrupted when:
- Switching between branches with different dependencies
- Upgrading packages (especially Next.js, React)
- Hot module replacement errors during development
- System crashes or force-quit during builds

**Quick Fix:**
```bash
npm run clean
npm run dev
```

**Full Reset (if quick fix doesn't work):**
```bash
npm run clean:full
```

**Manual Fix:**
```bash
rm -rf .next node_modules/.cache
npm run dev
```

### Available Cleanup Scripts

We've added several scripts to help manage cache issues:

- **`npm run clean`** - Removes `.next` and `node_modules/.cache`
- **`npm run clean:full`** - Full cleanup + reinstall dependencies
- **`npm run dev:clean`** - Clean cache then start dev server
- **`npm run build:clean`** - Clean cache then build

### Prevention

1. **Always use clean scripts after:**
   - Upgrading Next.js or React
   - Switching branches with dependency changes
   - Pulling major changes from git

2. **If seeing cache errors:**
   - Stop dev server (`Ctrl+C`)
   - Run `npm run clean`
   - Restart dev server

3. **The `.next` folder is gitignored** - never commit it

### When to Use Each Script

| Scenario | Command | Why |
|----------|---------|-----|
| Regular development | `npm run dev` | Normal usage |
| After git pull | `npm run dev:clean` | Prevent cache conflicts |
| After upgrading packages | `npm run clean:full` | Clean + reinstall |
| Module not found errors | `npm run clean` | Clear corrupted cache |
| Production build | `npm run build` | Uses clean cache automatically |

### Other Common Issues

#### Session/Auth Errors
**Symptom:** `GET /api/auth/session 500`

**Solutions:**
1. Check `.env.local` has all required variables:
   ```
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=<your-secret>
   DATABASE_URL=<your-db-url>
   GEMINI_API_KEY=<your-key>
   ```
2. Run `npm run clean && npm run dev`

#### Database Connection Issues
**Symptom:** `Connection refused` or `Database error`

**Solutions:**
1. Verify `DATABASE_URL` in `.env.local`
2. Ensure database is running
3. Run `npm run db:push` to sync schema

#### TypeScript Errors After Changes
**Symptom:** Type errors that don't make sense

**Solutions:**
1. Restart TypeScript server in your IDE
2. Run `npm run type-check`
3. Delete `*.tsbuildinfo` files

## Getting Help

If issues persist:
1. Check the error message carefully
2. Try `npm run clean:full`
3. Review recent git changes
4. Check if issue occurs in a fresh clone

## Prevention Checklist

Before submitting issues:
- [ ] Ran `npm run clean`
- [ ] Checked `.env.local` is configured
- [ ] Verified database is accessible
- [ ] Tried in a clean terminal session
- [ ] Checked no other process is using port 3000
