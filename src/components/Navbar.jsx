import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FiLogOut, FiUser, FiHome, FiFolder, FiCheckSquare, 
  FiBarChart2, FiMenu, FiX 
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    const success = await logout();
    if (success) {
      navigate('/login');
    }
    setIsMobileMenuOpen(false);
  };

  const navItems = user?.role === 'Admin' ? [
    { path: '/admin', name: 'Dashboard', icon: FiHome },
    { path: '/admin/projects', name: 'Projects', icon: FiFolder },
    { path: '/admin/tasks', name: 'Tasks', icon: FiCheckSquare },
    { path: '/admin/users', name: 'Users', icon: FiUser },
    { path: '/admin/analytics', name: 'Analytics', icon: FiBarChart2 },
  ] : [
    { path: '/member', name: 'Dashboard', icon: FiHome },
    { path: '/member/my-tasks', name: 'My Tasks', icon: FiCheckSquare },
    { path: '/member/projects', name: 'Projects', icon: FiFolder },
  ];

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav className="glass-effect sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            {/* Logo Section */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg sm:text-xl">TM</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold gradient-text">TaskMaster</h1>
            </div>

            {/* Desktop Navigation - Hidden on mobile */}
            <div className="hidden md:flex space-x-6 lg:space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-primary-500 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-primary-100'
                    }`}
                  >
                    <Icon className="text-lg" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* User Info & Mobile Menu Button */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              {/* User Info - Hidden on very small screens */}
              <div className="hidden sm:flex items-center space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="hidden lg:block">
                  <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                  <p className="text-xs text-gray-600">{user?.role}</p>
                </div>
              </div>
              
              {/* Logout Button - Hidden on mobile */}
              <button
                onClick={handleLogout}
                className="hidden sm:flex items-center space-x-2 px-3 sm:px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 text-sm sm:text-base"
              >
                <FiLogOut />
                <span className="hidden sm:inline">Logout</span>
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all duration-200"
              >
                {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu - Slide down animation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden fixed top-16 left-0 right-0 bg-white/95 backdrop-blur-lg shadow-xl z-40 overflow-hidden"
          >
            <div className="container mx-auto px-4 py-4">
              {/* Mobile User Info */}
              <div className="flex items-center space-x-3 pb-4 mb-4 border-b border-gray-200">
                <div className="w-12 h-12 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-base font-semibold text-gray-800">{user?.name}</p>
                  <p className="text-sm text-gray-600">{user?.email}</p>
                  <p className="text-xs text-primary-600 font-semibold mt-1">{user?.role}</p>
                </div>
              </div>

              {/* Mobile Navigation Links */}
              <div className="space-y-2">
                {navItems.map((item, idx) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <motion.div
                      key={item.path}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Link
                        to={item.path}
                        onClick={closeMobileMenu}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                          isActive
                            ? 'bg-primary-500 text-white shadow-lg'
                            : 'text-gray-700 hover:bg-primary-50'
                        }`}
                      >
                        <Icon className="text-xl" />
                        <span className="font-medium">{item.name}</span>
                      </Link>
                    </motion.div>
                  );
                })}
                
                {/* Mobile Logout Button */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all duration-200 mt-4"
                  >
                    <FiLogOut className="text-xl" />
                    <span className="font-medium">Logout</span>
                  </button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;