// src/components/Header.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
}

interface HeaderProps {
  user?: User;
}

export default function Header({ user }: HeaderProps) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={() => router.push('/analytics')}
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                CommentIQ
              </span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-gray-700">
                  Welcome, <span className="font-semibold">{user.name}</span>
                </span>
                <button
                  onClick={() => router.push('/analytics')}
                  className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition"
                >
                  Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => router.push('/')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                Login
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="text-gray-600 hover:text-gray-900 focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {showMenu ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {showMenu && (
          <div className="md:hidden py-4 border-t border-gray-200">
            {user ? (
              <>
                <div className="px-4 py-2 text-gray-700">
                  Welcome, <span className="font-semibold">{user.name}</span>
                </div>
                <button
                  onClick={() => {
                    router.push('/analytics');
                    setShowMenu(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-50"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => {
                    handleLogout();
                    setShowMenu(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  router.push('/');
                  setShowMenu(false);
                }}
                className="block w-full text-left px-4 py-2 text-blue-600 hover:bg-blue-50"
              >
                Login
              </button>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
