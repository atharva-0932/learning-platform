# Fresh start on a new Supabase project

Use this when the **old project is paused, deleted, or unreachable** and you **cannot** run `pg_dump` from it.

In that case you **cannot** copy users, roadmaps, XP, or payment records. You only recreate the **schema** and start with empty tables.

## 1. Create a new Supabase project

Supabase Dashboard → **New project** → pick region → save the database password.

## 2. Enable extensions

**Database → Extensions**

- `uuid-ossp` (usually enabled)
- **`vector`** (required for `agent_cache`)

## 3. Apply schema

**SQL Editor** → paste and run the full file:

```
supabase/scripts/full_schema_bootstrap.sql
```

Or regenerate first:

```bash
bash supabase/scripts/build_full_schema_bootstrap.sh
```

## 4. Configure auth (optional but recommended)

**Authentication → URL configuration**

- Site URL: `http://localhost:3000` (dev) or your production URL
- Redirect URLs: add `http://localhost:3000/**` and your Vercel preview/production URLs

**Authentication → Providers** — enable Email (and Google/GitHub if you use them).

## 5. Update environment variables

From **Project Settings → API**, copy into `frontend/.env` and `backend/.env`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_NEW_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_new_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_new_service_role_key
SUPABASE_PROJECT_URL=https://YOUR_NEW_REF.supabase.co
SUPABASE_URL=https://YOUR_NEW_REF.supabase.co
```

Update **Vercel** (or other host) with the same values.

## 6. Restart apps

```bash
# frontend
cd frontend && npm run dev

# backend
cd backend && source .venv/bin/activate && python main.py
```

## 7. Verify

1. Sign up as a **new user** (old accounts do not exist on the new DB).
2. Complete onboarding / create a roadmap.
3. Test Job Ready portal + Razorpay (test keys).

Sanity SQL on the new project:

```sql
SELECT count(*) AS profiles FROM public.profiles;
SELECT count(*) AS users FROM auth.users;
```

Both should be `0` before anyone signs up, then increment after signup.

## What is lost vs preserved

| Lost (no old DB access) | Preserved (in repo) |
|-------------------------|---------------------|
| User accounts & passwords | Full table schema + RLS |
| Profiles, XP, streaks | Triggers (auto-create profile on signup) |
| Roadmaps & quiz history | RPCs (capstone unlock, leaderboards, agent cache) |
| Mock interview transcripts | App code & migrations |
| Razorpay paid unlock flags | |

## If you had critical production data

- Contact **Supabase support** — rarely they can restore a recently paused project on paid plans.
- Check local `.sql` dumps, Vercel/CI backups, or any manual exports you may have saved outside the repo.

**Do not run** `migrate_data_to_new_supabase.sh` without a working `OLD_DB_URL` — it will fail if the old project is paused.
