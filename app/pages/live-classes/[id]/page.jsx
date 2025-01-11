"use client"
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { database, auth } from '@/lib/firebase';
import { ref, onValue, off } from 'firebase/database';
import { onAuthStateChanged } from 'firebase/auth';
import Link from 'next/link';

const LiveClassDetails = () => {
  const params = useParams();
  const router = useRouter();
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push('/login');
      } else {
        setUser(currentUser);
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const classRef = ref(database, `liveClasses/${params.id}`);
    
    const handleData = (snapshot) => {
      setLoading(true);
      try {
        const data = snapshot.val();
        if (data) {
          setClassData({
            id: params.id,
            ...data,
            requirements: data.requirements || [],
            topics: data.topics || [],
            teacherImage: data.teacherImage || '/images/default-teacher.jpg'
          });
        } else {
          setError('Class not found');
        }
      } catch (err) {
        setError('Failed to load class details');
        console.error('Error loading class details:', err);
      } finally {
        setLoading(false);
      }
    };

    // Set up realtime listener
    onValue(classRef, handleData, (err) => {
      setError('Failed to load class details');
      console.error('Error setting up class details listener:', err);
      setLoading(false);
    });

    // Cleanup listener on unmount
    return () => off(classRef);
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading class details...</p>
        </div>
      </div>
    );
  }

  if (error || !classData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center text-red-600 dark:text-red-400">
          <p>{error || 'Class not found'}</p>
          <Link 
            href="/pages/live-classes" 
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-300 inline-block"
          >
            Back to Classes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden"
        >
          <div className="relative h-96">
            <Image
              src={classData.thumbnail}
              alt={classData.title}
              layout="fill"
              objectFit="cover"
            />
            {classData.status === 'live' && (
              <div className="absolute top-4 right-4 bg-red-600 text-white px-6 py-2 rounded-full text-lg font-semibold animate-pulse">
                LIVE NOW
              </div>
            )}
          </div>

          <div className="p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {classData.title}
                </h1>
                <p className="text-xl text-red-600 dark:text-red-400">
                  {classData.subject}
                </p>
              </div>
              <Link href={classData.meetingLink} target='_blank'>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-4 md:mt-0 bg-red-600 text-white px-8 py-3 rounded-md hover:bg-red-700 transition duration-300 text-lg font-semibold"
              >
                Join Live Class
                </motion.button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="col-span-2">
                <div className="prose dark:prose-invert max-w-none">
                  <h2 className="text-2xl font-semibold mb-4">About This Class</h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    {classData.description}
                  </p>

                  {classData.topics && classData.topics.length > 0 && (
                    <>
                      <h3 className="text-xl font-semibold mt-6 mb-4">Topics Covered</h3>
                      <ul className="list-disc pl-5 space-y-2">
                        {classData.topics.map((topic, index) => (
                          <li key={index} className="text-gray-600 dark:text-gray-300">
                            {topic}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}

                  {classData.requirements && classData.requirements.length > 0 && (
                    <>
                      <h3 className="text-xl font-semibold mt-6 mb-4">Requirements</h3>
                      <ul className="list-disc pl-5 space-y-2">
                        {classData.requirements.map((req, index) => (
                          <li key={index} className="text-gray-600 dark:text-gray-300">
                            {req}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              </div>

              <div>
                <div className="bg-gray-100 dark:bg-gray-700 p-6 rounded-lg">
                  <div className="flex items-center space-x-4 mb-6">
                    <Image
                      src={classData.teacherImage}
                      alt={classData.teacher}
                      width={60}
                      height={60}
                      className="rounded-full"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {classData.teacher}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">Instructor</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Date</h4>
                      <p className="text-gray-600 dark:text-gray-400">{classData.date}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Time</h4>
                      <p className="text-gray-600 dark:text-gray-400">{classData.time}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LiveClassDetails;