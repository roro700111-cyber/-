/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Gamepad2,
  Video,
  Award,
  PlusCircle,
  Sparkles,
  BookOpen,
  Volume2,
  Star,
  Flame,
  CheckCircle2,
  Users,
  Share2,
  Youtube,
  Instagram,
  ExternalLink,
  Mail,
  MessageCircle,
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { StudentHeader } from './components/StudentHeader';
import { VocabularyHub } from './components/VocabularyGames/VocabularyHub';
import { VideoList } from './components/InteractiveVideo/VideoList';
import { InteractiveVideoPlayer } from './components/InteractiveVideo/InteractiveVideoPlayer';
import { GameCreatorModal } from './components/GameCreator/GameCreatorModal';
import { StickerBookModal } from './components/Rewards/StickerBookModal';
import { CelebrationModal } from './components/CelebrationModal';
import { Leaderboard } from './components/Leaderboard/Leaderboard';
import { ProgressReport } from './components/ProgressReport/ProgressReport';
import { SocialConnectModal } from './components/SocialConnect/SocialConnectModal';
import { PlacementTestModal } from './components/PlacementTest/PlacementTestModal';
import { CertificateView } from './components/Certificate/CertificateView';
import { PrintTabCertificate } from './components/Certificate/PrintTabCertificate';
import { KidsSongsHub } from './components/KidsSongs/KidsSongsHub';
import {
  GamePack,
  InteractiveVideo,
  StudentProfile,
  Sticker,
  Badge,
  SocialContactConfig,
} from './types';
import {
  INITIAL_GAME_PACKS,
  INITIAL_VIDEOS,
  INITIAL_STICKERS,
  INITIAL_BADGES,
  INITIAL_SOCIAL_CONFIG,
} from './data/initialData';
import { sounds, speakEnglish } from './utils/audio';

const STORAGE_KEYS = {
  PROFILE: 'kidlingo_student_profile_v1',
  PACKS: 'kidlingo_game_packs_v1',
  VIDEOS: 'kidlingo_videos_v1',
  STICKERS: 'kidlingo_stickers_v1',
  SOCIAL: 'kidlingo_social_config_v1',
};

export default function App() {
  // Navigation tab
  const [activeTab, setActiveTab] = useState<'games' | 'videos' | 'songs' | 'leaderboard' | 'reports' | 'creator' | 'rewards' | 'certificate' | 'print'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('tab') === 'print' || params.get('print') === 'true' || window.location.hash === '#print') {
        return 'print';
      }
    }
    return 'games';
  });
  const [isPlacementTestOpen, setIsPlacementTestOpen] = useState(false);



  // Currently playing interactive video (if null, shows video list)
  const [activeVideo, setActiveVideo] = useState<InteractiveVideo | null>(null);

  // Student Profile
  const [profile, setProfile] = useState<StudentProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      name: 'بطل الإنجليزية 🌟',
      avatar: '🦁',
      stars: 45,
      xp: 130,
      streakDays: 3,
      unlockedStickers: ['stk-lion', 'stk-star'],
      completedVideos: [],
      gamesPlayed: 8,
    };
  });

  // Game Packs
  const [gamePacks, setGamePacks] = useState<GamePack[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PACKS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_GAME_PACKS;
  });

  // Interactive Videos
  const [videos, setVideos] = useState<InteractiveVideo[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.VIDEOS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((v: InteractiveVideo) => {
            const initialMatch = INITIAL_VIDEOS.find((iv) => iv.id === v.id);
            return {
              ...v,
              thumbnailUrl: (v.thumbnailUrl || initialMatch?.thumbnailUrl || '').replace('/src/assets/', '/assets/'),
              videoUrl: v.videoUrl || initialMatch?.videoUrl,
            };
          });
        }
      }
    } catch {
      // ignore
    }
    return INITIAL_VIDEOS;
  });

  // Stickers
  const [stickers, setStickers] = useState<Sticker[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STICKERS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_STICKERS;
  });

  // Modals
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [isRewardsOpen, setIsRewardsOpen] = useState(false);
  const [isSocialModalOpen, setIsSocialModalOpen] = useState(false);
  const [socialConfig, setSocialConfig] = useState<SocialContactConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SOCIAL);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_SOCIAL_CONFIG,
          ...parsed,
          email: 'roro700111@gmail.com',
          whatsappUrl: 'https://wa.me/201004823314',
          youtubeUrl:
            !parsed.youtubeUrl || parsed.youtubeUrl.includes('EnglishWithRona')
              ? 'https://www.youtube.com/@raniaezzat2630'
              : parsed.youtubeUrl,
          tiktokUrl:
            !parsed.tiktokUrl || parsed.tiktokUrl.includes('EnglishWithRona')
              ? 'https://www.tiktok.com/@english.with.rona?is_from_webapp=1&sender_device=pc'
              : parsed.tiktokUrl,
        };
      }
    } catch {
      // ignore
    }
    return INITIAL_SOCIAL_CONFIG;
  });

  const [celebrationData, setCelebrationData] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    stars: number;
    xp: number;
  }>({
    isOpen: false,
    title: '',
    message: '',
    stars: 0,
    xp: 0,
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch {
      // ignore
    }
  }, [profile]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PACKS, JSON.stringify(gamePacks));
    } catch {
      // ignore
    }
  }, [gamePacks]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(videos));
    } catch {
      // ignore
    }
  }, [videos]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.STICKERS, JSON.stringify(stickers));
    } catch {
      // ignore
    }
  }, [stickers]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SOCIAL, JSON.stringify(socialConfig));
    } catch {
      // ignore
    }
  }, [socialConfig]);

  // Rewards Handler
  const handleReward = (starsEarned: number, xpEarned: number) => {
    setProfile((prev) => ({
      ...prev,
      stars: prev.stars + starsEarned,
      xp: prev.xp + xpEarned,
      gamesPlayed: prev.gamesPlayed + 1,
    }));
  };

  const handleFinishGameRound = () => {
    sounds.playVictoryWin();
    setCelebrationData({
      isOpen: true,
      title: 'أحسنت صنعاً يا بطل!',
      message: 'أكملت جولة التدريب بنجاح وحققت تقدماً رائعاً في مهارات اللغة الإنجليزية!',
      stars: 5,
      xp: 25,
    });
    handleReward(5, 25);
  };

  const handleVideoCompleted = (videoId: string) => {
    sounds.playVictoryWin();
    setProfile((prev) => {
      const completed = prev.completedVideos.includes(videoId)
        ? prev.completedVideos
        : [...prev.completedVideos, videoId];
      return {
        ...prev,
        completedVideos: completed,
      };
    });
  };

  // Sticker unlock handler
  const handleUnlockSticker = (stickerId: string, cost: number) => {
    sounds.playDing();
    sounds.playPointsStream(4);
    setStickers((prev) =>
      prev.map((s) => (s.id === stickerId ? { ...s, unlocked: true } : s))
    );
    setProfile((prev) => ({
      ...prev,
      stars: Math.max(0, prev.stars - cost),
      unlockedStickers: [...prev.unlockedStickers, stickerId],
    }));
  };

  // Save new Pack from Creator
  const handleSavePack = (newPack: GamePack) => {
    setGamePacks((prev) => [newPack, ...prev]);
    handleReward(10, 50);
    setCelebrationData({
      isOpen: true,
      title: 'صانع الألعاب المبدع! 🎨',
      message: `تم إنشاء حزمة "${newPack.titleArabic}" بنجاح وجاهزة للعب الفوري مع الأطفال!`,
      stars: 10,
      xp: 50,
    });
  };

  // Save new Video from Creator
  const handleSaveVideo = (newVideo: InteractiveVideo) => {
    setVideos((prev) => [newVideo, ...prev]);
    handleReward(15, 60);
    setCelebrationData({
      isOpen: true,
      title: 'فيديو تفاعلي جديد! 🎬',
      message: `تم حفظ ونشر فيديو "${newVideo.titleArabic}" التفاعلي بنجاح!`,
      stars: 15,
      xp: 60,
    });
  };

  // Complete Placement Test Handler
  const handleCompletePlacementTest = (result: {
    level: string;
    score: number;
    starsAwarded: number;
    xpAwarded: number;
  }) => {
    setProfile((prev) => ({
      ...prev,
      stars: prev.stars + result.starsAwarded,
      xp: prev.xp + result.xpAwarded,
      placementTestCompleted: true,
      placementLevel: result.level,
      placementScore: result.score,
      placementStarsAwarded: result.starsAwarded,
      placementDate: new Date().toLocaleDateString('ar-EG'),
    }));
  };

  return (
    <div className="min-h-screen bg-amber-50/30 flex flex-col selection:bg-amber-200">
      {/* Top Bar Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        stars={profile.stars}
        onOpenRewards={() => setIsRewardsOpen(true)}
        onOpenCreator={() => setIsCreatorOpen(true)}
        onOpenSocial={() => setIsSocialModalOpen(true)}
        onOpenPlacementTest={() => setIsPlacementTestOpen(true)}
        placementTestCompleted={profile.placementTestCompleted}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Student Profile & Gamification Banner (Hidden on Print tab) */}
        {activeTab !== 'print' && (
          <StudentHeader
            profile={profile}
            onUpdateProfile={(updated) => setProfile((p) => ({ ...p, ...updated }))}
            onOpenPlacementTest={() => setIsPlacementTestOpen(true)}
            onOpenCertificate={() => setActiveTab('certificate')}
          />
        )}

        {/* Hero Banner when on Home/Games view */}
        {activeTab === 'games' && !activeVideo && (
          <div className="bg-gradient-to-br from-white via-amber-50/70 to-orange-50/50 rounded-3xl p-6 sm:p-8 lg:p-10 border-2 border-amber-200/90 shadow-xl mb-8 overflow-hidden relative">
            {/* Background joyful decorative accents */}
            <div className="absolute -top-16 -right-16 w-64 h-64 bg-amber-200/35 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-orange-200/35 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
              {/* Left Column: Headlines, Highlights, and CTAs */}
              <div className="flex-1 text-right w-full">
                {/* Brand kicker and teacher quick contacts */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <div className="inline-flex items-center gap-1.5 text-xs font-black text-amber-800 bg-amber-100/90 border border-amber-300 px-3.5 py-1 rounded-full shadow-xs">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-spin" style={{ animationDuration: '6s' }} />
                    <span>المنصة التفاعلية المعتمدة للأطفال 🌟</span>
                  </div>

                  {/* Direct WhatsApp Contact Badge */}
                  <a
                    href="https://wa.me/201004823314"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-3 py-1 rounded-full transition-all border border-emerald-300 shadow-xs cursor-pointer hover:scale-105"
                    title="تواصل واتساب مع المعلمة رانيا: 01004823314"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-[#25D366] fill-[#25D366]" />
                    <span>واتساب:</span>
                    <span className="font-mono font-bold" dir="ltr">01004823314</span>
                  </a>

                  {/* Direct Email Contact Badge */}
                  <a
                    href="mailto:roro700111@gmail.com"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-red-800 bg-red-100 hover:bg-red-200 px-3 py-1 rounded-full transition-all border border-red-300 shadow-xs cursor-pointer hover:scale-105"
                    title="البريد الإلكتروني المعتمد للمعلمة رانيا: roro700111@gmail.com"
                  >
                    <Mail className="w-3.5 h-3.5 text-red-600" />
                    <span className="font-mono font-bold" dir="ltr">roro700111@gmail.com</span>
                  </a>
                </div>

                {/* Primary Site Title Requested: تعلم الإنجليزية مع English With Rona */}
                <div className="mb-3">
                  <span className="text-xs sm:text-sm font-black text-amber-600 tracking-wide block mb-1">
                    أهلاً بكم في المنصة التعليمية
                  </span>
                  <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                    تعلم الإنجليزية مع{' '}
                    <span className="bg-gradient-to-r from-amber-600 via-orange-500 to-rose-500 bg-clip-text text-transparent font-['Outfit'] inline-block drop-shadow-xs">
                      English With Rona
                    </span>{' '}
                    🦁
                  </h1>
                </div>

                <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mb-6">
                  رحلة تفاعلية ساحرة تجمع بين متعة اللعب والتعلم الحقيقي! استمع لنطق الكلمات، وسجل صوتك بالميكروفون مع تقييم ذكي فوري، وتفاعل مع الفيديوهات والأناشيد التعليمية المبهجة مع المعلمة رانيا عزت.
                </p>

                {/* 4 Feature Highlights Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
                  <div className="bg-white/90 backdrop-blur-xs p-3 rounded-2xl border border-amber-200/80 shadow-xs flex items-center gap-2.5">
                    <span className="text-2xl">🎮</span>
                    <div>
                      <div className="text-xs font-black text-slate-800">ألعاب المفردات</div>
                      <div className="text-[10px] text-slate-500">صيد، بطاقات، وذاكرة</div>
                    </div>
                  </div>

                  <div className="bg-white/90 backdrop-blur-xs p-3 rounded-2xl border border-amber-200/80 shadow-xs flex items-center gap-2.5">
                    <span className="text-2xl">🎙️</span>
                    <div>
                      <div className="text-xs font-black text-slate-800">تدريب النطق</div>
                      <div className="text-[10px] text-slate-500">تقييم صوتي دقيق بالمايك</div>
                    </div>
                  </div>

                  <div className="bg-white/90 backdrop-blur-xs p-3 rounded-2xl border border-amber-200/80 shadow-xs flex items-center gap-2.5">
                    <span className="text-2xl">🎬</span>
                    <div>
                      <div className="text-xs font-black text-slate-800">فيديوهات تفاعلية</div>
                      <div className="text-[10px] text-slate-500">تتحدث وتتفاعل معك</div>
                    </div>
                  </div>

                  <div className="bg-white/90 backdrop-blur-xs p-3 rounded-2xl border border-amber-200/80 shadow-xs flex items-center gap-2.5">
                    <span className="text-2xl">🎓</span>
                    <div>
                      <div className="text-xs font-black text-slate-800">شهادة تفوق</div>
                      <div className="text-[10px] text-slate-500">قابلة للمشاركة والطباعة</div>
                    </div>
                  </div>
                </div>

                {/* Action CTAs */}
                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    onClick={() => {
                      sounds.playSuperCelebration();
                      const hubEl = document.getElementById('vocabulary-hub-section');
                      if (hubEl) hubEl.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-5 py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2.5 shadow-lg shadow-amber-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <Gamepad2 className="w-5 h-5" />
                    <span>ابدأ اللعب والتعلم الآن 🚀</span>
                  </button>

                  {!profile.placementTestCompleted && (
                    <button
                      onClick={() => setIsPlacementTestOpen(true)}
                      className="px-4 py-3 bg-white hover:bg-amber-50 text-amber-800 border-2 border-amber-300 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all hover:scale-105 cursor-pointer animate-pulse"
                    >
                      <span>🎯</span>
                      <span>اختبار تحديد المستوى (+35⭐)</span>
                    </button>
                  )}

                  <button
                    onClick={() => setActiveTab('videos')}
                    className="px-4 py-3 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Video className="w-4 h-4 text-rose-500" />
                    <span>الفيديوهات التفاعلية</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('certificate')}
                    className="px-4 py-3 bg-amber-100/90 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Award className="w-4 h-4 text-amber-700" />
                    <span>شهادة الإنجاز</span>
                  </button>

                  <button
                    onClick={() => setIsSocialModalOpen(true)}
                    className="px-4 py-3 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Share2 className="w-4 h-4 text-indigo-600" />
                    <span>تواصل مع المعلمة رونا</span>
                  </button>
                </div>
              </div>

              {/* Right Column: Teacher Portrait with Elegant Frame & Badges */}
              <div className="w-full lg:w-[420px] shrink-0">
                <div className="relative group">
                  {/* Outer decorative gradient border */}
                  <div className="p-1.5 rounded-3xl bg-gradient-to-br from-amber-400 via-orange-400 to-rose-400 shadow-xl">
                    <div className="relative aspect-16/10 rounded-2xl overflow-hidden bg-slate-900">
                      <img
                        src="/assets/aistudio/755033722_10234689942934117_9038279861026742899_n_4e5f4669.jpg"
                        alt="المعلمة رانيا عزت محمد السيد - English With Rona"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />

                      {/* Gentle gradient overlay at bottom for legible name */}
                      <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/85 via-black/50 to-transparent text-white">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                          <h3 className="font-black text-sm sm:text-base">المعلمة رانيا عزت محمد السيد</h3>
                        </div>
                        <p className="text-[11px] text-amber-200 font-medium mt-0.5">
                          معلم خبير لغة إنجليزية ومسؤول تعلم ذكي · Teacher Rona
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Floating Interactive Badge */}
                  <div className="absolute -top-3 -right-3 bg-white border border-amber-300 rounded-2xl px-3 py-1.5 shadow-lg flex items-center gap-2 text-xs font-black text-amber-900 animate-bounce" style={{ animationDuration: '3s' }}>
                    <span>⭐</span>
                    <span>English With Rona</span>
                  </div>

                  {/* Floating Sound Audio Greeting Trigger */}
                  <button
                    onClick={() => {
                      sounds.playSuperCelebration();
                      speakEnglish("Welcome to English With Rona! Let's learn and have fun together!");
                    }}
                    className="absolute -bottom-3 -left-3 bg-white hover:bg-amber-50 border-2 border-amber-300 text-amber-900 rounded-2xl px-3.5 py-2 shadow-lg flex items-center gap-2 text-xs font-black transition-all hover:scale-105 cursor-pointer"
                    title="استمع لتحية المعلمة رونا الترحيبية"
                  >
                    <Volume2 className="w-4 h-4 text-amber-600 animate-pulse" />
                    <span>اسمع ترحيب المعلمة 📢</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Views */}
        {activeTab === 'games' && (
          <div id="vocabulary-hub-section" className="space-y-8">
            <VocabularyHub
              packs={gamePacks}
              onReward={handleReward}
              onOpenCreator={() => setIsCreatorOpen(true)}
              onFinishRound={handleFinishGameRound}
            />

            {/* Teacher Rona & Social Media Connection Banner */}
            <div className="bg-linear-to-br from-amber-500 via-amber-600 to-orange-500 rounded-3xl p-6 sm:p-7 text-white shadow-lg border border-amber-300 relative overflow-hidden">
              <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
                <div className="flex items-start sm:items-center gap-4">
                  <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden border-2 border-white/60 shadow-lg shrink-0 bg-slate-900">
                    <img
                      src="/assets/aistudio/WhatsApp_Image_2026-11-05_at_23.16.55_6a80a945.jpeg"
                      alt="شخصية المعلمة رانيا عزت - English With Rona"
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-black bg-white/25 px-2.5 py-0.5 rounded-full text-yellow-100">
                        التواصل الرسمي والمتابعة
                      </span>
                      <span className="text-xs text-yellow-200 font-bold">English With Rona</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black">
                      تواصل مع المعلمة رونا وتابع قنواتنا التعليمية
                    </h3>
                    <p className="text-xs text-white/90 max-w-xl mt-1 leading-relaxed">
                      يسعدنا استقبال استفساراتكم وتقارير تقدم أطفالكم عبر البريد المعتمد ({socialConfig.email})، ومتابعة أحدث الفيديوهات وأناشيد الفونكس عبر قنواتنا على يوتيوب وإنستغرام وتيك توك وتليجرام.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full lg:w-auto justify-end">
                  <a
                    href="https://wa.me/201004823314"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2.5 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-xl hover:scale-105 transition-transform cursor-pointer shadow-xs flex items-center gap-1.5 font-bold text-xs"
                    title="واتساب المعلمة رانيا: 01004823314"
                  >
                    <MessageCircle className="w-4 h-4 fill-white" />
                    <span>01004823314</span>
                  </a>

                  <a
                    href="mailto:roro700111@gmail.com"
                    className="px-3.5 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl hover:scale-105 transition-transform cursor-pointer shadow-xs flex items-center gap-1.5 font-bold text-xs"
                    title="إرسال بريد إلكتروني: roro700111@gmail.com"
                  >
                    <Mail className="w-4 h-4" />
                    <span className="font-mono" dir="ltr">roro700111@gmail.com</span>
                  </a>
                  <a
                    href={socialConfig.youtubeUrl || 'https://www.youtube.com/@raniaezzat2630'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl hover:scale-110 transition-transform cursor-pointer shadow-xs"
                    title="قناة YouTube: المعلمة رانيا عزت (@raniaezzat2630)"
                  >
                    <Youtube className="w-4 h-4 hover:scale-110 transition-transform" />
                  </a>

                  <a
                    href={socialConfig.tiktokUrl || 'https://www.tiktok.com/@english.with.rona?is_from_webapp=1&sender_device=pc'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl hover:scale-110 transition-transform cursor-pointer shadow-xs"
                    title="حساب TikTok: المعلمة رونا (@english.with.rona)"
                  >
                    <svg className="w-4 h-4 hover:scale-110 transition-transform fill-current" viewBox="0 0 24 24">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z" />
                    </svg>
                  </a>

                  <a
                    href={socialConfig.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl hover:scale-110 transition-transform cursor-pointer shadow-xs"
                    title="حساب Instagram"
                  >
                    <Instagram className="w-4 h-4 hover:scale-110 transition-transform" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'videos' && (
          <div>
            {activeVideo ? (
              <InteractiveVideoPlayer
                video={activeVideo}
                onReward={handleReward}
                onBack={() => setActiveVideo(null)}
                onVideoComplete={handleVideoCompleted}
              />
            ) : (
              <VideoList
                videos={videos}
                completedVideos={profile.completedVideos}
                onSelectVideo={(vid) => setActiveVideo(vid)}
                onOpenCreator={() => setIsCreatorOpen(true)}
              />
            )}
          </div>
        )}

        {activeTab === 'songs' && (
          <KidsSongsHub onReward={handleReward} />
        )}

        {activeTab === 'leaderboard' && (
          <Leaderboard
            currentProfile={profile}
            onNavigateToGames={() => setActiveTab('games')}
          />
        )}

        {activeTab === 'reports' && (
          <ProgressReport
            profile={profile}
            gamePacks={gamePacks}
            onNavigateToGames={() => setActiveTab('games')}
            onNavigateToVideos={() => setActiveTab('videos')}
            onOpenSocial={() => setIsSocialModalOpen(true)}
            teacherEmail={socialConfig.email}
          />
        )}

        {activeTab === 'rewards' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-200/80 shadow-md">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-black text-slate-800">
                  لوحة إنجازات وجوائز الطالب 🏆
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  كل نشاط وتمرين يمنحك نجوماً وخبرة لفتح ملصقات وكؤوس جديدة
                </p>
              </div>
              <button
                onClick={() => setIsRewardsOpen(true)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                فتح متجر الملصقات السحرية
              </button>
            </div>

            {/* Quick summary grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <div className="bg-amber-50/80 border border-amber-200 p-4 rounded-2xl text-center">
                <span className="text-3xl block mb-1">⭐</span>
                <span className="text-xl font-black text-amber-700 font-mono tabular-nums">
                  {profile.stars}
                </span>
                <span className="text-xs text-slate-500 block font-semibold">إجمالي النجوم</span>
              </div>

              <div className="bg-orange-50/80 border border-orange-200 p-4 rounded-2xl text-center">
                <span className="text-3xl block mb-1">⚡</span>
                <span className="text-xl font-black text-orange-700 font-mono tabular-nums">
                  {profile.xp}
                </span>
                <span className="text-xs text-slate-500 block font-semibold">نقاط الخبرة XP</span>
              </div>

              <div className="bg-emerald-50/80 border border-emerald-200 p-4 rounded-2xl text-center">
                <span className="text-3xl block mb-1">🎮</span>
                <span className="text-xl font-black text-emerald-700 font-mono tabular-nums">
                  {profile.gamesPlayed}
                </span>
                <span className="text-xs text-slate-500 block font-semibold">ألعاب ملعوبة</span>
              </div>

              <div className="bg-indigo-50/80 border border-indigo-200 p-4 rounded-2xl text-center">
                <span className="text-3xl block mb-1">🎬</span>
                <span className="text-xl font-black text-indigo-700 font-mono tabular-nums">
                  {profile.completedVideos.length}
                </span>
                <span className="text-xs text-slate-500 block font-semibold">فيديوهات مكتملة</span>
              </div>
            </div>

            {/* Unlocked stickers showcase */}
            <div>
              <h4 className="text-sm font-black text-slate-800 mb-3">
                الملصقات المفتوحة في ألبومك:
              </h4>
              <div className="flex items-center gap-3 flex-wrap">
                {stickers
                  .filter((s) => s.unlocked)
                  .map((s) => (
                    <div
                      key={s.id}
                      className="px-4 py-2.5 bg-amber-50 rounded-2xl border border-amber-200 flex items-center gap-2"
                    >
                      <span className="text-2xl">{s.icon}</span>
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">
                          {s.nameArabic}
                        </span>
                        <span className="text-[10px] text-slate-400 font-['Outfit']" dir="ltr">
                          {s.nameEnglish}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'creator' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-200/80 shadow-md text-center">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-100 text-amber-700 flex items-center justify-center text-3xl mb-4">
              🎨
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">
              استوديو صانع الألعاب والدروس التفاعلية
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto mb-6 leading-relaxed">
              يمكن للمعلمين وأولياء الأمور إضافة قوائم كلمات إنجليزية خاصة بمنهاجهم المدرسي، وتحديد
              محطات توقف تفاعلية في الفيديوهات التعليمية مع أسئلة نطق واستماع مخصصة.
            </p>

            <button
              onClick={() => setIsCreatorOpen(true)}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-black text-xs shadow-md transition-transform hover:scale-105 cursor-pointer"
            >
              افتح نافذة صانع الألعاب والدروس ➔
            </button>
          </div>
        )}

        {activeTab === 'certificate' && (
          <CertificateView
            profile={profile}
            onNavigateTab={(tab) => {
              if (tab === 'placement') {
                setIsPlacementTestOpen(true);
              } else {
                setActiveTab(tab as any);
              }
            }}
            onOpenPlacementTest={() => setIsPlacementTestOpen(true)}
            onOpenPrintTab={() => setActiveTab('print')}
            onUpdateProfile={(updated) => setProfile((prev) => ({ ...prev, ...updated }))}
          />
        )}

        {activeTab === 'print' && (
          <PrintTabCertificate
            profile={profile}
            onBack={() => setActiveTab('certificate')}
            onUpdateProfile={(updated) => setProfile((prev) => ({ ...prev, ...updated }))}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-amber-200/60 bg-white py-6 mt-12 text-slate-500 text-xs print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
            <div>
              <span>© {new Date().getFullYear()} تعلم الإنجليزية مع English With Rona · إشراف المعلمة رانيا عزت محمد السيد. جميع الحقوق محفوظة.</span>
            </div>
            <div className="flex items-center gap-4">
              <span>تمارين نطق صوتية</span>
              <span>·</span>
              <span>فيديوهات تفاعلية</span>
              <span>·</span>
              <span>لوحة المتصدرين</span>
              <span>·</span>
              <span>تقارير تقدم دورية</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <PlacementTestModal
        isOpen={isPlacementTestOpen}
        onClose={() => setIsPlacementTestOpen(false)}
        studentName={profile.name}
        onCompleteTest={handleCompletePlacementTest}
      />

      <GameCreatorModal
        isOpen={isCreatorOpen}
        onClose={() => setIsCreatorOpen(false)}
        onSavePack={handleSavePack}
        onSaveVideo={handleSaveVideo}
      />

      <StickerBookModal
        isOpen={isRewardsOpen}
        onClose={() => setIsRewardsOpen(false)}
        stars={profile.stars}
        xp={profile.xp}
        stickers={stickers}
        badges={INITIAL_BADGES}
        onUnlockSticker={handleUnlockSticker}
      />

      <CelebrationModal
        isOpen={celebrationData.isOpen}
        onClose={() => setCelebrationData((prev) => ({ ...prev, isOpen: false }))}
        title={celebrationData.title}
        message={celebrationData.message}
        starsEarned={celebrationData.stars}
        xpEarned={celebrationData.xp}
        onOpenSocial={() => setIsSocialModalOpen(true)}
      />

      <SocialConnectModal
        isOpen={isSocialModalOpen}
        onClose={() => setIsSocialModalOpen(false)}
        socialConfig={socialConfig}
        onUpdateSocialConfig={setSocialConfig}
        profile={profile}
      />
    </div>
  );
}
