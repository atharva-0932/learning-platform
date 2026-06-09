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


-- >>> 001_create_tables.sql
-- SkillCrew Database Schema
-- Creates all necessary tables for user profiles, skills, work experience, and learning paths

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  linkedin_url TEXT,
  portfolio_url TEXT,
  resume_url TEXT,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  streak INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Skills table
CREATE TABLE IF NOT EXISTS public.skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  level TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced', 'expert')) DEFAULT 'beginner',
  confidence DECIMAL(3,2) DEFAULT 0.50,
  source TEXT CHECK (source IN ('manual', 'linkedin', 'resume', 'ai_extracted')) DEFAULT 'manual',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Work Experience table
CREATE TABLE IF NOT EXISTS public.work_experiences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN DEFAULT FALSE,
  source TEXT CHECK (source IN ('manual', 'linkedin', 'resume')) DEFAULT 'manual',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Learning Paths table
CREATE TABLE IF NOT EXISTS public.learning_paths (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  goal TEXT CHECK (goal IN ('skill-mastery', 'job-readiness', 'certification')) NOT NULL,
  progress DECIMAL(5,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  estimated_completion TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Learning Modules table
CREATE TABLE IF NOT EXISTS public.learning_modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  path_id UUID NOT NULL REFERENCES public.learning_paths(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('locked', 'available', 'in-progress', 'completed')) DEFAULT 'locked',
  progress DECIMAL(5,2) DEFAULT 0,
  estimated_time TEXT,
  skills TEXT[], -- Array of skill names
  agent_id TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Badges table
CREATE TABLE IF NOT EXISTS public.badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  rarity TEXT CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')) DEFAULT 'common',
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Flashcards table
CREATE TABLE IF NOT EXISTS public.flashcards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  module_id UUID REFERENCES public.learning_modules(id) ON DELETE SET NULL,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'medium',
  mastery DECIMAL(3,2) DEFAULT 0,
  next_review TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'expert')) DEFAULT 'intermediate',
  learning_pace TEXT CHECK (learning_pace IN ('slow', 'balanced', 'fast')) DEFAULT 'balanced',
  preferred_content TEXT CHECK (preferred_content IN ('video', 'text', 'interactive', 'mixed')) DEFAULT 'mixed',
  daily_goal_minutes INTEGER DEFAULT 30,
  email_notifications BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT TRUE,
  daily_reminders BOOLEAN DEFAULT TRUE,
  streak_alerts BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- RLS Policies for skills
CREATE POLICY "skills_select_own" ON public.skills FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "skills_insert_own" ON public.skills FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "skills_update_own" ON public.skills FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "skills_delete_own" ON public.skills FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for work_experiences
CREATE POLICY "work_experiences_select_own" ON public.work_experiences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "work_experiences_insert_own" ON public.work_experiences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "work_experiences_update_own" ON public.work_experiences FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "work_experiences_delete_own" ON public.work_experiences FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for learning_paths
CREATE POLICY "learning_paths_select_own" ON public.learning_paths FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "learning_paths_insert_own" ON public.learning_paths FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "learning_paths_update_own" ON public.learning_paths FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "learning_paths_delete_own" ON public.learning_paths FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for learning_modules
CREATE POLICY "learning_modules_select_own" ON public.learning_modules FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.learning_paths WHERE id = path_id AND user_id = auth.uid()));
CREATE POLICY "learning_modules_insert_own" ON public.learning_modules FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.learning_paths WHERE id = path_id AND user_id = auth.uid()));
CREATE POLICY "learning_modules_update_own" ON public.learning_modules FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.learning_paths WHERE id = path_id AND user_id = auth.uid()));
CREATE POLICY "learning_modules_delete_own" ON public.learning_modules FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.learning_paths WHERE id = path_id AND user_id = auth.uid()));

-- RLS Policies for badges
CREATE POLICY "badges_select_own" ON public.badges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "badges_insert_own" ON public.badges FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "badges_update_own" ON public.badges FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "badges_delete_own" ON public.badges FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for flashcards
CREATE POLICY "flashcards_select_own" ON public.flashcards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "flashcards_insert_own" ON public.flashcards FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "flashcards_update_own" ON public.flashcards FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "flashcards_delete_own" ON public.flashcards FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for user_preferences
CREATE POLICY "user_preferences_select_own" ON public.user_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_preferences_insert_own" ON public.user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_preferences_update_own" ON public.user_preferences FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "user_preferences_delete_own" ON public.user_preferences FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_skills_user_id ON public.skills(user_id);
CREATE INDEX IF NOT EXISTS idx_work_experiences_user_id ON public.work_experiences(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_paths_user_id ON public.learning_paths(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_modules_path_id ON public.learning_modules(path_id);
CREATE INDEX IF NOT EXISTS idx_badges_user_id ON public.badges(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_user_id ON public.flashcards(user_id);

-- >>> 002_profile_trigger.sql
-- Auto-create profile on user signup
-- This trigger creates a profile row when a new user signs up

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NULL),
    COALESCE(NEW.raw_user_meta_data ->> 'phone', NULL)
  )
  ON CONFLICT (id) DO NOTHING;

  -- Also create default user preferences
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to all tables
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_skills_updated_at ON public.skills;
CREATE TRIGGER update_skills_updated_at
  BEFORE UPDATE ON public.skills
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_work_experiences_updated_at ON public.work_experiences;
CREATE TRIGGER update_work_experiences_updated_at
  BEFORE UPDATE ON public.work_experiences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_learning_paths_updated_at ON public.learning_paths;
CREATE TRIGGER update_learning_paths_updated_at
  BEFORE UPDATE ON public.learning_paths
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_learning_modules_updated_at ON public.learning_modules;
CREATE TRIGGER update_learning_modules_updated_at
  BEFORE UPDATE ON public.learning_modules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_flashcards_updated_at ON public.flashcards;
CREATE TRIGGER update_flashcards_updated_at
  BEFORE UPDATE ON public.flashcards
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON public.user_preferences;
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- >>> 003_chat_conversations.sql
-- Create chat_conversations table
CREATE TABLE IF NOT EXISTS public.chat_conversations (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  summary text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  conversation_id uuid NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS chat_conversations_user_id_idx ON public.chat_conversations(user_id);
CREATE INDEX IF NOT EXISTS chat_conversations_updated_at_idx ON public.chat_conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS chat_messages_conversation_id_idx ON public.chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS chat_messages_created_at_idx ON public.chat_messages(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policy for chat_conversations
CREATE POLICY "Users can view their own conversations"
  ON public.chat_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create conversations"
  ON public.chat_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
  ON public.chat_conversations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations"
  ON public.chat_conversations FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policy for chat_messages
CREATE POLICY "Users can view messages in their conversations"
  ON public.chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_conversations
      WHERE id = conversation_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in their conversations"
  ON public.chat_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chat_conversations
      WHERE id = conversation_id AND user_id = auth.uid()
    )
  );

-- >>> 004_learning_continuity.sql
-- Learning Continuity Schema
-- Tracks user's historical learning, module completions, and cross-path equivalency

-- Module Completion History table
CREATE TABLE IF NOT EXISTS public.module_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES public.learning_modules(id) ON DELETE CASCADE,
  path_id UUID NOT NULL REFERENCES public.learning_paths(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  time_spent_minutes INTEGER,
  performance_score DECIMAL(5,2), -- 0-100
  skills_acquired TEXT[], -- Array of skill names learned
  was_skipped BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, module_id) -- User can only complete a module once
);

-- Module Equivalency table (AI-detected similar modules across paths)
CREATE TABLE IF NOT EXISTS public.module_equivalencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_a_id UUID NOT NULL REFERENCES public.learning_modules(id) ON DELETE CASCADE,
  module_b_id UUID NOT NULL REFERENCES public.learning_modules(id) ON DELETE CASCADE,
  similarity_score DECIMAL(3,2) NOT NULL, -- 0-1, higher means more similar
  overlapping_skills TEXT[], -- Skills that both modules teach
  detected_by TEXT DEFAULT 'ai_analysis', -- 'ai_analysis', 'manual', 'user_submitted'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (module_a_id != module_b_id),
  UNIQUE(module_a_id, module_b_id)
);

-- Learning Context History table (tracks enrolled paths chronologically)
CREATE TABLE IF NOT EXISTS public.learning_context_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  path_id UUID NOT NULL REFERENCES public.learning_paths(id) ON DELETE CASCADE,
  enrollment_order INTEGER NOT NULL, -- 1st path, 2nd path, etc.
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  total_modules_completed INTEGER DEFAULT 0,
  total_skills_gained INTEGER DEFAULT 0,
  average_performance DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Skill Endorsements table (tracks which skills user has from completed modules)
CREATE TABLE IF NOT EXISTS public.skill_endorsements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  source_module_id UUID REFERENCES public.learning_modules(id) ON DELETE SET NULL,
  source_path_id UUID NOT NULL REFERENCES public.learning_paths(id) ON DELETE CASCADE,
  endorsed_at TIMESTAMPTZ DEFAULT NOW(),
  proficiency_level TEXT CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')) DEFAULT 'beginner',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, skill_name, source_path_id)
);

-- Mark completion as RLS enabled
ALTER TABLE public.module_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_equivalencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_context_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_endorsements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for module_completions
CREATE POLICY "module_completions_select_own" ON public.module_completions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "module_completions_insert_own" ON public.module_completions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "module_completions_update_own" ON public.module_completions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "module_completions_delete_own" ON public.module_completions FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for module_equivalencies (public read, admin write)
CREATE POLICY "module_equivalencies_select" ON public.module_equivalencies FOR SELECT USING (TRUE);
CREATE POLICY "module_equivalencies_admin_write" ON public.module_equivalencies FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid()) -- Only authenticated users
);

-- RLS Policies for learning_context_history
CREATE POLICY "learning_context_history_select_own" ON public.learning_context_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "learning_context_history_insert_own" ON public.learning_context_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "learning_context_history_update_own" ON public.learning_context_history FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for skill_endorsements
CREATE POLICY "skill_endorsements_select_own" ON public.skill_endorsements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "skill_endorsements_insert_own" ON public.skill_endorsements FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "skill_endorsements_update_own" ON public.skill_endorsements FOR UPDATE USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_module_completions_user_id ON public.module_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_module_completions_path_id ON public.module_completions(path_id);
CREATE INDEX IF NOT EXISTS idx_module_completions_completed_at ON public.module_completions(completed_at);
CREATE INDEX IF NOT EXISTS idx_module_equivalencies_module_a ON public.module_equivalencies(module_a_id);
CREATE INDEX IF NOT EXISTS idx_module_equivalencies_module_b ON public.module_equivalencies(module_b_id);
CREATE INDEX IF NOT EXISTS idx_module_equivalencies_similarity ON public.module_equivalencies(similarity_score DESC);
CREATE INDEX IF NOT EXISTS idx_learning_context_history_user_id ON public.learning_context_history(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_context_history_enrollment_order ON public.learning_context_history(enrollment_order);
CREATE INDEX IF NOT EXISTS idx_skill_endorsements_user_id ON public.skill_endorsements(user_id);
CREATE INDEX IF NOT EXISTS idx_skill_endorsements_skill_name ON public.skill_endorsements(skill_name);

-- >>> 004_agents_signals.sql
-- Agent pipelines: learner signals, roadmap snapshots, quiz history, profile context

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS learning_direction TEXT,
  ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS public.user_context_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  source TEXT NOT NULL,
  kind TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_user_context_events_user_created
  ON public.user_context_events(user_id, created_at DESC);

ALTER TABLE public.user_context_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_context_events_select_own"
  ON public.user_context_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "user_context_events_insert_own"
  ON public.user_context_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.archie_roadmap_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  roadmap_mode TEXT NOT NULL,
  bundle JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_archie_snapshots_user_mode_created
  ON public.archie_roadmap_snapshots(user_id, roadmap_mode, created_at DESC);

ALTER TABLE public.archie_roadmap_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "archie_snapshots_select_own"
  ON public.archie_roadmap_snapshots FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "archie_snapshots_insert_own"
  ON public.archie_roadmap_snapshots FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.quiz_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  quiz JSONB NOT NULL,
  grade JSONB,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user_created
  ON public.quiz_sessions(user_id, created_at DESC);

ALTER TABLE public.quiz_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "quiz_sessions_select_own"
  ON public.quiz_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "quiz_sessions_insert_own"
  ON public.quiz_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "quiz_sessions_update_own"
  ON public.quiz_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- >>> 005_user_archie_roadmaps.sql
-- Persisted Archie roadmaps: one row per saved topic (multiple per user). Low-latency reads from DB.

CREATE TABLE IF NOT EXISTS public.user_archie_roadmaps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  direction TEXT NOT NULL,
  display_title TEXT NOT NULL,
  progress_percent INTEGER NOT NULL DEFAULT 0,
  estimated_completion DATE,
  bundles_raw JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_user_archie_roadmaps_user_created
  ON public.user_archie_roadmaps(user_id, created_at DESC);

ALTER TABLE public.user_archie_roadmaps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_archie_roadmaps_select_own"
  ON public.user_archie_roadmaps FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "user_archie_roadmaps_insert_own"
  ON public.user_archie_roadmaps FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_archie_roadmaps_update_own"
  ON public.user_archie_roadmaps FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "user_archie_roadmaps_delete_own"
  ON public.user_archie_roadmaps FOR DELETE
  USING (auth.uid() = user_id);

-- >>> 007_roadmap_kind_split.sql
-- Split Skills vs Job ready roadmaps; optional link from job row to skills topic; interview role hint on skills rows.

ALTER TABLE public.user_archie_roadmaps
  ADD COLUMN IF NOT EXISTS week_gate_progress JSONB NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.user_archie_roadmaps
  ADD COLUMN IF NOT EXISTS roadmap_kind TEXT NOT NULL DEFAULT 'combined';

DO $$
BEGIN
  ALTER TABLE public.user_archie_roadmaps
    ADD CONSTRAINT user_archie_roadmaps_roadmap_kind_check
    CHECK (roadmap_kind IN ('combined', 'skills', 'job_ready'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.user_archie_roadmaps
  ADD COLUMN IF NOT EXISTS recommended_job_title TEXT;

ALTER TABLE public.user_archie_roadmaps
  ADD COLUMN IF NOT EXISTS linked_skills_roadmap_id UUID REFERENCES public.user_archie_roadmaps(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_user_archie_roadmaps_user_kind
  ON public.user_archie_roadmaps(user_id, roadmap_kind, created_at DESC);

COMMENT ON COLUMN public.user_archie_roadmaps.roadmap_kind IS 'combined = legacy all-in-one; skills = teaching path; job_ready = interview prep';
COMMENT ON COLUMN public.user_archie_roadmaps.recommended_job_title IS 'Suggested job title for Job ready (from skills topic)';
COMMENT ON COLUMN public.user_archie_roadmaps.linked_skills_roadmap_id IS 'If set on job_ready row, ties interview prep to a skills roadmap';

-- >>> 006_user_context_events_delete.sql
-- Allow users to delete their own context events (e.g. clear uploaded syllabus PDF)

CREATE POLICY "user_context_events_delete_own"
  ON public.user_context_events FOR DELETE
  USING (auth.uid() = user_id);

-- >>> 20260411000000_mock_interview_sessions.sql
-- Mock interviews: transcript stored server-side; analysis generated on demand.
-- Run in Supabase SQL Editor or via `supabase db push` if CLI is linked.

create table if not exists public.mock_interview_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  target_role text not null,
  transcript text not null,
  analysis_report text,
  vapi_assistant_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists mock_interview_sessions_user_id_created_at_idx
  on public.mock_interview_sessions (user_id, created_at desc);

alter table public.mock_interview_sessions enable row level security;

create policy "mock_interview_sessions_select_own"
  on public.mock_interview_sessions for select
  using (auth.uid() = user_id);

create policy "mock_interview_sessions_insert_own"
  on public.mock_interview_sessions for insert
  with check (auth.uid() = user_id);

create policy "mock_interview_sessions_update_own"
  on public.mock_interview_sessions for update
  using (auth.uid() = user_id);

-- >>> 20260412000000_mock_interview_vapi_structured.sql
-- Vapi web call id (for structured output fetch) + cached structured JSON from GET /call/:id
alter table public.mock_interview_sessions
  add column if not exists vapi_call_id text,
  add column if not exists vapi_structured_output jsonb;

comment on column public.mock_interview_sessions.vapi_call_id is 'Vapi GET /call/{id} id from web SDK (call-start-success)';
comment on column public.mock_interview_sessions.vapi_structured_output is 'Cached artifact.structuredOutputs from Vapi after call completes';

-- >>> 20260412120000_agent_cache.sql
-- Semantic cache for agent responses (coach, etc.). Use Supabase pooler (port 6543) for direct Postgres
-- clients; @supabase/supabase-js uses the HTTP API and is safe for concurrent serverless calls.
--
-- Requires pgvector in the `extensions` schema (Supabase Dashboard → Database → Extensions → vector).

create table if not exists public.agent_cache (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  agent_key text not null,
  input_hash text not null,
  input_preview text,
  embedding extensions.vector(1536),
  response jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists agent_cache_user_agent_hash_idx
  on public.agent_cache (user_id, agent_key, input_hash);

create index if not exists agent_cache_embedding_ivfflat_idx
  on public.agent_cache
  using ivfflat (embedding extensions.vector_cosine_ops)
  with (lists = 10);

alter table public.agent_cache enable row level security;

create policy "agent_cache_select_own"
  on public.agent_cache for select
  using (auth.uid() = user_id);

create policy "agent_cache_insert_own"
  on public.agent_cache for insert
  with check (auth.uid() = user_id);

create policy "agent_cache_delete_own"
  on public.agent_cache for delete
  using (auth.uid() = user_id);

-- Similarity search: cosine distance <=> ; similarity = 1 - distance. Scoped to auth.uid().
create or replace function public.match_agent_cache(
  query_embedding extensions.vector(1536),
  match_agent text,
  match_threshold float,
  match_count int default 1
)
returns table (
  id uuid,
  response jsonb,
  similarity float
)
language sql
stable
security invoker
set search_path = public, extensions
as $$
  select
    c.id,
    c.response,
    (1 - (c.embedding <=> query_embedding))::float as similarity
  from public.agent_cache c
  where c.user_id = auth.uid()
    and c.agent_key = match_agent
    and c.embedding is not null
    and (1 - (c.embedding <=> query_embedding)) >= match_threshold
  order by c.embedding <=> query_embedding
  limit greatest(1, least(match_count, 5));
$$;

grant execute on function public.match_agent_cache(extensions.vector, text, float, int) to authenticated;

-- >>> 20260412140000_roadmap_week_gates.sql
-- Per-roadmap weekly unlock: only week 1 starts accessible; later weeks unlock after >75% on Pip for the prior week.
-- Stored separately from AI bundles so Archie revise does not reset progress.

ALTER TABLE public.user_archie_roadmaps
  ADD COLUMN IF NOT EXISTS week_gate_progress JSONB NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.user_archie_roadmaps.week_gate_progress IS
  'JSON: { "skills": { "last_passed_week": 0 }, "job_ready": { "last_passed_week": 0 } }. Week 1 active when last_passed_week is 0.';

-- >>> 20260412150000_gamification_activity.sql
-- Login calendar (distinct days) for streak + XP.
-- Optional: leaderboard_by_* RPCs below — the app prefers SUPABASE_SERVICE_ROLE_KEY + direct profiles queries (no PostgREST schema cache for RPCs).

CREATE TABLE IF NOT EXISTS public.user_login_days (
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  login_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (user_id, login_date)
);

CREATE INDEX IF NOT EXISTS idx_user_login_days_user ON public.user_login_days(user_id);

ALTER TABLE public.user_login_days ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_login_days_insert_own" ON public.user_login_days;
CREATE POLICY "user_login_days_insert_own"
  ON public.user_login_days FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_login_days_select_own" ON public.user_login_days;
CREATE POLICY "user_login_days_select_own"
  ON public.user_login_days FOR SELECT
  USING (auth.uid() = user_id);

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS last_login_date DATE;

COMMENT ON COLUMN public.profiles.last_login_date IS 'UTC calendar date of last daily activity ping (streak bump).';

-- Leaderboard: expose only gamification fields (no email) to authenticated users.
CREATE OR REPLACE FUNCTION public.leaderboard_by_xp(limit_count int)
RETURNS TABLE (
  id uuid,
  full_name text,
  avatar_url text,
  xp integer,
  level integer,
  streak integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.full_name, p.avatar_url, p.xp, p.level, p.streak
  FROM public.profiles p
  ORDER BY p.xp DESC NULLS LAST, p.id ASC
  LIMIT GREATEST(1, LEAST(COALESCE(limit_count, 10), 100));
$$;

CREATE OR REPLACE FUNCTION public.leaderboard_by_streak(limit_count int)
RETURNS TABLE (
  id uuid,
  full_name text,
  avatar_url text,
  xp integer,
  level integer,
  streak integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.full_name, p.avatar_url, p.xp, p.level, p.streak
  FROM public.profiles p
  ORDER BY p.streak DESC NULLS LAST, p.xp DESC NULLS LAST, p.id ASC
  LIMIT GREATEST(1, LEAST(COALESCE(limit_count, 10), 100));
$$;

CREATE OR REPLACE FUNCTION public.leaderboard_by_level(limit_count int)
RETURNS TABLE (
  id uuid,
  full_name text,
  avatar_url text,
  xp integer,
  level integer,
  streak integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.full_name, p.avatar_url, p.xp, p.level, p.streak
  FROM public.profiles p
  ORDER BY p.level DESC NULLS LAST, p.xp DESC NULLS LAST, p.id ASC
  LIMIT GREATEST(1, LEAST(COALESCE(limit_count, 10), 100));
$$;

GRANT EXECUTE ON FUNCTION public.leaderboard_by_xp(int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.leaderboard_by_streak(int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.leaderboard_by_level(int) TO authenticated;

-- >>> 20260413000000_dynamic_roadmap_assessments.sql
-- Dynamic Roadmap Assessment & Performance Tracking
-- Includes quiz questions, coding tests, debugging tests, and roadmap adjustments

-- Assessment Types: 'quiz', 'coding_test', 'debugging_test'
-- Difficulty: 'easy', 'medium', 'hard'

CREATE TABLE IF NOT EXISTS public.roadmap_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  roadmap_id UUID NOT NULL REFERENCES public.user_archie_roadmaps(id) ON DELETE CASCADE,
  module_ids TEXT[] NOT NULL, -- Array of module IDs this assessment covers
  assessment_type TEXT NOT NULL CHECK (assessment_type IN ('quiz', 'coding_test', 'debugging_test')),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  title TEXT NOT NULL,
  description TEXT,
  skills_tested TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  estimated_time_minutes INTEGER DEFAULT 15,
  status TEXT DEFAULT 'ready' CHECK (status IN ('ready', 'in_progress', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.assessment_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id UUID NOT NULL REFERENCES public.roadmap_assessments(id) ON DELETE CASCADE,
  question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'coding', 'debugging')),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  skill TEXT NOT NULL, -- Skill being tested
  question_text TEXT NOT NULL,
  
  -- For multiple choice
  options JSONB, -- Array of {text, is_correct}
  correct_answer_index INTEGER,
  explanation TEXT,
  
  -- For coding/debugging tests
  starter_code TEXT,
  expected_output TEXT,
  test_cases JSONB, -- Array of {input, expected_output}
  rubric JSONB, -- Scoring criteria
  
  sequence_number INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.assessment_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id UUID NOT NULL REFERENCES public.roadmap_assessments(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.assessment_questions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Response content
  user_answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  points_earned DECIMAL(5,2) DEFAULT 0,
  max_points DECIMAL(5,2) DEFAULT 10,
  
  -- For coding tests: execution result
  execution_output TEXT,
  execution_error TEXT,
  passed_test_cases INTEGER,
  total_test_cases INTEGER,
  
  -- Timing
  time_spent_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.assessment_performance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  roadmap_id UUID NOT NULL REFERENCES public.user_archie_roadmaps(id) ON DELETE CASCADE,
  
  assessment_id UUID NOT NULL REFERENCES public.roadmap_assessments(id) ON DELETE CASCADE,
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL DEFAULT 0,
  score DECIMAL(5,2) NOT NULL, -- Percentage 0-100
  performance_level TEXT DEFAULT 'beginner' CHECK (performance_level IN ('beginner', 'developing', 'proficient', 'expert')),
  
  -- XP tracking
  xp_earned INTEGER DEFAULT 0,
  penalty_points INTEGER DEFAULT 0, -- Penalty for easy questions failed
  
  -- Failed topics for deep dive
  failed_skills TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  failed_questions JSONB, -- Array of {question_id, skill, difficulty}
  
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.roadmap_dynamic_adjustments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  roadmap_id UUID NOT NULL REFERENCES public.user_archie_roadmaps(id) ON DELETE CASCADE,
  
  trigger_assessment_id UUID REFERENCES public.roadmap_assessments(id) ON DELETE SET NULL,
  trigger_skill TEXT NOT NULL, -- Skill that user failed
  trigger_difficulty TEXT CHECK (trigger_difficulty IN ('easy', 'medium', 'hard')),
  
  adjustment_type TEXT NOT NULL CHECK (adjustment_type IN ('deep_dive_module', 'remedial_content', 'additional_practice')),
  adjustment_content JSONB NOT NULL, -- {module_title, content, duration, resources}
  
  inserted_at_position INTEGER, -- Position in roadmap where inserted
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Track user's skill proficiency across all assessments
CREATE TABLE IF NOT EXISTS public.skill_proficiency_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  skill TEXT NOT NULL,
  
  -- Proficiency metrics
  times_tested INTEGER DEFAULT 0,
  times_correct INTEGER DEFAULT 0,
  avg_score DECIMAL(5,2),
  mastery_level TEXT DEFAULT 'novice' CHECK (mastery_level IN ('novice', 'beginner', 'developing', 'proficient', 'expert')),
  
  -- Last assessment
  last_assessed TIMESTAMPTZ,
  last_score DECIMAL(5,2),
  
  source_roadmap_id UUID REFERENCES public.user_archie_roadmaps(id) ON DELETE SET NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, skill)
);

-- Module completion with skill tracking
CREATE TABLE IF NOT EXISTS public.module_completion_track (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  roadmap_id UUID NOT NULL REFERENCES public.user_archie_roadmaps(id) ON DELETE CASCADE,
  module_id TEXT NOT NULL,
  
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'skipped')),
  completed_at TIMESTAMPTZ,
  time_spent_minutes INTEGER,
  skills_acquired TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, roadmap_id, module_id)
);

-- Enable RLS
ALTER TABLE public.roadmap_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_dynamic_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_proficiency_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_completion_track ENABLE ROW LEVEL SECURITY;

-- RLS Policies for roadmap_assessments
CREATE POLICY "roadmap_assessments_select_own_roadmap" ON public.roadmap_assessments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.user_archie_roadmaps
    WHERE id = roadmap_id AND user_id = auth.uid()
  ));

CREATE POLICY "roadmap_assessments_insert_own_roadmap" ON public.roadmap_assessments FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.user_archie_roadmaps
    WHERE id = roadmap_id AND user_id = auth.uid()
  ));

-- RLS Policies for assessment_questions
CREATE POLICY "assessment_questions_select" ON public.assessment_questions FOR SELECT USING (TRUE);

-- RLS Policies for assessment_responses
CREATE POLICY "assessment_responses_select_own" ON public.assessment_responses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "assessment_responses_insert_own" ON public.assessment_responses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "assessment_responses_update_own" ON public.assessment_responses FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for assessment_performance
CREATE POLICY "assessment_performance_select_own" ON public.assessment_performance FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "assessment_performance_insert_own" ON public.assessment_performance FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "assessment_performance_update_own" ON public.assessment_performance FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for roadmap_dynamic_adjustments
CREATE POLICY "roadmap_dynamic_adjustments_select_own" ON public.roadmap_dynamic_adjustments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "roadmap_dynamic_adjustments_insert_own" ON public.roadmap_dynamic_adjustments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for skill_proficiency_tracking
CREATE POLICY "skill_proficiency_tracking_select_own" ON public.skill_proficiency_tracking FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "skill_proficiency_tracking_insert_own" ON public.skill_proficiency_tracking FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "skill_proficiency_tracking_update_own" ON public.skill_proficiency_tracking FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for module_completion_track
CREATE POLICY "module_completion_track_select_own" ON public.module_completion_track FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "module_completion_track_insert_own" ON public.module_completion_track FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "module_completion_track_update_own" ON public.module_completion_track FOR UPDATE
  USING (auth.uid() = user_id);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_roadmap_assessments_roadmap_id ON public.roadmap_assessments(roadmap_id);
CREATE INDEX IF NOT EXISTS idx_assessment_questions_assessment_id ON public.assessment_questions(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_questions_skill ON public.assessment_questions(skill);
CREATE INDEX IF NOT EXISTS idx_assessment_responses_user_id ON public.assessment_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_assessment_responses_assessment_id ON public.assessment_responses(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_responses_question_id ON public.assessment_responses(question_id);
CREATE INDEX IF NOT EXISTS idx_assessment_performance_user_id ON public.assessment_performance(user_id);
CREATE INDEX IF NOT EXISTS idx_assessment_performance_roadmap_id ON public.assessment_performance(roadmap_id);
CREATE INDEX IF NOT EXISTS idx_assessment_performance_failed_skills ON public.assessment_performance USING GIN(failed_skills);
CREATE INDEX IF NOT EXISTS idx_roadmap_dynamic_adjustments_user_id ON public.roadmap_dynamic_adjustments(user_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_dynamic_adjustments_roadmap_id ON public.roadmap_dynamic_adjustments(roadmap_id);
CREATE INDEX IF NOT EXISTS idx_skill_proficiency_tracking_user_id ON public.skill_proficiency_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_skill_proficiency_tracking_skill ON public.skill_proficiency_tracking(skill);
CREATE INDEX IF NOT EXISTS idx_module_completion_track_user_id ON public.module_completion_track(user_id);
CREATE INDEX IF NOT EXISTS idx_module_completion_track_roadmap_id ON public.module_completion_track(roadmap_id);

-- >>> 20260413100000_skills_source_roadmap.sql
-- Allow marking skills acquired from roadmap module completion

ALTER TABLE public.skills DROP CONSTRAINT IF EXISTS skills_source_check;
ALTER TABLE public.skills
  ADD CONSTRAINT skills_source_check CHECK (
    source IN ('manual', 'linkedin', 'resume', 'ai_extracted', 'roadmap')
  );

-- >>> 20260414120000_profile_twilio_engagement.sql
-- Opt-in flags + idempotency timestamps for Twilio WhatsApp daily digest and inactivity voice calls.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS notify_whatsapp_digest BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_voice_reengagement BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS last_whatsapp_digest_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_inactivity_call_at TIMESTAMPTZ;

COMMENT ON COLUMN public.profiles.notify_whatsapp_digest IS 'Receive daily WhatsApp summary of learning activity (backend cron).';
COMMENT ON COLUMN public.profiles.notify_voice_reengagement IS 'Allow voice call when inactive 3+ days (backend cron).';
COMMENT ON COLUMN public.profiles.last_whatsapp_digest_at IS 'Last time a daily digest was sent (dedupe).';
COMMENT ON COLUMN public.profiles.last_inactivity_call_at IS 'Last inactivity re-engagement call (cooldown).';

-- >>> 20260414190000_profile_quiz_notification_email.sql
-- Optional override for Pip checkpoint / quiz result emails (falls back to auth email when null).
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS quiz_notification_email TEXT;

COMMENT ON COLUMN public.profiles.quiz_notification_email IS 'If set, quiz result emails go here; otherwise use auth user email.';

-- >>> 20260415120000_sparky_engagement_channels.sql
-- Sparky engagement: streak email/WhatsApp, optional daily voice digest, inactivity WhatsApp.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS notify_email_streak_reminders BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_whatsapp_streak BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_voice_daily_learning BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS notify_whatsapp_inactivity BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS last_streak_reminder_email_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_streak_reminder_whatsapp_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_voice_daily_digest_at TIMESTAMPTZ;

COMMENT ON COLUMN public.profiles.notify_email_streak_reminders IS 'Sparky streak-at-risk emails (Resend; backend cron).';
COMMENT ON COLUMN public.profiles.notify_whatsapp_streak IS 'WhatsApp streak nudges when UTC day not yet logged (Twilio).';
COMMENT ON COLUMN public.profiles.notify_voice_daily_learning IS 'Opt-in: voice call with same daily learning recap as WhatsApp digest.';
COMMENT ON COLUMN public.profiles.notify_whatsapp_inactivity IS 'Short WhatsApp nudge alongside inactivity voice call.';
COMMENT ON COLUMN public.profiles.last_streak_reminder_email_at IS 'Dedupe streak emails (at most once per UTC day).';
COMMENT ON COLUMN public.profiles.last_streak_reminder_whatsapp_at IS 'Dedupe streak WhatsApp (at most once per UTC day).';
COMMENT ON COLUMN public.profiles.last_voice_daily_digest_at IS 'Last voice recap tied to daily digest (cooldown with digest).';

-- >>> 20260415140000_sparky_digest_schedule.sql
-- User-chosen local time + IANA timezone for daily learning digest (WhatsApp / voice). Triggered when user opens the app after this time.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS sparky_digest_local_time TEXT NOT NULL DEFAULT '18:00',
  ADD COLUMN IF NOT EXISTS sparky_digest_timezone TEXT NOT NULL DEFAULT 'UTC';

COMMENT ON COLUMN public.profiles.sparky_digest_local_time IS 'HH:MM (24h) in sparky_digest_timezone — digest sends after this time when user visits the app.';
COMMENT ON COLUMN public.profiles.sparky_digest_timezone IS 'IANA zone id (e.g. Asia/Kolkata).';

COMMENT ON COLUMN public.profiles.notify_whatsapp_digest IS 'WhatsApp daily learning recap (after scheduled local time; Twilio).';
COMMENT ON COLUMN public.profiles.notify_voice_daily_learning IS 'Optional voice call with same recap; requires phone + TWILIO_VOICE_FROM.';


-- >>> 20260416120000_roadmap_capstone_unlock.sql
-- Capstone project: spend 300 XP once to unlock (per roadmap), at end of track (UI).

ALTER TABLE public.user_archie_roadmaps
  ADD COLUMN IF NOT EXISTS capstone_unlocked_at TIMESTAMPTZ NULL;

COMMENT ON COLUMN public.user_archie_roadmaps.capstone_unlocked_at IS
  'When set, user spent 300 XP to unlock the end-of-course capstone for this roadmap.';

-- Atomic unlock: deduct XP, recompute level, set flag. Matches JS levelFromXp (500 XP per level tier).
CREATE OR REPLACE FUNCTION public.unlock_roadmap_capstone(p_roadmap_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_xp int;
  v_new_xp int;
  v_level int;
  v_unlocked timestamptz;
  v_cost int := 300;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  SELECT capstone_unlocked_at INTO v_unlocked
  FROM public.user_archie_roadmaps
  WHERE id = p_roadmap_id AND user_id = v_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'roadmap_not_found';
  END IF;

  IF v_unlocked IS NOT NULL THEN
    RETURN jsonb_build_object('ok', true, 'already_unlocked', true);
  END IF;

  SELECT COALESCE(xp, 0) INTO v_xp FROM public.profiles WHERE id = v_user_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'profile_not_found';
  END IF;

  IF v_xp < v_cost THEN
    RAISE EXCEPTION 'insufficient_xp';
  END IF;

  v_new_xp := v_xp - v_cost;
  v_level := GREATEST(1, 1 + FLOOR(GREATEST(0, v_new_xp)::numeric / 500)::int);

  UPDATE public.profiles
  SET xp = v_new_xp, level = v_level, updated_at = now()
  WHERE id = v_user_id;

  UPDATE public.user_archie_roadmaps
  SET capstone_unlocked_at = now(), updated_at = now()
  WHERE id = p_roadmap_id AND user_id = v_user_id;

  RETURN jsonb_build_object(
    'ok', true,
    'already_unlocked', false,
    'xp', v_new_xp,
    'level', v_level,
    'xp_spent', v_cost
  );
END;
$$;

REVOKE ALL ON FUNCTION public.unlock_roadmap_capstone(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.unlock_roadmap_capstone(uuid) TO authenticated;

-- >>> 20260416180000_whatsapp_login_checkpoint_milestone.sql
-- WhatsApp opt-in for login welcome, Pip checkpoint scores, and milestone (node) progress nudges.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS notify_whatsapp_login BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_whatsapp_checkpoint BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_whatsapp_milestone BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS last_whatsapp_login_at TIMESTAMPTZ;

COMMENT ON COLUMN public.profiles.notify_whatsapp_login IS 'WhatsApp welcome after dashboard session (deduped; Twilio).';
COMMENT ON COLUMN public.profiles.notify_whatsapp_checkpoint IS 'WhatsApp after Pip weekly checkpoint score (Twilio).';
COMMENT ON COLUMN public.profiles.notify_whatsapp_milestone IS 'WhatsApp when a roadmap milestone node is newly completed via modules (Twilio).';
COMMENT ON COLUMN public.profiles.last_whatsapp_login_at IS 'Last login-welcome WhatsApp sent (dedupe by UTC day in app).';

-- Dedupe Pip checkpoint WhatsApp per user + roadmap + milestone (retry-safe).
CREATE TABLE IF NOT EXISTS public.whatsapp_pip_checkpoint_sent (
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  roadmap_id UUID NOT NULL,
  milestone_id TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, roadmap_id, milestone_id)
);

ALTER TABLE public.whatsapp_pip_checkpoint_sent ENABLE ROW LEVEL SECURITY;

-- No policies: clients cannot access; backend uses service role (bypasses RLS).

-- >>> 20260512110000_roadmap_generation_jobs.sql
-- Async roadmap generation queue (producer: FastAPI, consumer: AWS worker).

CREATE TABLE IF NOT EXISTS public.roadmap_generation_jobs (
  job_id UUID PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  context JSONB NOT NULL DEFAULT '{}',
  user_id UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  error_message TEXT,
  result_bundle JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.roadmap_generation_jobs IS
  'Archie roadmap generator jobs enqueued via SQS; backend service_role writes, worker completes.';

CREATE INDEX IF NOT EXISTS idx_roadmap_generation_jobs_status_created
  ON public.roadmap_generation_jobs (status, created_at DESC);

ALTER TABLE public.roadmap_generation_jobs ENABLE ROW LEVEL SECURITY;

-- >>> 20260609120000_job_ready_portal_payments.sql
-- Job Ready portal one-time unlock via Razorpay Standard Checkout

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS job_ready_portal_unlocked_at TIMESTAMPTZ;

COMMENT ON COLUMN public.profiles.job_ready_portal_unlocked_at IS
  'Set when user completes Razorpay payment for the Job Ready portal (company research, mock interview, job listings).';

CREATE TABLE IF NOT EXISTS public.razorpay_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  razorpay_order_id TEXT NOT NULL UNIQUE,
  amount_paise INTEGER NOT NULL CHECK (amount_paise >= 100),
  currency TEXT NOT NULL DEFAULT 'INR',
  receipt TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'paid', 'failed')),
  razorpay_payment_id TEXT,
  product TEXT NOT NULL DEFAULT 'job_ready_portal',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS razorpay_orders_user_id_idx ON public.razorpay_orders(user_id);
CREATE INDEX IF NOT EXISTS razorpay_orders_status_idx ON public.razorpay_orders(status);

ALTER TABLE public.razorpay_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY razorpay_orders_select_own ON public.razorpay_orders
  FOR SELECT
  USING (auth.uid() = user_id);

-- >>> 006_skills_source_roadmap.sql
-- Mirror of supabase/migrations/20260413100000_skills_source_roadmap.sql
ALTER TABLE public.skills DROP CONSTRAINT IF EXISTS skills_source_check;
ALTER TABLE public.skills
  ADD CONSTRAINT skills_source_check CHECK (
    source IN ('manual', 'linkedin', 'resume', 'ai_extracted', 'roadmap')
  );

-- =============================================================================
-- End of bootstrap
-- =============================================================================
