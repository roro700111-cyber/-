import React, { useEffect, useRef } from 'react';
import { Timer, Flame, Sparkles, AlertTriangle, Zap, CheckCircle2 } from 'lucide-react';
import { sounds } from '../../utils/audio';

interface TimeChallengeBarProps {
  timeLeft: number;
  totalDuration: number;
  isActive: boolean;
  bonusStars?: number;
  bonusXp?: number;
  label?: string;
  isCompleted?: boolean;
}

export const TimeChallengeBar: React.FC<TimeChallengeBarProps> = ({
  timeLeft,
  totalDuration,
  isActive,
  bonusStars = 3,
  bonusXp = 20,
  label = 'أكمل الكلمة قبل انتهاء الوقت للفوز بنجوم إضافية!',
  isCompleted = false,
}) => {
  const previousTimeRef = useRef(timeLeft);

  // Sound warning on the final 4 seconds if not completed
  useEffect(() => {
    if (isActive && !isCompleted && timeLeft > 0 && timeLeft <= 4 && timeLeft !== previousTimeRef.current) {
      sounds.playTick();
    }
    previousTimeRef.current = timeLeft;
  }, [timeLeft, isActive, isCompleted]);

  if (!isActive) return null;

  const percentage = Math.max(0, Math.min(100, (timeLeft / totalDuration) * 100));
  const isTimeUp = timeLeft <= 0;
  const isUrgent = timeLeft > 0 && timeLeft <= 5;
  const isWarning = timeLeft > 5 && percentage < 40;

  // Dynamic colors for the progress bar
  let barGradient = 'from-emerald-400 to-teal-500';
  let badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
  let borderColor = 'border-emerald-200';

  if (isTimeUp) {
    barGradient = 'from-slate-300 to-slate-400';
    badgeColor = 'bg-slate-100 text-slate-600 border-slate-300';
    borderColor = 'border-slate-200';
  } else if (isUrgent) {
    barGradient = 'from-rose-500 to-red-600';
    badgeColor = 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse';
    borderColor = 'border-rose-300 ring-2 ring-rose-200';
  } else if (isWarning) {
    barGradient = 'from-amber-400 to-orange-500';
    badgeColor = 'bg-amber-100 text-amber-800 border-amber-300';
    borderColor = 'border-amber-200';
  }

  return (
    <div className={`w-full bg-white rounded-2xl p-3.5 sm:p-4 border shadow-xs transition-all mb-4 ${borderColor}`}>
      {/* Top row: Timer, Title, and Bonus Badge */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-black text-xs border font-mono tabular-nums ${badgeColor}`}
          >
            {isUrgent ? (
              <Flame className="w-4 h-4 text-rose-600 animate-bounce" />
            ) : (
              <Timer className="w-4 h-4" />
            )}
            <span className="text-sm font-black">{timeLeft}s</span>
          </div>

          <div className="text-right">
            <span className="text-xs font-black text-slate-800 flex items-center gap-1">
              <span>وضع تحدي الوقت</span>
              {isUrgent && <span className="text-rose-600 text-[10px] animate-pulse">⏰ أسرع يا بطل!</span>}
            </span>
            <span className="text-[11px] text-slate-500 font-medium hidden sm:inline-block">
              {label}
            </span>
          </div>
        </div>

        {/* Bonus reward preview */}
        <div className="flex items-center gap-1 text-[11px] font-black bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-xl shrink-0">
          <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
          <span>مكافأة السرعة:</span>
          <span className="text-amber-700 font-bold">+{bonusStars} ⭐</span>
          <span className="text-orange-600 font-bold hidden sm:inline">+{bonusXp} XP</span>
        </div>
      </div>

      {/* Visual Progress Bar */}
      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200/80 relative">
        <div
          className={`h-full rounded-full bg-linear-to-r ${barGradient} transition-all duration-300 ease-linear shadow-xs`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Bottom status alert / encouraging feedback */}
      <div className="flex items-center justify-between mt-2 text-[10px] font-bold text-slate-500">
        <span className="font-mono tabular-nums text-slate-400">
          الوقت المتبقي: {timeLeft} من {totalDuration} ثانية
        </span>

        {isCompleted ? (
          <span className="text-emerald-700 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>تم الإنجاز في الوقت القياسي!</span>
          </span>
        ) : isTimeUp ? (
          <span className="text-slate-500 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span>انتهى الوقت! يمكنك متابعة الحل لتعلّم الكلمة.</span>
          </span>
        ) : isUrgent ? (
          <span className="text-rose-600 font-black animate-pulse">
            تبقى أقل من 5 ثوانٍ!
          </span>
        ) : (
          <span className="text-teal-700">
            أنت سريع ومميز! 🚀
          </span>
        )}
      </div>
    </div>
  );
};
