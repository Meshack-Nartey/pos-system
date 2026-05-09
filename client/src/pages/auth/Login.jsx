import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, ShoppingBag, X, Eye, EyeOff, BarChart2, Package, Receipt, Users } from 'lucide-react';
import { loginUser, resetPassword } from '../../services/authService';
import useAuth from '../../hooks/useAuth';
import useTheme from '../../hooks/useTheme';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [showResetNew, setShowResetNew] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const closeForgotModal = () => {
    setShowForgotModal(false);
    setResetEmail('');
    setResetNewPassword('');
    setResetConfirmPassword('');
    setResetError('');
    setResetSuccess('');
    setShowResetNew(false);
    setShowResetConfirm(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetLoading(true);
    setResetError('');
    setResetSuccess('');
    try {
      await resetPassword({ email: resetEmail, newPassword: resetNewPassword, confirmPassword: resetConfirmPassword });
      setResetSuccess('Password reset successful! You can now log in.');
      setResetEmail('');
      setResetNewPassword('');
      setResetConfirmPassword('');
    } catch (err) {
      setResetError(err.response?.data?.message || 'Reset failed. Try again.');
    } finally {
      setResetLoading(false);
    }
  };

  const { login } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await loginUser({ email, password });
      login(data.user, data.token);

      if (data.user.role === 'admin') navigate('/admin/dashboard');
      else if (data.user.role === 'manager') navigate('/manager/dashboard');
      else if (data.user.role === 'cashier') navigate('/cashier/pos');

    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Try again.');
      setEmail('');
      setPassword('');
      setShowPassword(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{
        background: isDark
          ? 'linear-gradient(135deg, #111827 0%, #5a2b38 48%, #1f2937 100%)'
          : 'linear-gradient(135deg, #c07688 0%, #e6afbb 46%, #fff5f7 100%)',
      }}
    >
      {/* Background blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl opacity-30"
        style={{ background: 'radial-gradient(circle, #f7c4cf, transparent)' }} />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-3xl opacity-30"
        style={{ background: 'radial-gradient(circle, #fff0f3, transparent)' }} />
      <div className="absolute top-1/2 left-1/4 w-64 h-64 rounded-full blur-3xl opacity-20"
        style={{ background: 'radial-gradient(circle, #f1bcc8, transparent)' }} />

      {/* Scattered faint background icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <BarChart2  size={120} className="absolute text-white opacity-[0.06]" style={{ top: '8%',  left: '5%',  transform: 'rotate(-15deg)' }} />
        <ShoppingBag size={100} className="absolute text-white opacity-[0.06]" style={{ top: '5%',  right: '8%', transform: 'rotate(12deg)' }} />
        <Package    size={140} className="absolute text-white opacity-[0.06]" style={{ top: '38%', left: '2%', transform: 'rotate(10deg)' }} />
        <Receipt    size={110} className="absolute text-white opacity-[0.06]" style={{ top: '65%', left: '12%', transform: 'rotate(-8deg)' }} />
        <Users      size={130} className="absolute text-white opacity-[0.06]" style={{ top: '70%', right: '5%', transform: 'rotate(6deg)' }} />
        <BarChart2  size={90}  className="absolute text-white opacity-[0.06]" style={{ top: '30%', right: '3%', transform: 'rotate(-20deg)' }} />
        <Receipt    size={80}  className="absolute text-white opacity-[0.06]" style={{ bottom: '5%', right: '20%', transform: 'rotate(15deg)' }} />
        <Package    size={70}  className="absolute text-white opacity-[0.06]" style={{ top: '15%', left: '35%', transform: 'rotate(-5deg)' }} />
      </div>

      {/* Floating dots grid — top right */}
      <div className="absolute top-8 right-8 hidden lg:grid grid-cols-5 gap-2 opacity-20">
        {Array.from({ length: 25 }).map((_, i) => (
          <div key={i} className="w-1.5 h-1.5 rounded-full bg-white" />
        ))}
      </div>

      {/* Bottom tagline */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white text-opacity-40 text-xs tracking-widest uppercase hidden lg:block opacity-40">
        Point of Sale System &nbsp;·&nbsp; SwiftSale
      </div>

      <div className={`w-full max-w-md rounded-2xl shadow-2xl p-8 relative z-10 ${
        isDark
          ? 'bg-slate-800 bg-opacity-80 backdrop-blur-md border border-slate-700'
          : 'bg-white bg-opacity-95 backdrop-blur-md'
      }`}>

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-rose-600 rounded-2xl mb-4 shadow-lg">
            <ShoppingBag size={32} className="text-white" />
          </div>
          <h1 className={`brand-name text-4xl ${
            isDark ? 'text-white' : 'text-rose-600'
          }`}>
            SwiftSale
          </h1>
          <p className={`text-sm mt-1 ${
            isDark ? 'text-slate-400' : 'text-gray-500'
          }`}>
            Sign in to your account
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-rose-100 border border-rose-400 text-rose-700 px-4 py-3 rounded-lg mb-4 text-sm flex items-start gap-2">
            <span className="mt-0.5">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Email */}
          <div>
            <label className={`block text-sm font-medium mb-1.5 ${
              isDark ? 'text-slate-300' : 'text-gray-700'
            }`}>
              Email Address
            </label>
            <div className="relative">
              <Mail size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                isDark ? 'text-slate-400' : 'text-gray-400'
              }`} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className={`w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 transition duration-200 ${
                  isDark
                    ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                    : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400'
                }`}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className={`block text-sm font-medium mb-1.5 ${
              isDark ? 'text-slate-300' : 'text-gray-700'
            }`}>
              Password
            </label>
            <div className="relative">
              <Lock size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                isDark ? 'text-slate-400' : 'text-gray-400'
              }`} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className={`w-full pl-10 pr-10 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 transition duration-200 ${
                  isDark
                    ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                    : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 transition ${
                  isDark ? 'text-slate-400 hover:text-slate-200' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Forgot Password */}
          <div className="text-right -mt-1">
            <button
              type="button"
              onClick={() => setShowForgotModal(true)}
              className="text-sm text-rose-500 hover:text-rose-600 hover:underline transition"
            >
              Forgot password?
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white py-2.5 rounded-lg font-medium text-sm transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-2 shadow-lg shadow-rose-500/25"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <LogIn size={16} />
            )}
            <span>{loading ? 'Signing in...' : 'Sign In'}</span>
          </button>

        </form>

      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 px-4 backdrop-blur-sm bg-black/30">
          <div className={`w-full max-w-sm rounded-2xl shadow-xl p-6 ${
            isDark ? 'bg-slate-800' : 'bg-white'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Reset Password
              </h2>
              <button
                onClick={closeForgotModal}
                className={`p-1 rounded-lg transition ${isDark ? 'text-slate-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <X size={18} />
              </button>
            </div>

            {resetError && (
              <div className="bg-rose-100 border border-rose-400 text-rose-700 px-3 py-2 rounded-lg mb-3 text-sm">
                {resetError}
              </div>
            )}
            {resetSuccess && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded-lg mb-3 text-sm">
                {resetSuccess}
              </div>
            )}

            {!resetSuccess && (
              <form onSubmit={handleResetPassword} className="space-y-3">
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-400' : 'text-gray-400'}`} />
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      className={`w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 transition ${
                        isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                    New Password
                  </label>
                  <div className="relative">
                    <Lock size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-400' : 'text-gray-400'}`} />
                    <input
                      type={showResetNew ? 'text' : 'password'}
                      value={resetNewPassword}
                      onChange={(e) => setResetNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      required
                      className={`w-full pl-10 pr-10 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 transition ${
                        isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400'
                      }`}
                    />
                    <button type="button" onClick={() => setShowResetNew(!showResetNew)}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 transition ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-gray-400 hover:text-gray-600'}`}>
                      {showResetNew ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-400' : 'text-gray-400'}`} />
                    <input
                      type={showResetConfirm ? 'text' : 'password'}
                      value={resetConfirmPassword}
                      onChange={(e) => setResetConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      required
                      className={`w-full pl-10 pr-10 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 transition ${
                        isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400'
                      }`}
                    />
                    <button type="button" onClick={() => setShowResetConfirm(!showResetConfirm)}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 transition ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-gray-400 hover:text-gray-600'}`}>
                      {showResetConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white py-2.5 rounded-lg font-medium text-sm transition disabled:opacity-50 disabled:cursor-not-allowed mt-1"
                >
                  {resetLoading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            )}

            {resetSuccess && (
              <button
                onClick={closeForgotModal}
                className="mt-2 w-full bg-rose-600 hover:bg-rose-700 text-white py-2.5 rounded-lg font-medium text-sm transition"
              >
                Back to Login
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default Login;
