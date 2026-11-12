import React, { useState } from 'react';
import { Layers, SpellCheck, Brain, Headphones, ChevronLeft, Sparkles, Plus, Timer, Flame, Zap } from 'lucide-react';
import { GamePack, GameMode, WordItem } from '../../types';
import { FlashcardExplorer } from './FlashcardExplorer';
import { SpellingBubbleGame } from './SpellingBubbleGame';
import { MemoryMatchGame } from './MemoryMatchGame';
import { ListeningQuizGame } from './ListeningQuizGame';
import { sounds } from '../../utils/audio';

interface VocabularyHubProps {
  packs: GamePack[];
  onReward: (stars: number, xp: number) => void;
  onOpenCreator: () => void;
  onFinishRound: () => void;
}

type TimePreset = 'normal' | 'fast' | 'relaxed';

export const VocabularyHub: React.FC<VocabularyHubProps> = ({
  packs,
  onReward,
  onOpenCreator,
  onFinishRound,
}) => {
  const [selectedPackId, setSelectedPackId] = useState<string>(packs[0]?.id || 'pack-animals');
  const [activeMode, setActiveMode] = useState<GameMode>('cards');

  // Time Challenge Mode State
  const [isTimeChallengeActive, setIsTimeChallengeActive] = useState(true);
  const [timePreset, setTimePreset] = useState<TimePreset>('normal');

  const selectedPack = packs.find((p) => p.id === selectedPackId) || packs[0];

  const handleSelectMode = (mode: GameMode) => {
    sounds.playClick();
    setActiveMode(mode);
  };

  const handleSelectPack = (packId: string) => {
    sounds.playClick();
    setSelectedPackId(packId);
  };

  const handleToggleTimeChallenge = () => {
    sounds.playClick();
    setIsTimeChallengeActive((prev) => !prev);
  };

  const handleSelectPreset = (preset: TimePreset) => {
    sounds.playClick();
    setTimePreset(preset);
  };

  // Time limits per game mode based on selected preset
  const getTimeLimit = (game: 'spelling' | 'memory' | 'listening') => {
    if (game === 'spelling') {
      if (timePreset === 'fast') return 15;
      if (timePreset === 'relaxed') return 35;
      return 25; // normal
    }
    if (game === 'memory') {
      if (timePreset === 'fast') return 40;
      if (timePreset === 'relaxed') return 85;
      return 60; // normal
    }
    if (game === 'listening') {
      if (timePreset === 'fast') return 10;
      if (timePreset === 'relaxed') return 22;
      return 15; // normal
    }
    return 20;
  };

  return (
    <div>
      {/* 1. Pack Selector Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-black text-slate-800">Choose a Word Topic to Play & Learn:</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Exciting vocabulary packs designed for children with real pronunciation, pictures, and phonics
            </p>
          </div>
          <button
            onClick={onOpenCreator}
            className="flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-100/80 hover:bg-amber-200/80 px-3 py-1.5 rounded-xl transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create New Pack</span>
          </button>
        </div>

        {/* Horizontal scrollable or flex wrap packs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {packs.map((pack) => {
            const isSelected = pack.id === selectedPackId;
            return (
              <button
                key={pack.id}
                onClick={() => handleSelectPack(pack.id)}
                onMouseEnter={() => sounds.playTick()}
                className={`group p-4 rounded-2xl border text-left cursor-pointer relative overflow-hidden transition-all duration-300 transform-gpu hover:-translate-y-2 hover:scale-[1.03] active:scale-95 ${
                  isSelected
                    ? 'bg-linear-to-br from-amber-500 to-orange-500 text-white border-amber-500 shadow-lg shadow-amber-500/25 ring-3 ring-amber-300'
                    : 'bg-white hover:bg-linear-to-b hover:from-white hover:to-amber-50/60 border-slate-200 text-slate-800 shadow-xs hover:shadow-xl hover:shadow-amber-200/50 hover:border-amber-400 hover:ring-2 hover:ring-amber-200/70'
                }`}
              >
                {/* Shimmer light sweep across card on hover */}
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-linear-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

                <div className="flex items-center gap-2.5 mb-2 relative z-10">
                  <span className="text-3xl transition-transform duration-300 group-hover:scale-130 group-hover:rotate-12 inline-block filter drop-shadow-xs">
                    {pack.icon}
                  </span>
                  <div>
                    <span className={`text-xs font-black block transition-colors ${isSelected ? 'text-white' : 'text-slate-800 group-hover:text-amber-800'}`}>
                      {pack.title}
                    </span>
                    <span className={`text-[10px] font-['Outfit'] font-semibold block transition-colors ${isSelected ? 'text-amber-100' : 'text-slate-400 group-hover:text-amber-700'}`}>
                      {pack.titleArabic || pack.category}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between relative z-10 pt-1.5 border-t border-black/5">
                  <span className={`text-[10px] font-mono font-bold uppercase transition-colors ${isSelected ? 'text-amber-100' : 'text-slate-400 group-hover:text-amber-600'}`}>
                    {pack.category}
                  </span>
                  <span className={`text-[10px] font-mono tabular-nums px-2 py-0.5 rounded-full font-bold transition-all duration-200 group-hover:scale-105 ${
                    isSelected
                      ? 'bg-white/25 text-white'
                      : 'bg-slate-100 text-slate-600 group-hover:bg-amber-100 group-hover:text-amber-900'
                  }`}>
                    {pack.words.length} كلمات 📝
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Time Challenge Mode Control Bar */}
      <div className="bg-linear-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-300/80 rounded-2xl p-4 mb-6 shadow-xs">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 ${
              isTimeChallengeActive
                ? 'bg-linear-to-br from-amber-500 to-orange-500 text-white shadow-md animate-pulse'
                : 'bg-slate-200 text-slate-500'
            }`}>
              {isTimeChallengeActive ? <Flame className="w-6 h-6 text-white" /> : <Timer className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-slate-800">
                  وضع تحدي الوقت (Time Challenge Mode) ⏱️
                </span>
                {isTimeChallengeActive && (
                  <span className="px-2 py-0.5 bg-amber-500 text-white rounded-full text-[10px] font-bold flex items-center gap-1 shadow-xs">
                    <Zap className="w-3 h-3 fill-current" />
                    <span>نقاط مضاعفة!</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                أكمل الكلمات والبطاقات قبل نفاد المؤقت البصري للفوز بنجوم إضافية ⭐ ونقاط خبرة XP!
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
            {/* Speed Presets */}
            {isTimeChallengeActive && (
              <div className="flex items-center gap-1 bg-white/80 p-1 rounded-xl border border-amber-200 text-xs font-bold">
                <button
                  onClick={() => handleSelectPreset('fast')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    timePreset === 'fast'
                      ? 'bg-rose-500 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="سريع: 15 ثانية للكلمة"
                >
                  ⚡ سريع
                </button>
                <button
                  onClick={() => handleSelectPreset('normal')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    timePreset === 'normal'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="متوازن: 25 ثانية للكلمة"
                >
                  🎯 متوازن
                </button>
                <button
                  onClick={() => handleSelectPreset('relaxed')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    timePreset === 'relaxed'
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="مرن: 35 ثانية للكلمة"
                >
                  🌱 مرن
                </button>
              </div>
            )}

            {/* Toggle switch button */}
            <button
              onClick={handleToggleTimeChallenge}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shadow-xs flex items-center gap-1.5 ${
                isTimeChallengeActive
                  ? 'bg-amber-500 hover:bg-amber-600 text-white'
                  : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
              }`}
            >
              <Timer className="w-3.5 h-3.5" />
              <span>{isTimeChallengeActive ? 'مفعّل ⏱️' : 'تفعيل التحدي ⚡'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Game Mode Selector Tabs */}
      <div className="bg-slate-100/90 p-1.5 rounded-2xl flex items-center justify-between gap-1 mb-8 max-w-2xl mx-auto shadow-inner">
        <button
          onClick={() => handleSelectMode('cards')}
          onMouseEnter={() => sounds.playTick()}
          className={`group flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer transform-gpu hover:-translate-y-0.5 active:scale-95 ${
            activeMode === 'cards'
              ? 'bg-white text-amber-700 shadow-sm scale-102 ring-1 ring-amber-200'
              : 'text-slate-600 hover:text-amber-700 hover:bg-white/70'
          }`}
        >
          <Layers className="w-4 h-4 transition-transform duration-200 group-hover:scale-125 group-hover:rotate-6 text-amber-600" />
          <span>Flashcards</span>
        </button>

        <button
          onClick={() => handleSelectMode('spelling')}
          onMouseEnter={() => sounds.playTick()}
          className={`group flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer transform-gpu hover:-translate-y-0.5 active:scale-95 ${
            activeMode === 'spelling'
              ? 'bg-white text-amber-700 shadow-sm scale-102 ring-1 ring-amber-200'
              : 'text-slate-600 hover:text-amber-700 hover:bg-white/70'
          }`}
        >
          <SpellCheck className="w-4 h-4 transition-transform duration-200 group-hover:scale-125 group-hover:rotate-6 text-amber-600" />
          <span>Spelling Bubbles</span>
        </button>

        <button
          onClick={() => handleSelectMode('memory')}
          onMouseEnter={() => sounds.playTick()}
          className={`group flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer transform-gpu hover:-translate-y-0.5 active:scale-95 ${
            activeMode === 'memory'
              ? 'bg-white text-amber-700 shadow-sm scale-102 ring-1 ring-amber-200'
              : 'text-slate-600 hover:text-amber-700 hover:bg-white/70'
          }`}
        >
          <Brain className="w-4 h-4 transition-transform duration-200 group-hover:scale-125 group-hover:rotate-6 text-amber-600" />
          <span>Memory Match</span>
        </button>

        <button
          onClick={() => handleSelectMode('listening')}
          onMouseEnter={() => sounds.playTick()}
          className={`group flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer transform-gpu hover:-translate-y-0.5 active:scale-95 ${
            activeMode === 'listening'
              ? 'bg-white text-amber-700 shadow-sm scale-102 ring-1 ring-amber-200'
              : 'text-slate-600 hover:text-amber-700 hover:bg-white/70'
          }`}
        >
          <Headphones className="w-4 h-4 transition-transform duration-200 group-hover:scale-125 group-hover:rotate-6 text-amber-600" />
          <span>Listening Quiz</span>
        </button>
      </div>

      {/* 4. Active Game Screen */}
      <div className="py-2">
        {activeMode === 'cards' && (
          <FlashcardExplorer words={selectedPack.words} onReward={onReward} />
        )}
        {activeMode === 'spelling' && (
          <SpellingBubbleGame
            words={selectedPack.words}
            onReward={onReward}
            onFinishRound={onFinishRound}
            isTimeChallengeActive={isTimeChallengeActive}
            timeLimit={getTimeLimit('spelling')}
          />
        )}
        {activeMode === 'memory' && (
          <MemoryMatchGame
            words={selectedPack.words}
            onReward={onReward}
            onFinishRound={onFinishRound}
            isTimeChallengeActive={isTimeChallengeActive}
            timeLimit={getTimeLimit('memory')}
          />
        )}
        {activeMode === 'listening' && (
          <ListeningQuizGame
            words={selectedPack.words}
            onReward={onReward}
            onFinishRound={onFinishRound}
            isTimeChallengeActive={isTimeChallengeActive}
            timeLimit={getTimeLimit('listening')}
          />
        )}
      </div>
    </div>
  );
};
