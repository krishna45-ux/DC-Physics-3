import React, { useState, useEffect } from 'react';
import { TeacherProfileData, User } from '../types';
import { getTeacherProfile, updateTeacherProfile, changePassword } from '../services/dataService';
import { User as UserIcon, Save, Edit2, ArrowRight, LayoutDashboard, X, Briefcase, Award, ArrowLeft, KeyRound } from 'lucide-react';
import { PasswordChangeModal } from '../components/PasswordChangeModal';

interface TeacherProfileProps {
  user: User;
  onNavigateDashboard: () => void;
  onUserUpdate: (user: User) => void;
}

export const TeacherProfile: React.FC<TeacherProfileProps> = ({ user, onNavigateDashboard, onUserUpdate }) => {
  const [profile, setProfile] = useState<TeacherProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [formData, setFormData] = useState<TeacherProfileData | null>(null);

  useEffect(() => {
    const data = getTeacherProfile();
    setProfile(data);
    setFormData(data);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData) {
      updateTeacherProfile(formData);
      setProfile(formData);
      setIsEditing(false);

      // Update global user state
      const updatedUser = { ...user, name: formData.name };
      onUserUpdate(updatedUser);
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

  if (!profile || !formData) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Back Button */}
        <div>
            <button
                onClick={onNavigateDashboard}
                className="flex items-center text-slate-600 hover:text-indigo-600 transition"
            >
                <ArrowLeft className="h-5 w-5 mr-2" /> Back to Dashboard
            </button>
        </div>

        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="h-32 bg-indigo-600 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-90"></div>
                <div className="absolute -bottom-12 left-8">
                    <div className="h-24 w-24 rounded-full bg-white p-1 shadow-lg overflow-hidden">
                        <img src={profile.image} alt={profile.name} className="h-full w-full object-cover rounded-full" />
                    </div>
                </div>
            </div>

            <div className="pt-16 pb-8 px-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 flex items-center">
                            {profile.name}
                        </h1>
                        <p className="text-indigo-600 font-medium text-sm mt-1">
                            {profile.qualifications}
                        </p>
                    </div>
                    <div className="mt-6 md:mt-0 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                         {!isEditing && (
                            <>
                                <button onClick={() => setIsEditing(true)} className="inline-flex items-center px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 transition">
                                    <Edit2 className="h-4 w-4 mr-2" /> Edit Public Profile
                                </button>
                                <button onClick={() => setIsPasswordModalOpen(true)} className="inline-flex items-center px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 transition">
                                    <KeyRound className="h-4 w-4 mr-2" /> Reset Password
                                </button>
                            </>
                         )}
                    </div>
                </div>
            </div>
        </div>

        {/* Content Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
            <div className="flex items-center mb-6">
                <LayoutDashboard className="h-6 w-6 text-indigo-600 mr-2" />
                <h2 className="text-xl font-bold text-slate-900">Profile Details</h2>
                <span className="ml-3 text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">Visible on Home Page</span>
            </div>

            {isEditing ? (
                <form onSubmit={handleSave} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white text-slate-900"
                            />
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-slate-700 mb-1">Profile Image URL</label>
                             <input
                                type="text"
                                value={formData.image}
                                onChange={(e) => setFormData({...formData, image: e.target.value})}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white text-slate-900"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Qualifications</label>
                            <input
                                type="text"
                                value={formData.qualifications}
                                onChange={(e) => setFormData({...formData, qualifications: e.target.value})}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white text-slate-900"
                                placeholder="e.g. B.Tech (IIT), M.Sc Physics"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Experience</label>
                            <input
                                type="text"
                                value={formData.experience}
                                onChange={(e) => setFormData({...formData, experience: e.target.value})}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white text-slate-900"
                                placeholder="e.g. 15+ Years"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Biography</label>
                        <textarea
                            rows={4}
                            value={formData.bio}
                            onChange={(e) => setFormData({...formData, bio: e.target.value})}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white text-slate-900"
                            placeholder="Tell students about yourself..."
                        />
                    </div>

                    <div className="border-t border-slate-100 pt-6">
                        <h3 className="text-sm font-bold text-slate-900 mb-4">Achievements & Stats</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                             <div>
                                <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Students Taught</label>
                                <input
                                    type="text"
                                    value={formData.studentsCount}
                                    onChange={(e) => setFormData({...formData, studentsCount: e.target.value})}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Lectures</label>
                                <input
                                    type="text"
                                    value={formData.lecturesCount}
                                    onChange={(e) => setFormData({...formData, lecturesCount: e.target.value})}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Rating</label>
                                <input
                                    type="text"
                                    value={formData.rating}
                                    onChange={(e) => setFormData({...formData, rating: e.target.value})}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={() => {
                                setIsEditing(false);
                                setFormData(profile); // Reset changes
                            }}
                            className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-sm flex items-center"
                        >
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                        </button>
                    </div>
                </form>
            ) : (
                <div className="space-y-6">
                     <div className="prose max-w-none text-slate-600">
                        <h3 className="text-sm font-bold text-slate-900 mb-2">About</h3>
                        <p>{profile.bio}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                        <div className="flex items-start">
                            <div className="bg-blue-50 p-2 rounded-lg text-blue-600 mr-3">
                                <Award className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-slate-900">Qualifications</h4>
                                <p className="text-sm text-slate-600">{profile.qualifications}</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <div className="bg-green-50 p-2 rounded-lg text-green-600 mr-3">
                                <Briefcase className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-slate-900">Experience</h4>
                                <p className="text-sm text-slate-600">{profile.experience}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-center">
                        <div className="bg-slate-50 p-3 rounded-lg">
                            <span className="block text-lg font-bold text-slate-900">{profile.studentsCount}</span>
                            <span className="text-xs text-slate-500 uppercase">Students</span>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-lg">
                            <span className="block text-lg font-bold text-slate-900">{profile.lecturesCount}</span>
                            <span className="text-xs text-slate-500 uppercase">Lectures</span>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-lg">
                            <span className="block text-lg font-bold text-slate-900">{profile.rating}</span>
                            <span className="text-xs text-slate-500 uppercase">Rating</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
        <PasswordChangeModal
            isOpen={isPasswordModalOpen}
            onClose={() => setIsPasswordModalOpen(false)}
            onSubmit={handlePasswordChange}
        />
      </div>
    </div>
  );
};