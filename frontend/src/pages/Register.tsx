import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, ArrowRight } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
          full_name: name,
          role: 'citizen'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to register');
      }

      // Success, redirect to login
      navigate('/login');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4">
      <div className="bg-surface shadow-sm border border-borderLight p-8 rounded-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-textPrimary mb-2 text-center">Create Account</h2>
        <p className="text-textSecondary text-center mb-8">Join the GrievAI network</p>
        
        {error && (
          <div className="bg-danger/10 border border-danger/50 text-danger px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-textSecondary mb-2">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-textSecondary" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-surfaceLight border border-borderLight rounded-xl py-3 pl-10 pr-4 text-textPrimary focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                placeholder="John Doe"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-textSecondary mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-textSecondary" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-surfaceLight border border-borderLight rounded-xl py-3 pl-10 pr-4 text-textPrimary focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                placeholder="citizen@smartcity.gov"
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
            className="w-full bg-primary hover:bg-accent text-background font-bold py-3 mt-4 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
          >
            {isLoading ? 'Creating...' : 'Create Account'} <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        <p className="mt-6 text-center text-textSecondary text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
