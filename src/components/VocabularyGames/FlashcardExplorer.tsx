import React, { useState } from 'react';
import {
  Volume2,
  Mic,
  MicOff,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  CheckCircle2,
  RotateCcw,
  Snail,
  AlertCircle,
  HelpCircle,
  Award,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { WordItem } from '../../types';
import {
  speakEnglish,
  listenPronunciation,
  sounds,
  playWordAudio,
  SpeechRecognitionResult,
} from '../../utils/audio';

interface FlashcardExplorerProps {
  words: WordItem[];
  onReward: (stars: number, xp: number) => void;
}

export const FlashcardExplorer: React.FC<FlashcardExplorerProps> = ({ words, onReward }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [micVolume, setMicVolume] = useState(0);
  const [pronunciationResult, setPronunciationResult] = useState<SpeechRecognitionResult | null>(null);

  const currentWord = words[currentIndex];

  const handleNext = () => {
    sounds.playClick();
    setPronunciationResult(null);
    setCurrentIndex((prev) => (prev + 1) % words.length);
  };

  const handlePrev = () => {
    sounds.playClick();
    setPronunciationResult(null);
    setCurrentIndex((prev) => (prev - 1 + words.length) % words.length);
  };

  const handleSpeak = (slow: boolean = false) => {
    sounds.playClick();
    playWordAudio(currentWord, slow);
  };

  const handleSpeakSentence = () => {
    if (currentWord.exampleSentence) {
      sounds.playClick();
      speakEnglish(currentWord.exampleSentence);
    }
  };

  const handleStartListening = async () => {
    setIsListening(true);
    setInterimText('استمع لك الآن... تحدّث بالإنجليزية بوضوح!');
    setPronunciationResult(null);
    setMicVolume(15);
    sounds.playClick();

    const res = await listenPronunciation(
      currentWord.english,
      (interim) => {
        setInterimText(interim);
      },
      (volume) => {
        setMicVolume(volume);
      }
    );

    setIsListening(false);
    setMicVolume(0);
    setPronunciationResult(res);

    if (res.isMatch) {
      if (res.score >= 90) {
        sounds.playVictoryWin();
        confetti({
          particleCount: 45,
          spread: 60,
          origin: { y: 0.6 },
        });
        onReward(3, 25);
      } else {
        sounds.playSuccess();
        sounds.playPointsStream(2);
        onReward(2, 15);
      }
    } else {
      if (res.accuracyTier !== 'no_speech') {
        sounds.playError();
      }
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      {/* Word Progress Indicator */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-3 px-2">
        <span>Word Card</span>
        <span className="font-mono tabular-nums">
          {currentIndex + 1} of {words.length}
        </span>
      </div>

      {/* Main Flashcard Container */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-200/80 shadow-md relative overflow-hidden transition-all text-center">
        {/* Top Tag & Actions */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-700 bg-amber-100/80 px-3 py-1 rounded-full uppercase tracking-wider">
              {currentWord.category}
            </span>
            {currentWord.customAudioUrl && (
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span>🎙️</span>
                <span>Recorded Voice</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleSpeak(true)}
              className="p-2 rounded-xl text-amber-700 hover:bg-amber-100/80 transition-colors cursor-pointer"
              title="Slow pronunciation"
            >
              <Snail className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleSpeak(false)}
              className="p-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white transition-colors cursor-pointer shadow-xs"
              title="Listen to English word"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Big Illustrated Emoji */}
        <div className="my-4">
          <div className="w-32 h-32 mx-auto rounded-3xl bg-amber-50 flex items-center justify-center text-6xl shadow-inner border border-amber-100/80 animate-float">
            <span>{currentWord.emoji}</span>
          </div>
        </div>

        {/* English Word & Phonetics */}
        <div className="mb-2">
          <h3 className="text-4xl sm:text-5xl font-black text-slate-800 tracking-tight font-['Outfit']">
            {currentWord.english}
          </h3>
          <p className="text-sm text-slate-400 font-mono mt-1" dir="ltr">
            {currentWord.phonetic}
          </p>
        </div>

        {/* Translation / Meaning subtitle */}
        {currentWord.arabic && currentWord.arabic !== currentWord.english && (
          <div className="my-2">
            <span className="text-xl font-bold text-amber-700/80">
              {currentWord.arabic}
            </span>
          </div>
        )}

        {/* Example Sentence with audio */}
        {currentWord.exampleSentence && (
          <div className="bg-amber-50/70 rounded-2xl p-3.5 my-4 border border-amber-200/50 text-left">
            <div className="flex items-start justify-between gap-3">
              <button
                onClick={handleSpeakSentence}
                className="p-1.5 rounded-lg bg-amber-200 hover:bg-amber-300 text-amber-900 transition-colors shrink-0 cursor-pointer"
                title="Listen to full sentence"
              >
                <Volume2 className="w-4 h-4" />
              </button>
              <div className="flex-1 text-left" dir="ltr">
                <p className="text-sm font-semibold text-slate-800 font-['Outfit']">
                  "{currentWord.exampleSentence}"
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Pronunciation Practice Section */}
        <div className="pt-4 border-t border-slate-100">
          <div className="flex flex-col items-center">
            {/* Action Microphone Button */}
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={handleStartListening}
                disabled={isListening}
                className={`px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2.5 transition-all cursor-pointer shadow-md ${
                  isListening
                    ? 'bg-rose-500 text-white animate-pulse ring-4 ring-rose-200 scale-105'
                    : 'bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white hover:scale-102'
                }`}
                title="تحدث بالإنجليزية عبر الميكروفون لقياس دقة نطقك"
              >
                {isListening ? (
                  <>
                    <MicOff className="w-5 h-5 animate-spin" />
                    <span>الميكروفون يستمع لك الآن... تكلّم!</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-5 h-5" />
                    <span>تدريب النطق بالصوت عبر الميكروفون 🎙️</span>
                  </>
                )}
              </button>

              <span className="text-[11px] text-slate-500 font-medium">
                انطق كلمة <strong className="text-amber-800 font-['Outfit'] font-black">"{currentWord.english}"</strong> بصوت واضح
              </span>
            </div>

            {/* Live Mic Audio Waves & Interim Transcript */}
            {isListening && (
              <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-2xl w-full max-w-sm text-center animate-fade-in space-y-2">
                <div className="flex items-center justify-center gap-1.5 h-7">
                  {[0.3, 0.6, 1.0, 0.8, 0.5, 0.9, 0.4, 0.7].map((multiplier, idx) => {
                    const waveHeight = Math.max(
                      8,
                      Math.min(28, Math.round((micVolume || 20) * multiplier * 0.35 + (idx % 2 ? 6 : 10)))
                    );
                    return (
                      <span
                        key={idx}
                        className="w-1.5 bg-rose-500 rounded-full transition-all duration-100"
                        style={{ height: `${waveHeight}px` }}
                      />
                    );
                  })}
                </div>

                <div className="text-xs font-bold text-rose-800">
                  {interimText ? `"${interimText}"` : 'تحدث الآن... الميكروفون يلتقط صوتك 🎙️'}
                </div>
                <p className="text-[10px] text-rose-600">
                  {micVolume > 5 ? '🔊 الصوت مسموع وجاري تقييمه بدقة...' : '👂 في انتظار بدء كلامك...'}
                </p>
              </div>
            )}

            {/* Accurate Pronunciation Feedback Result */}
            {pronunciationResult && (
              <div
                className={`mt-3.5 p-4 rounded-2xl w-full border text-right transition-all animate-fade-in shadow-xs ${
                  pronunciationResult.accuracyTier === 'no_speech'
                    ? 'bg-amber-50/90 border-amber-300 text-amber-950'
                    : pronunciationResult.isMatch
                    ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
                    : 'bg-rose-50/90 border-rose-300 text-rose-950'
                }`}
              >
                {/* Result Header */}
                <div className="flex items-center justify-between border-b pb-2 mb-2.5 border-black/10">
                  <div className="flex items-center gap-2">
                    {pronunciationResult.isMatch ? (
                      <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-black shadow-xs">
                        ✓
                      </span>
                    ) : pronunciationResult.accuracyTier === 'no_speech' ? (
                      <AlertCircle className="w-5 h-5 text-amber-600" />
                    ) : (
                      <span className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs font-black shadow-xs">
                        ✕
                      </span>
                    )}
                    <span className="text-xs sm:text-sm font-black">
                      {pronunciationResult.isMatch
                        ? 'نتيجة التقييم: نطق ممتاز وناجح! ⭐'
                        : pronunciationResult.accuracyTier === 'no_speech'
                        ? 'تنبيه: لم يتم التقاط صوت واضح 🔇'
                        : 'نتيجة التقييم: الكلمة غير متطابقة 🔄'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-slate-500">الدقة:</span>
                    <span
                      className={`text-sm font-mono font-black px-2 py-0.5 rounded-lg ${
                        pronunciationResult.isMatch
                          ? 'bg-emerald-200 text-emerald-900'
                          : pronunciationResult.accuracyTier === 'no_speech'
                          ? 'bg-amber-200 text-amber-900'
                          : 'bg-rose-200 text-rose-900'
                      }`}
                    >
                      {pronunciationResult.score}%
                    </span>
                  </div>
                </div>

                {/* Feedback Message */}
                <p className="text-xs font-bold leading-relaxed mb-3">
                  {pronunciationResult.feedbackArabic}
                </p>

                {/* Detailed Comparison Table */}
                <div className="bg-white/80 rounded-xl p-2.5 border border-black/5 text-xs grid grid-cols-2 gap-2 mb-3">
                  <div className="border-l border-slate-200 pl-2">
                    <span className="text-[10px] text-slate-500 font-bold block mb-0.5">
                      الكلمة المطلوبة:
                    </span>
                    <span className="font-black text-amber-900 font-['Outfit'] text-sm">
                      {currentWord.english}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block mb-0.5">
                      الصوت المسموع من الميكروفون:
                    </span>
                    <span className="font-bold text-slate-800 font-['Outfit'] text-sm">
                      {pronunciationResult.text ? `"${pronunciationResult.text}"` : '— لا يوجد صوت —'}
                    </span>
                  </div>
                </div>

                {/* Action Shortcuts for Student */}
                <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => handleSpeak(false)}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                    title="الاستماع للنطق الصحيح"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-amber-600" />
                    <span>استمع للنطق الصحيح</span>
                  </button>

                  <button
                    onClick={() => handleSpeak(true)}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                    title="الاستماع ببطء"
                  >
                    <Snail className="w-3.5 h-3.5 text-amber-600" />
                    <span>استمع ببطء</span>
                  </button>

                  <button
                    onClick={handleStartListening}
                    className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>إعادة المحاولة 🎙️</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between mt-5 gap-3">
        <button
          onClick={handlePrev}
          className="px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 font-bold text-sm flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous Word</span>
        </button>

        <button
          onClick={() => handleSpeak(false)}
          className="p-3 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-full transition-colors cursor-pointer"
          title="Replay word"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={handleNext}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 rounded-2xl text-white font-bold text-sm flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
        >
          <span>Next Word</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
