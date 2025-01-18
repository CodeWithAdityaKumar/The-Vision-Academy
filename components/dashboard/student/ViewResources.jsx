import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, database } from '@/lib/firebase';
import { ref, onValue, off } from 'firebase/database';
import { useAuthState } from 'react-firebase-hooks/auth';
import { FiBook, FiFileText, FiSearch, FiDownload } from 'react-icons/fi';

const ViewResources = () => {
    const [user] = useAuthState(auth);
    const [notes, setNotes] = useState([]);
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('notes');
    const [searchQuery, setSearchQuery] = useState('');
    const [studentClass, setStudentClass] = useState(null);

    useEffect(() => {
        if (!user) return;

        try {
            const notesRef = ref(database, 'notes');
            const booksRef = ref(database, 'books');

            onValue(notesRef, (snapshot) => {
                const notesData = [];
                snapshot.forEach((child) => {
                    notesData.push({ id: child.key, ...child.val() });
                });
                setNotes(notesData);
            });

            onValue(booksRef, (snapshot) => {
                const booksData = [];
                snapshot.forEach((child) => {
                    booksData.push({ id: child.key, ...child.val() });
                });
                setBooks(booksData);
            });

            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setError(error.message);
            setLoading(false);
        }

        return () => {
            const notesRef = ref(database, 'notes');
            const booksRef = ref(database, 'books');
            off(notesRef);
            off(booksRef);
        };
    }, [user]);

    // Add student data fetch
    useEffect(() => {
        if (!user) return;

        const studentRef = ref(database, `users/${user.uid}`);
        onValue(studentRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setStudentClass("Class " + data.class);
            }
        });
    }, [user]);

    // Update filterItems function
    const filterItems = (items) => {
        return items.filter(item => {
            const matchesClass = item.class === studentClass;
            const searchLower = searchQuery.toLowerCase();
            const matchesSearch = item.title.toLowerCase().includes(searchLower) ||
                item.subject.toLowerCase().includes(searchLower) ||
                (item.description?.toLowerCase().includes(searchLower) || '') ||
                (item.author?.toLowerCase().includes(searchLower) || '');
            return matchesClass && matchesSearch;
        });
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                duration: 0.2
            }
        },
        exit: {
            opacity: 0,
            scale: 0.95,
            transition: {
                duration: 0.15
            }
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full"
                />
            </div>
        );
    }

    const currentItems = activeTab === 'notes' ? notes : books;
    const filteredItems = filterItems(currentItems);

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto"
        >
            {/* Header Section */}
            <div className="flex flex-col space-y-4 lg:flex-row lg:justify-between lg:items-center lg:space-y-0">
                <div className="flex flex-wrap gap-3">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setActiveTab('notes')}
                        className={`flex items-center space-x-2 px-6 py-3 rounded-full transition duration-300 ${activeTab === 'notes'
                                ? 'bg-red-600 text-white shadow-lg'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}
                    >
                        <FiFileText />
                        <span>Notes</span>
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setActiveTab('books')}
                        className={`flex items-center space-x-2 px-6 py-3 rounded-full transition duration-300 ${activeTab === 'books'
                                ? 'bg-red-600 text-white shadow-lg'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}
                    >
                        <FiBook />
                        <span>Books</span>
                    </motion.button>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                    <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search resources..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-3 w-full sm:w-64 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-600 focus:border-transparent"
                        />
                    </div>
                    <div className="px-4 py-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                        {studentClass}
                    </div>
                </div>
            </div>

            {/* Grid Layout */}
            <motion.div
                layout
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
                {filteredItems.length === 0 ? (
                    <motion.div
                        layout
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="col-span-full flex flex-col items-center justify-center p-8 text-center"
                    >
                        <div className="text-5xl mb-4">
                            {activeTab === 'notes' ? '📝' : '📚'}
                        </div>
                        <p className="text-xl text-gray-500 dark:text-gray-400">
                            No {activeTab} available for your class.
                        </p>
                    </motion.div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        {filteredItems.map((item) => (
                            <motion.div
                                layout
                                key={item.id}
                                variants={itemVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                            >
                                <motion.div layout className="p-6">
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                                        {item.title}
                                    </h3>
                                    {activeTab === 'books' && (
                                        <p className="text-gray-600 dark:text-gray-400 mb-2">
                                            By {item.author}
                                        </p>
                                    )}
                                    {activeTab === 'notes' && item.description && (
                                        <p className="text-gray-600 dark:text-gray-400 mb-2 line-clamp-3">
                                            {item.description}
                                        </p>
                                    )}
                                    <div className="flex justify-between items-center mt-4">
                                        <span className="px-3 py-1 rounded-full text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                                            {item.subject}
                                        </span>
                                        <motion.a
                                            href={item.downloadUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700 transition duration-300"
                                        >
                                            <FiDownload />
                                            <span>Download</span>
                                        </motion.a>
                                    </div>
                                </motion.div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </motion.div>
        </motion.div>
    );
};

export default ViewResources;