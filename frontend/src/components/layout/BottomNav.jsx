import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { 
  LayoutDashboard, FileText, CheckSquare, 
  Award, ShieldCheck, User, Users, 
  Settings, BookOpen, Clock, Activity, GraduationCap 
} from 'lucide-react';

const studentLinks = [
  { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
  { name: 'Assessments', path: '/student/assessments', icon: FileText },
  { name: 'Results', path: '/student/results', icon: Award },
  { name: 'Profile', path: '/student/profile', icon: User },
];

const lecturerLinks = [
  { name: 'Dashboard', path: '/lecturer/dashboard', icon: LayoutDashboard },
  { name: 'Courses', path: '/lecturer/courses', icon: BookOpen },
  { name: 'Grades', path: '/lecturer/grade-center', icon: CheckSquare },
  { name: 'Profile', path: '/lecturer/profile', icon: User },
];

const adminLinks = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Users', path: '/admin/users', icon: Users },
  { name: 'Programs', path: '/admin/programs', icon: GraduationCap },
  { name: 'Courses', path: '/admin/courses', icon: BookOpen },
  { name: 'Settings', path: '/admin/settings', icon: Settings },
];

export function BottomNav({ role }) {
  const links = role === 'student' ? studentLinks : role === 'lecturer' ? lecturerLinks : adminLinks;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t border-slate-200 dark:bg-slate-900 dark:border-slate-800 safe-area-pb">
      <ul className="flex h-full items-center justify-around px-2">
        {links.map((link) => (
          <li key={link.name} className="flex-1">
            <NavLink
              to={link.path}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center w-full h-full space-y-1 text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 transition-colors",
                  isActive && "text-primary-600 dark:text-primary-400"
                )
              }
            >
              <link.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{link.name}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
