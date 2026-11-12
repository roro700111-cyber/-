import React, { useState } from 'react';
import {
  X,
  Mail,
  Send,
  Share2,
  ExternalLink,
  Copy,
  Check,
  Settings,
  Sparkles,
  Youtube,
  Instagram,
  Twitter,
  Facebook,
  MessageCircle,
  Award,
  Star,
  CheckCircle2,
  Heart,
  Globe,
  RefreshCw,
} from 'lucide-react';
import { SocialContactConfig, StudentProfile } from '../../types';
import { sounds } from '../../utils/audio';

interface SocialConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  socialConfig: SocialContactConfig;
  onUpdateSocialConfig: (config: SocialContactConfig) => void;
  profile: StudentProfile;
}

export const SocialConnectModal: React.FC<SocialConnectModalProps> = ({
  isOpen,
  onClose,
  socialConfig,
  onUpdateSocialConfig,
  profile,
}) => {
  const [activeTab, setActiveTab] = useState<'social' | 'email' | 'share' | 'settings'>('social');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Email form state
  const [senderName, setSenderName] = useState(profile.name || 'ولي أمر الطالب');
  const [emailSubject, setEmailSubject] = useState('مشاركة تقدم طفلي في تطبيق English With Rona 🌟');
  const [emailNotes, setEmailNotes] = useState(
    `السلام عليكم ورحمة الله وبركاته، المعلمة الفاضلة رونا،\n\nأود مشاركة تقدم طفلي (${profile.name}) في تطبيق تعليم اللغة الإنجليزية:\n- عدد النجوم المكتسبة: ${profile.stars} ⭐\n- مجموع نقاط الخبرة (XP): ${profile.xp} 🚀\n- الألعاب المنجزة: ${profile.gamesPlayed}\n\nنشكركم على هذه المنصة الممتعة والمميزة!`
  );

  // Settings form state
  const [editConfig, setEditConfig] = useState<SocialContactConfig>(socialConfig);
  const [settingsSaved, setSettingsSaved] = useState(false);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    sounds.playPop();
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSendEmail = () => {
    sounds.playClick();
    const encodedSubject = encodeURIComponent(emailSubject);
    const encodedBody = encodeURIComponent(
      `من: ${senderName}\n\n${emailNotes}\n\n---\nمرسل عبر منصة English With Rona`
    );
    window.location.href = `mailto:${socialConfig.email}?subject=${encodedSubject}&body=${encodedBody}`;
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playPointsStream(4);
    onUpdateSocialConfig(editConfig);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2500);
  };

  // Social sharing helpers
  const shareText = `طفلي (${profile.name}) يتعلم اللغة الإنجليزية بحماس مع المعلمة رونا! حصل على ${profile.stars} نجمة ⭐ و ${profile.xp} نقطة XP 🚀. جربوا منصة English With Rona التفاعلية للأطفال!`;
  const shareUrl = window.location.href;

  const shareToWhatsapp = () => {
    sounds.playClick();
    const text = encodeURIComponent(`${shareText}\n${shareUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const shareToTwitter = () => {
    sounds.playClick();
    const text = encodeURIComponent(shareText);
    const url = encodeURIComponent(shareUrl);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}&hashtags=EnglishWithRona,KidsEnglish`, '_blank');
  };

  const shareToFacebook = () => {
    sounds.playClick();
    const url = encodeURIComponent(shareUrl);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  const shareToTelegram = () => {
    sounds.playClick();
    const text = encodeURIComponent(shareText);
    const url = encodeURIComponent(shareUrl);
    window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
  };

  const handleNativeShare = async () => {
    sounds.playClick();
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'English With Rona',
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // user dismissed
      }
    } else {
      copyToClipboard(`${shareText} ${shareUrl}`, 'native-share');
    }
  };

  const socialPlatforms = [
    {
      id: 'youtube',
      name: 'YouTube',
      handle: '@EnglishWithRona',
      description: 'فيديوهات تفاعلية، نطق الكلمات، وتمارين استماع صوتية ممتعة',
      url: socialConfig.youtubeUrl,
      icon: <Youtube className="w-5 h-5 text-red-600" />,
      color: 'hover:border-red-300 hover:bg-red-50/50',
      badge: 'قناة الفيديو',
      badgeColor: 'bg-red-100 text-red-700',
    },
    {
      id: 'instagram',
      name: 'Instagram',
      handle: '@EnglishWithRona',
      description: 'قصص مفردات يومية، ريلز فونكس، ومسابقات تشجيعية للأبطال',
      url: socialConfig.instagramUrl,
      icon: <Instagram className="w-5 h-5 text-pink-600" />,
      color: 'hover:border-pink-300 hover:bg-pink-50/50',
      badge: 'يوميات وفونكس',
      badgeColor: 'bg-pink-100 text-pink-700',
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      handle: '@EnglishWithRona',
      description: 'أناشيد تعليمية إنجليزية سريعة وتحديات نطق ومرح للأطفال',
      url: socialConfig.tiktokUrl,
      icon: <span className="text-lg">🎵</span>,
      color: 'hover:border-slate-400 hover:bg-slate-50',
      badge: 'أناشيد وتحديات',
      badgeColor: 'bg-slate-100 text-slate-800',
    },
    {
      id: 'whatsapp',
      name: 'واتساب المعلمة رانيا (WhatsApp)',
      handle: '01004823314',
      description: 'تواصل مباشر مع المعلمة رانيا عزت لأولياء الأمور والطلاب واستفسارات الأنشطة',
      url: 'https://wa.me/201004823314',
      icon: <MessageCircle className="w-5 h-5 text-emerald-600" />,
      color: 'hover:border-emerald-300 hover:bg-emerald-50/50',
      badge: 'تواصل مباشر 💬',
      badgeColor: 'bg-emerald-100 text-emerald-700',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-amber-200 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 text-white relative shrink-0">
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="absolute top-4 left-4 p-2 text-white/80 hover:text-white bg-black/10 hover:bg-black/20 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white/50 shadow-md shrink-0 bg-slate-900">
              <img
                src="/assets/aistudio/WhatsApp_Image_2026-11-05_at_23.16.55_6a80a945.jpeg"
                alt="English With Rona - شخصية المعلمة رانيا عزت"
                className="w-full h-full object-cover object-top"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black bg-white/25 px-2.5 py-0.5 rounded-full text-white">
                  تواصل مباشر ومواقع التواصل
                </span>
                <span className="text-xs text-yellow-200 font-bold">English With Rona</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black mt-1">
                تواصل مع المعلمة رونا وقنواتها
              </h2>
              <p className="text-xs text-white/90 mt-0.5 max-w-md">
                يسعدنا تواصلكم عبر البريد الإلكتروني الرسمي ومتابعة قنواتنا التعليمية التفاعلية
              </p>
            </div>
          </div>

          {/* Quick email display badge in header */}
          <div className="mt-4 pt-3 border-t border-white/20 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-100">
              <Mail className="w-4 h-4 text-yellow-300" />
              <span>البريد الإلكتروني المعتمد:</span>
              <a
                href={`mailto:${socialConfig.email}`}
                className="font-mono text-white underline underline-offset-2 hover:text-yellow-200"
                dir="ltr"
              >
                {socialConfig.email}
              </a>
            </div>

            <button
              onClick={() => copyToClipboard(socialConfig.email, 'header-email')}
              className="px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {copiedKey === 'header-email' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>تم النسخ!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>نسخ الإيميل</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-amber-100 bg-amber-50/50 px-4 sm:px-6 text-xs sm:text-sm font-bold overflow-x-auto shrink-0">
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('social');
            }}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'social'
                ? 'border-amber-500 text-amber-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-amber-600'
            }`}
          >
            <Globe className="w-4 h-4 text-amber-600" />
            <span>قنوات التواصل ({socialPlatforms.length})</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('email');
            }}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'email'
                ? 'border-amber-500 text-amber-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-amber-600'
            }`}
          >
            <Mail className="w-4 h-4 text-orange-500" />
            <span>إرسال بريد للمعلمة</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('share');
            }}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'share'
                ? 'border-amber-500 text-amber-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-amber-600'
            }`}
          >
            <Share2 className="w-4 h-4 text-indigo-500" />
            <span>مشاركة الإنجاز والتطبيق</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('settings');
            }}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'settings'
                ? 'border-amber-500 text-amber-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-amber-600'
            }`}
          >
            <Settings className="w-4 h-4 text-slate-500" />
            <span>تخصيص الروابط</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* TAB 1: SOCIAL PLATFORMS */}
          {activeTab === 'social' && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 flex items-start gap-3">
                <span className="text-2xl">👩‍🏫</span>
                <div className="text-xs">
                  <h4 className="font-black text-slate-800 text-sm">{socialConfig.teacherName}</h4>
                  <p className="text-slate-600 mt-0.5 leading-relaxed">{socialConfig.bioArabic}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {socialPlatforms.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-2xl border border-slate-200 bg-white transition-all shadow-xs flex flex-col justify-between ${item.color}`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-slate-100 rounded-xl">{item.icon}</div>
                          <div>
                            <span className="font-black text-xs text-slate-900 block">{item.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono" dir="ltr">
                              {item.handle}
                            </span>
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-3">
                        {item.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-1.5 px-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <span>زيارة الحساب</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>

                      <button
                        onClick={() => copyToClipboard(item.url, item.id)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors cursor-pointer"
                        title="نسخ الرابط"
                      >
                        {copiedKey === item.id ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: EMAIL TEACHER */}
          {activeTab === 'email' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center text-xl shadow-xs">
                      ✉️
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 text-sm">مراسلة المعلمة رونا المباشرة</h4>
                      <p className="text-xs text-slate-600" dir="ltr">
                        {socialConfig.email}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(socialConfig.email, 'direct-email')}
                    className="px-3 py-1.5 bg-white hover:bg-amber-100 border border-amber-200 text-amber-800 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    {copiedKey === 'direct-email' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>تم النسخ!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>نسخ العنوان</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    اسم المرسل أو الطالب:
                  </label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    placeholder="مثال: ولي أمر الطفل عمر"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">موضوع الرسالة:</label>
                  <select
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
                  >
                    <option value="مشاركة تقدم طفلي في تطبيق English With Rona 🌟">
                      🌟 مشاركة تقدم طفلي في التطبيق
                    </option>
                    <option value="طلب انضمام لحصص تفاعلية مباشرة مع المعلمة رونا 📚">
                      📚 طلب انضمام لحصص تفاعلية مباشرة
                    </option>
                    <option value="استفسار تربوي بخصوص منهاج اللغة الإنجليزية للأطفال ❓">
                      ❓ استفسار تربوي بخصوص المنهاج
                    </option>
                    <option value="اقتراح فكرة لعبة جديدة أو موضوع فيديو تفاعلي 💡">
                      💡 اقتراح فكرة لعبة أو فيديو جديد
                    </option>
                    <option value="رسالة شكر وتقدير للمعلمة رونا ❤️">
                      ❤️ رسالة شكر وتقدير للمعلمة رونا
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    نص الرسالة أو الاستفسار:
                  </label>
                  <textarea
                    rows={5}
                    value={emailNotes}
                    onChange={(e) => setEmailNotes(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none leading-relaxed"
                    placeholder="اكتب رسالتك هنا..."
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
                  <button
                    onClick={handleSendEmail}
                    className="w-full sm:flex-1 py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-sm transition-transform hover:scale-102 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>فتح في تطبيق البريد والإرسال</span>
                  </button>

                  <button
                    onClick={() =>
                      copyToClipboard(
                        `الموضوع: ${emailSubject}\n\n${emailNotes}\n\nإلى: ${socialConfig.email}`,
                        'full-email-text'
                      )
                    }
                    className="w-full sm:w-auto py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    {copiedKey === 'full-email-text' ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>تم نسخ النص!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>نسخ نص الرسالة</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SHARE ACHIEVEMENTS */}
          {activeTab === 'share' && (
            <div className="space-y-4">
              <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 flex items-center gap-4">
                <span className="text-4xl">{profile.avatar}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-black text-slate-900 text-sm">{profile.name}</h4>
                    <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                      إنجازات الطالب
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-600">
                    <span className="flex items-center gap-1 font-bold text-amber-700">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                      {profile.stars} نجمة
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1 font-bold text-orange-700">
                      <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                      {profile.xp} XP
                    </span>
                    <span>·</span>
                    <span>{profile.gamesPlayed} جولة لعب</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-4">
                <h4 className="text-xs font-black text-slate-800 mb-2">
                  مشاركة الإنجاز ورابط التطبيق مع الأهل والأصدقاء:
                </h4>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed mb-4" dir="rtl">
                  "{shareText}"
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={shareToWhatsapp}
                    className="py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    <span>واتساب</span>
                  </button>

                  <button
                    onClick={shareToTwitter}
                    className="py-2.5 px-3 bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Twitter className="w-4 h-4 text-sky-600" />
                    <span>تويتر / X</span>
                  </button>

                  <button
                    onClick={shareToTelegram}
                    className="py-2.5 px-3 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 text-cyan-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Send className="w-4 h-4 text-cyan-600" />
                    <span>تليجرام</span>
                  </button>

                  <button
                    onClick={shareToFacebook}
                    className="py-2.5 px-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Facebook className="w-4 h-4 text-blue-600" />
                    <span>فيسبوك</span>
                  </button>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={handleNativeShare}
                    className="flex-1 py-2 px-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>مشاركة عبر قائمة الهاتف / المتصفح</span>
                  </button>

                  <button
                    onClick={() => copyToClipboard(shareUrl, 'app-link')}
                    className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedKey === 'app-link' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>تم نسخ الرابط!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>نسخ الرابط</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SETTINGS / CUSTOMIZATION */}
          {activeTab === 'settings' && (
            <form onSubmit={handleSaveSettings} className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h4 className="font-black text-slate-800 text-sm">تخصيص بيانات وحسابات المعلمة</h4>
                  <p className="text-[11px] text-slate-500">يمكنك تعديل البريد وروابط الحسابات بسهولة وتُحفظ تلقائياً في المتصفح</p>
                </div>
                {settingsSaved && (
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg flex items-center gap-1 animate-pulse">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    تم الحفظ بنجاح!
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">البريد الإلكتروني المعتمد:</label>
                  <input
                    type="email"
                    required
                    value={editConfig.email}
                    onChange={(e) => setEditConfig({ ...editConfig, email: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">اسم المعلمة أو اللقب:</label>
                  <input
                    type="text"
                    value={editConfig.teacherName}
                    onChange={(e) => setEditConfig({ ...editConfig, teacherName: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">الوصف التعريفي (Bio):</label>
                  <input
                    type="text"
                    value={editConfig.bioArabic}
                    onChange={(e) => setEditConfig({ ...editConfig, bioArabic: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">رابط YouTube:</label>
                  <input
                    type="url"
                    value={editConfig.youtubeUrl}
                    onChange={(e) => setEditConfig({ ...editConfig, youtubeUrl: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">رابط Instagram:</label>
                  <input
                    type="url"
                    value={editConfig.instagramUrl}
                    onChange={(e) => setEditConfig({ ...editConfig, instagramUrl: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">رابط TikTok:</label>
                  <input
                    type="url"
                    value={editConfig.tiktokUrl}
                    onChange={(e) => setEditConfig({ ...editConfig, tiktokUrl: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">رابط واتساب أو رقم المحادثة:</label>
                  <input
                    type="text"
                    value={editConfig.whatsappUrl}
                    onChange={(e) => setEditConfig({ ...editConfig, whatsappUrl: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditConfig({
                      email: 'roro700111@gmail.com',
                      teacherName: 'Teacher Rona (المعلمة رونا)',
                      bioArabic: 'معلمة لغة إنجليزية متخصصة للأطفال، مصممة ألعاب تفاعلية وفيديوهات تعليمية ممتعة تجعل تعلم الإنجليزية سهلاً ومحبباً للصغار 🌟',
                      youtubeUrl: 'https://youtube.com/@EnglishWithRona',
                      instagramUrl: 'https://instagram.com/EnglishWithRona',
                      tiktokUrl: 'https://tiktok.com/@EnglishWithRona',
                      whatsappUrl: 'https://wa.me/?text=',
                      telegramUrl: 'https://t.me/EnglishWithRona',
                      facebookUrl: 'https://facebook.com/EnglishWithRona',
                      twitterUrl: 'https://x.com/EnglishWithRona',
                    });
                  }}
                  className="px-3 py-2 text-slate-600 hover:text-slate-900 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>استعادة القيم الافتراضية</span>
                </button>

                <button
                  type="submit"
                  className="py-2 px-5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black shadow-xs cursor-pointer transition-transform hover:scale-102"
                >
                  حفظ التعديلات
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>نرحب بجميع استفسارات أولياء الأمور والطلاب</span>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold cursor-pointer transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
