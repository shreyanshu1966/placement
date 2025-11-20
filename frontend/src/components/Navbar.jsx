import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isStudent, isFaculty } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Different nav items based on user role
  const getNavItems = () => {
    if (!user) {
      return [
        { path: '/', label: 'Home' },
        { path: '/login', label: 'Login' },
        { path: '/register', label: 'Register' },
      ];
    }

    const commonItems = [
      { path: '/', label: 'Home' },
      { path: '/courses', label: 'Courses' },
    ];

    if (isStudent()) {
      return [
        ...commonItems,
        { path: '/student-dashboard', label: 'My Dashboard' },
        { path: '/results', label: 'My Results' },
      ];
    } else if (isFaculty()) {
      return [
        ...commonItems,
        { path: '/faculty-dashboard', label: 'Faculty Dashboard' },
        { path: '/create-assessment', label: 'Create Assessment' },
        { path: '/assignments', label: 'Manage Assignments' },
        { path: '/analytics', label: 'Analytics' },
      ];
    }

    return commonItems;
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-xl font-bold text-primary-600">
            Placement Assessment System
          </Link>
          
          <div className="flex items-center space-x-6">
            {getNavItems().map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:text-primary-600 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </Link>
            ))}
            
            {user && (
              <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-gray-200">
                <div className="text-sm">
                  <div className="font-medium text-gray-900">{user.name}</div>
                  <div className="text-gray-500 capitalize">{user.role}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-3 py-1 rounded-md text-sm hover:bg-red-700 transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;