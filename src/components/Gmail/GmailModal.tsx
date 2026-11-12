import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  LogOut,
  Sparkles,
  Inbox,
  PenSquare,
  FileText,
  UserCheck,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  googleSignIn,
  logout,
  getAccessToken,
  initAuth,
} from '../../services/googleAuth';
import {
  listGmailMessages,
  sendGmailEmail,
  getGmailProfile,
  GmailMessageSummary,
  GmailProfile,
} from '../../services/gmail';
import { StudentProfile, GamePack } from '../../types';
import { sounds } from '../../utils/audio';

interface GmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: StudentProfile;
  gamePacks: GamePack[];
  teacherEmail: string;
}

export const GmailModal: React.FC<GmailModalProps> = ({
  isOpen,
  onClose,
  profile,
  gamePacks,
  teacherEmail,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [activeTab, setActiveTab] = useState<'report' | 'compose' | 'inbox'>('report');
  
  // Gmail state
  const [gmailProfile, setGmailProfile] = useState<GmailProfile | null>(null);
  const [messages, setMessages] = useState<GmailMessageSummary[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Compose state
  const [recipient, setRecipient] = useState(teacherEmail);
  const [subject, setSubject] = useState(
    `تقرير إنجازات الطالب (${profile.name}) في منصة English With Rona ⭐`
  );
  const [bodyText, setBodyText] = useState(
    `السلام عليكم ورحمة الله وبركاته المعلمة الفاضلة رونا،\n\nأشارك معك تقرير إنجاز طفلي (${profile.name}) في منصة تعلم اللغة الإنجليزية:\n• عدد النجوم: ${profile.stars} ⭐\n• نقاط الخبرة (XP): ${profile.xp} 🚀\n• عدد الألعاب المنجزة: ${profile.gamesPlayed}\n• عدد الفيديوهات المكتملة: ${profile.completedVideos.length}\n• عدد أيام النشاط المتتالية: ${profile.streakDays} أيام 🔥\n\nنشكركِ على هذه المنصة التعليمية الممتعة!\nمع خالص التحية والتقدير.`
  );

  // Confirmation dialog state for email sending (Mandatory User Confirmation Dialog)
  const [pendingSendAction, setPendingSendAction] = useState<{
    to: string;
    subject: string;
    body: string;
    isReport?: boolean;
  } | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [sendSuccessMessage, setSendSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check auth on load
  useEffect(() => {
    if (!isOpen) return;
    const unsubscribe = initAuth(
      (currentUser, accessToken) => {
        setUser(currentUser);
        setToken(accessToken);
        loadGmailData(accessToken);
      },
      () => {
        setUser(null);
        setToken(null);
      }
    );
    return () => unsubscribe();
  }, [isOpen]);

  const loadGmailData = async (accessToken: string) => {
    if (!accessToken) return;
    try {
      setIsLoadingMessages(true);
      const [p, msgs] = await Promise.all([
        getGmailProfile().catch(() => null),
        listGmailMessages('', 10).catch(() => []),
      ]);
      if (p) setGmailProfile(p);
      setMessages(msgs);
    } catch {
      // ignore
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleSignIn = async () => {
    try {
      setIsLoggingIn(true);
      setErrorMessage(null);
      sounds.playClick();
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setToken(res.accessToken);
        sounds.playSuccess();
        loadGmailData(res.accessToken);
      }
    } catch (err: unknown) {
      console.error(err);
      setErrorMessage('تعذر تسجيل الدخول بحساب Google. يرجى المحاولة مرة أخرى.');
      sounds.playError();
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      sounds.playClick();
      await logout();
      setUser(null);
      setToken(null);
      setGmailProfile(null);
      setMessages([]);
    } catch (err) {
      console.error(err);
    }
  };

  // Prepares the report template
  const handlePrepareReport = () => {
    setRecipient(teacherEmail);
    setSubject(`تقرير إنجازات الطالب (${profile.name}) في منصة English With Rona ⭐`);
    setBodyText(
      `السلام عليكم ورحمة الله وبركاته المعلمة الفاضلة رونا،\n\nأشارك معك تقرير إنجاز طفلي (${profile.name}) في منصة تعلم اللغة الإنجليزية:\n• عدد النجوم المكتسبة: ${profile.stars} ⭐\n• نقاط الخبرة (XP): ${profile.xp} 🚀\n• عدد الألعاب المنجزة: ${profile.gamesPlayed}\n• عدد الفيديوهات المكتملة: ${profile.completedVideos.length}\n• عدد أيام النشاط المتتالية: ${profile.streakDays} أيام 🔥\n\nنشكركِ على هذه المنصة التعليمية الممتعة والمفيدة!\nمع خالص التحية والتقدير.`
    );
    setActiveTab('report');
  };

  // Triggers the mandatory confirmation dialog before sending
  const handleRequestSend = (isReport = false) => {
    if (!recipient.trim() || !subject.trim() || !bodyText.trim()) {
      setErrorMessage('يرجى ملء جميع حقول الرسالة.');
      return;
    }
    sounds.playPop();
    setErrorMessage(null);
    setPendingSendAction({
      to: recipient.trim(),
      subject: subject.trim(),
      body: bodyText.trim(),
      isReport,
    });
  };

  // Executes the actual send once user explicitly confirms
  const handleConfirmSend = async () => {
    if (!pendingSendAction) return;
    try {
      setIsSending(true);
      setErrorMessage(null);
      sounds.playClick();

      await sendGmailEmail({
        to: pendingSendAction.to,
        subject: pendingSendAction.subject,
        body: pendingSendAction.body,
      });

      sounds.playSuccess();
      setSendSuccessMessage(`تم إرسال البريد الإلكتروني بنجاح إلى ${pendingSendAction.to} عبر Gmail! ✉️`);
      setPendingSendAction(null);

      // Refresh sent list
      if (token) {
        listGmailMessages('', 10).then(setMessages).catch(() => {});
      }

      setTimeout(() => {
        setSendSuccessMessage(null);
      }, 5000);
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : 'فشل إرسال الرسالة عبر Gmail';
      setErrorMessage(msg);
      sounds.playError();
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-red-200 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-linear-to-r from-red-600 via-rose-600 to-amber-600 text-white relative shrink-0">
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
            <div className="w-13 h-13 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl border border-white/30 shadow-inner">
              ✉️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black bg-white/25 px-2.5 py-0.5 rounded-full text-white">
                  خدمة Google Workspace
                </span>
                <span className="text-xs text-yellow-200 font-bold">Gmail Integration</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black mt-1">
                خدمات بريد Gmail المباشرة
              </h2>
              <p className="text-xs text-white/90 mt-0.5 max-w-md">
                تواصل مع المعلمة رونا وأرسل تقارير تقدم طفلك الأكاديمي مباشرة عبر حسابك على Gmail
              </p>
            </div>
          </div>

          {/* Account status badge */}
          <div className="mt-4 pt-3 border-t border-white/20 flex flex-wrap items-center justify-between gap-3">
            {user ? (
              <div className="flex items-center gap-2.5">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Google User'}
                    className="w-7 h-7 rounded-full border border-white shadow-xs"
                  />
                ) : (
                  <UserCheck className="w-5 h-5 text-emerald-300" />
                )}
                <div className="text-xs">
                  <span className="font-bold text-white block">{user.displayName || 'مستخدم Google'}</span>
                  <span className="text-[11px] text-white/80 font-mono" dir="ltr">{user.email}</span>
                </div>
                <span className="text-[10px] bg-emerald-500/80 text-white px-2 py-0.5 rounded-full font-bold">
                  متصل ✅
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-yellow-100">
                <AlertCircle className="w-4 h-4 text-yellow-300" />
                <span>سجّل الدخول بحساب Google للبدء في استخدام Gmail</span>
              </div>
            )}

            {user && (
              <button
                onClick={handleLogout}
                className="text-xs font-bold bg-white/15 hover:bg-white/25 text-white px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>تسجيل الخروج</span>
              </button>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Notification Banners */}
          {sendSuccessMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-2xl flex items-center gap-2.5 text-xs font-bold animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{sendSuccessMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3.5 bg-red-50 border border-red-300 text-red-800 rounded-2xl flex items-center gap-2.5 text-xs font-bold animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* If NOT authenticated: Display Official Google Sign-in Prompt */}
          {!user ? (
            <div className="text-center py-8 px-4 max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-red-100 text-red-600 flex items-center justify-center text-3xl mb-2 shadow-inner">
                📧
              </div>
              <h3 className="text-xl font-black text-slate-800">
                تسجيل الدخول بحساب Google (Gmail)
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                يتيح لك الاتصال بحساب Gmail إرسال تقارير الطالب التفصيلية إلى المعلمة رونا بضغطة واحدة، وتلقي التحديثات والأنشطة الإنجليزية مباشرة في بريدك.
              </p>

              {/* Official Google Sign-in Button */}
              <div className="pt-2 flex justify-center">
                <button
                  onClick={handleSignIn}
                  disabled={isLoggingIn}
                  className="inline-flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm px-6 py-3 rounded-2xl border border-slate-300 shadow-md transition-all hover:scale-102 cursor-pointer disabled:opacity-50"
                >
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                    <path fill="none" d="M0 0h48v48H0z" />
                  </svg>
                  <span>{isLoggingIn ? 'جارٍ تسجيل الدخول...' : 'Sign in with Google'}</span>
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-3">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>اتصال آمن ومصرح عبر بروتوكول Google OAuth الرسمي</span>
              </div>
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <button
                  onClick={() => setActiveTab('report')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeTab === 'report'
                      ? 'bg-red-500 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>إرسال تقرير إنجاز الطالب 📊</span>
                </button>

                <button
                  onClick={() => setActiveTab('compose')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeTab === 'compose'
                      ? 'bg-red-500 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <PenSquare className="w-4 h-4" />
                  <span>كتابة رسالة جديدة ✍️</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('inbox');
                    if (token) loadGmailData(token);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeTab === 'inbox'
                      ? 'bg-red-500 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Inbox className="w-4 h-4" />
                  <span>صندوق الوارد (Gmail)</span>
                </button>
              </div>

              {/* Tab 1: Send Student Progress Report */}
              {activeTab === 'report' && (
                <div className="space-y-4">
                  <div className="bg-amber-50/80 border border-amber-200 p-4 rounded-2xl flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-black text-amber-900">
                        تقرير الطالب الجاهز للإرسال
                      </h4>
                      <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                        تم تجميع درجات الطالب ({profile.name})، النجوم المكتسبة، وعدد الكلمات المتقنة تلقائياً. يمكنك مراجعة النص قبل الإرسال.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        إلى (البريد المعتمد للمعلمة رونا):
                      </label>
                      <input
                        type="email"
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-400"
                        dir="ltr"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        عنوان الرسالة:
                      </label>
                      <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-red-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      نص التقرير والرسالة:
                    </label>
                    <textarea
                      rows={7}
                      value={bodyText}
                      onChange={(e) => setBodyText(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs leading-relaxed font-sans focus:outline-hidden focus:ring-2 focus:ring-red-400"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <span>سيتم إرسال الرسالة من حسابك ({user.email}) بعد تأكيدك.</span>
                    </div>

                    <button
                      onClick={() => handleRequestSend(true)}
                      className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black shadow-md flex items-center gap-2 transition-all hover:scale-103 cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span>إرسال التقرير للمعلمة عبر Gmail ✉️</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 2: Compose Custom Email */}
              {activeTab === 'compose' && (
                <div className="space-y-4">
                  {/* Quick templates */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-bold text-slate-500">نماذج سريعة:</span>
                    <button
                      onClick={() => {
                        setSubject(`استفسار حول نطق مفردات اللغة الإنجليزية - ${profile.name}`);
                        setBodyText(`السلام عليكم المعلمة رونا،\n\nأود الاستفسار حول الطريقة المثلى لتدريب طفلي على أصوات الفونكس لبعض الكلمات.\nشكراً جزيلاً.`);
                      }}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                    >
                      استفسار نطق 🎙️
                    </button>
                    <button
                      onClick={() => {
                        setSubject(`طلب مراجعة تدريبات إضافية للطفل ${profile.name}`);
                        setBodyText(`تحية طيبة المعلمة رونا،\n\nلقد أتم طفلي بنجاح الحزم الأساسية ونرغب في الحصول على تدريبات إضافية لتطوير مهاراته.\nشكراً لك.`);
                      }}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                    >
                      طلب أنشطة 📚
                    </button>
                    <button
                      onClick={() => {
                        setSubject(`رسالة شكر وتقدير للمعلمة رونا 🌟`);
                        setBodyText(`المعلمة الفاضلة رونا،\n\nنشكركِ جزيلاً على هذه المنصة الممتعة والمفيدة، لقد لاحظنا تطوراً كبيراً وشغفاً رائعاً لدى طفلنا بتعلم اللغة الإنجليزية!`);
                      }}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                    >
                      رسالة شكر 💌
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        المرسل إليه (To):
                      </label>
                      <input
                        type="email"
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-red-400"
                        dir="ltr"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        الموضوع (Subject):
                      </label>
                      <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-red-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        نص الرسالة:
                      </label>
                      <textarea
                        rows={6}
                        value={bodyText}
                        onChange={(e) => setBodyText(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-red-400"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end pt-2">
                    <button
                      onClick={() => handleRequestSend(false)}
                      className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black shadow-md flex items-center gap-2 transition-all hover:scale-103 cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span>إرسال الرسالة عبر Gmail ✉️</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 3: Inbox messages list */}
              {activeTab === 'inbox' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-700">الرسائل الأخيرة:</span>
                      {gmailProfile && (
                        <span className="text-[11px] text-slate-400 font-mono">
                          ({gmailProfile.messagesTotal} رسالة في صندوقك)
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => token && loadGmailData(token)}
                      disabled={isLoadingMessages}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoadingMessages ? 'animate-spin text-red-600' : ''}`} />
                      <span>تحديث</span>
                    </button>
                  </div>

                  {isLoadingMessages ? (
                    <div className="text-center py-10 text-slate-400 text-xs">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto text-red-500 mb-2" />
                      <span>جارٍ جلب رسائل البريد الإلكتروني عبر Gmail API...</span>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs">
                      <Inbox className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <span>لا توجد رسائل حديثة في هذا العرض.</span>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`p-3.5 rounded-2xl border transition-all ${
                            msg.isUnread
                              ? 'bg-red-50/50 border-red-200 shadow-xs'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-xs font-black text-slate-800 truncate">
                              {msg.subject || '(بدون عنوان)'}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap" dir="ltr">
                              {msg.date ? new Date(msg.date).toLocaleDateString() : ''}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 mb-1" dir="ltr">
                            {msg.from}
                          </div>
                          <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                            {msg.snippet}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* MANDATORY USER CONFIRMATION DIALOG FOR EMAIL SENDING */}
      {pendingSendAction && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-2 border-red-300 animate-in fade-in zoom-in-95 space-y-4 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-red-100 text-red-600 flex items-center justify-center text-3xl shadow-inner">
              ✉️
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900">
                تأكيد إرسال البريد عبر حساب Gmail
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                هل تؤكد إرسال هذه الرسالة إلى <span className="font-bold text-red-600 font-mono" dir="ltr">{pendingSendAction.to}</span> عبر حسابك على Google (<span className="font-mono text-slate-800" dir="ltr">{user?.email}</span>)؟
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl text-right text-xs border border-slate-200 space-y-1">
              <div>
                <span className="font-bold text-slate-500">الموضوع: </span>
                <span className="font-semibold text-slate-800">{pendingSendAction.subject}</span>
              </div>
              <div className="text-[11px] text-slate-500 line-clamp-3">
                {pendingSendAction.body}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setPendingSendAction(null)}
                disabled={isSending}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors cursor-pointer"
              >
                إلغاء
              </button>

              <button
                onClick={handleConfirmSend}
                disabled={isSending}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black text-xs shadow-md transition-all hover:scale-102 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isSending ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>جارٍ الإرسال...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>تأكيد الإرسال الآن</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
