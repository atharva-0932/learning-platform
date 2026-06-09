#!/usr/bin/env bash
# Copy ALL data from an OLD Supabase Postgres project into a NEW one (schema must exist first).
#
# Prerequisites:
#   - psql and pg_dump installed (PostgreSQL client tools)
#   - full_schema_bootstrap.sql already applied on NEW project
#   - Direct connection strings (port 5432), NOT the pooler, for dump/restore
#
# Usage:
#   export OLD_DB_URL='postgresql://postgres.[OLD_REF]:[PASSWORD]@db.[OLD_REF].supabase.co:5432/postgres'
#   export NEW_DB_URL='postgresql://postgres.[NEW_REF]:[PASSWORD]@db.[NEW_REF].supabase.co:5432/postgres'
#   ./supabase/scripts/migrate_data_to_new_supabase.sh
#
# Get connection strings: Supabase Dashboard → Project Settings → Database → Connection string → URI

set -euo pipefail

if [[ -z "${OLD_DB_URL:-}" || -z "${NEW_DB_URL:-}" ]]; then
  echo "Set OLD_DB_URL and NEW_DB_URL (direct postgres://…:5432/postgres URLs)." >&2
  exit 1
fi

DUMP_DIR="$(mktemp -d)"
trap 'rm -rf "$DUMP_DIR"' EXIT

echo "==> Exporting auth.users from OLD project…"
pg_dump "$OLD_DB_URL" \
  --data-only \
  --no-owner \
  --no-privileges \
  --table=auth.users \
  --table=auth.identities \
  -f "$DUMP_DIR/auth_data.sql"

echo "==> Exporting public schema data from OLD project…"
pg_dump "$OLD_DB_URL" \
  --data-only \
  --no-owner \
  --no-privileges \
  --schema=public \
  -f "$DUMP_DIR/public_data.sql"

echo "==> Importing auth data into NEW project (users must exist before profiles)…"
psql "$NEW_DB_URL" -v ON_ERROR_STOP=1 -f "$DUMP_DIR/auth_data.sql"

echo "==> Importing public data into NEW project…"
psql "$NEW_DB_URL" -v ON_ERROR_STOP=1 -f "$DUMP_DIR/public_data.sql"

echo "==> Row counts on NEW project (sanity check)…"
psql "$NEW_DB_URL" -v ON_ERROR_STOP=1 <<'SQL'
SELECT 'auth.users' AS tbl, count(*) FROM auth.users
UNION ALL SELECT 'profiles', count(*) FROM public.profiles
UNION ALL SELECT 'user_archie_roadmaps', count(*) FROM public.user_archie_roadmaps
UNION ALL SELECT 'skills', count(*) FROM public.skills
UNION ALL SELECT 'mock_interview_sessions', count(*) FROM public.mock_interview_sessions
ORDER BY 1;
SQL

echo ""
echo "Done. Next steps:"
echo "  1. Update frontend/.env: NEXT_PUBLIC_SUPABASE_URL, keys, POSTGRES_*"
echo "  2. Update backend/.env: SUPABASE_PROJECT_URL, SUPABASE_SERVICE_ROLE_KEY"
echo "  3. Restart Next.js + FastAPI"
echo "  4. Log in with an existing test user to verify data"
