import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  User,
  LearningPlan,
  LearningPhase,
  DashboardStats,
  OnboardingAnswers,
  SkillLevel,
} from '@/types';
import { AIProvider } from '@/lib/ai-provider';

interface AppState {
  // 認証
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;

  // オンボーディング
  onboardingAnswers: Partial<OnboardingAnswers>;
  onboardingStep: number;
  setOnboardingAnswers: (answers: Partial<OnboardingAnswers>) => void;
  setOnboardingStep: (step: number) => void;

  // 学習プラン
  currentPlan: LearningPlan | null;
  currentPhase: LearningPhase | null;
  setCurrentPlan: (plan: LearningPlan | null) => void;
  setCurrentPhase: (phase: LearningPhase | null) => void;

  // ダッシュボード
  dashboardStats: DashboardStats | null;
  setDashboardStats: (stats: DashboardStats | null) => void;

  // UI状態
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  currentLessonId: string | null;
  setCurrentLessonId: (id: string | null) => void;

  // AIプロバイダー設定
  aiProvider: AIProvider;
  aiApiKey: string;
  setAIProvider: (provider: AIProvider) => void;
  setAIApiKey: (key: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // 認証
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),

      // オンボーディング
      onboardingAnswers: {},
      onboardingStep: 0,
      setOnboardingAnswers: (answers) =>
        set((state) => ({
          onboardingAnswers: { ...state.onboardingAnswers, ...answers },
        })),
      setOnboardingStep: (step) => set({ onboardingStep: step }),

      // 学習プラン
      currentPlan: null,
      currentPhase: null,
      setCurrentPlan: (plan) => set({ currentPlan: plan }),
      setCurrentPhase: (phase) => set({ currentPhase: phase }),

      // ダッシュボード
      dashboardStats: null,
      setDashboardStats: (stats) => set({ dashboardStats: stats }),

      // UI状態
      sidebarOpen: true,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      currentLessonId: null,
      setCurrentLessonId: (id) => set({ currentLessonId: id }),

      // AIプロバイダー設定
      aiProvider: 'anthropic',
      aiApiKey: '',
      setAIProvider: (provider) => set({ aiProvider: provider }),
      setAIApiKey: (key) => set({ aiApiKey: key }),
    }),
    {
      name: 'pyreview-dojo-store',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        onboardingAnswers: state.onboardingAnswers,
        onboardingStep: state.onboardingStep,
        aiProvider: state.aiProvider,
        aiApiKey: state.aiApiKey,
      }),
    }
  )
);
