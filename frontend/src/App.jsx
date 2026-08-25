import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { LandingPage } from './pages/public/Landing';
import { AboutPage } from './pages/public/About';
import { SecurityPage } from './pages/public/Security';
import { NewsPage } from './pages/public/News';
import { LoginPage } from './pages/public/Login';

import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentCoursesPage } from './pages/student/Courses';
import { AssessmentsPage } from './pages/student/Assessments';
import { AssessmentDetailsPage } from './pages/student/AssessmentDetails';
import { SubmissionsPage } from './pages/student/Submissions';
import { ResultsPage } from './pages/student/Results';
import { VerificationPage } from './pages/student/Verification';
import { ProfilePage } from './pages/student/Profile';

import { LecturerDashboard } from './pages/lecturer/LecturerDashboard';
import { CoursesPage } from './pages/lecturer/Courses';
import { AssessmentsPage as LecturerAssessmentsPage } from './pages/lecturer/Assessments';
import { CreateAssessmentPage } from './pages/lecturer/CreateAssessment';
import { GradeCenterPage } from './pages/lecturer/Grades';
import { GradeAssignmentPage } from './pages/lecturer/GradeAssignment';
import { PublishedResultsPage } from './pages/lecturer/Results';
import { LecturerRecordsPage } from './pages/lecturer/Records';

import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UserManagementPage } from './pages/admin/UserManagement';
import { ProgramManagementPage } from './pages/admin/ProgramManagement';
import { CourseManagementPage as AdminCourseManagementPage } from './pages/admin/CourseManagement';
import { SystemLogsPage } from './pages/admin/SystemLogs';
import { BlockchainTransactionsPage } from './pages/admin/BlockchainTransactions';
import { AnalyticsPage } from './pages/admin/Analytics';
import { SettingsPage } from './pages/admin/Settings';

// Placeholder Pages
const PlaceholderPage = ({ title }) => (
  <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-12 text-center dark:border-slate-800 dark:bg-slate-900/50">
    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{title}</h1>
    <p className="mt-2 text-slate-500 dark:text-slate-400">This page is under construction.</p>
  </div>
);

function App() {
  console.log("Quiz feature active v3");
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/security" element={<SecurityPage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Student Routes */}
        <Route path="/student" element={<MainLayout role="student" />}>
          <Route index element={<Navigate to="/student/dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="courses" element={<StudentCoursesPage />} />
          <Route path="assessments" element={<AssessmentsPage />} />
          <Route path="assessments/:id" element={<AssessmentDetailsPage />} />
          <Route path="submissions" element={<SubmissionsPage />} />
          <Route path="results" element={<ResultsPage />} />
          <Route path="verification" element={<VerificationPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        {/* Lecturer Routes */}
        <Route path="/lecturer" element={<MainLayout role="lecturer" />}>
          <Route index element={<Navigate to="/lecturer/dashboard" replace />} />
          <Route path="dashboard" element={<LecturerDashboard />} />
          <Route path="courses" element={<CoursesPage />} />
          <Route path="assessments" element={<LecturerAssessmentsPage />} />
          <Route path="assessments/create" element={<CreateAssessmentPage />} />
          <Route path="grades" element={<GradeCenterPage />} />
          <Route path="grades/:id" element={<GradeAssignmentPage />} />
          <Route path="results" element={<PublishedResultsPage />} />
          <Route path="records" element={<LecturerRecordsPage />} />
          <Route path="profile" element={<ProfilePage role="lecturer" />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<MainLayout role="admin" />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<UserManagementPage />} />
          <Route path="programs" element={<ProgramManagementPage />} />
          <Route path="courses" element={<AdminCourseManagementPage />} />
          <Route path="logs" element={<SystemLogsPage />} />
          <Route path="transactions" element={<BlockchainTransactionsPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
