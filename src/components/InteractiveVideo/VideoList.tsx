import React from 'react';
import { Play, Sparkles, Clock, Users, PlusCircle, CheckCircle2 } from 'lucide-react';
import { InteractiveVideo } from '../../types';
import { sounds } from '../../utils/audio';

interface VideoListProps {
  videos: InteractiveVideo[];
  completedVideos: string[];
  onSelectVideo: (video: InteractiveVideo) => void;
  onOpenCreator: () => void;
}

interface VideoCardItemProps {
  video: InteractiveVideo;
  isDone: boolean;
  onSelect: () => void;
}

const VideoCardItem: React.FC<VideoCardItemProps> = ({ video, isDone, onSelect }) => {
  const [imgError, setImgError] = React.useState(false);

  // Normalize path from /src/assets/ to /assets/
  const cleanThumb = (video.thumbnailUrl || '').replace('/src/assets/', '/assets/');

  // Thematic visual config for fallback and badge
  const themeConfig = {
    safari: {
      gradient: 'from-amber-400 via-orange-400 to-amber-500',
      emoji: '🦁',
      label: 'Safari Animals',
      bgPattern: 'bg-amber-50',
    },
    phonics: {
      gradient: 'from-emerald-400 via-teal-400 to-cyan-500',
      emoji: '🎵',
      label: 'Singing Phonics',
      bgPattern: 'bg-emerald-50',
    },
    space: {
      gradient: 'from-indigo-500 via-purple-500 to-pink-500',
      emoji: '🚀',
      label: 'Space Explorer',
      bgPattern: 'bg-indigo-50',
    },
  }[video.theme as 'safari' | 'phonics' | 'space'] || {
    gradient: 'from-amber-400 via-orange-400 to-rose-400',
    emoji: '🎬',
    label: 'English Lesson',
    bgPattern: 'bg-amber-50',
  };

  return (
    <div className="bg-white rounded-3xl overflow-hidden border-2 border-amber-200/90 shadow-md hover:shadow-xl transition-all flex flex-col group hover:-translate-y-1 duration-300">
      {/* Thumbnail Container - Clickable to open and play video */}
      <div
        onClick={() => {
          sounds.playClick();
          onSelect();
        }}
        className={`relative aspect-video w-full overflow-hidden ${themeConfig.bgPattern} flex items-center justify-center cursor-pointer`}
      >
        {!imgError && cleanThumb ? (
          <img
            src={cleanThumb}
            alt={video.title}
            onError={() => setImgError(true)}
            loading="eager"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-102"
          />
        ) : (
          /* Vibrant Illustrated Fallback - Never a black box! */
          <div className={`w-full h-full bg-gradient-to-br ${themeConfig.gradient} flex flex-col items-center justify-center p-4 text-white relative overflow-hidden text-center`}>
            <div className="text-5xl sm:text-6xl mb-2 animate-bounce" style={{ animationDuration: '3s' }}>
              {themeConfig.emoji}
            </div>
            <h5 className="font-black text-base sm:text-lg drop-shadow-md font-['Outfit'] line-clamp-1">
              {video.title}
            </h5>
            <span className="text-xs bg-white/25 px-2.5 py-0.5 rounded-full font-bold mt-1 text-white shadow-xs">
              {themeConfig.label}
            </span>
          </div>
        )}

        {/* Hover Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-14 h-14 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center shadow-xl transform group-hover:scale-110 transition-transform">
            <Play className="w-7 h-7 fill-slate-950 ml-0.5" />
          </div>
        </div>

        {/* Crisp soft gradient overlay at bottom only for badges */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent pointer-events-none" />

        {/* Duration Badge */}
        <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-xl text-white text-[11px] font-mono tabular-nums flex items-center gap-1 shadow-sm">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>{video.durationSeconds}s</span>
        </div>

        {/* Checkpoint Count Badge */}
        <div className="absolute top-3 right-3 bg-amber-500/95 text-white px-2.5 py-1 rounded-xl text-[11px] font-black flex items-center gap-1 shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{video.checkpoints.length} Checkpoints</span>
        </div>

        {/* Completed stamp */}
        {isDone && (
          <div className="absolute top-3 left-3 bg-emerald-600 text-white px-2.5 py-1 rounded-xl text-[11px] font-black flex items-center gap-1 shadow-md">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Completed 🎉</span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2 font-semibold">
            <span className="bg-amber-100/90 text-amber-900 px-2 py-0.5 rounded-md font-bold text-[10px]">
              {video.ageGroup}
            </span>
            <span>·</span>
            <span className="text-amber-700 font-black">{video.level}</span>
          </div>

          <h4 className="text-lg font-black text-slate-800 mb-1.5 group-hover:text-amber-600 transition-colors font-['Outfit']">
            {video.title}
          </h4>
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
            {video.description}
          </p>
        </div>

        {/* Action button */}
        <button
          onClick={() => {
            sounds.playClick();
            onSelect();
          }}
          className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 transition-all hover:scale-102 active:scale-98 cursor-pointer"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>شاهد وتفاعل مع الفيديو ➔</span>
        </button>
      </div>
    </div>
  );
};

export const VideoList: React.FC<VideoListProps> = ({
  videos,
  completedVideos,
  onSelectVideo,
  onOpenCreator,
}) => {
  return (
    <div>
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">🎬</span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">
              الفيديوهات التعليمية التفاعلية للأطفال
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-2xl">
            فيديوهات شيقة تتوقف ذاتياً عند محطات ذكية لتشجيع طفلك على نطق الكلمات الإنجليزية بالميكروفون، وحل الألغاز مع المعلمة رانيا.
          </p>
        </div>

        <button
          onClick={onOpenCreator}
          className="flex items-center gap-2 text-xs font-black text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 px-4 py-2.5 rounded-2xl transition-all cursor-pointer shrink-0 shadow-xs hover:scale-105"
        >
          <PlusCircle className="w-4 h-4 text-amber-600" />
          <span>إنشاء فيديو تفاعلي جديد</span>
        </button>
      </div>

      {/* Grid of Videos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {videos.map((video) => {
          const isDone = completedVideos.includes(video.id);
          return (
            <VideoCardItem
              key={video.id}
              video={video}
              isDone={isDone}
              onSelect={() => onSelectVideo(video)}
            />
          );
        })}
      </div>
    </div>
  );
};
