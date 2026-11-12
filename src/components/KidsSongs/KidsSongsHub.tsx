import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Repeat,
  Sparkles,
  Volume2,
  Music2,
  SkipForward,
  SkipBack,
  Star,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { EducationalSong, SongLyricLine } from '../../types';
import { EDUCATIONAL_SONGS } from '../../data/songsData';
import { songPlayer, SongPlayerUpdate } from '../../utils/songAudioPlayer';
import { sounds } from '../../utils/audio';

interface KidsSongsHubProps {
  onReward: (stars: number, xp: number) => void;
}

export const KidsSongsHub: React.FC<KidsSongsHubProps> = ({ onReward }) => {
  const [selectedSongId, setSelectedSongId] = useState<string>(EDUCATIONAL_SONGS[0].id);
  const [playerState, setPlayerState] = useState<SongPlayerUpdate>({
    state: 'idle',
    currentTime: 0,
    currentLineIndex: 0,
    isLooping: true,
    playbackSpeed: 1.0,
  });
  const [completedSongs, setCompletedSongs] = useState<string[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);

  const activeSong = EDUCATIONAL_SONGS.find((s) => s.id === selectedSongId) || EDUCATIONAL_SONGS[0];
  const activeLineRef = useRef<HTMLDivElement>(null);

  // Subscribe to song player updates
  useEffect(() => {
    const unsub = songPlayer.subscribe((update) => {
      setPlayerState(update);

      if (update.state === 'completed') {
        handleSongCompleted(selectedSongId);
      }
    });

    return () => {
      unsub();
      songPlayer.stop();
    };
  }, [selectedSongId]);

  // Auto-scroll to active lyric line smoothly
  useEffect(() => {
    if (activeLineRef.current && playerState.state === 'playing') {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [playerState.currentLineIndex, playerState.state]);

  const handleSelectSong = (song: EducationalSong) => {
    sounds.playClick();
    songPlayer.stop();
    setSelectedSongId(song.id);
    songPlayer.play(song, playerState.isLooping);
  };

  const handleTogglePlay = () => {
    sounds.playClick();
    if (playerState.state === 'playing') {
      songPlayer.pause();
    } else if (playerState.state === 'paused') {
      songPlayer.resume();
    } else {
      songPlayer.play(activeSong, playerState.isLooping);
    }
  };

  const handleRestart = () => {
    sounds.playClick();
    songPlayer.stop();
    songPlayer.play(activeSong, playerState.isLooping);
  };

  const handleToggleLoop = () => {
    sounds.playClick();
    songPlayer.toggleLoop();
  };

  const handleNextSong = () => {
    sounds.playClick();
    const currentIndex = EDUCATIONAL_SONGS.findIndex((s) => s.id === selectedSongId);
    const nextSong = EDUCATIONAL_SONGS[(currentIndex + 1) % EDUCATIONAL_SONGS.length];
    handleSelectSong(nextSong);
  };

  const handlePrevSong = () => {
    sounds.playClick();
    const currentIndex = EDUCATIONAL_SONGS.findIndex((s) => s.id === selectedSongId);
    const prevSong =
      EDUCATIONAL_SONGS[(currentIndex - 1 + EDUCATIONAL_SONGS.length) % EDUCATIONAL_SONGS.length];
    handleSelectSong(prevSong);
  };

  const handleSpeedChange = (speed: number) => {
    sounds.playClick();
    songPlayer.setSpeed(speed);
  };

  const handleLineClick = (index: number) => {
    sounds.playClick();
    songPlayer.jumpToLine(index);
  };

  const handleSongCompleted = (songId: string) => {
    if (!completedSongs.includes(songId)) {
      setCompletedSongs((prev) => [...prev, songId]);
    }
    setShowCelebration(true);
    sounds.playVictoryWin();
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
    });
    onReward(5, 25);
    setTimeout(() => setShowCelebration(false), 5000);
  };

  const currentLine = activeSong.lyrics[playerState.currentLineIndex] || activeSong.lyrics[0];
  const progressPercent = Math.min(
    100,
    Math.round((playerState.currentTime / activeSong.durationSeconds) * 100)
  );

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-amber-200/80 shadow-md flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-700 bg-amber-100/90 w-fit px-3 py-1 rounded-full mb-2">
            <Music2 className="w-3.5 h-3.5 animate-bounce" />
            <span>أغاني تفاعلية لتعليم اللغة الإنجليزية للأطفال</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
            استوديو أغاني الأطفال التفاعلية 🎵
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 max-w-xl leading-relaxed">
            استمع وغنِّ مع 5 أغاني تعليمية مميزة تركز على الألوان والأرقام والحيوانات والفواكه والتحيات اليومية، مع كلمات تفاعلية متحركة وميزة التكرار المستمر!
          </p>
        </div>

        {/* Mascot & Badges */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-amber-300 ring-2 ring-amber-100 shadow-md bg-slate-900">
            <img
              src="/assets/aistudio/WhatsApp_Image_2026-11-05_at_23.16.55_6a80a945.jpeg"
              alt="English With Rona - شخصية المعلمة رانيا عزت"
              className="w-full h-full object-cover object-top"
            />
          </div>
          <div className="text-right">
            <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full block w-fit mb-1">
              مكافأة الغناء: +5 ⭐
            </span>
            <span className="text-xs font-black text-slate-700 block">
              أغانٍ تم إتقانها: {completedSongs.length} من {EDUCATIONAL_SONGS.length}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Song Selector Grid */}
      <div>
        <h3 className="text-sm font-black text-slate-700 mb-3 px-1">
          اختر أغنية للبدء في الغناء والتعلّم:
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {EDUCATIONAL_SONGS.map((song) => {
            const isSelected = song.id === selectedSongId;
            const isMastered = completedSongs.includes(song.id);

            return (
              <button
                key={song.id}
                onClick={() => handleSelectSong(song)}
                className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'bg-amber-500 text-white border-amber-600 shadow-md scale-102 ring-2 ring-amber-300'
                    : 'bg-white hover:bg-amber-50/60 border-slate-200 text-slate-800 shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="text-3xl">{song.icon}</span>
                    {isMastered && (
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-100 p-1 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                  <h4
                    className={`text-xs font-black font-['Outfit'] line-clamp-1 mb-0.5 ${
                      isSelected ? 'text-white' : 'text-slate-800'
                    }`}
                  >
                    {song.title}
                  </h4>
                  <p
                    className={`text-[11px] font-bold line-clamp-1 ${
                      isSelected ? 'text-amber-100' : 'text-slate-500'
                    }`}
                  >
                    {song.titleArabic}
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between text-[10px] font-mono font-bold">
                  <span
                    className={`px-1.5 py-0.5 rounded-md ${
                      isSelected ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {song.themeArabic}
                  </span>
                  <span className={isSelected ? 'text-amber-100' : 'text-slate-400'}>
                    {song.durationSeconds}s
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Main Stage: Interactive Song Player & Moving Lyrics */}
      <div className="bg-white rounded-3xl p-5 sm:p-8 border border-amber-200/80 shadow-lg">
        {/* Stage Header Info */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3 text-center sm:text-right">
            <div
              className={`w-14 h-14 rounded-2xl bg-linear-to-br ${activeSong.gradient} text-white flex items-center justify-center text-3xl shadow-md shrink-0 ${
                playerState.state === 'playing' ? 'animate-bounce' : ''
              }`}
            >
              {activeSong.icon}
            </div>
            <div>
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-['Outfit']">
                  {activeSong.title}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full">
                  {activeSong.themeArabic}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {activeSong.titleArabic} · {activeSong.musicalStyle}
              </p>
            </div>
          </div>

          {/* Quick Repeat / Loop status indicator */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleLoop}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                playerState.isLooping
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
              title="تفعيل أو تعطيل تكرار الأغنية تلقائياً"
            >
              <Repeat className={`w-3.5 h-3.5 ${playerState.isLooping ? 'animate-spin' : ''}`} />
              <span>{playerState.isLooping ? 'تكرار مستمر 🔁' : 'تشغيل لمرة واحدة'}</span>
            </button>
          </div>
        </div>

        {/* 4. Animated Dance Stage (Dynamic visuals & bouncing character) */}
        <div
          className={`my-6 rounded-3xl p-6 sm:p-8 text-center relative overflow-hidden bg-linear-to-b from-amber-50 to-orange-50/60 border border-amber-200/80 transition-all ${
            playerState.state === 'playing' ? 'ring-2 ring-amber-300' : ''
          }`}
        >
          {/* Floating background musical notes */}
          <div className="absolute top-3 left-4 text-2xl text-amber-300/80 animate-float">🎵</div>
          <div className="absolute top-6 right-8 text-xl text-orange-300/80 animate-float" style={{ animationDelay: '1s' }}>
            🎶
          </div>
          <div className="absolute bottom-4 left-10 text-xl text-pink-300/80 animate-float" style={{ animationDelay: '1.5s' }}>
            ✨
          </div>
          <div className="absolute bottom-5 right-6 text-2xl text-amber-400/80 animate-float" style={{ animationDelay: '0.5s' }}>
            🌟
          </div>

          {/* Dancing Central Avatar & Mascot */}
          <div className="flex items-center justify-center gap-4 sm:gap-6 my-2">
            {/* Left theme emoji bouncing */}
            <div
              className={`text-4xl sm:text-5xl transition-transform ${
                playerState.state === 'playing' ? 'animate-bounce' : 'scale-90 opacity-80'
              }`}
            >
              {currentLine.emoji}
            </div>

            {/* Teacher Rona character with music aura */}
            <div
              className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl overflow-hidden border-4 border-amber-400 shadow-xl bg-slate-900 transition-all ${
                playerState.state === 'playing'
                  ? 'scale-105 shadow-amber-300/50 ring-4 ring-amber-200 animate-pulse'
                  : ''
              }`}
            >
              <img
                src="/assets/aistudio/WhatsApp_Image_2026-11-05_at_23.16.55_6a80a945.jpeg"
                alt="English With Rona - شخصية المعلمة رانيا عزت"
                className="w-full h-full object-cover object-top"
              />
            </div>

            {/* Right theme emoji bouncing */}
            <div
              className={`text-4xl sm:text-5xl transition-transform ${
                playerState.state === 'playing' ? 'animate-bounce' : 'scale-90 opacity-80'
              }`}
              style={{ animationDelay: '0.2s' }}
            >
              {activeSong.icon}
            </div>
          </div>

          {/* Active Highlighted Lyric Display (Big moving karaoke hero) */}
          <div className="max-w-2xl mx-auto my-4 p-4 rounded-2xl bg-white/90 border border-amber-200/90 shadow-sm backdrop-blur-xs">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full inline-block mb-1">
              ردّد وغنِّ الآن 🎙️
            </span>
            <p className="text-xl sm:text-3xl font-black text-slate-800 font-['Outfit'] tracking-tight leading-relaxed">
              {currentLine.textEnglish}
            </p>
            <p className="text-xs sm:text-sm font-bold text-amber-700 mt-1">
              {currentLine.textArabic}
            </p>
          </div>
        </div>

        {/* 5. Player Controls & Timeline */}
        <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200/80 mb-6">
          {/* Timeline bar */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-mono font-bold text-slate-500 w-10 text-left tabular-nums">
              {Math.floor(playerState.currentTime)}s
            </span>
            <div className="flex-1 bg-slate-200 rounded-full h-2.5 overflow-hidden relative cursor-pointer">
              <div
                className="h-full bg-linear-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-200"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs font-mono font-bold text-slate-500 w-10 text-right tabular-nums">
              {activeSong.durationSeconds}s
            </span>
          </div>

          {/* Buttons controls */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Speed selection */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs font-bold">
              <button
                onClick={() => handleSpeedChange(0.8)}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  playerState.playbackSpeed === 0.8
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="سرعة هادئة للأطفال المبتدئين"
              >
                0.8x هادئ
              </button>
              <button
                onClick={() => handleSpeedChange(1.0)}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  playerState.playbackSpeed === 1.0
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="السرعة العادية القياسية"
              >
                1.0x عادي
              </button>
              <button
                onClick={() => handleSpeedChange(1.2)}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  playerState.playbackSpeed === 1.2
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="سرعة سريعة وتحدي"
              >
                1.2x سريع
              </button>
            </div>

            {/* Central Media Playback Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrevSong}
                className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-amber-50 transition-colors cursor-pointer shadow-xs"
                title="الأغنية السابقة"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={handleRestart}
                className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-amber-50 transition-colors cursor-pointer shadow-xs"
                title="إعادة الأغنية من البداية"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={handleTogglePlay}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white rounded-2xl font-black text-sm flex items-center gap-2 shadow-md transition-all cursor-pointer hover:scale-105"
              >
                {playerState.state === 'playing' ? (
                  <>
                    <Pause className="w-5 h-5 fill-current" />
                    <span>إيقاف مؤقت</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-current" />
                    <span>تشغيل الأغنية 🎶</span>
                  </>
                )}
              </button>

              <button
                onClick={handleNextSong}
                className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-amber-50 transition-colors cursor-pointer shadow-xs"
                title="الأغنية التالية"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            {/* Loop Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleLoop}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  playerState.isLooping
                    ? 'bg-amber-100 text-amber-900 border border-amber-300 font-black'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
                title="خيار تكرار الأغنية تلقائياً"
              >
                <Repeat className={`w-3.5 h-3.5 ${playerState.isLooping ? 'text-amber-600' : ''}`} />
                <span>{playerState.isLooping ? 'تكرار مستمر: مفعّل 🔁' : 'تكرار الأغنية: متوقف'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 6. Interactive Synchronized Lyrics List */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h4 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
              <span>الكلمات التفاعلية للأغنية (اضغط على أي سطر للانتقال إليه):</span>
            </h4>
            <span className="text-[11px] font-bold text-slate-400">
              سطر {playerState.currentLineIndex + 1} من {activeSong.lyrics.length}
            </span>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {activeSong.lyrics.map((line, idx) => {
              const isActive = idx === playerState.currentLineIndex;

              return (
                <div
                  key={line.id}
                  ref={isActive ? activeLineRef : null}
                  onClick={() => handleLineClick(idx)}
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer text-right flex items-center justify-between gap-3 ${
                    isActive
                      ? 'bg-amber-500 text-white border-amber-600 shadow-md scale-102 ring-2 ring-amber-300'
                      : 'bg-slate-50 hover:bg-amber-50/50 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="flex-1">
                    <p
                      className={`text-sm sm:text-base font-black font-['Outfit'] tracking-tight ${
                        isActive ? 'text-white' : 'text-slate-800'
                      }`}
                    >
                      {line.textEnglish}
                    </p>
                    <p
                      className={`text-xs font-semibold mt-0.5 ${
                        isActive ? 'text-amber-100' : 'text-slate-400'
                      }`}
                    >
                      {line.textArabic}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-2xl">{line.emoji}</span>
                    {isActive && (
                      <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Celebration Banner when completed */}
        {showCelebration && (
          <div className="mt-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-center animate-in fade-in zoom-in-95">
            <div className="text-3xl mb-1">🎉 ⭐ 🏆</div>
            <h4 className="text-base font-black text-emerald-800">
              أحسنت صنعاً يا بطل! أتقنت غناء الأغنية بنجاح!
            </h4>
            <p className="text-xs text-emerald-700 mt-0.5 font-bold">
              حصلت على +5 نجوم ⭐ و +25 نقطة خبرة XP! استمر في التعلّم والغناء!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
