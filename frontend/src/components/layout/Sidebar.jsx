import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';
import { 
  LayoutDashboard, FileText, CheckSquare, 
  Award, ShieldCheck, User, Users, 
  Settings, BookOpen, Clock, Activity, LogOut, GraduationCap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const studentLinks = [
  { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
  { name: 'Courses', path: '/student/courses', icon: BookOpen },
  { name: 'Assessments', path: '/student/assessments', icon: FileText },
  { name: 'Submissions', path: '/student/submissions', icon: CheckSquare },
  { name: 'Results', path: '/student/results', icon: Award },
  { name: 'Blockchain Verification', path: '/student/verification', icon: ShieldCheck },
  { name: 'Profile', path: '/student/profile', icon: User },
];

const lecturerLinks = [
  { name: 'Dashboard', path: '/lecturer/dashboard', icon: LayoutDashboard },
  { name: 'Courses', path: '/lecturer/courses', icon: BookOpen },
  { name: 'Assessments', path: '/lecturer/assessments', icon: FileText },
  { name: 'Grade Center', path: '/lecturer/grades', icon: CheckSquare },
  { name: 'Published Results', path: '/lecturer/results', icon: Award },
  { name: 'Blockchain Records', path: '/lecturer/records', icon: ShieldCheck },
  { name: 'Profile', path: '/lecturer/profile', icon: User },
];

const adminLinks = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Users', path: '/admin/users', icon: Users },
  { name: 'Programs', path: '/admin/programs', icon: GraduationCap },
  { name: 'Courses', path: '/admin/courses', icon: BookOpen },
  { name: 'System Logs', path: '/admin/logs', icon: Clock },
  { name: 'Transactions', path: '/admin/transactions', icon: ShieldCheck },
  { name: 'Analytics', path: '/admin/analytics', icon: Activity },
  { name: 'Settings', path: '/admin/settings', icon: Settings },
];

export function Sidebar({ role, isOpen, setIsOpen }) {
  const navigate = useNavigate();
  const links = role === 'student' ? studentLinks : role === 'lecturer' ? lecturerLinks : adminLinks;

  const handleLogout = async () => {
    try {
      const csrfRes = await fetch('/api/csrf-token', { credentials: 'include' });
      const csrfData = await csrfRes.json();
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'X-CSRF-Token': csrfData.csrfToken },
        credentials: 'include'
      });
      navigate('/login');
    } catch (e) {
      console.error('Logout error', e);
      navigate('/login');
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm md:hidden" 
          onClick={() => setIsOpen(false)}
        />
      )}
      <motion.aside
        initial={false}
        animate={{ width: isOpen ? 256 : 80 }}
        className={cn(
          "fixed left-0 top-0 z-40 h-screen border-r border-slate-200 bg-white pt-16 transition-transform duration-300 dark:border-slate-800 dark:bg-slate-900 overflow-hidden max-md:!w-64",
          isOpen ? "max-md:translate-x-0 shadow-2xl md:shadow-none" : "max-md:-translate-x-full"
        )}
      >
      <div className="flex h-full flex-col justify-between overflow-y-auto px-3 py-4">
        <ul className="space-y-2 font-medium">
          {links.map((link) => (
            <li key={link.name}>
              <NavLink
                to={link.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center rounded-xl p-3 text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
                    isActive && "bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400"
                  )
                }
              >
                <link.icon className={cn("h-6 w-6 flex-shrink-0 transition-all", isOpen ? "mr-3" : "mx-auto")} />
                <motion.span 
                  animate={{ opacity: isOpen ? 1 : 0, width: isOpen ? 'auto' : 0 }}
                  className="whitespace-nowrap overflow-hidden"
                >
                  {link.name}
                </motion.span>
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="mt-auto pt-4 space-y-2 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={handleLogout}
            className="flex w-full items-center rounded-xl p-3 text-slate-700 transition-colors hover:bg-red-50 dark:text-slate-300 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400"
          >
            <LogOut className={cn("h-6 w-6 flex-shrink-0 transition-all", isOpen ? "mr-3" : "mx-auto")} />
            <motion.span 
              animate={{ opacity: isOpen ? 1 : 0, width: isOpen ? 'auto' : 0 }}
              className="whitespace-nowrap overflow-hidden"
            >
              Log out
            </motion.span>
          </button>
        </div>
      </div>
    </motion.aside>
    </>
  );
}
