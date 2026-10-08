import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Mail, Lock, ShieldAlert, ArrowRight, Loader2 } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('citizen@smartcity.gov');
  const [password, setPassword] = useState('password123');
  const [role, setRole] = useState<'citizen' | 'admin'>('citizen');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Auto-fill credentials to help testing
  useEffect(() => {
    if (role === 'admin') {
      setEmail('admin@smartcity.gov');
      setPassword('admin123');
    } else {
      setEmail('citizen@smartcity.gov');
      setPassword('password123');
    }
  }, [role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    try {
      const user = await login({ email, password });
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'officer') navigate('/officer');
      else navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 dark:bg-gray-900">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center text-blue-600 dark:text-blue-500">
          <ShieldAlert size={48} />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Or{' '}
          <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
            register as a new citizen
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 dark:bg-gray-800">
          
          {/* Role Toggle Tabs */}
          <div className="flex p-1 bg-gray-100 dark:bg-gray-700 rounded-lg mb-8">
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                role === 'citizen' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
              }`}
              onClick={() => setRole('citizen')}
            >
              Citizen
            </button>
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                role === 'admin' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
              }`}
              onClick={() => setRole('admin')}
            >
              Admin
            </button>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 dark:bg-red-900/30 rounded-md">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 px-3 border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 px-3 border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
