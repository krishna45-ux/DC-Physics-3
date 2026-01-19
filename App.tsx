import React, { useState, useEffect } from 'react';
import { User, UserRole, ViewState, Chapter } from './types';
import { Navbar, Footer } from './components/Layout';
import { Home } from './views/Home';
import { Login } from './views/Login';
import { StudentDashboard } from './views/StudentDashboard';
import { TeacherDashboard } from './views/TeacherDashboard';
import { StudentProfile } from './views/StudentProfile';
import { TeacherProfile } from './views/TeacherProfile';
import { PaymentModal } from './components/PaymentModal';
import { getCurrentUser, loginUser, logoutUser, purchaseCourse, updateProgress, validateSession, saveQuizAttempt, getChapters } from './services/dataService';
import { FULL_COURSE_PRICE, CHAPTER_PRICE, COURSES } from './constants';
import { LanguageProvider } from './contexts/LanguageContext';

const AppContent: React.FC = () => {
  const [user, setUser] = useState<User | null>(getCurrentUser());

  // Initialize currentView based on the persisted user state to prevent redirecting to HOME on reload
  const [currentView, setCurrentView] = useState<ViewState>(() => {
      const u = getCurrentUser();
      if (u) {
          return u.role === UserRole.TEACHER ? 'TEACHER_DASHBOARD' : 'STUDENT_DASHBOARD';
      }
      return 'HOME';
  });

  const [pendingPurchase, setPendingPurchase] = useState<{ type: 'COURSE' | 'CHAPTER', id?: string } | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    const u = getCurrentUser();
    if (u) {
      setUser(u);
    }
    setChapters(getChapters());
  }, []);

  // Check for session validity (Single Session Enforcement)
  useEffect(() => {
    if (!user) return;

    const intervalId = setInterval(() => {
        if (user.role === UserRole.STUDENT && user.sessionToken) {
            const isValid = validateSession(user.id, user.sessionToken);
            if (!isValid) {
                alert("You have been logged out because your account was logged in on another device.");
                handleLogout();
            }
        }
    }, 5000);

    return () => clearInterval(intervalId);
  }, [user]);

  const handleLogin = (email: string, role: UserRole, password?: string) => {
    const { user: loggedInUser, error } = loginUser(email, role, password);

    if (loggedInUser) {
      setUser(loggedInUser);
      if (pendingPurchase) {
        setShowPaymentModal(true);
      } else {
        setCurrentView(role === UserRole.TEACHER ? 'TEACHER_DASHBOARD' : 'STUDENT_DASHBOARD');
      }
    } else {
        // Handle specific verification error differently if needed, but alert for now
        if (error === "NOT_VERIFIED") {
            alert("Email not verified. A new verification code has been sent to your email.");
        } else {
            alert(error || "Login failed. Please try again.");
        }
    }
  };

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    setCurrentView('HOME');
    setPendingPurchase(null);
    setShowPaymentModal(false);
  };

  const handleUserUpdate = (updatedUser: User) => {
      setUser(updatedUser);
  };

  const initiatePurchase = (type: 'COURSE' | 'CHAPTER', id?: string) => {
    const purchaseInfo = { type, id };
    setPendingPurchase(purchaseInfo);
    if (!user) {
      setCurrentView('LOGIN');
      return;
    }
    setShowPaymentModal(true);
  };

  const finalizePurchase = () => {
    if (!user || !pendingPurchase) return;
    const { type, id } = pendingPurchase;
    const updatedUser = purchaseCourse(user.id, type, id);
    if (updatedUser) {
        setUser(updatedUser);
        setPendingPurchase(null);
        setShowPaymentModal(false);
        setCurrentView('STUDENT_DASHBOARD');
    }
  };

  const handleUpdateProgress = (chapterId: string) => {
      if (user) {
          const updatedUser = updateProgress(user.id, chapterId);
          if (updatedUser) setUser(updatedUser);
      }
  }

  const handleQuizComplete = (chapterId: string, score: number, total: number) => {
      if (user) {
          const updatedUser = saveQuizAttempt(user.id, chapterId, score, total);
          if (updatedUser) setUser(updatedUser);
      }
  }

  const handleUpdateBookmarks = (updatedUser: User) => {
      setUser(updatedUser);
  }

  const getPurchaseDetails = () => {
      if (!pendingPurchase) return { amount: 0, name: '' };

      if (pendingPurchase.type === 'COURSE' && pendingPurchase.id) {
          const course = Object.values(COURSES).find(c => c.id === pendingPurchase.id);
          return {
              amount: FULL_COURSE_PRICE,
              name: course ? course.title : 'Full Course'
          };
      } else if (pendingPurchase.type === 'CHAPTER' && pendingPurchase.id) {
          const chapter = chapters.find(c => c.id === pendingPurchase.id);
          return {
              amount: CHAPTER_PRICE,
              name: chapter ? chapter.title : 'Chapter Access'
          };
      }
      return { amount: 0, name: '' };
  };

  const renderContent = () => {
    switch (currentView) {
      case 'LOGIN':
        return <Login onLogin={handleLogin} onCancel={() => setCurrentView('HOME')} />;

      case 'STUDENT_DASHBOARD':
        if (!user || user.role !== UserRole.STUDENT) return <div className="p-10 text-center text-slate-900">Access Denied</div>;
        return (
            <StudentDashboard
                user={user}
                onBuyChapter={(id) => initiatePurchase('CHAPTER', id)}
                onBuyCourse={(id) => initiatePurchase('COURSE', id)}
                onUpdateProgress={handleUpdateProgress}
                onQuizComplete={handleQuizComplete}
                onUpdateBookmarks={handleUpdateBookmarks}
                onNavigateProfile={() => setCurrentView('STUDENT_PROFILE')}
                onLogout={handleLogout}
            />
        );

      case 'STUDENT_PROFILE':
        if (!user || user.role !== UserRole.STUDENT) return <div className="p-10 text-center text-slate-900">Access Denied</div>;
        return (
            <StudentProfile
                user={user}
                onNavigateHome={() => setCurrentView('STUDENT_DASHBOARD')}
                onUserUpdate={handleUserUpdate}
            />
        );

      case 'TEACHER_DASHBOARD':
        if (!user || user.role !== UserRole.TEACHER) return <div className="p-10 text-center text-slate-900">Access Denied</div>;
        return (
            <TeacherDashboard
                user={user}
                onLogout={handleLogout}
                onNavigateProfile={() => setCurrentView('TEACHER_PROFILE')}
            />
        );

      case 'TEACHER_PROFILE':
          if (!user || user.role !== UserRole.TEACHER) return <div className="p-10 text-center text-slate-900">Access Denied</div>;
          return (
              <TeacherProfile
                  user={user}
                  onNavigateDashboard={() => setCurrentView('TEACHER_DASHBOARD')}
                  onUserUpdate={handleUserUpdate}
              />
          );

      case 'HOME':
      default:
        return (
            <Home
                onBuyCourse={(id) => initiatePurchase('COURSE', id)}
                onBuyChapter={(id) => initiatePurchase('CHAPTER', id)}
            />
        );
    }
  };

  const { amount, name } = getPurchaseDetails();

  // Hide global Navbar/Footer for dashboards to create a disconnected "app" feel
  const showGlobalNav = currentView === 'HOME' || currentView === 'LOGIN' || currentView === 'STUDENT_PROFILE' || currentView === 'TEACHER_PROFILE';

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 transition-colors duration-200">
        {showGlobalNav && (
             <Navbar
             user={user}
             onNavigate={(view) => setCurrentView(view)}
             onLogout={handleLogout}
             currentView={currentView}
           />
        )}

      {renderContent()}

      {currentView === 'HOME' && <Footer />}

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => {
            setShowPaymentModal(false);
            setPendingPurchase(null);
        }}
        onConfirm={finalizePurchase}
        amount={amount}
        itemName={name}
      />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;