import React, { useState } from 'react';
import { User, Course } from '../types';
import { CHAPTERS, COURSES } from '../constants';
import { updateUserDetails, changePassword } from '../services/dataService';
import { User as UserIcon, Mail, BookOpen, GraduationCap, Award, Calendar, CheckCircle, ArrowRight, Edit2, Save, X, KeyRound, ArrowLeft } from 'lucide-react';
import { PasswordChangeModal } from '../components/PasswordChangeModal';

interface StudentProfileProps {
  user: User;
  onNavigateHome: () => void;
  onUserUpdate: (user: User) => void;
}

export const StudentProfile: React.FC<StudentProfileProps> = ({ user, onNavigateHome, onUserUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [formData, setFormData] = useState({
      name: user.name,
      classLevel: user.classLevel || 12
  });

  const handleUpdate = (e: React.FormEvent) => {
      e.preventDefault();
      const updatedUser = updateUserDetails(user.id, {
          name: formData.name,
          classLevel: Number(formData.classLevel)
      });

      if (updatedUser) {
          onUserUpdate(updatedUser);
          setIsEditing(false);
      }
  };

  const handlePasswordChange = (oldPass: string, newPass: string) => {
      const result = changePassword(user.id, oldPass, newPass);
      if (result.success) {
          alert(result.message);
          setIsPasswordModalOpen(false);
      } else {
          alert("Error: " + result.message);
      }
  };

  // Calculate Stats
  const unlockedChaptersCount = user.purchasedChapterIds.length;

  // Get all unique chapter IDs the user has access to
  let accessChapterIds = new Set<string>(user.purchasedChapterIds);

  if (user.purchasedCourseIds.includes('phys-11-complete')) {
      CHAPTERS.filter(c => c.classLevel === 11).forEach(c => accessChapterIds.add(c.id));
  }
  if (user.purchasedCourseIds.includes('phys-12-complete')) {
      CHAPTERS.filter(c => c.classLevel === 12).forEach(c => accessChapterIds.add(c.id));
  }

  // Calculate total available topics in those chapters
  let totalTopicsAvailable = 0;
  accessChapterIds.forEach(cid => {
      const chapter = CHAPTERS.find(c => c.id === cid);
      if (chapter) {
          totalTopicsAvailable += chapter.topics.length;
      }
  });

  const completedCount = Object.keys(user.progress).length; // Progress is now topic IDs
  const completionRate = totalTopicsAvailable > 0 ? Math.round((completedCount / totalTopicsAvailable) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Back Button */}
        <div>
            <button
                onClick={onNavigateHome}
                className="flex items-center text-slate-600 hover:text-indigo-600 transition"
            >
                <ArrowLeft className="h-5 w-5 mr-2" /> Back to Dashboard
            </button>
        </div>

        {/* Header / Basic Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="h-32 bg-indigo-600 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-90"></div>
                <div className="absolute -bottom-12 left-8">
                    <div className="h-24 w-24 rounded-full bg-white p-1 shadow-lg">
                        <div className="h-full w-full rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                             <UserIcon className="h-12 w-12" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-16 pb-8 px-8">
                {isEditing ? (
                    <form onSubmit={handleUpdate} className="space-y-4 max-w-md">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Full Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm bg-white text-slate-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Class Level</label>
                            <select
                                value={formData.classLevel}
                                onChange={e => setFormData({...formData, classLevel: Number(e.target.value)})}
                                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm bg-white text-slate-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value={11}>Class 11</option>
                                <option value={12}>Class 12</option>
                            </select>
                        </div>
                        <div className="flex space-x-3 pt-2">
                             <button type="submit" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
                                <Save className="h-4 w-4 mr-2" /> Save Changes
                             </button>
                             <button type="button" onClick={() => setIsEditing(false)} className="inline-flex items-center px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50">
                                <X className="h-4 w-4 mr-2" /> Cancel
                             </button>
                        </div>
                    </form>
                ) : (
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 flex items-center">
                                {user.name}
                                {user.classLevel && <span className="ml-3 text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">Class {user.classLevel}</span>}
                            </h1>
                            <div className="flex items-center text-slate-500 mt-1">
                                <Mail className="h-4 w-4 mr-2" />
                                {user.email}
                            </div>
                            <div className="flex items-center text-slate-400 text-xs mt-2">
                                <Calendar className="h-3 w-3 mr-1.5" />
                                Joined {new Date().getFullYear()}
                            </div>
                        </div>
                        <div className="mt-6 md:mt-0 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                             <button onClick={() => setIsEditing(true)} className="inline-flex items-center px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 transition">
                                 <Edit2 className="h-4 w-4 mr-2" /> Edit Profile
                             </button>
                             <button onClick={() => setIsPasswordModalOpen(true)} className="inline-flex items-center px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 transition">
                                 <KeyRound className="h-4 w-4 mr-2" /> Reset Password
                             </button>
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <div className="flex items-center mb-4">
                    <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 mr-3">
                        <BookOpen className="h-6 w-6" />
                    </div>
                    <span className="text-sm font-bold text-slate-500 uppercase tracking-wide">Library Access</span>
                </div>
                <p className="text-3xl font-bold text-slate-900">{accessChapterIds.size}</p>
                <p className="text-xs text-slate-400 mt-1">Chapters Unlocked</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <div className="flex items-center mb-4">
                    <div className="p-2 bg-green-50 rounded-lg text-green-600 mr-3">
                        <CheckCircle className="h-6 w-6" />
                    </div>
                    <span className="text-sm font-bold text-slate-500 uppercase tracking-wide">Completed</span>
                </div>
                <p className="text-3xl font-bold text-slate-900">{completedCount}</p>
                <p className="text-xs text-slate-400 mt-1">Lessons Watched</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <div className="flex items-center mb-4">
                    <div className="p-2 bg-yellow-50 rounded-lg text-yellow-600 mr-3">
                        <Award className="h-6 w-6" />
                    </div>
                    <span className="text-sm font-bold text-slate-500 uppercase tracking-wide">Progress</span>
                </div>
                <p className="text-3xl font-bold text-slate-900">{completionRate}%</p>
                <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3">
                    <div className="bg-yellow-500 h-1.5 rounded-full" style={{ width: `${completionRate}%` }}></div>
                </div>
            </div>
        </div>

        {/* Purchased Courses */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Your Courses</h2>

            {user.purchasedCourseIds.length === 0 && user.purchasedChapterIds.length === 0 ? (
                <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    You haven't purchased any courses yet.
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Full Courses */}
                    {user.purchasedCourseIds.map(courseId => {
                         const course = Object.values(COURSES).find(c => c.id === courseId);
                         if (!course) return null;
                         return (
                             <div key={courseId} className="flex items-center p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                                 <div className="h-16 w-16 bg-indigo-200 rounded-lg flex-shrink-0 overflow-hidden mr-4">
                                     <img src={course.thumbnail} alt="" className="h-full w-full object-cover" />
                                 </div>
                                 <div className="flex-1">
                                     <h3 className="font-bold text-slate-900">{course.title}</h3>
                                     <span className="text-xs font-bold bg-indigo-200 text-indigo-800 px-2 py-0.5 rounded-full mt-1 inline-block">Full Course Access</span>
                                 </div>
                                 <div className="hidden sm:block">
                                      <button onClick={onNavigateHome} className="text-indigo-600 hover:text-indigo-800 font-medium text-sm">Resume Learning</button>
                                 </div>
                             </div>
                         )
                    })}

                    {/* Individual Chapters Summary */}
                    {user.purchasedChapterIds.length > 0 && (
                        <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                             <div className="flex items-center mb-2">
                                <BookOpen className="h-5 w-5 text-slate-400 mr-2" />
                                <h3 className="font-bold text-slate-900">Individual Chapters</h3>
                             </div>
                             <p className="text-sm text-slate-500 mb-3">You have access to {user.purchasedChapterIds.length} individual premium chapters.</p>
                             <div className="flex flex-wrap gap-2">
                                 {user.purchasedChapterIds.slice(0, 5).map(cid => {
                                     const ch = CHAPTERS.find(c => c.id === cid);
                                     return ch ? (
                                         <span key={cid} className="text-xs bg-white border border-slate-200 px-2 py-1 rounded text-slate-600">
                                             {ch.title.substring(0, 20)}...
                                         </span>
                                     ) : null
                                 })}
                                 {user.purchasedChapterIds.length > 5 && (
                                     <span className="text-xs bg-white border border-slate-200 px-2 py-1 rounded text-slate-500">
                                         +{user.purchasedChapterIds.length - 5} more
                                     </span>
                                 )}
                             </div>
                        </div>
                    )}
                </div>
            )}
        </div>

      </div>

      <PasswordChangeModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSubmit={handlePasswordChange}
      />
    </div>
  );
};