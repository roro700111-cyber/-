export interface WordItem {
  id: string;
  english: string;
  arabic: string;
  phonetic: string;
  category: string;
  emoji: string;
  exampleSentence?: string;
  arabicSentence?: string;
  customAudioUrl?: string;
}


export interface GamePack {
  id: string;
  title: string;
  titleArabic: string;
  description: string;
  category: 'animals' | 'food' | 'colors' | 'school' | 'phonics' | 'custom';
  icon: string;
  color: string;
  words: WordItem[];
  isCustom?: boolean;
}

export type GameMode = 'cards' | 'spelling' | 'memory' | 'listening';

export interface VideoCheckpoint {
  id: string;
  timeSeconds: number;
  type: 'pronounce' | 'quiz' | 'listen-repeat';
  promptArabic: string;
  promptEnglish: string;
  targetWord?: string;
  options?: {
    id: string;
    text: string;
    isCorrect: boolean;
    emoji?: string;
  }[];
  points: number;
}

export interface InteractiveVideo {
  id: string;
  title: string;
  titleArabic: string;
  description: string;
  durationSeconds: number;
  theme: 'safari' | 'phonics' | 'space' | 'daily';
  thumbnailUrl: string;
  videoUrl?: string;
  ageGroup: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'مبتدئ' | 'متوسط' | 'متقدم';
  accentColor: string;
  checkpoints: VideoCheckpoint[];
  isCustom?: boolean;
}

export interface StudentProfile {
  name: string;
  avatar: string;
  studentPhoto?: string;
  stars: number;
  xp: number;
  streakDays: number;
  unlockedStickers: string[];
  completedVideos: string[];
  gamesPlayed: number;
  placementTestCompleted?: boolean;
  placementLevel?: string;
  placementScore?: number;
  placementStarsAwarded?: number;
  placementDate?: string;
  certificateUnlocked?: boolean;
  certificateUnlockedDate?: string;
}

export interface Sticker {
  id: string;
  nameArabic: string;
  nameEnglish: string;
  icon: string;
  costStars: number;
  unlocked: boolean;
  category: string;
}

export interface Badge {
  id: string;
  title: string;
  titleArabic: string;
  description: string;
  icon: string;
  requiredXp: number;
}

export interface LeaderboardStudent {
  id: string;
  name: string;
  avatar: string;
  xp: number;
  stars: number;
  streakDays: number;
  badgeTitle: string;
  isCurrentUser?: boolean;
}

export interface SkillScore {
  skill: string;
  skillArabic: string;
  score: number; // 0 to 100
  totalAttempts: number;
  masteredCount: number;
  icon: string;
  color: string;
}

export interface DayProgress {
  day: string;
  dayArabic: string;
  pronunciation: number;
  listening: number;
  vocabulary: number;
  xpEarned: number;
}

export interface SocialContactConfig {
  email: string;
  teacherName: string;
  bioArabic: string;
  youtubeUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  whatsappUrl: string;
  telegramUrl: string;
  facebookUrl: string;
  twitterUrl: string;
}

export interface SongLyricLine {
  id: string;
  startTime: number; // in seconds
  endTime: number;
  textEnglish: string;
  textArabic: string;
  emoji: string;
  highlightWords: string[];
}

export interface EducationalSong {
  id: string;
  title: string;
  titleArabic: string;
  theme: 'animals' | 'colors' | 'numbers' | 'fruits' | 'greetings';
  themeArabic: string;
  description: string;
  descriptionArabic: string;
  icon: string;
  color: string;
  gradient: string;
  durationSeconds: number;
  bpm: number;
  melodyKey: string;
  musicalStyle: string;
  lyrics: SongLyricLine[];
}


