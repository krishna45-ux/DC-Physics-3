import { User, UserRole, Announcement, Note, TeacherProfileData, Quiz, Question, QuizResult, Chapter, Bookmark } from '../types';
import { MOCK_STUDENTS, MOCK_TEACHER, CHAPTERS as INITIAL_CHAPTERS } from '../constants';

const STORAGE_KEY_USER = 'physics_app_current_user';
const STORAGE_KEY_STUDENTS = 'physics_app_students';
const STORAGE_KEY_ANNOUNCEMENTS = 'physics_app_announcements';
const STORAGE_KEY_NOTES = 'physics_app_notes';
const STORAGE_KEY_TEACHER_PROFILE = 'physics_app_teacher_profile';
const STORAGE_KEY_TEACHER_AUTH = 'physics_app_teacher_auth'; // New key for teacher auth
const STORAGE_KEY_QUIZZES = 'physics_app_quizzes';
const STORAGE_KEY_CHAPTERS = 'physics_app_chapters';
const STORAGE_KEY_VERIFICATION_CODES = 'physics_app_verification_codes';

const DEFAULT_TEACHER_PROFILE: TeacherProfileData = {
  name: "Mr. R.K. Sharma",
  bio: "Ex-IIT Delhi Alumni with 15+ years of teaching experience. Helped over 5000+ students crack JEE & NEET.",
  image: "https://picsum.photos/id/1/200/200",
  qualifications: "B.Tech (IIT Delhi), M.Sc Physics",
  experience: "15+ Years",
  studentsCount: "5k+",
  lecturesCount: "1000+",
  rating: "4.9"
};

// Explicit Teacher Credentials
const TEACHER_EMAIL = "thef94089@gmail.com";
const TEACHER_PASSWORD = "krish@1234";

// Initialize mock database if empty
const initDB = () => {
  if (!localStorage.getItem(STORAGE_KEY_STUDENTS)) {
    // Add default passwords to mock students for testing
    const studentsWithPass = MOCK_STUDENTS.map(s => ({...s, password: 'password123', isVerified: true}));
    localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(studentsWithPass));
  }
  if (!localStorage.getItem(STORAGE_KEY_ANNOUNCEMENTS)) {
      const initialAnnouncements: Announcement[] = [
          {
              id: 'a1',
              content: 'Welcome to the new academic session! Check out the new Thermodynamics lectures.',
              date: new Date(Date.now() - 86400000).toISOString(),
              authorName: MOCK_TEACHER.name
          }
      ];
      localStorage.setItem(STORAGE_KEY_ANNOUNCEMENTS, JSON.stringify(initialAnnouncements));
  }
  if (!localStorage.getItem(STORAGE_KEY_NOTES)) {
      const initialNotes: Note[] = [
          {
              id: 'n1',
              title: 'Electrostatics Important Formulas',
              content: 'Remember that F = k * q1 * q2 / r^2. Review the superposition principle for upcoming tests.',
              type: 'TEXT',
              classLevel: 12,
              date: new Date(Date.now() - 172800000).toISOString()
          },
          {
              id: 'n2',
              title: 'Kinematics Cheat Sheet',
              content: 'v = u + at, s = ut + 0.5at^2, v^2 = u^2 + 2as. Apply these only for constant acceleration.',
              type: 'TEXT',
              classLevel: 11,
              date: new Date(Date.now() - 86400000).toISOString()
          }
      ];
      localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(initialNotes));
  }
  if (!localStorage.getItem(STORAGE_KEY_QUIZZES)) {
      localStorage.setItem(STORAGE_KEY_QUIZZES, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEY_CHAPTERS)) {
      localStorage.setItem(STORAGE_KEY_CHAPTERS, JSON.stringify(INITIAL_CHAPTERS));
  }
};

// --- AUTHENTICATION SERVICES ---

export const sendVerificationCode = (email: string): string => {
    // Simulate sending email
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Store code with expiration (10 mins)
    const codes = JSON.parse(localStorage.getItem(STORAGE_KEY_VERIFICATION_CODES) || '{}');
    codes[email] = { code, expiresAt: Date.now() + 10 * 60 * 1000 };
    localStorage.setItem(STORAGE_KEY_VERIFICATION_CODES, JSON.stringify(codes));

    // In a real app, this calls an API. Here we alert.
    setTimeout(() => {
        alert(`[Email Simulation]\nTo: ${email}\nSubject: Verify your email\n\nYour verification code is: ${code}`);
    }, 500);

    return code;
};

export const verifyUserEmail = (email: string, code: string): boolean => {
    const codes = JSON.parse(localStorage.getItem(STORAGE_KEY_VERIFICATION_CODES) || '{}');
    const record = codes[email];

    if (!record) return false;
    if (Date.now() > record.expiresAt) return false;
    if (record.code !== code) return false;

    // Verify user in DB
    const students = getStudents();
    const index = students.findIndex(s => s.email === email);
    if (index > -1) {
        students[index].isVerified = true;
        localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));

        // Clean up code
        delete codes[email];
        localStorage.setItem(STORAGE_KEY_VERIFICATION_CODES, JSON.stringify(codes));
        return true;
    }
    return false;
};

export const registerStudent = (name: string, email: string, password: string): { success: boolean, message: string } => {
    initDB();
    const students = getStudents();

    if (students.some(s => s.email === email)) {
        return { success: false, message: "Email already registered." };
    }

    const newStudent: User = {
        id: `s${Date.now()}`,
        name,
        email,
        password, // In production, hash this!
        role: UserRole.STUDENT,
        isVerified: false,
        purchasedChapterIds: [],
        purchasedCourseIds: [],
        progress: {},
        quizAttempts: {},
        bookmarks: [],
        lastLogin: new Date().toISOString()
    };

    students.push(newStudent);
    localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));

    sendVerificationCode(email);
    return { success: true, message: "Registration successful. Please verify your email." };
};

export const loginUser = (email: string, role: UserRole, password?: string): { user: User | null, error?: string } => {
  initDB();

  if (role === UserRole.TEACHER) {
    // Check if there is a stored teacher password overriding the default
    const storedAuthStr = localStorage.getItem(STORAGE_KEY_TEACHER_AUTH);
    const auth = storedAuthStr ? JSON.parse(storedAuthStr) : { email: TEACHER_EMAIL, password: TEACHER_PASSWORD };

    if (email === auth.email && password === auth.password) {
      // Ensure we use the latest name from profile if it exists
      const profile = getTeacherProfile();
      const teacherUser = {
          ...MOCK_TEACHER,
          email: auth.email,
          name: profile.name,
          isVerified: true
      };
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(teacherUser));
      return { user: teacherUser };
    } else {
        return { user: null, error: "Invalid Teacher Credentials" };
    }
  } else {
    // Student Login
    const students = getStudents();
    const student = students.find(s => s.email === email);

    if (!student) {
        return { user: null, error: "Account not found. Please sign up." };
    }

    if (password && student.password && student.password !== password) {
        return { user: null, error: "Incorrect password." };
    }

    if (!student.isVerified) {
        // Resend code if trying to login but not verified
        sendVerificationCode(email);
        return { user: null, error: "NOT_VERIFIED" };
    }

    const sessionToken = Date.now().toString() + Math.random().toString(36).substring(2);

    // Update last login and session token
    student.lastLogin = new Date().toISOString();
    student.sessionToken = sessionToken;

    const updatedStudents = students.map(s => s.id === student!.id ? student! : s);
    localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(updatedStudents));

    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(student));
    return { user: student };
  }
};

export const changePassword = (userId: string, oldPassword: string, newPassword: string): { success: boolean, message: string } => {
    initDB();

    // Check if Teacher
    if (userId === MOCK_TEACHER.id) {
        const storedAuthStr = localStorage.getItem(STORAGE_KEY_TEACHER_AUTH);
        const auth = storedAuthStr ? JSON.parse(storedAuthStr) : { email: TEACHER_EMAIL, password: TEACHER_PASSWORD };

        if (auth.password !== oldPassword) {
            return { success: false, message: "Incorrect old password." };
        }

        auth.password = newPassword;
        localStorage.setItem(STORAGE_KEY_TEACHER_AUTH, JSON.stringify(auth));
        return { success: true, message: "Password updated successfully." };
    }

    // Check Students
    const students = getStudents();
    const studentIndex = students.findIndex(s => s.id === userId);

    if (studentIndex > -1) {
        if (students[studentIndex].password !== oldPassword) {
             return { success: false, message: "Incorrect old password." };
        }
        students[studentIndex].password = newPassword;
        localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));

        return { success: true, message: "Password updated successfully." };
    }

    return { success: false, message: "User not found." };
};

export const resetUserPassword = (email: string): { success: boolean, message: string, newPassword?: string } => {
    initDB();
    const students = getStudents();
    const studentIndex = students.findIndex(s => s.email === email);

    // Generate a random 8-character password
    const newPass = Math.random().toString(36).slice(-8);

    if (studentIndex > -1) {
        students[studentIndex].password = newPass;
        localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));
        return { success: true, message: 'Password reset successful', newPassword: newPass };
    }

    // Check teacher
    const storedAuthStr = localStorage.getItem(STORAGE_KEY_TEACHER_AUTH);
    const auth = storedAuthStr ? JSON.parse(storedAuthStr) : { email: TEACHER_EMAIL, password: TEACHER_PASSWORD };

    if (auth.email === email) {
         auth.password = newPass;
         localStorage.setItem(STORAGE_KEY_TEACHER_AUTH, JSON.stringify(auth));
         return { success: true, message: 'Password reset successful', newPassword: newPass };
    }

    return { success: false, message: 'Email address not found in our records.' };
};

export const logoutUser = () => {
  // Clear the session token in the mock DB so the user can log in again later
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.role === UserRole.STUDENT) {
      const students = getStudents();
      const index = students.findIndex(s => s.id === currentUser.id);
      if (index > -1) {
          students[index].sessionToken = undefined;
          localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));
      }
  }
  localStorage.removeItem(STORAGE_KEY_USER);
};

export const getCurrentUser = (): User | null => {
  const u = localStorage.getItem(STORAGE_KEY_USER);
  return u ? JSON.parse(u) : null;
};

export const getStudents = (): User[] => {
  initDB();
  const s = localStorage.getItem(STORAGE_KEY_STUDENTS);
  if (!s) return [];

  try {
      const students = JSON.parse(s);
      if (!Array.isArray(students)) return [];

      // Auto-migrate legacy data structure (add missing passwords and verification status)
      return students.map((std: any) => ({
          ...std,
          password: std.password || 'password123',
          isVerified: std.isVerified !== undefined ? std.isVerified : true,
          role: std.role || UserRole.STUDENT,
          purchasedChapterIds: std.purchasedChapterIds || [],
          purchasedCourseIds: std.purchasedCourseIds || [],
          progress: std.progress || {},
          quizAttempts: std.quizAttempts || {},
          bookmarks: std.bookmarks || []
      }));
  } catch (e) {
      console.error("Error parsing students data", e);
      return [];
  }
};

export const checkActiveSession = (email: string): boolean => {
    const students = getStudents();
    const student = students.find(s => s.email === email);
    // Consider a session active if it has a token and was used within the last 30 minutes
    if (student && student.sessionToken) {
        const lastLoginTime = new Date(student.lastLogin).getTime();
        const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000;
        if (lastLoginTime > thirtyMinutesAgo) {
            return true;
        }
    }
    return false;
};

export const validateSession = (userId: string, sessionToken: string): boolean => {
    // Teachers skip session checks in this mock
    if (userId === MOCK_TEACHER.id) return true;

    const students = getStudents();
    const student = students.find(s => s.id === userId);
    if (!student) return false;

    // If no token exists in DB, session is invalid (means user logged out elsewhere or data cleared)
    if (!student.sessionToken) return false;

    // Tokens must match
    return student.sessionToken === sessionToken;
};

export const updateUserDetails = (userId: string, updates: Partial<User>): User | null => {
    const students = getStudents();
    const index = students.findIndex(s => s.id === userId);

    if (index > -1) {
        // Update student in list
        students[index] = { ...students[index], ...updates };
        localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));

        // Update current session if applicable
        const currentUser = getCurrentUser();
        if (currentUser && currentUser.id === userId) {
            const updatedUser = { ...currentUser, ...updates };
            localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updatedUser));
            return updatedUser;
        }
    }
    return null;
};

export const purchaseCourse = (userId: string, type: 'COURSE' | 'CHAPTER', itemId?: string) => {
  const students = getStudents();
  const studentIndex = students.findIndex(s => s.id === userId);

  if (studentIndex > -1) {
    if (type === 'COURSE' && itemId) {
      if (!students[studentIndex].purchasedCourseIds.includes(itemId)) {
        students[studentIndex].purchasedCourseIds.push(itemId);
      }
    } else if (type === 'CHAPTER' && itemId) {
      if (!students[studentIndex].purchasedChapterIds.includes(itemId)) {
        students[studentIndex].purchasedChapterIds.push(itemId);
      }
    }
    localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));

    // Update current session if it matches
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      const updatedUser = students[studentIndex];
      // Preserve session token
      updatedUser.sessionToken = currentUser.sessionToken;
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updatedUser));
      return updatedUser;
    }
  }
  return null;
};

export const updateProgress = (userId: string, topicId: string) => {
    const students = getStudents();
    const studentIndex = students.findIndex(s => s.id === userId);

    if (studentIndex > -1) {
        students[studentIndex].progress = {
            ...students[studentIndex].progress,
            [topicId]: true
        };
        localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));

        const currentUser = getCurrentUser();
        if (currentUser && currentUser.id === userId) {
            const updatedUser = students[studentIndex];
            // Preserve session token
            updatedUser.sessionToken = currentUser.sessionToken;
            localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updatedUser));
            return updatedUser;
        }
    }
    return null;
};

// Bookmark Services
export const addBookmark = (userId: string, chapterId: string, timestamp: number, note: string) => {
    const students = getStudents();
    const studentIndex = students.findIndex(s => s.id === userId);

    if (studentIndex > -1) {
        const newBookmark: Bookmark = {
            id: `bm-${Date.now()}`,
            chapterId,
            timestamp,
            note,
            createdAt: new Date().toISOString()
        };

        const currentBookmarks = students[studentIndex].bookmarks || [];
        students[studentIndex].bookmarks = [...currentBookmarks, newBookmark];

        localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));

        const currentUser = getCurrentUser();
        if (currentUser && currentUser.id === userId) {
            const updatedUser = students[studentIndex];
            updatedUser.sessionToken = currentUser.sessionToken;
            localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updatedUser));
            return updatedUser;
        }
    }
    return null;
};

export const deleteBookmark = (userId: string, bookmarkId: string) => {
    const students = getStudents();
    const studentIndex = students.findIndex(s => s.id === userId);

    if (studentIndex > -1) {
        const currentBookmarks = students[studentIndex].bookmarks || [];
        students[studentIndex].bookmarks = currentBookmarks.filter(b => b.id !== bookmarkId);

        localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));

        const currentUser = getCurrentUser();
        if (currentUser && currentUser.id === userId) {
            const updatedUser = students[studentIndex];
            updatedUser.sessionToken = currentUser.sessionToken;
            localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updatedUser));
            return updatedUser;
        }
    }
    return null;
};


export const getAnnouncements = (): Announcement[] => {
    initDB();
    const a = localStorage.getItem(STORAGE_KEY_ANNOUNCEMENTS);
    return a ? JSON.parse(a) : [];
};

export const addAnnouncement = (content: string, authorName: string) => {
    const announcements = getAnnouncements();
    const newAnnouncement: Announcement = {
        id: `ann-${Date.now()}`,
        content,
        date: new Date().toISOString(),
        authorName
    };
    // Add to beginning
    const updated = [newAnnouncement, ...announcements];
    localStorage.setItem(STORAGE_KEY_ANNOUNCEMENTS, JSON.stringify(updated));
    return updated;
};

export const deleteAnnouncement = (id: string) => {
    const announcements = getAnnouncements();
    const updated = announcements.filter(a => a.id !== id);
    localStorage.setItem(STORAGE_KEY_ANNOUNCEMENTS, JSON.stringify(updated));
    return updated;
};

export const getNotes = (): Note[] => {
    initDB();
    const n = localStorage.getItem(STORAGE_KEY_NOTES);
    return n ? JSON.parse(n) : [];
};

export const addNote = (title: string, content: string, classLevel: number, chapterId?: string, type: 'TEXT' | 'PDF' = 'TEXT', url?: string) => {
    const notes = getNotes();
    const newNote: Note = {
        id: `note-${Date.now()}`,
        title,
        content,
        url,
        type,
        classLevel,
        chapterId,
        date: new Date().toISOString()
    };
    const updated = [newNote, ...notes];
    localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(updated));
    return updated;
};

export const deleteNote = (id: string) => {
    const notes = getNotes();
    const updated = notes.filter(n => n.id !== id);
    localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(updated));
    return updated;
};

export const getTeacherProfile = (): TeacherProfileData => {
  const data = localStorage.getItem(STORAGE_KEY_TEACHER_PROFILE);
  return data ? JSON.parse(data) : DEFAULT_TEACHER_PROFILE;
};

export const updateTeacherProfile = (data: TeacherProfileData) => {
  localStorage.setItem(STORAGE_KEY_TEACHER_PROFILE, JSON.stringify(data));
  return data;
};

// Chapter Services
export const getChapters = (): Chapter[] => {
    initDB();
    const c = localStorage.getItem(STORAGE_KEY_CHAPTERS);
    return c ? JSON.parse(c) : INITIAL_CHAPTERS;
};

// Now updates a specific topic's video
export const updateTopicVideo = (chapterId: string, topicId: string, videoUrl: string) => {
    const chapters = getChapters();
    const chapterIndex = chapters.findIndex(c => c.id === chapterId);
    if (chapterIndex > -1) {
        const topicIndex = chapters[chapterIndex].topics.findIndex(t => t.id === topicId);
        if (topicIndex > -1) {
             chapters[chapterIndex].topics[topicIndex].videoUrl = videoUrl;
             localStorage.setItem(STORAGE_KEY_CHAPTERS, JSON.stringify(chapters));
        }
    }
    return chapters;
};

// Quiz Services
export const getQuizzes = (): Quiz[] => {
    initDB();
    const q = localStorage.getItem(STORAGE_KEY_QUIZZES);
    return q ? JSON.parse(q) : [];
};

export const getQuizByChapterId = (chapterId: string): Quiz | undefined => {
    const quizzes = getQuizzes();
    return quizzes.find(q => q.chapterId === chapterId);
};

export const saveQuiz = (chapterId: string, questions: Question[]) => {
    const quizzes = getQuizzes();
    const existingIndex = quizzes.findIndex(q => q.chapterId === chapterId);

    const newQuiz: Quiz = {
        id: existingIndex > -1 ? quizzes[existingIndex].id : `quiz-${Date.now()}`,
        chapterId,
        questions
    };

    if (existingIndex > -1) {
        quizzes[existingIndex] = newQuiz;
    } else {
        quizzes.push(newQuiz);
    }

    localStorage.setItem(STORAGE_KEY_QUIZZES, JSON.stringify(quizzes));
    return newQuiz;
};

export const saveQuizAttempt = (userId: string, chapterId: string, score: number, totalQuestions: number) => {
    const students = getStudents();
    const studentIndex = students.findIndex(s => s.id === userId);

    if (studentIndex > -1) {
        const passed = (score / totalQuestions) >= 0.5; // 50% passing criteria
        const result: QuizResult = {
            score,
            totalQuestions,
            passed,
            date: new Date().toISOString()
        };

        students[studentIndex].quizAttempts = {
            ...(students[studentIndex].quizAttempts || {}),
            [chapterId]: result
        };

        localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));

        const currentUser = getCurrentUser();
        if (currentUser && currentUser.id === userId) {
             const updatedUser = students[studentIndex];
             // Preserve session token from current session to avoid logout
             updatedUser.sessionToken = currentUser.sessionToken;
             localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updatedUser));
             return updatedUser;
        }
    }
    return null;
}
