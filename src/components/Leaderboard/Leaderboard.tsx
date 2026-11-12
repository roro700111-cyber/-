import React, { useState } from 'react';
import {
  Trophy,
  Medal,
  Star,
  Zap,
  Flame,
  Crown,
  Sparkles,
  ArrowUp,
  ThumbsUp,
  Award,
  TrendingUp,
} from 'lucide-react';
import { StudentProfile, LeaderboardStudent } from '../../types';
import { DEFAULT_LEADERBOARD_PEERS } from '../../data/initialData';
import { sounds } from '../../utils/audio';
import confetti from 'canvas-confetti';

interface LeaderboardProps {
  currentProfile: StudentProfile;
  onNavigateToGames: () => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  currentProfile,
  onNavigateToGames,
}) => {
  const [filterPeriod, setFilterPeriod] = useState<'weekly' | 'allTime'>('weekly');
  const [cheeredStudentId, setCheeredStudentId] = useState<string | null>(null);

  // Combine default peers with the current student profile dynamically
  const currentUserEntry: LeaderboardStudent = {
    id: 'current-user-student',
    name: `${currentProfile.name}`,
    avatar: currentProfile.avatar,
    xp: currentProfile.xp,
    stars: currentProfile.stars,
    streakDays: currentProfile.streakDays,
    badgeTitle: currentProfile.xp >= 200 ? 'نجم النطق الذهبي 🎙️' : 'مستكشف الكلمات 🧭',
    isCurrentUser: true,
  };

  // Adjust peers slightly based on period
  const peers: LeaderboardStudent[] = DEFAULT_LEADERBOARD_PEERS.map((p) => ({
    ...p,
    xp: filterPeriod === 'weekly' ? p.xp : Math.round(p.xp * 1.6 + 80),
    isCurrentUser: false,
  }));

  const allStudents = [...peers, currentUserEntry].sort((a, b) => b.xp - a.xp);
  const top5 = allStudents.slice(0, 5);

  // Find user rank
  const userRankIndex = allStudents.findIndex((s) => s.isCurrentUser);
  const userRank = userRankIndex + 1;
  const higherPeer = userRankIndex > 0 ? allStudents[userRankIndex - 1] : null;
  const xpDifferenceToNext = higherPeer ? higherPeer.xp - currentProfile.xp + 5 : 0;

  const handleCheer = (studentId: string, studentName: string) => {
    sounds.playStarCollect();
    setCheeredStudentId(studentId);
    confetti({
      particleCount: 35,
      spread: 50,
      origin: { y: 0.65 },
    });
    setTimeout(() => {
      setCheeredStudentId(null);
    }, 2200);
  };

  // Top 3 for podium
  const firstPlace = top5[0];
  const secondPlace = top5[1];
  const thirdPlace = top5[2];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header card */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-amber-200/80 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-3xl shadow-inner">
            <Trophy className="w-7 h-7 text-amber-600" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>Leaderboard</span>
              <span className="text-sm font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
                Top 5 Champions
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              Friendly competition celebrating student vocabulary and speech excellence
            </p>
          </div>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl shrink-0">
          <button
            onClick={() => {
              sounds.playClick();
              setFilterPeriod('weekly');
            }}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              filterPeriod === 'weekly'
                ? 'bg-white text-amber-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              setFilterPeriod('allTime');
            }}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              filterPeriod === 'allTime'
                ? 'bg-white text-amber-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All-Time
          </button>
        </div>
      </div>

      {/* Motivational Next Rank Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-2xl p-4 text-white shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shrink-0">
            {userRank === 1 ? '👑' : '🚀'}
          </div>
          <div>
            {userRank === 1 ? (
              <p className="text-sm font-black">
                Congratulations! You are in 1st Place at the top of the leaderboard! 🥇
              </p>
            ) : (
              <p className="text-sm font-black">
                Your current rank is #{userRank} — only{' '}
                <span className="font-mono tabular-nums text-yellow-200 underline font-extrabold">
                  {xpDifferenceToNext} XP
                </span>{' '}
                needed to reach #{userRank - 1}!
              </p>
            )}
            <p className="text-xs text-white/90 font-medium">
              Keep playing vocabulary challenges and interactive videos to earn more points!
            </p>
          </div>
        </div>

        <button
          onClick={onNavigateToGames}
          className="px-4 py-2 bg-white hover:bg-amber-50 text-amber-900 rounded-xl font-black text-xs shadow-xs transition-transform hover:scale-105 cursor-pointer shrink-0 flex items-center gap-1.5"
        >
          <span>Play & Earn XP Now</span>
          <ArrowUp className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Top 3 Podium Cards */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-4 items-end pt-4 pb-2">
        {/* 2nd Place */}
        {secondPlace && (
          <div
            className={`bg-white rounded-3xl p-3 sm:p-5 border text-center transition-all flex flex-col items-center justify-between shadow-xs ${
              secondPlace.isCurrentUser
                ? 'border-amber-400 ring-2 ring-amber-300 bg-amber-50/40'
                : 'border-slate-200'
            }`}
          >
            <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 text-xs font-black flex items-center justify-center mb-2">
              🥈 2
            </div>
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-3xl sm:text-4xl shadow-inner mb-2 border border-slate-200">
              <span>{secondPlace.avatar}</span>
            </div>
            <h4 className="text-xs sm:text-sm font-black text-slate-800 truncate max-w-full">
              {secondPlace.name}
            </h4>
            {secondPlace.isCurrentUser && (
              <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full mt-0.5">
                You ⭐
              </span>
            )}
            <div className="flex items-center gap-1 text-xs font-mono font-black text-slate-700 mt-2 tabular-nums">
              <Zap className="w-3.5 h-3.5 text-cyan-500 fill-cyan-400" />
              <span>{secondPlace.xp} XP</span>
            </div>
            <div className="h-12 sm:h-16 w-full bg-slate-100 rounded-xl mt-3 flex items-center justify-center text-xs font-bold text-slate-400">
              2nd Place
            </div>
          </div>
        )}

        {/* 1st Place (Winner Center) */}
        {firstPlace && (
          <div
            className={`bg-white rounded-3xl p-4 sm:p-6 border text-center transition-all flex flex-col items-center justify-between shadow-md relative -mt-4 ${
              firstPlace.isCurrentUser
                ? 'border-amber-500 ring-4 ring-amber-300/60 bg-amber-50/50'
                : 'border-amber-300'
            }`}
          >
            <div className="absolute -top-4 w-9 h-9 rounded-full bg-linear-to-r from-amber-400 to-yellow-500 text-amber-950 flex items-center justify-center shadow-md">
              <Crown className="w-5 h-5 fill-amber-950" />
            </div>
            <div className="w-8 h-8 rounded-full bg-amber-400 text-amber-950 text-xs font-black flex items-center justify-center mb-2 mt-1">
              🥇 1
            </div>
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-100 flex items-center justify-center text-4xl sm:text-5xl shadow-inner mb-2 border-2 border-amber-300 animate-float">
              <span>{firstPlace.avatar}</span>
            </div>
            <h4 className="text-sm sm:text-base font-black text-slate-900 truncate max-w-full">
              {firstPlace.name}
            </h4>
            {firstPlace.isCurrentUser ? (
              <span className="text-[10px] font-black text-amber-800 bg-amber-200 px-2 py-0.5 rounded-full mt-0.5">
                Champion 🏆
              </span>
            ) : (
              <span className="text-[10px] text-amber-700 font-bold mt-0.5">
                {firstPlace.badgeTitle}
              </span>
            )}
            <div className="flex items-center gap-1 text-sm font-mono font-black text-amber-700 mt-2 tabular-nums">
              <Zap className="w-4 h-4 text-amber-500 fill-amber-400" />
              <span>{firstPlace.xp} XP</span>
            </div>
            <div className="h-16 sm:h-24 w-full bg-linear-to-t from-amber-200 to-amber-100 rounded-xl mt-3 flex items-center justify-center text-xs font-black text-amber-900 border border-amber-300">
              1st Place 👑
            </div>
          </div>
        )}

        {/* 3rd Place */}
        {thirdPlace && (
          <div
            className={`bg-white rounded-3xl p-3 sm:p-5 border text-center transition-all flex flex-col items-center justify-between shadow-xs ${
              thirdPlace.isCurrentUser
                ? 'border-amber-400 ring-2 ring-amber-300 bg-amber-50/40'
                : 'border-slate-200'
            }`}
          >
            <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-900 text-xs font-black flex items-center justify-center mb-2">
              🥉 3
            </div>
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-orange-50 flex items-center justify-center text-3xl sm:text-4xl shadow-inner mb-2 border border-orange-200">
              <span>{thirdPlace.avatar}</span>
            </div>
            <h4 className="text-xs sm:text-sm font-black text-slate-800 truncate max-w-full">
              {thirdPlace.name}
            </h4>
            {thirdPlace.isCurrentUser && (
              <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full mt-0.5">
                You ⭐
              </span>
            )}
            <div className="flex items-center gap-1 text-xs font-mono font-black text-slate-700 mt-2 tabular-nums">
              <Zap className="w-3.5 h-3.5 text-cyan-500 fill-cyan-400" />
              <span>{thirdPlace.xp} XP</span>
            </div>
            <div className="h-10 sm:h-12 w-full bg-orange-100/60 rounded-xl mt-3 flex items-center justify-center text-xs font-bold text-orange-800">
              3rd Place
            </div>
          </div>
        )}
      </div>

      {/* Top 5 Full List */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-amber-200/80 shadow-md">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
          <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
            <Medal className="w-5 h-5 text-amber-600" />
            <span>Top 5 Student Standings</span>
          </h3>
          <span className="text-xs text-slate-400 font-medium">
            Updated in real-time after each activity
          </span>
        </div>

        <div className="space-y-2.5">
          {top5.map((student, idx) => {
            const rank = idx + 1;
            const isMe = student.isCurrentUser;

            return (
              <div
                key={student.id}
                className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  isMe
                    ? 'bg-amber-50/90 border-amber-400 shadow-xs ring-1 ring-amber-300'
                    : 'bg-slate-50/70 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {/* Left: Rank & Avatar & Name */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black font-mono shrink-0 ${
                      rank === 1
                        ? 'bg-amber-400 text-amber-950 font-extrabold shadow-xs'
                        : rank === 2
                        ? 'bg-slate-300 text-slate-800 font-extrabold'
                        : rank === 3
                        ? 'bg-amber-200 text-amber-900 font-extrabold'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank}
                  </div>

                  <div className="w-11 h-11 rounded-xl bg-white shadow-xs border border-slate-200 flex items-center justify-center text-2xl shrink-0">
                    <span>{student.avatar}</span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-black text-slate-800 truncate">
                        {student.name}
                      </span>
                      {isMe && (
                        <span className="text-[10px] font-black text-amber-800 bg-amber-200 px-2 py-0.5 rounded-full shrink-0">
                          (You)
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <span className="text-[11px]">{student.badgeTitle}</span>
                      <span>·</span>
                      <span className="flex items-center gap-0.5 text-orange-600 font-bold">
                        <Flame className="w-3 h-3 fill-orange-500" />
                        <span className="font-mono tabular-nums">{student.streakDays} days</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: XP Score & Cheer Button */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-base font-black text-slate-800 font-mono tabular-nums">
                      <Zap className="w-4 h-4 text-cyan-500 fill-cyan-400" />
                      <span>{student.xp}</span>
                    </div>
                    <div className="flex items-center justify-end gap-1 text-[11px] text-amber-600 font-semibold font-mono tabular-nums">
                      <Star className="w-3 h-3 fill-amber-400" />
                      <span>{student.stars}</span>
                    </div>
                  </div>

                  {!isMe && (
                    <button
                      onClick={() => handleCheer(student.id, student.name)}
                      className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        cheeredStudentId === student.id
                          ? 'bg-amber-500 text-white border-amber-600 scale-105'
                          : 'bg-white hover:bg-amber-50 text-slate-600 hover:text-amber-700 border-slate-200'
                      }`}
                      title="Cheer for your classmate!"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">
                        {cheeredStudentId === student.id ? 'Awesome! 👏' : 'Cheer'}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
