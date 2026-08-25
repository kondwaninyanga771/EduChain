import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import logo from '../../assets/logo.png';
import authSide from '../../assets/auth_side.png';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // 1. Fetch CSRF token
      const csrfRes = await fetch('/api/csrf-token', { credentials: 'include' });
      const csrfData = await csrfRes.json();
      
      // 2. Perform login
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfData.csrfToken
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to login');
      }

      const responseData = await response.json();

      if (responseData.user.role === 'LECTURER') {
        navigate('/lecturer/dashboard');
      } else if (responseData.user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex lg:grid lg:grid-cols-2 bg-white selection:bg-yellow-200">
      
      {/* Left Column - Form */}
      <div className="w-full flex flex-col relative px-8 py-12 sm:px-16 lg:px-24 xl:px-32">
        
        {/* Header containing Back and Logo */}
        <div className="flex items-center justify-between w-full mb-20 md:mb-32">
          <Link to="/" className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <div className="flex items-center gap-2">
            <img src={logo} alt="EduChain Logo" className="h-8 w-8 object-cover rounded-lg" />
            <span className="text-xl font-bold tracking-tight text-slate-900">EduChain</span>
          </div>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex flex-col justify-center max-w-md w-full mx-auto">
          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-4xl font-serif font-bold text-slate-900 mb-3">Welcome back!</h1>
            <p className="text-slate-500">Pick up where you left off, and keep things moving.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3">
              <Shield className="h-5 w-5 text-red-600 mt-0.5" />
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john.doe@gmail.com"
                className="w-full h-14 px-5 rounded-xl bg-slate-50 border-transparent focus:border-slate-300 focus:bg-white focus:ring-0 text-slate-900 placeholder:text-slate-400 transition-all text-sm outline-none"
              />
            </div>
            
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-14 pl-5 pr-16 rounded-xl bg-slate-50 border-transparent focus:border-slate-300 focus:bg-white focus:ring-0 text-slate-900 placeholder:text-slate-400 transition-all text-sm outline-none"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <div className="flex items-center justify-between pt-2 pb-4">
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="remember" 
                  className="h-4 w-4 rounded border-slate-300 text-yellow-600 focus:ring-yellow-600"
                />
                <label htmlFor="remember" className="text-sm font-medium text-slate-600">
                  Remember me
                </label>
              </div>
              <a href="#" className="text-sm font-medium text-yellow-600 hover:text-yellow-500">
                Forgot password?
              </a>
            </div>

            <Button type="submit" className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white text-base rounded-xl" isLoading={isLoading}>
              Log in →
            </Button>
          </form>

          <div className="relative flex items-center py-8">
            <div className="flex-grow border-t border-slate-100"></div>
            <span className="flex-shrink-0 mx-4 text-slate-400 text-sm">or</span>
            <div className="flex-grow border-t border-slate-100"></div>
          </div>

          <button type="button" className="w-full h-14 flex items-center justify-center gap-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl transition-colors border border-slate-100 text-sm">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          {/* Removed sign up link as registration is admin-only */}
        </div>
      </div>

      {/* Right Column - Image */}
      <div 
        className="hidden lg:block bg-cover bg-center relative"
        style={{ backgroundImage: `url(${authSide})` }}
      >
        <div className="absolute inset-0 bg-slate-900/20 mix-blend-multiply"></div>
      </div>

    </div>
  );
}
