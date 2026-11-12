import React, { useEffect, useState } from 'react';
import { X, Sparkles, Star, Music, Share2, MessageCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds, playEncouragementPraise } from '../utils/audio';

interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  starsEarned: number;
  xpEarned: number;
  onOpenSocial?: () => void;
}

export const CelebrationModal: React.FC<CelebrationModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  starsEarned,
  xpEarned,
  onOpenSocial,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [hasShared, setHasShared] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // 1. Play super grand celebration sound (Fanfare + Cheers + Points stream)
      sounds.playSuperCelebration();

      // 2. Explode double confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.5 },
      });

      // 3. Spoken encouragement after a brief delay
      const voiceTimer = setTimeout(() => {
        playEncouragementPraise();
      }, 1200);

      return () => clearTimeout(voiceTimer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleReplayCelebrationSound = () => {
    setIsPlayingAudio(true);
    sounds.playSuperCelebration();
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 },
    });
    setTimeout(() => setIsPlayingAudio(false), 1500);
  };

  const handlePlayDing = () => {
    sounds.playDing();
  };

  const handlePlayCheer = () => {
    sounds.playCheer();
    playEncouragementPraise('Bravo! You are doing great!');
  };

  const handlePlayPointsStream = () => {
    sounds.playPointsStream(8);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border-4 border-amber-400 animate-in fade-in zoom-in-95 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Playful animated header badge */}
        <div className="text-5xl my-2 animate-bounce">🎉</div>
        <h3 className="text-2xl font-black text-slate-900 mb-1">{title}</h3>
        <p className="text-xs text-slate-600 leading-relaxed mb-4">{message}</p>

        {/* Rewards earned badge */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 mb-4 flex items-center justify-around shadow-xs">
          <div className="flex items-center gap-1.5 text-amber-700 font-black text-sm">
            <Star className="w-4 h-4 fill-amber-400 text-amber-500 animate-pulse" />
            <span className="font-mono tabular-nums">+{starsEarned} Stars</span>
          </div>
          <div className="h-4 w-px bg-amber-200" />
          <div className="flex items-center gap-1.5 text-orange-700 font-black text-sm">
            <Sparkles className="w-4 h-4 text-orange-500" />
            <span className="font-mono tabular-nums">+{xpEarned} XP</span>
          </div>
        </div>

        {/* Interactive Sound Effects Control Bar */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 mb-5 text-right">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-2">
            <span className="flex items-center gap-1 text-amber-700">
              <Music className="w-3.5 h-3.5" />
              <span>مكتبة الأصوات والتحفيز (Sound Library):</span>
            </span>
            <span className="text-[10px] text-slate-400">انقر لتجربة الصوت 🔊</span>
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            <button
              onClick={handlePlayDing}
              className="py-1.5 px-1 bg-white hover:bg-amber-100 border border-slate-200 hover:border-amber-300 rounded-xl text-[10px] font-bold text-slate-700 flex flex-col items-center gap-1 transition-all cursor-pointer shadow-xs active:scale-95"
              title="رنين الفوز والنجاح (Ding Sound)"
            >
              <span className="text-base">🔔</span>
              <span>رنين Ding</span>
            </button>

            <button
              onClick={handlePlayCheer}
              className="py-1.5 px-1 bg-white hover:bg-amber-100 border border-slate-200 hover:border-amber-300 rounded-xl text-[10px] font-bold text-slate-700 flex flex-col items-center gap-1 transition-all cursor-pointer shadow-xs active:scale-95"
              title="تصفيق وهتاف الجمهور (Cheer Sound)"
            >
              <span className="text-base">👏</span>
              <span>تصفيق Cheer</span>
            </button>

            <button
              onClick={handleReplayCelebrationSound}
              className="py-1.5 px-1 bg-white hover:bg-amber-100 border border-slate-200 hover:border-amber-300 rounded-xl text-[10px] font-bold text-slate-700 flex flex-col items-center gap-1 transition-all cursor-pointer shadow-xs active:scale-95"
              title="تتويج وفوز شامل (Victory Fanfare)"
            >
              <span className="text-base">🏆</span>
              <span>فوز Victory</span>
            </button>

            <button
              onClick={handlePlayPointsStream}
              className="py-1.5 px-1 bg-white hover:bg-amber-100 border border-slate-200 hover:border-amber-300 rounded-xl text-[10px] font-bold text-slate-700 flex flex-col items-center gap-1 transition-all cursor-pointer shadow-xs active:scale-95"
              title="شلال النجوم والمكافآت (Star Shower)"
            >
              <span className="text-base">⭐</span>
              <span>شلال Stars</span>
            </button>
          </div>
        </div>

        {/* Quick Social & Parent Share Button */}
        <div className="mb-3 flex items-center gap-2">
          <button
            onClick={() => {
              sounds.playClick();
              const shareMsg = `🎉 New Achievement on English With Rona! Earned +${starsEarned} Stars ⭐ and +${xpEarned} XP 🚀!`;
              const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMsg + ' ' + window.location.href)}`;
              window.open(waUrl, '_blank');
              setHasShared(true);
              setTimeout(() => setHasShared(false), 2000);
            }}
            className="flex-1 py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            title="Share achievement with parents on WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Share via WhatsApp</span>
          </button>

          {onOpenSocial && (
            <button
              onClick={() => {
                sounds.playClick();
                onOpenSocial();
              }}
              className="py-2 px-3 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              title="Connect with Teacher Rona"
            >
              <Share2 className="w-3.5 h-3.5 text-amber-600" />
              <span>Channels 💌</span>
            </button>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-black text-sm rounded-xl shadow-md transition-transform hover:scale-102 cursor-pointer flex items-center justify-center gap-2"
        >
          <span>Continue Learning ➔</span>
        </button>
      </div>
    </div>
  );
};
