"use client"
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { database } from '@/lib/firebase';
import { ref, onValue, remove, update } from 'firebase/database';
import { useAuth } from '@/components/AuthProvider';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ManageBooksAndNotes = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('notes');
  const [notes, setNotes] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('all');

  const inputClassName = "mt-1 block w-full px-4 py-3 rounded-lg border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 transition-all duration-200 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white hover:shadow-md focus:shadow-lg";
  const textareaClassName = "mt-1 block w-full px-4 py-3 rounded-lg border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 transition-all duration-200 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white hover:shadow-md focus:shadow-lg";
  const selectClassName = "mt-1 block w-full px-4 py-3 rounded-lg border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 transition-all duration-200 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white hover:shadow-md focus:shadow-lg";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const notesRef = ref(database, 'notes');
        const booksRef = ref(database, 'books');

        // Set up realtime listeners
        onValue(notesRef, (snapshot) => {
          const notesData = [];
          snapshot.forEach((child) => {
            notesData.push({ id: child.key, ...child.val() });
          });
          setNotes(notesData.filter(note => note.uploadedBy === user.email));
        });

        onValue(booksRef, (snapshot) => {
          const booksData = [];
          snapshot.forEach((child) => {
            booksData.push({ id: child.key, ...child.val() });
          });
          setBooks(booksData.filter(book => book.uploadedBy === user.email));
        });

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const handleDelete = async (id, type) => {
    if (window.confirm(`Are you sure you want to delete this ${type}?`)) {
      try {
        const itemRef = ref(database, `${type}/${id}`);
        await remove(itemRef);
        toast.success(`${type} deleted successfully!`);
      } catch (error) {
        console.error(`Error deleting ${type}:`, error);
        toast.error(`Failed to delete ${type}. Please try again.`);
      }
    }
  };

  const handleEdit = (item, type) => {
    setEditingItem({ ...item, type });
  };

  const handleUpdate = async () => {
    try {
      const { id, type, ...updateData } = editingItem;
      const itemRef = ref(database, `${type}/${id}`);
      await update(itemRef, updateData);
      setEditingItem(null);
      toast.success(`${type} updated successfully!`);
    } catch (error) {
      console.error(`Error updating ${editingItem.type}:`, error);
      toast.error(`Failed to update ${editingItem.type}. Please try again.`);
    }
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
  };

  const filterItems = (items) => {
    return items.filter(item => {
      const matchesClass = classFilter === 'all' || item.class === classFilter;
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = item.title.toLowerCase().includes(searchLower) ||
        item.subject.toLowerCase().includes(searchLower) ||
        (item.description?.toLowerCase().includes(searchLower) || '') ||
        (item.author?.toLowerCase().includes(searchLower) || '');
      return matchesClass && matchesSearch;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-2xl text-gray-700 dark:text-gray-300"
        >
          Loading...
        </motion.div>
      </div>
    );
  }

  if (editingItem) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto backdrop-blur-sm bg-white/80 dark:bg-gray-800/90 rounded-2xl shadow-2xl p-6"
        >
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
            Edit {editingItem.type === 'notes' ? 'Note' : 'Book'}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
              <input
                type="text"
                value={editingItem.title}
                onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                className={inputClassName}
              />
            </div>
            {editingItem.type === 'books' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Author</label>
                <input
                  type="text"
                  value={editingItem.author}
                  onChange={(e) => setEditingItem({ ...editingItem, author: e.target.value })}
                  className={inputClassName}
                />
              </div>
            )}
            {editingItem.type === 'notes' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  value={editingItem.description}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  className={textareaClassName}
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
              <input
                type="text"
                value={editingItem.subject}
                onChange={(e) => setEditingItem({ ...editingItem, subject: e.target.value })}
                className={inputClassName}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Class</label>
              <select
                value={editingItem.class}
                onChange={(e) => setEditingItem({ ...editingItem, class: e.target.value })}
                className={selectClassName}
              >
                {['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'].map((cls) => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>
            <div className="flex space-x-4 pt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleUpdate}
                className="flex-1 bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors duration-300"
              >
                Update
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCancelEdit}
                className="flex-1 bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors duration-300"
              >
                Cancel
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <ToastContainer position="top-right" theme="colored" />
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/90 rounded-2xl shadow-2xl p-6"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
            <div className="flex flex-wrap gap-4 justify-center md:justify-start w-full md:w-auto">
              {['notes', 'books'].map((tab) => (
                <motion.button
                  key={tab}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab(tab)}
                  className={`${activeTab === tab
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                    } px-6 py-3 rounded-full font-medium text-sm transition-all duration-300`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </motion.button>
              ))}
            </div>

            <div className="flex flex-wrap gap-4 w-full md:w-auto">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={inputClassName}
              />
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className={selectClassName}
              >
                <option value="all">All Classes</option>
                {['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'].map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {activeTab === 'notes' &&
                filterItems(notes).map((note) => (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition duration-300"
                  >
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {note.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      {note.description}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      {note.class} • {note.subject}
                    </p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(note, 'notes')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(note.id, 'notes')}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-300"
                      >
                        Delete
                      </button>
                    </div>
                  </motion.div>
                ))}

              {activeTab === 'books' &&
                filterItems(books).map((book) => (
                  <motion.div
                    key={book.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition duration-300"
                  >
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {book.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      By {book.author}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      {book.class} • {book.subject}
                    </p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(book, 'books')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(book.id, 'books')}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-300"
                      >
                        Delete
                      </button>
                    </div>
                  </motion.div>
                ))}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default ManageBooksAndNotes;
