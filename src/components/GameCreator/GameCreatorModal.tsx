import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Volume2,
  Gamepad2,
  Video,
  Sparkles,
  Save,
  Mic,
  Square,
  Play,
  RotateCcw,
} from 'lucide-react';
import { GamePack, InteractiveVideo, WordItem, VideoCheckpoint } from '../../types';
import { speakEnglish, sounds, playAudioDataUrl } from '../../utils/audio';
import { CustomAudioRecorder } from '../../utils/audioRecorder';

interface GameCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePack: (pack: GamePack) => void;
  onSaveVideo: (video: InteractiveVideo) => void;
}

export const GameCreatorModal: React.FC<GameCreatorModalProps> = ({
  isOpen,
  onClose,
  onSavePack,
  onSaveVideo,
}) => {
  const [tab, setTab] = useState<'pack' | 'video'>('pack');

  // Custom Audio Recording State per word
  const [recordingWordIndex, setRecordingWordIndex] = useState<number | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const recorderRef = useRef<CustomAudioRecorder | null>(null);
  const recordingTimerRef = useRef<number | null>(null);

  // Clean up recording if modal closes
  useEffect(() => {
    return () => {
      if (recorderRef.current) {
        recorderRef.current.cancelRecording();
      }
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, []);

  // Pack Form State
  const [packTitleEnglish, setPackTitleEnglish] = useState('');
  const [packTitleArabic, setPackTitleArabic] = useState('');
  const [packCategory, setPackCategory] = useState<'animals' | 'food' | 'colors' | 'school' | 'phonics' | 'custom'>('custom');
  const [packIcon, setPackIcon] = useState('🌟');
  const [words, setWords] = useState<Omit<WordItem, 'id'>[]>([
    {
      english: 'Butterfly',
      arabic: 'فراشة',
      phonetic: '/ˈbʌt.ə.flaɪ/',
      category: 'nature',
      emoji: '🦋',
      exampleSentence: 'The colorful butterfly dances on flowers.',
      arabicSentence: 'The colorful butterfly dances on flowers.',
    },
    {
      english: 'Rainbow',
      arabic: 'قوس قزح',
      phonetic: '/ˈreɪn.bəʊ/',
      category: 'nature',
      emoji: '🌈',
      exampleSentence: 'The rainbow appears after the rain.',
      arabicSentence: 'The rainbow appears after the rain.',
    },
  ]);

  // Video Form State
  const [videoTitleEnglish, setVideoTitleEnglish] = useState('');
  const [videoTitleArabic, setVideoTitleArabic] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [videoDuration, setVideoDuration] = useState(25);
  const [videoTheme, setVideoTheme] = useState<'safari' | 'phonics' | 'space' | 'daily'>('safari');
  const [checkpoints, setCheckpoints] = useState<VideoCheckpoint[]>([
    {
      id: 'cp-custom-1',
      timeSeconds: 7,
      type: 'pronounce',
      promptEnglish: 'Speech Challenge: Say the word clearly into the mic!',
      promptArabic: 'تحدي النطق',
      targetWord: 'Butterfly',
      points: 20,
    },
    {
      id: 'cp-custom-2',
      timeSeconds: 15,
      type: 'quiz',
      promptEnglish: 'Comprehension Quiz: Where does the butterfly dance?',
      promptArabic: 'سؤال الفهم',
      points: 15,
      options: [
        { id: 'opt-c1', text: 'On flowers 🌸', isCorrect: true, emoji: '🌸' },
        { id: 'opt-c2', text: 'Under water 🌊', isCorrect: false, emoji: '🌊' },
      ],
    },
  ]);

  if (!isOpen) return null;

  // Add word row
  const handleAddWord = () => {
    sounds.playClick();
    setWords((prev) => [
      ...prev,
      {
        english: '',
        arabic: '',
        phonetic: '',
        category: packCategory,
        emoji: '⭐',
        exampleSentence: '',
        arabicSentence: '',
      },
    ]);
  };

  const handleUpdateWord = (index: number, field: keyof Omit<WordItem, 'id'>, value: string) => {
    setWords((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleRemoveWord = (index: number) => {
    sounds.playClick();
    if (words.length <= 1) return;
    setWords((prev) => prev.filter((_, i) => i !== index));
  };

  // Start recording custom voice for a word
  const handleStartRecordWord = async (index: number) => {
    try {
      setRecordingError(null);
      if (recorderRef.current) {
        recorderRef.current.cancelRecording();
      }
      sounds.playClick();
      const recorder = new CustomAudioRecorder();
      recorderRef.current = recorder;
      await recorder.startRecording();
      setRecordingWordIndex(index);
      setRecordingSeconds(0);

      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 6) {
            handleStopRecordWord(index);
            return 6;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err: any) {
      setRecordingError(err.message || 'Microphone access denied. Please grant microphone permission.');
      setRecordingWordIndex(null);
    }
  };

  // Stop recording custom voice and save base64
  const handleStopRecordWord = async (index: number) => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    if (!recorderRef.current) return;

    try {
      const base64Audio = await recorderRef.current.stopRecording();
      recorderRef.current = null;
      setRecordingWordIndex(null);

      // Save audio to word
      setWords((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], customAudioUrl: base64Audio };
        return next;
      });

      sounds.playSuccess();
    } catch (err: any) {
      setRecordingError(err.message || 'Error occurred while saving audio recording');
      setRecordingWordIndex(null);
    }
  };

  const handlePlayWordAudioPreview = (word: Omit<WordItem, 'id'>) => {
    sounds.playClick();
    if (word.customAudioUrl) {
      playAudioDataUrl(word.customAudioUrl);
    } else if (word.english) {
      speakEnglish(word.english);
    }
  };

  const handleRemoveCustomAudio = (index: number) => {
    sounds.playClick();
    setWords((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], customAudioUrl: undefined };
      return next;
    });
  };

  // Add checkpoint row
  const handleAddCheckpoint = () => {
    sounds.playClick();
    setCheckpoints((prev) => [
      ...prev,
      {
        id: `cp-custom-${Date.now()}`,
        timeSeconds: 10,
        type: 'pronounce',
        promptEnglish: 'Speech Challenge: Say the word clearly!',
        promptArabic: 'تحدي نطق',
        targetWord: 'Hello',
        points: 20,
      },
    ]);
  };

  const handleRemoveCheckpoint = (index: number) => {
    sounds.playClick();
    if (checkpoints.length <= 1) return;
    setCheckpoints((prev) => prev.filter((_, i) => i !== index));
  };

  // Save Pack
  const handleSubmitPack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!packTitleEnglish.trim() || words.length === 0) return;

    sounds.playSuccess();
    const newPack: GamePack = {
      id: `custom-pack-${Date.now()}`,
      title: packTitleEnglish.trim(),
      titleArabic: packTitleArabic.trim() || packTitleEnglish.trim(),
      description: `Custom learning pack created with ${words.length} words and interactive audio.`,
      category: packCategory,
      icon: packIcon || '🌟',
      color: 'from-amber-500 to-orange-500',
      isCustom: true,
      words: words.map((w, idx) => ({
        ...w,
        id: `cw-${Date.now()}-${idx}`,
        english: w.english.trim() || 'Word',
        arabic: w.arabic.trim() || w.english.trim(),
        phonetic: w.phonetic.trim() || '/wɜːd/',
        customAudioUrl: w.customAudioUrl,
      })),
    };

    onSavePack(newPack);
    onClose();
  };

  // Save Video
  const handleSubmitVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoTitleEnglish.trim()) return;

    sounds.playSuccess();
    const newVideo: InteractiveVideo = {
      id: `custom-vid-${Date.now()}`,
      title: videoTitleEnglish.trim(),
      titleArabic: videoTitleArabic.trim() || videoTitleEnglish.trim(),
      description: videoDescription.trim() || 'Custom interactive lesson with pronunciation checkpoints and quizzes.',
      durationSeconds: videoDuration || 25,
      theme: videoTheme,
      thumbnailUrl:
        videoTheme === 'safari'
          ? '/assets/images/video_safari_adventure_1793301247465.jpg'
          : videoTheme === 'phonics'
          ? '/assets/images/video_phonics_melody_1793301248779.jpg'
          : '/assets/images/video_space_explorer_1793301248737.jpg',
      videoUrl:
        videoTheme === 'safari'
          ? '/assets/videos/video_safari_adventure.mp4'
          : videoTheme === 'phonics'
          ? '/assets/videos/video_phonics_melody.mp4'
          : '/assets/videos/video_space_explorer.mp4',
      ageGroup: 'Ages 5 - 10',
      level: 'Beginner',
      accentColor: 'amber',
      checkpoints,
      isCustom: true,
    };

    onSaveVideo(newVideo);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-auto animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700 font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">
                Interactive Game & Lesson Studio
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Design custom vocabulary packs, pronunciation exercises, and interactive video lessons
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Creator Mode Tabs */}
        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setTab('pack');
            }}
            className={`flex-1 py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              tab === 'pack'
                ? 'bg-white text-amber-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            <span>Create Vocabulary Pack</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setTab('video');
            }}
            className={`flex-1 py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              tab === 'video'
                ? 'bg-white text-amber-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>Create Interactive Video Lesson</span>
          </button>
        </div>

        {/* Tab 1: Game Pack Builder Form */}
        {tab === 'pack' ? (
          <form onSubmit={handleSubmitPack} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pack Title (English) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lovely Pets"
                  value={packTitleEnglish}
                  onChange={(e) => setPackTitleEnglish(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:border-amber-500 outline-hidden font-['Outfit']"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Arabic / Subtitle (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. حديقة الحيوانات الأليفة"
                  value={packTitleArabic}
                  onChange={(e) => setPackTitleArabic(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:border-amber-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pack Emoji / Icon
                </label>
                <input
                  type="text"
                  value={packIcon}
                  onChange={(e) => setPackIcon(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:border-amber-500 outline-hidden text-center text-lg"
                  maxLength={2}
                />
              </div>
            </div>

            {/* Words list editor */}
            <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black text-slate-800">
                  Words in Pack ({words.length} words):
                </span>
                <button
                  type="button"
                  onClick={handleAddWord}
                  className="text-xs font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Word</span>
                </button>
              </div>

              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {words.map((word, idx) => (
                  <div
                    key={idx}
                    className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center gap-2.5 shadow-2xs"
                  >
                    <input
                      type="text"
                      placeholder="Emoji (🐶)"
                      value={word.emoji}
                      onChange={(e) => handleUpdateWord(idx, 'emoji', e.target.value)}
                      className="w-12 text-center text-xl p-1 border border-slate-200 rounded-lg outline-hidden"
                    />

                    <input
                      type="text"
                      placeholder="English word *"
                      required
                      value={word.english}
                      onChange={(e) => handleUpdateWord(idx, 'english', e.target.value)}
                      className="flex-1 px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-bold font-['Outfit'] outline-hidden"
                    />

                    <input
                      type="text"
                      placeholder="Translation / Arabic"
                      value={word.arabic}
                      onChange={(e) => handleUpdateWord(idx, 'arabic', e.target.value)}
                      className="flex-1 px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-bold outline-hidden"
                    />

                    <input
                      type="text"
                      placeholder="Phonetic /dɒɡ/"
                      value={word.phonetic}
                      onChange={(e) => handleUpdateWord(idx, 'phonetic', e.target.value)}
                      className="w-24 px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-mono outline-hidden"
                    />

                    {/* Audio & Recording Controls */}
                    <div className="flex items-center gap-1.5 shrink-0 flex-wrap sm:flex-nowrap">
                      {recordingWordIndex === idx ? (
                        <button
                          type="button"
                          onClick={() => handleStopRecordWord(idx)}
                          className="px-2.5 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 animate-pulse cursor-pointer shadow-xs"
                          title="Stop and save audio recording"
                        >
                          <Square className="w-3 h-3 fill-current" />
                          <span>Stop (0:0{recordingSeconds}s)</span>
                        </button>
                      ) : word.customAudioUrl ? (
                        <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-200 rounded-lg p-0.5">
                          <button
                            type="button"
                            onClick={() => handlePlayWordAudioPreview(word)}
                            className="px-2 py-1 text-emerald-800 hover:bg-emerald-100 rounded text-xs font-bold flex items-center gap-1 cursor-pointer"
                            title="Play recorded audio"
                          >
                            <Play className="w-3 h-3 fill-emerald-700 text-emerald-700" />
                            <span className="text-[11px]">Recorded 🎙️</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleStartRecordWord(idx)}
                            className="p-1 text-amber-700 hover:bg-amber-100 rounded cursor-pointer"
                            title="Re-record voice"
                          >
                            <RotateCcw className="w-3 h-3" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRemoveCustomAudio(idx)}
                            className="p-1 text-rose-500 hover:bg-rose-100 rounded cursor-pointer"
                            title="Remove custom audio and use text-to-speech"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleStartRecordWord(idx)}
                          disabled={recordingWordIndex !== null}
                          className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          title="Record your voice via microphone"
                        >
                          <Mic className="w-3 h-3 text-amber-600" />
                          <span>Record 🎙️</span>
                        </button>
                      )}

                      {/* Standard text to speech button */}
                      <button
                        type="button"
                        onClick={() => word.english && speakEnglish(word.english)}
                        className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-slate-100 rounded-md cursor-pointer"
                        title="Listen to automated English speech"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>

                      {/* Delete word button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveWord(idx)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-md cursor-pointer"
                        title="Delete word"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {recordingError && (
                <div className="mt-2 text-xs font-bold text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200">
                  {recordingError}
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black text-xs flex items-center gap-2 shadow-sm transition-transform hover:scale-102 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save & Play Pack</span>
              </button>
            </div>
          </form>
        ) : (
          /* Tab 2: Interactive Video Builder Form */
          <form onSubmit={handleSubmitVideo} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Video Title (English) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Singing Birds Adventure"
                  value={videoTitleEnglish}
                  onChange={(e) => setVideoTitleEnglish(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:border-amber-500 outline-hidden font-['Outfit']"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Arabic / Subtitle (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. رحلة الطيور المغردة"
                  value={videoTitleArabic}
                  onChange={(e) => setVideoTitleArabic(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:border-amber-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Visual Animation Theme
                </label>
                <select
                  value={videoTheme}
                  onChange={(e) => setVideoTheme(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold outline-hidden bg-white"
                >
                  <option value="safari">Safari & Jungle Adventure</option>
                  <option value="phonics">Phonics & Melody Garden</option>
                  <option value="space">Space & Galaxy Explorer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Duration (Seconds)
                </label>
                <input
                  type="number"
                  min={15}
                  max={60}
                  value={videoDuration}
                  onChange={(e) => setVideoDuration(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold outline-hidden"
                />
              </div>
            </div>

            {/* Checkpoints editor */}
            <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black text-slate-800">
                  Interactive Checkpoints ({checkpoints.length} stops):
                </span>
                <button
                  type="button"
                  onClick={handleAddCheckpoint}
                  className="text-xs font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Checkpoint</span>
                </button>
              </div>

              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {checkpoints.map((cp, idx) => (
                  <div
                    key={cp.id}
                    className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center gap-3 shadow-2xs"
                  >
                    <div className="w-24 shrink-0 text-center">
                      <span className="text-[10px] text-slate-500 block">At Second:</span>
                      <input
                        type="number"
                        min={2}
                        max={videoDuration - 2}
                        value={cp.timeSeconds}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setCheckpoints((prev) => {
                            const n = [...prev];
                            n[idx] = { ...n[idx], timeSeconds: val };
                            return n;
                          });
                        }}
                        className="w-16 px-2 py-1 text-xs font-mono font-bold border border-slate-200 rounded-md text-center"
                      />
                    </div>

                    <div className="flex-1 w-full space-y-1.5">
                      <input
                        type="text"
                        placeholder="Checkpoint prompt in English"
                        value={cp.promptEnglish}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCheckpoints((prev) => {
                            const n = [...prev];
                            n[idx] = { ...n[idx], promptEnglish: val };
                            return n;
                          });
                        }}
                        className="w-full px-2.5 py-1 border border-slate-200 rounded-md text-xs font-medium outline-hidden"
                      />
                      <input
                        type="text"
                        placeholder="Target Word to pronounce (e.g. Lion)"
                        value={cp.targetWord || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCheckpoints((prev) => {
                            const n = [...prev];
                            n[idx] = { ...n[idx], targetWord: val, promptEnglish: `Say: ${val}` };
                            return n;
                          });
                        }}
                        className="w-full px-2.5 py-1 border border-slate-200 rounded-md text-xs font-bold font-['Outfit'] outline-hidden"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveCheckpoint(idx)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-md cursor-pointer shrink-0"
                      title="Remove checkpoint"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black text-xs flex items-center gap-2 shadow-sm transition-transform hover:scale-102 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save & Publish Lesson</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
