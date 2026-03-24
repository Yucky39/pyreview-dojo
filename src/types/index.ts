// ===== ユーザー・スキルレベル =====

export type SkillLevel = 0 | 1 | 2 | 3 | 4 | 5;

export const SKILL_LEVEL_LABELS: Record<SkillLevel, string> = {
  0: '完全初学者',
  1: '他言語経験者',
  2: 'Python入門',
  3: 'Python基礎',
  4: 'Python中級',
  5: 'Pythonコードレビュー',
};

export const SKILL_LEVEL_DESCRIPTIONS: Record<SkillLevel, string> = {
  0: 'プログラミング未経験。変数や関数の概念から学びます',
  1: '他言語でのプログラミング経験あり。Pythonの特徴を速習します',
  2: 'Pythonで簡単なスクリプトが書ける。文法の理解を深めます',
  3: 'Pythonの基本文法を理解。実践的な開発手法を学びます',
  4: 'Pythonでアプリ開発が可能。高品質なコードの書き方を習得します',
  5: 'コードレビューができるレベル。他者のコードを適切に評価・改善できます',
};

// ===== ユーザー =====

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  initial_level: SkillLevel;
  current_level: SkillLevel;
  target_level: SkillLevel;
  created_at: string;
  updated_at: string;
  notion_token?: string;
  google_token?: string;
  notion_database_id?: string;
  google_calendar_id?: string;
}

// ===== 学習プラン =====

export interface LearningPlan {
  id: string;
  user_id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  total_weeks: number;
  status: 'active' | 'completed' | 'paused';
  phases: LearningPhase[];
  created_at: string;
}

export interface LearningPhase {
  id: string;
  plan_id: string;
  phase_number: number;
  title: string;
  description: string;
  weeks: number;
  start_date: string;
  end_date: string;
  target_level: SkillLevel;
  milestones: Milestone[];
  lessons: Lesson[];
  status: 'pending' | 'active' | 'completed';
}

export interface Milestone {
  id: string;
  phase_id: string;
  title: string;
  description: string;
  due_date: string;
  completed_at?: string;
  status: 'pending' | 'completed';
  certificate_id?: string;
}

// ===== レッスン・演習 =====

export interface Lesson {
  id: string;
  phase_id: string;
  order: number;
  title: string;
  description: string;
  content: string;
  lesson_type: 'theory' | 'exercise' | 'review';
  estimated_minutes: number;
  difficulty: 1 | 2 | 3 | 4 | 5;
  tags: string[];
  exercises: Exercise[];
  status?: 'locked' | 'available' | 'completed';
  completed_at?: string;
}

export interface Exercise {
  id: string;
  lesson_id: string;
  title: string;
  description: string;
  type: 'coding' | 'review' | 'quiz' | 'multiple_choice';
  prompt: string;
  starter_code?: string;
  expected_output?: string;
  hints: string[];
  solution?: string;
  review_criteria?: ReviewCriteria[];
  choices?: QuizChoice[];
  correct_answer?: string;
}

export interface ReviewCriteria {
  id: string;
  category: 'readability' | 'performance' | 'security' | 'pythonic' | 'correctness';
  description: string;
  weight: number;
}

export interface QuizChoice {
  id: string;
  text: string;
  is_correct: boolean;
  explanation?: string;
}

// ===== 進捗 =====

export interface Progress {
  id: string;
  user_id: string;
  lesson_id: string;
  exercise_id?: string;
  status: 'started' | 'completed' | 'skipped';
  score?: number;
  time_spent_minutes: number;
  submissions: Submission[];
  completed_at?: string;
  created_at: string;
}

export interface Submission {
  id: string;
  progress_id: string;
  code?: string;
  answer?: string;
  review_comment?: string;
  ai_feedback?: AIFeedback;
  score?: number;
  submitted_at: string;
}

export interface AIFeedback {
  overall_score: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  detailed_comments: DetailedComment[];
  next_steps: string[];
}

export interface DetailedComment {
  line?: number;
  category: string;
  severity: 'info' | 'warning' | 'error';
  message: string;
  suggestion?: string;
}

// ===== 証明書 =====

export interface Certificate {
  id: string;
  user_id: string;
  milestone_id: string | null;
  level: SkillLevel;
  title: string;
  issued_at: string;
  verification_code: string;
  qr_code_url?: string;
  pdf_url?: string;
}

// ===== 連携設定 =====

export interface IntegrationStatus {
  notion: boolean;
  google: boolean;
  notion_database_id?: string;
  google_calendar_id?: string;
}

// ===== オンボーディング =====

export type ProgrammingLanguage =
  | 'none'
  | 'javascript'
  | 'typescript'
  | 'java'
  | 'csharp'
  | 'cpp'
  | 'ruby'
  | 'go'
  | 'rust'
  | 'php'
  | 'other';

export interface OnboardingAnswers {
  has_programming_experience: boolean;
  programming_languages: ProgrammingLanguage[];
  python_experience: 'zero' | 'none' | 'beginner' | 'intermediate' | 'advanced';
  learning_goal: 'career' | 'personal' | 'work' | 'review_skill';
  available_hours_per_week: number;
  preferred_learning_style: 'visual' | 'hands_on' | 'reading' | 'mixed';
  target_completion_weeks?: number;
}

// ===== ダッシュボード統計 =====

export interface DashboardStats {
  current_level: SkillLevel;
  completion_percentage: number;
  completed_lessons: number;
  total_lessons: number;
  completed_milestones: number;
  total_milestones: number;
  current_streak_days: number;
  total_study_hours: number;
  certificates_earned: number;
  next_milestone?: Milestone;
  recent_activity: ActivityLog[];
}

export interface ActivityLog {
  id: string;
  user_id: string;
  activity_type: 'lesson_completed' | 'exercise_submitted' | 'milestone_achieved' | 'level_up' | 'certificate_issued';
  title: string;
  description: string;
  points?: number;
  created_at: string;
}
