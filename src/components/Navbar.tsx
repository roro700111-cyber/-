import React, { useState, useEffect } from 'react';
import { Star, Gamepad2, Video, Trophy, BarChart3, Volume2, VolumeX, Music, Mail, GraduationCap } from 'lucide-react';
import { sounds, competitionMusic } from '../utils/audio';

interface NavbarProps {
  activeTab: 'games' | 'videos' | 'songs' | 'leaderboard' | 'reports' | 'creator' | 'rewards' | 'certificate' | 'print';
  setActiveTab: (tab: 'games' | 'videos' | 'songs' | 'leaderboard' | 'reports' | 'creator' | 'rewards' | 'certificate' | 'print') => void;
  stars: number;
  onOpenRewards: () => void;
  onOpenCreator: () => void;
  onOpenSocial: () => void;
  onOpenGmail?: () => void;
  onOpenPlacementTest?: () => void;
  placementTestCompleted?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  stars,
  onOpenRewards,
  onOpenCreator,
  onOpenSocial,
  onOpenGmail,
  onOpenPlacementTest,
  placementTestCompleted,
}) => {
  const [isMuted, setIsMuted] = useState(sounds.isMuted());
  const [isMusicPlaying, setIsMusicPlaying] = useState(competitionMusic.isPlaying());

  useEffect(() => {
    const unsub = competitionMusic.subscribe((playing) => {
      setIsMusicPlaying(playing);
    });
    return unsub;
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-amber-200/70 shadow-xs print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark with teacher logo */}
        <button
          onClick={() => setActiveTab('games')}
          className="text-xl font-black tracking-tight text-amber-600 hover:text-amber-700 transition-colors whitespace-nowrap shrink-0 flex items-center gap-2.5 cursor-pointer font-['Outfit'] group"
          title="تعلم الإنجليزية مع English With Rona - الصفحة الرئيسية"
        >
          <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-2xl overflow-hidden shadow-sm border-2 border-amber-300 ring-2 ring-amber-100 shrink-0 group-hover:scale-105 transition-transform bg-slate-900 flex items-center justify-center">
            <img
              src="/assets/aistudio/WhatsApp_Image_2026-11-05_at_23.16.55_6a80a945.jpeg"
              alt="English With Rona - شخصية المعلمة رانيا عزت"
              className="w-full h-full object-cover object-top"
            />
          </div>
          <div className="flex flex-col text-right leading-tight">
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-black text-amber-600 font-['Readex_Pro']">
                تعلم الإنجليزية مع
              </span>
              <span className="text-sm sm:text-base font-black tracking-tight text-slate-900 group-hover:text-amber-600 transition-colors font-['Outfit']">
                English With Rona
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-semibold font-['Readex_Pro'] flex items-center gap-1">
              <span>المعلمة رانيا عزت</span>
              <span>·</span>
              <span className="text-amber-600 font-bold">بوابة ألعاب الأطفال التفاعلية 🌟</span>
            </span>
          </div>
        </button>


        {/* Zone 2: 4-5 concise single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-700">
          <button
            onClick={() => setActiveTab('games')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'games'
                ? 'text-amber-600 border-b-2 border-amber-500 font-bold'
                : 'hover:text-amber-600'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            <span>ألعاب المفردات</span>
          </button>

          <button
            onClick={() => setActiveTab('videos')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'videos'
                ? 'text-amber-600 border-b-2 border-amber-500 font-bold'
                : 'hover:text-amber-600'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>الفيديوهات التفاعلية</span>
          </button>

          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'leaderboard'
                ? 'text-amber-600 border-b-2 border-amber-500 font-bold'
                : 'hover:text-amber-600'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>لوحة المتصدرين</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'reports'
                ? 'text-amber-600 border-b-2 border-amber-500 font-bold'
                : 'hover:text-amber-600'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>تقارير التقدم</span>
          </button>

          <button
            onClick={() => setActiveTab('certificate')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'certificate'
                ? 'text-amber-600 border-b-2 border-amber-500 font-bold'
                : 'hover:text-amber-600'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>شهادة الإنجاز</span>
            <span className="text-[10px] bg-amber-100 text-amber-800 px-1 rounded-sm font-mono">🎓</span>
          </button>
        </nav>


        {/* Zone 3: Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Placement Test Button for New Students */}
          {onOpenPlacementTest && !placementTestCompleted && (
            <button
              onClick={onOpenPlacementTest}
              className="px-3 py-1.5 bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-transform hover:scale-105 cursor-pointer animate-pulse shrink-0"
              title="خُض اختبار تحديد المستوى واحصل على نجومك الأولية"
            >
              <span>🎯</span>
              <span className="hidden sm:inline">تحديد المستوى</span>
            </button>
          )}

          {/* Competition Music Button (targeted element) */}
          <button
            onClick={() => {
              const nextPlaying = competitionMusic.toggle();
              setIsMusicPlaying(nextPlaying);
              if (!nextPlaying) sounds.playPop();
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer border ${
              isMusicPlaying
                ? 'bg-linear-to-r from-emerald-500 to-teal-500 text-white border-emerald-400 ring-2 ring-emerald-200/80 scale-102 shadow-emerald-200'
                : 'bg-amber-100/90 hover:bg-amber-200 text-amber-900 border-amber-300/80 hover:scale-102'
            }`}
            title={isMusicPlaying ? 'إيقاف موسيقى المسابقات ⏸️' : 'تشغيل موسيقى المسابقات الحماسية للأطفال 🎵'}
          >
            {isMusicPlaying ? (
              <>
                <span className="flex items-end gap-0.5 h-3.5">
                  <span className="w-1 bg-white rounded-full animate-pulse h-3.5" />
                  <span className="w-1 bg-white rounded-full animate-bounce [animation-delay:150ms] h-2" />
                  <span className="w-1 bg-white rounded-full animate-pulse [animation-delay:300ms] h-3" />
                </span>
                <span className="hidden sm:inline">موسيقى المسابقات</span>
                <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full font-bold">نشط 🎵</span>
              </>
            ) : (
              <>
                <Music className="w-3.5 h-3.5 text-amber-700" />
                <span className="hidden sm:inline">موسيقى المسابقات</span>
                <span className="text-[10px] bg-amber-200/90 text-amber-900 px-1.5 py-0.5 rounded-md font-bold">تشغيل ▶</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              const nextMuted = sounds.toggleMute();
              setIsMuted(nextMuted);
              if (!nextMuted) sounds.playPop();
            }}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            title={isMuted ? 'تشغيل المؤثرات والأصوات' : 'كتم المؤثرات الصوتية'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-amber-600" />}
          </button>

          {/* Gmail Integration Button */}
          {onOpenGmail && (
            <button
              onClick={() => {
                sounds.playClick();
                onOpenGmail();
              }}
              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs hover:scale-103 cursor-pointer whitespace-nowrap shrink-0"
              title="خدمات بريد Gmail - إرسال التقارير ومراسلة المعلمة"
            >
              <Mail className="w-3.5 h-3.5 text-red-600" />
              <span className="hidden sm:inline">Gmail</span>
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            </button>
          )}

          <button
            onClick={onOpenRewards}
            className="group px-3 py-1.5 bg-amber-100/90 hover:bg-amber-200/90 text-amber-900 border border-amber-300/80 rounded-xl font-bold text-sm flex items-center gap-1.5 transition-all shadow-xs cursor-pointer whitespace-nowrap shrink-0"
            title="رصيد النجوم والجوائز"
          >
            <Star className="w-4 h-4 text-amber-500 fill-amber-400 group-hover:rotate-12 transition-transform" />
            <span className="font-mono tabular-nums text-base">{stars}</span>
            <span className="text-xs text-amber-700 hidden sm:inline">نجمة</span>
          </button>
        </div>
      </div>

      {/* Mobile nav row */}
      <div className="md:hidden flex items-center justify-around border-t border-amber-100 bg-amber-50/60 px-1 py-1.5 text-[11px] font-semibold overflow-x-auto">
        {onOpenGmail && (
          <button
            onClick={onOpenGmail}
            className="px-2 py-1 rounded-md shrink-0 bg-red-600 text-white font-bold flex items-center gap-1 text-[11px]"
          >
            <Mail className="w-3 h-3" />
            <span>Gmail</span>
          </button>
        )}
        <button
          onClick={() => {
            const nextPlaying = competitionMusic.toggle();
            setIsMusicPlaying(nextPlaying);
          }}
          className={`px-2 py-1 rounded-md shrink-0 flex items-center gap-1 font-bold ${
            isMusicPlaying ? 'bg-emerald-500 text-white animate-pulse' : 'text-slate-700'
          }`}
          title="موسيقى المسابقات"
        >
          <span>🎵</span>
          <span>{isMusicPlaying ? 'إيقاف الموسيقى' : 'موسيقى المسابقات'}</span>
        </button>
        <button
          onClick={() => setActiveTab('games')}
          className={`px-2 py-1 rounded-md shrink-0 ${activeTab === 'games' ? 'bg-amber-500 text-white' : 'text-slate-700'}`}
        >
          المفردات
        </button>
        <button
          onClick={() => setActiveTab('videos')}
          className={`px-2 py-1 rounded-md shrink-0 ${activeTab === 'videos' ? 'bg-amber-500 text-white' : 'text-slate-700'}`}
        >
          الفيديوهات
        </button>
        <button
          onClick={() => setActiveTab('songs')}
          className={`px-2 py-1 rounded-md shrink-0 ${activeTab === 'songs' ? 'bg-amber-500 text-white' : 'text-slate-700'}`}
        >
          الأغاني 🎵
        </button>
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`px-2 py-1 rounded-md shrink-0 ${activeTab === 'leaderboard' ? 'bg-amber-500 text-white' : 'text-slate-700'}`}
        >
          المتصدرون 🏆
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-2 py-1 rounded-md shrink-0 ${activeTab === 'reports' ? 'bg-amber-500 text-white' : 'text-slate-700'}`}
        >
          التقارير 📊
        </button>
        <button
          onClick={() => {
            setActiveTab('rewards');
            onOpenRewards();
          }}
          className={`px-2 py-1 rounded-md shrink-0 ${activeTab === 'rewards' ? 'bg-amber-500 text-white' : 'text-slate-700'}`}
        >
          الجوائز
        </button>
        <button
          onClick={() => setActiveTab('certificate')}
          className={`px-2 py-1 rounded-md shrink-0 ${activeTab === 'certificate' ? 'bg-amber-500 text-white' : 'text-slate-700'}`}
        >
          الشهادة 🎓
        </button>
      </div>
    </header>
  );
};
