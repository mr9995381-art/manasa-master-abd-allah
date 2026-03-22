import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  BookOpen, 
  GraduationCap, 
  Users, 
  PlayCircle, 
  CheckCircle2, 
  MessageSquare, 
  Instagram, 
  Facebook, 
  Youtube, 
  Award, 
  Target, 
  Lightbulb,
  Clock,
  ChevronRight,
  Menu,
  X,
  Briefcase,
  Star,
  Lock,
  Plus,
  Trash2,
  CreditCard,
  Smartphone,
  Home,
  FileText,
  ClipboardCheck,
  Upload,
  LogOut,
  Download,
  ExternalLink,
  File,
  Video,
  ChevronLeft,
  Image,
  Key
} from "lucide-react";

// --- Types ---
type Page = "home" | "about" | "courses" | "payment" | "admin" | "handouts" | "exams" | "homework";
type Grade = "prep1" | "prep2" | "prep3" | "sec1" | "sec2" | "sec3";

interface VideoItem {
  id: string;
  title: string;
  url: string;
  grade: Grade;
  type: "youtube" | "file";
}

interface Handout {
  id: string;
  title: string;
  url: string;
  grade: Grade;
}

interface Exam {
  id: string;
  title: string;
  fileUrl: string;
  fileType: string;
  grade: Grade;
}

interface HomeworkSubmission {
  id: string;
  studentName: string;
  grade: Grade;
  fileUrl: string;
  date: string;
}

interface HomeworkAssignment {
  id: string;
  title: string;
  fileUrl: string;
  fileType: string;
  grade: Grade;
  date: string;
}

interface User {
  id: string;
  name: string;
  phone: string;
  grade: Grade;
  password: string;
  status: "pending" | "active";
}

interface Subscription {
  id: string;
  studentName: string;
  grade: Grade;
  date: string;
  status: "active" | "pending";
  paymentProof?: string;
}

const GRADE_LABELS: Record<Grade, string> = {
  prep1: "الصف الأول الإعدادي",
  prep2: "الصف الثاني الإعدادي",
  prep3: "الصف الثالث الإعدادي",
  sec1: "الصف الأول الثانوي",
  sec2: "الصف الثاني الثانوي",
  sec3: "الصف الثالث الثانوي",
};

// --- Components ---

const Navbar = ({ 
  activePage, 
  setPage, 
  currentUser, 
  setCurrentUser 
}: { 
  activePage: Page, 
  setPage: (p: Page) => void,
  currentUser: any,
  setCurrentUser: (u: any) => void
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks: { id: Page, label: string, icon: any, protected?: boolean }[] = [
    { id: "home" as Page, label: "الرئيسية", icon: BookOpen },
    { id: "courses" as Page, label: "المحاضرات", icon: PlayCircle, protected: true },
    { id: "handouts" as Page, label: "الملازم PDF", icon: FileText, protected: true },
    { id: "exams" as Page, label: "الامتحانات", icon: ClipboardCheck, protected: true },
    { id: "homework" as Page, label: "تسليم الواجب", icon: Upload, protected: true },
    { id: "about" as Page, label: "عن المستر", icon: Users },
  ].filter(link => !link.protected || (currentUser && currentUser.isSubscribed));

  const handleLogout = () => {
    setCurrentUser(null);
    setPage("home");
  };

  return (
    <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md z-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-4">
            {currentUser ? (
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                  title="تسجيل الخروج"
                >
                  <LogOut className="w-5 h-5" />
                </button>
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-slate-900 arabic-text">{currentUser.name}</p>
                  <p className="text-[10px] text-indigo-600 arabic-text font-bold">{GRADE_LABELS[currentUser.grade as Grade]}</p>
                </div>
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                  {currentUser.name[0]}
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setPage("admin")}
                className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
              >
                <Lock className="w-5 h-5" />
              </button>
            )}
          </div>
          
          <div className="hidden md:flex items-center gap-8 arabic-text font-bold">
            {navLinks.map((link) => (
              <motion.button
                key={link.id}
                onClick={() => setPage(link.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-2 transition-all ${
                  activePage === link.id ? "text-indigo-600" : "text-slate-600 hover:text-indigo-600"
                }`}
              >
                {link.label}
                <link.icon className="w-4 h-4" />
              </motion.button>
            ))}
          </div>

          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setPage("home")}>
            <div className="flex flex-col text-right">
              <span className="text-xl font-bold text-slate-900 tracking-tight leading-none">AS Academy</span>
              <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest">English Excellence</span>
            </div>
            <GraduationCap className="w-10 h-10 text-indigo-600" />
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-slate-600">
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-slate-200 overflow-hidden"
          >
            <div className="px-4 py-6 space-y-4 arabic-text font-bold text-right">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => { setPage(link.id); setIsOpen(false); }}
                  className={`w-full flex items-center justify-end gap-3 ${
                    activePage === link.id ? "text-indigo-600" : "text-slate-600"
                  }`}
                >
                  {link.label}
                  <link.icon className="w-5 h-5" />
                </button>
              ))}
              {!currentUser && (
                <button onClick={() => { setPage("admin"); setIsOpen(false); }} className="w-full flex items-center justify-end gap-3 text-slate-400">
                  لوحة التحكم
                  <Lock className="w-5 h-5" />
                </button>
              )}
              {currentUser && (
                <button 
                  onClick={() => { handleLogout(); setIsOpen(false); }} 
                  className="w-full flex items-center justify-end gap-3 text-red-600"
                >
                  تسجيل الخروج
                  <LogOut className="w-5 h-5" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const HomePage = ({ 
  setPage, 
  currentUser, 
  setCurrentUser,
  users,
  setUsers,
  subscriptions,
  showToast
}: { 
  setPage: (p: Page) => void,
  currentUser: any,
  setCurrentUser: (u: any) => void,
  users: User[],
  setUsers: React.Dispatch<React.SetStateAction<User[]>>,
  subscriptions: Subscription[],
  showToast: (m: string, t?: "success" | "error" | "info") => void
}) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [grade, setGrade] = useState<Grade>("prep1");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<"login" | "register">("login");

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const trimmedName = name.trim();
      const trimmedPassword = password.trim();
      
      console.log("Handle Join Triggered:", { mode, name: trimmedName, grade, phone, usersCount: users.length });
      
      if (!trimmedName || !trimmedPassword || (mode === "register" && !phone)) {
        alert("يرجى إدخال جميع البيانات المطلوبة");
        return;
      }
      
      if (mode === "register") {
        const existingUser = users.find(u => u.name.trim().toLowerCase() === trimmedName.toLowerCase());
        if (existingUser) {
          alert("هذا الاسم مسجل بالفعل، يرجى تسجيل الدخول.");
          setMode("login");
          return;
        }
        const newUser: User = { 
          id: Date.now().toString(), 
          name: trimmedName, 
          phone: phone.trim(), 
          grade, 
          password: trimmedPassword, 
          status: "pending" 
        };
        setUsers(prev => [...prev, newUser]);
        console.log("New User Registered:", newUser);
        
        // Auto-login after registration and go to payment
        setCurrentUser({ name: newUser.name, grade: newUser.grade, isSubscribed: false });
        setPage("payment");
        window.scrollTo(0, 0);
        alert("تم إنشاء الحساب بنجاح! يمكنك الآن إكمال عملية الاشتراك لتفعيل حسابك.");
        showToast("تم إنشاء الحساب بنجاح");
      } else {
        const user = users.find(u => u.name.trim().toLowerCase() === trimmedName.toLowerCase() && u.password.trim() === trimmedPassword);
        console.log("Login Attempt:", { name: trimmedName, found: !!user, totalUsers: users.length });
        
        if (user) {
          const isSubscribed = subscriptions.some(s => s.studentName === user.name && s.grade === user.grade && s.status === "active");
          console.log("User Logged In Successfully:", { name: user.name, isSubscribed });
          
          setCurrentUser({ name: user.name, grade: user.grade, isSubscribed });
          
          if (isSubscribed) {
            setPage("courses");
            window.scrollTo(0, 0);
            alert(`أهلاً بك يا ${user.name}! تم تسجيل دخولك بنجاح.`);
            showToast(`أهلاً بك يا ${user.name}`);
          } else {
            setPage("payment");
            window.scrollTo(0, 0);
            alert(`أهلاً بك يا ${user.name}! يرجى إكمال الاشتراك للوصول للمحتوى.`);
            showToast("يرجى إكمال الاشتراك", "info");
          }
        } else {
          alert("خطأ في الاسم أو كلمة المرور. تأكد من كتابة البيانات بشكل صحيح.");
        }
      }
    } catch (error) {
      console.error("CRITICAL ERROR in handleJoin:", error);
      alert("حدث خطأ تقني، يرجى المحاولة مرة أخرى أو التواصل مع الدعم.");
    }
  };

  return (
    <div className="pt-20">
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="text-right lg:order-2">
            <div className="inline-block px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-sm font-bold arabic-text mb-6">منصة مستر عبدالله سيد التعليمية</div>
            <h1 className="text-5xl lg:text-7xl font-bold text-slate-900 arabic-text leading-[1.1] mb-8">منصة مستر عبدالله سيد <br /><span className="text-indigo-600">لتعلم الإنجليزية بذكاء</span></h1>
            <p className="text-xl text-slate-600 arabic-text mb-10 leading-relaxed max-w-xl ml-auto">نحن لا ندرس اللغة فقط، بل نمنحك الأدوات لتتحدثها بطلاقة وتتفوق في دراستك من خلال منهجية علمية مبتكرة.</p>
            
            {!currentUser ? (
              <div className="bg-white p-8 rounded-[40px] shadow-2xl border border-slate-100 max-w-md ml-auto">
                <div className="flex justify-center gap-4 mb-8">
                  <button 
                    onClick={() => setMode("register")}
                    className={`px-6 py-2 rounded-xl font-bold arabic-text transition-all ${mode === "register" ? "bg-indigo-600 text-white" : "bg-slate-50 text-slate-400"}`}
                  >
                    إنشاء حساب
                  </button>
                  <button 
                    onClick={() => setMode("login")}
                    className={`px-6 py-2 rounded-xl font-bold arabic-text transition-all ${mode === "login" ? "bg-indigo-600 text-white" : "bg-slate-50 text-slate-400"}`}
                  >
                    تسجيل دخول
                  </button>
                </div>

                <h3 className="text-xl font-bold text-slate-900 arabic-text mb-6">{mode === "register" ? "سجل بياناتك للبدء" : "أهلاً بك مجدداً"}</h3>
                <form onSubmit={handleJoin} className="space-y-4">
                  <input 
                    type="text" 
                    placeholder="اسمك بالكامل"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-right arabic-text"
                  />
                  {mode === "register" && (
                    <>
                      <input 
                        type="tel" 
                        placeholder="رقم الموبايل (واتساب)"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-right arabic-text"
                      />
                      <select 
                        value={grade}
                        onChange={(e) => setGrade(e.target.value as Grade)}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-right arabic-text"
                      >
                        {Object.entries(GRADE_LABELS).map(([val, label]) => (
                          <option key={val} value={val}>{label}</option>
                        ))}
                      </select>
                    </>
                  )}
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="كلمة المرور"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-right arabic-text"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                      {showPassword ? <X className="w-5 h-5" /> : <Star className="w-5 h-5" />}
                    </button>
                  </div>
                  
                  {mode === "login" && (
                    <div className="text-right">
                      <button 
                        type="button"
                        onClick={() => alert("يرجى التواصل مع المستر عبر واتساب لاستعادة كلمة المرور الخاصة بك.")}
                        className="text-sm text-indigo-600 font-bold arabic-text hover:underline"
                      >
                        نسيت كلمة المرور؟
                      </button>
                    </div>
                  )}
                  <motion.button 
                    type="submit" 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold arabic-text hover:bg-indigo-700 transition-all"
                  >
                    {mode === "register" ? "إنشاء الحساب" : "دخول المنصة"}
                  </motion.button>
                </form>
              </div>
            ) : (
              <div className="flex flex-wrap gap-4 justify-end">
                {currentUser.isSubscribed ? (
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setPage("courses")} 
                    className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold arabic-text text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 flex items-center gap-3"
                  >
                    المحاضرات <ChevronLeft className="w-5 h-5" />
                  </motion.button>
                ) : (
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setPage("payment")} 
                    className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold arabic-text text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 flex items-center gap-3"
                  >
                    اشترك الآن لتفعيل المحتوى <ChevronLeft className="w-5 h-5" />
                  </motion.button>
                )}
              </div>
            )}
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative lg:order-1 flex justify-center">
            <div className="w-full max-w-md aspect-video rounded-[40px] bg-indigo-600 overflow-hidden shadow-2xl relative z-10 border-8 border-white">
            <img 
              src="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=1000" 
              alt="English Learning" 
              className="w-full h-full object-cover opacity-90"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl -z-0"></div>
        </motion.div>
      </div>
    </section>
  </div>
);
};

const PaymentPage = ({ 
  currentUser, 
  setSubscriptions, 
  subscriptions, 
  setCurrentUser,
  showToast,
  contactNumbers
}: { 
  currentUser: any, 
  setSubscriptions: (s: Subscription[]) => void,
  subscriptions: Subscription[],
  setCurrentUser: (u: any) => void,
  showToast: (m: string, t?: "success" | "error" | "info") => void,
  contactNumbers: string[]
}) => {
  const [proof, setProof] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"vodafone" | "online">("vodafone");
  const [cardDetails, setCardDetails] = useState({ number: "", expiry: "", cvc: "" });
  const [isSuccess, setIsSuccess] = useState(false);

  const pendingSub = subscriptions.find(s => s.studentName === currentUser?.name && s.grade === currentUser?.grade && s.status === "pending");

  const handleConfirmPayment = () => {
    if (!currentUser) return;
    
    if (paymentMethod === "vodafone") {
      if (!proof) {
        alert("يرجى رفع صورة إيصال التحويل أولاً.");
        return;
      }
    } else {
      if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvc) {
        alert("يرجى إكمال بيانات البطاقة.");
        return;
      }
    }
    
    setIsSubmitting(true);
    
    const newSubscription: Subscription = {
      id: Date.now().toString(),
      studentName: currentUser.name,
      grade: currentUser.grade,
      date: new Date().toLocaleDateString('ar-EG'),
      status: paymentMethod === "online" ? "active" : "pending",
      paymentProof: paymentMethod === "vodafone" ? proof : "Online Payment"
    };

    // Simulate a bit of delay
    setTimeout(() => {
      setSubscriptions([...subscriptions, newSubscription]);
      if (paymentMethod === "online") {
        setIsSuccess(true);
        showToast("تم الدفع والاشتراك بنجاح");
      } else {
        showToast("تم إرسال طلب الاشتراك بنجاح");
      }
      setIsSubmitting(false);
    }, 1500);
  };

  const hasPendingSub = subscriptions.some(s => s.studentName === currentUser?.name && s.status === "pending");

  if (isSuccess) {
    return (
      <div className="pt-32 pb-20 px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto bg-white rounded-[40px] p-10 shadow-2xl border border-slate-100 text-center"
        >
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 arabic-text mb-4">تم الاشتراك بنجاح!</h2>
          <p className="text-slate-600 arabic-text mb-8">مبروك! تم تفعيل اشتراكك بنجاح. يمكنك الآن الوصول إلى جميع المحاضرات والملفات الخاصة بصفك الدراسي.</p>
          <button 
            onClick={() => window.location.href = "/"}
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold arabic-text shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
          >
            الذهاب للمحاضرات
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 px-4">
      <div className="max-w-3xl mx-auto text-right">
        {hasPendingSub && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 bg-amber-50 border border-amber-200 rounded-[32px] text-center"
          >
            <div className="bg-amber-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <h4 className="text-xl font-bold text-amber-900 arabic-text mb-2">طلبك قيد المراجعة</h4>
            <p className="text-amber-700 arabic-text mb-4">لقد أرسلت طلب اشتراك بالفعل. سيقوم المستر بتفعيله فور التأكد من التحويل.</p>
            <a 
              href={`https://wa.me/20${contactNumbers[0]?.replace(/^0/, '') || '1146780736'}?text=${encodeURIComponent(`أهلاً مستر عبدالله، أنا الطالب ${currentUser.name}، قمت بتحويل مبلغ الاشتراك ورفعت الإيصال على الموقع. يرجى تفعيل حسابي.`)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-2 bg-[#25D366] text-white rounded-xl font-bold arabic-text hover:bg-[#128C7E] transition-all"
            >
              تذكير المستر عبر واتساب <MessageSquare className="w-4 h-4" />
            </a>
          </motion.div>
        )}

        <div className="bg-white rounded-[40px] p-10 shadow-xl border border-slate-100">
          <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mb-8 ml-auto">
            <CreditCard className="w-10 h-10" />
          </div>
          <h2 className="text-4xl font-bold text-slate-900 arabic-text mb-6">طريقة الاشتراك والدفع</h2>
          
          <div className="flex gap-4 mb-10 p-2 bg-slate-100 rounded-2xl">
            <button 
              onClick={() => setPaymentMethod("online")}
              className={`flex-1 py-3 rounded-xl font-bold arabic-text transition-all ${paymentMethod === "online" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              دفع إلكتروني (فيزا / ميزة)
            </button>
            <button 
              onClick={() => setPaymentMethod("vodafone")}
              className={`flex-1 py-3 rounded-xl font-bold arabic-text transition-all ${paymentMethod === "vodafone" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              فودافون كاش
            </button>
          </div>

          <div className="space-y-8">
            {paymentMethod === "vodafone" ? (
              <>
                <div className="flex flex-col items-end gap-6 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <div className="w-full text-right">
                    <h4 className="text-xl font-bold text-slate-900 arabic-text mb-2">التحويل عبر انستا باي</h4>
                    <p className="text-slate-600 arabic-text mb-4">يتم تحويل مبلغ الاشتراك على أحد الأرقام التالية:</p>
                    <div className="flex flex-wrap justify-end gap-3">
                      {contactNumbers.map((num, idx) => (
                        <div key={idx} className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-mono text-xl font-bold tracking-widest">
                          {num}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-6 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <div className="w-full">
                    <h4 className="text-xl font-bold text-slate-900 arabic-text mb-2">رفع إيصال الدفع</h4>
                    <p className="text-slate-600 arabic-text mb-4">يرجى رفع صورة من إيصال التحويل أو لقطة شاشة لرسالة التحويل.</p>
                    
                    <div className="relative border-2 border-dashed border-slate-200 bg-white rounded-2xl p-8 text-center hover:border-indigo-600 transition-all cursor-pointer">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => setProof(reader.result as string);
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      {proof ? (
                        <div className="flex flex-col items-center">
                          <img src={proof} alt="Proof" className="w-32 h-32 object-cover rounded-xl mb-2" referrerPolicy="no-referrer" />
                          <p className="text-xs text-green-600 font-bold">تم اختيار الصورة</p>
                        </div>
                      ) : (
                        <>
                          <Image className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                          <p className="text-slate-400 arabic-text">اضغط هنا لرفع الصورة</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100">
 
                <h4 className="text-xl font-bold text-slate-900 arabic-text mb-6 text-right">بيانات البطاقة البنكية</h4>
                <div className="space-y-4">
                  <div className="text-right">
                    <label className="block text-sm font-bold text-slate-600 mb-2">رقم البطاقة</label>
                    <input 
                      type="text" 
                      placeholder="**** **** **** ****"
                      value={cardDetails.number}
                      onChange={(e) => setCardDetails({...cardDetails, number: e.target.value})}
                      className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-left font-mono outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-right">
                      <label className="block text-sm font-bold text-slate-600 mb-2">CVC</label>
                      <input 
                        type="text" 
                        placeholder="***"
                        value={cardDetails.cvc}
                        onChange={(e) => setCardDetails({...cardDetails, cvc: e.target.value})}
                        className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-center font-mono outline-none focus:ring-2 focus:ring-indigo-600"
                      />
                    </div>
                    <div className="text-right">
                      <label className="block text-sm font-bold text-slate-600 mb-2">تاريخ الانتهاء</label>
                      <input 
                        type="text" 
                        placeholder="MM/YY"                       value={cardDetails.expiry}
                        onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})}
                        className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-center font-mono outline-none focus:ring-2 focus:ring-indigo-600"
                      />
                    </div>
                  </div>
                  <div className="pt-4 flex items-center justify-end gap-3 text-slate-400">
                    <span className="text-xs arabic-text">جميع المعاملات مشفرة وآمنة تماماً</span>
                    <Lock className="w-4 h-4" />
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col items-start justify-end gap-6 p-6 bg-slate-50 rounded-3xl border border-slate-100">
              <div className="w-full text-right">
                <h4 className="text-xl font-bold text-slate-900 arabic-text mb-2">تأكيد الاشتراك</h4>
                <p className="text-slate-600 arabic-text mb-4">بعد إتمام عملية الدفع، اضغط على الزر أدناه لتأكيد طلبك.</p>
                <div className="flex flex-col sm:flex-row-reverse gap-3 justify-start">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleConfirmPayment}
                    disabled={isSubmitting}
                    className={`px-8 py-3 ${isSubmitting ? 'bg-slate-400' : 'bg-green-600 hover:bg-green-700'} text-white rounded-xl font-bold arabic-text transition-all flex items-center gap-2`}
                  >
                    {isSubmitting ? "جاري الإرسال..." : "تأكيد الدفع وإرسال الطلب"} <CheckCircle2 className="w-5 h-5" />
                  </motion.button>
                  
                  {proof && paymentMethod === "vodafone" && (
                    <a 
                      href={`https://wa.me/20${contactNumbers[0]?.replace(/^0/, '') || '1146780736'}?text=${encodeURIComponent(`أهلاً مستر عبدالله، أنا الطالب ${currentUser.name}، قمت بتحويل مبلغ الاشتراك ورفعت الإيصال على الموقع. يرجى تفعيل حسابي.`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-8 py-3 bg-[#25D366] text-white rounded-xl font-bold arabic-text hover:bg-[#128C7E] transition-all flex items-center gap-2 justify-center"
                    >
                      إرسال واتساب للمستر <MessageSquare className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 p-6 bg-indigo-50 rounded-3xl border border-indigo-100">
            <p className="text-indigo-800 arabic-text font-bold text-center">
              تنبيه: سيتم تفعيل حسابك فور مراجعة المستر للتحويل (في حالة فودافون كاش) أو فوراً (في حالة الدفع الإلكتروني).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const CoursesPage = ({ videos, currentUser }: { videos: VideoItem[], currentUser: any }) => {
  const selectedGrade = currentUser?.grade as Grade;

  if (!currentUser) {
    return (
      <div className="pt-40 pb-20 px-4 text-center">
        <Lock className="w-20 h-20 text-slate-200 mx-auto mb-6" />
        <h2 className="text-3xl font-bold text-slate-900 arabic-text mb-4">يرجى تسجيل الدخول أولاً</h2>
        <p className="text-slate-600 arabic-text">يجب تسجيل اسمك وصفك الدراسي للوصول للمحاضرات.</p>
      </div>
    );
  }

  if (!currentUser.isSubscribed) {
    return (
      <div className="pt-40 pb-20 px-4 text-center">
        <CreditCard className="w-20 h-20 text-slate-200 mx-auto mb-6" />
        <h2 className="text-3xl font-bold text-slate-900 arabic-text mb-4">أنت غير مشترك حالياً</h2>
        <p className="text-slate-600 arabic-text mb-8">يرجى الاشتراك لتتمكن من مشاهدة محاضرات {GRADE_LABELS[selectedGrade]}.</p>
        <button className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold arabic-text" onClick={() => window.location.reload()}>اشترك الآن</button>
      </div>
    );
  }

  const filteredVideos = videos.filter(v => v.grade === selectedGrade);

  return (
    <div className="pt-32 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-right mb-12">
          <h2 className="text-4xl font-bold text-slate-900 arabic-text mb-4">محاضرات {GRADE_LABELS[selectedGrade]}</h2>
          <p className="text-slate-600 arabic-text">أهلاً بك يا {currentUser.name}، إليك جميع المحاضرات المتاحة لصفك الدراسي.</p>
        </div>
        
        {filteredVideos.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredVideos.map((video) => (
              <motion.div 
              key={video.id} 
              whileHover={{ y: -5 }}
              className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-slate-100 group"
            >
                <div className="aspect-video bg-slate-900 flex items-center justify-center relative">
                  {video.type === "youtube" ? (
                    <PlayCircle className="w-16 h-16 text-white opacity-50 group-hover:opacity-100 transition-opacity cursor-pointer" />
                  ) : (
                    <Video className="w-16 h-16 text-white opacity-50 group-hover:opacity-100 transition-opacity cursor-pointer" />
                  )}
                  <div className="absolute inset-0 bg-indigo-600/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                </div>
                <div className="p-6 text-right">
                  <h4 className="text-xl font-bold text-slate-900 arabic-text mb-4">{video.title}</h4>
                  <a 
                    href={video.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-indigo-600 font-bold arabic-text hover:underline"
                  >
                    مشاهدة {video.type === "youtube" ? "على يوتيوب" : "المحاضرة"} <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[40px] p-20 text-center border-2 border-dashed border-slate-200">
            <Video className="w-20 h-20 text-slate-200 mx-auto mb-6" />
            <p className="text-2xl text-slate-400 arabic-text font-bold">لا توجد فيديوهات مرفوعة لصفك حالياً</p>
          </div>
        )}
      </div>
    </div>
  );
};

const HandoutsPage = ({ handouts, currentUser }: { handouts: Handout[], currentUser: any }) => {
  const selectedGrade = currentUser?.grade as Grade;

  if (!currentUser || !currentUser.isSubscribed) {
    return (
      <div className="pt-40 pb-20 px-4 text-center">
        <FileText className="w-20 h-20 text-slate-200 mx-auto mb-6" />
        <h2 className="text-3xl font-bold text-slate-900 arabic-text mb-4">هذه الصفحة للمشتركين فقط</h2>
        <p className="text-slate-600 arabic-text">يرجى الاشتراك للوصول إلى الملازم والملخصات.</p>
      </div>
    );
  }

  const filteredHandouts = handouts.filter(h => h.grade === selectedGrade);

  return (
    <div className="pt-32 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-right mb-12">
          <h2 className="text-4xl font-bold text-slate-900 arabic-text mb-4">الملازم والملخصات PDF</h2>
          <p className="text-slate-600 arabic-text">إليك جميع الملفات التعليمية الخاصة بـ {GRADE_LABELS[selectedGrade]}.</p>
        </div>
        
        {filteredHandouts.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredHandouts.map((handout) => (
              <motion.div 
                key={handout.id} 
                whileHover={{ y: -5 }}
                className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 flex flex-col items-end text-right"
              >
                <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mb-6">
                  <FileText className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 arabic-text mb-4">{handout.title}</h4>
                <a 
                  href={handout.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mt-auto inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold arabic-text hover:bg-slate-800 transition-all"
                >
                  تحميل الملزمة <Download className="w-4 h-4" />
                </a>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[40px] p-20 text-center border-2 border-dashed border-slate-200">
            <FileText className="w-20 h-20 text-slate-200 mx-auto mb-6" />
            <p className="text-2xl text-slate-400 arabic-text font-bold">لا توجد ملازم مرفوعة لصفك حالياً</p>
          </div>
        )}
      </div>
    </div>
  );
};

const ExamsPage = ({ exams, currentUser }: { exams: Exam[], currentUser: any }) => {
  const selectedGrade = currentUser?.grade as Grade;

  if (!currentUser || !currentUser.isSubscribed) {
    return (
      <div className="pt-40 pb-20 px-4 text-center">
        <ClipboardCheck className="w-20 h-20 text-slate-200 mx-auto mb-6" />
        <h2 className="text-3xl font-bold text-slate-900 arabic-text mb-4">الامتحانات للمشتركين فقط</h2>
        <p className="text-slate-600 arabic-text">يرجى الاشتراك للوصول إلى الاختبارات والتقييمات.</p>
      </div>
    );
  }

  const filteredExams = exams.filter(e => e.grade === selectedGrade);

  return (
    <div className="pt-32 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-right mb-12">
          <h2 className="text-4xl font-bold text-slate-900 arabic-text mb-4">الاختبارات والتقييمات</h2>
          <p className="text-slate-600 arabic-text">اختبر مستواك في {GRADE_LABELS[selectedGrade]} من خلال هذه الامتحانات.</p>
        </div>
        
        {filteredExams.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredExams.map((exam) => (
              <motion.div 
                key={exam.id} 
                whileHover={{ y: -5 }}
                className="bg-white p-4 rounded-[32px] shadow-sm border border-slate-100 flex flex-col items-end text-right"
              >
                <div className="w-full aspect-[3/4] bg-slate-50 rounded-2xl overflow-hidden mb-6 flex items-center justify-center">
                  {exam.fileType?.startsWith("image/") ? (
                    <img 
                      src={exam.fileUrl} 
                      alt={exam.title} 
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="text-center">
                      <FileText className="w-16 h-16 text-indigo-100 mx-auto mb-2" />
                      <p className="text-xs text-slate-400 arabic-text">ملف PDF</p>
                    </div>
                  )}
                </div>
                <h4 className="text-xl font-bold text-slate-900 arabic-text mb-4">{exam.title}</h4>
                <a 
                  href={exam.fileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mt-auto inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold arabic-text hover:bg-indigo-700 transition-all"
                >
                  عرض الامتحان <ExternalLink className="w-4 h-4" />
                </a>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[40px] p-20 text-center border-2 border-dashed border-slate-200">
            <ClipboardCheck className="w-20 h-20 text-slate-200 mx-auto mb-6" />
            <p className="text-2xl text-slate-400 arabic-text font-bold">لا توجد امتحانات متاحة لصفك حالياً</p>
          </div>
        )}
      </div>
    </div>
  );
};

const HomeworkPage = ({ 
  homeworks, 
  setHomeworks, 
  homeworkAssignments,
  currentUser,
  showToast
}: { 
  homeworks: HomeworkSubmission[], 
  setHomeworks: (h: HomeworkSubmission[]) => void,
  homeworkAssignments: HomeworkAssignment[],
  currentUser: any,
  showToast: (m: string, t?: "success" | "error" | "info") => void
}) => {
  const [file, setFile] = useState<File | null>(null);
  const selectedGrade = currentUser?.grade as Grade;

  if (!currentUser || !currentUser.isSubscribed) {
    return (
      <div className="pt-40 pb-20 px-4 text-center">
        <Upload className="w-20 h-20 text-slate-200 mx-auto mb-6" />
        <h2 className="text-3xl font-bold text-slate-900 arabic-text mb-4">تسليم الواجب للمشتركين فقط</h2>
        <p className="text-slate-600 arabic-text">يرجى الاشتراك لتتمكن من تسليم واجباتك للمستر.</p>
      </div>
    );
  }

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    const newSubmission: HomeworkSubmission = {
      id: Date.now().toString(),
      studentName: currentUser.name,
      grade: selectedGrade,
      fileUrl: URL.createObjectURL(file), // Simulated upload
      date: new Date().toLocaleDateString('ar-EG')
    };

    setHomeworks([...homeworks, newSubmission]);
    setFile(null);
    alert("تم تسليم الواجب بنجاح!");
    showToast("تم تسليم الواجب بنجاح");
  };

  const mySubmissions = homeworks.filter(h => h.studentName === currentUser.name);
  const myAssignments = homeworkAssignments.filter(a => a.grade === selectedGrade);

  return (
    <div className="pt-32 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-right mb-12">
          <h2 className="text-4xl font-bold text-slate-900 arabic-text mb-4">الواجب المنزلي</h2>
          <p className="text-slate-600 arabic-text">هنا يمكنك تحميل الواجب المطلوب منك ورفع الحل ليقوم المستر بتصحيحه.</p>
        </div>

        {/* Teacher Assignments Section */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-slate-900 arabic-text text-right mb-8 flex items-center justify-end gap-3">
            الواجبات المطلوبة
            <FileText className="w-6 h-6 text-indigo-600" />
          </h3>
          {myAssignments.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myAssignments.map((assignment) => (
                <div key={assignment.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-end text-right">
                  <div className="w-full aspect-video bg-slate-50 rounded-2xl overflow-hidden mb-6 flex items-center justify-center">
                    {assignment.fileType?.startsWith("image/") ? (
                      <img 
                        src={assignment.fileUrl} 
                        alt={assignment.title} 
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <FileText className="w-12 h-12 text-indigo-200" />
                    )}
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 arabic-text mb-2">{assignment.title}</h4>
                  <p className="text-xs text-slate-400 mb-6">{assignment.date}</p>
                  <a 
                    href={assignment.fileUrl} 
                    download 
                    target="_blank" 
                    rel="noreferrer"
                    className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold arabic-text text-center hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                  >
                    تحميل الواجب
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-12 rounded-[40px] text-center border-2 border-dashed border-slate-100">
              <p className="text-slate-400 arabic-text font-bold">لا توجد واجبات مطلوبة حالياً لصفك الدراسي</p>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          <div className="bg-white p-10 rounded-[40px] shadow-xl border border-slate-100 text-right order-2 lg:order-1">
            <h3 className="text-2xl font-bold text-slate-900 arabic-text mb-8">ارفع ملف الواجب</h3>
            <form onSubmit={handleUpload} className="space-y-6">
              <div className="border-2 border-dashed border-slate-200 rounded-3xl p-10 text-center hover:border-indigo-600 transition-all cursor-pointer relative">
                <input 
                  type="file" 
                  accept=".pdf,image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Upload className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 arabic-text font-bold">{file ? file.name : "اضغط هنا لاختيار الملف"}</p>
                <p className="text-xs text-slate-400 mt-2">PDF, JPG, PNG (Max 10MB)</p>
              </div>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={!file}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold arabic-text hover:bg-indigo-700 transition-all disabled:bg-slate-300"
              >
                تسليم الواجب الآن
              </motion.button>
            </form>
          </div>

          <div className="space-y-6 order-1 lg:order-2">
            <h3 className="text-2xl font-bold text-slate-900 arabic-text text-right mb-6">تسليماتي السابقة</h3>
            {mySubmissions.length > 0 ? (
              mySubmissions.map((sub) => (
                <div key={sub.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
                  <span className="text-xs text-slate-400">{sub.date}</span>
                  <div className="text-right flex items-center gap-4">
                    <p className="font-bold text-slate-900 arabic-text">تم التسليم بنجاح</p>
                    <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white p-10 rounded-3xl border-2 border-dashed border-slate-100 text-center text-slate-400 arabic-text">لم تقم بتسليم أي واجبات بعد</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = ({ 
  videos, 
  setVideos, 
  subscriptions, 
  setSubscriptions,
  handouts,
  setHandouts,
  exams,
  setExams,
  homeworks,
  setHomeworks,
  homeworkAssignments,
  setHomeworkAssignments,
  users,
  setUsers,
  showToast,
  contactNumbers,
  setContactNumbers
}: { 
  videos: VideoItem[], 
  setVideos: (v: VideoItem[]) => void,
  subscriptions: Subscription[],
  setSubscriptions: (s: Subscription[]) => void,
  handouts: Handout[],
  setHandouts: (h: Handout[]) => void,
  exams: Exam[],
  setExams: (e: Exam[]) => void,
  homeworks: HomeworkSubmission[],
  setHomeworks: (h: HomeworkSubmission[]) => void,
  homeworkAssignments: HomeworkAssignment[],
  setHomeworkAssignments: (h: HomeworkAssignment[]) => void,
  users: User[],
  setUsers: React.Dispatch<React.SetStateAction<User[]>>,
  showToast: (m: string, t?: "success" | "error" | "info") => void,
  contactNumbers: string[],
  setContactNumbers: (n: string[]) => void
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState<"videos" | "subs" | "handouts" | "exams" | "homework" | "users" | "settings">("videos");
  
  const [newVideo, setNewVideo] = useState({ title: "", url: "", grade: "prep1" as Grade, type: "youtube" as "youtube" | "file" });
  const [newHandout, setNewHandout] = useState({ title: "", url: "", grade: "prep1" as Grade });
  const [newExam, setNewExam] = useState({ title: "", fileUrl: "", fileType: "", grade: "prep1" as Grade });
  const [newSub, setNewSub] = useState({ studentName: "", grade: "prep1" as Grade });
  const [newAssignment, setNewAssignment] = useState({ title: "", fileUrl: "", fileType: "", grade: "prep1" as Grade });
  const [editingUser, setEditingUser] = useState<{ id: string, name: string } | null>(null);
  const [newPassInput, setNewPassInput] = useState("");
  const [tempContactNumbers, setTempContactNumbers] = useState(contactNumbers);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin123") {
      setIsLoggedIn(true);
      showToast("تم تسجيل الدخول بنجاح");
    } else {
      showToast("كلمة المرور خاطئة", "error");
    }
  };

  const addVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVideo.title || !newVideo.url) return;
    const updated = [...videos, { ...newVideo, id: Date.now().toString() }];
    setVideos(updated);
    setNewVideo({ title: "", url: "", grade: "prep1", type: "youtube" });
    showToast("تم إضافة الفيديو بنجاح");
  };

  const addHandout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHandout.title || !newHandout.url) return;
    setHandouts([...handouts, { ...newHandout, id: Date.now().toString() }]);
    setNewHandout({ title: "", url: "", grade: "prep1" });
    showToast("تم إضافة الملزمة بنجاح");
  };

  const addExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExam.title || !newExam.fileUrl) return;
    setExams([...exams, { ...newExam, id: Date.now().toString() }]);
    setNewExam({ title: "", fileUrl: "", fileType: "", grade: "prep1" });
    showToast("تم إضافة الامتحان بنجاح");
  };

  const addSub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSub.studentName) return;
    
    // Create user if not exists
    if (!users.some(u => u.name === newSub.studentName)) {
      const newUser: User = { 
        id: Date.now().toString(), 
        name: newSub.studentName, 
        phone: "", // Default empty phone
        grade: newSub.grade, 
        password: "123", // Default password
        status: "active"
      };
      setUsers([...users, newUser]);
    }

    const updated = [...subscriptions, { 
      ...newSub, 
      id: Date.now().toString(), 
      date: new Date().toLocaleDateString('ar-EG'),
      status: "active",
      method: "manual"
    }];
    setSubscriptions(updated);
    setNewSub({ studentName: "", grade: "prep1" });
    alert(`تم تفعيل الطالب بنجاح. كلمة المرور الافتراضية هي 123`);
  };

  const addAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssignment.title || !newAssignment.fileUrl) return;
    const updated = [...homeworkAssignments, { 
      ...newAssignment, 
      id: Date.now().toString(), 
      date: new Date().toLocaleDateString('ar-EG')
    }];
    setHomeworkAssignments(updated);
    setNewAssignment({ title: "", fileUrl: "", fileType: "", grade: "prep1" });
    showToast("تم رفع الواجب بنجاح");
  };

  const approveSub = (id: string) => {
    const sub = subscriptions.find(s => s.id === id);
    if (!sub) return;
    
    setSubscriptions(subscriptions.map(s => s.id === id ? { ...s, status: "active" } : s));
    
    // Also activate the user if they were pending
    setUsers(users.map(u => u.name === sub.studentName ? { ...u, status: "active" } : u));
    
    showToast(`تم تفعيل اشتراك الطالب ${sub.studentName} بنجاح!`);
  };

  const approveUser = (id: string) => {
    setUsers(users.map(u => u.id === id ? { ...u, status: "active" } : u));
    showToast("تم تفعيل حساب الطالب بنجاح.");
  };

  const changePassword = () => {
    if (editingUser && newPassInput) {
      setUsers(users.map(u => u.id === editingUser.id ? { ...u, password: newPassInput } : u));
      setEditingUser(null);
      setNewPassInput("");
      showToast("تم تغيير كلمة المرور بنجاح");
    }
  };

  const deleteItem = (id: string, type: "video" | "handout" | "exam" | "sub" | "assignment" | "user") => {
    if (type === "video") setVideos(videos.filter(v => v.id !== id));
    if (type === "handout") setHandouts(handouts.filter(h => h.id !== id));
    if (type === "exam") setExams(exams.filter(e => e.id !== id));
    if (type === "sub") setSubscriptions(subscriptions.filter(s => s.id !== id));
    if (type === "assignment") setHomeworkAssignments(homeworkAssignments.filter(a => a.id !== id));
    if (type === "user") setUsers(users.filter(u => u.id !== id));
    showToast("تم الحذف بنجاح", "info");
  };

  if (!isLoggedIn) {
    return (
      <div className="pt-40 pb-20 px-4 flex justify-center">
        <div className="bg-white p-10 rounded-[40px] shadow-xl border border-slate-100 w-full max-w-md text-right">
          <Lock className="w-12 h-12 text-indigo-600 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-slate-900 arabic-text mb-8 text-center">لوحة تحكم المستر</h2>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-slate-600 arabic-text mb-2">كلمة المرور</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none text-right"
                placeholder="أدخل كلمة المرور"
              />
            </div>
            <button className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold arabic-text hover:bg-indigo-700 transition-all">دخول</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {[
            { id: "users", label: "الطلاب", icon: Users, badge: users.filter(u => u.status === "pending").length },
            { id: "subs", label: "الاشتراكات", icon: CreditCard, badge: subscriptions.filter(s => s.status === "pending").length },
            { id: "videos", label: "الفيديوهات", icon: Video },
            { id: "handouts", label: "الملازم", icon: FileText },
            { id: "exams", label: "الامتحانات", icon: ClipboardCheck },
            { id: "homework", label: "الواجبات", icon: Upload },
            { id: "settings", label: "الإعدادات", icon: Key },
          ].map((tab) => (
            <motion.button 
              key={tab.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 rounded-2xl font-bold arabic-text transition-all flex items-center gap-2 relative ${
                activeTab === tab.id ? "bg-indigo-600 text-white" : "bg-white text-slate-600 border border-slate-200"
              }`}
            >
              {tab.label}
              <tab.icon className="w-4 h-4" />
              {tab.badge ? (
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                  {tab.badge}
                </span>
              ) : null}
            </motion.button>
          ))}
          <button onClick={() => setIsLoggedIn(false)} className="px-6 py-3 text-red-600 font-bold arabic-text">خروج</button>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 text-right sticky top-32">
              {activeTab === "videos" && (
                <>
                  <h3 className="text-xl font-bold text-slate-900 arabic-text mb-8">إضافة فيديو جديد</h3>
                  <form onSubmit={addVideo} className="space-y-4">
                    <input type="text" placeholder="عنوان الفيديو" value={newVideo.title} onChange={e => setNewVideo({...newVideo, title: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl text-right" />
                    <select value={newVideo.type} onChange={e => setNewVideo({...newVideo, type: e.target.value as any})} className="w-full p-4 bg-slate-50 rounded-xl text-right">
                      <option value="youtube">رابط يوتيوب</option>
                      <option value="file">ملف فيديو</option>
                    </select>
                    
                    {newVideo.type === "youtube" ? (
                      <input type="text" placeholder="رابط يوتيوب" value={newVideo.url} onChange={e => setNewVideo({...newVideo, url: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl text-right" />
                    ) : (
                      <div className="relative border-2 border-dashed border-slate-200 rounded-xl p-4 text-center">
                        <input 
                          type="file" 
                          accept="video/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setNewVideo({...newVideo, url: URL.createObjectURL(file)});
                            }
                          }}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <Video className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                        <p className="text-xs text-slate-500 arabic-text">{newVideo.url ? "تم اختيار ملف" : "اختر ملف الفيديو"}</p>
                      </div>
                    )}

                    <select value={newVideo.grade} onChange={e => setNewVideo({...newVideo, grade: e.target.value as Grade})} className="w-full p-4 bg-slate-50 rounded-xl text-right">
                      {Object.entries(GRADE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                    <button className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold">إضافة</button>
                  </form>
                </>
              )}
              {activeTab === "handouts" && (
                <>
                  <h3 className="text-xl font-bold text-slate-900 arabic-text mb-8">إضافة ملزمة PDF</h3>
                  <form onSubmit={addHandout} className="space-y-4">
                    <input type="text" placeholder="عنوان الملزمة" value={newHandout.title} onChange={e => setNewHandout({...newHandout, title: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl text-right" />
                    <div className="relative border-2 border-dashed border-slate-200 rounded-xl p-4 text-center">
                      <input 
                        type="file" 
                        accept=".pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setNewHandout({...newHandout, url: URL.createObjectURL(file)});
                          }
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <FileText className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs text-slate-500 arabic-text">{newHandout.url ? "تم اختيار ملف" : "اختر ملف PDF"}</p>
                    </div>
                    <select value={newHandout.grade} onChange={e => setNewHandout({...newHandout, grade: e.target.value as Grade})} className="w-full p-4 bg-slate-50 rounded-xl text-right">
                      {Object.entries(GRADE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                    <button className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold">إضافة</button>
                  </form>
                </>
              )}
              {activeTab === "exams" && (
                <>
                  <h3 className="text-xl font-bold text-slate-900 arabic-text mb-8">إضافة امتحان جديد</h3>
                  <form onSubmit={addExam} className="space-y-4">
                    <input type="text" placeholder="عنوان الامتحان" value={newExam.title} onChange={e => setNewExam({...newExam, title: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl text-right" />
                    <div className="relative border-2 border-dashed border-slate-200 rounded-xl p-4 text-center">
                      <input 
                        type="file" 
                        accept=".pdf,image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setNewExam({
                              ...newExam, 
                              fileUrl: URL.createObjectURL(file),
                              fileType: file.type
                            });
                          }
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <Image className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs text-slate-500 arabic-text">{newExam.fileUrl ? "تم اختيار ملف" : "اختر ملف الامتحان (صورة أو PDF)"}</p>
                    </div>
                    <select value={newExam.grade} onChange={e => setNewExam({...newExam, grade: e.target.value as Grade})} className="w-full p-4 bg-slate-50 rounded-xl text-right">
                      {Object.entries(GRADE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                    <button className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold">إضافة</button>
                  </form>
                </>
              )}
              {activeTab === "users" && (
                <div className="text-center p-6 bg-indigo-50 rounded-3xl">
                  <Users className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
                  <p className="arabic-text font-bold">إدارة حسابات الطلاب وكلمات المرور</p>
                </div>
              )}
              {activeTab === "subs" && (
                <>
                  <h3 className="text-xl font-bold text-slate-900 arabic-text mb-8">إضافة طالب يدوياً</h3>
                  <form onSubmit={addSub} className="space-y-4">
                    <input type="text" placeholder="اسم الطالب" value={newSub.studentName} onChange={e => setNewSub({...newSub, studentName: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl text-right" />
                    <select value={newSub.grade} onChange={e => setNewSub({...newSub, grade: e.target.value as Grade})} className="w-full p-4 bg-slate-50 rounded-xl text-right">
                      {Object.entries(GRADE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                    <button className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold">تفعيل</button>
                  </form>
                </>
              )}
              {activeTab === "homework" && (
                <div className="space-y-8">
                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
                    <h3 className="text-xl font-bold text-slate-900 arabic-text mb-6">رفع واجب جديد للطلاب</h3>
                    <form onSubmit={addAssignment} className="space-y-4">
                      <input type="text" placeholder="عنوان الواجب" value={newAssignment.title} onChange={e => setNewAssignment({...newAssignment, title: e.target.value})} className="w-full p-4 bg-white rounded-xl text-right border border-slate-200" />
                      <div className="relative border-2 border-dashed border-slate-200 bg-white rounded-xl p-4 text-center">
                        <input 
                          type="file" 
                          accept=".pdf,image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setNewAssignment({
                                ...newAssignment, 
                                fileUrl: URL.createObjectURL(file),
                                fileType: file.type
                              });
                            }
                          }}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <File className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                        <p className="text-xs text-slate-500 arabic-text">{newAssignment.fileUrl ? "تم اختيار ملف" : "اختر ملف الواجب (PDF أو صور)"}</p>
                      </div>
                      <select value={newAssignment.grade} onChange={e => setNewAssignment({...newAssignment, grade: e.target.value as Grade})} className="w-full p-4 bg-white rounded-xl text-right border border-slate-200">
                        {Object.entries(GRADE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
                      <button className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold">رفع الواجب</button>
                    </form>
                  </div>
                  <div className="text-center p-6 bg-indigo-50 rounded-3xl">
                    <Upload className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
                    <p className="arabic-text font-bold">هنا تظهر واجبات الطلاب المرفوعة</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            {activeTab === "users" && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 arabic-text text-right mb-6 flex items-center justify-end gap-2">
                    طلبات تسجيل الحسابات الجديدة
                    <Clock className="w-5 h-5 text-orange-500" />
                  </h3>
                  <div className="space-y-4">
                    {users.filter(u => u.status === "pending").length > 0 ? (
                      users.filter(u => u.status === "pending").map(u => (
                        <div key={u.id} className="bg-white p-6 rounded-3xl border border-orange-100 shadow-sm flex items-center justify-between">
                          <div className="flex gap-2">
                            <button onClick={() => approveUser(u.id)} className="px-6 py-2 bg-green-600 text-white rounded-xl font-bold arabic-text hover:bg-green-700 transition-all">قبول</button>
                            <button onClick={() => deleteItem(u.id, "user")} className="px-4 py-2 text-red-600 font-bold arabic-text">رفض</button>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{u.name}</p>
                            <p className="text-xs text-indigo-600 font-bold">{GRADE_LABELS[u.grade]}</p>
                            <p className="text-sm text-slate-500 font-mono">Phone: {u.phone}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-slate-400 arabic-text py-10">لا توجد طلبات تسجيل معلقة</p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 arabic-text text-right mb-6">الطلاب المقبولين</h3>
                  <div className="space-y-4">
                    {users.filter(u => u.status === "active").length > 0 ? (
                      users.filter(u => u.status === "active").map(u => (
                        <div key={u.id} className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center justify-between">
                          <div className="flex gap-2">
                            <motion.button 
                              whileHover={{ scale: 1.1, color: "#4f46e5" }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setEditingUser({ id: u.id, name: u.name })} 
                              className="text-slate-400 p-2" 
                              title="تغيير كلمة المرور"
                            >
                              <Key className="w-5 h-5" />
                            </motion.button>
                            <motion.button 
                              whileHover={{ scale: 1.1, color: "#ef4444" }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => deleteItem(u.id, "user")} 
                              className="text-slate-400 p-2" 
                              title="حذف الحساب"
                            >
                              <Trash2 className="w-5 h-5" />
                            </motion.button>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{u.name}</p>
                            <p className="text-xs text-indigo-600 font-bold">{GRADE_LABELS[u.grade]}</p>
                            <p className="text-sm text-slate-500 font-mono">Phone: {u.phone}</p>
                            <p className="text-sm text-slate-500 font-mono">Password: {u.password}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-slate-400 arabic-text py-10">لا يوجد طلاب مقبولين حالياً</p>
                    )}
                  </div>
                </div>
              </div>
            )}
            {activeTab === "videos" && videos.map(v => (
              <div key={v.id} className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center justify-between">
                <button onClick={() => deleteItem(v.id, "video")} className="text-red-600"><Trash2 className="w-5 h-5" /></button>
                <div className="text-right">
                  <p className="font-bold">{v.title}</p>
                  <p className="text-xs text-indigo-600 font-bold">{GRADE_LABELS[v.grade]}</p>
                </div>
              </div>
            ))}
            {activeTab === "handouts" && handouts.map(h => (
              <div key={h.id} className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center justify-between">
                <button onClick={() => deleteItem(h.id, "handout")} className="text-red-600"><Trash2 className="w-5 h-5" /></button>
                <div className="text-right">
                  <p className="font-bold">{h.title}</p>
                  <p className="text-xs text-indigo-600 font-bold">{GRADE_LABELS[h.grade]}</p>
                </div>
              </div>
            ))}
            {activeTab === "exams" && exams.map(e => (
              <div key={e.id} className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center justify-between">
                <button onClick={() => deleteItem(e.id, "exam")} className="text-red-600"><Trash2 className="w-5 h-5" /></button>
                <div className="text-right flex items-center gap-4">
                  <div>
                    <p className="font-bold">{e.title}</p>
                    <p className="text-xs text-indigo-600 font-bold">{GRADE_LABELS[e.grade]}</p>
                  </div>
                  <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
                    {e.fileType?.startsWith("image/") ? <Image className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                  </div>
                </div>
              </div>
            ))}
            {activeTab === "subs" && (
              <div className="space-y-12">
                {/* Pending Subscriptions */}
                <div>
                  <h3 className="text-xl font-bold text-slate-900 arabic-text text-right mb-6 flex items-center justify-end gap-2">
                    طلبات الاشتراك المعلقة
                    <Clock className="w-5 h-5 text-orange-500" />
                  </h3>
                  <div className="space-y-4">
                    {subscriptions.filter(s => s.status === "pending").length > 0 ? (
                      subscriptions.filter(s => s.status === "pending").map(s => (
                        <div key={s.id} className="bg-white p-6 rounded-[32px] border border-orange-100 shadow-sm flex items-center justify-between">
                          <div className="flex gap-3">
                            <button 
                              onClick={() => approveSub(s.id)}
                              className="px-6 py-2 bg-green-600 text-white rounded-xl font-bold arabic-text hover:bg-green-700 transition-all"
                            >
                              تفعيل
                            </button>
                            <button 
                              onClick={() => deleteItem(s.id, "sub")}
                              className="px-4 py-2 text-red-600 font-bold arabic-text"
                            >
                              رفض
                            </button>
                          </div>
                          <div className="text-right flex items-center gap-4">
                            <div>
                              <p className="font-bold">{s.studentName}</p>
                              <p className="text-xs text-indigo-600 font-bold">{GRADE_LABELS[s.grade]}</p>
                              <p className="text-[10px] text-slate-400">{s.date}</p>
                            </div>
                            {s.paymentProof && (
                              <div className="flex flex-col items-center gap-1">
                                <button 
                                  onClick={() => setSelectedImage(s.paymentProof || null)}
                                  className="group relative w-16 h-16 bg-slate-50 rounded-2xl overflow-hidden border-2 border-slate-100 hover:border-indigo-400 transition-all shadow-sm"
                                  title="عرض إيصال الدفع"
                                >
                                  <img src={s.paymentProof} alt="Proof" className="w-full h-full object-cover group-hover:scale-110 transition-transform" referrerPolicy="no-referrer" />
                                  <div className="absolute inset-0 bg-indigo-600/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <PlayCircle className="w-6 h-6 text-white" />
                                  </div>
                                </button>
                                <span className="text-[10px] text-indigo-600 font-bold arabic-text">عرض الإيصال</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-slate-400 arabic-text py-10 bg-white rounded-3xl border border-dashed border-slate-100">لا توجد طلبات معلقة حالياً</p>
                    )}
                  </div>
                </div>

                {/* Active Students */}
                <div>
                  <h3 className="text-xl font-bold text-slate-900 arabic-text text-right mb-6 flex items-center justify-end gap-2">
                    الطلاب المشتركين
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  </h3>
                  <div className="space-y-4">
                    {subscriptions.filter(s => s.status === "active").map(s => (
                      <div key={s.id} className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center justify-between">
                        <button onClick={() => deleteItem(s.id, "sub")} className="text-red-600"><Trash2 className="w-5 h-5" /></button>
                        <div className="text-right flex items-center gap-4">
                          <div>
                            <p className="font-bold">{s.studentName}</p>
                            <p className="text-xs text-indigo-600 font-bold">{GRADE_LABELS[s.grade]}</p>
                            <p className="text-[10px] text-slate-400">{s.date}</p>
                          </div>
                          {s.paymentProof && (
                            <div className="flex flex-col items-center gap-1">
                              <button 
                                onClick={() => setSelectedImage(s.paymentProof || null)}
                                className="group relative w-16 h-16 bg-slate-50 rounded-2xl overflow-hidden border-2 border-slate-100 hover:border-indigo-400 transition-all shadow-sm"
                                title="عرض إيصال الدفع"
                              >
                                <img src={s.paymentProof} alt="Proof" className="w-full h-full object-cover group-hover:scale-110 transition-transform" referrerPolicy="no-referrer" />
                                <div className="absolute inset-0 bg-indigo-600/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                  <PlayCircle className="w-6 h-6 text-white" />
                                </div>
                              </button>
                              <span className="text-[10px] text-indigo-600 font-bold arabic-text">عرض الإيصال</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {activeTab === "homework" && (
              <div className="space-y-12">
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-slate-900 arabic-text text-right">الواجبات المرفوعة من المستر</h3>
                  {homeworkAssignments.map(a => (
                    <div key={a.id} className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center justify-between">
                      <button onClick={() => deleteItem(a.id, "assignment")} className="text-red-600"><Trash2 className="w-5 h-5" /></button>
                      <div className="text-right flex items-center gap-4">
                        <div>
                          <p className="font-bold">{a.title}</p>
                          <p className="text-xs text-indigo-600 font-bold">{GRADE_LABELS[a.grade]}</p>
                          <p className="text-[10px] text-slate-400">{a.date}</p>
                        </div>
                        <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                          {a.fileType?.startsWith("image/") ? <Image className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-slate-900 arabic-text text-right">واجبات الطلاب المستلمة</h3>
                  {homeworks.map(h => (
                    <div key={h.id} className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center justify-between">
                      <a href={h.fileUrl} target="_blank" rel="noreferrer" className="text-indigo-600 font-bold arabic-text hover:underline">عرض الملف</a>
                      <div className="text-right">
                        <p className="font-bold">{h.studentName}</p>
                        <p className="text-xs text-indigo-600 font-bold">{GRADE_LABELS[h.grade]}</p>
                        <p className="text-[10px] text-slate-400">{h.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-12">
                <div className="bg-white p-8 rounded-[40px] shadow-xl border border-slate-100">
                  <h3 className="text-xl font-bold text-slate-900 arabic-text mb-6">إعدادات التواصل والدفع</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-right text-slate-600 arabic-text mb-4">أرقام التواصل (فودافون كاش)</label>
                      <div className="space-y-3">
                        {tempContactNumbers.map((num, idx) => (
                          <div key={idx} className="flex gap-2">
                            <button 
                              onClick={() => setTempContactNumbers(tempContactNumbers.filter((_, i) => i !== idx))}
                              className="p-4 text-red-600 bg-red-50 rounded-2xl hover:bg-red-100 transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                            <input 
                              type="text" 
                              value={num}
                              onChange={(e) => {
                                const newNums = [...tempContactNumbers];
                                newNums[idx] = e.target.value;
                                setTempContactNumbers(newNums);
                              }}
                              className="flex-grow p-4 bg-slate-50 border border-slate-200 rounded-2xl text-right outline-none"
                            />
                          </div>
                        ))}
                        <button 
                          onClick={() => setTempContactNumbers([...tempContactNumbers, ""])}
                          className="w-full py-3 border-2 border-dashed border-slate-200 text-slate-400 rounded-2xl hover:border-indigo-600 hover:text-indigo-600 transition-all flex items-center justify-center gap-2"
                        >
                          إضافة رقم جديد <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        setContactNumbers(tempContactNumbers.filter(n => n.trim() !== ""));
                        showToast("تم تحديث الإعدادات بنجاح");
                      }}
                      className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold arabic-text"
                    >
                      حفظ التغييرات
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Password Edit Modal */}
        <AnimatePresence>
          {editingUser && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white p-8 rounded-[40px] shadow-2xl w-full max-w-md text-right"
              >
                <h3 className="text-xl font-bold text-slate-900 arabic-text mb-2">تغيير كلمة المرور</h3>
                <p className="text-slate-500 arabic-text mb-6">تغيير كلمة المرور للطالب: <span className="text-indigo-600 font-bold">{editingUser.name}</span></p>
                
                <input 
                  type="text" 
                  value={newPassInput}
                  onChange={(e) => setNewPassInput(e.target.value)}
                  placeholder="كلمة المرور الجديدة"
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl mb-6 text-right outline-none focus:ring-2 focus:ring-indigo-600"
                />
                
                <div className="flex gap-3">
                  <button 
                    onClick={changePassword}
                    className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold arabic-text"
                  >
                    حفظ التغيير
                  </button>
                  <button 
                    onClick={() => { setEditingUser(null); setNewPassInput(""); }}
                    className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold arabic-text"
                  >
                    إلغاء
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {selectedImage && (
            <div 
              className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[110] flex items-center justify-center p-4"
              onClick={() => setSelectedImage(null)}
            >
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="relative max-w-4xl w-full max-h-[90vh] flex items-center justify-center"
                onClick={e => e.stopPropagation()}
              >
                <button 
                  onClick={() => setSelectedImage(null)}
                  className="absolute -top-12 right-0 text-white hover:text-indigo-400 transition-colors"
                >
                  <X className="w-8 h-8" />
                </button>
                <img 
                  src={selectedImage} 
                  alt="Receipt Preview" 
                  className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl border-4 border-white/10"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const Footer = ({ setPage, contactNumbers }: { setPage: (p: Page) => void, contactNumbers: string[] }) => (
  <footer className="bg-slate-950 text-white py-20 px-4">
    <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-12 text-right">
      <div className="lg:col-span-1">
        <div className="flex items-center justify-end gap-2 mb-6">
          <GraduationCap className="w-8 h-8 text-indigo-400" />
          <span className="text-2xl font-bold tracking-tight">AS Academy</span>
        </div>
        <p className="text-slate-400 arabic-text leading-relaxed">نحن نؤمن بأن كل طالب لديه القدرة على التميز، دورنا هو توفير البيئة والمنهجية الصحيحة لتحقيق ذلك.</p>
      </div>
      <div>
        <h3 className="text-lg font-bold arabic-text mb-8">تواصل معنا</h3>
        <ul className="space-y-4 text-slate-400 arabic-text">
          {contactNumbers.map((num, idx) => (
            <li key={idx} className="flex items-center justify-end gap-3"><span>{num}</span><Smartphone className="w-4 h-4 text-indigo-400" /></li>
          ))}
          <li className="flex items-center justify-end gap-3"><span>info@abdullahsayed.com</span><MessageSquare className="w-4 h-4 text-indigo-400" /></li>
        </ul>
      </div>
      <div>
        <h3 className="text-lg font-bold arabic-text mb-8">تابعنا</h3>
        <div className="flex justify-end gap-4">
          <a href="#" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-indigo-600 transition-colors"><Instagram className="w-5 h-5" /></a>
          <a href="#" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-indigo-600 transition-colors"><Facebook className="w-5 h-5" /></a>
          <a href="#" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-indigo-600 transition-colors"><Youtube className="w-5 h-5" /></a>
        </div>
      </div>
      <div>
        <h3 className="text-lg font-bold arabic-text mb-8">روابط سريعة</h3>
        <ul className="space-y-4 text-slate-400 arabic-text">
          <li><button onClick={() => setPage("home")} className="hover:text-indigo-400 transition-colors">الرئيسية</button></li>
          <li><button onClick={() => setPage("about")} className="hover:text-indigo-400 transition-colors">عن المستر</button></li>
          <li><button onClick={() => setPage("admin")} className="hover:text-indigo-400 transition-colors flex items-center justify-end gap-2">لوحة تحكم المستر <Lock className="w-3 h-3" /></button></li>
        </ul>
      </div>
      <div>
        <h3 className="text-lg font-bold arabic-text mb-8">ساعات العمل</h3>
        <p className="text-slate-400 arabic-text">السبت - الخميس: 10ص - 10م</p>
        <p className="text-slate-400 arabic-text">الجمعة: مغلق</p>
      </div>
    </div>
    <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/5 text-center">
      <p className="text-slate-500 text-sm mb-4">© 2026 Abdullah Sayed English Academy. All rights reserved.</p>
      <div className="bg-white/5 inline-block px-6 py-3 rounded-2xl border border-white/10">
        <p className="text-indigo-400 arabic-text font-bold">تصميم عمر أحمد - 01146780736</p>
      </div>
    </div>
  </footer>
);

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [toast, setToast] = useState<{ message: string, type: "success" | "error" | "info" } | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem("as_academy_users");
      if (!saved) return [];
      const parsed: any[] = JSON.parse(saved);
      console.log("Loaded Users from LocalStorage:", parsed.length);
      return parsed.map(u => ({
        ...u,
        status: u.status || "active",
        phone: u.phone || ""
      }));
    } catch (e) {
      console.error("Error loading users:", e);
      return [];
    }
  });
  const [currentUser, setCurrentUser] = useState<{ name: string, grade: Grade, isSubscribed: boolean } | null>(() => {
    const saved = localStorage.getItem("as_academy_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [videos, setVideos] = useState<VideoItem[]>(() => {
    const saved = localStorage.getItem("as_academy_videos");
    return saved ? JSON.parse(saved) : [];
  });
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() => {
    const saved = localStorage.getItem("as_academy_subs");
    return saved ? JSON.parse(saved) : [];
  });
  const [handouts, setHandouts] = useState<Handout[]>(() => {
    const saved = localStorage.getItem("as_academy_handouts");
    return saved ? JSON.parse(saved) : [];
  });
  const [exams, setExams] = useState<Exam[]>(() => {
    const saved = localStorage.getItem("as_academy_exams");
    return saved ? JSON.parse(saved) : [];
  });
  const [homeworks, setHomeworks] = useState<HomeworkSubmission[]>(() => {
    const saved = localStorage.getItem("as_academy_homeworks");
    return saved ? JSON.parse(saved) : [];
  });
  const [homeworkAssignments, setHomeworkAssignments] = useState<HomeworkAssignment[]>(() => {
    const saved = localStorage.getItem("as_academy_homework_assignments");
    return saved ? JSON.parse(saved) : [];
  });
  const [contactNumbers, setContactNumbers] = useState<string[]>(() => {
    const saved = localStorage.getItem("as_academy_contact_numbers");
    return saved ? JSON.parse(saved) : ["01146780736"];
  });

  useEffect(() => {
    localStorage.setItem("as_academy_users", JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem("as_academy_user", JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem("as_academy_videos", JSON.stringify(videos));
  }, [videos]);

  useEffect(() => {
    localStorage.setItem("as_academy_subs", JSON.stringify(subscriptions));
  }, [subscriptions]);

  useEffect(() => {
    localStorage.setItem("as_academy_handouts", JSON.stringify(handouts));
  }, [handouts]);

  useEffect(() => {
    localStorage.setItem("as_academy_exams", JSON.stringify(exams));
  }, [exams]);

  useEffect(() => {
    localStorage.setItem("as_academy_homeworks", JSON.stringify(homeworks));
  }, [homeworks]);

  useEffect(() => {
    localStorage.setItem("as_academy_homework_assignments", JSON.stringify(homeworkAssignments));
  }, [homeworkAssignments]);

  useEffect(() => {
    localStorage.setItem("as_academy_contact_numbers", JSON.stringify(contactNumbers));
  }, [contactNumbers]);

  useEffect(() => {
    if (currentUser) {
      const activeSub = subscriptions.find(s => 
        s.studentName === currentUser.name && 
        s.grade === currentUser.grade && 
        s.status === "active"
      );
      if (activeSub && !currentUser.isSubscribed) {
        setCurrentUser({ ...currentUser, isSubscribed: true });
      } else if (!activeSub && currentUser.isSubscribed) {
        setCurrentUser({ ...currentUser, isSubscribed: false });
      }
    }
  }, [subscriptions, currentUser?.name, currentUser?.grade]);

  useEffect(() => {
    if (currentUser && !currentUser.isSubscribed && ["courses", "handouts", "exams", "homework"].includes(page)) {
      setPage("home");
    }
  }, [page, currentUser?.isSubscribed]);

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-indigo-100 selection:text-indigo-900">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 50, x: "-50%" }}
            className={`fixed bottom-8 left-1/2 z-[200] px-6 py-3 rounded-2xl shadow-2xl font-bold arabic-text flex items-center gap-3 ${
              toast.type === "success" ? "bg-green-600 text-white" : 
              toast.type === "error" ? "bg-red-600 text-white" : "bg-indigo-600 text-white"
            }`}
          >
            {toast.type === "success" && <CheckCircle2 className="w-5 h-5" />}
            {toast.type === "error" && <X className="w-5 h-5" />}
            {toast.type === "info" && <MessageSquare className="w-5 h-5" />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
      <Navbar activePage={page} setPage={setPage} currentUser={currentUser} setCurrentUser={setCurrentUser} />
      <main>
        <AnimatePresence mode="wait">
          {page === "home" && <motion.div key="home" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}><HomePage setPage={setPage} currentUser={currentUser} setCurrentUser={setCurrentUser} users={users} setUsers={setUsers} subscriptions={subscriptions} showToast={showToast} /></motion.div>}
          {page === "payment" && <motion.div key="payment" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}><PaymentPage currentUser={currentUser} setSubscriptions={setSubscriptions} subscriptions={subscriptions} setCurrentUser={setCurrentUser} showToast={showToast} contactNumbers={contactNumbers} /></motion.div>}
          {page === "courses" && <motion.div key="courses" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}><CoursesPage videos={videos} currentUser={currentUser} /></motion.div>}
          {page === "handouts" && <motion.div key="handouts" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}><HandoutsPage handouts={handouts} currentUser={currentUser} /></motion.div>}
          {page === "exams" && <motion.div key="exams" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}><ExamsPage exams={exams} currentUser={currentUser} /></motion.div>}
          {page === "homework" && <motion.div key="homework" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}><HomeworkPage setHomeworks={setHomeworks} homeworks={homeworks} homeworkAssignments={homeworkAssignments} currentUser={currentUser} showToast={showToast} /></motion.div>}
          {page === "admin" && (
            <motion.div key="admin" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <AdminDashboard 
                videos={videos} 
                setVideos={setVideos} 
                subscriptions={subscriptions} 
                setSubscriptions={setSubscriptions}
                handouts={handouts}
                setHandouts={setHandouts}
                exams={exams}
                setExams={setExams}
                homeworks={homeworks}
                setHomeworks={setHomeworks}
                homeworkAssignments={homeworkAssignments}
                setHomeworkAssignments={setHomeworkAssignments}
                users={users}
                setUsers={setUsers}
                showToast={showToast}
                contactNumbers={contactNumbers}
                setContactNumbers={setContactNumbers}
              />
            </motion.div>
          )}
          {page === "about" && (
            <motion.div key="about" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="pt-32 pb-20 px-4 max-w-5xl mx-auto text-right arabic-text">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  <div className="order-2 lg:order-1">
                    <h2 className="text-4xl font-bold mb-8">عن مستر عبدالله سيد</h2>
                    <p className="text-xl leading-relaxed text-slate-600 mb-6">مستر عبدالله سيد هو خبير تعليم اللغة الإنجليزية بخبرة تمتد لأكثر من 10 سنوات في تدريس المناهج المصرية والدولية. حاصل على شهادات معتمدة في طرق التدريس الحديثة، وقد ساعد آلاف الطلاب على تخطي حاجز الخوف من اللغة وتحقيق نتائج مبهرة في الامتحانات الرسمية.</p>
                    <div className="flex gap-4 justify-end">
                      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center flex-1">
                        <p className="text-3xl font-bold text-indigo-600 mb-1">+10</p>
                        <p className="text-sm text-slate-500">سنوات خبرة</p>
                      </div>
                      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center flex-1">
                        <p className="text-3xl font-bold text-indigo-600 mb-1">+5000</p>
                        <p className="text-sm text-slate-500">طالب ناجح</p>
                      </div>
                    </div>
                  </div>
                  <div className="order-1 lg:order-2">
                    <div className="rounded-[40px] overflow-hidden shadow-2xl border-8 border-white">
                      <img 
                        src="https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&q=80&w=1000" 
                        alt="English Class" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <Footer setPage={setPage} contactNumbers={contactNumbers} />
    </div>
  );
}
