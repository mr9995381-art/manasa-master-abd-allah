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
  Key,
  Bell,
  BarChart3,
  Edit3,
  CheckCircle,
  UserCheck,
  AlertCircle,
  FileUp
} from "lucide-react";

import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import { 
  db, 
  auth,
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocFromServer,
  getDocs, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy,
  handleFirestoreError,
  OperationType
} from "./firebase";

// --- Types ---
type Page = "home" | "about" | "courses" | "payment" | "admin" | "handouts" | "exams" | "homework";
type Grade = "pri1" | "pri2" | "pri3" | "pri4" | "pri5" | "pri6" | "prep1" | "prep2" | "prep3" | "sec1" | "sec2" | "sec3";

interface VideoItem {
  id: string;
  title: string;
  url: string;
  grade: Grade;
  type: "youtube" | "file";
  category?: string;
}

interface Handout {
  id: string;
  title: string;
  url: string;
  grade: Grade;
  category?: string;
}

interface Exam {
  id: string;
  title: string;
  fileUrl: string;
  fileType: string;
  grade: Grade;
  category?: string;
}

interface HomeworkSubmission {
  id: string;
  studentId: string;
  studentName: string;
  assignmentId: string;
  assignmentTitle: string;
  grade: Grade;
  fileUrl: string;
  fileType?: string;
  date: string;
  gradeValue?: string;
  teacherComment?: string;
}

interface ExamSubmission {
  id: string;
  studentId: string;
  studentName: string;
  examId: string;
  examTitle: string;
  grade: Grade;
  fileUrl: string;
  fileType?: string;
  date: string;
  gradeValue?: string;
  teacherComment?: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  isRead: boolean;
  userId?: string;
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
  password?: string;
  status: "pending" | "active";
  role?: "admin" | "student";
}

interface Subscription {
  id: string;
  studentName: string;
  grade: Grade;
  date: string;
  activationDate?: number; // Timestamp when subscription was activated
  status: "active" | "pending";
  paymentProof?: string;
}

const GRADE_LABELS: Record<Grade, string> = {
  pri1: "الصف الأول الابتدائي",
  pri2: "الصف الثاني الابتدائي",
  pri3: "الصف الثالث الابتدائي",
  pri4: "الصف الرابع الابتدائي",
  pri5: "الصف الخامس الابتدائي",
  pri6: "الصف السادس الابتدائي",
  prep1: "الصف الأول الإعدادي",
  prep2: "الصف الثاني الإعدادي",
  prep3: "الصف الثالث الإعدادي",
  sec1: "الصف الأول الثانوي",
  sec2: "الصف الثاني الثانوي",
  sec3: "الصف الثالث الثانوي",
};

const checkSubscription = (studentName: string, grade: Grade, subscriptions: Subscription[]): { isValid: boolean, daysRemaining: number, sub?: Subscription } => {
  const activeSubs = subscriptions.filter(s => 
    s.studentName === studentName && 
    s.grade === grade && 
    s.status === "active"
  );
  
  if (activeSubs.length === 0) return { isValid: false, daysRemaining: 0 };
  
  // Get the one with the latest activationDate
  const latestSub = activeSubs.reduce((prev, current) => 
    (prev.activationDate || 0) > (current.activationDate || 0) ? prev : current
  );
  
  if (!latestSub.activationDate) return { isValid: false, daysRemaining: 0 };
  
  const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
  const timePassed = Date.now() - latestSub.activationDate;
  const isValid = timePassed < thirtyDaysInMs;
  const daysRemaining = Math.max(0, Math.ceil((thirtyDaysInMs - timePassed) / (24 * 60 * 60 * 1000)));
  
  return { isValid, daysRemaining, sub: latestSub };
};

// --- Components ---

const Navbar = ({ 
  activePage, 
  setPage, 
  currentUser, 
  setCurrentUser,
  notifications,
  setNotifications
}: { 
  activePage: Page, 
  setPage: (p: Page) => void,
  currentUser: any,
  setCurrentUser: (u: any) => void,
  notifications: Notification[],
  setNotifications: (n: Notification[]) => void
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead && (n.userId === currentUser?.id || !n.userId)).length;

  const navLinks: { id: Page, label: string, icon: any, protected?: boolean }[] = [
    { id: "home" as Page, label: "الرئيسية", icon: BookOpen },
    { id: "courses" as Page, label: "المحاضرات", icon: PlayCircle, protected: true },
    { id: "handouts" as Page, label: "الملازم PDF", icon: FileText, protected: true },
    { id: "exams" as Page, label: "الامتحانات", icon: ClipboardCheck, protected: true },
    { id: "homework" as Page, label: "تسليم الواجب", icon: Upload, protected: true },
    { id: "about" as Page, label: "عن المستر", icon: Users },
  ].filter(link => !link.protected || (currentUser && currentUser.isSubscribed));

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setPage("home");
    } catch (e) {
      console.error("Sign out error:", e);
    }
  };

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter(notif => !notif.isRead && (notif.userId === currentUser?.id || !notif.userId));
    
    for (const notif of unreadNotifications) {
      try {
        await updateDoc(doc(db, "notifications", notif.id), { isRead: true });
      } catch (e) {
        console.error("Error marking notification as read:", e);
      }
    }
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
                
                <div className="relative">
                  <button 
                    onClick={() => {
                      setShowNotifications(!showNotifications);
                      if (!showNotifications) markAllAsRead();
                    }}
                    className="p-2 text-slate-400 hover:text-indigo-600 transition-colors relative"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full font-bold">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  <AnimatePresence>
                    {showNotifications && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute left-0 mt-2 w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-[100]"
                      >
                        <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                          <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-slate-600">
                            <X className="w-4 h-4" />
                          </button>
                          <h4 className="font-bold text-slate-900 arabic-text">الإشعارات</h4>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          {notifications.filter(n => n.userId === currentUser.id || !n.userId).length > 0 ? (
                            notifications
                              .filter(n => n.userId === currentUser.id || !n.userId)
                              .sort((a, b) => b.id.localeCompare(a.id))
                              .map((notif) => (
                                <div key={notif.id} className={`p-4 border-b border-slate-50 text-right hover:bg-slate-50 transition-colors ${!notif.isRead ? "bg-indigo-50/30" : ""}`}>
                                  <p className="text-sm font-bold text-slate-900 arabic-text mb-1">{notif.title}</p>
                                  <p className="text-xs text-slate-600 arabic-text mb-2 leading-relaxed">{notif.message}</p>
                                  <p className="text-[10px] text-slate-400">{notif.date}</p>
                                </div>
                              ))
                          ) : (
                            <div className="p-8 text-center">
                              <Bell className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                              <p className="text-slate-400 arabic-text text-sm">لا توجد إشعارات حالياً</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

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

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Check if user exists in Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        const { isValid: isSubscribed } = checkSubscription(userData.name, userData.grade, subscriptions);
        setCurrentUser({ id: user.uid, name: userData.name, grade: userData.grade, isSubscribed });
        
        if (isSubscribed) {
          setPage("courses");
        } else {
          setPage("payment");
        }
        showToast(`أهلاً بك يا ${userData.name}`);
      } else {
        // New user - need to collect grade and phone
        const newUser: User = {
          id: user.uid,
          name: user.displayName || "طالب جديد",
          phone: "",
          grade: "prep1",
          password: "google-auth",
          status: "pending"
        };
        await setDoc(doc(db, "users", user.uid), newUser);
        setCurrentUser({ id: user.uid, name: newUser.name, grade: newUser.grade, isSubscribed: false });
        setPage("payment");
        showToast("تم تسجيل الدخول بنجاح. يرجى إكمال بياناتك والاشتراك.");
      }
    } catch (e) {
      console.error("Google Sign-In Error:", e);
      alert("فشل تسجيل الدخول بجوجل. يرجى المحاولة مرة أخرى.");
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const trimmedName = name.trim();
      const trimmedPassword = password.trim();
      
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
        const userId = Date.now().toString();
        const newUser: User = { 
          id: userId, 
          name: trimmedName, 
          phone: phone.trim(), 
          grade, 
          password: trimmedPassword, 
          status: "pending" 
        };
        
        try {
          await setDoc(doc(db, "users", userId), newUser);
          setCurrentUser({ id: newUser.id, name: newUser.name, grade: newUser.grade, isSubscribed: false });
          setPage("payment");
          window.scrollTo(0, 0);
          alert("تم إنشاء الحساب بنجاح! يمكنك الآن إكمال عملية الاشتراك لتفعيل حسابك.");
          showToast("تم إنشاء الحساب بنجاح");
        } catch (e) {
          handleFirestoreError(e, OperationType.WRITE, "users/" + userId);
        }
      } else {
        const user = users.find(u => u.name.trim().toLowerCase() === trimmedName.toLowerCase() && u.password.trim() === trimmedPassword);
        
        if (user) {
          const { isValid: isSubscribed } = checkSubscription(user.name, user.grade, subscriptions);
          setCurrentUser({ id: user.id, name: user.name, grade: user.grade, isSubscribed });
          
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
      <section className="pt-10 pb-20 px-4">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-start">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative flex justify-center">
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

          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="text-right">
            <div className="inline-block px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-sm font-bold arabic-text mb-6">منصة مستر عبدالله سيد التعليمية</div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-slate-900 arabic-text leading-[1.2] lg:leading-[1.1] mb-8">منصة مستر عبدالله سيد <br /><span className="text-indigo-600">لتعلم الإنجليزية بذكاء</span></h1>
            <p className="text-lg md:text-xl text-slate-600 arabic-text mb-10 leading-relaxed max-w-xl ml-auto">نحن لا ندرس اللغة فقط، بل نمنحك الأدوات لتتحدثها بطلاقة وتتفوق في دراستك من خلال منهجية علمية مبتكرة.</p>
            
            {!currentUser ? (
              <div className="bg-white p-6 sm:p-8 rounded-[32px] sm:rounded-[40px] shadow-2xl border border-slate-100 max-w-md ml-auto">
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
                  <button 
                    type="button"
                    onClick={handleGoogleSignIn}
                    className="w-full py-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-50 transition-all font-bold arabic-text"
                  >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
                    {mode === "register" ? "إنشاء حساب بجوجل" : "دخول بجوجل"}
                  </button>
                  <div className="flex items-center gap-4 py-2">
                    <div className="h-px bg-slate-100 flex-grow"></div>
                    <span className="text-slate-400 text-xs arabic-text">أو بالاسم وكلمة المرور</span>
                    <div className="h-px bg-slate-100 flex-grow"></div>
                  </div>
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
              <div className="flex flex-col items-end gap-6">
                {currentUser.isSubscribed ? (
                  <>
                    <div className="bg-green-50 border border-green-100 p-6 rounded-3xl text-right w-full max-w-md">
                      <div className="flex items-center justify-end gap-3 mb-2">
                        <h4 className="text-xl font-bold text-green-900 arabic-text">اشتراكك مفعل</h4>
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                      </div>
                      <p className="text-green-700 arabic-text">
                        متبقي على انتهاء اشتراكك: <span className="font-bold text-2xl mx-1">{checkSubscription(currentUser.name, currentUser.grade, subscriptions).daysRemaining}</span> يوم
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-4 justify-end">
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setPage("courses")} 
                        className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold arabic-text text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 flex items-center gap-3"
                      >
                        المحاضرات <ChevronLeft className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </>
                ) : (
                  <>
                    {subscriptions.some(s => s.studentName === currentUser.name && s.grade === currentUser.grade && s.status === "active") && (
                      <div className="bg-red-50 border border-red-100 p-6 rounded-3xl text-right w-full max-w-md">
                        <div className="flex items-center justify-end gap-3 mb-2">
                          <h4 className="text-xl font-bold text-red-900 arabic-text">انتهى اشتراكك</h4>
                          <Clock className="w-6 h-6 text-red-600" />
                        </div>
                        <p className="text-red-700 arabic-text">لقد انتهت مدة اشتراكك الشهري. يرجى التجديد للوصول للمحتوى.</p>
                      </div>
                    )}
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setPage("payment")} 
                      className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold arabic-text text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 flex items-center gap-3"
                    >
                      {subscriptions.some(s => s.studentName === currentUser.name && s.grade === currentUser.grade && s.status === "active") ? "تجديد الاشتراك الآن" : "اشترك الآن لتفعيل المحتوى"} <ChevronLeft className="w-5 h-5" />
                    </motion.button>
                  </>
                )}
              </div>
            )}
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
  contactNumbers,
  gradePrices
}: { 
  currentUser: any, 
  setSubscriptions: (s: Subscription[]) => void,
  subscriptions: Subscription[],
  setCurrentUser: (u: any) => void,
  showToast: (m: string, t?: "success" | "error" | "info") => void,
  contactNumbers: string[],
  gradePrices: Record<Grade, number>
}) => {
  const [proof, setProof] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pendingSub = subscriptions.find(s => s.studentName === currentUser?.name && s.grade === currentUser?.grade && s.status === "pending");

  const handleConfirmPayment = async () => {
    if (!currentUser) return;
    
    if (!proof) {
      alert("يرجى رفع صورة إيصال التحويل أولاً.");
      return;
    }
    
    setIsSubmitting(true);
    
    const id = Date.now().toString();
    const newSubscription: Subscription = {
      id,
      studentName: currentUser.name,
      grade: currentUser.grade,
      date: new Date().toLocaleDateString('ar-EG'),
      status: "pending",
      paymentProof: proof
    };

    try {
      await setDoc(doc(db, "subscriptions", id), newSubscription);
      showToast("تم إرسال طلب الاشتراك بنجاح");
      setIsSubmitting(false);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, "subscriptions/" + id);
      setIsSubmitting(false);
    }
  };

  const hasPendingSub = subscriptions.some(s => s.studentName === currentUser?.name && s.status === "pending");

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
              href={`https://wa.me/20${contactNumbers[0]?.replace(/^0/, '') || '1146780736'}?text=${encodeURIComponent(`أهلاً مستر عبدالله، أنا الطالب ${currentUser.name}، قمت بتحويل مبلغ الاشتراك ورفعت صورة الإيصال الآن على المنصة. يرجى مراجعة الطلب وتفعيل حسابي.`)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-2 bg-[#25D366] text-white rounded-xl font-bold arabic-text hover:bg-[#128C7E] transition-all"
            >
              تذكير المستر عبر واتساب <MessageSquare className="w-4 h-4" />
            </a>
          </motion.div>
        )}

        <div className="bg-white rounded-[32px] sm:rounded-[40px] p-6 sm:p-10 shadow-xl border border-slate-100">
          <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mb-8 ml-auto">
            <CreditCard className="w-10 h-10" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 arabic-text mb-6">طريقة الاشتراك والدفع</h2>
          
          <div className="mb-8 p-6 bg-indigo-600 text-white rounded-3xl text-center">
            <p className="text-lg arabic-text mb-1">قيمة الاشتراك الشهري لـ {GRADE_LABELS[currentUser?.grade as Grade]}</p>
            <p className="text-4xl font-bold font-mono">{gradePrices[currentUser?.grade as Grade] || 0} EGP / شهرياً</p>
          </div>
          
          <div className="space-y-6 md:space-y-8">
            <div className="flex flex-col items-end gap-6 p-6 bg-slate-50 rounded-3xl border border-slate-100">
              <div className="w-full text-right">
                <h4 className="text-xl font-bold text-slate-900 arabic-text mb-2">التحويل عبر انستا باي (InstaPay)</h4>
                <p className="text-slate-600 arabic-text mb-4">يتم تحويل مبلغ الاشتراك شهرياً على أحد العناوين أو الأرقام التالية:</p>
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

            <div className="flex flex-col items-start justify-end gap-6 p-6 bg-slate-50 rounded-3xl border border-slate-100">
              <div className="w-full text-right">
                <h4 className="text-xl font-bold text-slate-900 arabic-text mb-2">تأكيد الاشتراك</h4>
                <p className="text-slate-600 arabic-text mb-4">بعد رفع الإيصال، اضغط على الزر أدناه لتأكيد طلبك.</p>
                <div className="flex flex-col sm:flex-row-reverse gap-3 justify-start">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleConfirmPayment}
                    disabled={isSubmitting || !!pendingSub}
                    className={`px-10 py-4 rounded-2xl font-bold arabic-text shadow-lg transition-all ${
                      isSubmitting || !!pendingSub
                        ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                        : "bg-indigo-600 text-white hover:bg-indigo-700"
                    }`}
                  >
                    {isSubmitting ? "جاري الإرسال..." : "تأكيد وإرسال الإيصال"}
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SearchAndFilter = ({ 
  searchQuery, 
  setSearchQuery, 
  categoryFilter, 
  setCategoryFilter, 
  categories 
}: { 
  searchQuery: string, 
  setSearchQuery: (s: string) => void, 
  categoryFilter: string, 
  setCategoryFilter: (s: string) => void, 
  categories: string[] 
}) => (
  <div className="flex flex-col md:flex-row gap-4 mb-8 justify-end items-center">
    <div className="relative w-full md:w-64">
      <select 
        value={categoryFilter} 
        onChange={(e) => setCategoryFilter(e.target.value)}
        className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-right arabic-text outline-none focus:ring-2 focus:ring-indigo-600 appearance-none"
      >
        <option value="">كل التصنيفات</option>
        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
      </select>
      <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
        <Menu className="w-4 h-4" />
      </div>
    </div>
    <div className="relative w-full md:w-96">
      <input 
        type="text" 
        placeholder="ابحث عن عنوان..." 
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-right arabic-text outline-none focus:ring-2 focus:ring-indigo-600"
      />
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
        <Target className="w-4 h-4" />
      </div>
    </div>
  </div>
);

const CoursesPage = ({ videos, currentUser }: { videos: VideoItem[], currentUser: any }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
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

  const gradeVideos = videos.filter(v => v.grade === selectedGrade);
  const categories = Array.from(new Set(gradeVideos.map(v => v.category).filter(Boolean))) as string[];
  
  const filteredVideos = gradeVideos.filter(v => {
    const matchesSearch = v.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !categoryFilter || v.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="pt-32 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-right mb-12">
          <h2 className="text-4xl font-bold text-slate-900 arabic-text mb-4">محاضرات {GRADE_LABELS[selectedGrade]}</h2>
          <p className="text-slate-600 arabic-text">أهلاً بك يا {currentUser.name}، إليك جميع المحاضرات المتاحة لصفك الدراسي.</p>
        </div>

        <SearchAndFilter 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
          categoryFilter={categoryFilter} 
          setCategoryFilter={setCategoryFilter} 
          categories={categories} 
        />
        
        {filteredVideos.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
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
                  {video.category && (
                    <div className="absolute top-4 right-4 px-3 py-1 bg-white/10 backdrop-blur-md text-white text-[10px] rounded-full font-bold arabic-text">
                      {video.category}
                    </div>
                  )}
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
          <div className="bg-white rounded-[32px] sm:rounded-[40px] p-10 sm:p-20 text-center border-2 border-dashed border-slate-200">
            <Video className="w-20 h-20 text-slate-200 mx-auto mb-6" />
            <p className="text-2xl text-slate-400 arabic-text font-bold">لا توجد فيديوهات تطابق بحثك</p>
          </div>
        )}
      </div>
    </div>
  );
};

const HandoutsPage = ({ handouts, currentUser }: { handouts: Handout[], currentUser: any }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const selectedGrade = currentUser?.grade as Grade;

  if (!currentUser || !currentUser.isSubscribed) {
    return (
      <div className="pt-40 pb-20 px-4 text-center">
        <FileText className="w-20 h-20 text-slate-200 mx-auto mb-6" />
        <h2 className="text-3xl font-bold text-slate-900 arabic-text mb-4">الملازم للمشتركين فقط</h2>
        <p className="text-slate-600 arabic-text">يرجى الاشتراك للوصول إلى الملازم والملخصات.</p>
      </div>
    );
  }

  const gradeHandouts = handouts.filter(h => h.grade === selectedGrade);
  const categories = Array.from(new Set(gradeHandouts.map(h => h.category).filter(Boolean))) as string[];
  
  const filteredHandouts = gradeHandouts.filter(h => {
    const matchesSearch = h.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !categoryFilter || h.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="pt-32 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-right mb-12">
          <h2 className="text-4xl font-bold text-slate-900 arabic-text mb-4">الملازم والملخصات PDF</h2>
          <p className="text-slate-600 arabic-text">إليك جميع الملفات التعليمية الخاصة بـ {GRADE_LABELS[selectedGrade]}.</p>
        </div>

        <SearchAndFilter 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
          categoryFilter={categoryFilter} 
          setCategoryFilter={setCategoryFilter} 
          categories={categories} 
        />
        
        {filteredHandouts.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filteredHandouts.map((handout) => (
              <motion.div 
                key={handout.id} 
                whileHover={{ y: -5 }}
                className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 flex flex-col items-end text-right"
              >
                <div className="w-full flex justify-between items-start mb-6">
                  {handout.category && (
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] rounded-full font-bold arabic-text">
                      {handout.category}
                    </span>
                  )}
                  <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center">
                    <FileText className="w-8 h-8" />
                  </div>
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
          <div className="bg-white rounded-[32px] sm:rounded-[40px] p-10 sm:p-20 text-center border-2 border-dashed border-slate-200">
            <FileText className="w-20 h-20 text-slate-200 mx-auto mb-6" />
            <p className="text-2xl text-slate-400 arabic-text font-bold">لا توجد ملازم تطابق بحثك</p>
          </div>
        )}
      </div>
    </div>
  );
};

const ExamsPage = ({ 
  exams, 
  currentUser,
  examSubmissions,
  setExamSubmissions,
  showToast
}: { 
  exams: Exam[], 
  currentUser: any,
  examSubmissions: ExamSubmission[],
  setExamSubmissions: (s: ExamSubmission[]) => void,
  showToast: (m: string, t?: "success" | "error" | "info") => void
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
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

  const gradeExams = exams.filter(e => e.grade === selectedGrade);
  const categories = Array.from(new Set(gradeExams.map(e => e.category).filter(Boolean))) as string[];
  
  const handleUploadSolution = async (exam: Exam, file: File) => {
    if (!currentUser) return;
    const id = Date.now().toString();
    const newSubmission: ExamSubmission = {
      id,
      studentId: currentUser.id || "unknown",
      studentName: currentUser.name,
      examId: exam.id,
      examTitle: exam.title,
      grade: selectedGrade,
      fileUrl: "https://picsum.photos/seed/" + id + "/800/600", // Simulated upload for demo
      fileType: file.type,
      date: new Date().toLocaleDateString('ar-EG')
    };
    try {
      await setDoc(doc(db, "examSubmissions", id), newSubmission);
      showToast("تم رفع حل الامتحان بنجاح! سيقوم المستر بتصحيحه قريباً.");
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, "examSubmissions/" + id);
    }
  };

  const filteredExams = gradeExams.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !categoryFilter || e.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="pt-32 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-right mb-12">
          <h2 className="text-4xl font-bold text-slate-900 arabic-text mb-4">الاختبارات والتقييمات</h2>
          <p className="text-slate-600 arabic-text">اختبر مستواك في {GRADE_LABELS[selectedGrade]} من خلال هذه الامتحانات.</p>
        </div>

        <SearchAndFilter 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
          categoryFilter={categoryFilter} 
          setCategoryFilter={setCategoryFilter} 
          categories={categories} 
        />
        
        {filteredExams.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filteredExams.map((exam) => (
              <motion.div 
                key={exam.id} 
                whileHover={{ y: -5 }}
                className="bg-white p-4 rounded-[32px] shadow-sm border border-slate-100 flex flex-col items-end text-right"
              >
                <div className="w-full aspect-[3/4] bg-slate-50 rounded-2xl overflow-hidden mb-6 flex items-center justify-center relative">
                  {exam.category && (
                    <div className="absolute top-4 right-4 px-3 py-1 bg-indigo-600 text-white text-[10px] rounded-full font-bold arabic-text z-10">
                      {exam.category}
                    </div>
                  )}
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
                <div className="flex flex-col gap-2 w-full mt-auto">
                  <a 
                    href={exam.fileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold arabic-text hover:bg-slate-200 transition-all"
                  >
                    عرض الامتحان <ExternalLink className="w-4 h-4" />
                  </a>
                  
                  {examSubmissions.some(s => s.examId === exam.id && s.studentName === currentUser.name) ? (
                    <div className="p-3 bg-green-50 rounded-xl border border-green-100 text-center">
                      <p className="text-green-700 font-bold arabic-text text-sm">تم تسليم الحل</p>
                      {examSubmissions.find(s => s.examId === exam.id && s.studentName === currentUser.name)?.gradeValue && (
                        <p className="text-indigo-600 font-bold mt-1">الدرجة: {examSubmissions.find(s => s.examId === exam.id && s.studentName === currentUser.name)?.gradeValue}</p>
                      )}
                    </div>
                  ) : (
                    <div className="relative">
                      <input 
                        type="file" 
                        accept="image/*,.pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleUploadSolution(exam, file);
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <button className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold arabic-text hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                        رفع الحل <Upload className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[32px] sm:rounded-[40px] p-10 sm:p-20 text-center border-2 border-dashed border-slate-200">
            <ClipboardCheck className="w-20 h-20 text-slate-200 mx-auto mb-6" />
            <p className="text-2xl text-slate-400 arabic-text font-bold">لا توجد امتحانات تطابق بحثك</p>
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
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>("");
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

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !selectedAssignmentId) return;

    const assignment = homeworkAssignments.find(a => a.id === selectedAssignmentId);
    if (!assignment) return;

    const id = Date.now().toString();
    const newSubmission: HomeworkSubmission = {
      id,
      studentId: currentUser.id || "unknown",
      studentName: currentUser.name,
      assignmentId: assignment.id,
      assignmentTitle: assignment.title,
      grade: selectedGrade,
      fileUrl: "https://picsum.photos/seed/" + id + "/800/600", // Simulated upload for demo
      fileType: file.type,
      date: new Date().toLocaleDateString('ar-EG')
    };

    try {
      await setDoc(doc(db, "homeworkSubmissions", id), newSubmission);
      setFile(null);
      setSelectedAssignmentId("");
      showToast("تم تسليم الواجب بنجاح! سيقوم المستر بتصحيحه قريباً.");
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, "homeworkSubmissions/" + id);
    }
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
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
            <div className="bg-white p-10 sm:p-12 rounded-[32px] sm:rounded-[40px] text-center border-2 border-dashed border-slate-100">
              <p className="text-slate-400 arabic-text font-bold">لا توجد واجبات مطلوبة حالياً لصفك الدراسي</p>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          <div className="bg-white p-10 rounded-[40px] shadow-xl border border-slate-100 text-right order-2 lg:order-1">
            <h3 className="text-2xl font-bold text-slate-900 arabic-text mb-8">ارفع ملف الواجب</h3>
            <form onSubmit={handleUpload} className="space-y-6">
              <div>
                <label className="block text-slate-600 arabic-text mb-2">اختر الواجب</label>
                <select 
                  value={selectedAssignmentId} 
                  onChange={(e) => setSelectedAssignmentId(e.target.value)}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-right outline-none focus:ring-2 focus:ring-indigo-600"
                >
                  <option value="">اختر الواجب المطلوب تسليمه</option>
                  {myAssignments.map(a => (
                    <option key={a.id} value={a.id}>{a.title}</option>
                  ))}
                </select>
              </div>
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
                disabled={!file || !selectedAssignmentId}
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
  examSubmissions,
  setExamSubmissions,
  homeworkAssignments,
  setHomeworkAssignments,
  users,
  setUsers,
  showToast,
  addNotification,
  contactNumbers,
  setContactNumbers,
  gradePrices,
  setGradePrices
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
  examSubmissions: ExamSubmission[],
  setExamSubmissions: (s: ExamSubmission[]) => void,
  homeworkAssignments: HomeworkAssignment[],
  setHomeworkAssignments: (h: HomeworkAssignment[]) => void,
  users: User[],
  setUsers: React.Dispatch<React.SetStateAction<User[]>>,
  showToast: (m: string, t?: "success" | "error" | "info") => void,
  addNotification: (title: string, message: string, userId?: string) => void,
  contactNumbers: string[],
  setContactNumbers: (n: string[]) => void,
  gradePrices: Record<Grade, number>,
  setGradePrices: (p: Record<Grade, number>) => void
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState<"videos" | "subs" | "handouts" | "exams" | "homework" | "users" | "settings" | "prices" | "stats">("stats");
  
  const [newVideo, setNewVideo] = useState({ title: "", url: "", grade: "prep1" as Grade, type: "youtube" as "youtube" | "file", category: "" });
  const [newHandout, setNewHandout] = useState({ title: "", url: "", grade: "prep1" as Grade, category: "" });
  const [newExam, setNewExam] = useState({ title: "", fileUrl: "", fileType: "", grade: "prep1" as Grade, category: "" });
  const [newSub, setNewSub] = useState({ studentName: "", grade: "prep1" as Grade });
  const [newAssignment, setNewAssignment] = useState({ title: "", fileUrl: "", fileType: "", grade: "prep1" as Grade, category: "" });
  const [editingUser, setEditingUser] = useState<{ id: string, name: string } | null>(null);
  const [newPassInput, setNewPassInput] = useState("");
  const [tempContactNumbers, setTempContactNumbers] = useState(contactNumbers);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Stats calculation
  const stats = {
    totalStudents: users.length,
    activeStudents: users.filter(u => u.status === "active").length,
    pendingStudents: users.filter(u => u.status === "pending").length,
    totalSubs: subscriptions.length,
    activeSubs: subscriptions.filter(s => s.status === "active").length,
    pendingSubs: subscriptions.filter(s => s.status === "pending").length,
    totalVideos: videos.length,
    totalHandouts: handouts.length,
    totalExams: exams.length,
    totalHomeworks: homeworkAssignments.length,
    pendingHomeworkGrading: homeworks.filter(h => !h.gradeValue).length,
    pendingExamGrading: examSubmissions.filter(e => !e.gradeValue).length,
    totalPendingGrading: homeworks.filter(h => !h.gradeValue).length + examSubmissions.filter(e => !e.gradeValue).length
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin123") {
      setIsLoggedIn(true);
      showToast("تم تسجيل الدخول بنجاح");
    } else {
      showToast("كلمة المرور خاطئة", "error");
    }
  };

  const addVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVideo.title || !newVideo.url) return;
    const id = Date.now().toString();
    const videoData = { ...newVideo, id };
    try {
      await setDoc(doc(db, "videos", id), videoData);
      setNewVideo({ title: "", url: "", grade: "prep1", type: "youtube", category: "" });
      showToast("تم إضافة الفيديو بنجاح");
      addNotification("فيديو جديد", `تم إضافة فيديو جديد: ${newVideo.title}`);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, "videos/" + id);
    }
  };

  const addHandout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHandout.title || !newHandout.url) return;
    const id = Date.now().toString();
    const handoutData = { ...newHandout, id };
    try {
      await setDoc(doc(db, "handouts", id), handoutData);
      setNewHandout({ title: "", url: "", grade: "prep1", category: "" });
      showToast("تم إضافة الملزمة بنجاح");
      addNotification("ملزمة جديدة", `تم إضافة ملزمة جديدة: ${newHandout.title}`);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, "handouts/" + id);
    }
  };

  const addExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExam.title || !newExam.fileUrl) return;
    const id = Date.now().toString();
    const examData = { ...newExam, id };
    try {
      await setDoc(doc(db, "exams", id), examData);
      setNewExam({ title: "", fileUrl: "", fileType: "", grade: "prep1", category: "" });
      showToast("تم إضافة الامتحان بنجاح");
      addNotification("امتحان جديد", `تم إضافة امتحان جديد: ${newExam.title}`);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, "exams/" + id);
    }
  };

  const addSub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSub.studentName) return;
    
    const subId = Date.now().toString();
    const userId = Date.now().toString(); // Simplified for manual add

    try {
      // Create user if not exists
      if (!users.some(u => u.name === newSub.studentName)) {
        const newUser: User = { 
          id: userId, 
          name: newSub.studentName, 
          phone: "", 
          grade: newSub.grade, 
          password: "123", 
          status: "active"
        };
        await setDoc(doc(db, "users", userId), newUser);
      }

      const subData = { 
        ...newSub, 
        id: subId, 
        date: new Date().toLocaleDateString('ar-EG'),
        activationDate: Date.now(),
        status: "active",
        method: "manual"
      };
      await setDoc(doc(db, "subscriptions", subId), subData);
      setNewSub({ studentName: "", grade: "prep1" });
      alert(`تم تفعيل الطالب بنجاح. كلمة المرور الافتراضية هي 123`);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, "subscriptions/" + subId);
    }
  };

  const addAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssignment.title || !newAssignment.fileUrl) return;
    const id = Date.now().toString();
    const assignmentData = { 
      ...newAssignment, 
      id, 
      date: new Date().toLocaleDateString('ar-EG')
    };
    try {
      await setDoc(doc(db, "homeworkAssignments", id), assignmentData);
      setNewAssignment({ title: "", fileUrl: "", fileType: "", grade: "prep1", category: "" });
      showToast("تم رفع الواجب بنجاح");
      addNotification("واجب جديد", `تم رفع واجب جديد: ${newAssignment.title}`);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, "homeworkAssignments/" + id);
    }
  };

  const approveSub = async (id: string) => {
    const sub = subscriptions.find(s => s.id === id);
    if (!sub) return;
    
    try {
      await updateDoc(doc(db, "subscriptions", id), { status: "active", activationDate: Date.now() });
      
      const user = users.find(u => u.name === sub.studentName);
      if (user) {
        await updateDoc(doc(db, "users", user.id), { status: "active" });
        addNotification("تفعيل الاشتراك", "تم تفعيل اشتراكك بنجاح! يمكنك الآن الوصول للمحتوى.", user.id);
      }
      
      showToast(`تم تفعيل اشتراك الطالب ${sub.studentName} بنجاح!`);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, "subscriptions/" + id);
    }
  };

  const approveUser = async (id: string) => {
    try {
      await updateDoc(doc(db, "users", id), { status: "active" });
      showToast("تم تفعيل حساب الطالب بنجاح.");
      addNotification("تفعيل الحساب", "تم تفعيل حسابك بنجاح! يمكنك الآن تسجيل الدخول.", id);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, "users/" + id);
    }
  };

  const gradeHomework = async (id: string, grade: string, comment: string) => {
    const submission = homeworks.find(h => h.id === id);
    if (!submission) return;

    try {
      await updateDoc(doc(db, "homeworkSubmissions", id), { gradeValue: grade, teacherComment: comment });
      showToast("تم رصد الدرجة بنجاح");
      addNotification("تصحيح الواجب", `تم تصحيح واجبك: ${submission.assignmentTitle}. الدرجة: ${grade}`, submission.studentId);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, "homeworkSubmissions/" + id);
    }
  };

  const gradeExam = async (id: string, grade: string, comment: string) => {
    const submission = examSubmissions.find(e => e.id === id);
    if (!submission) return;

    try {
      await updateDoc(doc(db, "examSubmissions", id), { gradeValue: grade, teacherComment: comment });
      showToast("تم رصد الدرجة بنجاح");
      addNotification("تصحيح الامتحان", `تم تصحيح امتحانك: ${submission.examTitle}. الدرجة: ${grade}`, submission.studentId);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, "examSubmissions/" + id);
    }
  };

  const deleteItem = async (id: string, type: "video" | "handout" | "exam" | "sub" | "assignment" | "user") => {
    let collectionName = "";
    if (type === "video") collectionName = "videos";
    if (type === "handout") collectionName = "handouts";
    if (type === "exam") collectionName = "exams";
    if (type === "sub") collectionName = "subscriptions";
    if (type === "assignment") collectionName = "homeworkAssignments";
    if (type === "user") collectionName = "users";

    try {
      await deleteDoc(doc(db, collectionName, id));
      showToast("تم الحذف بنجاح", "info");
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, collectionName + "/" + id);
    }
  };

  const toggleAdmin = async (user: User) => {
    try {
      const newRole = user.role === "admin" ? "student" : "admin";
      await updateDoc(doc(db, "users", user.id), { role: newRole });
      showToast(`تم تغيير رتبة ${user.name} إلى ${newRole === "admin" ? "مسؤول" : "طالب"}`);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, "users/" + user.id);
    }
  };

  const changePassword = async () => {
    if (!editingUser || !newPassInput) return;
    try {
      await updateDoc(doc(db, "users", editingUser.id), { password: newPassInput });
      showToast("تم تغيير كلمة المرور بنجاح");
      setEditingUser(null);
      setNewPassInput("");
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, "users/" + editingUser.id);
    }
  };

  const savePrices = async () => {
    try {
      await setDoc(doc(db, "settings", "global"), { gradePrices }, { merge: true });
      showToast("تم حفظ الأسعار بنجاح");
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, "settings/global");
    }
  };

  const saveSettings = async () => {
    const finalNumbers = tempContactNumbers.filter(n => n.trim() !== "");
    try {
      await setDoc(doc(db, "settings", "global"), { contactNumbers: finalNumbers }, { merge: true });
      setContactNumbers(finalNumbers);
      showToast("تم تحديث الإعدادات بنجاح");
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, "settings/global");
    }
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
        <div className="flex flex-wrap lg:flex-nowrap justify-center lg:justify-start gap-4 mb-12 overflow-x-auto pb-4 no-scrollbar scroll-smooth">
          {[
            { id: "stats", label: "الإحصائيات", icon: BarChart3 },
            { id: "users", label: "الطلاب", icon: Users, badge: users.filter(u => u.status === "pending").length },
            { id: "subs", label: "الاشتراكات", icon: CreditCard, badge: subscriptions.filter(s => s.status === "pending").length },
            { id: "videos", label: "الفيديوهات", icon: Video },
            { id: "handouts", label: "الملازم", icon: FileText },
            { id: "exams", label: "الامتحانات", icon: ClipboardCheck, badge: stats.pendingExamGrading },
            { id: "homework", label: "الواجبات", icon: Upload, badge: stats.pendingHomeworkGrading },
            { id: "prices", label: "الأسعار", icon: CreditCard },
            { id: "settings", label: "الإعدادات", icon: Key },
          ].map((tab) => (
            <motion.button 
              key={tab.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 rounded-2xl font-bold arabic-text transition-all flex items-center gap-2 relative whitespace-nowrap ${
                activeTab === tab.id ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" : "bg-white text-slate-600 border border-slate-200 hover:border-indigo-400"
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
          <button onClick={() => setIsLoggedIn(false)} className="px-6 py-3 text-red-600 font-bold arabic-text whitespace-nowrap">خروج</button>
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

                    <input type="text" placeholder="التصنيف (اختياري)" value={newVideo.category} onChange={e => setNewVideo({...newVideo, category: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl text-right" />
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
                    <input type="text" placeholder="التصنيف (اختياري)" value={newHandout.category} onChange={e => setNewHandout({...newHandout, category: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl text-right" />
                    <select value={newHandout.grade} onChange={e => setNewHandout({...newHandout, grade: e.target.value as Grade})} className="w-full p-4 bg-slate-50 rounded-xl text-right">
                      {Object.entries(GRADE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                    <button className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold">إضافة</button>
                  </form>
                </>
              )}
              {activeTab === "exams" && (
                <div className="space-y-8">
                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
                    <h3 className="text-xl font-bold text-slate-900 arabic-text mb-8">إضافة امتحان جديد</h3>
                    <form onSubmit={addExam} className="space-y-4">
                      <input type="text" placeholder="عنوان الامتحان" value={newExam.title} onChange={e => setNewExam({...newExam, title: e.target.value})} className="w-full p-4 bg-white rounded-xl text-right border border-slate-200" />
                      <div className="relative border-2 border-dashed border-slate-200 bg-white rounded-xl p-4 text-center">
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
                      <input type="text" placeholder="التصنيف (اختياري)" value={newExam.category} onChange={e => setNewExam({...newExam, category: e.target.value})} className="w-full p-4 bg-white rounded-xl text-right border border-slate-200" />
                      <select value={newExam.grade} onChange={e => setNewExam({...newExam, grade: e.target.value as Grade})} className="w-full p-4 bg-white rounded-xl text-right border border-slate-200">
                        {Object.entries(GRADE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
                      <button className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold">إضافة</button>
                    </form>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-slate-900 arabic-text text-right mb-6 flex items-center justify-end gap-2">
                      حلول الطلاب المرفوعة للتصحيح
                      <Edit3 className="w-5 h-5 text-indigo-600" />
                    </h3>
                    <div className="space-y-6">
                      {examSubmissions.filter(e => !e.gradeValue).length > 0 ? (
                        examSubmissions.filter(e => !e.gradeValue).map(e => (
                          <div key={e.id} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm text-right space-y-6">
                            <div className="flex justify-between items-start">
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => {
                                    const grade = prompt("أدخل الدرجة (مثلاً: 20/20)");
                                    const comment = prompt("أدخل ملاحظاتك (اختياري)");
                                    if (grade) gradeExam(e.id, grade, comment || "");
                                  }}
                                  className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold arabic-text hover:bg-indigo-700 transition-all"
                                >
                                  رصد الدرجة
                                </button>
                                <a 
                                  href={e.fileUrl} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold arabic-text hover:bg-slate-200 transition-all"
                                >
                                  عرض الحل
                                </a>
                              </div>
                              <div>
                                <p className="font-bold text-lg">{e.studentName}</p>
                                <p className="text-indigo-600 font-bold">{e.examTitle}</p>
                                <p className="text-xs text-slate-400">{e.date}</p>
                              </div>
                            </div>
                            {e.fileType?.startsWith('image/') && (
                              <img src={e.fileUrl} alt="Exam Solution" className="w-full max-h-96 object-contain rounded-2xl border border-slate-100" referrerPolicy="no-referrer" />
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-20 bg-slate-50 rounded-[40px] border border-dashed border-slate-200">
                          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                          <p className="text-slate-400 arabic-text">لا توجد حلول امتحانات تنتظر التصحيح</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
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
                      <input type="text" placeholder="التصنيف (اختياري)" value={newAssignment.category} onChange={e => setNewAssignment({...newAssignment, category: e.target.value})} className="w-full p-4 bg-white rounded-xl text-right border border-slate-200" />
                      <select value={newAssignment.grade} onChange={e => setNewAssignment({...newAssignment, grade: e.target.value as Grade})} className="w-full p-4 bg-white rounded-xl text-right border border-slate-200">
                        {Object.entries(GRADE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
                      <button className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold">رفع الواجب</button>
                    </form>
                  </div>
                  <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 arabic-text text-right mb-6 flex items-center justify-end gap-2">
                    واجبات الطلاب المرفوعة للتصحيح
                    <Edit3 className="w-5 h-5 text-indigo-600" />
                  </h3>
                  <div className="space-y-6">
                    {homeworks.filter(h => !h.gradeValue).length > 0 ? (
                      homeworks.filter(h => !h.gradeValue).map(h => (
                        <div key={h.id} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm text-right space-y-6">
                          <div className="flex justify-between items-start">
                            <div className="flex gap-2">
                              <button 
                                onClick={() => {
                                  const grade = prompt("أدخل الدرجة (مثلاً: 10/10)");
                                  const comment = prompt("أدخل ملاحظاتك (اختياري)");
                                  if (grade) gradeHomework(h.id, grade, comment || "");
                                }}
                                className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold arabic-text hover:bg-indigo-700 transition-all"
                              >
                                رصد الدرجة
                              </button>
                              <a 
                                href={h.fileUrl} 
                                target="_blank" 
                                rel="noreferrer"
                                className="px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold arabic-text hover:bg-slate-200 transition-all"
                              >
                                عرض الملف
                              </a>
                            </div>
                            <div>
                              <p className="font-bold text-lg">{h.studentName}</p>
                              <p className="text-indigo-600 font-bold">{h.assignmentTitle}</p>
                              <p className="text-xs text-slate-400">{h.date}</p>
                            </div>
                          </div>
                          {h.fileType?.startsWith('image/') && (
                            <img src={h.fileUrl} alt="Homework" className="w-full max-h-96 object-contain rounded-2xl border border-slate-100" referrerPolicy="no-referrer" />
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-20 bg-slate-50 rounded-[40px] border border-dashed border-slate-200">
                        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                        <p className="text-slate-400 arabic-text">تم تصحيح جميع الواجبات المرفوعة!</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 arabic-text text-right mb-6">الواجبات المصححة</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {homeworks.filter(h => h.gradeValue).map(h => (
                      <div key={h.id} className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-right">
                        <div className="flex justify-between items-center mb-2">
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">{h.gradeValue}</span>
                          <p className="font-bold">{h.studentName}</p>
                        </div>
                        <p className="text-sm text-slate-600 mb-1">{h.assignmentTitle}</p>
                        {h.teacherComment && (
                          <p className="text-xs text-slate-500 italic">ملاحظة: {h.teacherComment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
            {activeTab === "prices" && (
              <div className="text-center p-6 bg-indigo-50 rounded-3xl">
                <CreditCard className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
                <p className="arabic-text font-bold">تعديل أسعار الاشتراكات لكل صف دراسي</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
            {activeTab === "stats" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { label: "إجمالي الطلاب", value: stats.totalStudents, icon: Users, color: "bg-blue-50 text-blue-600" },
                  { label: "طلاب نشطون", value: stats.activeStudents, icon: UserCheck, color: "bg-green-50 text-green-600" },
                  { label: "طلبات معلقة", value: stats.pendingStudents, icon: Clock, color: "bg-orange-50 text-orange-600" },
                  { label: "إجمالي الاشتراكات", value: stats.totalSubs, icon: CreditCard, color: "bg-purple-50 text-purple-600" },
                  { label: "اشتراكات نشطة", value: stats.activeSubs, icon: CheckCircle, color: "bg-emerald-50 text-emerald-600" },
                  { label: "اشتراكات معلقة", value: stats.pendingSubs, icon: AlertCircle, color: "bg-red-50 text-red-600" },
                  { label: "الفيديوهات", value: stats.totalVideos, icon: Video, color: "bg-indigo-50 text-indigo-600" },
                  { label: "الملازم", value: stats.totalHandouts, icon: FileText, color: "bg-pink-50 text-pink-600" },
                  { label: "الامتحانات", value: stats.totalExams, icon: ClipboardCheck, color: "bg-cyan-50 text-cyan-600" },
                  { label: "الواجبات المرفوعة", value: stats.totalHomeworks, icon: FileUp, color: "bg-amber-50 text-amber-600" },
                  { label: "واجبات للتصحيح", value: stats.pendingHomeworkGrading, icon: Edit3, color: "bg-rose-50 text-rose-600" },
                  { label: "امتحانات للتصحيح", value: stats.pendingExamGrading, icon: ClipboardCheck, color: "bg-rose-50 text-rose-600" },
                ].map((stat, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm text-right"
                  >
                    <div className={`w-12 h-12 rounded-2xl ${stat.color} flex items-center justify-center mb-4 ml-auto`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                    <p className="text-slate-500 arabic-text text-sm mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                  </motion.div>
                ))}
              </div>
            )}

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
                            <button onClick={() => toggleAdmin(u)} className={`p-2 rounded-xl transition-all ${u.role === "admin" ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-400"}`} title={u.role === "admin" ? "إلغاء رتبة المسؤول" : "تعيين كمسؤول"}>
                              <UserCheck className="w-5 h-5" />
                            </button>
                            <button onClick={() => approveUser(u.id)} className="px-6 py-2 bg-green-600 text-white rounded-xl font-bold arabic-text hover:bg-green-700 transition-all">قبول</button>
                            <button onClick={() => deleteItem(u.id, "user")} className="px-4 py-2 text-red-600 font-bold arabic-text">رفض</button>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{u.name}</p>
                            <p className="text-xs text-indigo-600 font-bold">{GRADE_LABELS[u.grade]}</p>
                            <div className="flex flex-col items-end mt-1">
                              <p className="text-[10px] text-slate-500 font-mono">ID: {u.id.substring(0, 8)}...</p>
                              <p className="text-[10px] text-slate-500 font-mono">Phone: {u.phone}</p>
                            </div>
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
                              whileHover={{ scale: 1.1, color: "#f59e0b" }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => toggleAdmin(u)} 
                              className={`p-2 rounded-lg transition-colors ${u.role === "admin" ? "text-amber-600 bg-amber-50" : "text-slate-400 bg-slate-50"}`}
                              title={u.role === "admin" ? "إلغاء رتبة المسؤول" : "تعيين كمسؤول"}
                            >
                              <UserCheck className="w-5 h-5" />
                            </motion.button>
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
                            <div className="flex flex-col items-end mt-1">
                              <p className="text-[10px] text-slate-500 font-mono">ID: {u.id.substring(0, 8)}...</p>
                              <p className="text-[10px] text-slate-500 font-mono">Phone: {u.phone}</p>
                              <p className="text-[10px] text-slate-500 font-mono">Password: {u.password}</p>
                            </div>
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
                    {subscriptions.filter(s => s.status === "active").map(s => {
                      const { isValid, daysRemaining } = checkSubscription(s.studentName, s.grade, subscriptions);
                      return (
                        <div key={s.id} className={`bg-white p-6 rounded-3xl border ${isValid ? 'border-slate-100' : 'border-red-200 bg-red-50'} flex items-center justify-between`}>
                          <button onClick={() => deleteItem(s.id, "sub")} className="text-red-600"><Trash2 className="w-5 h-5" /></button>
                          <div className="text-right flex items-center gap-4">
                            <div>
                              <p className="font-bold">{s.studentName}</p>
                              <p className="text-xs text-indigo-600 font-bold">{GRADE_LABELS[s.grade]}</p>
                              <div className="flex flex-col items-end mt-1">
                                <p className="text-[10px] text-slate-400">تاريخ التفعيل: {s.activationDate ? new Date(s.activationDate).toLocaleDateString('ar-EG') : 'غير محدد'}</p>
                                {isValid ? (
                                  <p className="text-[10px] text-green-600 font-bold">متبقي {daysRemaining} يوم</p>
                                ) : (
                                  <p className="text-[10px] text-red-600 font-bold">منتهي الصلاحية</p>
                                )}
                              </div>
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
                      );
                    })}
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

            {activeTab === "prices" && (
              <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
                <h3 className="text-2xl font-bold text-slate-900 arabic-text text-right mb-8">أسعار الاشتراكات الشهرية</h3>
                <div className="grid sm:grid-cols-2 gap-6">
                  {Object.entries(GRADE_LABELS).map(([grade, label]) => (
                    <div key={grade} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col items-end">
                      <label className="text-slate-600 arabic-text mb-2 font-bold">{label} (شهرياً)</label>
                      <div className="flex items-center gap-3 w-full">
                        <span className="text-slate-400 font-bold">EGP</span>
                        <input 
                          type="number" 
                          value={gradePrices[grade as Grade]} 
                          onChange={(e) => setGradePrices({ ...gradePrices, [grade]: parseInt(e.target.value) || 0 })}
                          className="w-full p-4 bg-white border border-slate-200 rounded-xl text-right font-bold text-xl"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-10 flex justify-end">
                  <button 
                    onClick={savePrices}
                    className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold arabic-text hover:bg-indigo-700 transition-all"
                  >
                    حفظ جميع الأسعار
                  </button>
                </div>
              </div>
            )}
            {activeTab === "settings" && (
              <div className="space-y-12">
                <div className="bg-white p-8 rounded-[40px] shadow-xl border border-slate-100">
                  <h3 className="text-xl font-bold text-slate-900 arabic-text mb-6">إعدادات التواصل والدفع</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-right text-slate-600 arabic-text mb-4">بيانات الدفع (انستا باي / InstaPay)</label>
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
                      onClick={saveSettings}
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

  const addNotification = async (title: string, message: string, userId?: string, id?: string) => {
    const notifId = id || Date.now().toString();
    const newNotif: Notification = {
      id: notifId,
      title,
      message,
      date: new Date().toLocaleDateString('ar-EG'),
      isRead: false,
      userId
    };
    try {
      await setDoc(doc(db, "notifications", notifId), newNotif);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, "notifications/" + notifId);
    }
  };

  const [users, setUsers] = useState<User[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [currentUser, setCurrentUser] = useState<{ id: string, name: string, grade: Grade, isSubscribed: boolean } | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          const { isValid: isSubscribed } = checkSubscription(userData.name, userData.grade, subscriptions);
          setCurrentUser({ id: user.uid, name: userData.name, grade: userData.grade, isSubscribed });
        }
      } else {
        setCurrentUser(null);
      }
    });
    return () => unsubscribeAuth();
  }, [subscriptions]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [handouts, setHandouts] = useState<Handout[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [homeworks, setHomeworks] = useState<HomeworkSubmission[]>([]);
  const [examSubmissions, setExamSubmissions] = useState<ExamSubmission[]>([]);
  const [homeworkAssignments, setHomeworkAssignments] = useState<HomeworkAssignment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [contactNumbers, setContactNumbers] = useState<string[]>(["01146780736"]);
  const [gradePrices, setGradePrices] = useState<Record<Grade, number>>({
    pri1: 100, pri2: 100, pri3: 100, pri4: 120, pri5: 120, pri6: 120,
    prep1: 150, prep2: 150, prep3: 180,
    sec1: 250, sec2: 250, sec3: 300
  });

  // Firestore Listeners
  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      setUsers(snapshot.docs.map(doc => doc.data() as User));
    }, (e) => handleFirestoreError(e, OperationType.LIST, "users"));

    const unsubVideos = onSnapshot(collection(db, "videos"), (snapshot) => {
      setVideos(snapshot.docs.map(doc => doc.data() as VideoItem));
    }, (e) => handleFirestoreError(e, OperationType.LIST, "videos"));

    const unsubSubs = onSnapshot(collection(db, "subscriptions"), (snapshot) => {
      setSubscriptions(snapshot.docs.map(doc => doc.data() as Subscription));
    }, (e) => handleFirestoreError(e, OperationType.LIST, "subscriptions"));

    const unsubHandouts = onSnapshot(collection(db, "handouts"), (snapshot) => {
      setHandouts(snapshot.docs.map(doc => doc.data() as Handout));
    }, (e) => handleFirestoreError(e, OperationType.LIST, "handouts"));

    const unsubExams = onSnapshot(collection(db, "exams"), (snapshot) => {
      setExams(snapshot.docs.map(doc => doc.data() as Exam));
    }, (e) => handleFirestoreError(e, OperationType.LIST, "exams"));

    const unsubHomeworks = onSnapshot(collection(db, "homeworkSubmissions"), (snapshot) => {
      setHomeworks(snapshot.docs.map(doc => doc.data() as HomeworkSubmission));
    }, (e) => handleFirestoreError(e, OperationType.LIST, "homeworkSubmissions"));

    const unsubExamSubs = onSnapshot(collection(db, "examSubmissions"), (snapshot) => {
      setExamSubmissions(snapshot.docs.map(doc => doc.data() as ExamSubmission));
    }, (e) => handleFirestoreError(e, OperationType.LIST, "examSubmissions"));

    const unsubHomeworkAssignments = onSnapshot(collection(db, "homeworkAssignments"), (snapshot) => {
      setHomeworkAssignments(snapshot.docs.map(doc => doc.data() as HomeworkAssignment));
    }, (e) => handleFirestoreError(e, OperationType.LIST, "homeworkAssignments"));

    const unsubNotifications = onSnapshot(collection(db, "notifications"), (snapshot) => {
      setNotifications(snapshot.docs.map(doc => doc.data() as Notification));
    }, (e) => handleFirestoreError(e, OperationType.LIST, "notifications"));

    const unsubSettings = onSnapshot(doc(db, "settings", "global"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.contactNumbers) setContactNumbers(data.contactNumbers);
        if (data.gradePrices) setGradePrices(data.gradePrices);
      }
    }, (e) => handleFirestoreError(e, OperationType.GET, "settings/global"));

    return () => {
      unsubUsers();
      unsubVideos();
      unsubSubs();
      unsubHandouts();
      unsubExams();
      unsubHomeworks();
      unsubExamSubs();
      unsubHomeworkAssignments();
      unsubNotifications();
      unsubSettings();
    };
  }, []);


  useEffect(() => {
    if (currentUser) {
      const { isValid } = checkSubscription(currentUser.name, currentUser.grade, subscriptions);

      if (isValid && !currentUser.isSubscribed) {
        setCurrentUser({ ...currentUser, isSubscribed: true });
      } else if (!isValid && currentUser.isSubscribed) {
        setCurrentUser({ ...currentUser, isSubscribed: false });
      }
    }
  }, [subscriptions, currentUser?.id, currentUser?.grade]);

  useEffect(() => {
    if (currentUser && currentUser.isSubscribed) {
      const { sub } = checkSubscription(currentUser.name, currentUser.grade, subscriptions);
      if (sub && sub.activationDate) {
        const thirtyDays = 30 * 24 * 60 * 60 * 1000;
        const expiryDate = sub.activationDate + thirtyDays;
        const daysRemaining = Math.ceil((expiryDate - Date.now()) / (1000 * 60 * 60 * 24));
        
        if (daysRemaining <= 3 && daysRemaining > 0) {
          const renewalNotifId = `renewal_${currentUser.id}_${sub.id}`;
          addNotification(
            "تجديد الاشتراك",
            `اشتراكك سينتهي خلال ${daysRemaining} أيام. يرجى التجديد لضمان استمرار الوصول للمحتوى.`,
            currentUser.id,
            renewalNotifId
          );
        }
      }
    }
  }, [currentUser, subscriptions]);

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
      <Navbar 
        activePage={page} 
        setPage={setPage} 
        currentUser={currentUser} 
        setCurrentUser={setCurrentUser} 
        notifications={notifications}
        setNotifications={setNotifications}
      />
      <main>
        <AnimatePresence mode="wait">
          {page === "home" && <motion.div key="home" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}><HomePage setPage={setPage} currentUser={currentUser} setCurrentUser={setCurrentUser} users={users} setUsers={setUsers} subscriptions={subscriptions} showToast={showToast} /></motion.div>}
          {page === "payment" && <motion.div key="payment" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}><PaymentPage currentUser={currentUser} setSubscriptions={setSubscriptions} subscriptions={subscriptions} setCurrentUser={setCurrentUser} showToast={showToast} contactNumbers={contactNumbers} gradePrices={gradePrices} /></motion.div>}
          {page === "courses" && <motion.div key="courses" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}><CoursesPage videos={videos} currentUser={currentUser} /></motion.div>}
          {page === "handouts" && <motion.div key="handouts" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}><HandoutsPage handouts={handouts} currentUser={currentUser} /></motion.div>}
          {page === "exams" && <motion.div key="exams" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}><ExamsPage exams={exams} currentUser={currentUser} examSubmissions={examSubmissions} setExamSubmissions={setExamSubmissions} showToast={showToast} /></motion.div>}
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
                examSubmissions={examSubmissions}
                setExamSubmissions={setExamSubmissions}
                homeworkAssignments={homeworkAssignments}
                setHomeworkAssignments={setHomeworkAssignments}
                users={users}
                setUsers={setUsers}
                showToast={showToast}
                addNotification={addNotification}
                contactNumbers={contactNumbers}
                setContactNumbers={setContactNumbers}
                gradePrices={gradePrices}
                setGradePrices={setGradePrices}
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
