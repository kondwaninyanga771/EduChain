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
