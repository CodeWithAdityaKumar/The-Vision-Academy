'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { database } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';
import { FiCalendar, FiClock, FiAlertCircle } from 'react-icons/fi';

export default function StudentNotices() {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedNotice, setSelectedNotice] = useState(null);
    const [filter, setFilter] = useState('all');

    // TODO: Replace with actual student's class ID from authentication/user data
    const studentClassId = "class3"; // Temporary class ID for demonstration

    useEffect(() => {
        const noticesRef = ref(database, 'classNotices');
        const unsubscribe = onValue(noticesRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const noticesList = Object.entries(data)
                    .map(([id, notice]) => ({
                        id,
                        ...notice,
                        timestamp: new Date(notice.timestamp)
                    }))
                    .filter(notice => 
                        notice.targetClasses.includes('all') || 
                        notice.targetClasses.includes(studentClassId)
                    )
                    .sort((a, b) => b.timestamp - a.timestamp);
                setNotices(noticesList);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [studentClassId]);

    const filteredNotices = notices.filter(notice => {
        if (filter === 'all') return true;
        return notice.type === filter;
    });

    const noticeVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
        exit: { opacity: 0, scale: 0.95 }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        Class Notices
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        View all notices and announcements for your class
                    </p>
                </motion.div>

                {/* Filter Buttons */}
                <div className="flex justify-center gap-4 mb-8 flex-wrap">
                    {['all', 'urgent', 'general', 'homework', 'exam'].map((type) => (
                        <button
                            key={type}
                            onClick={() => setFilter(type)}
                            className={`px-4 py-2 rounded-full capitalize transition-all ${
                                filter === type 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {filteredNotices.map((notice) => (
                                <motion.div
                                    key={notice.id}
                                    variants={noticeVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    layoutId={notice.id}
                                    onClick={() => setSelectedNotice(notice)}
                                    className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 cursor-pointer 
                                        hover:shadow-xl transition-all duration-300 border-l-4 ${
                                            notice.type === 'urgent' 
                                                ? 'border-red-500' 
                                                : notice.type === 'homework'
                                                ? 'border-yellow-500'
                                                : notice.type === 'exam'
                                                ? 'border-purple-500'
                                                : 'border-green-500'
                                        }`}
                                >
                                    <div className={`text-sm font-semibold mb-2 inline-block px-2 py-1 rounded-full ${
                                        notice.type === 'urgent' 
                                            ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300'
                                            : notice.type === 'homework'
                                            ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300'
                                            : notice.type === 'exam'
                                            ? 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300'
                                            : 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300'
                                    }`}>
                                        {notice.type.toUpperCase()}
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                        {notice.title}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                                        {notice.content}
                                    </p>
                                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                        <FiCalendar className="mr-2" />
                                        {notice.timestamp.toLocaleDateString()}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {/* Notice Modal */}
                <AnimatePresence>
                    {selectedNotice && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedNotice(null)}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        >
                            <motion.div
                                layoutId={selectedNotice.id}
                                className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full"
                                onClick={e => e.stopPropagation()}
                            >
                                <div className={`text-sm font-semibold mb-4 inline-block px-2 py-1 rounded-full ${
                                    selectedNotice.type === 'urgent' 
                                        ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300'
                                        : selectedNotice.type === 'homework'
                                        ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300'
                                        : selectedNotice.type === 'exam'
                                        ? 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300'
                                        : 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300'
                                }`}>
                                    {selectedNotice.type.toUpperCase()}
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                    {selectedNotice.title}
                                </h2>
                                <p className="text-gray-600 dark:text-gray-400 mb-6 whitespace-pre-wrap">
                                    {selectedNotice.content}
                                </p>
                                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                                    <div className="flex items-center">
                                        <FiCalendar className="mr-2" />
                                        {selectedNotice.timestamp.toLocaleDateString()}
                                        <FiClock className="ml-4 mr-2" />
                                        {selectedNotice.timestamp.toLocaleTimeString()}
                                    </div>
                                    <button 
                                        onClick={() => setSelectedNotice(null)}
                                        className="text-blue-500 hover:text-blue-600 font-medium"
                                    >
                                        Close
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {filteredNotices.length === 0 && !loading && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-12"
                    >
                        <FiAlertCircle className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            No notices found
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            {filter === 'all' 
                                ? 'There are no notices for your class at the moment.' 
                                : `There are no ${filter} notices for your class.`}
                        </p>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
