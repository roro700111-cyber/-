import React, { useState, useEffect } from 'react';
import { Volume2, RotateCcw, CheckCircle, Sparkles, HelpCircle, Zap } from 'lucide-react';
import { WordItem } from '../../types';
import { speakEnglish, sounds, playWordAudio } from '../../utils/audio';
import { TimeChallengeBar } from './TimeChallengeBar';

interface SpellingBubbleGameProps {
  words: WordItem[];
  onReward: (stars: number, xp: number) => void;
  onFinishRound?: () => void;
  isTimeChallengeActive?: boolean;
  timeLimit?: number;
}

interface LetterBubble {
  id: string;
  char: string;
  isUsed: boolean;
}

export const SpellingBubbleGame: React.FC<SpellingBubbleGameProps> = ({
  words,
  onReward,
  onFinishRound,
  isTimeChallengeActive = false,
  timeLimit = 25,
}) => {
  const [wordIndex, setWordIndex] = useState(0);
  const [bubbles, setBubbles] = useState<LetterBubble[]>([]);
  const [selectedLetters, setSelectedLetters] = useState<string[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Time challenge state
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [bonusEarned, setBonusEarned] = useState<{ stars: number; xp: number } | null>(null);

  const currentWord = words[wordIndex];
  const targetChars = currentWord.english.toUpperCase().split('');

  // Setup bubbles and reset timer whenever currentWord changes
  useEffect(() => {
    setupWord(currentWord);
  }, [wordIndex, currentWord, timeLimit]);

  // Countdown timer for Time Challenge
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

  const setupWord = (word: WordItem) => {
    const chars = word.english.toUpperCase().split('');
    // Scramble letters
    const scrambled = [...chars]
      .map((char, index) => ({ id: `${char}-${index}-${Math.random()}`, char, isUsed: false }))
      .sort(() => Math.random() - 0.5);

    setBubbles(scrambled);
    setSelectedLetters([]);
    setIsCompleted(false);
    setShowHint(false);
    setTimeLeft(timeLimit);
    setBonusEarned(null);

    // Speak word initially using custom voice or fallback
    playWordAudio(word);
  };

  const handleLetterClick = (bubble: LetterBubble) => {
    if (bubble.isUsed || isCompleted) return;

    sounds.playPop();

    // Check if clicking this letter fits in the sequence
    const nextIndex = selectedLetters.length;
    const expectedChar = targetChars[nextIndex];

    if (bubble.char === expectedChar) {
      // Correct letter in order!
      const nextSelected = [...selectedLetters, bubble.char];
      setSelectedLetters(nextSelected);

      setBubbles((prev) =>
        prev.map((b) => (b.id === bubble.id ? { ...b, isUsed: true } : b))
      );

      // Check if word is completed
      if (nextSelected.length === targetChars.length) {
        setIsCompleted(true);

        const baseStars = 3;
        const baseXP = 20;

        // Check if finished before timer ran out in Time Challenge
        if (isTimeChallengeActive && timeLeft > 0) {
          const speedBonusStars = 3;
          const speedBonusXP = 20;
          setBonusEarned({ stars: speedBonusStars, xp: speedBonusXP });
          sounds.playTimeBonus();
          onReward(baseStars + speedBonusStars, baseXP + speedBonusXP);
        } else {
          sounds.playDing();
          sounds.playPointsStream(3);
          onReward(baseStars, baseXP);
        }
      }
    } else {
      // Wrong letter selected
      sounds.playError();
    }
  };

  const handleResetCurrentWord = () => {
    sounds.playClick();
    setupWord(currentWord);
  };

  const handleNextWord = () => {
    sounds.playClick();
    if (wordIndex < words.length - 1) {
      setWordIndex((prev) => prev + 1);
    } else {
      sounds.playVictoryWin();
      if (onFinishRound) onFinishRound();
      setWordIndex(0);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      {/* Progress header */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-3 px-2">
        <span>Spelling Bubble Challenge & Letter Ordering</span>
        <span className="font-mono tabular-nums">
          Word {wordIndex + 1} of {words.length}
        </span>
      </div>

      {/* Time Challenge Bar */}
      {isTimeChallengeActive && (
        <TimeChallengeBar
          timeLeft={timeLeft}
          totalDuration={timeLimit}
          isActive={isTimeChallengeActive}
          bonusStars={3}
          bonusXp={20}
          isCompleted={isCompleted}
          label="أكمل تهجئة الكلمة قبل انتهاء الوقت للفوز بمكافأة السرعة!"
        />
      )}

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-200/80 shadow-md text-center">
        {/* Top bar with audio trigger */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setShowHint(!showHint)}
            className="flex items-center gap-1 text-xs text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{showHint ? `Next letter: ${targetChars[selectedLetters.length] || 'Complete'}` : 'Hint'}</span>
          </button>

          <button
            onClick={() => playWordAudio(currentWord)}
            className="p-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-colors cursor-pointer shadow-xs flex items-center gap-1.5 text-xs font-bold"
            title={currentWord.customAudioUrl ? 'Listen to recorded audio' : 'Listen to English pronunciation'}
          >
            <Volume2 className="w-4 h-4" />
            <span>{currentWord.customAudioUrl ? 'Recorded Voice 🎙️' : 'Listen 🔊'}</span>
          </button>
        </div>

        {/* Word Picture & Meaning */}
        <div className="w-24 h-24 mx-auto rounded-3xl bg-amber-50/90 border border-amber-200/70 flex items-center justify-center text-5xl mb-3 shadow-inner">
          <span>{currentWord.emoji}</span>
        </div>
        <h3 className="text-2xl font-black text-slate-800 mb-1 font-['Outfit']">{currentWord.english}</h3>
        <p className="text-xs text-slate-400 font-mono mb-6" dir="ltr">
          {currentWord.phonetic}
        </p>

        {/* Target letter slots */}
        <div className="flex items-center justify-center gap-2 mb-8 flex-wrap" dir="ltr">
          {targetChars.map((_, idx) => {
            const letter = selectedLetters[idx];
            return (
              <div
                key={idx}
                className={`w-12 h-14 rounded-2xl flex items-center justify-center text-2xl font-black font-['Outfit'] transition-all ${
                  letter
                    ? 'bg-amber-500 text-white shadow-md scale-105 border-2 border-amber-400'
                    : 'bg-slate-100 border-2 border-dashed border-slate-300 text-slate-400'
                }`}
              >
                {letter || ''}
              </div>
            );
          })}
        </div>

        {/* Letter Bubbles to click */}
        <div className="mb-8">
          <p className="text-xs text-slate-500 font-semibold mb-3">
            Tap the bubbles in the correct order to spell the word:
          </p>
          <div className="flex items-center justify-center gap-2.5 flex-wrap" dir="ltr">
            {bubbles.map((bubble) => (
              <button
                key={bubble.id}
                onClick={() => handleLetterClick(bubble)}
                disabled={bubble.isUsed || isCompleted}
                className={`w-12 h-12 rounded-2xl text-xl font-black font-['Outfit'] transition-all cursor-pointer ${
                  bubble.isUsed
                    ? 'opacity-25 bg-slate-200 text-slate-400 cursor-not-allowed scale-90'
                    : 'bg-linear-to-b from-amber-400 to-orange-500 text-white shadow-md hover:scale-110 active:scale-95 hover:shadow-lg border-b-4 border-orange-600'
                }`}
              >
                {bubble.char}
              </button>
            ))}
          </div>
        </div>

        {/* Completion status */}
        {isCompleted && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-center gap-2 text-emerald-800 font-black text-lg mb-1">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
              <span>Great job! Perfect spelling ⭐ +3 Stars</span>
            </div>

            {bonusEarned && (
              <div className="bg-amber-100/80 border border-amber-300 text-amber-900 rounded-xl p-2.5 my-2 flex items-center justify-center gap-2 text-xs font-bold animate-pulse">
                <Zap className="w-4 h-4 text-amber-600 fill-amber-500" />
                <span>
                  ⚡ مكافأة تحدي الوقت الاستثنائية: +{bonusEarned.stars} نجوم إضافية و +{bonusEarned.xp} XP! أنجزتها قبل انتهاء المؤقت!
                </span>
              </div>
            )}

            <p className="text-xs text-emerald-700">
              Word <span className="font-bold font-['Outfit']">{currentWord.english}</span> spelled successfully!
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            onClick={handleResetCurrentWord}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>

          <button
            onClick={handleNextWord}
            disabled={!isCompleted}
            className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              isCompleted
                ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm hover:scale-105'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            {wordIndex === words.length - 1 ? 'Finish Round 🎉' : 'Next Word ➔'}
          </button>
        </div>
      </div>
    </div>
  );
};
