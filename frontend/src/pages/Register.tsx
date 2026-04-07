import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import type { RegisterRequest } from '../types';
import { Truck, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

const Register: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<RegisterRequest['role']>('DISPATCHER');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const payload: RegisterRequest = {
        email,
        passwordHash: password,
        fullName,
        role,
      };
      await api.post('/auth/register', payload);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      const message = err.response?.data?.error || err.response?.data?.message || 'Registration failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { value: 'ADMIN', label: 'Admin', desc: 'Full system access' },
    { value: 'DISPATCHER', label: 'Dispatcher', desc: 'Manage trips & drivers' },
    { value: 'DRIVER', label: 'Driver', desc: 'View assigned trips' },
  ] as const;

  return (
    <div className="min-h-screen flex bg-pureWhite font-sans">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-[45%] bg-uberBlack text-pureWhite flex-col justify-between p-12 lg:p-20 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-16">
            <h1 className="text-[32px] font-bold font-display tracking-tight leading-none text-pureWhite flex items-center gap-1.5">
              Fleeter
            </h1>
          </div>
          <h2 className="text-[52px] leading-[1.1] font-bold font-display mb-6 tracking-tight max-w-md">
            Sign up to manage
          </h2>
          <p className="text-[18px] text-mutedGray font-medium max-w-md leading-relaxed">
            Join your fleet management team and start coordinating vehicles, drivers, and trips efficiently.
          </p>
        </div>
      </div>

      {/* Right Panel — Register Form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-24 bg-pureWhite py-12">
        <div className="w-full max-w-[440px] mx-auto">
          {/* Mobile branding */}
          <div className="lg:hidden mb-12">
            <h1 className="text-[32px] font-bold text-uberBlack font-display tracking-tight flex items-center gap-1.5">
              Fleeter
            </h1>
          </div>

          {success ? (
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 bg-chipGray rounded-circle flex items-center justify-center mb-6">
                <CheckCircle2 className="h-8 w-8 text-uberBlack" />
              </div>
              <h2 className="text-[32px] font-bold font-display text-uberBlack mb-4">Account created</h2>
              <p className="text-[16px] text-bodyGray mb-2">Welcome to Fleeter.</p>
              <p className="text-[14px] text-mutedGray">Redirecting you to sign in...</p>
            </div>
          ) : (
            <>
              <div className="mb-10">
                <h2 className="text-[32px] leading-[1.25] font-bold text-uberBlack font-display mb-2">Create an account</h2>
                <p className="text-[16px] text-bodyGray">To access manager dashboard</p>
              </div>

              {error && (
                <div className="mb-8 p-4 bg-[#f9e5e5] text-[#cc0000] text-[14px] font-medium rounded-standard">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <input
                    id="reg-name"
                    type="text"
                    placeholder="Full name"
                    className="block w-full rounded-standard border border-borderBlack px-4 py-[14px] text-[16px] text-uberBlack placeholder:text-mutedGray focus:ring-[2px] focus:ring-uberBlack focus:outline-none transition-all"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <input
                    id="reg-email"
                    type="email"
                    placeholder="Email address"
                    className="block w-full rounded-standard border border-borderBlack px-4 py-[14px] text-[16px] text-uberBlack placeholder:text-mutedGray focus:ring-[2px] focus:ring-uberBlack focus:outline-none transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-[14px] font-medium text-uberBlack mb-3">Select your role</label>
                  <div className="flex flex-col gap-3">
                    {roles.map((r) => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => setRole(r.value)}
                        className={`flex items-center justify-between p-4 rounded-standard border transition-all duration-200 ${
                          role === r.value
                            ? 'border-borderBlack bg-uberBlack text-pureWhite'
                            : 'border-borderBlack bg-pureWhite text-uberBlack hover:bg-chipGray'
                        }`}
                      >
                        <span className="text-[16px] font-medium">{r.label}</span>
                        <span className={`text-[12px] ${role === r.value ? 'text-mutedGray' : 'text-bodyGray'}`}>{r.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password (min. 6 characters)"
                    className="block w-full rounded-standard border border-borderBlack px-4 py-[14px] pr-12 text-[16px] text-uberBlack placeholder:text-mutedGray focus:ring-[2px] focus:ring-uberBlack focus:outline-none transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>

                <div>
                  <input
                    id="reg-confirm"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Confirm password"
                    className="block w-full rounded-standard border border-borderBlack px-4 py-[14px] pr-12 text-[16px] text-uberBlack placeholder:text-mutedGray focus:ring-[2px] focus:ring-uberBlack focus:outline-none transition-all"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-pill bg-uberBlack py-[16px] text-[16px] font-medium text-pureWhite hover:bg-bodyGray focus:outline-none focus:ring-[2px] focus:ring-offset-2 focus:ring-uberBlack disabled:opacity-50 transition-colors mt-6 flex items-center justify-center gap-2"
                >
                  {loading ? 'Creating...' : 'Continue'}
                </button>
              </form>

              <div className="mt-8 pt-8 border-t border-chipGray flex justify-center">
                <p className="text-[14px] text-bodyGray">
                  Already use Fleeter?{' '}
                  <Link to="/login" className="font-medium text-uberBlack underline decoration-1 underline-offset-4 hover:text-bodyGray transition-colors">
                    Sign in
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
