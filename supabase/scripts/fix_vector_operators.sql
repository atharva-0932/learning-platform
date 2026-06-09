-- Hotfix: pgvector operator <=> on Supabase (extension lives in `extensions` schema).
-- Run this if full_schema_bootstrap.sql failed at match_agent_cache with:
--   operator does not exist: extensions.vector <=> extensions.vector
--
-- Safe to run on a partial bootstrap; then re-run bootstrap from the next section
-- OR run the remainder manually after this succeeds.

CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- Align column type if table was created with wrong vector schema
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'agent_cache' AND column_name = 'embedding'
  ) THEN
    ALTER TABLE public.agent_cache
      ALTER COLUMN embedding TYPE extensions.vector(1536)
      USING embedding::extensions.vector(1536);
  END IF;
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'agent_cache.embedding alter skipped: %', SQLERRM;
END $$;

DROP INDEX IF EXISTS public.agent_cache_embedding_ivfflat_idx;
CREATE INDEX IF NOT EXISTS agent_cache_embedding_ivfflat_idx
  ON public.agent_cache
  USING ivfflat (embedding extensions.vector_cosine_ops)
  WITH (lists = 10);

CREATE OR REPLACE FUNCTION public.match_agent_cache(
  query_embedding extensions.vector(1536),
  match_agent text,
  match_threshold float,
  match_count int default 1
)
RETURNS TABLE (
  id uuid,
  response jsonb,
  similarity float
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public, extensions
AS $$
  SELECT
    c.id,
    c.response,
    (1 - (c.embedding <=> query_embedding))::float AS similarity
  FROM public.agent_cache c
  WHERE c.user_id = auth.uid()
    AND c.agent_key = match_agent
    AND c.embedding IS NOT NULL
    AND (1 - (c.embedding <=> query_embedding)) >= match_threshold
  ORDER BY c.embedding <=> query_embedding
  LIMIT greatest(1, least(match_count, 5));
$$;

GRANT EXECUTE ON FUNCTION public.match_agent_cache(extensions.vector, text, float, int) TO authenticated;
