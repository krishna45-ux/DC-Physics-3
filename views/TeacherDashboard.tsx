import React, { useState, useEffect } from 'react';
import { User, Announcement, Note, Chapter, Question, Quiz, QuizResult, Topic } from '../types';
import { getStudents, getAnnouncements, addAnnouncement, getNotes, addNote, deleteAnnouncement, deleteNote, saveQuiz, getQuizByChapterId, getChapters, updateTopicVideo, logoutUser } from '../services/dataService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, BookOpen, TrendingUp, Bell, Send, Trash2, Clock, FileText, Megaphone, Save, X, PlusCircle, CheckCircle, HelpCircle, Video, Eye, Award, LayoutDashboard, Menu, Search, LogOut, MessageSquare, ChevronRight, Settings, File, ArrowRight, UploadCloud } from 'lucide-react';
import { Logo } from '../components/Logo';

// --- Helper Components ---

const SidebarItem = ({ icon: Icon, label, active, onClick }: any) => (
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
    </button>
);

interface TeacherDashboardProps {
    user: User;
    onLogout: () => void;
    onNavigateProfile: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ user, onLogout, onNavigateProfile }) => {
  const [students, setStudents] = useState<User[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);

  // View State
  const [activeView, setActiveView] = useState<'DASHBOARD' | 'CONTENT' | 'STUDENTS' | 'COMMUNICATION'>('DASHBOARD');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Announcement Form
  const [newAnnouncement, setNewAnnouncement] = useState('');

  // Note Form
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteClass, setNoteClass] = useState(12);

  // Content Management State
  const [selectedClass, setSelectedClass] = useState<11 | 12>(12);
  const [selectedChapterId, setSelectedChapterId] = useState<string>('');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('');
  const [activeContentTab, setActiveContentTab] = useState<'VIDEO' | 'NOTE' | 'QUIZ'>('VIDEO');

  // Chapter Video State
  const [videoInput, setVideoInput] = useState('');

  // Chapter Note State
  const [chapterNoteTitle, setChapterNoteTitle] = useState('');
  const [chapterNoteContent, setChapterNoteContent] = useState('');
  const [chapterNoteType, setChapterNoteType] = useState<'TEXT' | 'PDF'>('TEXT');
  const [chapterNoteUrl, setChapterNoteUrl] = useState('');

  // Quiz State
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [currentQuestionText, setCurrentQuestionText] = useState('');
  const [option1, setOption1] = useState('');
  const [option2, setOption2] = useState('');
  const [option3, setOption3] = useState('');
  const [option4, setOption4] = useState('');
  const [correctOption, setCorrectOption] = useState(0);

  // Student Detail Modal State
  const [viewingStudent, setViewingStudent] = useState<User | null>(null);
  const [studentSearch, setStudentSearch] = useState('');

  useEffect(() => {
      setStudents(getStudents());
      setChapters(getChapters());
      setAnnouncements(getAnnouncements());
      setNotes(getNotes());
  }, []);

  // Update Quiz/Content forms when chapter/topic selection changes
  useEffect(() => {
      if (selectedChapterId) {
          const quiz = getQuizByChapterId(selectedChapterId);
          if (quiz) {
              setQuizQuestions(quiz.questions);
          } else {
              setQuizQuestions([]);
          }

          const chapter = chapters.find(c => c.id === selectedChapterId);

          if (selectedTopicId) {
             const topic = chapter?.topics.find(t => t.id === selectedTopicId);
             if (topic) {
                 setVideoInput(topic.videoUrl);
             }
          } else if (chapter && chapter.topics.length > 0) {
              // Automatically select first topic if none selected
              setSelectedTopicId(chapter.topics[0].id);
          }
      }
  }, [selectedChapterId, selectedTopicId, chapters]);

  const handlePostAnnouncement = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newAnnouncement.trim()) return;

      const updated = addAnnouncement(newAnnouncement, user.name || "Teacher");
      setAnnouncements(updated);
      setNewAnnouncement('');
  };

  const handleDeleteAnnouncement = (id: string) => {
      const updated = deleteAnnouncement(id);
      setAnnouncements(updated);
  };

  const handleAddNote = (e: React.FormEvent) => {
      e.preventDefault();
      if (!noteTitle.trim() || !noteContent.trim()) return;

      const updated = addNote(noteTitle, noteContent, noteClass);
      setNotes(updated);
      setNoteTitle('');
      setNoteContent('');
  };

  const handleDeleteNote = (id: string) => {
      const updated = deleteNote(id);
      setNotes(updated);
  };

  // Chapter Content Functions
  const handleAddChapterNote = (e: React.FormEvent) => {
      e.preventDefault();

      if (chapterNoteType === 'TEXT') {
        if (!chapterNoteTitle.trim() || !chapterNoteContent.trim() || !selectedChapterId) return;
        const updated = addNote(chapterNoteTitle, chapterNoteContent, selectedClass, selectedChapterId, 'TEXT');
        setNotes(updated);
      } else {
          if (!chapterNoteTitle.trim() || !chapterNoteUrl.trim() || !selectedChapterId) return;
          const updated = addNote(chapterNoteTitle, '', selectedClass, selectedChapterId, 'PDF', chapterNoteUrl);
          setNotes(updated);
      }

      setChapterNoteTitle('');
      setChapterNoteContent('');
      setChapterNoteUrl('');
      alert("Note added to chapter successfully!");
  };

  // Simulates a file upload by generating a dummy URL
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          // In a real app, this would upload to S3/Cloud storage.
          // Here we simulate by using a valid public PDF URL.
          const fakeUploadedUrl = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
          setChapterNoteUrl(fakeUploadedUrl);
      }
  };

  const extractVideoId = (input: string) => {
      if (!input) return '';
      const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
      const match = input.match(regex);
      return match ? match[1] : (input.length === 11 ? input : input);
  };

  const handleUpdateVideo = () => {
      if (!selectedChapterId || !selectedTopicId || !videoInput.trim()) return;
      const videoId = extractVideoId(videoInput);
      const updatedChapters = updateTopicVideo(selectedChapterId, selectedTopicId, videoId);
      setChapters(updatedChapters);
      setVideoInput(videoId);
      alert(`Topic video updated! ID: ${videoId}`);
  };

  const handleAddQuestion = () => {
      if (!currentQuestionText || !option1 || !option2 || !option3 || !option4) return;

      const newQuestion: Question = {
          id: `q-${Date.now()}`,
          text: currentQuestionText,
          options: [option1, option2, option3, option4],
          correctOptionIndex: correctOption
      };

      setQuizQuestions([...quizQuestions, newQuestion]);
      setCurrentQuestionText('');
      setOption1('');
      setOption2('');
      setOption3('');
      setOption4('');
      setCorrectOption(0);
  };

  const handleSaveQuiz = () => {
      if (selectedChapterId && quizQuestions.length > 0) {
          saveQuiz(selectedChapterId, quizQuestions);
          alert("Quiz saved successfully!");
      }
  };

  const handleDeleteQuestion = (index: number) => {
      const updated = [...quizQuestions];
      updated.splice(index, 1);
      setQuizQuestions(updated);
  };

  // Calculate Stats
  const totalStudents = students.length;
  // Count total topics instead of chapters for content unit
  const totalTopics = chapters.reduce((acc, c) => acc + c.topics.length, 0);
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const activeStudentsCount = students.filter(s => new Date(s.lastLogin) > oneDayAgo).length;

  // Chart Data
  const chartData = students.map(s => {
    const completedTopics = Object.keys(s.progress).length;
    const percentage = Math.round((completedTopics / (totalTopics || 1)) * 100);
    return {
      name: s.name.split(' ')[0],
      progress: percentage,
      completed: completedTopics
    };
  });
  const averageProgress = chartData.reduce((acc, curr) => acc + curr.progress, 0) / (totalStudents || 1);

  const filteredChapters = chapters.filter(c => c.classLevel === selectedClass);
  const selectedChapter = chapters.find(c => c.id === selectedChapterId);
  const filteredStudents = students.filter(s => s.name.toLowerCase().includes(studentSearch.toLowerCase()) || s.email.toLowerCase().includes(studentSearch.toLowerCase()));

  // Helper to calculate total chapters owned by a student including full courses
  const getStudentTotalChapters = (student: User) => {
      let count = student.purchasedChapterIds.length;
      student.purchasedCourseIds.forEach(courseId => {
          // Check if course corresponds to class 11 or 12
          const classLevel = courseId.includes('11') ? 11 : courseId.includes('12') ? 12 : null;
          if (classLevel) {
              count += chapters.filter(c => c.classLevel === classLevel).length;
          }
      });
      return count;
  };

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
                    <span className="font-bold text-lg text-slate-900">Educator</span>
                </div>
                <button className="lg:hidden text-slate-400 hover:text-indigo-600" onClick={() => setMobileMenuOpen(false)}>
                    <X className="h-6 w-6" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-1">
                <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 mt-2">Main</p>
                <SidebarItem
                    icon={LayoutDashboard}
                    label="Dashboard"
                    active={activeView === 'DASHBOARD'}
                    onClick={() => { setActiveView('DASHBOARD'); setMobileMenuOpen(false); }}
                />
                <SidebarItem
                    icon={BookOpen}
                    label="Course Content"
                    active={activeView === 'CONTENT'}
                    onClick={() => { setActiveView('CONTENT'); setMobileMenuOpen(false); }}
                />
                <SidebarItem
                    icon={Users}
                    label="Students"
                    active={activeView === 'STUDENTS'}
                    onClick={() => { setActiveView('STUDENTS'); setMobileMenuOpen(false); }}
                />
                <SidebarItem
                    icon={MessageSquare}
                    label="Communication"
                    active={activeView === 'COMMUNICATION'}
                    onClick={() => { setActiveView('COMMUNICATION'); setMobileMenuOpen(false); }}
                />

                <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 mt-6">Settings</p>
                <SidebarItem
                    icon={Settings}
                    label="Profile & Details"
                    active={false}
                    onClick={() => { onNavigateProfile(); setMobileMenuOpen(false); }}
                />
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                <button
                    onClick={onLogout}
                    className="flex items-center w-full px-4 py-2 text-sm font-medium text-slate-600 hover:text-red-600 transition rounded-lg hover:bg-red-50"
                >
                    <LogOut className="h-4 w-4 mr-3" />
                    Sign Out
                </button>
            </div>
        </aside>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)}></div>
        )}

        {/* === MAIN CONTENT === */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
             {/* Header */}
             <header className="h-16 bg-white border-b border-slate-200 flex justify-between items-center px-4 md:px-8 z-20">
                <div className="flex items-center">
                    <button
                        onClick={() => setMobileMenuOpen(true)}
                        className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg mr-2"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                    <h2 className="text-lg md:text-xl font-bold text-slate-800 hidden md:block">
                        {activeView === 'DASHBOARD' && 'Dashboard Overview'}
                        {activeView === 'CONTENT' && 'Course Manager'}
                        {activeView === 'STUDENTS' && 'Enrolled Students'}
                        {activeView === 'COMMUNICATION' && 'Communication Hub'}
                    </h2>
                    <h2 className="text-lg font-bold text-slate-800 md:hidden">
                        Educator
                    </h2>
                </div>
                <div className="flex items-center space-x-4">
                     <button
                         onClick={onNavigateProfile}
                         className="flex items-center space-x-2 px-3 py-1.5 bg-indigo-50 rounded-full border border-indigo-100 hover:bg-indigo-100 transition"
                     >
                         <div className="h-6 w-6 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-xs">
                             {user.name.charAt(0)}
                         </div>
                         <span className="text-sm font-medium text-slate-700 hidden sm:block">{user.name}</span>
                     </button>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-8">
                <div className="max-w-screen-2xl mx-auto">

                    {/* === DASHBOARD VIEW === */}
                    {activeView === 'DASHBOARD' && (
                        <div className="space-y-6 animate-fade-in">
                             {/* Stats Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                                <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-100 flex items-center">
                                    <div className="p-3 rounded-full bg-blue-50 text-blue-600 mr-4">
                                        <Users className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500 font-medium">Total Students</p>
                                        <h3 className="text-2xl font-bold text-slate-900">{totalStudents}</h3>
                                    </div>
                                </div>

                                <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-100 flex items-center">
                                    <div className="p-3 rounded-full bg-amber-50 text-amber-600 mr-4">
                                        <Clock className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500 font-medium">Active (24h)</p>
                                        <h3 className="text-2xl font-bold text-slate-900">{activeStudentsCount}</h3>
                                    </div>
                                </div>

                                <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-100 flex items-center">
                                    <div className="p-3 rounded-full bg-green-50 text-green-600 mr-4">
                                        <TrendingUp className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500 font-medium">Avg. Completion</p>
                                        <h3 className="text-2xl font-bold text-slate-900">{Math.round(averageProgress)}%</h3>
                                    </div>
                                </div>

                                <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-100 flex items-center">
                                    <div className="p-3 rounded-full bg-purple-50 text-purple-600 mr-4">
                                        <BookOpen className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500 font-medium">Content Topics</p>
                                        <h3 className="text-2xl font-bold text-slate-900">{totalTopics}</h3>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                                <div className="lg:col-span-2 bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-100">
                                    <h3 className="text-lg font-bold text-slate-900 mb-6">Student Progress Overview</h3>
                                    <div className="h-64 md:h-80">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                            <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} unit="%" />
                                            <Tooltip
                                                cursor={{fill: '#f1f5f9'}}
                                                contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                                            />
                                            <Bar dataKey="progress" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Progress %" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-100">
                                     <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Activity</h3>
                                     <div className="space-y-4">
                                        {announcements.slice(0, 3).map(a => (
                                            <div key={a.id} className="flex gap-3">
                                                <div className="mt-1 h-2 w-2 rounded-full bg-amber-400 flex-shrink-0"></div>
                                                <div>
                                                    <p className="text-xs text-slate-500 mb-1">{new Date(a.date).toLocaleDateString()}</p>
                                                    <p className="text-sm text-slate-800 line-clamp-2">{a.content}</p>
                                                </div>
                                            </div>
                                        ))}
                                        {notes.filter(n => !n.chapterId).slice(0, 3).map(n => (
                                             <div key={n.id} className="flex gap-3">
                                                <div className="mt-1 h-2 w-2 rounded-full bg-blue-400 flex-shrink-0"></div>
                                                <div>
                                                    <p className="text-xs text-slate-500 mb-1">{new Date(n.date).toLocaleDateString()}</p>
                                                    <p className="text-sm text-slate-800 font-medium">{n.title}</p>
                                                </div>
                                            </div>
                                        ))}
                                     </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* === CONTENT VIEW === */}
                    {activeView === 'CONTENT' && (
                        <div className="animate-fade-in space-y-6">
                            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 md:p-6">
                                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
                                    <Settings className="h-5 w-5 mr-2 text-slate-500" />
                                    Select Context
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Class Level</label>
                                        <select
                                            value={selectedClass}
                                            onChange={(e) => {
                                                setSelectedClass(Number(e.target.value) as 11 | 12);
                                                setSelectedChapterId('');
                                                setSelectedTopicId('');
                                            }}
                                            className="w-full p-2.5 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        >
                                            <option value={11}>Class 11 Physics</option>
                                            <option value={12}>Class 12 Physics</option>
                                        </select>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Select Chapter</label>
                                        <select
                                            value={selectedChapterId}
                                            onChange={(e) => {
                                                setSelectedChapterId(e.target.value);
                                                setSelectedTopicId('');
                                            }}
                                            className="w-full p-2.5 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        >
                                            <option value="">-- Choose Chapter --</option>
                                            {filteredChapters.map(c => (
                                                <option key={c.id} value={c.id}>{c.title}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {selectedChapterId ? (
                                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden min-h-[500px]">
                                    <div className="border-b border-slate-200">
                                        <nav className="flex space-x-8 px-6 overflow-x-auto no-scrollbar" aria-label="Tabs">
                                            <button
                                                onClick={() => setActiveContentTab('VIDEO')}
                                                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeContentTab === 'VIDEO' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                                            >
                                                Video Source
                                            </button>
                                            <button
                                                onClick={() => setActiveContentTab('NOTE')}
                                                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeContentTab === 'NOTE' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                                            >
                                                Chapter Notes
                                            </button>
                                            <button
                                                onClick={() => setActiveContentTab('QUIZ')}
                                                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeContentTab === 'QUIZ' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                                            >
                                                Quiz Manager
                                            </button>
                                        </nav>
                                    </div>
                                    <div className="p-4 md:p-6">
                                        {activeContentTab === 'VIDEO' && selectedChapter && (
                                            <div className="max-w-xl space-y-4">
                                                <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 mb-4">
                                                     <p className="text-sm text-indigo-800">Select a topic to update its video lecture. Supports YouTube video IDs or full URLs.</p>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-2">Select Topic</label>
                                                    <select
                                                        value={selectedTopicId}
                                                        onChange={(e) => setSelectedTopicId(e.target.value)}
                                                        className="w-full p-2.5 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 mb-4"
                                                    >
                                                        {selectedChapter.topics.map(t => (
                                                            <option key={t.id} value={t.id}>{t.title}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-1">YouTube Video URL / ID</label>
                                                    <input
                                                        type="text"
                                                        placeholder="e.g. k07J_Pj9T-Y or full URL"
                                                        value={videoInput}
                                                        onChange={(e) => setVideoInput(e.target.value)}
                                                        className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500"
                                                    />
                                                </div>
                                                <button
                                                    onClick={handleUpdateVideo}
                                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center"
                                                >
                                                    <Save className="h-4 w-4 mr-2" /> Update Topic Video
                                                </button>
                                                <p className="text-xs text-slate-500 mt-2">Current ID: {videoInput && extractVideoId(videoInput) ? extractVideoId(videoInput) : 'None'}</p>
                                            </div>
                                        )}

                                        {activeContentTab === 'NOTE' && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="space-y-4">
                                                    <h4 className="font-bold text-slate-800">Add New Note</h4>

                                                    <div className="flex gap-4 mb-2">
                                                        <label className="flex items-center cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                name="noteType"
                                                                checked={chapterNoteType === 'TEXT'}
                                                                onChange={() => setChapterNoteType('TEXT')}
                                                                className="mr-2 text-indigo-600"
                                                            />
                                                            <span className="text-sm text-slate-700">Text Content</span>
                                                        </label>
                                                        <label className="flex items-center cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                name="noteType"
                                                                checked={chapterNoteType === 'PDF'}
                                                                onChange={() => setChapterNoteType('PDF')}
                                                                className="mr-2 text-indigo-600"
                                                            />
                                                            <span className="text-sm text-slate-700">PDF File</span>
                                                        </label>
                                                    </div>

                                                    <input
                                                        type="text"
                                                        placeholder="Topic/Title"
                                                        value={chapterNoteTitle}
                                                        onChange={(e) => setChapterNoteTitle(e.target.value)}
                                                        className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white text-slate-900"
                                                    />

                                                    {chapterNoteType === 'TEXT' ? (
                                                        <textarea
                                                            placeholder="Detailed note content..."
                                                            value={chapterNoteContent}
                                                            onChange={(e) => setChapterNoteContent(e.target.value)}
                                                            className="w-full p-2.5 border border-slate-300 rounded-lg text-sm h-48 resize-none bg-white text-slate-900"
                                                        />
                                                    ) : (
                                                        <div className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                                                            <div className="flex items-center space-x-3">
                                                                <UploadCloud className="h-8 w-8 text-indigo-400" />
                                                                <div className="flex-1">
                                                                    <label className="block text-sm font-medium text-slate-700 mb-1">Upload PDF</label>
                                                                    <input
                                                                        type="file"
                                                                        accept="application/pdf"
                                                                        onChange={handleFileUpload}
                                                                        className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                                                    />
                                                                </div>
                                                            </div>

                                                            {chapterNoteUrl ? (
                                                                <div className="flex items-center text-xs text-green-600 bg-green-50 p-2 rounded">
                                                                    <CheckCircle className="h-3 w-3 mr-2" /> File ready to be linked
                                                                </div>
                                                            ) : (
                                                                <p className="text-xs text-slate-500">Select a PDF file to upload.</p>
                                                            )}

                                                            {/* Manual URL override if needed (hidden by default or optional) */}
                                                            <input
                                                                type="text"
                                                                placeholder="Or paste direct PDF URL..."
                                                                value={chapterNoteUrl}
                                                                onChange={(e) => setChapterNoteUrl(e.target.value)}
                                                                className="w-full p-2 border border-slate-300 rounded text-xs bg-white text-slate-800"
                                                            />
                                                        </div>
                                                    )}

                                                    <button
                                                        onClick={handleAddChapterNote}
                                                        disabled={chapterNoteType === 'PDF' && !chapterNoteUrl}
                                                        className="w-full py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <PlusCircle className="h-4 w-4 mr-2" /> Add Note to Chapter
                                                    </button>
                                                </div>
                                                <div>
                                                     <h4 className="font-bold text-slate-800 mb-4">Existing Notes</h4>
                                                     <div className="space-y-3 max-h-[400px] overflow-y-auto">
                                                        {notes.filter(n => n.chapterId === selectedChapterId).length === 0 && <p className="text-sm text-slate-400 italic">No notes added.</p>}
                                                        {notes.filter(n => n.chapterId === selectedChapterId).map(n => (
                                                            <div key={n.id} className="bg-slate-50 p-4 rounded-lg border border-slate-200 relative group">
                                                                <button
                                                                    onClick={() => handleDeleteNote(n.id)}
                                                                    className="absolute top-2 right-2 text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </button>
                                                                <div className="flex items-center mb-1">
                                                                    {n.type === 'PDF' && <File className="h-3 w-3 mr-1 text-red-500" />}
                                                                    <h5 className="font-bold text-slate-900 text-sm">{n.title}</h5>
                                                                </div>

                                                                {n.type === 'PDF' ? (
                                                                     <a href={n.url} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:underline flex items-center mt-1">
                                                                         View PDF <ArrowRight className="h-3 w-3 ml-1" />
                                                                     </a>
                                                                ) : (
                                                                     <p className="text-xs text-slate-600 line-clamp-3">{n.content}</p>
                                                                )}
                                                            </div>
                                                        ))}
                                                     </div>
                                                </div>
                                            </div>
                                        )}

                                        {activeContentTab === 'QUIZ' && (
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                                <div className="space-y-4">
                                                    <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 mb-4">
                                                        <h4 className="font-bold text-indigo-900 text-sm mb-3">Create Question</h4>
                                                        <input
                                                            type="text"
                                                            placeholder="Question Text"
                                                            value={currentQuestionText}
                                                            onChange={(e) => setCurrentQuestionText(e.target.value)}
                                                            className="w-full p-2.5 border border-slate-300 rounded mb-3 text-sm bg-white text-slate-900"
                                                        />
                                                        <div className="space-y-2 mb-3">
                                                            {[option1, option2, option3, option4].map((opt, idx) => (
                                                                <input
                                                                    key={idx}
                                                                    type="text"
                                                                    placeholder={`Option ${idx + 1}`}
                                                                    value={idx === 0 ? option1 : idx === 1 ? option2 : idx === 2 ? option3 : option4}
                                                                    onChange={(e) => {
                                                                        if(idx === 0) setOption1(e.target.value);
                                                                        if(idx === 1) setOption2(e.target.value);
                                                                        if(idx === 2) setOption3(e.target.value);
                                                                        if(idx === 3) setOption4(e.target.value);
                                                                    }}
                                                                    className={`w-full p-2 border rounded text-xs bg-white text-slate-900 ${correctOption === idx ? 'border-green-500 ring-1 ring-green-500' : 'border-slate-300'}`}
                                                                />
                                                            ))}
                                                        </div>
                                                        <div className="flex items-center justify-between mb-4">
                                                            <label className="text-xs text-slate-600 font-bold">Correct Option:</label>
                                                            <select
                                                                value={correctOption}
                                                                onChange={(e) => setCorrectOption(Number(e.target.value))}
                                                                className="p-1.5 border border-slate-300 rounded text-xs bg-white text-slate-900"
                                                            >
                                                                <option value={0}>Option 1</option>
                                                                <option value={1}>Option 2</option>
                                                                <option value={2}>Option 3</option>
                                                                <option value={3}>Option 4</option>
                                                            </select>
                                                        </div>
                                                        <button
                                                            onClick={handleAddQuestion}
                                                            className="w-full py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 flex justify-center items-center"
                                                        >
                                                            <PlusCircle className="h-3 w-3 mr-1" /> Add Question to Quiz
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col h-full">
                                                    <div className="flex justify-between items-center mb-4">
                                                        <h4 className="font-bold text-slate-900">Quiz Questions ({quizQuestions.length})</h4>
                                                        <button
                                                            onClick={handleSaveQuiz}
                                                            disabled={quizQuestions.length === 0}
                                                            className="text-xs bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 font-bold flex items-center disabled:opacity-50"
                                                        >
                                                            <Save className="h-3 w-3 mr-1" /> Save Quiz
                                                        </button>
                                                    </div>
                                                    <div className="flex-1 bg-slate-50 rounded-lg border border-slate-200 p-4 overflow-y-auto max-h-[500px]">
                                                         {quizQuestions.length === 0 && (
                                                             <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                                                 <HelpCircle className="h-8 w-8 mb-2 opacity-50" />
                                                                 <p className="text-sm">No questions added yet</p>
                                                             </div>
                                                         )}
                                                         <div className="space-y-3">
                                                            {quizQuestions.map((q, idx) => (
                                                                <div key={q.id} className="bg-white p-3 rounded border border-slate-200 relative group">
                                                                    <button
                                                                        onClick={() => handleDeleteQuestion(idx)}
                                                                        className="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </button>
                                                                    <div className="flex gap-3">
                                                                        <span className="font-bold text-indigo-600 text-sm">{idx + 1}.</span>
                                                                        <div>
                                                                            <p className="font-medium text-sm text-slate-800 mb-2">{q.text}</p>
                                                                            <div className="grid grid-cols-2 gap-2">
                                                                                {q.options.map((opt, i) => (
                                                                                    <div key={i} className={`text-xs px-2 py-1 rounded border ${i === q.correctOptionIndex ? 'bg-green-50 border-green-200 text-green-700' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
                                                                                        {opt}
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                         </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl border-2 border-dashed border-slate-200 text-slate-400">
                                    <BookOpen className="h-10 w-10 mb-2 opacity-20" />
                                    <p>Select a class and chapter to manage content</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* === STUDENTS VIEW === */}
                    {activeView === 'STUDENTS' && (
                        <div className="animate-fade-in">
                            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                                <div className="p-4 md:p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                                    <h3 className="text-lg font-bold text-slate-900">Enrolled Students</h3>
                                    <div className="relative w-full sm:w-64">
                                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="Search students..."
                                            value={studentSearch}
                                            onChange={(e) => setStudentSearch(e.target.value)}
                                            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                                            <tr>
                                                <th className="px-4 md:px-6 py-3 font-medium">Student</th>
                                                <th className="px-4 md:px-6 py-3 font-medium hidden sm:table-cell">Progress</th>
                                                <th className="px-4 md:px-6 py-3 font-medium hidden md:table-cell">Last Active</th>
                                                <th className="px-4 md:px-6 py-3 font-medium text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {filteredStudents.map((student) => (
                                                <tr key={student.id} className="hover:bg-slate-50/50 transition">
                                                    <td className="px-4 md:px-6 py-4">
                                                        <div className="flex items-center">
                                                            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold mr-3 text-xs">
                                                                {student.name.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium text-slate-900">{student.name}</p>
                                                                <p className="text-xs text-slate-500">{student.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 md:px-6 py-4 hidden sm:table-cell">
                                                        <div className="flex items-center">
                                                            <div className="w-16 md:w-24 bg-slate-200 rounded-full h-1.5 mr-2">
                                                                <div
                                                                    className="bg-indigo-600 h-1.5 rounded-full"
                                                                    style={{ width: `${Math.min(100, Math.round((Object.keys(student.progress).length / totalTopics) * 100))}%` }}
                                                                ></div>
                                                            </div>
                                                            <span className="text-xs text-slate-600 font-medium">
                                                                {Object.keys(student.progress).length} topics
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 md:px-6 py-4 hidden md:table-cell">
                                                        <span className="text-sm text-slate-600">
                                                            {new Date(student.lastLogin).toLocaleDateString()}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 md:px-6 py-4 text-right">
                                                        <button
                                                            onClick={() => setViewingStudent(student)}
                                                            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                                                        >
                                                            View
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {filteredStudents.length === 0 && (
                                    <div className="p-8 text-center text-slate-500 text-sm">
                                        No students found matching your search.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                     {/* === COMMUNICATION VIEW === */}
                     {activeView === 'COMMUNICATION' && (
                         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 animate-fade-in">
                             {/* Announcements */}
                             <div className="bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col h-[600px]">
                                 <div className="p-4 md:p-6 border-b border-slate-100">
                                     <div className="flex items-center mb-4">
                                         <Megaphone className="h-5 w-5 text-amber-500 mr-2" />
                                         <h3 className="text-lg font-bold text-slate-900">Announcements</h3>
                                     </div>
                                     <form onSubmit={handlePostAnnouncement} className="flex gap-2">
                                         <input
                                            type="text"
                                            value={newAnnouncement}
                                            onChange={(e) => setNewAnnouncement(e.target.value)}
                                            placeholder="Post an update..."
                                            className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                                         />
                                         <button
                                            type="submit"
                                            disabled={!newAnnouncement.trim()}
                                            className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50"
                                         >
                                             <Send className="h-4 w-4" />
                                         </button>
                                     </form>
                                 </div>
                                 <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                     {announcements.map(item => (
                                         <div key={item.id} className="p-4 bg-amber-50 rounded-xl relative group border border-amber-100">
                                             <button
                                                onClick={() => handleDeleteAnnouncement(item.id)}
                                                className="absolute top-3 right-3 text-amber-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                                             >
                                                 <X className="h-4 w-4" />
                                             </button>
                                             <p className="text-slate-800 text-sm mb-2">{item.content}</p>
                                             <p className="text-xs text-slate-400">{new Date(item.date).toLocaleDateString()}</p>
                                         </div>
                                     ))}
                                     {announcements.length === 0 && <p className="text-center text-slate-400 text-sm mt-10">No announcements posted.</p>}
                                 </div>
                             </div>

                             {/* General Notes */}
                             <div className="bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col h-[600px]">
                                 <div className="p-4 md:p-6 border-b border-slate-100">
                                     <div className="flex items-center mb-4">
                                         <FileText className="h-5 w-5 text-blue-500 mr-2" />
                                         <h3 className="text-lg font-bold text-slate-900">General Notes</h3>
                                     </div>
                                     <form onSubmit={handleAddNote} className="space-y-3">
                                         <input
                                            type="text"
                                            placeholder="Title"
                                            value={noteTitle}
                                            onChange={(e) => setNoteTitle(e.target.value)}
                                            className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                         />
                                         <textarea
                                            placeholder="Content..."
                                            value={noteContent}
                                            onChange={(e) => setNoteContent(e.target.value)}
                                            className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-20"
                                         />
                                         <div className="flex gap-2">
                                             <select
                                                value={noteClass}
                                                onChange={(e) => setNoteClass(Number(e.target.value))}
                                                className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-900"
                                             >
                                                 <option value={11}>Class 11</option>
                                                 <option value={12}>Class 12</option>
                                             </select>
                                             <button
                                                type="submit"
                                                disabled={!noteTitle.trim() || !noteContent.trim()}
                                                className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
                                             >
                                                 Save Note
                                             </button>
                                         </div>
                                     </form>
                                 </div>
                                 <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                     {notes.filter(n => !n.chapterId).map(note => (
                                         <div key={note.id} className="p-4 bg-blue-50 rounded-xl relative group border border-blue-100">
                                              <button
                                                onClick={() => handleDeleteNote(note.id)}
                                                className="absolute top-3 right-3 text-blue-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                                             >
                                                 <X className="h-4 w-4" />
                                             </button>
                                             <div className="flex justify-between items-start pr-6 mb-1">
                                                 <h4 className="font-bold text-slate-800 text-sm">{note.title}</h4>
                                                 <span className="text-[10px] bg-white border border-blue-200 text-blue-600 px-1.5 py-0.5 rounded">Class {note.classLevel}</span>
                                             </div>
                                             <p className="text-slate-600 text-sm mb-2">{note.content}</p>
                                             <p className="text-xs text-slate-400">{new Date(note.date).toLocaleDateString()}</p>
                                         </div>
                                     ))}
                                     {notes.filter(n => !n.chapterId).length === 0 && <p className="text-center text-slate-400 text-sm mt-10">No notes available.</p>}
                                 </div>
                             </div>
                         </div>
                     )}

                </div>
            </main>
        </div>

        {/* Student Details Modal */}
        {viewingStudent && (
             <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog">
                <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                    <div className="fixed inset-0 bg-slate-900 bg-opacity-75 transition-opacity" onClick={() => setViewingStudent(null)}></div>
                    <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
                    <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
                        <div className="bg-white p-6">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center">
                                    <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xl mr-4">
                                        {viewingStudent.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900">{viewingStudent.name}</h3>
                                        <p className="text-sm text-slate-500">{viewingStudent.email}</p>
                                    </div>
                                </div>
                                <button onClick={() => setViewingStudent(null)} className="text-slate-400 hover:text-slate-500">
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                                        <p className="text-xs font-bold text-slate-500 uppercase mb-1">Chapters Access</p>
                                        <p className="text-2xl font-bold text-indigo-600">
                                            {/* Helper function to calculate total chapters */}
                                            {(() => {
                                                let count = viewingStudent.purchasedChapterIds.length;
                                                viewingStudent.purchasedCourseIds.forEach(courseId => {
                                                    const classLevel = courseId.includes('11') ? 11 : courseId.includes('12') ? 12 : null;
                                                    if (classLevel) {
                                                        count += chapters.filter(c => c.classLevel === classLevel).length;
                                                    }
                                                });
                                                return count;
                                            })()}
                                        </p>
                                    </div>
                                     <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                                        <p className="text-xs font-bold text-slate-500 uppercase mb-1">Topics Completed</p>
                                        <p className="text-2xl font-bold text-green-600">{Object.keys(viewingStudent.progress).length}</p>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-bold text-slate-900 mb-3 flex items-center">
                                        <BookOpen className="h-4 w-4 mr-2 text-indigo-500" /> Purchased Content
                                    </h4>
                                    <div className="max-h-48 overflow-y-auto bg-slate-50 rounded-lg p-3 border border-slate-100 space-y-2">
                                        {viewingStudent.purchasedCourseIds.length > 0 && (
                                            viewingStudent.purchasedCourseIds.map(cid => (
                                                <div key={cid} className="flex justify-between items-center bg-indigo-100 px-3 py-2 rounded-lg mb-2">
                                                    <span className="text-xs font-bold text-indigo-800">
                                                        Full Course Access
                                                    </span>
                                                    <span className="text-[10px] bg-white text-indigo-600 px-2 py-0.5 rounded-full font-bold border border-indigo-200">
                                                        {cid.includes('11') ? 'Class 11' : 'Class 12'}
                                                    </span>
                                                </div>
                                            ))
                                        )}
                                        {viewingStudent.purchasedChapterIds.length > 0 ? (
                                             viewingStudent.purchasedChapterIds.map(cid => {
                                                 const ch = chapters.find(c => c.id === cid);
                                                 return ch ? (
                                                     <div key={cid} className="text-xs text-slate-700 flex items-center justify-between p-2 bg-white rounded border border-slate-100 shadow-sm">
                                                         <div className="flex items-center">
                                                            <CheckCircle className="h-3 w-3 mr-2 text-green-500" />
                                                            <span className="font-medium">{ch.title}</span>
                                                         </div>
                                                         <span className="text-[10px] text-slate-400 font-semibold bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                                                             Class {ch.classLevel}
                                                         </span>
                                                     </div>
                                                 ) : null;
                                             })
                                        ) : (
                                            viewingStudent.purchasedCourseIds.length === 0 && <p className="text-xs text-slate-400 text-center py-4">No content purchased.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-slate-50 px-6 py-4 flex flex-row-reverse">
                            <button
                                onClick={() => setViewingStudent(null)}
                                className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 sm:ml-3 sm:w-auto sm:text-sm"
                            >
                                Close Details
                            </button>
                        </div>
                    </div>
                </div>
             </div>
        )}
    </div>
  );
};