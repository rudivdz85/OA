# Database Setup Guide

This guide will help you set up the Neon Postgres database for the AI Coaching Platform.

## Prerequisites

- A Neon account (sign up at https://neon.tech)
- Node.js and npm installed
- Database credentials from Neon

## Step 1: Create a Neon Database

1. Log in to your Neon console at https://console.neon.tech
2. Create a new project
3. Copy your database connection string (it will look like: `postgresql://user:password@ep-xxx.region.neon.tech/dbname`)

## Step 2: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your actual credentials:
   ```env
   DATABASE_URL="your-neon-connection-string-here"
   NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"
   GEMINI_API_KEY="your-gemini-api-key"
   ```

## Step 3: Run Database Schema

You have two options to run the schema:

### Option A: Using Neon SQL Editor (Recommended for first-time setup)

1. Go to your Neon project in the console
2. Click on "SQL Editor" in the left sidebar
3. Copy the contents of `lib/db/schema.sql`
4. Paste into the SQL Editor and click "Run"

### Option B: Using psql Command Line

If you have PostgreSQL client installed:

```bash
psql "$DATABASE_URL" < lib/db/schema.sql
```

### Option C: Using Node.js Script

Create a migration script:

```bash
# Install postgres client if not already installed
npm install postgres

# Run the schema (you can create a script for this)
node -e "const { neon } = require('@neondatabase/serverless'); const fs = require('fs'); const sql = neon(process.env.DATABASE_URL); const schema = fs.readFileSync('./lib/db/schema.sql', 'utf8'); sql(schema).then(() => console.log('Schema created')).catch(console.error);"
```

## Step 4: Run Seed Data

After the schema is created, load the seed data:

### Using Neon SQL Editor:

1. In the SQL Editor, copy the contents of `lib/db/seed.sql`
2. Paste and click "Run"

### Using psql:

```bash
psql "$DATABASE_URL" < lib/db/seed.sql
```

### Using Node.js:

```bash
node -e "const { neon } = require('@neondatabase/serverless'); const fs = require('fs'); const sql = neon(process.env.DATABASE_URL); const seed = fs.readFileSync('./lib/db/seed.sql', 'utf8'); sql(seed).then(() => console.log('Seed data loaded')).catch(console.error);"
```

## Step 5: Verify Database Setup

Check that tables were created successfully:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

You should see the following tables:
- users
- accounts
- sessions
- verification_tokens
- conversations
- messages
- assessment_types
- assessments

## Database Schema Overview

### Authentication Tables (NextAuth.js)

- **users**: User account information
- **accounts**: OAuth provider accounts linked to users
- **sessions**: Active user sessions
- **verification_tokens**: Email verification and password reset tokens

### Application Tables

- **conversations**: Chat conversations between users and the AI coach
- **messages**: Individual messages within conversations
- **assessment_types**: Definitions of assessment types (GAD-7, PHQ-9, etc.)
- **assessments**: Completed or in-progress user assessments

## Useful Database Commands

### View all assessment types:
```sql
SELECT code, name, version, is_active FROM assessment_types;
```

### View user assessments:
```sql
SELECT
    a.id,
    u.email,
    at.name as assessment_name,
    a.score,
    a.severity_level,
    a.status,
    a.completed_at
FROM assessments a
JOIN users u ON a.user_id = u.id
JOIN assessment_types at ON a.assessment_type_id = at.assessment_type_id
ORDER BY a.created_at DESC;
```

### Check conversation count per user:
```sql
SELECT
    u.email,
    COUNT(c.id) as conversation_count,
    MAX(c.last_message_at) as last_activity
FROM users u
LEFT JOIN conversations c ON u.id = c.user_id
GROUP BY u.id, u.email;
```

## Troubleshooting

### Connection Issues

If you can't connect to the database:

1. Verify your `DATABASE_URL` is correct in `.env`
2. Ensure the connection string includes `?sslmode=require`
3. Check that your Neon project is active (not suspended)
4. Verify your IP is not blocked (Neon has IP allowlisting features)

### Migration Issues

If the schema fails to run:

1. Check for syntax errors in the SQL file
2. Ensure the UUID extension is available: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`
3. Try running the schema in smaller chunks
4. Check Neon's query logs for detailed error messages

## Next Steps

After database setup is complete:

1. Implement the Drizzle ORM schema (if using TypeScript queries)
2. Set up NextAuth.js with the database adapter
3. Create API routes for assessments and conversations
4. Build the frontend components

## Additional Resources

- [Neon Documentation](https://neon.tech/docs)
- [NextAuth.js Database Adapters](https://next-auth.js.org/adapters/overview)
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
