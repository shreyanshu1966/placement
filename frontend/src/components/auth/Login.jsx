import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogIn, Mail, Lock, AlertCircle, Copy, Check } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login, error } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const [copiedField, setCopiedField] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setLocalError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLocalError('');

    const result = await login(formData.email, formData.password);
    
    setLoading(false);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setLocalError(result.error || 'Login failed');
    }
  };

  const demoAccounts = [
    { 
      role: 'Student', 
      email: 'alice.student@college.edu', 
      password: 'student123',
      color: 'bg-blue-50 border-blue-200',
      textColor: 'text-blue-700',
      badgeColor: 'bg-blue-100 text-blue-700'
    },
    { 
      role: 'Faculty', 
      email: 'john.smith@college.edu', 
      password: 'faculty123',
      color: 'bg-purple-50 border-purple-200',
      textColor: 'text-purple-700',
      badgeColor: 'bg-purple-100 text-purple-700'
    },
    { 
      role: 'Admin', 
      email: 'admin@college.edu', 
      password: 'admin123',
      color: 'bg-indigo-50 border-indigo-200',
      textColor: 'text-indigo-700',
      badgeColor: 'bg-indigo-100 text-indigo-700'
    }
  ];

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(''), 2000);
  };

  const fillDemoCredentials = (email, password) => {
    setFormData({ email, password });
    setLocalError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 page-transition">
      <div className="max-w-6xl w-full flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
        {/* Login Form */}
        <div className="flex-1 w-full max-w-md mx-auto space-y-6 bg-white p-6 sm:p-8 rounded-lg shadow-md">
          <div>
            <div className="flex justify-center">
              <div className="bg-blue-600 p-2.5 sm:p-3 rounded-lg">
                <LogIn className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
            </div>
            <h2 className="mt-4 sm:mt-6 text-center text-2xl sm:text-3xl font-bold text-gray-900">
              Sign in to your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Or{' '}
              <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
                create a new account
              </Link>
            </p>
          </div>

        {(localError || error) && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 flex items-start">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm text-red-600">{localError || error}</p>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 sm:py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
        </div>

        {/* Demo Credentials Panel */}
        <div className="flex-1 w-full max-w-md mx-auto space-y-4">
          <div className="bg-white p-5 sm:p-6 rounded-lg shadow-md">
            <div className="flex items-center space-x-2 mb-3 sm:mb-4">
              <div className="bg-blue-600 p-1.5 sm:p-2 rounded-lg">
                <LogIn className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900">Demo Accounts</h3>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">
              Try the platform instantly with demo credentials
            </p>

            <div className="space-y-3">
              {demoAccounts.map((account, index) => (
                <div 
                  key={index} 
                  className={`border-2 ${account.color} rounded-lg p-3 sm:p-4 transition-all hover:shadow-md cursor-pointer active:scale-[0.98]`}
                  onClick={() => fillDemoCredentials(account.email, account.password)}
                >
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 sm:py-1 rounded ${account.badgeColor}`}>
                      {account.role}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        fillDemoCredentials(account.email, account.password);
                      }}
                      className={`text-xs ${account.textColor} hover:underline font-medium`}
                    >
                      Use →
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 mb-0.5">Email</p>
                        <p className={`text-sm font-mono ${account.textColor} break-all`}>
                          {account.email}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(account.email, `${account.role}-email`);
                        }}
                        className="ml-2 p-1.5 hover:bg-gray-100 rounded transition-colors"
                        title="Copy email"
                      >
                        {copiedField === `${account.role}-email` ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 mb-0.5">Password</p>
                        <p className={`text-sm font-mono ${account.textColor}`}>
                          {account.password}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(account.password, `${account.role}-password`);
                        }}
                        className="ml-2 p-1.5 hover:bg-gray-100 rounded transition-colors"
                        title="Copy password"
                      >
                        {copiedField === `${account.role}-password` ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
              <p className="text-xs text-gray-700">
                <strong>💡 Tip:</strong> Click on any demo account card to auto-fill the login form, 
                or use the copy buttons to copy individual credentials.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
