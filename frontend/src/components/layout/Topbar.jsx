import React from 'react';
import { Menu, Search, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import logo from '../../assets/logo.png';

export function Topbar({ toggleSidebar, role }) {
  const navigate = useNavigate();

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
    <header className="fixed top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80 transition-colors">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="!flex">
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <img src={logo} alt="EduChain Logo" className="h-8 w-8 rounded-lg object-cover" />
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white hidden sm:block">
              EduChain
            </span>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 hidden md:flex">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full rounded-full border border-slate-200 bg-slate-50 p-2 pl-10 text-sm text-slate-900 focus:border-primary-500 focus:ring-primary-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-400 transition-colors"
              placeholder="Search..."
            />
          </div>
        </div>

        <div className="flex items-center gap-2">

          <Button variant="ghost" size="icon" onClick={handleLogout} className="text-slate-500 hover:text-red-500 transition-colors ml-1" title="Log out">
            <LogOut className="h-5 w-5" />
          </Button>
          <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center ml-1 overflow-hidden border border-slate-300 dark:border-slate-600">
            <User className="h-4 w-4 text-slate-500 dark:text-slate-400" />
          </div>
        </div>
      </div>
    </header>
  );
}
