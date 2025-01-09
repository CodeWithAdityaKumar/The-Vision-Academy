"use client"
import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { database } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';
import HeroSection from '@/components/HeroSection';
import AboutSection from '@/components/AboutSection';

export default function Home() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isTeacher, setIsTeacher] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      // Check if user is admin
      const adminEmail = 'ak6414119@gmail.com';
      setIsAdmin(user.email === adminEmail);

      // Check if user is a teacher
      const teachersRef = ref(database, 'teachers');
      const unsubscribe = onValue(teachersRef, (snapshot) => {
        const teachers = snapshot.val();
        if (teachers) {
          const isUserTeacher = Object.values(teachers).some(
            teacher => teacher.email === user.email
          );
          setIsTeacher(isUserTeacher);
        }
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, [user]);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <HeroSection />

      {/* Quick Actions for Admin/Teacher */}
      {!loading && (isAdmin || isTeacher) && (
        <section className="py-8 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 shadow-lg"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {isAdmin && (
                  <Link href="/pages/account/dashboard/admin">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-all cursor-pointer"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Admin Dashboard
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        Manage users and content
                      </p>
                    </motion.div>
                  </Link>
                )}
                {isTeacher && (
                  <Link href="/pages/account/dashboard/teachers">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-all cursor-pointer"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Teacher Dashboard
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        Manage your classes and materials
                      </p>
                    </motion.div>
                  </Link>
                )}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Our Features
            </h2>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
              Everything you need to succeed in your studies
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="text-red-600 dark:text-red-400 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <AboutSection />
    </main>
  );
}

const features = [
  {
    title: "Expert Teachers",
    description: "Learn from highly qualified and experienced educators.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    )
  },
  {
    title: "Interactive Learning",
    description: "Engage in live classes and interactive sessions.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    )
  },
  {
    title: "Quality Resources",
    description: "Access comprehensive study materials and resources.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    )
  }
]; 