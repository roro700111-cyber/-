import React, { useState, useEffect } from 'react';
import { Volume2, Snail, CheckCircle2, XCircle, Sparkles, ArrowLeft, Zap } from 'lucide-react';
import { WordItem } from '../../types';
import { speakEnglish, sounds, playWordAudio } from '../../utils/audio';
import { TimeChallengeBar } from './TimeChallengeBar';

interface ListeningQuizGameProps {
  words: WordItem[];
  onReward: (stars: number, xp: number) => void;
  onFinishRound?: () => void;
  isTimeChallengeActive?: boolean;
  timeLimit?: number;
}

export const ListeningQuizGame: React.FC<ListeningQuizGameProps> = ({
  words,
  onReward,
  onFinishRound,
  isTimeChallengeActive = false,
  timeLimit = 15,
}) => {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [options, setOptions] = useState<WordItem[]>([]);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);

  // Time challenge state
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [bonusEarned, setBonusEarned] = useState<{ stars: number; xp: number } | null>(null);

  const currentWord = words[questionIndex];

  useEffect(() => {
    setupQuestion();
  }, [questionIndex, words, timeLimit]);

  // Timer countdown
  useEffect(() => {
    if (!isTimeChallengeActive || isAnswered) return;
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
  }, [isTimeChallengeActive, isAnswered, timeLeft]);

  const setupQuestion = () => {
    if (!currentWord) return;
    setIsAnswered(false);
    setSelectedOptionId(null);
    setTimeLeft(timeLimit);
    setBonusEarned(null);

    // Pick 3 distractors
    const otherWords = words.filter((w) => w.id !== currentWord.id);
    const shuffledOthers = [...otherWords].sort(() => Math.random() - 0.5).slice(0, 3);
    const currentOptions = [currentWord, ...shuffledOthers].sort(() => Math.random() - 0.5);

    setOptions(currentOptions);

    // Automatically speak the word using custom voice or fallback
    setTimeout(() => {
      playWordAudio(currentWord);
    }, 300);
  };

  const handleSelectOption = (word: WordItem) => {
    if (isAnswered) return;

    setSelectedOptionId(word.id);
    setIsAnswered(true);

    if (word.id === currentWord.id) {
      setScore((s) => s + 1);

      const baseStars = 2;
      const baseXP = 15;

      if (isTimeChallengeActive && timeLeft > 0) {
        const speedBonusStars = 2;
        const speedBonusXP = 15;
        setBonusEarned({ stars: speedBonusStars, xp: speedBonusXP });
        sounds.playTimeBonus();
        onReward(baseStars + speedBonusStars, baseXP + speedBonusXP);
      } else {
        sounds.playDing();
        sounds.playPointsStream(3);
        onReward(baseStars, baseXP);
      }
    } else {
      sounds.playError();
    }
  };

  const handleNextQuestion = () => {
    sounds.playClick();
    if (questionIndex < words.length - 1) {
      setQuestionIndex((prev) => prev + 1);
    } else {
      sounds.playVictoryWin();
      if (onFinishRound) onFinishRound();
      setQuestionIndex(0);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-3 px-2">
        <span>Listening & Ear Training Challenge</span>
        <div className="flex items-center gap-3">
          <span>
            Question {questionIndex + 1} of {words.length}
          </span>
          <span>
            Score: <strong className="text-amber-600 font-mono tabular-nums">{score}</strong>
          </span>
        </div>
      </div>

      {/* Time Challenge Bar */}
      {isTimeChallengeActive && (
        <TimeChallengeBar
          timeLeft={timeLeft}
          totalDuration={timeLimit}
          isActive={isTimeChallengeActive}
          bonusStars={2}
          bonusXp={15}
          isCompleted={isAnswered && selectedOptionId === currentWord.id}
          label="استمع واختر الكلمة أو الصورة الصحيحة قبل انتهاء المؤقت!"
        />
      )}

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-200/80 shadow-md text-center">
        {/* Big Audio Trigger Area */}
        <div className="my-2">
          <div className="flex items-center justify-center gap-2 mb-3">
            <p className="text-sm font-bold text-slate-700">
              Listen carefully and pick the matching picture or word:
            </p>
            {currentWord.customAudioUrl && (
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <span>🎙️</span>
                <span>Recorded Voice</span>
              </span>
            )}
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => playWordAudio(currentWord, false)}
              className="px-6 py-4 bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-2xl flex items-center gap-2.5 font-bold shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Volume2 className="w-6 h-6 animate-pulse" />
              <span className="text-base font-['Outfit']">
                {currentWord.customAudioUrl ? 'Play Voice Recording 🎙️' : 'Listen to Word 🔊'}
              </span>
            </button>

            <button
              onClick={() => playWordAudio(currentWord, true)}
              className="p-4 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-2xl transition-colors cursor-pointer"
              title="Listen slowly (Slow Phonics)"
            >
              <Snail className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* 4 Options Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 my-6">
          {options.map((opt) => {
            const isSelected = selectedOptionId === opt.id;
            const isCorrect = opt.id === currentWord.id;

            let cardStyle =
              'bg-slate-50 border-2 border-slate-200 hover:border-amber-400 hover:bg-amber-50/50';

            if (isAnswered) {
              if (isCorrect) {
                cardStyle = 'bg-emerald-50 border-2 border-emerald-500 text-emerald-900 shadow-md scale-102';
              } else if (isSelected) {
                cardStyle = 'bg-rose-50 border-2 border-rose-400 text-rose-900 opacity-80';
              } else {
                cardStyle = 'opacity-40 border-slate-200 bg-slate-50';
              }
            }

            return (
              <button
                key={opt.id}
                onClick={() => handleSelectOption(opt)}
                disabled={isAnswered}
                className={`p-4 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer ${cardStyle}`}
              >
                <span className="text-4xl mb-2">{opt.emoji}</span>
                <span className="text-base font-black text-slate-800 mb-0.5 font-['Outfit']">{opt.english}</span>
                {opt.arabic && opt.arabic !== opt.english && (
                  <span className="text-xs text-slate-400 block">
                    {opt.arabic}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Feedback area */}
        {isAnswered && (
          <div className="animate-in fade-in zoom-in-95 mt-4">
            {selectedOptionId === currentWord.id ? (
              <div className="space-y-2 mb-3">
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-3 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Correct and wonderful! The word is "{currentWord.english}" (+2 Stars ⭐)</span>
                </div>

                {bonusEarned && (
                  <div className="bg-amber-100/90 border border-amber-300 text-amber-900 rounded-xl p-2.5 flex items-center justify-center gap-2 text-xs font-bold animate-pulse">
                    <Zap className="w-4 h-4 text-amber-600 fill-amber-500" />
                    <span>
                      ⚡ سرعة فائقة! مكافأة تحدي الوقت: +{bonusEarned.stars} نجوم إضافية و +{bonusEarned.xp} XP!
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-rose-50 border border-rose-200 text-rose-900 p-3 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold mb-3">
                <XCircle className="w-5 h-5 text-rose-600" />
                <span>The correct word was: "{currentWord.english}"</span>
              </div>
            )}

            <button
              onClick={handleNextQuestion}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black shadow-sm transition-all hover:scale-105 cursor-pointer flex items-center gap-1.5 mx-auto"
            >
              <span>{questionIndex === words.length - 1 ? 'Finish Challenge 🎉' : 'Next Question'}</span>
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
