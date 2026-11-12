import React, { useState } from 'react';
import { X, Star, Lock, CheckCircle2 } from 'lucide-react';
import { Sticker, Badge } from '../../types';
import { sounds } from '../../utils/audio';
import confetti from 'canvas-confetti';

interface StickerBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  stars: number;
  xp: number;
  stickers: Sticker[];
  badges: Badge[];
  onUnlockSticker: (stickerId: string, cost: number) => void;
}

export const StickerBookModal: React.FC<StickerBookModalProps> = ({
  isOpen,
  onClose,
  stars,
  xp,
  stickers,
  badges,
  onUnlockSticker,
}) => {
  const [activeTab, setActiveTab] = useState<'stickers' | 'badges'>('stickers');

  if (!isOpen) return null;

  const handleBuySticker = (sticker: Sticker) => {
    if (sticker.unlocked) return;
    if (stars < sticker.costStars) {
      sounds.playError();
      return;
    }

    sounds.playStarCollect();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
    });
    onUnlockSticker(sticker.id, sticker.costStars);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-auto animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-2xl">
              🌟
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">
                Sticker Album & Achievement Trophies
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Redeem your earned stars for magical stickers and unlock honor badges
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Balance & Sub-tabs */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl w-full sm:w-auto">
            <button
              onClick={() => {
                sounds.playClick();
                setActiveTab('stickers');
              }}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeTab === 'stickers'
                  ? 'bg-white text-amber-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              My Magic Stickers ({stickers.filter((s) => s.unlocked).length}/{stickers.length})
            </button>
            <button
              onClick={() => {
                sounds.playClick();
                setActiveTab('badges');
              }}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeTab === 'badges'
                  ? 'bg-white text-amber-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Badges & Trophies ({badges.filter((b) => xp >= b.requiredXp).length}/{badges.length})
            </button>
          </div>

          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3.5 py-1.5 rounded-2xl shrink-0">
            <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
            <span className="text-xs font-bold text-amber-900">Your Stars:</span>
            <span className="text-sm font-mono font-black text-amber-600 tabular-nums">{stars}</span>
            <span className="text-[11px] text-amber-700">Stars</span>
          </div>
        </div>

        {/* Tab 1: Stickers Grid */}
        {activeTab === 'stickers' ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 max-h-96 overflow-y-auto p-1">
            {stickers.map((stk) => {
              const canAfford = stars >= stk.costStars;
              return (
                <div
                  key={stk.id}
                  className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center justify-between ${
                    stk.unlocked
                      ? 'bg-gradient-to-b from-amber-50/60 to-orange-50/60 border-amber-200 shadow-xs'
                      : 'bg-slate-50 border-slate-200 opacity-80'
                  }`}
                >
                  <div className="w-16 h-16 rounded-2xl bg-white shadow-xs border border-amber-100 flex items-center justify-center text-4xl mb-2 relative">
                    <span className={stk.unlocked ? 'animate-float' : 'grayscale opacity-40'}>
                      {stk.icon}
                    </span>
                    {!stk.unlocked && (
                      <div className="absolute inset-0 bg-slate-900/30 rounded-2xl flex items-center justify-center">
                        <Lock className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>

                  <span className="text-xs font-black text-slate-800 block mb-0.5">
                    {stk.nameEnglish}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium block mb-3">
                    {stk.nameArabic}
                  </span>

                  {stk.unlocked ? (
                    <div className="text-[11px] font-black text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Unlocked</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleBuySticker(stk)}
                      disabled={!canAfford}
                      className={`w-full py-1.5 px-2 rounded-xl text-[11px] font-black flex items-center justify-center gap-1 transition-all cursor-pointer ${
                        canAfford
                          ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs hover:scale-105'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <Star className="w-3 h-3 fill-current" />
                      <span>{stk.costStars} Stars</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* Tab 2: Badges */
          <div className="space-y-3 max-h-96 overflow-y-auto p-1">
            {badges.map((badge) => {
              const isEarned = xp >= badge.requiredXp;
              const progress = Math.min(100, Math.round((xp / badge.requiredXp) * 100));

              return (
                <div
                  key={badge.id}
                  className={`p-4 rounded-2xl border flex items-center gap-4 transition-all ${
                    isEarned
                      ? 'bg-amber-50/60 border-amber-200'
                      : 'bg-slate-50 border-slate-200 opacity-75'
                  }`}
                >
                  <div className="w-14 h-14 rounded-2xl bg-white shadow-xs border border-amber-100 flex items-center justify-center text-3xl shrink-0">
                    <span className={isEarned ? '' : 'grayscale opacity-40'}>
                      {badge.icon}
                    </span>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-black text-slate-800">
                        {badge.title || badge.titleArabic}
                      </h4>
                      {isEarned ? (
                        <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          Unlocked ⭐
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-mono tabular-nums">
                          Requires {badge.requiredXp} XP
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mb-2">{badge.description}</p>

                    {/* Progress bar */}
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isEarned ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
