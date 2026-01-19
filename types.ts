
export enum UserRole {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER'
}

export interface QuizResult {
  score: number;
  totalQuestions: number;
  passed: boolean;
  date: string;
}

export interface Bookmark {
  id: string;
  chapterId: string;
  timestamp: number; // in seconds
  note: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password?: string; // Added for auth
  isVerified?: boolean; // Added for email verification
  avatar?: string;
  classLevel?: number; // 11 or 12
  sessionToken?: string; // Unique token for single session enforcement
  purchasedChapterIds: string[]; // IDs of chapters bought
  purchasedCourseIds: string[]; // IDs of full courses bought (e.g., 'phys-11-complete', 'phys-12-complete')
  progress: Record<string, boolean>; // topicId -> isWatched (Changed from chapterId)
  quizAttempts: Record<string, QuizResult>; // chapterId -> QuizResult
  bookmarks?: Bookmark[]; // Array of bookmarks
  lastLogin: string;
}

export interface TeacherProfileData {
  name: string;
  bio: string;
  image: string;
  qualifications: string;
  experience: string;
  studentsCount: string;
  lecturesCount: string;
  rating: string;
}

export interface Topic {
  id: string;
  title: string;
  videoUrl: string; // YouTube ID
  duration: string;
}

export interface Chapter {
  id: string;
  title: string;
  description: string;
  price: number;
  // videoUrl removed, now inside topics
  duration: string; // Total duration
  classLevel: number; // 11 or 12
  topics: Topic[]; // Replaces subTopics
}

export interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  thumbnail: string;
  teacherName: string;
}

export interface Announcement {
  id: string;
  content: string;
  date: string;
  authorName: string;
}

export interface Note {
  id: string;
  title: string;
  content?: string; // Text content
  url?: string; // URL for PDF
  type: 'TEXT' | 'PDF';
  classLevel: number; // 11 or 12
  chapterId?: string; // Optional: Link note to a specific chapter
  date: string;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctOptionIndex: number;
}

export interface Quiz {
  id: string;
  chapterId: string;
  questions: Question[];
}

export type ViewState = 'HOME' | 'LOGIN' | 'STUDENT_DASHBOARD' | 'TEACHER_DASHBOARD' | 'STUDENT_PROFILE' | 'TEACHER_PROFILE';
