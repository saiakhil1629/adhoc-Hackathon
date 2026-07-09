import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FiMail, FiLock, FiAlertCircle } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      email: 'admin@aditya.ac.in', // Convenient default credentials for the HR Admin
      password: 'password123'
    }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setAuthError('');
    try {
      const { user, error } = await login(data.email, data.password);
      if (error) {
        setAuthError(error.message);
        toast.error(error.message || 'Login failed');
      } else {
        toast.success(`Welcome back, ${user.user_metadata?.name || 'HR Admin'}!`);
        navigate('/');
      }
    } catch (e) {
      setAuthError('An unexpected error occurred. Please try again.');
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/40 via-slate-950 to-slate-950 px-4">
      {/* Background blobs for premium depth */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md">
        {/* Title / Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary-500 to-indigo-500 items-center justify-center text-white font-black text-3xl shadow-xl shadow-primary-500/25 mb-4">
            A
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Adhoc Network Management Portal</h2>
          <p className="mt-2 text-sm text-slate-400">HR Admin Portal • Aditya Group of Campuses</p>
        </div>

        {/* Login Card */}
        <div className="glass bg-slate-900/60 border border-white/5 rounded-3xl p-8 shadow-2xl relative">
          <h3 className="text-lg font-bold text-white mb-6">Sign In</h3>

          {authError && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/25 rounded-2xl flex items-start space-x-3 text-rose-200 text-sm">
              <FiAlertCircle className="mt-0.5 flex-shrink-0" size={18} />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500">
                  <FiMail size={16} />
                </span>
                <input
                  type="email"
                  placeholder="admin@aditya.ac.in"
                  {...register("email", { 
                    required: "Email address is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address"
                    }
                  })}
                  className="w-full pl-11 pr-4 py-3 bg-slate-950/50 border border-white/5 rounded-2xl text-sm outline-none text-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all placeholder:text-slate-650"
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-rose-400 font-semibold">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500">
                  <FiLock size={16} />
                </span>
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register("password", { 
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters"
                    }
                  })}
                  className="w-full pl-11 pr-4 py-3 bg-slate-950/50 border border-white/5 rounded-2xl text-sm outline-none text-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all placeholder:text-slate-650"
                />
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-rose-400 font-semibold">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 py-3 px-4 bg-gradient-to-r from-primary-500 to-indigo-500 hover:from-primary-600 hover:to-indigo-600 active:scale-98 text-white rounded-2xl text-sm font-bold transition-all shadow-lg shadow-primary-500/10 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Sign In"
              )}
            </button>
          </form>
          
          <div className="mt-6 text-center text-xs text-slate-500">
            Forgot password? Contact system administrator.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
