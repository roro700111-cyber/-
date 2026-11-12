import React, { useEffect, useRef, useState } from 'react';
import { Printer, ArrowRight, ExternalLink, Volume2, CheckCircle2, Share2, Camera } from 'lucide-react';
import { StudentProfile } from '../../types';
import { sounds } from '../../utils/audio';
import { ShareAchievementModal } from './ShareAchievementModal';

interface PrintTabCertificateProps {
  profile: StudentProfile;
  onBack: () => void;
  onUpdateProfile?: (updated: Partial<StudentProfile>) => void;
}

export const PrintTabCertificate: React.FC<PrintTabCertificateProps> = ({ profile, onBack, onUpdateProfile }) => {
  const certRef = useRef<HTMLDivElement>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  useEffect(() => {
    // Play celebratory sound
    sounds.playVictoryWin();

    // Automatically trigger print dialog after slight delay for fonts and images
    const timer = setTimeout(() => {
      window.print();
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  const handlePrintAgain = () => {
    sounds.playClick();
    window.print();
  };

  const certificateSerial = `EWR-${new Date().getFullYear()}-${profile.name.slice(0, 3).toUpperCase() || 'STAR'}-9821`;

  return (
    <div className="max-w-5xl mx-auto py-2 space-y-6">
      {/* Print Tab Action Header (Hidden during printing) */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-amber-300 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة للمنصة</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-slate-800">
                🖨️ تبويب الطباعة ومعاينة الشهادة الرسمية
              </span>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold">
                جاهزة للطباعة فوراً
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              يمكنك طباعة الشهادة مباشرة أو حفظها كملف PDF بجودة عالية بمقاس A4 أفقي
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <button
            onClick={() => {
              sounds.playClick();
              setIsShareModalOpen(true);
            }}
            className="px-4 py-2.5 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-transform hover:scale-105 cursor-pointer"
            title="مشاركة صورتك مع الشهادة أو رابط الإنجاز عبر تطبيقات التواصل الاجتماعي على جهازك"
          >
            <Share2 className="w-4 h-4" />
            <span>مشاركة الإنجاز 📲</span>
          </button>

          <button
            onClick={handlePrintAgain}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black text-xs flex items-center gap-2 shadow-sm transition-transform hover:scale-105 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة الشهادة الآن 🖨️</span>
          </button>

          <a
            href="?tab=print"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            title="فتح صفحة الطباعة في تبويب متصفح مستقل"
          >
            <ExternalLink className="w-4 h-4 text-amber-700" />
            <span className="hidden md:inline">فتح في تبويب متصفح مستقل</span>
          </a>
        </div>
      </div>

      {/* Printable Certificate Frame */}
      <div
        ref={certRef}
        id="printable-certificate"
        className="bg-amber-50/40 p-6 sm:p-10 rounded-3xl border-8 border-double border-amber-400 shadow-2xl relative overflow-hidden text-center select-none max-w-4xl mx-auto"
        style={{
          backgroundImage: 'radial-gradient(circle at center, rgba(254, 243, 199, 0.6) 0%, rgba(255, 255, 255, 0.98) 100%)',
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
              <span className="text-xs font-black text-emerald-700">
                {profile.placementLevel || 'متقدم (Honor)'}
              </span>
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
              <span className="text-lg mb-0.5">⭐</span>
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

      {/* Share Achievement Modal */}
      <ShareAchievementModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        profile={profile}
        onUpdateProfile={onUpdateProfile}
      />
    </div>
  );
};
