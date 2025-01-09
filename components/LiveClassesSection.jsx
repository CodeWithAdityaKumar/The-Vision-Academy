"use client"
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { database, auth } from '@/lib/firebase';
import { ref, onValue, off } from 'firebase/database';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';

export default function LiveClassesSection() {
  const router = useRouter();
  const { user } = useAuth();
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [liveClasses, setLiveClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      router.push('/pages/account/login');
      return;
    }

    const liveClassesRef = ref(database, 'liveClasses');
    
    const handleData = (snapshot) => {
      setLoading(true);
      try {
        const data = snapshot.val();
        if (data) {
          const classesArray = Object.entries(data).map(([id, values]) => ({
            id,
            ...values,
          }));
          setLiveClasses(classesArray);
        } else {
          setLiveClasses([]);
        }
      } catch (err) {
        setError('Failed to load live classes');
        console.error('Error loading live classes:', err);
      } finally {
        setLoading(false);
      }
    };

    onValue(liveClassesRef, handleData, (err) => {
      setError('Failed to load live classes');
      console.error('Error setting up live classes listener:', err);
      setLoading(false);
    });

    return () => off(liveClassesRef);
  }, [user, router]);

  const filteredClasses = liveClasses.filter(classItem => {
    const matchesFilter = filter === 'all' || classItem.status === filter;
    const matchesSearch = classItem.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         classItem.teacher?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         classItem.subject?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading classes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center text-red-600 dark:text-red-400">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-300"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Live Classes
          </h2>
          <p className="text-xl text-red-600 dark:text-red-400">
            Join Our Interactive Sessions
          </p>
        </motion.div>

        <div className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex space-x-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md ${
                filter === 'all'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              All Classes
            </button>
            <button
              onClick={() => setFilter('live')}
              className={`px-4 py-2 rounded-md ${
                filter === 'live'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Live Now
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-4 py-2 rounded-md ${
                filter === 'upcoming'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Upcoming
            </button>
          </div>
          <div className="w-full md:w-auto">
            <input
              type="text"
              placeholder="Search classes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredClasses.map((classItem) => (
            <motion.div
              key={classItem.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
            >
              <Link href={`/pages/live-classes/${classItem.id}`}>
                <div className="relative h-48">
                  <Image
                    src={classItem.thumbnail}
                    alt={classItem.title}
                    layout="fill"
                    objectFit="cover"
                  />
                  {classItem.status === 'live' && (
                    <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold animate-pulse">
                      LIVE
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {classItem.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {classItem.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      <p>By {classItem.teacher}</p>
                      <p>{classItem.time}</p>
                      <p>{classItem.date}</p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-300"
                    >
                      Join Class
                    </motion.button>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
} 