import React, { useState } from 'react';
import { User, ViewState, UserRole } from '../types';
import { LogOut, User as UserIcon, BookOpen, GraduationCap, Mail, Phone, Menu, X, LayoutDashboard, Library, Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Logo } from './Logo';

interface NavbarProps {
  user: User | null;
  onNavigate: (view: ViewState) => void;
  onLogout: () => void;
  currentView?: ViewState;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onNavigate, onLogout, currentView }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t, language, setLanguage } = useLanguage();

  const handleNavClick = (view: ViewState, sectionId?: string) => {
    onNavigate(view);

    if (view === 'HOME') {
        if (!sectionId) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            // Slight delay to allow view transition if needed
            setTimeout(() => {
                const element = document.getElementById(sectionId);
                if (element) element.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    }

    setIsMobileMenuOpen(false);
  };

  const handleLogoClick = () => {
    if (user) {
        onNavigate(user.role === UserRole.TEACHER ? 'TEACHER_DASHBOARD' : 'STUDENT_DASHBOARD');
    } else {
        handleNavClick('HOME');
    }
  };

  const isProfilePage = currentView === 'STUDENT_PROFILE' || currentView === 'TEACHER_PROFILE';

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm transition-colors duration-200">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center cursor-pointer" onClick={handleLogoClick}>
            <Logo className="h-10 w-auto" />
            <span className="ml-2 text-xl font-bold text-slate-900 hidden sm:block">{t('app_name')}</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6 mx-6">
            {!user ? (
                <>
                    <button onClick={() => handleNavClick('HOME')} className="text-slate-600 hover:text-indigo-600 font-medium text-sm transition-colors">{t('nav_home')}</button>
                    <button onClick={() => handleNavClick('HOME', 'curriculum')} className="text-slate-600 hover:text-indigo-600 font-medium text-sm transition-colors">{t('nav_courses')}</button>
                    <button onClick={() => handleNavClick('HOME', 'about')} className="text-slate-600 hover:text-indigo-600 font-medium text-sm transition-colors">{t('nav_about')}</button>
                </>
            ) : (
                <>
                    {!isProfilePage && (
                        <button
                            onClick={() => onNavigate(user.role === UserRole.TEACHER ? 'TEACHER_DASHBOARD' : 'STUDENT_DASHBOARD')}
                            className="text-slate-600 hover:text-indigo-600 font-medium text-sm transition-colors flex items-center"
                        >
                            <LayoutDashboard className="h-4 w-4 mr-1.5" /> {t('nav_dashboard')}
                        </button>
                    )}
                </>
            )}
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">

            {/* Language Switcher */}
            <div className="flex items-center mr-2">
                <button
                    onClick={() => setLanguage(language === 'EN' ? 'HI' : 'EN')}
                    className="flex items-center px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 transition text-sm font-medium text-slate-700"
                >
                    <Globe className="h-4 w-4 mr-1.5 text-indigo-600" />
                    {language === 'EN' ? 'English' : 'हिंदी'}
                </button>
            </div>

            {!user ? (
              <button
                onClick={() => onNavigate('LOGIN')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {t('nav_login')}
              </button>
            ) : (
              <div className="flex items-center space-x-2 sm:space-x-4">
                <button
                  onClick={() => user.role === UserRole.STUDENT ? onNavigate('STUDENT_PROFILE') : onNavigate('TEACHER_PROFILE')}
                  className="flex items-center group"
                >
                    <span className="text-sm text-slate-600 hidden md:block group-hover:text-indigo-600 transition">
                    {user.name.split(' ')[0]}
                    </span>
                    <div className="ml-2 h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200 group-hover:border-indigo-400 transition">
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                </button>

                <button
                  onClick={onLogout}
                  className="text-slate-600 hover:text-red-600 p-2"
                  title={t('nav_logout')}
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center ml-1">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                >
                  {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 animate-fade-in">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {!user ? (
                <>
                    <button
                        onClick={() => handleNavClick('HOME')}
                        className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-50"
                    >
                        {t('nav_home')}
                    </button>
                    <button
                        onClick={() => handleNavClick('HOME', 'curriculum')}
                        className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-50"
                    >
                        {t('nav_courses')}
                    </button>
                    <button
                        onClick={() => handleNavClick('HOME', 'about')}
                        className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-50"
                    >
                        {t('nav_about')}
                    </button>
                </>
            ) : (
                <>
                    {!isProfilePage && (
                        <button
                            onClick={() => {
                                onNavigate(user.role === UserRole.TEACHER ? 'TEACHER_DASHBOARD' : 'STUDENT_DASHBOARD');
                                setIsMobileMenuOpen(false);
                            }}
                            className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-50"
                        >
                            {t('nav_dashboard')}
                        </button>
                    )}
                    <button
                        onClick={() => {
                            onNavigate(user.role === UserRole.STUDENT ? 'STUDENT_PROFILE' : 'TEACHER_PROFILE');
                            setIsMobileMenuOpen(false);
                        }}
                        className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-50"
                    >
                        {t('nav_profile')}
                    </button>
                </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export const Footer: React.FC = () => {
  const { t } = useLanguage();
  return (
    <footer className="bg-white border-t border-slate-200 pt-16 pb-8 transition-colors duration-200">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center mb-4">
               <Logo className="h-8 w-auto" />
               <span className="ml-2 text-xl font-bold text-slate-900">{t('app_name')}</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed">
              {t('footer_desc')}
            </p>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 mb-4">{t('footer_quick_links')}</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><a href="#" className="hover:text-indigo-600">{t('nav_home')}</a></li>
              <li><a href="#curriculum" className="hover:text-indigo-600">{t('nav_courses')}</a></li>
              <li><a href="#about" className="hover:text-indigo-600">{t('nav_about')}</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 mb-4">{t('footer_support')}</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><a href="#" className="hover:text-indigo-600">Help Center</a></li>
              <li><a href="#" className="hover:text-indigo-600">Terms of Service</a></li>
              <li><a href="#" className="hover:text-indigo-600">Privacy Policy</a></li>
            </ul>
          </div>

          <div>
             <h3 className="font-bold text-slate-900 mb-4">{t('footer_contact')}</h3>
             <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex items-center"><Mail className="h-4 w-4 mr-2" /> support@dcphysics.com</li>
                <li className="flex items-center"><Phone className="h-4 w-4 mr-2" /> +91 98765 43210</li>
             </ul>
          </div>
        </div>
        <div className="border-t border-slate-100 pt-8 text-center text-sm text-slate-400">
           &copy; {new Date().getFullYear()} {t('app_name')}. All rights reserved.
        </div>
      </div>
    </footer>
  );
};