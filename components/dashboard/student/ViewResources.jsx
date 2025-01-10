import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { auth, database } from '@/lib/firebase';
import { ref, onValue, off } from 'firebase/database';
import { useAuthState } from 'react-firebase-hooks/auth';

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
                setStudentClass("Class "+ data.class);
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

    if (loading) {
        return <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>;
    }

    const currentItems = activeTab === 'notes' ? notes : books;
    const filteredItems = filterItems(currentItems);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 space-y-4 md:space-y-0">
                <div className="flex space-x-4">
                    <button
                        onClick={() => setActiveTab('notes')}
                        className={`px-6 py-2 rounded-lg transition duration-300 ${activeTab === 'notes'
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}
                    >
                        Notes
                    </button>
                    <button
                        onClick={() => setActiveTab('books')}
                        className={`px-6 py-2 rounded-lg transition duration-300 ${activeTab === 'books'
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}
                    >
                        Books
                    </button>
                </div>

                <div className="flex items-center space-x-4">
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                    <span className="text-gray-600 dark:text-gray-300">
                        Class: {studentClass}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.length === 0 ? (
                    <p className="col-span-full text-center text-gray-500 dark:text-gray-400">
                        No {activeTab} available.
                    </p>
                ) : (
                    filteredItems.map((item) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition duration-300"
                        >
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                {item.title}
                            </h3>
                            {activeTab === 'books' && (
                                <p className="text-gray-600 dark:text-gray-400 mb-2">
                                    By {item.author}
                                </p>
                            )}
                            {activeTab === 'notes' && item.description && (
                                <p className="text-gray-600 dark:text-gray-400 mb-2">
                                    {item.description}
                                </p>
                            )}
                            <p className="text-gray-500 dark:text-gray-400 mb-4">
                                {item.class} • {item.subject}
                            </p>
                            <a
                                href={item.downloadUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block w-full text-center bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-300"
                            >
                                Download {activeTab === 'notes' ? 'Note' : 'Book'}
                            </a>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ViewResources;