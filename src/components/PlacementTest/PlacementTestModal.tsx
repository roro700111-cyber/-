import React, { useState } from 'react';
import { X, Volume2, Sparkles, Star, Award, CheckCircle2, ArrowRight, HelpCircle, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { speakEnglish, sounds } from '../../utils/audio';

interface PlacementQuestion {
  id: string;
  type: 'vocab' | 'phonics' | 'sentence' | 'spelling';
  promptArabic: string;
  promptEnglish: string;
  audioText: string;
  options: {
    id: string;
    text: string;
    arabic: string;
    emoji?: string;
    isCorrect: boolean;
  }[];
  hint?: string;
}

const PLACEMENT_QUESTIONS: PlacementQuestion[] = [
  {
    id: 'pq-1',
    type: 'vocab',
    promptArabic: 'استمع للكلمة واختر الصورة الصحيحة:',
    promptEnglish: 'Listen and choose the matching picture:',
    audioText: 'Apple',
    options: [
      { id: 'opt-1', text: 'Apple', arabic: 'تفاحة', emoji: '🍎', isCorrect: true },
      { id: 'opt-2', text: 'Banana', arabic: 'موز', emoji: '🍌', isCorrect: false },
      { id: 'opt-3', text: 'Orange', arabic: 'برتقال', emoji: '🍊', isCorrect: false },
      { id: 'opt-4', text: 'Car', arabic: 'سيارة', emoji: '🚗', isCorrect: false },
    ],
  },
  {
    id: 'pq-2',
    type: 'phonics',
    promptArabic: 'أي كلمة تبدأ بالصوت الإنجليزي /b/؟',
    promptEnglish: 'Which word starts with the /b/ sound?',
    audioText: 'Bear',
    options: [
      { id: 'opt-b1', text: 'Bear', arabic: 'دب', emoji: '🐻', isCorrect: true },
      { id: 'opt-b2', text: 'Cat', arabic: 'قطة', emoji: '🐱', isCorrect: false },
      { id: 'opt-b3', text: 'Dog', arabic: 'كلب', emoji: '🐶', isCorrect: false },
      { id: 'opt-b4', text: 'Sun', arabic: 'شمس', emoji: '☀️', isCorrect: false },
    ],
  },
  {
    id: 'pq-3',
    type: 'sentence',
    promptArabic: 'أكمل الجملة الإنجليزية بما يناسبها:',
    promptEnglish: 'The birds are ... high in the blue sky!',
    audioText: 'The birds are flying in the sky.',
    options: [
      { id: 'opt-c1', text: 'Flying', arabic: 'تطير 🦅', emoji: '🦅', isCorrect: true },
      { id: 'opt-c2', text: 'Swimming', arabic: 'تسبح 🐟', emoji: '🐟', isCorrect: false },
      { id: 'opt-c3', text: 'Sleeping', arabic: 'تنام 😴', emoji: '😴', isCorrect: false },
    ],
  },
  {
    id: 'pq-4',
    type: 'spelling',
    promptArabic: 'كيف نكتب كلمة "نجمة" بالإنجليزي بطريقة صحيحة؟',
    promptEnglish: 'How do you spell "Star"?',
    audioText: 'Star',
    options: [
      { id: 'opt-s1', text: 'S - T - A - R', arabic: 'نجمة ⭐', emoji: '⭐', isCorrect: true },
      { id: 'opt-s2', text: 'S - A - T - R', arabic: 'خطأ', emoji: '❌', isCorrect: false },
      { id: 'opt-s3', text: 'T - S - A - R', arabic: 'خطأ', emoji: '❌', isCorrect: false },
    ],
  },
  {
    id: 'pq-5',
    type: 'vocab',
    promptArabic: 'استمع للجملة واختر الصاروخ الفضائي:',
    promptEnglish: 'The space rocket is flying to the stars!',
    audioText: 'The space rocket is flying to the stars!',
    options: [
      { id: 'opt-r1', text: 'Rocket', arabic: 'صاروخ 🚀', emoji: '🚀', isCorrect: true },
      { id: 'opt-r2', text: 'Train', arabic: 'قطار 🚆', emoji: '🚆', isCorrect: false },
      { id: 'opt-r3', text: 'Boat', arabic: 'قارب ⛵', emoji: '⛵', isCorrect: false },
    ],
  },
];

interface PlacementTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  onCompleteTest: (result: {
    level: string;
    score: number;
    starsAwarded: number;
    xpAwarded: number;
  }) => void;
}

export const PlacementTestModal: React.FC<PlacementTestModalProps> = ({
  isOpen,
  onClose,
  studentName,
  onCompleteTest,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  if (!isOpen) return null;

  const currentQuestion = PLACEMENT_QUESTIONS[currentIndex];

  const handlePlayAudio = (text: string) => {
    sounds.playClick();
    speakEnglish(text);
  };

  const handleSelectOption = (optId: string, isCorrect: boolean) => {
    if (isAnswered) return;
    setSelectedOptionId(optId);
    setIsAnswered(true);

    if (isCorrect) {
      sounds.playDing();
      sounds.playPointsStream(2);
      setScore((prev) => prev + 1);
    } else {
      sounds.playError();
    }
  };

  const handleNext = () => {
    sounds.playClick();
    if (currentIndex < PLACEMENT_QUESTIONS.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOptionId(null);
      setIsAnswered(false);
    } else {
      // Completed all questions!
      finishTest(score);
    }
  };

  const finishTest = (finalScore: number) => {
    setIsFinished(true);
    sounds.playVictoryWin();
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    let levelName = 'مبتدئ رائع (Beginner Star 🌟)';
    let starsAwarded = 20;
    let xpAwarded = 50;

    if (finalScore >= 4) {
      levelName = 'بطل إنجليزي متقدم (English Champion 👑)';
      starsAwarded = 35;
      xpAwarded = 80;
    } else if (finalScore === 3) {
      levelName = 'مستكشف واعد (Rising Explorer 🚀)';
      starsAwarded = 25;
      xpAwarded = 60;
    }

    onCompleteTest({
      level: levelName,
      score: finalScore,
      starsAwarded,
      xpAwarded,
    });
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOptionId(null);
    setIsAnswered(false);
    setScore(0);
    setIsFinished(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border-4 border-amber-400 relative animate-in fade-in zoom-in-95 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {!isFinished ? (
          <div>
            {/* Header info */}
            <div className="flex items-center gap-3 mb-4 text-right">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-2xl shrink-0">
                🎯
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-amber-700 bg-amber-100/80 px-2.5 py-0.5 rounded-full">
                    اختبار تحديد المستوى (Placement Test)
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-500">
                    السؤال {currentIndex + 1} من {PLACEMENT_QUESTIONS.length}
                  </span>
                </div>
                <h3 className="text-base font-black text-slate-900 mt-0.5">
                  تقييم مهارات المفردات والنطق للطفل
                </h3>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-100 rounded-full h-2 mb-5 overflow-hidden">
              <div
                className="bg-linear-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / PLACEMENT_QUESTIONS.length) * 100}%` }}
              />
            </div>

            {/* Question Card */}
            <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-5 mb-5 text-center">
              <p className="text-sm font-bold text-slate-700 mb-1">
                {currentQuestion.promptArabic}
              </p>
              <p className="text-xs font-['Outfit'] font-semibold text-slate-500 mb-4" dir="ltr">
                {currentQuestion.promptEnglish}
              </p>

              {/* Audio Listen Button */}
              <button
                onClick={() => handlePlayAudio(currentQuestion.audioText)}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 mx-auto shadow-sm transition-transform hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Volume2 className="w-4 h-4 animate-pulse" />
                <span>استمع للنطق الإنجليزي 🔊</span>
              </button>
            </div>

            {/* Options Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {currentQuestion.options.map((opt) => {
                const isSelected = selectedOptionId === opt.id;
                let btnStyle = 'bg-white hover:bg-amber-50/70 border-slate-200 text-slate-800';
                if (isAnswered) {
                  if (opt.isCorrect) {
                    btnStyle = 'bg-emerald-500 text-white border-emerald-600 ring-2 ring-emerald-200 shadow-md';
                  } else if (isSelected) {
                    btnStyle = 'bg-rose-500 text-white border-rose-600';
                  } else {
                    btnStyle = 'bg-slate-50 opacity-40 border-slate-200 text-slate-400';
                  }
                }

                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectOption(opt.id, opt.isCorrect)}
                    disabled={isAnswered}
                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center relative ${btnStyle}`}
                  >
                    {opt.emoji && <span className="text-3xl mb-0.5">{opt.emoji}</span>}
                    <span className="font-['Outfit'] font-black text-sm">{opt.text}</span>
                    <span className="text-[11px] opacity-80">{opt.arabic}</span>
                  </button>
                );
              })}
            </div>

            {/* Footer action */}
            {isAnswered && (
              <button
                onClick={handleNext}
                className="w-full py-3 bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-md transition-all hover:scale-102 cursor-pointer"
              >
                <span>{currentIndex < PLACEMENT_QUESTIONS.length - 1 ? 'السؤال التالي' : 'عرض النتيجة والتكريم 🏆'}</span>
                <ArrowRight className="w-4 h-4 rotate-180" />
              </button>
            )}
          </div>
        ) : (
          /* Results View */
          <div className="text-center py-2">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-4xl mb-3 shadow-inner animate-bounce">
              🏆
            </div>

            <h3 className="text-2xl font-black text-slate-900 mb-1">
              مبارك يا بطل، اكتمل الاختبار! 🎉
            </h3>
            <p className="text-xs text-slate-600 max-w-sm mx-auto mb-4">
              تم تقييم مستواك بنجاح من قِبل المعلمة رانيا عزت وإضافة حزمة النجوم الأولية لملفك!
            </p>

            {/* Result Badge */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5 text-right space-y-3">
              <div className="flex items-center justify-between border-b border-amber-200/60 pb-2">
                <span className="text-xs text-slate-600 font-bold">اسم الطالب:</span>
                <span className="text-sm font-black text-slate-900">{studentName}</span>
              </div>
              <div className="flex items-center justify-between border-b border-amber-200/60 pb-2">
                <span className="text-xs text-slate-600 font-bold">النتيجة:</span>
                <span className="text-sm font-mono font-black text-amber-700">
                  {score} من {PLACEMENT_QUESTIONS.length} إجابات صحيحة
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-amber-200/60 pb-2">
                <span className="text-xs text-slate-600 font-bold">المستوى المشخص:</span>
                <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  {score >= 4 ? 'متقدم (Champion)' : score === 3 ? 'متوسط (Explorer)' : 'مبتدئ (Star)'}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-slate-600 font-bold">مكافأة البدء الممنوحة:</span>
                <div className="flex items-center gap-1.5 font-black text-amber-600 font-mono text-sm">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                  <span>+{score >= 4 ? 35 : score === 3 ? 25 : 20} نجمة أولية</span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-2xl font-black text-sm shadow-md transition-transform hover:scale-102 cursor-pointer"
              >
                ابدأ رحلة التعلم والمغامرة 🚀
              </button>
              <button
                onClick={handleRestart}
                className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition-colors cursor-pointer"
                title="إعادة الاختبار"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
