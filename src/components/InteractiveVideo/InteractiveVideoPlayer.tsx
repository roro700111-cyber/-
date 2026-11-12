import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Mic,
  MicOff,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  Award,
  Snail,
} from 'lucide-react';
import { InteractiveVideo, VideoCheckpoint } from '../../types';
import { speakEnglish, listenPronunciation, sounds, SpeechRecognitionResult } from '../../utils/audio';

interface InteractiveVideoPlayerProps {
  video: InteractiveVideo;
  onReward: (stars: number, xp: number) => void;
  onBack: () => void;
  onVideoComplete: (videoId: string) => void;
}

export const InteractiveVideoPlayer: React.FC<InteractiveVideoPlayerProps> = ({
  video,
  onReward,
  onBack,
  onVideoComplete,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeCheckpoint, setActiveCheckpoint] = useState<VideoCheckpoint | null>(null);
  const [completedCheckpoints, setCompletedCheckpoints] = useState<string[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  // HTML5 Video element reference
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Pronunciation state
  const [isListening, setIsListening] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  const [micVolume, setMicVolume] = useState(0);
  const [pronounceResult, setPronounceResult] = useState<SpeechRecognitionResult | null>(null);

  // Quiz state
  const [selectedQuizOption, setSelectedQuizOption] = useState<string | null>(null);
  const [quizAnswered, setQuizAnswered] = useState(false);

  // Determine actual MP4 video source
  const videoSrc = video.videoUrl || (
    video.theme === 'safari'
      ? '/assets/videos/video_safari_adventure.mp4'
      : video.theme === 'phonics'
      ? '/assets/videos/video_phonics_melody.mp4'
      : '/assets/videos/video_space_explorer.mp4'
  );

  // Attempt auto-playback when video lesson is opened
  useEffect(() => {
    const timer = setTimeout(() => {
      if (videoRef.current && !activeCheckpoint && !isFinished) {
        videoRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch(() => {
            // Browser policy may require explicit user gesture
            setIsPlaying(false);
          });
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [videoSrc]);

  // Handle Play/Pause for HTML5 video
  const togglePlay = () => {
    sounds.playClick();
    if (activeCheckpoint || isFinished) return;
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  };

  // Video Time Update & Checkpoint triggering
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const currentSec = Math.floor(videoRef.current.currentTime);
    setCurrentTime(currentSec);

    // Check if there is an uncompleted checkpoint at this time
    const checkpoint = video.checkpoints.find(
      (cp) => Math.abs(cp.timeSeconds - currentSec) <= 0.5 && !completedCheckpoints.includes(cp.id)
    );

    if (checkpoint && activeCheckpoint?.id !== checkpoint.id) {
      videoRef.current.pause();
      setIsPlaying(false);
      setActiveCheckpoint(checkpoint);
      sounds.playPop();

      // If checkpoint has target word, speak it
      if (checkpoint.targetWord) {
        setTimeout(() => {
          speakEnglish(checkpoint.targetWord!);
        }, 400);
      }
    }
  };

  // Video Ended Handler
  const handleVideoEnded = () => {
    setIsPlaying(false);
    setIsFinished(true);
    sounds.playSuperCelebration();
    onReward(8, 50);
    onVideoComplete(video.id);
  };

  // Restart video from beginning
  const handleRestart = () => {
    sounds.playClick();
    setCurrentTime(0);
    setActiveCheckpoint(null);
    setCompletedCheckpoints([]);
    setIsFinished(false);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
    setIsPlaying(true);
  };

  // Pronunciation Evaluation
  const handleStartListening = async () => {
    if (!activeCheckpoint?.targetWord) return;
    setIsListening(true);
    setSpokenText('استمع لك... تكلّم بالإنجليزية بوضوح!');
    setPronounceResult(null);
    setMicVolume(15);
    sounds.playClick();

    const res = await listenPronunciation(
      activeCheckpoint.targetWord,
      (interim) => setSpokenText(interim),
      (vol) => setMicVolume(vol)
    );

    setIsListening(false);
    setMicVolume(0);
    setPronounceResult(res);

    if (res.isMatch) {
      sounds.playDing();
      sounds.playPointsStream(4);
      onReward(Math.ceil(activeCheckpoint.points / 5), activeCheckpoint.points);
    } else {
      if (res.accuracyTier !== 'no_speech') {
        sounds.playError();
      }
    }
  };

  // Quiz Option Click
  const handleSelectQuizOption = (optId: string, isCorrect: boolean) => {
    if (quizAnswered) return;
    setSelectedQuizOption(optId);
    setQuizAnswered(true);

    if (isCorrect) {
      sounds.playDing();
      sounds.playPointsStream(3);
      if (activeCheckpoint) {
        onReward(Math.ceil(activeCheckpoint.points / 5), activeCheckpoint.points);
      }
    } else {
      sounds.playError();
    }
  };

  // Resume after completing a checkpoint
  const handleResumeAfterCheckpoint = () => {
    if (!activeCheckpoint) return;
    sounds.playClick();
    const passedId = activeCheckpoint.id;
    const passedTime = activeCheckpoint.timeSeconds;
    setCompletedCheckpoints((prev) => [...prev, passedId]);
    setActiveCheckpoint(null);
    setPronounceResult(null);
    setSpokenText('');
    setSelectedQuizOption(null);
    setQuizAnswered(false);
    if (videoRef.current) {
      if (videoRef.current.currentTime <= passedTime) {
        videoRef.current.currentTime = passedTime + 0.6;
      }
      videoRef.current.play().catch(() => {});
    }
    setIsPlaying(true);
  };

  // Subtitles / Story narrative based on current time
  const getSubtitles = () => {
    if (video.theme === 'safari') {
      if (currentTime < 8) return '🦁 "Welcome to the wild safari! Look at the animals waving!"';
      if (currentTime < 16) return '🦒 "The tall giraffe is eating green leaves from high trees!"';
      if (currentTime < 24) return '🐘 "The friendly elephant is playing near the cool river!"';
      return '🎉 "What a wonderful safari exploration journey!"';
    } else if (video.theme === 'phonics') {
      if (currentTime < 8) return '🎵 "A is for Apple, /æ/ /æ/ Apple!"';
      if (currentTime < 16) return '🎵 "B is for Bear, /b/ /b/ Bear!"';
      if (currentTime < 24) return '🎵 "C is for Cat, /k/ /k/ Cat!"';
      return '🌟 "Sing and dance along with the musical letters!"';
    } else {
      if (currentTime < 8) return '🚀 "3... 2... 1... Blast off into outer space!"';
      if (currentTime < 16) return '🪐 "Look at the colorful glowing planets and bright stars!"';
      if (currentTime < 24) return '👨‍🚀 "Waving to friendly astronaut friends across the galaxy!"';
      return '✨ "Mission completed! You are a superstar space explorer!"';
    }
  };

  // Normalize thumbnail path
  const cleanThumbnailUrl = (video.thumbnailUrl || '').replace('/src/assets/', '/assets/');

  // Active character or thematic item based on playback time
  const getSceneCharacter = () => {
    if (video.theme === 'safari') {
      if (currentTime < 8) return { emoji: '🦁', name: 'Lion Cub', color: 'from-amber-400 to-orange-500' };
      if (currentTime < 16) return { emoji: '🦒', name: 'Tall Giraffe', color: 'from-yellow-400 to-amber-500' };
      if (currentTime < 24) return { emoji: '🐘', name: 'Playful Elephant', color: 'from-sky-400 to-blue-500' };
      return { emoji: '🦁👑', name: 'King Lion', color: 'from-amber-500 to-orange-600' };
    } else if (video.theme === 'phonics') {
      if (currentTime < 8) return { emoji: '🍎', name: 'Letter A · Apple', color: 'from-red-400 to-rose-500' };
      if (currentTime < 16) return { emoji: '🐻', name: 'Letter B · Bear', color: 'from-amber-500 to-orange-600' };
      if (currentTime < 24) return { emoji: '⭐', name: 'Letter S · Star', color: 'from-yellow-300 to-amber-500' };
      return { emoji: '🎶🌟', name: 'Singing Letters', color: 'from-purple-400 to-pink-500' };
    } else {
      if (currentTime < 8) return { emoji: '🚀', name: 'Cosmic Rocket', color: 'from-indigo-400 to-purple-600' };
      if (currentTime < 16) return { emoji: '⭐', name: 'Glowing Star', color: 'from-amber-300 to-yellow-500' };
      if (currentTime < 24) return { emoji: '🌍', name: 'Blue Planet Earth', color: 'from-sky-400 to-blue-600' };
      return { emoji: '🧑‍🚀✨', name: 'Super Astronaut', color: 'from-purple-500 to-indigo-600' };
    }
  };

  const sceneChar = getSceneCharacter();

  return (
    <div className="max-w-4xl mx-auto">
      {/* Top action bar */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl transition-colors cursor-pointer shadow-xs"
        >
          <ArrowRight className="w-4 h-4 rotate-180" />
          <span>العودة لقائمة الفيديوهات</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-amber-700 bg-amber-100/90 px-3 py-1 rounded-full font-['Outfit']">
            {video.title}
          </span>
          <span className="text-xs text-slate-500 font-mono tabular-nums">
            {video.checkpoints.length} محطات تفاعلية
          </span>
        </div>
      </div>

      {/* Main Video Screen Container */}
      <div className="bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border-2 border-amber-300/80 relative">
        {/* Real HTML5 Video Player Viewport */}
        <div className="relative aspect-video w-full overflow-hidden bg-slate-950 flex items-center justify-center group">
          {/* Real HTML5 Video element playing actual MP4 footage */}
          <video
            ref={videoRef}
            src={videoSrc}
            poster={cleanThumbnailUrl}
            playsInline
            muted
            preload="auto"
            onTimeUpdate={handleTimeUpdate}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={handleVideoEnded}
            onLoadedData={() => setVideoLoaded(true)}
            className="w-full h-full object-cover cursor-pointer"
            onClick={togglePlay}
          />

          {/* Big Play Button Overlay when paused and no active checkpoint */}
          {!isPlaying && !activeCheckpoint && !isFinished && (
            <button
              onClick={togglePlay}
              className="absolute inset-0 flex items-center justify-center bg-black/35 hover:bg-black/25 transition-colors cursor-pointer z-10"
              aria-label="تشغيل الفيديو"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center shadow-2xl transition-transform hover:scale-110">
                <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-slate-950 ml-1" />
              </div>
            </button>
          )}

          {/* Crisp subtle scrim overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/20 pointer-events-none" />

          {/* Top Live Video Bar */}
          <div className="absolute top-3 inset-x-4 flex items-center justify-between pointer-events-none z-10">
            <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-xs font-bold flex items-center gap-2 border border-white/20 shadow-sm">
              <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-red-500 animate-ping' : 'bg-amber-400'}`} />
              <span>{isPlaying ? 'فيديو تفاعلي مباشر 🎬' : 'موقوف مؤقتاً ⏸️'}</span>
            </div>

            {/* Current Scene Badge */}
            <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full text-slate-900 text-xs font-black flex items-center gap-1.5 shadow-md border border-amber-300">
              <span className="text-base">{sceneChar.emoji}</span>
              <span className="font-['Outfit']">{sceneChar.name}</span>
            </div>
          </div>

          {/* Floating animated character in corner while playing */}
          <div className="absolute bottom-20 right-4 z-10 pointer-events-none hidden sm:flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/20 shadow-md">
            <span className="text-2xl animate-pulse">{sceneChar.emoji}</span>
            <span className="text-xs text-amber-200 font-bold">{sceneChar.name}</span>
          </div>

          {/* Subtitles Overlay Bar */}
          <div className="absolute bottom-4 inset-x-4 text-center pointer-events-none z-10">
            <div className="inline-block bg-black/80 backdrop-blur-md px-5 py-2.5 rounded-2xl text-white text-xs sm:text-base font-bold shadow-xl border border-white/20 font-['Outfit'] max-w-2xl" dir="ltr">
              {getSubtitles()}
            </div>
          </div>

          {/* Interactive Checkpoint Modal Overlay */}
          {activeCheckpoint && (
            <div className="absolute inset-0 z-30 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in zoom-in-95">
              <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full text-center shadow-2xl border-4 border-amber-400">
                <div className="w-12 h-12 mx-auto rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold mb-3">
                  <Sparkles className="w-6 h-6 animate-spin" />
                </div>

                <div className="text-xs font-bold text-amber-700 mb-1">
                  Interactive Video Checkpoint
                </div>

                <h3 className="text-lg sm:text-xl font-black text-slate-900 mb-2 font-['Outfit']">
                  {activeCheckpoint.promptEnglish}
                </h3>

                {/* Pronunciation Type Checkpoint */}
                {activeCheckpoint.type === 'pronounce' && (
                  <div>
                    {activeCheckpoint.targetWord && (
                      <div className="bg-amber-50 rounded-2xl p-4 mb-4 border border-amber-200">
                        <div className="text-4xl sm:text-5xl mb-2 animate-bounce" style={{ animationDuration: '2.5s' }}>
                          {activeCheckpoint.targetWord.toLowerCase().includes('giraffe') ? '🦒' :
                           activeCheckpoint.targetWord.toLowerCase().includes('elephant') ? '🐘' :
                           activeCheckpoint.targetWord.toLowerCase().includes('lion') ? '🦁' :
                           activeCheckpoint.targetWord.toLowerCase().includes('apple') ? '🍎' :
                           activeCheckpoint.targetWord.toLowerCase().includes('bear') ? '🐻' :
                           activeCheckpoint.targetWord.toLowerCase().includes('star') ? '⭐' :
                           activeCheckpoint.targetWord.toLowerCase().includes('rocket') ? '🚀' :
                           activeCheckpoint.targetWord.toLowerCase().includes('blue') ? '🌍' :
                           sceneChar.emoji}
                        </div>
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <button
                            onClick={() => speakEnglish(activeCheckpoint.targetWord!, false)}
                            className="p-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-colors cursor-pointer shadow-xs flex items-center gap-1.5 text-xs font-bold"
                          >
                            <Volume2 className="w-4 h-4" />
                            <span>استمع لنطق الكلمة 🔊</span>
                          </button>
                          <button
                            onClick={() => speakEnglish(activeCheckpoint.targetWord!, true)}
                            className="p-2.5 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-xl transition-colors cursor-pointer"
                            title="نطق بطيء للمبتدئين"
                          >
                            <Snail className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="text-3xl sm:text-4xl font-black text-slate-800 font-['Outfit'] tracking-tight">
                          {activeCheckpoint.targetWord}
                        </div>
                      </div>
                    )}

                    {/* Microphone trigger */}
                    <div className="flex flex-col items-center gap-3">
                      <button
                        onClick={handleStartListening}
                        disabled={isListening}
                        className={`px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 transition-all cursor-pointer shadow-md ${
                          isListening
                            ? 'bg-rose-500 text-white animate-pulse ring-4 ring-rose-200'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white hover:scale-105'
                        }`}
                      >
                        {isListening ? (
                          <>
                            <MicOff className="w-5 h-5 animate-spin" />
                            <span>Listening to you... Speak now!</span>
                          </>
                        ) : (
                          <>
                            <Mic className="w-5 h-5" />
                            <span>Tap & Speak in Microphone 🎙️</span>
                          </>
                        )}
                      </button>

                      {isListening && (
                        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-2xl w-full max-w-xs text-center space-y-1.5 animate-fade-in">
                          <div className="flex items-center justify-center gap-1.5 h-6">
                            {[0.4, 0.8, 1.0, 0.6, 0.9, 0.5, 0.7].map((mult, idx) => {
                              const waveHeight = Math.max(
                                6,
                                Math.min(22, Math.round((micVolume || 20) * mult * 0.3 + (idx % 2 ? 4 : 8)))
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
                          <p className="text-xs text-rose-700 font-bold">
                            {spokenText ? `"${spokenText}"` : 'تحدث الآن في الميكروفون 🎙️'}
                          </p>
                        </div>
                      )}

                      {pronounceResult && (
                        <div
                          className={`p-3.5 rounded-2xl w-full border text-right transition-all animate-fade-in ${
                            pronounceResult.accuracyTier === 'no_speech'
                              ? 'bg-amber-50 border-amber-300 text-amber-950'
                              : pronounceResult.isMatch
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                              : 'bg-rose-50 border-rose-300 text-rose-950'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs font-black mb-1.5 border-b pb-1.5 border-black/10">
                            <span>
                              {pronounceResult.isMatch
                                ? 'نطق ممتاز ومطابق! ⭐'
                                : pronounceResult.accuracyTier === 'no_speech'
                                ? 'تنبيه: لم نسمع صوتاً واضحاً 🔇'
                                : 'الكلمة غير متطابقة 🔄'}
                            </span>
                            <span className="font-mono tabular-nums text-xs px-2 py-0.5 rounded-md bg-white/80">
                              دقة: {pronounceResult.score}%
                            </span>
                          </div>

                          <p className="text-xs font-bold leading-relaxed mb-2">
                            {pronounceResult.feedbackArabic}
                          </p>

                          <div className="bg-white/90 rounded-xl p-2 border border-black/5 text-xs flex items-center justify-between">
                            <span className="text-[11px] text-slate-500 font-bold">
                              المطلوب: <span className="text-amber-900 font-black">{activeCheckpoint.targetWord}</span>
                            </span>
                            <span className="text-[11px] text-slate-500 font-bold">
                              المسموع: <span className="text-slate-800 font-black">{pronounceResult.text || '—'}</span>
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Continue button */}
                      <button
                        onClick={handleResumeAfterCheckpoint}
                        className="mt-2 px-8 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black text-xs shadow-sm transition-transform hover:scale-105 cursor-pointer"
                      >
                        Continue Video ➔
                      </button>
                    </div>
                  </div>
                )}

                {/* Quiz Type Checkpoint */}
                {activeCheckpoint.type === 'quiz' && activeCheckpoint.options && (
                  <div>
                    <div className="grid grid-cols-1 gap-2.5 mb-4">
                      {activeCheckpoint.options.map((opt) => {
                        const isSelected = selectedQuizOption === opt.id;
                        let btnStyle =
                          'bg-slate-50 border-2 border-slate-200 hover:bg-amber-50 hover:border-amber-300';
                        if (quizAnswered) {
                          if (opt.isCorrect) {
                            btnStyle = 'bg-emerald-50 border-2 border-emerald-500 text-emerald-900 font-bold';
                          } else if (isSelected) {
                            btnStyle = 'bg-rose-50 border-2 border-rose-400 text-rose-900';
                          } else {
                            btnStyle = 'opacity-40 border-slate-200';
                          }
                        }

                        return (
                          <button
                            key={opt.id}
                            onClick={() => handleSelectQuizOption(opt.id, opt.isCorrect)}
                            disabled={quizAnswered}
                            className={`p-3 rounded-2xl flex items-center justify-between text-sm transition-all cursor-pointer ${btnStyle}`}
                          >
                            <span className="font-bold font-['Outfit']">{opt.text}</span>
                            <span className="text-2xl">{opt.emoji}</span>
                          </button>
                        );
                      })}
                    </div>

                    {quizAnswered && (
                      <button
                        onClick={handleResumeAfterCheckpoint}
                        className="px-8 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black text-xs shadow-sm transition-transform hover:scale-105 cursor-pointer"
                      >
                        Continue Video ➔
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Finished Victory Overlay */}
          {isFinished && (
            <div className="absolute inset-0 z-30 bg-black/90 backdrop-blur-md flex items-center justify-center p-6 text-center animate-in fade-in">
              <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border-4 border-amber-400">
                <div className="text-5xl mb-2">🏆</div>
                <h3 className="text-2xl font-black text-slate-900 mb-1">
                  Congratulations! Video Completed!
                </h3>
                <p className="text-xs text-slate-600 mb-4">
                  You showed awesome English listening and speaking skills today!
                </p>

                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-amber-900 text-xs font-bold mb-4 flex items-center justify-around">
                  <span>⭐ +8 Golden Stars</span>
                  <span>⚡ +50 XP Experience</span>
                </div>

                {/* Sound celebratory triggers */}
                <div className="flex items-center justify-center gap-2 mb-6">
                  <button
                    onClick={() => sounds.playSuperCelebration()}
                    className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    title="Play fanfare"
                  >
                    <span>🎉</span>
                    <span>Fanfare</span>
                  </button>

                  <button
                    onClick={() => sounds.playCheer()}
                    className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    title="Play applause"
                  >
                    <span>👏</span>
                    <span>Applause</span>
                  </button>

                  <button
                    onClick={() => sounds.playPointsStream(6)}
                    className="px-3 py-1.5 bg-orange-100 hover:bg-orange-200 text-orange-900 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    title="Play stars sound"
                  >
                    <span>⭐</span>
                    <span>Star Stream</span>
                  </button>
                </div>

                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={handleRestart}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                  >
                    Watch Again 🔄
                  </button>
                  <button
                    onClick={onBack}
                    className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black text-xs transition-transform hover:scale-105 cursor-pointer"
                  >
                    Back to Videos ➔
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Video Control Bar & Scrub Timeline */}
        <div className="p-4 bg-slate-950 text-white">
          {/* Timeline with Checkpoint Pins & Interactive Scrubbing */}
          <div
            className="relative mb-3 pt-2 cursor-pointer group/timeline py-1"
            onClick={(e) => {
              if (!videoRef.current || activeCheckpoint) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const ratio = Math.max(0, Math.min(1, clickX / rect.width));
              const newTime = ratio * video.durationSeconds;
              videoRef.current.currentTime = newTime;
              setCurrentTime(Math.floor(newTime));
            }}
            title="انقر للتنقل في الفيديو"
          >
            <div className="h-2 bg-slate-800 group-hover/timeline:h-2.5 rounded-full overflow-hidden transition-all">
              <div
                className="h-full bg-linear-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-100"
                style={{ width: `${(currentTime / video.durationSeconds) * 100}%` }}
              />
            </div>

            {/* Checkpoint dots along timeline */}
            {video.checkpoints.map((cp) => {
              const leftPercent = (cp.timeSeconds / video.durationSeconds) * 100;
              const isPassed = completedCheckpoints.includes(cp.id);
              return (
                <div
                  key={cp.id}
                  className="absolute top-0 -mt-1 -ml-2 flex flex-col items-center pointer-events-none"
                  style={{ left: `${leftPercent}%` }}
                >
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold border ${
                      isPassed
                        ? 'bg-emerald-500 border-white text-white'
                        : 'bg-amber-400 border-amber-200 text-amber-950 animate-bounce'
                    }`}
                  >
                    ⭐
                  </span>
                </div>
              );
            })}
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                disabled={!!activeCheckpoint || isFinished}
                className="w-10 h-10 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center transition-transform hover:scale-105 cursor-pointer disabled:opacity-50"
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-slate-950" /> : <Play className="w-5 h-5 fill-slate-950 ml-0.5" />}
              </button>

              <button
                onClick={handleRestart}
                className="p-2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Restart from beginning"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Time display */}
              <div className="text-xs font-mono tabular-nums text-slate-400" dir="ltr">
                <span>{currentTime}s</span> / <span>{video.durationSeconds}s</span>
              </div>
            </div>

            {/* Checkpoints summary */}
            <div className="text-xs font-medium text-slate-400 hidden sm:flex items-center gap-2">
              <span>Completed Checkpoints:</span>
              <span className="font-bold text-amber-400 font-mono tabular-nums">
                {completedCheckpoints.length} / {video.checkpoints.length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
