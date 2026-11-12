import React, { useRef, useState } from 'react';
import { Lock, Unlock, CheckCircle2, Award, Star, Printer, Share2, Sparkles, Volume2, ArrowLeft, Play, Camera } from 'lucide-react';
import confetti from 'canvas-confetti';
import { StudentProfile } from '../../types';
import { sounds } from '../../utils/audio';
import { ShareAchievementModal } from './ShareAchievementModal';

interface CertificateViewProps {
  profile: StudentProfile;
  onNavigateTab: (tab: 'games' | 'videos' | 'placement' | 'rewards') => void;
  onOpenPlacementTest: () => void;
  onOpenPrintTab?: () => void;
  onUpdateProfile?: (updated: Partial<StudentProfile>) => void;
}

export const CertificateView: React.FC<CertificateViewProps> = ({
  profile,
  onNavigateTab,
  onOpenPlacementTest,
  onOpenPrintTab,
  onUpdateProfile,
}) => {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // The 4 Core Missions required to unlock the Certificate
  const missions = [
    {
      id: 'placement',
      titleArabic: 'اختبار تحديد المستوى الأولي',
      descriptionArabic: 'تقييم مستواك الأولي في المفردات ونطق الحروف',
      isCompleted: !!profile.placementTestCompleted,
      actionLabel: 'ابدأ الاختبار 🎯',
      onAction: onOpenPlacementTest,
    },
    {
      id: 'games',
      titleArabic: 'إكمال 5 جولات في ألعاب المفردات',
      descriptionArabic: `أكملت ${profile.gamesPlayed} من 5 جولات تدريبية`,
      isCompleted: profile.gamesPlayed >= 5,
      actionLabel: 'العب الآن 🎮',
      onAction: () => onNavigateTab('games'),
    },
    {
      id: 'videos',
      titleArabic: 'إنجاز فيديوهين تفاعليين بنجاح',
      descriptionArabic: `أنجزت ${profile.completedVideos.length} من 2 فيديو`,
      isCompleted: profile.completedVideos.length >= 2,
      actionLabel: 'شاهد الفيديوهات 🎬',
      onAction: () => onNavigateTab('videos'),
    },
    {
      id: 'stars',
      titleArabic: 'جمع 50 نجمة وملصقين سحريين',
      descriptionArabic: `رصيدك الحالي: ${profile.stars} نجمة و ${profile.unlockedStickers.length} ملصق`,
      isCompleted: profile.stars >= 50 || profile.unlockedStickers.length >= 2,
      actionLabel: 'ألبوم الملصقات ⭐',
      onAction: () => onNavigateTab('rewards'),
    },
  ];

  const completedCount = missions.filter((m) => m.isCompleted).length;
  const isUnlocked = completedCount === missions.length;
  const progressPercent = Math.round((completedCount / missions.length) * 100);

  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = () => {
    sounds.playClick();
    setIsPrinting(true);

    // 1. Immediately switch to the dedicated Print Tab inside the app
    if (onOpenPrintTab) {
      onOpenPrintTab();
    }

    // 2. Also open in new browser tab via trusted anchor link if user desires standalone tab
    try {
      const printUrl = `${window.location.origin}${window.location.pathname}?tab=print`;
      const link = document.createElement('a');
      link.href = printUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => link.remove(), 100);
    } catch {
      // ignore
    }

    // 3. Trigger native print dialog
    setTimeout(() => {
      try {
        window.print();
      } catch (e) {
        console.warn('window.print error:', e);
      }
      setIsPrinting(false);
    }, 400);
  };

  const handleCelebrationSound = () => {
    sounds.playVictoryWin();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.5 },
    });
  };

  const certificateSerial = `EWR-${new Date().getFullYear()}-${profile.name.slice(0, 3).toUpperCase() || 'STAR'}-9821`;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 print:hidden">
        <div className="text-center md:text-right space-y-2">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <span className="text-xs font-black bg-amber-100 text-amber-800 px-3 py-1 rounded-full">
              {isUnlocked ? 'مبارك! الشهادة مفتوحة ومكتملة 🎉' : 'شهادة إنجاز التخرج والتميز 🎓'}
            </span>
            <span className="text-xs font-bold text-slate-500">
              {completedCount} من {missions.length} مهمات منجزة
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            شهادة إتقان اللغة الإنجليزية المعتمدة
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed">
            شهادة رسمية تصدر باسم الطالب وتعتمدها المعلمة رانيا عزت بعد اجتياز جميع مهام التطبيق،
            تتضمن درجات التميز في المفردات والاستماع واللفظ الصحيح.
          </p>
        </div>

        {/* Status Shield Badge */}
        <div className="flex flex-col items-center justify-center p-5 rounded-2xl border-2 shrink-0 bg-amber-50/60 border-amber-200 w-44 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-2 shadow-xs bg-white border border-amber-300">
            {isUnlocked ? '🏆' : '🔒'}
          </div>
          <span className="text-xs font-black text-slate-800 mb-1">
            {isUnlocked ? 'الشهادة متاحة' : 'الشهادة مغلقة'}
          </span>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-1">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isUnlocked ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-[10px] font-mono font-bold text-slate-500 mt-1">
            {progressPercent}% مكتمل
          </span>
        </div>
      </div>

      {/* Main Container: Unlocked Certificate or Locked Missions View */}
      {isUnlocked ? (
        /* ================= UNLOCKED CERTIFICATE ================= */
        <div className="space-y-6">
          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-amber-200 shadow-xs print:hidden">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs font-black text-emerald-800">
                شهادتك الرسمية جاهزة للطباعة والتنزيل!
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  sounds.playClick();
                  setIsShareModalOpen(true);
                }}
                className="px-4 py-2 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-transform hover:scale-105 cursor-pointer"
                title="مشاركة صورتك مع الشهادة أو رابط الإنجاز عبر تطبيقات التواصل الاجتماعي على جهازك"
              >
                <Share2 className="w-4 h-4" />
                <span>مشاركة الإنجاز 📲</span>
              </button>

              <button
                onClick={handlePrint}
                disabled={isPrinting}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-75 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-transform hover:scale-105 cursor-pointer"
                title="طباعة وحفظ الشهادة الرسمية بصيغة PDF عالية الدقة"
              >
                <Printer className={`w-4 h-4 ${isPrinting ? 'animate-pulse' : ''}`} />
                <span>{isPrinting ? 'جاري فتح تبويب الطباعة... 🖨️' : 'فتح تبويب الطباعة 🖨️'}</span>
              </button>

              <button
                onClick={handleCelebrationSound}
                className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                title="إعادة تشغيل مؤثرات الاحتفال والموسيقى"
              >
                <Volume2 className="w-4 h-4 text-amber-600" />
                <span>موسيقى التتويج 🎺</span>
              </button>
            </div>
          </div>

          {/* Printable Certificate Frame */}
          <div
            ref={certificateRef}
            id="printable-certificate"
            className="bg-amber-50/40 p-6 sm:p-10 rounded-3xl border-8 border-double border-amber-400 shadow-2xl relative overflow-hidden text-center select-none"
            style={{
              backgroundImage: 'radial-gradient(circle at center, rgba(254, 243, 199, 0.5) 0%, rgba(255, 255, 255, 0.95) 100%)',
            }}
          >
            {/* Corner Decorative Ornaments */}
            <div className="absolute top-3 left-3 text-2xl text-amber-400">⚜️</div>
            <div className="absolute top-3 right-3 text-2xl text-amber-400">⚜️</div>
            <div className="absolute bottom-3 left-3 text-2xl text-amber-400">⚜️</div>
            <div className="absolute bottom-3 right-3 text-2xl text-amber-400">⚜️</div>

            {/* Inner Border Ring */}
            <div className="border border-amber-300/80 rounded-2xl p-6 sm:p-8">
              {/* Institution & School Official Header */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b-2 border-amber-200/80 pb-6 mb-6">
                <div className="text-center sm:text-right space-y-0.5">
                  <h4 className="text-xs font-black text-slate-800">جمهورية مصر العربية · وزارة التربية والتعليم</h4>
                  <p className="text-xs font-bold text-amber-900">
                    مدرسة زيد بن حارثة الرسمية لغات بدمياط الجديدة
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono" dir="ltr">
                    Zaid Ibn Haritha Official Language School
                  </p>
                </div>

                {/* Teacher Rona Cartoon Mascot Photo */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-md shrink-0 bg-slate-900">
                  <img
                    src="/assets/aistudio/WhatsApp_Image_2026-11-05_at_23.16.55_6a80a945.jpeg"
                    alt="English With Rona - شخصية المعلمة رانيا عزت"
                    className="w-full h-full object-cover object-top"
                  />
                </div>

                <div className="text-center sm:text-left space-y-0.5 font-['Outfit']" dir="ltr">
                  <h4 className="text-sm font-black text-amber-600">English With Rona</h4>
                  <p className="text-[11px] font-bold text-slate-600">Official Achievement Award</p>
                  <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                    Kids Excellence Certified
                  </span>
                </div>
              </div>

              {/* Certificate Title */}
              <div className="space-y-1 mb-6">
                <span className="text-xs font-black tracking-widest text-amber-700 uppercase">
                  CERTIFICATE OF COMPLETION & EXCELLENCE
                </span>
                <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
                  شهادة إنجاز وتفوق في اللغة الإنجليزية
                </h1>
                <div className="w-24 h-1 bg-linear-to-r from-amber-400 to-orange-400 mx-auto rounded-full mt-2" />
              </div>

              {/* Recipient Announcement */}
              <p className="text-sm text-slate-600 font-medium mb-2">
                تمنح هذه الشهادة بكل فخر واعتزاز للبطل المتميز:
              </p>

              {/* Student Photo and Name Presentation */}
              <div className="my-3 flex flex-col items-center justify-center gap-2">
                {profile.studentPhoto ? (
                  <div className="relative group">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-4 border-amber-400 shadow-lg ring-4 ring-amber-100 bg-white">
                      <img
                        src={profile.studentPhoto}
                        alt={profile.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      onClick={() => setIsShareModalOpen(true)}
                      className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold shadow-xs cursor-pointer hover:bg-emerald-700 print:hidden flex items-center gap-1"
                      title="تعديل صورتك أو مشاركتها"
                    >
                      <Camera className="w-2.5 h-2.5" />
                      <span>تعديل</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsShareModalOpen(true)}
                    className="group inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100/80 hover:bg-amber-200/90 text-amber-900 border border-amber-300 rounded-full text-[11px] font-bold transition-all shadow-xs cursor-pointer print:hidden"
                    title="أضف صورتك الشخصية لتظهر في الشهادة المعتمدة"
                  >
                    <Camera className="w-3.5 h-3.5 text-amber-600 group-hover:scale-110 transition-transform" />
                    <span>📸 أضف صورتك الشخصية على الشهادة</span>
                  </button>
                )}

                <div>
                  <span className="text-2xl sm:text-4xl font-black text-amber-900 border-b-2 border-amber-400 px-6 sm:px-12 pb-1 inline-block font-['Outfit']">
                    {profile.name}
                  </span>
                </div>
              </div>

              {/* Statement of Mastery */}
              <p className="text-xs sm:text-sm text-slate-700 max-w-2xl mx-auto leading-relaxed my-4">
                تقديراً لاجتيازه بنجاح جميع اختبارات تحديد المستوى، وإتقان نطق المفردات الأساسية عبر الألعاب التفاعلية،
                وإكمال محطات الفيديوهات التعليمية، محققاً رصيداً مميزاً من النجوم ونقاط الخبرة بالمنصة.
              </p>

              {/* Stats & Honors Bar */}
              <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto bg-white/80 border border-amber-200/80 rounded-2xl p-3 my-6 shadow-xs">
                <div className="text-center">
                  <span className="text-[10px] text-slate-500 font-bold block">النجوم المكتسبة</span>
                  <span className="text-base font-black text-amber-600 font-mono">⭐ {profile.stars}</span>
                </div>
                <div className="text-center border-x border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold block">مستوى الإتقان</span>
                  <span className="text-xs font-black text-emerald-700">متقدم (Honor)</span>
                </div>
                <div className="text-center">
                  <span className="text-[10px] text-slate-500 font-bold block">نقاط الخبرة XP</span>
                  <span className="text-base font-black text-orange-600 font-mono">🚀 {profile.xp}</span>
                </div>
              </div>

              {/* Signatures & Golden Stamp */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-amber-200/80 mt-6 text-right">
                {/* Official Golden Stamp */}
                <div className="w-24 h-24 rounded-full border-4 border-dashed border-amber-500 bg-amber-100/60 flex flex-col items-center justify-center text-amber-800 shadow-inner p-2 rotate-6">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-500 mb-0.5" />
                  <span className="text-[9px] font-black">معتمد رسمياً</span>
                  <span className="text-[8px] font-mono font-bold">CERTIFIED</span>
                </div>

                {/* Date & Serial */}
                <div className="text-center sm:text-right text-[11px] text-slate-500 space-y-1">
                  <div>
                    <span className="font-bold">تاريخ الإصدار: </span>
                    <span className="font-mono">{new Date().toLocaleDateString('ar-EG')}</span>
                  </div>
                  <div>
                    <span className="font-bold">كود التحقق: </span>
                    <span className="font-mono text-[10px]">{certificateSerial}</span>
                  </div>
                </div>

                {/* Teacher Signature */}
                <div className="text-center sm:text-left space-y-1">
                  <span className="text-[11px] text-slate-500 block">إشراف واعتماد:</span>
                  <h4 className="text-sm font-black text-slate-900">رانيا عزت محمد السيد</h4>
                  <p className="text-[10px] text-amber-800 font-bold">
                    معلم خبير لغة إنجليزية · مسؤول تعلم ذكي
                  </p>
                  <p className="text-[9px] text-slate-400">مدرسة زيد بن حارثة الرسمية لغات</p>
                </div>
              </div>
            </div>
          </div>

          {/* Post-Certificate Share & Pride Banner */}
          <div className="bg-linear-to-r from-emerald-50 via-teal-50 to-amber-50 rounded-2xl p-4 sm:p-5 border border-emerald-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
            <div className="flex items-center gap-3 text-center sm:text-right">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500 text-white flex items-center justify-center text-xl shrink-0 shadow-xs">
                📲
              </div>
              <div>
                <h4 className="text-sm font-black text-emerald-950">
                  فخور بإنجازك وتفوقك في اللغة الإنجليزية؟
                </h4>
                <p className="text-xs text-emerald-800/80 mt-0.5">
                  شارك بطاقة الشهادة المعتمدة وصورتك الشخصية مع عائلتك وأصدقائك عبر تطبيقات التواصل الاجتماعي المثبتة على جهازك!
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                sounds.playClick();
                setIsShareModalOpen(true);
              }}
              className="px-5 py-2.5 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-black text-xs flex items-center gap-2 shadow-md transition-transform hover:scale-105 cursor-pointer shrink-0"
            >
              <Share2 className="w-4 h-4" />
              <span>مشاركة الإنجاز الآن 🚀</span>
            </button>
          </div>
        </div>
      ) : (
        /* ================= LOCKED CERTIFICATE & MISSIONS CHECKLIST ================= */
        <div className="space-y-6">
          {/* Mission Checklist Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-amber-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  مهام فتح شهادة الإنجاز والتخرج (Missions to Unlock)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  أكمل جميع المهام الـ 4 التالية ليتم فك قفل الشهادة الرسمية المعتمدة فوراً:
                </p>
              </div>
              <span className="text-xs font-mono font-bold bg-amber-100 text-amber-800 px-3 py-1 rounded-full">
                {completedCount} / {missions.length}
              </span>
            </div>

            {/* Missions List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
              {missions.map((mission, idx) => (
                <div
                  key={mission.id}
                  className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 ${
                    mission.isCompleted
                      ? 'bg-emerald-50/60 border-emerald-300'
                      : 'bg-slate-50/80 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        mission.isCompleted
                          ? 'bg-emerald-500 text-white shadow-xs'
                          : 'bg-slate-200 text-slate-400'
                      }`}
                    >
                      {mission.isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Lock className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className={`text-xs font-black ${mission.isCompleted ? 'text-emerald-900' : 'text-slate-800'}`}>
                        {mission.titleArabic}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {mission.descriptionArabic}
                      </p>
                    </div>
                  </div>

                  {mission.isCompleted ? (
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                      مكتملة ✅
                    </span>
                  ) : (
                    <button
                      onClick={mission.onAction}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs hover:scale-105 cursor-pointer shrink-0"
                    >
                      {mission.actionLabel}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Locked Watermark Preview */}
          <div className="relative rounded-3xl overflow-hidden border-4 border-dashed border-slate-300 bg-slate-100/70 p-8 text-center select-none">
            {/* Blurry Ghost Certificate Preview */}
            <div className="filter blur-sm opacity-35 pointer-events-none max-w-xl mx-auto border-4 border-amber-300 rounded-2xl p-6 bg-amber-50">
              <div className="h-8 bg-amber-200 rounded-md w-3/4 mx-auto mb-3" />
              <div className="h-4 bg-slate-300 rounded-md w-1/2 mx-auto mb-4" />
              <div className="h-10 bg-amber-300 rounded-lg w-2/3 mx-auto mb-4" />
              <div className="h-3 bg-slate-300 rounded-md w-full mx-auto mb-2" />
              <div className="h-3 bg-slate-300 rounded-md w-4/5 mx-auto" />
            </div>

            {/* Lock Overlay Shield */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-slate-900/40 backdrop-blur-[2px]">
              <div className="w-16 h-16 rounded-3xl bg-amber-500 text-white flex items-center justify-center text-3xl shadow-xl mb-3 border-2 border-white animate-pulse">
                🔒
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white drop-shadow-md mb-1">
                الشهادة الرسمية مغلقة حالياً
              </h3>
              <p className="text-xs sm:text-sm text-yellow-100 max-w-md mx-auto mb-4 drop-shadow-xs">
                أكمل المهام الـ ({missions.length - completedCount}) المتبقية أعلاه لفتح الشهادة وطباعتها باسم الطالب مع ختم الاعتماد الرسمي!
              </p>

              {!profile.placementTestCompleted && (
                <button
                  onClick={onOpenPlacementTest}
                  className="px-5 py-2.5 bg-linear-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-slate-900 rounded-2xl font-black text-xs shadow-lg transition-transform hover:scale-105 cursor-pointer flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-amber-900" />
                  <span>ابدأ باختبار تحديد المستوى الآن 🎯</span>
                </button>
              )}

              <button
                onClick={() => {
                  sounds.playClick();
                  setIsShareModalOpen(true);
                }}
                className="mt-3 px-4 py-2 bg-white/20 hover:bg-white/30 text-white border border-white/40 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                title="معاينة بطاقة الشهادة ومشاركتها"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>معاينة ومشاركة بطاقة الإنجاز 📲</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Achievement Modal with Native Sharing & Photo Personalization */}
      <ShareAchievementModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        profile={profile}
        onUpdateProfile={onUpdateProfile}
      />
    </div>
  );
};
