import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import logo from '../../assets/logo.png';

export function PublicNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'About', path: '/about' },
    { name: 'Academics', path: '#' },
    { name: 'Institutions', path: '#' },
    { name: 'Blockchain Security', path: '/security' },
    { name: 'News & Events', path: '/news' }
  ];

  const isActive = (path) => location.pathname === path && path !== '#';

  return (
    <nav className="absolute top-4 md:top-8 w-full z-50 px-4 md:px-6 py-4">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl md:rounded-full px-4 md:px-6 py-3 shadow-lg shadow-black/5">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="EduChain Logo" className="h-8 w-8 md:h-10 md:w-10 object-cover rounded-lg" />
            <span className="text-lg md:text-xl font-bold tracking-tight text-slate-900 leading-tight">
              EduChain<br/><span className="text-[10px] md:text-xs text-slate-500 font-normal uppercase tracking-widest">Zambia</span>
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8 font-semibold text-sm text-slate-800">
            {navLinks.map((link, idx) => (
              <Link 
                key={idx} 
                to={link.path} 
                className={`transition-colors ${isActive(link.path) ? 'text-yellow-600' : 'hover:text-yellow-600'}`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <Link to="/login" className="hidden sm:block">
              <button className="bg-slate-900 text-white px-5 py-2 md:px-6 md:py-2.5 rounded-full text-xs md:text-sm font-semibold hover:bg-slate-800 transition-all flex items-center gap-2">
                Get Started <span>→</span>
              </button>
            </Link>
            
            {/* Mobile Menu Toggle Button */}
            <button 
              className="lg:hidden p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-4 pt-4 border-t border-slate-100 flex flex-col gap-4 pb-2">
            {navLinks.map((link, idx) => (
              <Link 
                key={idx} 
                to={link.path} 
                className={`text-base font-medium ${isActive(link.path) ? 'text-yellow-600' : 'text-slate-700 hover:text-yellow-600'}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <Link to="/login" className="mt-2 sm:hidden block" onClick={() => setIsMobileMenuOpen(false)}>
              <button className="w-full bg-slate-900 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-slate-800 transition-all flex justify-center items-center gap-2">
                Get Started <span>→</span>
              </button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
