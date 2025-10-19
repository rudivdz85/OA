# Security Documentation

Overview of security measures implemented in OllieAI and best practices for maintaining a secure mental health platform.

---

## Table of Contents

1. [Security Overview](#security-overview)
2. [Authentication & Authorization](#authentication--authorization)
3. [Data Protection](#data-protection)
4. [API Security](#api-security)
5. [Database Security](#database-security)
6. [Environment Variables](#environment-variables)
7. [Input Validation](#input-validation)
8. [Session Management](#session-management)
9. [Third-Party Integrations](#third-party-integrations)
10. [Security Best Practices](#security-best-practices)
11. [Incident Response](#incident-response)
12. [Compliance Considerations](#compliance-considerations)

---

## Security Overview

OllieAI handles sensitive mental health data and implements multiple layers of security to protect user information and maintain trust.

### Security Principles

- **Defense in Depth**: Multiple security layers
- **Least Privilege**: Minimal necessary access
- **Secure by Default**: Security built into the architecture
- **Privacy First**: User data protection prioritized
- **Transparency**: Clear about data usage

---

## Authentication & Authorization

### NextAuth.js Implementation

**Features**:
- Industry-standard authentication library
- Built-in CSRF protection
- Secure session management
- Multiple provider support

**Configuration**:
```typescript
// /lib/auth/config.ts
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      // Custom email/password authentication
    }),
  ],
  session: {
    strategy: 'jwt',  // Stateless sessions
    maxAge: 30 * 24 * 60 * 60,  // 30 days
  },
  callbacks: {
    // Session and JWT callbacks
  },
};
```

### Password Security

**Hashing**:
- **Algorithm**: bcrypt
- **Rounds**: 12 (configurable)
- **Salt**: Automatically generated per password

```typescript
import bcrypt from 'bcrypt';

// Hashing passwords
const hashedPassword = await bcrypt.hash(password, 12);

// Verifying passwords
const isValid = await bcrypt.compare(password, hashedPassword);
```

**Password Requirements**:
- Minimum length enforced in client validation
- Consider implementing:
  - Complexity requirements
  - Password strength meter
  - Leaked password checking (Have I Been Pwned API)

### OAuth Security

**Google OAuth**:
- State parameter prevents CSRF
- Secure redirect URIs configured
- Token validation by NextAuth

**Security Measures**:
- Verified OAuth redirect URIs in Google Cloud Console
- HTTPS-only redirects in production
- Session tokens encrypted and signed

### Authorization

**Route Protection**:
```typescript
// Server Component
const session = await getServerSession(authOptions);
if (!session?.user?.id) {
  redirect('/auth/signin');
}

// API Route
const session = await getServerSession(authOptions);
if (!session?.user?.id) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

**User Ownership Verification**:
```typescript
// Verify conversation belongs to user
const conversation = await getConversation(conversationId, session.user.id);
if (!conversation) {
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}
```

---

## Data Protection

### Data at Rest

**Database**:
- **SSL/TLS**: All connections encrypted (`sslmode=require`)
- **Neon**: Data encrypted at rest by default
- **Backups**: Encrypted backups (Neon Pro)

**Sensitive Data**:
- Passwords: bcrypt hashed, never stored plaintext
- API keys: Never stored in database
- Session tokens: JWT signed and encrypted

### Data in Transit

**HTTPS**:
- Enforced in production (Vercel automatic SSL)
- TLS 1.2+ required
- HSTS headers sent

**API Communication**:
- All API calls over HTTPS
- Secure WebSocket/SSE connections
- Cookies marked `Secure` in production

### Personal Identifiable Information (PII)

**Stored PII**:
- Name
- Email address
- Assessment responses
- Conversation history

**PII Protection**:
- Access restricted by user ID
- No cross-user data access
- Encrypted in transit and at rest
- Consider data anonymization for analytics

---

## API Security

### Route Protection

All protected routes verify authentication:

```typescript
const session = await getServerSession(authOptions);
if (!session?.user?.id) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

### CSRF Protection

**Built-in**:
- NextAuth provides CSRF tokens
- Form submissions include CSRF token
- SameSite cookie attribute

### Rate Limiting

**Current Status**: Not implemented

**Recommendations**:
- Implement middleware-based rate limiting
- Use Vercel's Edge Middleware
- Consider [next-rate-limit](https://github.com/vercel/next-rate-limit)

**Example Implementation**:
```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
});

// In API route
const { success } = await ratelimit.limit(request.ip);
if (!success) {
  return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
}
```

### Input Validation

**Server-Side Validation**:
```typescript
// Validate content exists and is non-empty
if (!content || typeof content !== 'string' || content.trim().length === 0) {
  return NextResponse.json(
    { error: 'Message content is required' },
    { status: 400 }
  );
}
```

**Prevent Injection**:
- Drizzle ORM uses parameterized queries (SQL injection prevention)
- No dynamic SQL string concatenation
- User input sanitized before storage

---

## Database Security

### Connection Security

**Neon PostgreSQL**:
```env
DATABASE_URL="postgresql://user:pass@host.neon.tech/db?sslmode=require"
```

- SSL/TLS required for all connections
- Connection pooling managed by Neon
- IP allowlisting available (Neon Pro)

### SQL Injection Prevention

**Drizzle ORM**:
- Parameterized queries by default
- Type-safe query builder
- No raw SQL string concatenation

**Example** (Safe):
```typescript
const messages = await db
  .select()
  .from(messagesTable)
  .where(eq(messagesTable.conversationId, conversationId));
```

**Never Do** (Unsafe):
```typescript
// DON'T DO THIS
const messages = await db.execute(
  `SELECT * FROM messages WHERE conversationId = '${conversationId}'`
);
```

### Database Access

**Principle of Least Privilege**:
- Application uses dedicated database user
- User has only necessary permissions (SELECT, INSERT, UPDATE, DELETE)
- No DROP, ALTER, or admin permissions

**Access Control**:
- Database credentials in environment variables only
- Never expose `DATABASE_URL` to client
- Different credentials for development and production

---

## Environment Variables

### Storage

**Never Commit**:
```gitignore
.env
.env.local
.env*.local
```

**Verification**:
```bash
# Check .gitignore includes .env
cat .gitignore | grep .env
```

### Access Control

**Local Development**:
- `.env` file in project root
- Access restricted to developer machines
- Not shared via email/Slack/etc.

**Production**:
- Stored securely in Vercel
- Encrypted at rest
- Access logged
- Team access controlled

### Secret Rotation

**Best Practices**:
- Rotate secrets regularly (every 90 days)
- Rotate immediately if compromised
- Update in both Vercel and external services

**Rotation Checklist**:
1. Generate new secret
2. Update in Vercel environment variables
3. Update in external service (Google, etc.)
4. Redeploy application
5. Verify functionality
6. Revoke old secret

---

## Input Validation

### Client-Side Validation

**Forms**:
- Email format validation
- Password strength indicators
- Required field validation

**Limitations**:
- Client-side validation can be bypassed
- Always validate server-side as well

### Server-Side Validation

**API Routes**:
```typescript
// Validate message content
if (!content || typeof content !== 'string') {
  return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
}

// Sanitize length
if (content.length > 5000) {
  return NextResponse.json({ error: 'Message too long' }, { status: 400 });
}

// Trim and validate
const sanitized = content.trim();
if (sanitized.length === 0) {
  return NextResponse.json({ error: 'Empty message' }, { status: 400 });
}
```

### XSS Protection

**React**:
- Automatic escaping of JSX expressions
- No `dangerouslySetInnerHTML` used

**Markdown Rendering**:
- Using `react-markdown` (safe by default)
- No HTML allowed in Markdown
- Custom component rendering for control

**Example** (Safe):
```typescript
<ReactMarkdown remarkPlugins={[remarkGfm]}>
  {message.content}
</ReactMarkdown>
```

---

## Session Management

### JWT Sessions

**Configuration**:
```typescript
session: {
  strategy: 'jwt',
  maxAge: 30 * 24 * 60 * 60,  // 30 days
},
```

**Security**:
- Tokens signed with `NEXTAUTH_SECRET`
- Encrypted payload
- Expiration enforced
- Automatic refresh

### Cookie Security

**Production Settings**:
```typescript
cookies: {
  sessionToken: {
    name: '__Secure-next-auth.session-token',
    options: {
      httpOnly: true,    // No JavaScript access
      sameSite: 'lax',   // CSRF protection
      path: '/',
      secure: true,      // HTTPS only (production)
    },
  },
}
```

### Session Expiration

**Automatic**:
- Sessions expire after 30 days
- Inactive sessions invalidated
- Re-authentication required after expiry

**Manual Logout**:
- Clears session cookie
- Invalidates JWT token
- Redirects to sign-in page

---

## Third-Party Integrations

### Google OAuth

**Security Measures**:
- OAuth 2.0 protocol
- Verified redirect URIs
- Scope limitations (email, profile only)
- Token validation by NextAuth

**Configuration**:
- Client ID and Secret stored securely
- Redirect URIs whitelisted in Google Cloud Console
- Regular audit of OAuth consent screen

### Google Gemini API

**API Key Security**:
- Stored in environment variables
- Never exposed to client
- Server-side API calls only
- API restrictions enabled (recommended)

**Request Validation**:
- User authentication required before AI calls
- Rate limiting recommended
- Error handling doesn't expose API details

### Neon Database

**Connection Security**:
- SSL/TLS required
- Connection string in environment variables
- Database credentials rotated periodically

---

## Security Best Practices

### Development

✅ **Do**:
- Always use environment variables for secrets
- Validate all user input server-side
- Use HTTPS in production
- Keep dependencies updated (`npm audit`)
- Review code for security issues
- Use TypeScript for type safety
- Implement error handling that doesn't leak information

❌ **Don't**:
- Never commit `.env` files
- Don't expose API keys in client code
- Don't trust client-side validation alone
- Don't use `dangerouslySetInnerHTML`
- Don't store passwords in plaintext
- Don't log sensitive user data
- Don't disable security features for convenience

### Code Review

**Security Checklist**:
- [ ] No hardcoded secrets
- [ ] No exposed API keys
- [ ] Authentication on protected routes
- [ ] Input validation present
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (proper escaping)
- [ ] CSRF protection enabled
- [ ] Error messages don't leak sensitive info

### Dependency Management

**Regular Updates**:
```bash
# Check for vulnerabilities
npm audit

# Fix automatically if possible
npm audit fix

# Review dependency updates
npm outdated
```

**Security Advisories**:
- Monitor GitHub Dependabot alerts
- Subscribe to security mailing lists
- Review changelogs for security patches

---

## Incident Response

### If Secrets Are Exposed

**Immediate Actions**:
1. **Rotate all affected secrets**:
   - `NEXTAUTH_SECRET`
   - `GOOGLE_CLIENT_SECRET`
   - `GEMINI_API_KEY`
   - Database password
2. **Revoke compromised credentials** in external services
3. **Update environment variables** in Vercel
4. **Redeploy application**
5. **Monitor** for unauthorized access
6. **Notify users** if data was accessed

### If Data Breach Occurs

**Response Plan**:
1. **Contain**: Identify and stop the breach
2. **Assess**: Determine what data was accessed
3. **Notify**: Inform affected users
4. **Remediate**: Fix the vulnerability
5. **Review**: Post-mortem and improvements

### Reporting Security Issues

**Contact**:
- Email: security@yourcompany.com (set up dedicated email)
- Private reporting via GitHub Security Advisories

**Do Not**:
- Post security vulnerabilities publicly
- Share exploit details before fix is deployed

---

## Compliance Considerations

### HIPAA (Health Insurance Portability and Accountability Act)

**Note**: OllieAI is **not HIPAA-compliant** by default.

**For HIPAA Compliance** (consult legal counsel):
- Business Associate Agreement (BAA) with all vendors
- Encrypted data at rest and in transit (✅ have this)
- Access controls and audit logs
- Data breach notification procedures
- Physical safeguards for servers
- Employee training
- Risk assessments

**Vendors**:
- Check if Vercel, Neon, Google offer BAAs

### GDPR (General Data Protection Regulation)

**User Rights**:
- Right to access data (implement data export)
- Right to deletion (implement account deletion)
- Right to rectification (allow profile editing)
- Right to data portability (export in standard format)

**Implementation Checklist**:
- [ ] Privacy policy clearly states data usage
- [ ] User consent for data collection
- [ ] Data minimization (only collect what's needed)
- [ ] Data retention policy
- [ ] User data export functionality
- [ ] Account deletion functionality
- [ ] Cookie consent (for EU users)

### CCPA (California Consumer Privacy Act)

**Requirements** (if applicable):
- Disclose data collection practices
- Allow opt-out of data sale (not applicable if not selling)
- Provide access to collected data
- Enable data deletion

---

## Security Headers

### Recommended Headers

Implement in `next.config.js`:

```javascript
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()'
  }
];

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};
```

---

## Monitoring and Auditing

### Logging

**What to Log**:
- Authentication attempts (success and failure)
- API endpoint access
- Database queries (slow queries)
- Errors and exceptions
- Security events (unusual access patterns)

**What NOT to Log**:
- Passwords (plaintext)
- API keys
- Session tokens
- Personal health information details

### Monitoring Tools

**Recommended**:
- **Sentry**: Error tracking and monitoring
- **LogRocket**: Session replay and logging
- **Vercel Analytics**: Traffic and performance
- **Datadog**: Full-stack monitoring

### Regular Audits

**Monthly**:
- Review access logs
- Check for failed auth attempts
- Verify environment variables
- Update dependencies

**Quarterly**:
- Security review of code changes
- Penetration testing (if resources allow)
- Review user permissions
- Rotate secrets

**Annually**:
- Comprehensive security audit
- Privacy policy review
- Compliance review (GDPR, CCPA, etc.)
- Third-party security assessment

---

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/deploying#security)
- [NextAuth.js Security](https://next-auth.js.org/configuration/options#security)
- [Vercel Security](https://vercel.com/security)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)

---

**Security is an ongoing process, not a one-time implementation. Stay vigilant and keep improving!** 🔒
