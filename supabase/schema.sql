-- PyReview Dojo - Supabase Database Schema

-- Users テーブル (auth.usersを拡張)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  initial_level SMALLINT NOT NULL DEFAULT 0 CHECK (initial_level BETWEEN 0 AND 5),
  current_level SMALLINT NOT NULL DEFAULT 0 CHECK (current_level BETWEEN 0 AND 5),
  target_level SMALLINT NOT NULL DEFAULT 5 CHECK (target_level BETWEEN 0 AND 5),
  notion_token TEXT,
  google_token TEXT,
  notion_database_id TEXT,
  google_calendar_id TEXT,
  onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 学習プランテーブル
CREATE TABLE IF NOT EXISTS public.learning_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_weeks INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 学習フェーズテーブル
CREATE TABLE IF NOT EXISTS public.learning_phases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES public.learning_plans(id) ON DELETE CASCADE NOT NULL,
  phase_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  weeks INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  target_level SMALLINT NOT NULL CHECK (target_level BETWEEN 0 AND 5),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- マイルストーンテーブル
CREATE TABLE IF NOT EXISTS public.milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phase_id UUID REFERENCES public.learning_phases(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  completed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  certificate_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- レッスンテーブル
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phase_id UUID REFERENCES public.learning_phases(id) ON DELETE CASCADE NOT NULL,
  lesson_order INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content JSONB NOT NULL DEFAULT '{}',
  lesson_type TEXT NOT NULL CHECK (lesson_type IN ('theory', 'exercise', 'review')),
  estimated_minutes INTEGER NOT NULL DEFAULT 30,
  difficulty SMALLINT NOT NULL DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 5),
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 演習テーブル
CREATE TABLE IF NOT EXISTS public.exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  exercise_order INTEGER NOT NULL DEFAULT 1,
  title TEXT NOT NULL,
  description TEXT,
  exercise_type TEXT NOT NULL CHECK (exercise_type IN ('coding', 'review', 'quiz', 'multiple_choice')),
  prompt TEXT NOT NULL,
  starter_code TEXT,
  expected_output TEXT,
  hints TEXT[] NOT NULL DEFAULT '{}',
  solution TEXT,
  review_criteria JSONB,
  choices JSONB,
  correct_answer TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 進捗テーブル
CREATE TABLE IF NOT EXISTS public.progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  exercise_id UUID REFERENCES public.exercises(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'started' CHECK (status IN ('started', 'completed', 'skipped')),
  score INTEGER CHECK (score BETWEEN 0 AND 100),
  time_spent_minutes INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, lesson_id, exercise_id)
);

-- 提出物テーブル
CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  progress_id UUID REFERENCES public.progress(id) ON DELETE CASCADE NOT NULL,
  code TEXT,
  answer TEXT,
  review_comment TEXT,
  ai_feedback JSONB,
  score INTEGER CHECK (score BETWEEN 0 AND 100),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 証明書テーブル
CREATE TABLE IF NOT EXISTS public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  milestone_id UUID REFERENCES public.milestones(id) ON DELETE SET NULL,
  level SMALLINT NOT NULL CHECK (level BETWEEN 0 AND 5),
  title TEXT NOT NULL,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  verification_code TEXT UNIQUE NOT NULL,
  qr_code_url TEXT,
  pdf_url TEXT
);

-- アクティビティログテーブル
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'lesson_completed', 'exercise_submitted', 'milestone_achieved', 'level_up', 'certificate_issued'
  )),
  title TEXT NOT NULL,
  description TEXT,
  points INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS (Row Level Security) ポリシー
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- profiles ポリシー
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- learning_plans ポリシー
CREATE POLICY "Users can manage own learning plans" ON public.learning_plans
  FOR ALL USING (auth.uid() = user_id);

-- learning_phases ポリシー
CREATE POLICY "Users can view own phases" ON public.learning_phases
  FOR SELECT USING (
    plan_id IN (SELECT id FROM public.learning_plans WHERE user_id = auth.uid())
  );

-- milestones ポリシー
CREATE POLICY "Users can view own milestones" ON public.milestones
  FOR SELECT USING (
    phase_id IN (
      SELECT lp.id FROM public.learning_phases lp
      JOIN public.learning_plans lpl ON lp.plan_id = lpl.id
      WHERE lpl.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can update own milestones" ON public.milestones
  FOR UPDATE USING (
    phase_id IN (
      SELECT lp.id FROM public.learning_phases lp
      JOIN public.learning_plans lpl ON lp.plan_id = lpl.id
      WHERE lpl.user_id = auth.uid()
    )
  );

-- lessons ポリシー (全ユーザーが参照可能)
CREATE POLICY "All users can view lessons" ON public.lessons
  FOR SELECT USING (TRUE);

-- exercises ポリシー
CREATE POLICY "All users can view exercises" ON public.exercises
  FOR SELECT USING (TRUE);

-- progress ポリシー
CREATE POLICY "Users can manage own progress" ON public.progress
  FOR ALL USING (auth.uid() = user_id);

-- submissions ポリシー
CREATE POLICY "Users can manage own submissions" ON public.submissions
  FOR ALL USING (
    progress_id IN (SELECT id FROM public.progress WHERE user_id = auth.uid())
  );

-- certificates ポリシー
CREATE POLICY "Users can view own certificates" ON public.certificates
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Certificates are publicly verifiable" ON public.certificates
  FOR SELECT USING (TRUE);

-- activity_logs ポリシー
CREATE POLICY "Users can view own activity" ON public.activity_logs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own activity" ON public.activity_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- トリガー: updated_at 自動更新
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_plans_updated_at
  BEFORE UPDATE ON public.learning_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- トリガー: 新規ユーザー登録時にprofileを自動作成
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'user_name',
      NEW.email
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture',
      NEW.raw_user_meta_data->>'profile_image_url'
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
