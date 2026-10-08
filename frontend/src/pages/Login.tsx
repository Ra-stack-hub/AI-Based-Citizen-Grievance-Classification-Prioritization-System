import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ArrowRight } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('citizen@smartcity.gov');
  const [password, setPassword] = useState('password123');
  const [role, setRole] = useState<'citizen' | 'admin'>('citizen');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Auto-fill credentials when switching tabs to help testing
  useEffect(() => {
    if (role === 'admin') {
      setEmail('admin@smartcity.gov');
      setPassword('admin123');
    } else {
      setEmail('citizen@smartcity.gov');
      setPassword('password123');
    }
  }, [role]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const user = await login({ email: email.trim(), password });
      
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/submit');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to login. Ensure your account exists and credentials are correct.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4">
      <div className="bg-surface shadow-sm border border-borderLight p-8 rounded-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-textPrimary mb-2 text-center">Welcome Back</h2>
        <p className="text-textSecondary text-center mb-6">Sign in to access your dashboard</p>

        {/* Role Toggle Tabs */}
        <div className="flex p-1 bg-surfaceLight rounded-lg mb-8">
          <button
            type="button"
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              role === 'citizen' ? 'bg-primary text-background shadow-sm' : 'text-textSecondary hover:text-textPrimary'
            }`}
            onClick={() => setRole('citizen')}
          >
            Citizen
          </button>
          <button
            type="button"
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              role === 'admin' ? 'bg-primary text-background shadow-sm' : 'text-textSecondary hover:text-textPrimary'
            }`}
            onClick={() => setRole('admin')}
          >
            Admin / Officer
          </button>
        </div>
        
        {error && (
          <div className="bg-danger/10 border border-danger/50 text-danger px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-textSecondary mb-2">
              {role === 'admin' ? 'Admin / Officer Email' : 'Email Address'}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-textSecondary" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-surfaceLight border border-borderLight rounded-xl py-3 pl-10 pr-4 text-textPrimary focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                placeholder={role === 'admin' ? 'admin@smartcity.gov' : 'citizen@smartcity.gov'}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-textSecondary mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-textSecondary" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-surfaceLight border border-borderLight rounded-xl py-3 pl-10 pr-4 text-textPrimary focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-accent text-background font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
          >
            {isLoading ? 'Signing In...' : `Sign In as ${role === 'admin' ? 'Admin' : 'Citizen'}`} <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        <p className="mt-6 text-center text-textSecondary text-sm">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
