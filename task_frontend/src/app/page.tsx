"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";

export default function Home() {
  const { user, isAuthenticated, logout } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  // Prevent hydration mismatch by only running client-side code after mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  // Show loading before mount to prevent hydration mismatch
  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="text-center space-y-8 max-w-2xl">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Task Management App
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Organize your tasks efficiently with authentication and real-time updates
          </p>
        </div>

        {isAuthenticated ? (
          <div className="space-y-4">
            <p className="text-lg text-gray-700 dark:text-gray-200">
              Welcome back, {user?.email}!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/tasks"
                className="bg-black text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                Go to Tasks
              </Link>
              <button
                onClick={handleLogout}
                className="border border-black text-black px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="bg-black text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="border border-black text-black px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
