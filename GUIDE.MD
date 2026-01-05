# RunBook Development Guide

This guide documents the implementation approach, setup instructions, and testing procedures for each feature.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [TODO 1: Infrastructure Setup](#todo-1-infrastructure-setup)
- [TODO 2: Prisma Schema](#todo-2-prisma-schema)
- [TODO 3: Supabase Clients](#todo-3-supabase-clients)
- [TODO 4: Google Authentication](#todo-4-google-authentication)
- [TODO 5: Auth Middleware](#todo-5-auth-middleware)
- [TODO 6: Onboarding Modal](#todo-6-onboarding-modal)
- [TODO 7: Onboarding Steps](#todo-7-onboarding-steps)
- [TODO 8: Goals API](#todo-8-goals-api)
- [TODO 9: Dashboard Layout](#todo-9-dashboard-layout)
- [TODO 10: Task Management](#todo-10-task-management)

---

## Tech Stack

| Layer      | Technology            | Purpose                                     |
| ---------- | --------------------- | ------------------------------------------- |
| Framework  | Next.js 16            | App Router, Server Components, API Routes   |
| Language   | TypeScript            | Type safety across the stack                |
| Database   | PostgreSQL (Supabase) | Managed database with realtime capabilities |
| ORM        | Prisma                | Type-safe database queries and migrations   |
| Auth       | Supabase Auth         | Google OAuth, session management            |
| Styling    | Tailwind CSS 4        | Utility-first CSS                           |
| Animations | Framer Motion         | Smooth, declarative animations              |

---

## TODO 1: Infrastructure Setup ✅

### Approach

Set up the foundational dependencies and environment configuration for database (Prisma) and authentication (Supabase). This establishes the core infrastructure that all other features will depend on.

### Implementation Strategy

1. Install Supabase client libraries for both browser and server-side usage
2. Install Prisma ORM (v7) for type-safe database operations
3. Initialize Prisma with PostgreSQL configuration using the new Prisma 7 config format
4. Create environment variable templates for easy onboarding
5. Add npm scripts for common database operations

### Dependencies Installed

```json
{
  "dependencies": {
    "@prisma/client": "^7.2.0",
    "@supabase/ssr": "^0.8.0",
    "@supabase/supabase-js": "^2.89.0",
    "dotenv": "^17.x"
  },
  "devDependencies": {
    "prisma": "^7.2.0"
  }
}
```

### Files Created/Modified

| File                   | Purpose                                                           |
| ---------------------- | ----------------------------------------------------------------- |
| `prisma/schema.prisma` | Database schema with User, Goal, MeetingSchedule models and enums |
| `prisma.config.ts`     | Prisma 7 configuration file for database connections              |
| `env.example`          | Environment variable template                                     |
| `package.json`         | Added database scripts                                            |

### Prisma 7 Configuration Note

Prisma 7 introduced a breaking change - database URLs are no longer specified in `schema.prisma`. Instead, they are configured in `prisma.config.ts`:

```typescript
// prisma.config.ts
export default defineConfig({
  earlyAccess: true,
  schema: path.join(__dirname, "prisma", "schema.prisma"),
  migrate: { url: process.env.DIRECT_URL! },
  studio: { url: process.env.DIRECT_URL! },
});
```

The runtime `DATABASE_URL` is passed when instantiating the Prisma client (handled in TODO 3).

### NPM Scripts Added

| Script        | Command                | Purpose                         |
| ------------- | ---------------------- | ------------------------------- |
| `db:generate` | `prisma generate`      | Generate Prisma Client          |
| `db:push`     | `prisma db push`       | Push schema to database (dev)   |
| `db:migrate`  | `prisma migrate dev`   | Create and run migrations       |
| `db:studio`   | `prisma studio`        | Open Prisma Studio GUI          |
| `db:reset`    | `prisma migrate reset` | Reset database                  |
| `postinstall` | `prisma generate`      | Auto-generate client on install |

### Setup Instructions

#### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be provisioned (~2 minutes)

#### 2. Get Supabase Credentials

1. Navigate to **Settings > API** in Supabase Dashboard
2. Copy the **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
3. Copy the **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

#### 3. Get Database Connection Strings

1. Navigate to **Settings > Database** in Supabase Dashboard
2. Scroll to **Connection string** section
3. Select **Transaction pooler** → Copy for `DATABASE_URL` (used at runtime with connection pooling)
4. Select **Session pooler** or **Direct** → Copy for `DIRECT_URL` (used for migrations)

#### 4. Configure Environment

```bash
# Copy the example environment file
cp env.example .env.local

# Edit .env.local with your Supabase values
# Replace placeholders with actual credentials
```

#### 5. Generate Prisma Client

```bash
npm run db:generate
```

#### 6. Push Schema to Database

```bash
npm run db:push
```

### Testing Instructions

#### Verify Prisma Installation

```bash
# Check Prisma is installed correctly
npx prisma --version
# Expected: prisma                  : 7.2.0

# Validate schema syntax
npx prisma validate
# Expected: The schema at prisma\schema.prisma is valid 🚀

# Generate Prisma client
npm run db:generate
# Expected: ✔ Generated Prisma Client (v7.2.0)
```

#### Verify Database Connection (after adding credentials)

```bash
# Open Prisma Studio to verify connection
npm run db:studio
# This opens a browser at localhost:5555 if connection is successful

# Push schema to database
npm run db:push
# This creates the tables in your Supabase database
```

### Troubleshooting

| Issue                   | Solution                                                                     |
| ----------------------- | ---------------------------------------------------------------------------- |
| `prisma generate` fails | Run `npm install` first, ensure node_modules exists                          |
| Schema validation error | Check `prisma.config.ts` exists and has valid syntax                         |
| Connection refused      | Verify Supabase project is active, check credentials in `.env.local`         |
| SSL/TLS error           | Connection strings from Supabase should include SSL by default               |
| `DIRECT_URL` not found  | Ensure `.env.local` has `DIRECT_URL` set for migrations                      |
| Pooler timeout          | Use `DIRECT_URL` for migrations, `DATABASE_URL` (pooler) for runtime queries |

---

## TODO 2: Prisma Schema ✅

### Approach

Define the complete database schema for RunBook with models for users, goals, and meeting schedules. The schema is designed to support the AI accountability meeting system with proper relationships and future extensibility.

### Implementation Strategy

1. Create User model linked to Supabase Auth via `supabaseId`
2. Create Goal model with type (daily/weekly/monthly) and priority levels
3. Create MeetingSchedule model for storing user's preferred meeting times
4. Define enums for type-safe goal categorization
5. Add proper indexes and cascading deletes for data integrity

### Schema Design

```
┌─────────────────────────────────────────────────────────────┐
│                         USER                                │
├─────────────────────────────────────────────────────────────┤
│ id             String    @id (cuid)                         │
│ supabaseId     String    @unique (links to Supabase Auth)   │
│ email          String    @unique                            │
│ name           String?   (set during onboarding)            │
│ avatarUrl      String?   (from Google profile)              │
│ onboardingDone Boolean   (tracks onboarding completion)     │
│ createdAt      DateTime                                     │
│ updatedAt      DateTime                                     │
├─────────────────────────────────────────────────────────────┤
│ Relations: goals[], meetingSchedule?                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ 1:N
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                          GOAL                               │
├─────────────────────────────────────────────────────────────┤
│ id          String    @id (cuid)                            │
│ title       String    (goal description)                    │
│ description String?   (optional details)                    │
│ type        GoalType  (DAILY/WEEKLY/MONTHLY)                │
│ priority    Priority  (DEFAULT/LOW/HIGH/URGENT)             │
│ completed   Boolean   (completion status)                   │
│ order       Int       (for drag-drop ordering)              │
│ userId      String    (foreign key)                         │
│ createdAt   DateTime                                        │
│ updatedAt   DateTime                                        │
├─────────────────────────────────────────────────────────────┤
│ Index: userId (for efficient user queries)                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    MEETING_SCHEDULE                         │
├─────────────────────────────────────────────────────────────┤
│ id        String   @id (cuid)                               │
│ userId    String   @unique (1:1 with User)                  │
│ time      String   (e.g., "09:00" in 24h format)            │
│ timezone  String   (e.g., "America/New_York")               │
│ frequency String   (daily/weekly)                           │
│ isActive  Boolean  (pause/resume meetings)                  │
│ createdAt DateTime                                          │
│ updatedAt DateTime                                          │
└─────────────────────────────────────────────────────────────┘
```

### Enums

| Enum       | Values                     | Purpose                            |
| ---------- | -------------------------- | ---------------------------------- |
| `GoalType` | DAILY, WEEKLY, MONTHLY     | Categorize goals by timeframe      |
| `Priority` | DEFAULT, LOW, HIGH, URGENT | Task prioritization for AI context |

### Key Design Decisions

| Decision                        | Rationale                                                    |
| ------------------------------- | ------------------------------------------------------------ |
| `supabaseId` separate from `id` | Allows internal ID management while linking to Supabase Auth |
| `onboardingDone` flag           | Controls whether to show onboarding modal on login           |
| `order` field on Goal           | Enables drag-and-drop reordering in the UI                   |
| `isActive` on MeetingSchedule   | Users can pause meetings without deleting schedule           |
| Cascade deletes                 | Deleting a user removes all their goals and schedules        |
| `@@map()` annotations           | Snake_case table names for PostgreSQL convention             |

### Files Modified

| File                   | Changes                                            |
| ---------------------- | -------------------------------------------------- |
| `prisma/schema.prisma` | Added User, Goal, MeetingSchedule models and enums |

### Testing Instructions

```bash
# Validate schema syntax
npx prisma validate

# View schema in Prisma Studio
npm run db:studio

# Check tables in Supabase Dashboard
# Navigate to Table Editor - you should see:
# - users
# - goals
# - meeting_schedules
```

### Future Extensibility

The schema is designed to easily accommodate future features:

- **Meeting model**: For storing meeting transcripts and summaries
- **Pattern model**: For AI-detected behavioral patterns
- **Notification preferences**: Can be added to User model
- **Team features**: Can add Organization and TeamMember models

---

## TODO 3: Supabase Clients ✅

### Approach

Create properly configured Supabase clients for different execution contexts (browser, server, middleware) and a Prisma singleton for database operations. This separation ensures proper cookie handling and prevents multiple client instances.

### Implementation Strategy

1. Create browser client for client-side auth operations
2. Create server client with cookie management for SSR
3. Create middleware client for session refresh during navigation
4. Create Prisma singleton to prevent hot-reload issues in development
5. Provide helper functions for common auth operations

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│  Browser Client (lib/supabase/client.ts)                        │
│  └─ Used in: Client Components ("use client")                   │
│  └─ Purpose: Auth operations (signIn, signOut, onAuthChange)    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        SERVER LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│  Server Client (lib/supabase/server.ts)                         │
│  └─ Used in: Server Components, Route Handlers, Server Actions  │
│  └─ Purpose: Get user/session with cookie management            │
├─────────────────────────────────────────────────────────────────┤
│  Middleware Client (lib/supabase/middleware.ts)                 │
│  └─ Used in: middleware.ts                                      │
│  └─ Purpose: Refresh sessions, protect routes                   │
├─────────────────────────────────────────────────────────────────┤
│  Prisma Client (lib/prisma.ts)                                  │
│  └─ Used in: API Routes, Server Actions                         │
│  └─ Purpose: All database queries (CRUD operations)             │
└─────────────────────────────────────────────────────────────────┘
```

### Files Created

| File                         | Purpose                                                   |
| ---------------------------- | --------------------------------------------------------- |
| `lib/supabase/client.ts`     | Browser client for client-side auth                       |
| `lib/supabase/server.ts`     | Server client with `getUser()` and `getSession()` helpers |
| `lib/supabase/middleware.ts` | Middleware client for route protection                    |
| `lib/supabase/index.ts`      | Re-exports for convenient imports                         |
| `lib/prisma.ts`              | Prisma singleton with connection pooling                  |

### Usage Examples

#### Client Component (Auth Operations)

```typescript
"use client";
import { createClient } from "@/lib/supabase/client";

function LoginButton() {
  const supabase = createClient();

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
  };

  return <button onClick={handleLogin}>Sign in with Google</button>;
}
```

#### Server Component (Get User)

```typescript
import { getUser } from "@/lib/supabase/server";

async function Dashboard() {
  const user = await getUser();
  if (!user) redirect("/login");

  return <div>Welcome, {user.email}</div>;
}
```

#### API Route (Database Query)

```typescript
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/supabase/server";

export async function GET() {
  const user = await getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const goals = await prisma.goal.findMany({
    where: { user: { supabaseId: user.id } },
  });

  return Response.json(goals);
}
```

### Prisma 7 Configuration

Prisma 7 requires passing the database URL at runtime:

```typescript
// lib/prisma.ts
new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error"],
});
```

### Testing Instructions

```bash
# Verify TypeScript compilation
npx tsc --noEmit

# Test Prisma client generation
npm run db:generate

# Test in development (check console for Prisma logs)
npm run dev
```

#### Manual Verification

1. Start dev server: `npm run dev`
2. Check browser console for Supabase initialization
3. Check terminal for Prisma query logs (in development mode)

### Environment Variables Required

| Variable                        | Used By              | Purpose                        |
| ------------------------------- | -------------------- | ------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`      | All Supabase clients | Supabase project URL           |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | All Supabase clients | Public anonymous key           |
| `DATABASE_URL`                  | Prisma               | PostgreSQL connection (pooled) |

---

## TODO 4: Google Authentication ✅

### Approach

Implement Google OAuth authentication using Supabase Auth. Users can only sign in with Google - no email/password option. On first sign-in, a user record is automatically created in our database.

### Implementation Strategy

1. Create a beautiful login page matching the existing design system
2. Build a reusable Google Sign-In button with loading states
3. Create OAuth callback route to handle Google's redirect
4. Sync Supabase Auth user with our Prisma User model
5. Add sign-out functionality

### Auth Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Login Page │────▶│   Supabase  │────▶│   Google    │────▶│  Callback   │
│             │     │    Auth     │     │   OAuth     │     │   Route     │
└─────────────┘     └─────────────┘     └─────────────┘     └──────┬──────┘
                                                                    │
                    ┌─────────────┐     ┌─────────────┐             │
                    │  Dashboard  │◀────│  Create/Get │◀────────────┘
                    │             │     │  DB User    │
                    └─────────────┘     └─────────────┘
```

### Files Created

| File                                     | Purpose                                                             |
| ---------------------------------------- | ------------------------------------------------------------------- |
| `app/login/page.tsx`                     | Beautiful login page with gradient background                       |
| `app/auth/callback/route.ts`             | OAuth callback handler, creates DB user                             |
| `components/auth/GoogleSignInButton.tsx` | Animated Google sign-in button                                      |
| `components/auth/SignOutButton.tsx`      | Sign-out button with variants                                       |
| `components/auth/index.ts`               | Component exports                                                   |
| `lib/auth.ts`                            | Auth utilities: `getDbUser()`, `requireAuth()`, `needsOnboarding()` |

### Key Components

#### GoogleSignInButton

```typescript
import { GoogleSignInButton } from "@/components/auth";

// Basic usage
<GoogleSignInButton />

// With custom redirect
<GoogleSignInButton redirectTo="/auth/callback?next=/onboarding" />
```

#### SignOutButton

```typescript
import { SignOutButton } from "@/components/auth";

// Full button with icon and text
<SignOutButton />

// Icon only
<SignOutButton variant="icon" />

// Text only
<SignOutButton variant="text" />
```

#### Auth Utilities

```typescript
import { getDbUser, requireAuth, needsOnboarding } from "@/lib/auth";

// Get user (returns null if not authenticated)
const user = await getDbUser();

// Require auth (redirects to /login if not authenticated)
const user = await requireAuth();

// Check if onboarding needed
const needsSetup = await needsOnboarding();
```

### Supabase Setup Instructions

#### 1. Enable Google Provider in Supabase

1. Go to **Supabase Dashboard > Authentication > Providers**
2. Find **Google** and enable it
3. You'll need Google OAuth credentials

#### 2. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Navigate to **APIs & Services > Credentials**
4. Click **Create Credentials > OAuth client ID**
5. Select **Web application**
6. Add authorized redirect URI:
   ```
   https://<your-project-ref>.supabase.co/auth/v1/callback
   ```
7. Copy **Client ID** and **Client Secret**

#### 3. Configure Supabase

1. Back in Supabase Dashboard > Authentication > Providers > Google
2. Paste the **Client ID** and **Client Secret**
3. Save

#### 4. Add Redirect URLs

1. Go to **Authentication > URL Configuration**
2. Add your site URL to **Site URL**: `http://localhost:3000`
3. Add to **Redirect URLs**:
   - `http://localhost:3000/auth/callback`
   - `https://your-domain.com/auth/callback` (for production)

### Testing Instructions

```bash
# Start the dev server
npm run dev

# Visit login page
open http://localhost:3000/login

# Click "Continue with Google"
# You should be redirected to Google
# After auth, you'll land on /dashboard
```

#### Verify Database User Created

```bash
# Open Prisma Studio
npm run db:studio

# Check the "users" table for your new user
```

### Troubleshooting

| Issue                   | Solution                                     |
| ----------------------- | -------------------------------------------- |
| "OAuth error"           | Check Google credentials in Supabase         |
| "Redirect URI mismatch" | Add the exact callback URL to Google Console |
| User not created in DB  | Check server logs, verify Prisma connection  |
| "Invalid login"         | Clear cookies, try incognito mode            |

---

## TODO 5: Auth Middleware ✅

### Approach

Create Next.js middleware to protect routes and manage authentication flow. The middleware intercepts requests before they reach the page, checking auth status and redirecting as needed.

### Implementation Strategy

1. Create middleware that checks Supabase session on every request
2. Define protected routes (require auth) and auth routes (redirect if logged in)
3. Handle redirects based on authentication state
4. Create protected layout wrapper for additional server-side auth check

### Route Protection Logic

```
┌─────────────────────────────────────────────────────────────────┐
│                     INCOMING REQUEST                            │
└─────────────────────────────────┬───────────────────────────────┘
                                  │
                                  ▼
                    ┌─────────────────────────┐
                    │   Check Supabase User   │
                    └─────────────┬───────────┘
                                  │
                    ┌─────────────┴───────────┐
                    │                         │
                    ▼                         ▼
            ┌───────────────┐         ┌───────────────┐
            │  Logged In    │         │  Not Logged   │
            └───────┬───────┘         └───────┬───────┘
                    │                         │
        ┌───────────┴───────────┐   ┌─────────┴─────────┐
        │                       │   │                   │
        ▼                       ▼   ▼                   ▼
  Protected Route?      Auth Route?  Protected Route?   Auth Route?
        │                       │         │                 │
        ▼                       ▼         ▼                 ▼
      Allow              Redirect to    Redirect to       Allow
                         /dashboard       /login
```

### Files Created

| File                                 | Purpose                                 |
| ------------------------------------ | --------------------------------------- |
| `middleware.ts`                      | Next.js middleware for route protection |
| `app/(protected)/layout.tsx`         | Server-side auth check wrapper          |
| `app/(protected)/dashboard/page.tsx` | Dashboard placeholder page              |
| `app/(protected)/meeting/page.tsx`   | Meeting "Coming Soon" page              |

### Route Configuration

| Route Type | Routes                                            | Behavior                                  |
| ---------- | ------------------------------------------------- | ----------------------------------------- |
| Protected  | `/dashboard`, `/meeting`, `/settings`, `/profile` | Redirect to `/login` if not authenticated |
| Auth       | `/login`                                          | Redirect to `/dashboard` if authenticated |
| Public     | `/`, `/auth/callback`, `/terms`, `/privacy`       | Accessible to everyone                    |

### Middleware Configuration

```typescript
// middleware.ts
export const config = {
  matcher: [
    // Match all routes except static files and images
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

### Usage

#### Protected Layout (Server-Side Check)

```typescript
// app/(protected)/layout.tsx
import { requireAuth } from "@/lib/auth";

export default async function ProtectedLayout({ children }) {
  // Redirects to /login if not authenticated
  await requireAuth();
  return <>{children}</>;
}
```

#### Client Component Auth Check

```typescript
"use client";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

function useUser() {
  const [user, setUser] = useState(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  return user;
}
```

### Testing Instructions

```bash
# Start dev server
npm run dev

# Test protected route (should redirect to /login)
open http://localhost:3000/dashboard

# Login, then try /login (should redirect to /dashboard)
open http://localhost:3000/login
```

### Security Notes

1. **Middleware runs on Edge** - Fast, but can't access database directly
2. **Double protection** - Middleware + Layout auth check for defense in depth
3. **Session refresh** - Middleware client automatically refreshes expired sessions
4. **Redirect preservation** - Original URL saved in query param for post-login redirect

---

## TODO 6: Onboarding Modal

_Coming soon_

---

## TODO 7: Onboarding Steps

_Coming soon_

---

## TODO 8: Goals API

_Coming soon_

---

## TODO 9: Dashboard Layout

_Coming soon_

---

## TODO 10: Task Management

_Coming soon_
