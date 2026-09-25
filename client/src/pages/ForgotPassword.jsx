import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ThemeToggle from '../components/ui/ThemeToggle';
import { Heart, ArrowLeft, Mail, CheckCircle } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [devResetUrl, setDevResetUrl] = useState(null);

  const submitHandler = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setDevResetUrl(null);
    setLoading(true);

    try {
      const { data } = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
      setSuccessMessage(data.message);
      if (data.devResetUrl) {
        setDevResetUrl(data.devResetUrl);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request password reset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-4 relative transition-colors duration-200">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl p-8 space-y-6">
        <div className="text-center">
          <Heart fill="currentColor" size={48} className="mx-auto text-primary-600 dark:text-primary-500 mb-3" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Forgot Password</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        {successMessage ? (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-200 text-xs rounded-xl font-medium space-y-2">
              <div className="flex items-center gap-2 font-semibold text-emerald-700 dark:text-emerald-300">
                <CheckCircle size={18} />
                <span>Reset Link Processed</span>
              </div>
              <p>{successMessage}</p>
            </div>

            {devResetUrl && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 text-blue-700 dark:text-blue-300 text-xs rounded-xl space-y-1">
                <div className="font-semibold text-blue-800 dark:text-blue-200">Development mode: Reset link available for local testing.</div>
                <p>Click below to test your password reset flow locally:</p>
                <Link 
                  to={devResetUrl} 
                  className="inline-block mt-1 text-primary-600 dark:text-primary-400 underline font-semibold hover:text-primary-700 break-all"
                >
                  {window.location.origin + devResetUrl}
                </Link>
              </div>
            )}

            <Link
              to="/login"
              className="btn-secondary w-full py-3 font-semibold flex items-center justify-center gap-2"
            >
              <ArrowLeft size={16} />
              <span>Back to Login</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={submitHandler} className="space-y-4">
            <div>
              <label className="form-label">Email Address</label>
              <div className="relative">
                <input 
                  type="email" 
                  className="form-input pr-10" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  placeholder="Enter your registered email"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                  <Mail size={18} />
                </div>
              </div>
            </div>

            <button type="submit" className="btn-primary w-full py-3 mt-2 font-semibold" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>

            <div className="pt-2 text-center">
              <Link 
                to="/login" 
                className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-medium transition-colors"
              >
                <ArrowLeft size={14} />
                <span>Back to Login</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
