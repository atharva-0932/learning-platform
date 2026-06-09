#!/usr/bin/env bash
# Builds supabase/scripts/full_schema_bootstrap.sql from repo SQL sources (run order matters).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
OUT="$ROOT/supabase/scripts/full_schema_bootstrap.sql"

cat > "$OUT" <<'EOF'
-- =============================================================================
-- SkillCrew — full schema bootstrap for a NEW Supabase (PostgreSQL) project
-- =============================================================================
-- Run once on an empty project (Supabase Dashboard → SQL Editor).
--
-- Before running:
--   1. Create the new Supabase project.
--   2. Database → Extensions → enable "vector" (pgvector). uuid-ossp is usually on.
--      Supabase installs vector into the `extensions` schema — this file expects that.
--   3. Run this entire file.
--   4. Copy data from the old project (see migrate_data_to_new_supabase.sh).
--
-- After running:
--   Update frontend/.env and backend/.env with the new project's URL + keys.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

EOF

append() {
  local f="$1"
  echo "" >> "$OUT"
  echo "-- >>> $(basename "$f")" >> "$OUT"
  cat "$f" >> "$OUT"
}

# Base tables + triggers + chat + continuity + agents + roadmaps
append "$ROOT/frontend/scripts/001_create_tables.sql"
append "$ROOT/frontend/scripts/002_profile_trigger.sql"
append "$ROOT/frontend/scripts/003_chat_conversations.sql"
append "$ROOT/frontend/scripts/004_learning_continuity.sql"
append "$ROOT/frontend/scripts/004_agents_signals.sql"
append "$ROOT/frontend/scripts/005_user_archie_roadmaps.sql"
append "$ROOT/frontend/scripts/007_roadmap_kind_split.sql"
append "$ROOT/frontend/scripts/006_user_context_events_delete.sql"

# Incremental migrations (supabase/migrations), chronological
for f in "$ROOT"/supabase/migrations/*.sql; do
  append "$f"
done

# skills source constraint (also in migrations; idempotent)
append "$ROOT/frontend/scripts/006_skills_source_roadmap.sql"

cat >> "$OUT" <<'EOF'

-- =============================================================================
-- End of bootstrap
-- =============================================================================
EOF

echo "Wrote $OUT ($(wc -l < "$OUT") lines)"
