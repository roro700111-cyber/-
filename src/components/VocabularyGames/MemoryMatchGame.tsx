import React, { useState, useEffect } from 'react';
import { Volume2, RotateCcw, Sparkles, CheckCircle2, Zap } from 'lucide-react';
import { WordItem } from '../../types';
import { speakEnglish, sounds, playWordAudio } from '../../utils/audio';
import { TimeChallengeBar } from './TimeChallengeBar';

interface MemoryCard {
  id: string;
  wordId: string;
  type: 'english' | 'arabic';
  content: string;
  emoji?: string;
  isFlipped: boolean;
  isMatched: boolean;
  customAudioUrl?: string;
}

interface MemoryMatchGameProps {
  words: WordItem[];
  onReward: (stars: number, xp: number) => void;
  onFinishRound?: () => void;
  isTimeChallengeActive?: boolean;
  timeLimit?: number;
}

export const MemoryMatchGame: React.FC<MemoryMatchGameProps> = ({
  words,
  onReward,
  onFinishRound,
  isTimeChallengeActive = false,
  timeLimit = 60,
}) => {
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  // Time challenge state
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [bonusEarned, setBonusEarned] = useState<{ stars: number; xp: number } | null>(null);

  // Take up to 6 words for a 12-card grid (easy for kids)
  const gameWords = words.slice(0, 6);

  useEffect(() => {
    initGame();
  }, [words, timeLimit]);

  // Timer countdown
  useEffect(() => {
    if (!isTimeChallengeActive || isCompleted) return;
    if (timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimeChallengeActive, isCompleted, timeLeft]);

  const initGame = () => {
    const deck: MemoryCard[] = [];
    gameWords.forEach((w) => {
      deck.push({
        id: `eng-${w.id}`,
        wordId: w.id,
        type: 'english',
        content: w.english,
        customAudioUrl: w.customAudioUrl,
        isFlipped: false,
        isMatched: false,
      });
      deck.push({
        id: `ara-${w.id}`,
        wordId: w.id,
        type: 'arabic',
        content: w.arabic,
        emoji: w.emoji,
        isFlipped: false,
        isMatched: false,
      });
    });

    // Shuffle deck
    setCards(deck.sort(() => Math.random() - 0.5));
    setSelectedCards([]);
    setMoves(0);
    setIsCompleted(false);
    setIsLocked(false);
    setTimeLeft(timeLimit);
    setBonusEarned(null);
  };

  const handleCardClick = (index: number) => {
    if (isLocked || cards[index].isFlipped || cards[index].isMatched) return;

    sounds.playPop();

    // Flip the clicked card
    const newCards = [...cards];
    newCards[index].isFlipped = true;

    // If it's English, play custom voice recording or TTS!
    if (newCards[index].type === 'english') {
      if (newCards[index].customAudioUrl) {
        playWordAudio({ english: newCards[index].content, customAudioUrl: newCards[index].customAudioUrl });
      } else {
        speakEnglish(newCards[index].content);
      }
    }


    setCards(newCards);

    const newSelected = [...selectedCards, index];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      setMoves((m) => m + 1);
      setIsLocked(true);

      const [firstIdx, secondIdx] = newSelected;
      const firstCard = newCards[firstIdx];
      const secondCard = newCards[secondIdx];

      // Check match: same wordId and different types
      if (firstCard.wordId === secondCard.wordId && firstCard.type !== secondCard.type) {
        // Match!
        setTimeout(() => {
          sounds.playDing();
          sounds.playPointsStream(2);
          const matchedCards = [...newCards];
          matchedCards[firstIdx].isMatched = true;
          matchedCards[secondIdx].isMatched = true;
          setCards(matchedCards);
          setSelectedCards([]);
          setIsLocked(false);

          // Check if all matched
          const allMatched = matchedCards.every((c) => c.isMatched);
          if (allMatched) {
            setIsCompleted(true);
            const baseStars = 5;
            const baseXP = 30;

            if (isTimeChallengeActive && timeLeft > 0) {
              const speedBonusStars = 5;
              const speedBonusXP = 35;
              setBonusEarned({ stars: speedBonusStars, xp: speedBonusXP });
              sounds.playVictoryWin();
              sounds.playTimeBonus();
              onReward(baseStars + speedBonusStars, baseXP + speedBonusXP);
            } else {
              sounds.playVictoryWin();
              onReward(baseStars, baseXP);
            }

            if (onFinishRound) onFinishRound();
          }
        }, 500);
      } else {
        // Not a match, flip back
        setTimeout(() => {
          sounds.playError();
          const resetCards = [...newCards];
          resetCards[firstIdx].isFlipped = false;
          resetCards[secondIdx].isFlipped = false;
          setCards(resetCards);
          setSelectedCards([]);
          setIsLocked(false);
        }, 1100);
      }
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      {/* Header info */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-3 px-2">
        <span>Memory Match Game (Match words to pictures)</span>
        <div className="flex items-center gap-3">
          <span>Moves: <strong className="text-slate-800 font-mono tabular-nums">{moves}</strong></span>
          <button
            onClick={initGame}
            className="flex items-center gap-1 text-amber-700 hover:text-amber-800 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Game</span>
          </button>
        </div>
      </div>

      {/* Time Challenge Bar */}
      {isTimeChallengeActive && (
        <TimeChallengeBar
          timeLeft={timeLeft}
          totalDuration={timeLimit}
          isActive={isTimeChallengeActive}
          bonusStars={5}
          bonusXp={35}
          isCompleted={isCompleted}
          label="طابق جميع البطاقات قبل انتهاء المؤقت للفوز بكأس السرعة!"
        />
      )}

      {/* Grid of memory cards */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {cards.map((card, idx) => {
          const isRevealed = card.isFlipped || card.isMatched;
          return (
            <button
              key={card.id}
              onClick={() => handleCardClick(idx)}
              disabled={isRevealed || isLocked}
              className={`h-28 sm:h-32 rounded-2xl p-2 flex flex-col items-center justify-center transition-all cursor-pointer select-none text-center relative ${
                card.isMatched
                  ? 'bg-emerald-50 border-2 border-emerald-400 text-emerald-900 shadow-xs opacity-90'
                  : isRevealed
                  ? 'bg-white border-2 border-amber-400 shadow-md scale-102'
                  : 'bg-linear-to-br from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 border-2 border-amber-300 text-white shadow-sm hover:scale-102'
              }`}
            >
              {isRevealed ? (
                card.type === 'english' ? (
                  <div>
                    <span className="text-base sm:text-lg font-black text-amber-800 font-['Outfit'] block">
                      {card.content}
                    </span>
                    <span className="text-[10px] text-amber-600 block mt-1 font-semibold">Word</span>
                  </div>
                ) : (
                  <div>
                    <span className="text-3xl block mb-1">{card.emoji}</span>
                    <span className="text-sm sm:text-base font-black text-slate-800 block font-['Outfit']">
                      {card.content}
                    </span>
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <span className="text-2xl text-white/90">❓</span>
                  <span className="text-[10px] font-bold text-white/90 mt-1 font-['Outfit'] truncate max-w-[80px]">English With Rona</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Completion alert */}
      {isCompleted && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 text-center animate-in fade-in zoom-in-95">
          <div className="text-4xl mb-2">🎉</div>
          <h4 className="text-xl font-black text-emerald-800 mb-1">Super Memory Master!</h4>
          <p className="text-xs text-emerald-700 mb-2">
            You matched all cards in {moves} moves! +5 Stars ⭐ and +30 XP!
          </p>

          {bonusEarned && (
            <div className="bg-amber-100/90 border border-amber-300 text-amber-900 rounded-2xl p-3 mb-4 flex items-center justify-center gap-2 text-xs font-bold animate-pulse max-w-md mx-auto">
              <Zap className="w-5 h-5 text-amber-600 fill-amber-500 shrink-0" />
              <span>
                ⚡ فوز ساحق في تحدي الوقت! مكافأة إضافية: +{bonusEarned.stars} نجوم ⭐ و +{bonusEarned.xp} XP قبل انتهاء الوقت!
              </span>
            </div>
          )}

          <button
            onClick={initGame}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-sm transition-colors cursor-pointer"
          >
            Play Another Round 🔄
          </button>
        </div>
      )}
    </div>
  );
};
