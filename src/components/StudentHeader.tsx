import React, { useState } from 'react';
import { Flame, Star, Zap, Edit3, Check, Volume2 } from 'lucide-react';
import { StudentProfile } from '../types';
import { speakEnglish, sounds } from '../utils/audio';

interface StudentHeaderProps {
  profile: StudentProfile;
  onUpdateProfile: (updated: Partial<StudentProfile>) => void;
  onOpenPlacementTest?: () => void;
  onOpenCertificate?: () => void;
}

const AVATARS = ['🦁', '🐰', '🦉', '🧑‍🚀', '🦕', '🐬', '🐼', '🦊'];

export const StudentHeader: React.FC<StudentHeaderProps> = ({
  profile,
  onUpdateProfile,
  onOpenPlacementTest,
  onOpenCertificate,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(profile.name);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  // Level calculation: level = floor(xp / 100) + 1
  const level = Math.floor(profile.xp / 100) + 1;
  const currentLevelXp = profile.xp % 100;
  const xpNeeded = 100;

  const handleSaveName = () => {
    if (tempName.trim()) {
      onUpdateProfile({ name: tempName.trim() });
    }
    setIsEditingName(false);
    sounds.playClick();
  };

  const handleSelectAvatar = (av: string) => {
    onUpdateProfile({ avatar: av });
    setShowAvatarPicker(false);
    sounds.playPop();
  };

  const handlePlayGreeting = () => {
    sounds.playClick();
    speakEnglish(`Hello ${profile.name}! You are doing fantastic! Keep learning and shining!`);
  };

  return (
    <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white rounded-3xl p-5 sm:p-6 shadow-md relative overflow-hidden mb-8">
      {/* Decorative subtle background accents */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left / Main Profile Info */}
        <div className="flex items-center gap-4 w-full md:w-auto">
          {/* Avatar button */}
          <div className="relative">
            <button
              onClick={() => {
                setShowAvatarPicker(!showAvatarPicker);
                sounds.playClick();
              }}
              className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl sm:text-4xl border-2 border-white/40 shadow-inner transition-transform hover:scale-105 cursor-pointer"
              title="Click to change your avatar"
            >
              <span>{profile.avatar}</span>
            </button>
            <div className="absolute -bottom-1 -left-1 bg-amber-400 text-amber-950 text-[10px] font-black px-1.5 py-0.5 rounded-full border border-white">
              Level {level}
            </div>

            {/* Avatar picker popover */}
            {showAvatarPicker && (
              <div className="absolute top-full mt-2 left-0 z-40 bg-white rounded-2xl p-3 shadow-xl border border-slate-200 grid grid-cols-4 gap-2 text-2xl w-48 animate-in fade-in zoom-in-95">
                {AVATARS.map((av) => (
                  <button
                    key={av}
                    onClick={() => handleSelectAvatar(av)}
                    className="w-9 h-9 rounded-xl hover:bg-amber-100 flex items-center justify-center transition-transform hover:scale-110 cursor-pointer"
                  >
                    {av}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Name & greeting */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              {isEditingName ? (
                <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-md rounded-lg p-1">
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="bg-transparent text-white font-bold text-lg sm:text-xl outline-hidden px-2 py-0.5 w-32 sm:w-44"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                  />
                  <button
                    onClick={handleSaveName}
                    className="p-1 bg-white text-orange-600 rounded-md hover:bg-orange-50 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight">{profile.name}</h2>
                  <button
                    onClick={() => {
                      setTempName(profile.name);
                      setIsEditingName(true);
                      sounds.playClick();
                    }}
                    className="text-white/70 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
                    title="Edit Name"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handlePlayGreeting}
                    className="text-white/90 hover:text-white bg-white/20 hover:bg-white/30 p-1.5 rounded-full transition-all cursor-pointer"
                    title="Hear Voice Greeting"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            <p className="text-white/90 text-xs sm:text-sm mt-0.5 font-medium">
              Star English Learner · Let's learn & play!
            </p>

            {/* XP progress bar */}
            <div className="mt-3 w-full sm:w-64">
              <div className="flex justify-between text-[11px] font-semibold text-white/90 mb-1">
                <span>Level Progress (XP)</span>
                <span className="font-mono tabular-nums">{currentLevelXp} / {xpNeeded}</span>
              </div>
              <div className="w-full h-2.5 bg-black/20 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-linear-to-r from-amber-300 to-yellow-200 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (currentLevelXp / xpNeeded) * 100)}%` }}
                />
              </div>
            </div>

            {/* Placement Test & Certificate Badges */}
            <div className="flex flex-wrap items-center gap-2 mt-3.5">
              {onOpenPlacementTest && (
                <button
                  onClick={onOpenPlacementTest}
                  className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                    profile.placementTestCompleted
                      ? 'bg-white/20 hover:bg-white/30 text-yellow-100 border border-white/30'
                      : 'bg-yellow-400 hover:bg-yellow-300 text-amber-950 animate-pulse font-black'
                  }`}
                  title="اختبار تحديد المستوى وتشخيص مهارات اللغة الإنجليزية"
                >
                  <span>🎯</span>
                  <span>{profile.placementTestCompleted ? `المستوى: ${profile.placementLevel?.split('(')[0] || 'مكتمل'}` : 'اختبار تحديد المستوى (+35⭐)'}</span>
                </button>
              )}

              {onOpenCertificate && (
                <button
                  onClick={onOpenCertificate}
                  className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 border border-white/30 transition-all shadow-xs cursor-pointer"
                  title="شهادة إنجاز التخرج والتميز"
                >
                  <span>🎓</span>
                  <span>شهادة الإنجاز</span>
                  <span className="text-[10px] bg-black/20 px-1 rounded-sm">
                    {profile.placementTestCompleted && profile.gamesPlayed >= 5 && profile.completedVideos.length >= 2 ? 'متاحة 🎉' : 'مغلقة 🔒'}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right / Quick Metrics */}
        <div className="flex items-center gap-3 sm:gap-4 w-full md:w-auto justify-between md:justify-end">
          {/* Stars */}
          <div className="bg-white/15 backdrop-blur-md border border-white/25 rounded-2xl px-4 py-2.5 text-center flex-1 md:flex-initial min-w-[90px]">
            <div className="flex items-center justify-center gap-1 text-yellow-300">
              <Star className="w-4 h-4 fill-yellow-300" />
              <span className="font-black text-lg sm:text-xl font-mono tabular-nums">{profile.stars}</span>
            </div>
            <span className="text-[11px] text-white/80 block mt-0.5 font-medium">Stars Earned</span>
          </div>

          {/* XP */}
          <div className="bg-white/15 backdrop-blur-md border border-white/25 rounded-2xl px-4 py-2.5 text-center flex-1 md:flex-initial min-w-[90px]">
            <div className="flex items-center justify-center gap-1 text-cyan-200">
              <Zap className="w-4 h-4 fill-cyan-300" />
              <span className="font-black text-lg sm:text-xl font-mono tabular-nums">{profile.xp}</span>
            </div>
            <span className="text-[11px] text-white/80 block mt-0.5 font-medium">XP Points</span>
          </div>

          {/* Daily streak */}
          <div className="bg-white/15 backdrop-blur-md border border-white/25 rounded-2xl px-4 py-2.5 text-center flex-1 md:flex-initial min-w-[90px]">
            <div className="flex items-center justify-center gap-1 text-orange-200">
              <Flame className="w-4 h-4 fill-orange-300 text-orange-300 animate-bounce" />
              <span className="font-black text-lg sm:text-xl font-mono tabular-nums">{profile.streakDays}</span>
            </div>
            <span className="text-[11px] text-white/80 block mt-0.5 font-medium">Day Streak 🔥</span>
          </div>
        </div>
      </div>
    </div>
  );
};
