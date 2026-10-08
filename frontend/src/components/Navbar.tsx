import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Target, ChevronDown, LogOut, User as UserIcon, Menu, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Navbar = () => {
  const { user, logout } = useAuth();
  const isAuthenticated = !!user;
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="flex items-center justify-between px-4 lg:px-6 py-4 bg-background border-b border-borderLight relative z-50">
      <div className="flex items-center gap-4 lg:gap-8">
        <Link to="/" className="flex items-center gap-2">
          <Target className="w-6 h-6 lg:w-8 lg:h-8 text-primary" />
          <div className="flex flex-col">
            <span className="font-semibold text-textPrimary leading-tight text-sm lg:text-base">GrievAI</span>
            <span className="text-[9px] lg:text-[10px] text-textSecondary leading-tight">AI grievance routing</span>
          </div>
        </Link>
        <button className="hidden md:flex items-center gap-2 text-sm text-textSecondary hover:text-textPrimary transition-colors">
          City Connect <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {/* Desktop Menu */}
      <div className="hidden lg:flex items-center gap-8">
        <div className="flex items-center gap-6 text-sm">
          <Link to="/" className="text-textSecondary hover:text-textPrimary transition-colors">Home</Link>
          
          {user?.role !== 'admin' && (
            <Link to="/submit" className="text-textPrimary font-medium bg-surfaceLight/50 px-3 py-1.5 rounded-full">Report</Link>
          )}
          
          <Link to="/track" className="text-textSecondary hover:text-textPrimary transition-colors">Track</Link>
          
          {isAuthenticated && user?.role === 'admin' && (
            <Link to="/admin" className="text-textSecondary hover:text-textPrimary transition-colors">
              Admin Dashboard
            </Link>
          )}
          
          {isAuthenticated ? (
            <button 
              onClick={() => { logout(); navigate('/'); }}
              className="text-textSecondary hover:text-danger flex items-center gap-1 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          ) : (
            <Link to="/login" className="text-textSecondary hover:text-textPrimary flex items-center gap-1 transition-colors">
              <UserIcon className="w-4 h-4" /> Login
            </Link>
          )}
        </div>
        
        {user?.role !== 'admin' && (
          <Link 
            to="/submit" 
            className="bg-primary hover:bg-accent text-background font-semibold px-4 py-2 rounded-full transition-colors"
          >
            File a complaint
          </Link>
        )}
      </div>

      {/* Mobile Menu Button */}
      <div className="lg:hidden flex items-center">
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-textPrimary p-2">
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-background border-b border-borderLight shadow-lg flex flex-col p-4 gap-4 lg:hidden">
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-textPrimary font-medium py-2">Home</Link>
          
          {user?.role !== 'admin' && (
            <Link to="/submit" onClick={() => setIsMobileMenuOpen(false)} className="text-textPrimary font-medium py-2">Report</Link>
          )}
          
          <Link to="/track" onClick={() => setIsMobileMenuOpen(false)} className="text-textPrimary font-medium py-2">Track</Link>
          
          {isAuthenticated && user?.role === 'admin' && (
            <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="text-textPrimary font-medium py-2">
              Admin Dashboard
            </Link>
          )}
          
          {isAuthenticated ? (
            <button 
              onClick={() => { logout(); setIsMobileMenuOpen(false); navigate('/'); }}
              className="text-danger font-medium py-2 flex items-center gap-2 text-left"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          ) : (
            <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-textPrimary font-medium py-2 flex items-center gap-2">
              <UserIcon className="w-4 h-4" /> Login
            </Link>
          )}

          {user?.role !== 'admin' && (
            <Link 
              to="/submit" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="bg-primary text-background font-semibold px-4 py-3 rounded-xl text-center mt-2"
            >
              File a complaint
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
