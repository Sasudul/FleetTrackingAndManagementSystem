import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import type { LoginResponse } from '../types';
import { Truck, Eye, EyeOff } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post<LoginResponse>('/auth/login', { email, password });
      login(response.data);
      navigate('/dashboard');
    } catch (err: any) {
      const message = err.response?.data?.error || 'Invalid email or password';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-pureWhite font-sans">
      {/* Left Panel — Branding (Black Background) */}
      <div className="hidden lg:flex lg:w-[45%] bg-uberBlack text-pureWhite flex-col justify-between p-12 lg:p-20 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-16">
            <h1 className="text-[32px] font-bold font-display tracking-tight leading-none text-pureWhite flex items-center gap-1.5">
              Fleeter
            </h1>
          </div>
          <h2 className="text-[52px] leading-[1.1] font-bold font-display mb-6 tracking-tight max-w-md">
            Go anywhere with Fleeter
          </h2>
          <p className="text-[18px] text-mutedGray font-medium max-w-md leading-relaxed">
            Real-time fleet tracking with intelligent trip management and driver coordination.
          </p>
        </div>
        
        <div className="relative z-10 flex gap-12 text-[16px] text-mutedGray">
          <div className="space-y-2">
            <div className="font-semibold text-pureWhite">Tracking</div>
            <div>Live GPS</div>
          </div>
          <div className="space-y-2">
            <div className="font-semibold text-pureWhite">Management</div>
            <div>Drivers & Routes</div>
          </div>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-24 bg-pureWhite">
        <div className="w-full max-w-[440px] mx-auto">
          {/* Mobile branding */}
          <div className="lg:hidden mb-12">
            <h1 className="text-[32px] font-bold text-uberBlack font-display tracking-tight flex items-center gap-1.5">
              Fleeter
            </h1>
          </div>

          <div className="mb-10">
            <h2 className="text-[32px] leading-[1.25] font-bold text-uberBlack font-display mb-2">What's your email?</h2>
            <p className="text-[16px] text-bodyGray">Sign in to your manager account</p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-[#f9e5e5] text-[#cc0000] text-[14px] font-medium rounded-standard">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                id="login-email"
                type="email"
                placeholder="Enter email"
                className="block w-full rounded-standard border border-borderBlack px-4 py-[14px] text-[16px] text-uberBlack placeholder:text-mutedGray focus:ring-[2px] focus:ring-uberBlack focus:outline-none transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                className="block w-full rounded-standard border border-borderBlack px-4 py-[14px] pr-12 text-[16px] text-uberBlack placeholder:text-mutedGray focus:ring-[2px] focus:ring-uberBlack focus:outline-none transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-uberBlack hover:text-bodyGray transition-colors"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-pill bg-uberBlack py-[16px] text-[16px] font-medium text-pureWhite hover:bg-bodyGray focus:outline-none focus:ring-[2px] focus:ring-offset-2 focus:ring-uberBlack disabled:opacity-50 transition-colors mt-4 flex items-center justify-center gap-2"
            >
              {loading ? 'Continuing...' : 'Continue'}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-chipGray flex justify-center">
            <p className="text-[14px] text-bodyGray">
              New to Fleeter?{' '}
              <Link autoFocus={false} to="/register" className="font-medium text-uberBlack underline decoration-1 underline-offset-4 hover:text-bodyGray transition-colors">
                Sign up to drive
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;