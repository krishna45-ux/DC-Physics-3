import React, { useState, useEffect, useRef } from 'react';
import { User, Chapter, Announcement, Quiz, Note, Topic } from '../types';
import { Lock, CheckCircle, Circle, Send, X, Video, ChevronRight, ChevronLeft, Menu, Search, Bell, HelpCircle, Award, LayoutDashboard, Bot, Sparkles, LogOut, Layers, Play, Settings, BookOpen, PlusCircle, Trash2, File, ArrowDownCircle, ListVideo, PlayCircle, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import { askPhysicsDoubt } from '../services/geminiService';
import { getAnnouncements, getQuizByChapterId, getChapters, getNotes, addNote, deleteNote } from '../services/dataService';
import { COURSES } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';
import { Logo } from '../components/Logo';

// Type definitions for YouTube API
declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

interface StudentDashboardProps {
  user: User;
  onBuyChapter: (id: string) => void;
  onBuyCourse: (id: string) => void;
  onUpdateProgress: (topicId: string) => void;
  onQuizComplete: (chapterId: string, score: number, total: number) => void;
  onUpdateBookmarks: (user: User) => void;
  onNavigateProfile: () => void;
  onLogout: () => void;
}

// --- Helper Components Defined Outside ---

const SidebarItem = ({ icon: Icon, label, active, onClick, count }: any) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all mb-1 ${
          active
          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
        <div className="flex items-center">
            <Icon className={`h-5 w-5 mr-3 ${active ? 'text-white' : 'text-slate-400'}`} />
            <span className="font-medium text-sm">{label}</span>
        </div>
        {count !== undefined && (
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${active ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                {count}
            </span>
        )}
    </button>
);

const ChapterListItem: React.FC<{
  chapter: Chapter;
  active: boolean;
  isUnlocked: boolean;
  completedTopicCount: number;
  totalTopics: number;
  onClick: (c: Chapter) => void;
  lockedLabel: string;
}> = ({ chapter, active, isUnlocked, completedTopicCount, totalTopics, onClick, lockedLabel }) => {

  const isCompleted = totalTopics > 0 && completedTopicCount === totalTopics;

  return (
      <div
        onClick={() => onClick(chapter)}
        className={`p-3 rounded-lg cursor-pointer transition border mb-2 ${
            active
            ? 'bg-indigo-50 border-indigo-200'
            : 'bg-white border-transparent hover:bg-slate-50'
        }`}
      >
          <div className="flex items-start gap-3">
              <div className="mt-1">
                   {!isUnlocked ? (
                       <Lock className="h-4 w-4 text-slate-400" />
                   ) : isCompleted ? (
                       <CheckCircle className="h-4 w-4 text-green-500" />
                   ) : (
                       <div className="h-4 w-4 relative flex items-center justify-center">
                           <div className="absolute inset-0 rounded-full border-2 border-slate-200"></div>
                           <div className="absolute inset-0 rounded-full border-2 border-indigo-600" style={{ clipPath: `inset(0 ${100 - (completedTopicCount/totalTopics)*100}% 0 0)` }}></div>
                       </div>
                   )}
              </div>
              <div className="flex-1 min-w-0">
                  <h4 className={`text-sm font-medium truncate ${active ? 'text-indigo-900' : 'text-slate-700'}`}>
                      {chapter.title}
                  </h4>
                  <div className="flex items-center mt-1 space-x-2">
                       <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded flex items-center">
                           <ListVideo className="h-3 w-3 mr-1" /> {chapter.topics.length} Topics
                       </span>
                       {!isUnlocked && <span className="text-[10px] text-amber-600 font-bold">{lockedLabel}</span>}
                  </div>
              </div>
          </div>
      </div>
  )
};

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  user,
  onBuyChapter,
  onBuyCourse,
  onUpdateProgress,
  onQuizComplete,
  onNavigateProfile,
  onLogout
}) => {
  const { t } = useLanguage();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  // UI State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAiChat, setShowAiChat] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeTab, setActiveTab] = useState<'VIDEO' | 'NOTES' | 'QUIZ' | 'BOOKMARKS'>('VIDEO');
  const [viewMode, setViewMode] = useState<'DASHBOARD' | 'MY_COURSES' | 'COURSE_PLAYER'>('DASHBOARD');

  // Sidebar State
  const [expandedClass, setExpandedClass] = useState<11 | 12>(12);

  // Data State
  const [chatMessages, setChatMessages] = useState<{role: 'user'|'ai', text: string}[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);

  // Quiz State
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | undefined>(undefined);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // Notes State
  const [newNote, setNewNote] = useState('');

  // Video State
  const playerRef = useRef<any>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Initial Data Load
  useEffect(() => {
      setAnnouncements(getAnnouncements());
      setChapters(getChapters());
      setNotes(getNotes());

      // Load YouTube API if not already present
      if (!window.YT) {
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      }
  }, []);

  // Scroll chat
  useEffect(() => {
    if (chatScrollRef.current) {
        chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, isAiThinking, showAiChat]);

  // Handle Chapter Selection Changes
  useEffect(() => {
      if (selectedChapter) {
          const quiz = getQuizByChapterId(selectedChapter.id);
          setCurrentQuiz(quiz);
          setQuizAnswers({});
          setQuizSubmitted(false);
          setQuizScore(0);
          setActiveTab('VIDEO');

          // Auto-expand the relevant class in sidebar
          setExpandedClass(selectedChapter.classLevel as 11 | 12);

          // Scroll to top
          window.scrollTo(0, 0);
      }
  }, [selectedChapter]);

  const extractVideoId = (urlOrId: string) => {
    if (!urlOrId) return '';
    if (urlOrId.length === 11) return urlOrId;
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = urlOrId.match(regex);
    return match ? match[1] : urlOrId;
  };

  const isUnlocked = (chapter: Chapter) => {
    if (!chapter) return false;
    if (chapter.classLevel === 11 && user.purchasedCourseIds.includes('phys-11-complete')) return true;
    if (chapter.classLevel === 12 && user.purchasedCourseIds.includes('phys-12-complete')) return true;
    return user.purchasedChapterIds.includes(chapter.id);
  };

  // Initialize YouTube Player safely without constant destruction
  useEffect(() => {
    if (viewMode !== 'COURSE_PLAYER' || !selectedTopic || !selectedChapter || !isUnlocked(selectedChapter) || activeTab !== 'VIDEO') {
        return;
    }

    const videoId = extractVideoId(selectedTopic.videoUrl);

    // Function to load or create player
    const initOrUpdatePlayer = () => {
        // If player exists, just load the new video by ID to prevent crash
        if (playerRef.current && typeof playerRef.current.loadVideoById === 'function') {
            try {
                // Check if the iframe is actually in the DOM
                const iframe = playerRef.current.getIframe();
                if (iframe && document.body.contains(iframe)) {
                    playerRef.current.loadVideoById(videoId);
                    return;
                }
            } catch (e) {
                console.warn("Player instance issue, recreating...", e);
            }
        }

        // Create a new player if one doesn't exist or was destroyed
        const container = document.getElementById('youtube-player');
        if (!container) return;

        // Ensure we don't duplicate
        try {
            playerRef.current = new window.YT.Player('youtube-player', {
                height: '100%',
                width: '100%',
                videoId: videoId,
                playerVars: {
                    'playsinline': 1,
                    'rel': 0,
                    'modestbranding': 1,
                    'origin': window.location.origin
                },
                events: {
                    'onStateChange': (event: any) => {
                        // Mark watched when video ends (state 0)
                        if (event.data === 0) {
                            handleMarkTopicWatched(selectedTopic.id);
                        }
                    }
                }
            });
        } catch (e) {
            console.error("Failed to init player", e);
        }
    };

    if (window.YT && window.YT.Player) {
        initOrUpdatePlayer();
    } else {
        window.onYouTubeIframeAPIReady = () => {
            initOrUpdatePlayer();
        };
    }

  }, [selectedTopic?.id, activeTab, viewMode]);

  const handleMarkTopicWatched = (topicId: string) => {
      onUpdateProgress(topicId);
  };

  const handleAskAi = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatInput('');
    setIsAiThinking(true);
    const context = selectedChapter
        ? `${selectedChapter.title} - ${selectedTopic?.title || 'General'}`
        : 'General Physics Dashboard';
    const answer = await askPhysicsDoubt(userMsg, context);
    setIsAiThinking(false);
    setChatMessages(prev => [...prev, { role: 'ai', text: answer }]);
  };

  const submitQuiz = () => {
      if (!currentQuiz || !selectedChapter) return;
      let score = 0;
      currentQuiz.questions.forEach(q => {
          if (quizAnswers[q.id] === q.correctOptionIndex) score++;
      });
      setQuizScore(score);
      setQuizSubmitted(true);
      onQuizComplete(selectedChapter.id, score, currentQuiz.questions.length);
  };

  const handleAddNote = () => {
      if (!newNote.trim() || !selectedChapter) return;
      const updatedNotes = addNote(
          `Note on ${selectedChapter.title}`,
          newNote,
          selectedChapter.classLevel,
          selectedChapter.id
      );
      setNotes(updatedNotes);
      setNewNote('');
  };

  const handleDeleteNoteItem = (noteId: string) => {
      const updated = deleteNote(noteId);
      setNotes(updated);
  };

  // Progress Calculations
  const getTotalTopicsCount = (chList: Chapter[]) => chList.reduce((acc, c) => acc + c.topics.length, 0);
  const getCompletedTopicsCount = (chList: Chapter[]) => {
      return chList.reduce((acc, c) => {
          return acc + c.topics.filter(t => user.progress[t.id]).length;
      }, 0);
  };

  const unlockedChapters = chapters.filter(c => isUnlocked(c));
  const totalTopicsOwned = getTotalTopicsCount(unlockedChapters);
  const completedTopicsOwned = getCompletedTopicsCount(unlockedChapters);
  const progressPercent = totalTopicsOwned > 0 ? Math.round((completedTopicsOwned / totalTopicsOwned) * 100) : 0;

  const class11Chapters = chapters.filter(c => c.classLevel === 11);
  const class12Chapters = chapters.filter(c => c.classLevel === 12);

  const handleChapterClick = (chapter: Chapter) => {
      setSelectedChapter(chapter);
      // Automatically select the first topic to avoid stale state crash
      if (chapter.topics && chapter.topics.length > 0) {
          setSelectedTopic(chapter.topics[0]);
      } else {
          setSelectedTopic(null);
      }
      setViewMode('COURSE_PLAYER');
      setMobileMenuOpen(false);
  };

  // Navigation Logic
  const handleTopicSelect = (topic: Topic) => {
      setSelectedTopic(topic);
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-inter">

        {/* === SIDEBAR === */}
        <aside
            className={`
                fixed inset-y-0 left-0 z-50 w-64 max-w-[80vw] bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out flex flex-col
                ${mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
                lg:relative lg:translate-x-0 lg:shadow-none
            `}
        >
            <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
                <div className="flex items-center text-indigo-600">
                    <Logo className="h-8 w-auto mr-2" />
                    <span className="font-bold text-lg text-slate-900">{t('app_name')}</span>
                </div>
                <button className="lg:hidden text-slate-400 hover:text-indigo-600" onClick={() => setMobileMenuOpen(false)}>
                    <X className="h-6 w-6" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <div className="mb-8">
                    <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Menu</p>
                    <SidebarItem
                        icon={LayoutDashboard}
                        label={t('nav_dashboard')}
                        active={viewMode === 'DASHBOARD'}
                        onClick={() => { setViewMode('DASHBOARD'); setSelectedChapter(null); setMobileMenuOpen(false); }}
                    />
                    <SidebarItem
                        icon={Layers}
                        label={t('my_courses_title')}
                        active={viewMode === 'MY_COURSES'}
                        onClick={() => { setViewMode('MY_COURSES'); setSelectedChapter(null); setMobileMenuOpen(false); }}
                    />
                     <SidebarItem
                        icon={Settings}
                        label="Settings"
                        active={false}
                        onClick={() => {
                            onNavigateProfile();
                            setMobileMenuOpen(false);
                        }}
                    />
                </div>

                {/* Class 12 Section */}
                <div className="mb-2">
                    <button
                        onClick={() => setExpandedClass(expandedClass === 12 ? 11 : 12)}
                        className="w-full flex items-center justify-between px-4 py-2 bg-slate-50 hover:bg-slate-100 rounded-lg transition"
                    >
                        <div className="flex items-center">
                            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">{t('curr_class_12')} Physics</span>
                            <span className="ml-2 text-xs bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full">{class12Chapters.length}</span>
                        </div>
                        {expandedClass === 12 ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                    </button>

                    {expandedClass === 12 && (
                        <div className="space-y-1 mt-2 animate-fade-in">
                            {class12Chapters.map(c => (
                                <button
                                    key={c.id}
                                    onClick={() => handleChapterClick(c)}
                                    className={`w-full text-left px-4 py-2 rounded-lg text-xs truncate transition ${selectedChapter?.id === c.id ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-500 hover:bg-slate-50'}`}
                                >
                                    {isUnlocked(c) ? <span className="inline-block w-2 h-2 rounded-full bg-green-400 mr-2"></span> : <Lock className="inline w-3 h-3 mr-2" />}
                                    {c.title}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                 {/* Class 11 Section */}
                 <div className="mb-2">
                    <button
                        onClick={() => setExpandedClass(expandedClass === 11 ? 12 : 11)}
                        className="w-full flex items-center justify-between px-4 py-2 bg-slate-50 hover:bg-slate-100 rounded-lg transition"
                    >
                        <div className="flex items-center">
                            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">{t('curr_class_11')} Physics</span>
                            <span className="ml-2 text-xs bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full">{class11Chapters.length}</span>
                        </div>
                        {expandedClass === 11 ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                    </button>

                    {expandedClass === 11 && (
                        <div className="space-y-1 mt-2 animate-fade-in">
                            {class11Chapters.map(c => (
                                <button
                                    key={c.id}
                                    onClick={() => handleChapterClick(c)}
                                    className={`w-full text-left px-4 py-2 rounded-lg text-xs truncate transition ${selectedChapter?.id === c.id ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-500 hover:bg-slate-50'}`}
                                >
                                    {isUnlocked(c) ? <span className="inline-block w-2 h-2 rounded-full bg-green-400 mr-2"></span> : <Lock className="inline w-3 h-3 mr-2" />}
                                    {c.title}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                <button
                    onClick={onLogout}
                    className="flex items-center w-full px-4 py-2 text-sm font-medium text-slate-600 hover:text-red-600 transition rounded-lg hover:bg-red-50"
                >
                    <LogOut className="h-4 w-4 mr-3" />
                    {t('nav_logout')}
                </button>
            </div>
        </aside>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)}></div>
        )}

        {/* === MAIN CONTENT AREA === */}
        <div className="flex-1 flex flex-col h-full overflow-hidden relative">

            <header className="h-16 bg-white border-b border-slate-200 flex justify-between items-center px-4 md:px-8 z-20">
                <div className="flex items-center">
                    <button
                        onClick={() => setMobileMenuOpen(true)}
                        className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg mr-2"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                    {viewMode === 'COURSE_PLAYER' && selectedChapter && (
                        <div className="hidden md:flex items-center text-sm text-slate-500">
                             <span className="hover:text-indigo-600 cursor-pointer" onClick={() => setViewMode('DASHBOARD')}>{t('nav_dashboard')}</span>
                             <ChevronRight className="h-4 w-4 mx-2" />
                             <span>Class {selectedChapter.classLevel}</span>
                             <ChevronRight className="h-4 w-4 mx-2" />
                             <span className="font-semibold text-slate-800 truncate max-w-[200px]">{selectedChapter.title}</span>
                        </div>
                    )}
                    {viewMode === 'MY_COURSES' && (
                        <div className="hidden md:flex items-center text-sm text-slate-500">
                             <span className="hover:text-indigo-600 cursor-pointer" onClick={() => setViewMode('DASHBOARD')}>{t('nav_dashboard')}</span>
                             <ChevronRight className="h-4 w-4 mx-2" />
                             <span className="font-semibold text-slate-800">{t('my_courses_title')}</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center space-x-3">
                    <div className="relative">
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full relative"
                        >
                            <Bell className="h-5 w-5" />
                            {announcements.length > 0 && <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>}
                        </button>
                        {showNotifications && (
                            <div className="absolute right-0 top-12 w-80 bg-white shadow-xl rounded-xl border border-slate-100 p-4 z-50">
                                <h4 className="font-bold text-slate-900 mb-3 text-sm">Notifications</h4>
                                <div className="space-y-3 max-h-64 overflow-y-auto">
                                    {announcements.length === 0 && <p className="text-xs text-slate-400">No notifications.</p>}
                                    {announcements.map(a => (
                                        <div key={a.id} className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                                            <p className="text-xs text-slate-800 mb-1">{a.content}</p>
                                            <p className="text-[10px] text-slate-500">{new Date(a.date).toLocaleDateString()}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={onNavigateProfile}
                        className="flex items-center pl-3 border-l border-slate-200 hover:opacity-80 transition"
                    >
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">
                            {user.name.charAt(0)}
                        </div>
                        <span className="ml-2 text-sm font-medium text-slate-700 hidden md:block">{user.name.split(' ')[0]}</span>
                    </button>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto bg-slate-50 relative">

                {viewMode === 'DASHBOARD' && (
                    <div className="p-4 md:p-8 max-w-screen-2xl mx-auto space-y-6 md:space-y-8 animate-fade-in">
                        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
                             <div className="relative z-10">
                                 <h1 className="text-2xl md:text-3xl font-bold mb-2">{t('dash_welcome', { name: user.name.split(' ')[0] })}</h1>
                                 <p className="text-indigo-100 max-w-xl mb-6 text-sm md:text-base">{t('dash_progress_text', { completed: completedTopicsOwned, total: totalTopicsOwned })}</p>
                                 <button
                                    onClick={() => {
                                        if (unlockedChapters.length > 0) handleChapterClick(unlockedChapters[0]);
                                        else setViewMode('MY_COURSES');
                                    }}
                                    className="px-5 py-2.5 bg-white text-indigo-700 rounded-xl font-bold text-sm shadow-md hover:shadow-xl hover:bg-slate-50 transition transform hover:-translate-y-0.5"
                                 >
                                     {t('dash_continue')}
                                 </button>
                             </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                             <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-100 flex items-center">
                                 <div className="p-3 bg-blue-50 text-blue-600 rounded-lg mr-4">
                                     <Video className="h-6 w-6" />
                                 </div>
                                 <div>
                                     <p className="text-slate-500 text-xs font-bold uppercase">{t('dash_topics_watched')}</p>
                                     <p className="text-xl md:text-2xl font-bold text-slate-900">{completedTopicsOwned}</p>
                                 </div>
                             </div>
                             <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-100 flex items-center">
                                 <div className="p-3 bg-purple-50 text-purple-600 rounded-lg mr-4">
                                     <Award className="h-6 w-6" />
                                 </div>
                                 <div>
                                     <p className="text-slate-500 text-xs font-bold uppercase">{t('dash_overall_progress')}</p>
                                     <p className="text-xl md:text-2xl font-bold text-slate-900">{progressPercent}%</p>
                                 </div>
                             </div>
                             <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-100 flex items-center">
                                 <div className="p-3 bg-amber-50 text-amber-600 rounded-lg mr-4">
                                     <HelpCircle className="h-6 w-6" />
                                 </div>
                                 <div>
                                     <p className="text-slate-500 text-xs font-bold uppercase">{t('dash_questions_asked')}</p>
                                     <p className="text-xl md:text-2xl font-bold text-slate-900">12</p>
                                 </div>
                             </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
                             <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                                 <div className="p-4 md:p-5 border-b border-slate-100 flex justify-between items-center">
                                     <h3 className="font-bold text-slate-800">{t('dash_available_chapters')}</h3>
                                 </div>
                                 <div className="p-4 max-h-[400px] overflow-y-auto">
                                     {unlockedChapters.length === 0 ? (
                                         <div className="text-center py-8 text-slate-400 text-sm">
                                             {t('dash_no_chapters')}
                                             <br/>
                                             <span className="text-indigo-600 cursor-pointer hover:underline" onClick={() => setViewMode('MY_COURSES')}>{t('dash_browse')}</span>
                                         </div>
                                     ) : (
                                         unlockedChapters.map(c => (
                                             <ChapterListItem
                                                 key={c.id}
                                                 chapter={c}
                                                 active={false}
                                                 isUnlocked={true}
                                                 completedTopicCount={c.topics.filter(t => user.progress[t.id]).length}
                                                 totalTopics={c.topics.length}
                                                 onClick={handleChapterClick}
                                                 lockedLabel={t('dash_locked')}
                                             />
                                         ))
                                     )}
                                 </div>
                             </div>

                             <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                                 <div className="p-4 md:p-5 border-b border-slate-100">
                                     <h3 className="font-bold text-slate-800">{t('dash_recent_announcements')}</h3>
                                 </div>
                                 <div className="p-4">
                                      {announcements.slice(0, 3).map(a => (
                                          <div key={a.id} className="mb-4 last:mb-0 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                                              <p className="text-sm text-slate-800 mb-1">{a.content}</p>
                                              <p className="text-xs text-slate-500">{new Date(a.date).toLocaleDateString()}</p>
                                          </div>
                                      ))}
                                      {announcements.length === 0 && <p className="text-slate-400 text-sm text-center">No new announcements</p>}
                                 </div>
                             </div>
                        </div>
                    </div>
                )}

                {viewMode === 'MY_COURSES' && (
                    <div className="p-4 md:p-8 max-w-screen-2xl mx-auto animate-fade-in">
                        <h1 className="text-2xl font-bold text-slate-900 mb-6">{t('my_courses_title')}</h1>

                        <div className="space-y-8">
                            {/* Class 12 Section */}
                            <div>
                                <div className="flex items-center justify-between mb-4 bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                                    <h2 className="text-lg font-bold text-indigo-900 flex items-center">
                                        <Layers className="h-5 w-5 mr-2" /> {t('curr_class_12')} Physics
                                    </h2>
                                    <span className="text-xs font-bold bg-white text-indigo-600 px-2 py-1 rounded-full shadow-sm">
                                        {unlockedChapters.filter(c => c.classLevel === 12).length} {t('my_courses_unlocked')}
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                                    {unlockedChapters.filter(c => c.classLevel === 12).map(chapter => (
                                        <div
                                            key={chapter.id}
                                            onClick={() => handleChapterClick(chapter)}
                                            className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 cursor-pointer hover:shadow-md transition group"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-bold text-slate-800 group-hover:text-indigo-600 transition">{chapter.title}</h3>
                                                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                                            </div>
                                            <div className="flex items-center text-xs text-slate-500 mt-2">
                                                <ListVideo className="h-3 w-3 mr-1" /> {chapter.topics.length} Topics
                                                <span className="mx-2">•</span>
                                                <PlayCircle className="h-3 w-3 mr-1" /> {chapter.duration}
                                            </div>
                                        </div>
                                    ))}
                                    {unlockedChapters.filter(c => c.classLevel === 12).length === 0 && (
                                        <div className="col-span-full text-center py-8 text-slate-400 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                            No Class 12 content purchased yet. <br/>
                                            <button
                                                onClick={() => {
                                                    // Find a locked class 12 chapter to initiate purchase flow
                                                    const lockedC12 = chapters.find(c => c.classLevel === 12 && !isUnlocked(c));
                                                    if (lockedC12) handleChapterClick(lockedC12);
                                                }}
                                                className="text-indigo-600 hover:underline mt-1"
                                            >
                                                Browse Store
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Class 11 Section */}
                            <div>
                                <div className="flex items-center justify-between mb-4 bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                                    <h2 className="text-lg font-bold text-indigo-900 flex items-center">
                                        <Layers className="h-5 w-5 mr-2" /> {t('curr_class_11')} Physics
                                    </h2>
                                    <span className="text-xs font-bold bg-white text-indigo-600 px-2 py-1 rounded-full shadow-sm">
                                        {unlockedChapters.filter(c => c.classLevel === 11).length} {t('my_courses_unlocked')}
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                                    {unlockedChapters.filter(c => c.classLevel === 11).map(chapter => (
                                        <div
                                            key={chapter.id}
                                            onClick={() => handleChapterClick(chapter)}
                                            className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 cursor-pointer hover:shadow-md transition group"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-bold text-slate-800 group-hover:text-indigo-600 transition">{chapter.title}</h3>
                                                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                                            </div>
                                            <div className="flex items-center text-xs text-slate-500 mt-2">
                                                <ListVideo className="h-3 w-3 mr-1" /> {chapter.topics.length} Topics
                                                <span className="mx-2">•</span>
                                                <PlayCircle className="h-3 w-3 mr-1" /> {chapter.duration}
                                            </div>
                                        </div>
                                    ))}
                                    {unlockedChapters.filter(c => c.classLevel === 11).length === 0 && (
                                        <div className="col-span-full text-center py-8 text-slate-400 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                            No Class 11 content purchased yet. <br/>
                                            <button
                                                onClick={() => {
                                                    const lockedC11 = chapters.find(c => c.classLevel === 11 && !isUnlocked(c));
                                                    if (lockedC11) handleChapterClick(lockedC11);
                                                }}
                                                className="text-indigo-600 hover:underline mt-1"
                                            >
                                                Browse Store
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {viewMode === 'COURSE_PLAYER' && selectedChapter && (
                    <div className="flex flex-col lg:flex-row h-full">
                        {/* Video Player Section */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                            <div className="max-w-5xl mx-auto">
                                {/* Video Player Container */}
                                <div className={`bg-black rounded-2xl overflow-hidden shadow-2xl mb-4 relative group ${isUnlocked(selectedChapter) ? 'aspect-video' : 'md:aspect-video h-auto'}`}>
                                    {isUnlocked(selectedChapter) && selectedTopic ? (
                                        <div id="youtube-player" className="w-full h-full"></div>
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-white p-4 md:p-8 text-center">
                                            <Lock className="h-6 w-6 md:h-12 md:w-12 mb-2 md:mb-4 text-slate-500" />
                                            <h2 className="font-bold text-sm md:text-2xl mb-1">Chapter Locked</h2>
                                            <p className="text-slate-400 mb-3 md:mb-6 max-w-md text-[10px] md:text-sm">Purchase this chapter individually or get the complete course for unlimited access.</p>

                                            {/* Buttons for Buying */}
                                            <div className="flex flex-col w-full max-w-[260px] md:max-w-xs gap-2 md:gap-3">
                                                <button
                                                    onClick={() => onBuyChapter(selectedChapter.id)}
                                                    className="flex items-center justify-between px-3 py-2 md:px-4 md:py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition group"
                                                >
                                                    <span className="text-[10px] md:text-xs font-bold text-slate-300 uppercase">Single Chapter</span>
                                                    <span className="text-xs md:text-sm font-bold text-white">₹{selectedChapter.price}</span>
                                                </button>

                                                <button
                                                    onClick={() => onBuyCourse(COURSES[selectedChapter.classLevel as 11 | 12]?.id)}
                                                    className="flex items-center justify-between px-3 py-2 md:px-4 md:py-3 bg-indigo-600 hover:bg-indigo-700 border border-indigo-500 rounded-lg transition relative overflow-hidden"
                                                >
                                                     <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-[8px] font-bold px-1.5 py-0.5 rounded-bl">{t('curr_best_value')}</div>
                                                     <span className="text-[10px] md:text-xs font-bold text-white uppercase">{t('curr_buy_full')}</span>
                                                     <span className="text-xs md:text-sm font-bold text-white">₹{COURSES[selectedChapter.classLevel as 11 | 12]?.price}</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Mobile Playlist Section - Moved Here */}
                                <div className="lg:hidden mb-6 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                    <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Up Next</span>
                                        <span className="text-xs text-slate-400">{selectedChapter.topics?.length || 0} topics</span>
                                    </div>
                                    <div className="flex overflow-x-auto p-2 gap-2 snap-x no-scrollbar">
                                        {selectedChapter.topics?.map((topic, index) => {
                                            const isWatched = user.progress[topic.id];
                                            const isActive = selectedTopic?.id === topic.id;

                                            return (
                                                <div
                                                    key={topic.id}
                                                    onClick={() => handleTopicSelect(topic)}
                                                    className={`flex-shrink-0 w-64 p-3 rounded-lg border snap-center ${isActive ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-200'}`}
                                                >
                                                    <div className="flex items-center mb-2">
                                                        <div className="mr-2">
                                                            {isWatched ? <CheckCircle className="h-3 w-3 text-green-500" /> : <PlayCircle className="h-3 w-3 text-indigo-500" />}
                                                        </div>
                                                        <span className="text-xs text-slate-500">Topic {index + 1}</span>
                                                    </div>
                                                    <h4 className={`text-sm font-medium leading-tight mb-1 truncate ${isActive ? 'text-indigo-900' : 'text-slate-700'}`}>
                                                        {topic.title}
                                                    </h4>
                                                    <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                                                        {topic.duration}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
                                    <div className="flex-1">
                                        <h1 className="text-lg md:text-2xl font-bold text-slate-900 mb-2">
                                            {selectedTopic ? selectedTopic.title : selectedChapter.title}
                                        </h1>
                                        <p className="text-slate-500 text-xs md:text-sm line-clamp-2">{selectedChapter.description}</p>
                                    </div>
                                    <div className="flex gap-2 w-full md:w-auto">
                                         {selectedTopic && !user.progress[selectedTopic.id] && isUnlocked(selectedChapter) && (
                                            <button
                                                onClick={() => handleMarkTopicWatched(selectedTopic.id)}
                                                className="flex-1 md:flex-none justify-center px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg font-medium text-xs md:text-sm flex items-center hover:bg-green-100 transition"
                                            >
                                                <CheckCircle className="h-4 w-4 mr-2" /> Mark Completed
                                            </button>
                                         )}
                                    </div>
                                </div>

                                {/* Tabs & Content */}
                                <div className="border-b border-slate-200 mb-6">
                                    <nav className="-mb-px flex space-x-8 overflow-x-auto no-scrollbar">
                                        {['VIDEO', 'NOTES', 'QUIZ'].map((tab) => (
                                            <button
                                                key={tab}
                                                onClick={() => setActiveTab(tab as any)}
                                                className={`
                                                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                                                    ${activeTab === tab
                                                        ? 'border-indigo-500 text-indigo-600'
                                                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}
                                                `}
                                            >
                                                {tab === 'VIDEO' ? 'Overview' : tab === 'NOTES' ? 'My Notes' : 'Quiz'}
                                            </button>
                                        ))}
                                    </nav>
                                </div>

                                <div className="min-h-[200px]">
                                    {activeTab === 'VIDEO' && (
                                        <div className="space-y-6 animate-fade-in">
                                            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                                                <h3 className="font-bold text-slate-900 mb-4">About this chapter</h3>
                                                <p className="text-slate-600 leading-relaxed mb-4 text-sm md:text-base">{selectedChapter.description}</p>
                                                <h4 className="font-bold text-sm text-slate-900 mb-2">In this chapter you will learn:</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedChapter.topics?.map(t => (
                                                        <span key={t.id} className="px-3 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">{t.title}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'QUIZ' && (
                                        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm animate-fade-in">
                                             {!currentQuiz ? (
                                                 <div className="text-center py-10 text-slate-400">
                                                     <HelpCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                                     <p>No quiz available for this chapter.</p>
                                                 </div>
                                             ) : quizSubmitted ? (
                                                  <div className="text-center py-8">
                                                      <div className="inline-block p-4 rounded-full bg-indigo-50 mb-4">
                                                          <Award className="h-10 w-10 text-indigo-600" />
                                                      </div>
                                                      <h3 className="text-2xl font-bold text-slate-900 mb-2">Quiz Completed!</h3>
                                                      <p className="text-lg text-slate-600 mb-6">You scored <span className="font-bold text-indigo-600">{quizScore}/{currentQuiz.questions.length}</span></p>
                                                      <button
                                                        onClick={() => { setQuizSubmitted(false); setQuizAnswers({}); }}
                                                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
                                                      >
                                                          Retake Quiz
                                                      </button>
                                                  </div>
                                             ) : (
                                                 <div className="space-y-6">
                                                     {currentQuiz.questions.map((q, idx) => (
                                                         <div key={q.id} className="p-4 bg-slate-50 rounded-lg">
                                                             <p className="font-bold text-slate-900 mb-3">{idx + 1}. {q.text}</p>
                                                             <div className="space-y-2">
                                                                 {q.options.map((opt, optIdx) => (
                                                                     <label key={optIdx} className="flex items-center space-x-3 p-3 bg-white border border-slate-200 rounded-lg cursor-pointer hover:border-indigo-300 transition">
                                                                         <input
                                                                            type="radio"
                                                                            name={q.id}
                                                                            checked={quizAnswers[q.id] === optIdx}
                                                                            onChange={() => setQuizAnswers({...quizAnswers, [q.id]: optIdx})}
                                                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                                                                         />
                                                                         <span className="text-sm text-slate-700">{opt}</span>
                                                                     </label>
                                                                 ))}
                                                             </div>
                                                         </div>
                                                     ))}
                                                     <button
                                                        onClick={submitQuiz}
                                                        className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-md transition"
                                                     >
                                                         Submit Answers
                                                     </button>
                                                 </div>
                                             )}
                                        </div>
                                    )}

                                    {activeTab === 'NOTES' && (
                                        <div className="space-y-6 animate-fade-in">
                                            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                                                <h3 className="font-bold text-slate-900 mb-4 flex items-center">
                                                    <BookOpen className="h-5 w-5 mr-2 text-indigo-600" />
                                                    My Notes for this Chapter
                                                </h3>

                                                <div className="mb-6">
                                                    <textarea
                                                        value={newNote}
                                                        onChange={(e) => setNewNote(e.target.value)}
                                                        placeholder="Write a new note here..."
                                                        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-h-[100px] bg-white text-slate-900"
                                                    />
                                                    <button
                                                        onClick={handleAddNote}
                                                        disabled={!newNote.trim()}
                                                        className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center"
                                                    >
                                                        <PlusCircle className="h-4 w-4 mr-2" /> Add Note
                                                    </button>
                                                </div>

                                                <div className="space-y-3">
                                                    {notes.filter(n => n.chapterId === selectedChapter.id).length === 0 && (
                                                        <p className="text-sm text-slate-400 italic">No notes added for this chapter yet.</p>
                                                    )}
                                                    {notes.filter(n => n.chapterId === selectedChapter.id).map(note => (
                                                        <div key={note.id} className="p-4 bg-yellow-50 border border-yellow-100 rounded-lg relative group">
                                                            <button
                                                                onClick={() => handleDeleteNoteItem(note.id)}
                                                                className="absolute top-2 right-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                                                                title="Delete Note"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                            <div className="flex items-center mb-1">
                                                                {note.type === 'PDF' && <File className="h-3 w-3 mr-1 text-red-500" />}
                                                                <p className="font-bold text-slate-800 text-sm">{note.title}</p>
                                                            </div>

                                                            {note.type === 'PDF' ? (
                                                                <a
                                                                    href={note.url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center mt-2 px-3 py-1.5 bg-red-50 text-red-700 text-xs font-bold rounded-lg hover:bg-red-100 transition"
                                                                >
                                                                    <ArrowDownCircle className="h-3 w-3 mr-1.5" /> Download / View PDF
                                                                </a>
                                                            ) : (
                                                                <p className="text-sm text-slate-800 whitespace-pre-wrap">{note.content}</p>
                                                            )}

                                                            <p className="text-xs text-slate-400 mt-2">{new Date(note.date).toLocaleDateString()}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="w-full lg:w-96 bg-white border-l border-slate-200 overflow-y-auto hidden lg:block">
                            <div className="p-4 border-b border-slate-100 bg-slate-50">
                                <h3 className="font-bold text-slate-800">Topic Playlist</h3>
                                <p className="text-xs text-slate-500">{selectedChapter.topics?.length || 0} topics</p>
                            </div>
                            <div className="p-2">
                                {selectedChapter.topics?.map((topic, index) => {
                                    const isWatched = user.progress[topic.id];
                                    const isActive = selectedTopic?.id === topic.id;

                                    return (
                                        <div
                                            key={topic.id}
                                            onClick={() => handleTopicSelect(topic)}
                                            className={`flex items-start gap-3 p-3 mb-1 rounded-lg cursor-pointer transition ${isActive ? 'bg-indigo-50 border border-indigo-100' : 'hover:bg-slate-50 border border-transparent'}`}
                                        >
                                            <div className="mt-1 flex-shrink-0">
                                                 {isWatched ? (
                                                     <CheckCircle className="h-4 w-4 text-green-500" />
                                                 ) : isActive ? (
                                                     <PlayCircle className="h-4 w-4 text-indigo-600" />
                                                 ) : (
                                                     <div className="h-4 w-4 rounded-full border-2 border-slate-300 flex items-center justify-center">
                                                         <span className="text-[9px] text-slate-400 font-bold">{index + 1}</span>
                                                     </div>
                                                 )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className={`text-sm font-medium leading-tight mb-1 ${isActive ? 'text-indigo-900' : 'text-slate-700'}`}>
                                                    {topic.title}
                                                </h4>
                                                <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                                                    {topic.duration}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <div className="absolute bottom-6 right-6 z-30">
                <button
                    onClick={() => setShowAiChat(!showAiChat)}
                    className="h-12 w-12 md:h-14 md:w-14 rounded-full bg-indigo-600 text-white shadow-xl flex items-center justify-center hover:bg-indigo-700 hover:scale-105 transition-all"
                >
                    {showAiChat ? <X className="h-5 w-5 md:h-6 md:w-6" /> : <Bot className="h-7 w-7 md:h-8 md:w-8" />}
                </button>
            </div>

            {showAiChat && (
                <div className="absolute bottom-20 right-4 md:right-6 w-[calc(100vw-2rem)] md:w-96 max-h-[60vh] md:max-h-[500px] bg-white rounded-2xl shadow-2xl border border-slate-200 z-30 flex flex-col overflow-hidden animate-fade-in-up">
                    <div className="bg-indigo-600 p-4 text-white flex justify-between items-center">
                        <div className="flex items-center">
                            <div className="h-8 w-8 bg-white/20 rounded-full flex items-center justify-center mr-2">
                                <Sparkles className="h-4 w-4" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">{t('ai_tutor_title')}</h3>
                                <p className="text-indigo-200 text-xs">{selectedChapter ? 'Context: ' + selectedChapter.title.substring(0,20) + '...' : t('ai_tutor_subtitle')}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50" ref={chatScrollRef}>
                         {chatMessages.length === 0 && (
                             <div className="text-center py-10 px-6">
                                 <p className="text-sm text-slate-500">Hi! I can explain complex physics concepts or help you solve problems from this chapter.</p>
                             </div>
                         )}
                         {chatMessages.map((msg, i) => (
                             <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                 <div className={`max-w-[85%] px-4 py-2 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'}`}>
                                     {msg.text}
                                 </div>
                             </div>
                         ))}
                         {isAiThinking && (
                             <div className="flex justify-start">
                                 <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex space-x-1">
                                     <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                                     <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-100"></div>
                                     <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-200"></div>
                                 </div>
                             </div>
                         )}
                    </div>
                    <div className="p-3 bg-white border-t border-slate-100 flex gap-2">
                        <input
                            type="text"
                            className="flex-1 border border-slate-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900 placeholder-slate-400"
                            placeholder={t('ai_input_placeholder')}
                            value={chatInput}
                            onChange={e => setChatInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleAskAi()}
                        />
                        <button
                            onClick={handleAskAi}
                            disabled={!chatInput.trim() || isAiThinking}
                            className="h-9 w-9 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50"
                        >
                            <Send className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}

        </div>
    </div>
  );
};