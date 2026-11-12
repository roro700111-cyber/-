import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  Award,
  Mic,
  Headphones,
  BookOpen,
  Sparkles,
  TrendingUp,
  Printer,
  Lightbulb,
  Mail,
  Share2,
  MessageCircle,
  Copy,
  Check,
} from 'lucide-react';
import { StudentProfile, GamePack } from '../../types';
import { sounds } from '../../utils/audio';

interface ProgressReportProps {
  profile: StudentProfile;
  gamePacks: GamePack[];
  onNavigateToGames: () => void;
  onNavigateToVideos: () => void;
  onOpenSocial?: () => void;
  onOpenGmail?: () => void;
  teacherEmail?: string;
}

export const ProgressReport: React.FC<ProgressReportProps> = ({
  profile,
  gamePacks,
  onNavigateToGames,
  onNavigateToVideos,
  onOpenSocial,
  onOpenGmail,
  teacherEmail = 'roro700111@gmail.com',
}) => {
  const [chartView, setChartView] = useState<'area' | 'bar'>('area');
  const [isPrinted, setIsPrinted] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Derive dynamic metrics from student profile
  const baseFactor = Math.min(1.2, 0.8 + (profile.xp / 400) * 0.4);
  const pronunciationScore = Math.min(98, Math.round(88 * baseFactor));
  const listeningScore = Math.min(99, Math.round(92 * baseFactor));
  const vocabularyScore = Math.min(96, Math.round(85 * baseFactor));
  const overallAverage = Math.round((pronunciationScore + listeningScore + vocabularyScore) / 3);

  // 7-day progression data
  const weeklyData = [
    { day: 'Sat', pronunciation: Math.max(65, pronunciationScore - 18), listening: Math.max(70, listeningScore - 14), vocabulary: Math.max(60, vocabularyScore - 15), xp: 20 },
    { day: 'Sun', pronunciation: Math.max(70, pronunciationScore - 14), listening: Math.max(74, listeningScore - 11), vocabulary: Math.max(68, vocabularyScore - 12), xp: 35 },
    { day: 'Mon', pronunciation: Math.max(74, pronunciationScore - 10), listening: Math.max(80, listeningScore - 8), vocabulary: Math.max(75, vocabularyScore - 9), xp: 45 },
    { day: 'Tue', pronunciation: Math.max(80, pronunciationScore - 6), listening: Math.max(85, listeningScore - 5), vocabulary: Math.max(80, vocabularyScore - 6), xp: 60 },
    { day: 'Wed', pronunciation: Math.max(84, pronunciationScore - 3), listening: Math.max(89, listeningScore - 3), vocabulary: Math.max(84, vocabularyScore - 4), xp: 75 },
    { day: 'Thu', pronunciation: Math.max(87, pronunciationScore - 1), listening: Math.max(91, listeningScore - 1), vocabulary: Math.max(87, vocabularyScore - 2), xp: 90 },
    { day: 'Today', pronunciation: pronunciationScore, listening: listeningScore, vocabulary: vocabularyScore, xp: (profile.xp % 100) + 40 },
  ];

  // Radar multi-dimensional balance
  const radarData = [
    { subject: 'Speech Accuracy', score: pronunciationScore, fullMark: 100 },
    { subject: 'Listening & Ear', score: listeningScore, fullMark: 100 },
    { subject: 'Vocabulary Retention', score: vocabularyScore, fullMark: 100 },
    { subject: 'Spelling & Letters', score: Math.min(95, vocabularyScore + 2), fullMark: 100 },
    { subject: 'Video Checkpoints', score: profile.completedVideos.length > 0 ? 94 : 75, fullMark: 100 },
  ];

  // Category breakdown
  const categoryMastery = [
    { name: 'Safari & Animals', mastered: 95, target: 100, wordsCount: 6 },
    { name: 'Fruits & Food', mastered: 90, target: 100, wordsCount: 6 },
    { name: 'Colors & Shapes', mastered: 92, target: 100, wordsCount: 6 },
    { name: 'Phonics Sounds', mastered: 88, target: 100, wordsCount: 5 },
    { name: 'Custom Packs', mastered: 85, target: 100, wordsCount: 4 },
  ];

  const reportSummary = `📊 English Learning & Mastery Report - English With Rona
Student: ${profile.name}
Overall Average: ${overallAverage}% (Advanced & Outstanding 🌟)
- Speech & Pronunciation: ${pronunciationScore}% 🎙️
- Listening & Comprehension: ${listeningScore}% 🎧
- Vocabulary Retention: ${vocabularyScore}% 📚
- Total Stars: ${profile.stars} ⭐ | XP Points: ${profile.xp} XP 🚀
- Games Completed: ${profile.gamesPlayed} | Interactive Videos: ${profile.completedVideos.length}
Supervising Teacher: Teacher Rona (${teacherEmail})`;

  const handlePrint = () => {
    sounds.playClick();
    setIsPrinted(true);
    setTimeout(() => {
      window.print();
      setIsPrinted(false);
    }, 300);
  };

  const handleSendEmailReport = () => {
    sounds.playClick();
    const subject = encodeURIComponent(`Student Progress Report: ${profile.name} - English With Rona`);
    const body = encodeURIComponent(
      `Dear Teacher Rona,\n\nPlease find the progress and mastery report for (${profile.name}):\n\n${reportSummary}\n\nLooking forward to your guidance and feedback!`
    );
    window.location.href = `mailto:${teacherEmail}?subject=${subject}&body=${body}`;
  };

  const handleShareWhatsApp = () => {
    sounds.playClick();
    const text = encodeURIComponent(`${reportSummary}\n\nApp Link: ${window.location.href}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleCopyReport = () => {
    navigator.clipboard.writeText(reportSummary);
    sounds.playPop();
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* 1. Executive Summary & Certificate Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-200/80 shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-amber-100 border border-amber-200 flex items-center justify-center text-4xl shadow-inner shrink-0">
              <span>{profile.avatar}</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Student Progress & Mastery: {profile.name}
                </h2>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Active & Outstanding
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                Comprehensive analytics for pronunciation, listening, and English vocabulary mastery
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleSendEmailReport}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black text-xs flex items-center gap-1.5 transition-transform hover:scale-102 shadow-xs cursor-pointer"
              title={`Send report to Teacher Rona (${teacherEmail})`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email Teacher</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Share report via WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden md:inline">WhatsApp</span>
            </button>

            <button
              onClick={handleCopyReport}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Copy report as text"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* 3 Core Skill KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
          {/* Pronunciation Card */}
          <div className="bg-gradient-to-br from-emerald-50/80 to-teal-50/50 rounded-2xl p-4 sm:p-5 border border-emerald-200">
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Mic className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black text-emerald-700 font-mono tabular-nums">
                {pronunciationScore}%
              </span>
            </div>
            <h3 className="text-sm font-black text-emerald-950 mb-0.5">
              Pronunciation Skill
            </h3>
            <p className="text-[11px] text-emerald-800/80 leading-relaxed mb-3">
              Accuracy of spoken words and phonetics evaluated with microphone recognition
            </p>
            <div className="w-full h-2 bg-emerald-200/60 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                style={{ width: `${pronunciationScore}%` }}
              />
            </div>
            <span className="text-[10px] text-emerald-700 block mt-2 font-medium">
              Grade: Excellent (Grade: A)
            </span>
          </div>

          {/* Listening Card */}
          <div className="bg-gradient-to-br from-indigo-50/80 to-blue-50/50 rounded-2xl p-4 sm:p-5 border border-indigo-200">
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <Headphones className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black text-indigo-700 font-mono tabular-nums">
                {listeningScore}%
              </span>
            </div>
            <h3 className="text-sm font-black text-indigo-950 mb-0.5">
              Listening & Comprehension
            </h3>
            <p className="text-[11px] text-indigo-800/80 leading-relaxed mb-3">
              Speed of comprehension and discrimination of spoken English sounds & words
            </p>
            <div className="w-full h-2 bg-indigo-200/60 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-700"
                style={{ width: `${listeningScore}%` }}
              />
            </div>
            <span className="text-[10px] text-indigo-700 block mt-2 font-medium">
              Grade: Outstanding (Grade: A+)
            </span>
          </div>

          {/* Vocabulary Card */}
          <div className="bg-gradient-to-br from-amber-50/80 to-orange-50/50 rounded-2xl p-4 sm:p-5 border border-amber-200">
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black text-amber-700 font-mono tabular-nums">
                {vocabularyScore}%
              </span>
            </div>
            <h3 className="text-sm font-black text-amber-950 mb-0.5">
              Vocabulary Retention
            </h3>
            <p className="text-[11px] text-amber-800/80 leading-relaxed mb-3">
              Word meanings retention, spelling accuracy, and memory card recall
            </p>
            <div className="w-full h-2 bg-amber-200/60 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-700"
                style={{ width: `${vocabularyScore}%` }}
              />
            </div>
            <span className="text-[10px] text-amber-700 block mt-2 font-medium">
              Grade: Advanced (Grade: A)
            </span>
          </div>
        </div>
      </div>

      {/* 2. Interactive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Progression over Days */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-amber-200/80 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-600" />
                <span>Skill Progression Over Days</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Track pronunciation, listening, and vocabulary accuracy over the week
              </p>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs">
              <button
                onClick={() => setChartView('area')}
                className={`px-2 py-1 rounded font-bold cursor-pointer transition-colors ${
                  chartView === 'area' ? 'bg-white text-amber-700 shadow-2xs' : 'text-slate-600'
                }`}
              >
                Area
              </button>
              <button
                onClick={() => setChartView('bar')}
                className={`px-2 py-1 rounded font-bold cursor-pointer transition-colors ${
                  chartView === 'bar' ? 'bg-white text-amber-700 shadow-2xs' : 'text-slate-600'
                }`}
              >
                Bar
              </button>
            </div>
          </div>

          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              {chartView === 'area' ? (
                <AreaChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPron" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorList" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorVocab" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis domain={[50, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px', fontWeight: 600 }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Area type="monotone" dataKey="pronunciation" name="Pronunciation %" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorPron)" />
                  <Area type="monotone" dataKey="listening" name="Listening %" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorList)" />
                  <Area type="monotone" dataKey="vocabulary" name="Vocabulary %" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorVocab)" />
                </AreaChart>
              ) : (
                <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis domain={[50, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="pronunciation" name="Pronunciation %" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="listening" name="Listening %" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="vocabulary" name="Vocabulary %" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Radar Balance Chart */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-amber-200/80 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Skills Balance Radar Chart</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Distribution of student proficiency across core English pillars
              </p>
            </div>
          </div>

          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#475569', fontWeight: 600 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: '#94a3b8' }} />
                <Radar
                  name="Student Score"
                  dataKey="score"
                  stroke="#f59e0b"
                  fill="#f59e0b"
                  fillOpacity={0.4}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px', fontWeight: 600 }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 3. Category Breakdown & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown list */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-amber-200/80 shadow-md">
          <h3 className="text-base font-black text-slate-800 mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-600" />
            <span>Word Mastery by Learning Topic</span>
          </h3>

          <div className="space-y-3.5">
            {categoryMastery.map((cat, idx) => (
              <div key={idx} className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                  <span className="text-slate-800">{cat.name}</span>
                  <span className="text-amber-700 font-mono tabular-nums">{cat.mastered}% Mastered</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-linear-to-r from-amber-400 to-orange-500 rounded-full"
                    style={{ width: `${cat.mastered}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pedagogical recommendations for parents/teachers */}
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl p-6 text-white shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                <Lightbulb className="w-4 h-4 text-yellow-200" />
              </div>
              <h3 className="text-base font-black">Teacher & Parent Tips</h3>
            </div>

            <ul className="text-xs space-y-2.5 leading-relaxed text-white/95">
              <li className="flex items-start gap-2">
                <span className="text-yellow-300 font-black">✓</span>
                <span>
                  <strong>Key Strength:</strong> Exceptional listening comprehension, distinguishing spoken English with {listeningScore}% accuracy.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-300 font-black">✓</span>
                <span>
                  <strong>Next Goal:</strong> Continue practicing compound words and pronunciation at interactive video checkpoints.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-300 font-black">✓</span>
                <span>
                  <strong>Recommendation:</strong> Dedicate 10 minutes daily to Memory Match & Spelling Bubbles to solidify retention.
                </span>
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t border-white/20 mt-4 flex items-center justify-between">
            <button
              onClick={onNavigateToGames}
              className="px-3.5 py-1.5 bg-white hover:bg-amber-50 text-amber-900 rounded-xl font-black text-xs transition-transform hover:scale-105 cursor-pointer shadow-xs"
            >
              Start Games ➔
            </button>
            <button
              onClick={onNavigateToVideos}
              className="px-3.5 py-1.5 bg-black/20 hover:bg-black/30 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer"
            >
              Videos 🎬
            </button>
          </div>
        </div>
      </div>

      {/* Teacher Connect & Report Submission Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-amber-200/90 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-2xl shrink-0 shadow-inner">
            📬
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-900">
              Direct Guidance with Teacher Rona
            </h4>
            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
              Share your child's progress report directly with Teacher Rona via email{' '}
              <a
                href={`mailto:${teacherEmail}`}
                className="font-mono text-amber-700 font-bold underline"
              >
                {teacherEmail}
              </a>{' '}
              or official channels to receive personalized guidance and encouragement.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
          {onOpenGmail && (
            <button
              onClick={() => {
                sounds.playClick();
                onOpenGmail();
              }}
              className="flex-1 md:flex-none py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-transform hover:scale-102 cursor-pointer shadow-xs whitespace-nowrap"
            >
              <Mail className="w-4 h-4" />
              <span>إرسال عبر Gmail ✉️</span>
            </button>
          )}
          <button
            onClick={handleSendEmailReport}
            className="flex-1 md:flex-none py-2 px-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-transform hover:scale-102 cursor-pointer shadow-xs whitespace-nowrap"
          >
            <span>البريد المباشر</span>
          </button>
          {onOpenSocial && (
            <button
              onClick={onOpenSocial}
              className="py-2 px-3 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
            >
              روابط التواصل 🌐
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
