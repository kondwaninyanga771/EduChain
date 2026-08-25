import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { BottomNav } from './BottomNav';
import { cn } from '../../utils/cn';
import { fetchWithCSRF } from '../../utils/api';

export function MainLayout({ role }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Automatically poll the backend to check if the session is still valid.
  // If the user logs in on another device, this will return 401 and trigger
  // the global interceptor to kick them to the login screen immediately.
  useEffect(() => {
    const interval = setInterval(() => {
      fetchWithCSRF('/api/auth/session-check').catch(() => {});
    }, 15000); // Check every 15 seconds
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors">
      <Topbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} role={role} />
      <Sidebar role={role} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <motion.main
        initial={false}
        animate={{ 
          marginLeft: isSidebarOpen ? 256 : 80 
        }}
        className={cn(
          "min-h-screen pt-16 transition-all duration-300",
          "max-md:!ml-0 max-md:pb-16" // Mobile styles (sidebar hidden/bottom)
        )}
      >
        <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </motion.main>
      <BottomNav role={role} />
    </div>
  );
}
