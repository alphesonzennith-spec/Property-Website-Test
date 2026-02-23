export enum LearningCategory {
  Buying = 'Buying',
  Selling = 'Selling',
  Renting = 'Renting',
  Financing = 'Financing',
  LegalTax = 'LegalTax',
  HomeImprovements = 'HomeImprovements',
  Insights = 'Insights',
  HomeJourney = 'HomeJourney',
  DIY = 'DIY',
  FengShui = 'FengShui',
}

export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface LearningModule {
  id: string;
  title: string;
  category: LearningCategory;
  difficulty: DifficultyLevel;
  /** Estimated reading / viewing time in minutes */
  estimatedMinutes: number;
  hasVideoExplainer: boolean;
  /** True if the module includes an AI-generated voiceover narration */
  hasAIVoiceover: boolean;
  hasQuiz: boolean;
  /** Number of users who have completed this module */
  completionCount: number;
  /** Short summary shown on module listing cards */
  summary: string;
  /** URL slug used for page routing */
  slug: string;
  /** ISO 8601 date the module was published */
  publishedAt: string;
  updatedAt: string;
  /** IDs of modules that should be completed before this one */
  prerequisites: string[];
}

export interface QuizAttempt {
  moduleId: string;
  score: number;
  /** Maximum achievable score for this quiz */
  maxScore: number;
  attemptedAt: Date;
  passed: boolean;
}

export interface UserLearningProgress {
  userId: string;
  /** IDs of modules the user has fully completed */
  completedModuleIds: string[];
  /** IDs of modules the user has started but not yet completed */
  inProgressModuleIds: string[];
  /** IDs of modules bookmarked by the user for later */
  bookmarkedModuleIds: string[];
  quizAttempts: QuizAttempt[];
  /** Cumulative minutes of learning content the user has consumed */
  totalMinutesLearned: number;
  /** Active learning streak in consecutive days */
  currentStreakDays: number;
  lastActivityAt: Date;
}
