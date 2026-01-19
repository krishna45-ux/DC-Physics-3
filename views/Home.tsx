import React, { useState, useEffect } from 'react';
import { COURSES, FULL_COURSE_PRICE } from '../constants';
import { getTeacherProfile, getChapters } from '../services/dataService';
import { TeacherProfileData, Chapter } from '../types';
import { CheckCircle, PlayCircle, Star, BookOpen, List, ChevronDown, ChevronUp, Video, Infinity, TrendingUp, Award, Youtube, Linkedin, Twitter, Sparkles } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface HomeProps {
  onBuyCourse: (courseId: string) => void;
  onBuyChapter: (chapterId: string) => void;
}

export const Home: React.FC<HomeProps> = ({ onBuyCourse, onBuyChapter }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<11 | 12>(12);
  const [expandedChapterId, setExpandedChapterId] = useState<string | null>(null);
  const [teacherProfile, setTeacherProfile] = useState<TeacherProfileData | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);

  useEffect(() => {
    setTeacherProfile(getTeacherProfile());
    setChapters(getChapters());
  }, []);

  const filteredChapters = chapters.filter(c => c.classLevel === activeTab);
  const currentCourse = COURSES[activeTab];

  const toggleExpand = (id: string) => {
    setExpandedChapterId(expandedChapterId === id ? null : id);
  };

  if (!teacherProfile) return null; // or loading spinner

  return (
    <div className="flex flex-col min-h-screen bg-white transition-colors duration-200">
      {/* Hero Section */}
      <div className="bg-indigo-700 text-white py-12 md:py-20 relative overflow-hidden transition-colors duration-200">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-700 to-purple-800 opacity-90"></div>
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 md:w-96 md:h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-32 -left-20 w-72 h-72 md:w-96 md:h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col md:flex-row items-center">
                <div className="w-full md:w-1/2 text-left">
                    <span className="inline-block bg-indigo-500 bg-opacity-30 border border-indigo-400 rounded-full px-3 py-1 text-xs md:text-sm font-semibold mb-4 backdrop-blur-sm">
                    {t('hero_tagline')}
                    </span>

                    {/* Mobile Title + Image Layout */}
                    <div className="flex items-center justify-between md:block mb-4 md:mb-6">
                        <h1 className="text-3xl md:text-6xl font-extrabold tracking-tight leading-tight flex-1">
                            {t('hero_title_1')} <br/>
                            <span className="text-indigo-200">{t('hero_title_2')}</span>
                        </h1>

                        {/* Mobile Image - Small and to the right */}
                        <div className="md:hidden w-24 flex-shrink-0 ml-4 mt-1 transform rotate-3">
                            <div className="relative rounded-lg shadow-lg border-2 border-white/20 overflow-hidden aspect-[4/3]">
                                <img
                                    src="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=1000"
                                    alt="Physics Class"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    </div>

                    <p className="text-indigo-100 text-sm md:text-lg mb-8 max-w-lg leading-relaxed">
                    {t('hero_desc')}
                    </p>

                    <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4">
                        <button
                        onClick={() => onBuyCourse(currentCourse.id)}
                        className="w-full sm:w-auto bg-white text-indigo-700 font-bold py-3.5 px-8 rounded-xl shadow-xl hover:bg-indigo-50 transition transform hover:-translate-y-1 flex items-center justify-center text-sm md:text-base"
                        >
                            <Star className="w-5 h-5 mr-2 text-yellow-500" fill="currentColor" />
                            {t('hero_cta_full', { class: activeTab })} - ₹{FULL_COURSE_PRICE}
                        </button>
                        <button
                        onClick={() => document.getElementById('curriculum')?.scrollIntoView({ behavior: 'smooth'})}
                        className="w-full sm:w-auto bg-indigo-600/40 backdrop-blur-sm border border-indigo-300 text-white font-semibold py-3.5 px-8 rounded-xl hover:bg-indigo-600/60 transition flex items-center justify-center text-sm md:text-base"
                        >
                            {t('hero_cta_chapters')}
                        </button>
                    </div>
                </div>

                {/* Desktop Image (Hidden on Mobile) */}
                <div className="hidden md:flex md:w-1/2 justify-center pl-10">
                    <div className="relative w-full max-w-md transform rotate-2 hover:rotate-0 transition duration-500">
                        <div className="absolute -inset-4 bg-indigo-500 rounded-full opacity-30 blur-2xl animate-pulse"></div>
                        <img
                        src="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=1000"
                        alt="Physics Class"
                        className="relative rounded-2xl shadow-2xl border-4 border-indigo-400/30 w-full"
                        />
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Courses/Chapters Section */}
      <div id="curriculum" className="py-12 md:py-20 bg-slate-50 transition-colors duration-200">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">{t('curr_title')}</h2>
            <p className="text-slate-600 mt-3 text-sm md:text-lg">{t('curr_subtitle')}</p>

            {/* Class Toggle */}
            <div className="mt-6 md:mt-8 inline-flex bg-white p-1 rounded-xl shadow-sm border border-slate-200">
                <button
                    onClick={() => setActiveTab(11)}
                    className={`px-6 md:px-8 py-2 md:py-3 rounded-lg text-sm font-bold transition-all ${activeTab === 11 ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
                >
                    {t('curr_class_11')}
                </button>
                <button
                    onClick={() => setActiveTab(12)}
                    className={`px-6 md:px-8 py-2 md:py-3 rounded-lg text-sm font-bold transition-all ${activeTab === 12 ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
                >
                    {t('curr_class_12')}
                </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 md:gap-8">
            {/* Full Course Card */}
            {currentCourse && (
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-indigo-600 relative transform transition hover:scale-105 duration-300">
                <div className="absolute top-0 right-0 bg-yellow-400 text-slate-900 text-xs font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wide">
                    {t('curr_best_value')}
                </div>
                <div className="h-40 md:h-48 overflow-hidden relative">
                    <div className="absolute inset-0 bg-indigo-900 opacity-20 hover:opacity-10 transition"></div>
                    <img src={currentCourse.thumbnail} alt="Full Course" className="w-full h-full object-cover" />
                    <div className="absolute bottom-4 left-4">
                        <span className="bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs font-bold">Class {activeTab}</span>
                    </div>
                </div>
                <div className="p-5 md:p-6">
                    <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-2">{currentCourse.title}</h3>
                    <p className="text-slate-500 text-sm mb-6 line-clamp-2">{currentCourse.description}</p>
                    <ul className="space-y-2 mb-6">
                        <li className="flex items-center text-sm text-slate-700">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" /> All Chapters Included
                        </li>
                        <li className="flex items-center text-sm text-slate-700">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" /> Lifetime Access
                        </li>
                    </ul>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex flex-col">
                        <span className="text-sm text-slate-400 line-through">₹2999</span>
                        <span className="text-xl md:text-2xl font-bold text-indigo-700">₹{FULL_COURSE_PRICE}</span>
                    </div>
                    <button
                        onClick={() => onBuyCourse(currentCourse.id)}
                        className="bg-indigo-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition text-sm md:text-base"
                    >
                        {t('curr_buy_full')}
                    </button>
                    </div>
                </div>
                </div>
            )}

            {/* Individual Chapters */}
            {filteredChapters.map((chapter) => (
              <div key={chapter.id} className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100 hover:shadow-xl transition group flex flex-col h-full">
                <div className="p-4 md:p-6 flex-1 flex flex-col">
                  <div className="flex items-start justify-between mb-3 md:mb-4">
                    <div className="p-2 md:p-3 bg-indigo-50 rounded-xl group-hover:bg-indigo-100 transition">
                      <BookOpen className="h-5 w-5 md:h-6 md:w-6 text-indigo-600" />
                    </div>
                    <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded">
                        Class {chapter.classLevel}
                    </span>
                  </div>
                  <h3 className="text-base md:text-lg font-bold text-slate-900 mb-2 group-hover:text-indigo-700 transition">{chapter.title}</h3>

                  {/* Expanded description with toggle */}
                  <div className={`text-slate-500 text-sm mb-2 transition-all duration-300 ${expandedChapterId === chapter.id ? '' : 'line-clamp-2 min-h-[40px]'}`}>
                      {chapter.description}
                  </div>

                  <button
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(chapter.id);
                    }}
                    className="text-indigo-600 text-xs font-semibold hover:text-indigo-800 mb-4 flex items-center focus:outline-none"
                  >
                      {expandedChapterId === chapter.id ? (
                          <>Show Less <ChevronUp className="h-3 w-3 ml-1" /></>
                      ) : (
                          <>More Details <ChevronDown className="h-3 w-3 ml-1" /></>
                      )}
                  </button>

                  {/* Sub-topics Preview */}
                  {chapter.topics && chapter.topics.length > 0 && (
                      <div className="mb-4 bg-slate-50 p-3 rounded-lg flex-1">
                          <p className="text-xs font-semibold text-slate-700 mb-2 flex items-center">
                              <List className="h-3 w-3 mr-1" /> {t('curr_key_topics')}:
                          </p>
                          <ul className="text-xs text-slate-500 space-y-1">
                              {chapter.topics.slice(0, expandedChapterId === chapter.id ? 10 : 3).map((topic, i) => (
                                  <li key={i} className="flex items-start">
                                      <span className="mr-1.5">•</span> {topic.title}
                                  </li>
                              ))}
                              {chapter.topics.length > 3 && expandedChapterId !== chapter.id && (
                                  <li className="text-indigo-500 italic pl-2">+ {chapter.topics.length - 3} more</li>
                              )}
                          </ul>
                      </div>
                  )}

                  <div className="flex items-center text-sm text-slate-500 mb-4 md:mb-6 mt-auto">
                      <PlayCircle className="h-4 w-4 mr-1" /> {chapter.duration}
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-lg md:text-xl font-bold text-slate-900 whitespace-nowrap">₹{chapter.price}</span>
                            <button
                            onClick={() => onBuyChapter(chapter.id)}
                            className="text-indigo-600 border border-indigo-200 bg-indigo-50 px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-medium hover:bg-indigo-600 hover:text-white transition text-sm flex-shrink-0"
                            >
                            {t('curr_buy_chapter')}
                            </button>
                        </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Meet Your Instructor Section (Redesigned) */}
      <div id="about" className="py-16 md:py-24 bg-white transition-colors duration-200">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-12">
               <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">Meet Your Instructor</h2>
               <p className="text-slate-500 mt-2">Learn from the best in the field</p>
          </div>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-12">
                  <div className="relative w-full md:w-5/12">
                       <div className="rounded-3xl overflow-hidden shadow-2xl relative bg-slate-100 aspect-[4/5] md:aspect-auto md:h-[450px]">
                           <img
                            src={teacherProfile.image}
                            alt={teacherProfile.name}
                            className="w-full h-full object-cover"
                           />
                       </div>
                       {/* Floating Badge */}
                       <div className="absolute -bottom-6 -right-6 md:bottom-8 md:-right-12 bg-purple-600 text-white p-6 rounded-2xl shadow-xl max-w-[200px] text-left">
                           <span className="block text-4xl font-extrabold mb-1">15+</span>
                           <span className="text-sm font-medium text-purple-100 leading-tight">Years Experience</span>
                       </div>
                  </div>

                  <div className="w-full md:w-6/12 pt-4 md:pl-8 text-center md:text-left">
                      <h3 className="text-3xl font-extrabold text-slate-900 mb-2">{teacherProfile.name}</h3>
                      <p className="text-purple-600 font-bold text-lg mb-6">{teacherProfile.qualifications}</p>

                      <p className="text-slate-600 text-lg leading-relaxed mb-8">
                          {teacherProfile.bio} With a unique teaching methodology that simplifies complex physics concepts, Dr. Kumar has helped thousands of students achieve their academic goals and crack competitive exams like JEE and NEET.
                      </p>

                      <div className="flex flex-row gap-4 mb-8 justify-center md:justify-start">
                          <div className="bg-purple-50 rounded-xl p-5 w-1/2 text-left border border-purple-100">
                               <span className="block text-2xl md:text-3xl font-extrabold text-purple-700 mb-1">10,000+</span>
                               <span className="text-sm text-slate-600 font-medium">Students Taught</span>
                          </div>
                          <div className="bg-purple-50 rounded-xl p-5 w-1/2 text-left border border-purple-100">
                               <span className="block text-2xl md:text-3xl font-extrabold text-purple-700 mb-1">500+</span>
                               <span className="text-sm text-slate-600 font-medium">Video Lectures</span>
                          </div>
                      </div>

                      <div className="flex space-x-4 justify-center md:justify-start">
                          <a href="#" className="p-2 bg-slate-100 rounded-lg text-red-600 hover:bg-red-50 transition"><Youtube className="h-6 w-6" /></a>
                          <a href="#" className="p-2 bg-slate-100 rounded-lg text-blue-400 hover:bg-blue-50 transition"><Twitter className="h-6 w-6" /></a>
                          <a href="#" className="p-2 bg-slate-100 rounded-lg text-blue-700 hover:bg-blue-50 transition"><Linkedin className="h-6 w-6" /></a>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      {/* Why Choose Section (New) */}
      <div className="py-16 md:py-24 bg-slate-50 transition-colors duration-200">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                  <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">Why Choose {t('app_name')}?</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {/* Card 1 */}
                  <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition text-center border border-slate-100">
                       <div className="w-16 h-16 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-6">
                           <Video className="h-8 w-8 text-purple-600" />
                       </div>
                       <h3 className="font-bold text-lg text-slate-900 mb-3">HD Video Lectures</h3>
                       <p className="text-slate-500 text-sm leading-relaxed">Crystal clear video quality for better learning experience.</p>
                  </div>

                  {/* Card 2 */}
                  <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition text-center border border-slate-100">
                       <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
                           <Infinity className="h-8 w-8 text-green-600" />
                       </div>
                       <h3 className="font-bold text-lg text-slate-900 mb-3">Lifetime Access</h3>
                       <p className="text-slate-500 text-sm leading-relaxed">Watch anytime, anywhere, forever with a single purchase.</p>
                  </div>

                  {/* Card 3 */}
                  <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition text-center border border-slate-100">
                       <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-6">
                           <TrendingUp className="h-8 w-8 text-blue-600" />
                       </div>
                       <h3 className="font-bold text-lg text-slate-900 mb-3">Track Progress</h3>
                       <p className="text-slate-500 text-sm leading-relaxed">Monitor your learning journey with detailed analytics.</p>
                  </div>

                  {/* Card 4 */}
                  <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition text-center border border-slate-100">
                       <div className="w-16 h-16 mx-auto bg-yellow-100 rounded-full flex items-center justify-center mb-6">
                           <Award className="h-8 w-8 text-yellow-600" />
                       </div>
                       <h3 className="font-bold text-lg text-slate-900 mb-3">Certificate</h3>
                       <p className="text-slate-500 text-sm leading-relaxed">Get certified on course completion to showcase skills.</p>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};