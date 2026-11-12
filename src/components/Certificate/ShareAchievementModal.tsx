import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Share2,
  Download,
  Copy,
  Check,
  Camera,
  Image as ImageIcon,
  Sparkles,
  ExternalLink,
  MessageCircle,
  Send,
  Facebook,
  Twitter,
  Trash2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { StudentProfile } from '../../types';
import { sounds } from '../../utils/audio';

interface ShareAchievementModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: StudentProfile;
  onUpdateProfile?: (updated: Partial<StudentProfile>) => void;
}

export const ShareAchievementModal: React.FC<ShareAchievementModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [studentPhoto, setStudentPhoto] = useState<string | undefined>(profile.studentPhoto);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewDataUrl, setPreviewDataUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const [canShareNative, setCanShareNative] = useState(false);
  const [canShareFiles, setCanShareFiles] = useState(false);

  const certificateSerial = `EWR-${new Date().getFullYear()}-${profile.name.slice(0, 3).toUpperCase() || 'STAR'}-9821`;
  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?cert=${encodeURIComponent(profile.name)}`
    : 'https://english-with-rona.edu';

  const shareText = `🎉 حصل البطل (${profile.name}) على شهادة الإتقان والتميز في اللغة الإنجليزية من منصة المعلمة رانيا عزت (English With Rona) بمدرسة زيد بن حارثة الرسمية لغات! ⭐ ${profile.stars} نجمة و 🚀 ${profile.xp} نقطة خبرة. شاهد الإنجاز:`;

  // Detect Web Share API capability
  useEffect(() => {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      setCanShareNative(true);
      if (typeof navigator.canShare === 'function') {
        try {
          const testFile = new File(['test'], 'test.png', { type: 'image/png' });
          if (navigator.canShare({ files: [testFile] })) {
            setCanShareFiles(true);
          }
        } catch {
          setCanShareFiles(false);
        }
      }
    }
  }, []);

  // Play celebration confetti on open
  useEffect(() => {
    if (isOpen) {
      sounds.playSuccess();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
      setStudentPhoto(profile.studentPhoto);
    }
  }, [isOpen, profile.studentPhoto]);

  // Handle Photo Upload from User
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('يرجى اختيار ملف صورة صالح (JPEG أو PNG).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setStudentPhoto(dataUrl);
      if (onUpdateProfile) {
        onUpdateProfile({ studentPhoto: dataUrl });
      }
      sounds.playPop();
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setStudentPhoto(undefined);
    if (onUpdateProfile) {
      onUpdateProfile({ studentPhoto: undefined });
    }
    sounds.playClick();
  };

  // Helper to load image for canvas
  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(e);
      img.src = src;
    });
  };

  // Render Certificate Card on Canvas
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsGenerating(true);

    const renderCanvas = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = 1200;
      const height = 800;
      canvas.width = width;
      canvas.height = height;

      // 1. Background Gradient
      const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 80, width / 2, height / 2, width / 1.5);
      bgGrad.addColorStop(0, '#fffbeb');
      bgGrad.addColorStop(0.6, '#fef3c7');
      bgGrad.addColorStop(1, '#fde68a');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Subtle Background Patterns
      ctx.strokeStyle = 'rgba(217, 119, 6, 0.08)';
      ctx.lineWidth = 1;
      for (let i = 20; i < width; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
      }

      // 2. Outer & Inner Golden Borders
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 14;
      ctx.strokeRect(18, 18, width - 36, height - 36);

      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 3;
      ctx.strokeRect(32, 32, width - 64, height - 64);

      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.strokeRect(40, 40, width - 80, height - 80);

      // 3. Header Text - Arabic & School
      ctx.direction = 'rtl';
      ctx.textAlign = 'center';

      ctx.font = 'bold 20px "Readex Pro", "Segoe UI", sans-serif';
      ctx.fillStyle = '#1e293b';
      ctx.fillText('جمهورية مصر العربية · وزارة التربية والتعليم', width / 2, 85);

      ctx.font = 'bold 22px "Readex Pro", "Segoe UI", sans-serif';
      ctx.fillStyle = '#78350f';
      ctx.fillText('مدرسة زيد بن حارثة الرسمية لغات بدمياط الجديدة', width / 2, 118);

      // Header English
      ctx.direction = 'ltr';
      ctx.font = 'bold 15px "Outfit", sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.fillText('Zaid Ibn Haritha Official Language School · English Department', width / 2, 142);

      // Divider line
      ctx.beginPath();
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 3;
      ctx.moveTo(200, 160);
      ctx.lineTo(width - 200, 160);
      ctx.stroke();

      // Certificate Title
      ctx.font = '900 18px "Outfit", sans-serif';
      ctx.fillStyle = '#b45309';
      ctx.fillText('CERTIFICATE OF ACHIEVEMENT & EXCELLENCE', width / 2, 195);

      ctx.direction = 'rtl';
      ctx.font = '900 42px "Readex Pro", "Segoe UI", sans-serif';
      ctx.fillStyle = '#0f172a';
      ctx.fillText('شهادة إنجاز وتفوق في اللغة الإنجليزية', width / 2, 245);

      // Decorative under-title line
      const titleGrad = ctx.createLinearGradient(400, 0, 800, 0);
      titleGrad.addColorStop(0, 'rgba(245, 158, 11, 0)');
      titleGrad.addColorStop(0.5, 'rgba(245, 158, 11, 1)');
      titleGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
      ctx.strokeStyle = titleGrad;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(420, 260);
      ctx.lineTo(780, 260);
      ctx.stroke();

      // Recipient intro
      ctx.font = 'bold 20px "Readex Pro", sans-serif';
      ctx.fillStyle = '#475569';
      ctx.fillText('تُمنح هذه الشهادة بكل فخر واعتزاز للبطل المتميز:', width / 2, 305);

      // Student Name with Golden Plate
      ctx.font = '900 48px "Readex Pro", "Outfit", sans-serif';
      ctx.fillStyle = '#78350f';
      ctx.fillText(profile.name, width / 2, 365);

      // Under name border
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(width / 2 - 200, 380);
      ctx.lineTo(width / 2 + 200, 380);
      ctx.stroke();

      // Laudatory Description
      ctx.font = '500 19px "Readex Pro", sans-serif';
      ctx.fillStyle = '#334155';
      ctx.fillText(
        'تقديراً لاجتيازه بنجاح اختبارات تحديد المستوى وإتقان المفردات الأساسية والفيديوهات التفاعلية،',
        width / 2,
        425
      );
      ctx.fillText(
        'محققا رصيدا استثنائيا من النجوم ونقاط الخبرة مع المعلمة رانيا عزت.',
        width / 2,
        455
      );

      // Stats Pill Container
      const pillY = 485;
      const pillW = 680;
      const pillH = 75;
      const pillX = (width - pillW) / 2;

      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 4;
      ctx.beginPath();
      ctx.roundRect(pillX, pillY, pillW, pillH, 18);
      ctx.fill();
      ctx.shadowColor = 'transparent';
      ctx.strokeStyle = '#fde68a';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Stats content inside pill
      ctx.direction = 'rtl';
      ctx.font = 'bold 15px "Readex Pro", sans-serif';
      ctx.fillStyle = '#64748b';

      // Stars
      ctx.fillText('النجوم المكتسبة', pillX + pillW * 0.82, pillY + 30);
      ctx.font = '900 24px monospace';
      ctx.fillStyle = '#d97706';
      ctx.fillText(`⭐ ${profile.stars}`, pillX + pillW * 0.82, pillY + 60);

      // Mastery Level
      ctx.font = 'bold 15px "Readex Pro", sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.fillText('مستوى الإتقان', pillX + pillW * 0.5, pillY + 30);
      ctx.font = '900 20px "Readex Pro", sans-serif';
      ctx.fillStyle = '#059669';
      ctx.fillText(profile.placementLevel || 'متقدم (Honor)', pillX + pillW * 0.5, pillY + 60);

      // XP
      ctx.font = 'bold 15px "Readex Pro", sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.fillText('نقاط الخبرة XP', pillX + pillW * 0.18, pillY + 30);
      ctx.font = '900 24px monospace';
      ctx.fillStyle = '#ea580c';
      ctx.fillText(`🚀 ${profile.xp}`, pillX + pillW * 0.18, pillY + 60);

      // Draw Photos: Teacher Mascot on right, Student Photo/Avatar on left
      try {
        // Teacher mascot photo
        const teacherImg = await loadImage(
          '/assets/aistudio/WhatsApp_Image_2026-11-05_at_23.16.55_6a80a945.jpeg'
        );

        // Teacher Frame (Right Side)
        const tSize = 130;
        const tX = width - 210;
        const tY = 270;

        ctx.save();
        ctx.beginPath();
        ctx.arc(tX + tSize / 2, tY + tSize / 2, tSize / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(teacherImg, tX, tY, tSize, tSize);
        ctx.restore();

        // Golden circular border for teacher
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(tX + tSize / 2, tY + tSize / 2, tSize / 2, 0, Math.PI * 2);
        ctx.stroke();

        ctx.font = 'bold 14px "Readex Pro", sans-serif';
        ctx.fillStyle = '#78350f';
        ctx.textAlign = 'center';
        ctx.fillText('المعلمة رانيا عزت', tX + tSize / 2, tY + tSize + 22);
      } catch (err) {
        console.warn('Teacher image load err:', err);
      }

      // Student Photo or Avatar Frame (Left Side)
      const sSize = 130;
      const sX = 80;
      const sY = 270;

      if (studentPhoto) {
        try {
          const studentImg = await loadImage(studentPhoto);
          ctx.save();
          ctx.beginPath();
          ctx.arc(sX + sSize / 2, sY + sSize / 2, sSize / 2, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(studentImg, sX, sY, sSize, sSize);
          ctx.restore();

          // Border for student photo
          ctx.strokeStyle = '#059669';
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.arc(sX + sSize / 2, sY + sSize / 2, sSize / 2, 0, Math.PI * 2);
          ctx.stroke();

          ctx.font = 'bold 14px "Readex Pro", sans-serif';
          ctx.fillStyle = '#065f46';
          ctx.textAlign = 'center';
          ctx.fillText('صورة البطل المتميز 🌟', sX + sSize / 2, sY + sSize + 22);
        } catch {
          drawDefaultAvatar(ctx, sX, sY, sSize);
        }
      } else {
        drawDefaultAvatar(ctx, sX, sY, sSize);
      }

      // Footer - Stamp, Verification, & Signature
      const footerY = 660;

      // Golden Stamp Badge (Center-Left)
      const stampX = 300;
      const stampY = footerY + 20;
      ctx.save();
      ctx.translate(stampX, stampY);
      ctx.rotate(-0.06);

      ctx.fillStyle = 'rgba(254, 243, 199, 0.9)';
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 4;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.arc(0, 0, 48, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.direction = 'rtl';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#b45309';
      ctx.font = 'bold 16px "Readex Pro", sans-serif';
      ctx.fillText('⭐ معتمد ⭐', 0, -8);
      ctx.font = '900 13px "Outfit", sans-serif';
      ctx.fillText('CERTIFIED', 0, 14);
      ctx.font = 'bold 10px monospace';
      ctx.fillText('ENGLISH WITH RONA', 0, 30);
      ctx.restore();

      // Serial & Date (Center)
      ctx.direction = 'rtl';
      ctx.textAlign = 'center';
      ctx.font = 'bold 15px "Readex Pro", sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.fillText(`تاريخ الإصدار: ${new Date().toLocaleDateString('ar-EG')}`, width / 2, footerY + 15);
      ctx.font = 'bold 13px monospace';
      ctx.fillText(`كود التحقق: ${certificateSerial}`, width / 2, footerY + 38);

      // Teacher signature & Title (Center-Right)
      ctx.textAlign = 'center';
      ctx.font = 'bold 14px "Readex Pro", sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.fillText('إشراف واعتماد:', width - 280, footerY);
      ctx.font = '900 20px "Readex Pro", sans-serif';
      ctx.fillStyle = '#0f172a';
      ctx.fillText('رانيا عزت محمد السيد', width - 280, footerY + 28);
      ctx.font = 'bold 13px "Readex Pro", sans-serif';
      ctx.fillStyle = '#b45309';
      ctx.fillText('معلم خبير لغة إنجليزية · مسؤول تعلم ذكي', width - 280, footerY + 48);
      ctx.font = '11px "Readex Pro", sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('مدرسة زيد بن حارثة الرسمية لغات بدمياط الجديدة', width - 280, footerY + 66);

      // Generate Data URL for preview
      if (isMounted) {
        setPreviewDataUrl(canvas.toDataURL('image/png'));
        setIsGenerating(false);
      }
    };

    const drawDefaultAvatar = (
      ctx: CanvasRenderingContext2D,
      sX: number,
      sY: number,
      sSize: number
    ) => {
      ctx.fillStyle = '#fef3c7';
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(sX + sSize / 2, sY + sSize / 2, sSize / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.font = '55px "Segoe UI Emoji", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(profile.avatar || '🦁', sX + sSize / 2, sY + sSize / 2 + 18);

      ctx.font = 'bold 14px "Readex Pro", sans-serif';
      ctx.fillStyle = '#78350f';
      ctx.fillText('شعار البطل', sX + sSize / 2, sY + sSize + 22);
    };

    renderCanvas();

    return () => {
      isMounted = false;
    };
  }, [isOpen, profile, studentPhoto]);

  // Convert canvas to File object
  const getCertificateFile = (): Promise<File | null> => {
    return new Promise((resolve) => {
      const canvas = canvasRef.current;
      if (!canvas) return resolve(null);
      canvas.toBlob((blob) => {
        if (!blob) return resolve(null);
        const fileName = `Shahada-${profile.name.replace(/\s+/g, '_')}.png`;
        const file = new File([blob], fileName, { type: 'image/png' });
        resolve(file);
      }, 'image/png');
    });
  };

  // 1. Primary Action: Native Web Share API
  const handleNativeShare = async () => {
    sounds.playClick();
    setShareStatus('جاري تجهيز المشاركة عبر تطبيقات جهازك...');

    try {
      const file = await getCertificateFile();

      // Check if file sharing is possible
      if (file && canShareFiles && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `شهادة إنجاز وتفوق في اللغة الإنجليزية - ${profile.name}`,
          text: shareText,
          files: [file],
          url: shareUrl,
        });
        setShareStatus('تمت المشاركة بنجاح! 🎉');
        sounds.playSuccess();
      } else if (navigator.share) {
        // Fallback to text & url if files are not supported by the browser
        await navigator.share({
          title: `شهادة إنجاز وتفوق في اللغة الإنجليزية - ${profile.name}`,
          text: `${shareText}\n${shareUrl}`,
          url: shareUrl,
        });
        setShareStatus('تم فتح قائمة المشاركة بنجاح! 🚀');
        sounds.playSuccess();
      } else {
        setShareStatus('خاصية المشاركة التلقائية غير مدعومة على هذا المتصفح، يمكنك استخدام الأزرار أدناه!');
      }
    } catch (err: unknown) {
      if ((err as Error)?.name !== 'AbortError') {
        console.warn('Share error:', err);
        setShareStatus('تم إلغاء المشاركة أو حدث تنبيه، يمكنك استخدام خيارات المشاركة السريعة أدناه.');
      } else {
        setShareStatus(null);
      }
    }
  };

  // 2. Direct Social Links
  const handleShareWhatsApp = () => {
    sounds.playClick();
    const encoded = encodeURIComponent(`${shareText}\n${shareUrl}`);
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encoded}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const handleShareTelegram = () => {
    sounds.playClick();
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(telegramUrl, '_blank', 'noopener,noreferrer');
  };

  const handleShareFacebook = () => {
    sounds.playClick();
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
    window.open(fbUrl, '_blank', 'noopener,noreferrer');
  };

  const handleShareTwitter = () => {
    sounds.playClick();
    const twUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twUrl, '_blank', 'noopener,noreferrer');
  };

  // 3. Download Certificate Image
  const handleDownloadImage = () => {
    sounds.playClick();
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `شهادة_تفوق_${profile.name}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => link.remove(), 100);

      sounds.playSuccess();
      setShareStatus('تم حفظ صورة الشهادة في جهازك بنجاح! 🖼️');
    } catch (e) {
      console.warn('Download error:', e);
    }
  };

  // 4. Copy Link
  const handleCopyLink = async () => {
    sounds.playClick();
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      } else {
        const input = document.createElement('textarea');
        input.value = `${shareText}\n${shareUrl}`;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopiedLink(true);
      sounds.playPop();
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      setCopiedLink(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-sm animate-fade-in print:hidden overflow-y-auto">
      {/* Hidden high-res canvas used for rendering and file generation */}
      <canvas ref={canvasRef} className="hidden" />

      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-amber-300 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Modal Top Bar */}
        <div className="bg-linear-to-r from-amber-500 via-orange-500 to-amber-600 p-4 sm:p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shrink-0 shadow-xs">
              <Share2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black leading-tight">
                مشاركة شهادة الإنجاز والتفوق 🎓
              </h3>
              <p className="text-[11px] sm:text-xs text-amber-100 font-medium">
                شارك صورتك مع الشهادة المعتمدة أو رابط إنجازك عبر تطبيقات التواصل الاجتماعي
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors cursor-pointer shrink-0"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* Section 1: Student Photo Personalization */}
          <div className="bg-amber-50/70 rounded-2xl p-4 border border-amber-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">📸</span>
                <span className="text-xs sm:text-sm font-black text-amber-950">
                  تضمين صورتك الشخصية على الشهادة (اختياري)
                </span>
              </div>
              {studentPhoto && (
                <button
                  onClick={handleRemovePhoto}
                  className="text-[11px] text-red-600 hover:text-red-700 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>إزالة الصورة</span>
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Photo Avatar Preview */}
              <div className="relative group shrink-0">
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-3 border-amber-400 bg-white shadow-sm flex items-center justify-center">
                  {studentPhoto ? (
                    <img
                      src={studentPhoto}
                      alt={profile.name}
                      className="w-full h-full object-cover object-center"
                    />
                  ) : (
                    <span className="text-4xl">{profile.avatar || '🦁'}</span>
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center shadow-md cursor-pointer transition-transform group-hover:scale-110"
                  title="التقاط أو اختيار صورة"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex-1 text-center sm:text-right space-y-1.5">
                <p className="text-xs text-slate-600">
                  {studentPhoto
                    ? 'ممتاز! صورتك ستظهر بشكل رائع على بطاقة الشهادة بجانب شعار المعلمة رانيا عزت.'
                    : 'يمكنك رفع صورتك الشخصية من الجهاز أو التقاطها بالكاميرا لتظهر رسمياً على الشهادة مع اسمك.'}
                </p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-1.5 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer hover:scale-102"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
                    <span>{studentPhoto ? 'تغيير صورتي الشخصية 📷' : 'إضافة صورتي الشخصية 📷'}</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Visual Certificate Card Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 px-1">
              <span>معاينة صورة الشهادة المجهزة للمشاركة:</span>
              <span className="text-[11px] text-amber-700 font-mono">1200x800 HD</span>
            </div>

            <div className="relative rounded-2xl overflow-hidden border-2 border-amber-300 bg-amber-50 shadow-md group">
              {previewDataUrl ? (
                <img
                  src={previewDataUrl}
                  alt={`شهادة ${profile.name}`}
                  className="w-full h-auto object-cover max-h-56 sm:max-h-64 mx-auto"
                />
              ) : (
                <div className="h-48 flex items-center justify-center text-slate-400 text-xs">
                  جاري تجهيز صورة الشهادة...
                </div>
              )}

              {/* Quick overlay download button */}
              <button
                onClick={handleDownloadImage}
                className="absolute top-2 left-2 px-3 py-1.5 bg-slate-900/80 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md backdrop-blur-xs transition-transform hover:scale-105 cursor-pointer"
                title="تنزيل الصورة مباشرة"
              >
                <Download className="w-3.5 h-3.5" />
                <span>حفظ كصورة</span>
              </button>
            </div>
          </div>

          {/* Section 3: Native Web Share Button (Targeted Primary Feature) */}
          <div className="space-y-3">
            <button
              onClick={handleNativeShare}
              disabled={isGenerating}
              className="w-full py-3.5 px-4 bg-linear-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-lg transition-transform hover:scale-[1.02] cursor-pointer"
            >
              <Share2 className="w-5 h-5 animate-bounce" />
              <span>مشاركة الإنجاز والصورة عبر تطبيقات الجهاز 📲</span>
            </button>
            <p className="text-[11px] text-center text-slate-500">
              يفتح قائمة التطبيقات المثبتة على هاتفك أو حاسوبك (واتساب، تيليجرام، فيسبوك، إنستغرام، وغيرها)
            </p>

            {shareStatus && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs text-center font-bold animate-fade-in">
                {shareStatus}
              </div>
            )}
          </div>

          {/* Section 4: Direct Social Media Shortcuts */}
          <div className="space-y-2.5 pt-1 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-700 block">
              أو شارك مباشرة بنقرة واحدة عبر:
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {/* WhatsApp */}
              <button
                onClick={handleShareWhatsApp}
                className="py-2.5 px-3 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/40 text-[#128C7E] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                title="مشاركة عبر واتساب"
              >
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
                <span>واتساب</span>
              </button>

              {/* Telegram */}
              <button
                onClick={handleShareTelegram}
                className="py-2.5 px-3 rounded-xl bg-[#0088cc]/10 hover:bg-[#0088cc]/20 border border-[#0088cc]/40 text-[#0088cc] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                title="مشاركة عبر تيليجرام"
              >
                <Send className="w-4 h-4 text-[#0088cc]" />
                <span>تيليجرام</span>
              </button>

              {/* Facebook */}
              <button
                onClick={handleShareFacebook}
                className="py-2.5 px-3 rounded-xl bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border border-[#1877F2]/40 text-[#1877F2] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                title="مشاركة عبر فيسبوك"
              >
                <Facebook className="w-4 h-4 text-[#1877F2]" />
                <span>فيسبوك</span>
              </button>

              {/* Twitter / X */}
              <button
                onClick={handleShareTwitter}
                className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                title="مشاركة عبر منصة إكس (تويتر)"
              >
                <Twitter className="w-4 h-4 text-slate-800" />
                <span>منصة X</span>
              </button>
            </div>
          </div>

          {/* Section 5: Download & Copy Link */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-100">
            <button
              onClick={handleDownloadImage}
              className="py-2.5 px-3 bg-amber-100/80 hover:bg-amber-200 text-amber-950 border border-amber-300 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-amber-700" />
              <span>تنزيل صورة الشهادة (PNG)</span>
            </button>

            <button
              onClick={handleCopyLink}
              className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer border ${
                copiedLink
                  ? 'bg-emerald-500 text-white border-emerald-600'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
              }`}
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>تم نسخ الرابط بنجاح! ✅</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-600" />
                  <span>نسخ رابط الإنجاز 📋</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 px-5 shrink-0">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>English With Rona · مدرسة زيد بن حارثة الرسمية لغات</span>
          </span>
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="font-bold text-slate-700 hover:text-slate-900 cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
