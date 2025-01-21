"use client"
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { database } from '@/lib/firebase';
import { ref, remove, update, onValue, off } from 'firebase/database';
import Image from 'next/image';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Add styled className constants
const inputClassName = "mt-1 block w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 transition-all duration-200 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white hover:shadow-md focus:shadow-lg";
const labelClassName = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";
const buttonClassName = "px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-300";

function EditClassForm({ classData, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    title: classData.title || '',
    subject: classData.subject || '',
    description: classData.description || '',
    date: classData.date || '',
    time: classData.time || '',
    status: classData.status || 'upcoming',
    meetingLink: classData.meetingLink || '',
    teacher: classData.teacher || '',
    teacherEmail: classData.teacherEmail || '',
    teacherPhone: classData.teacherPhone || '',
    targetClass: classData.targetClass || 'Class 6',  // Add this line
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label className={labelClassName}>Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className={inputClassName}
          />
        </div>

        <div>
          <label className={labelClassName}>Subject</label>
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
            className={inputClassName}
          />
        </div>

        <div>
          <label className={labelClassName}>Target Class</label>
          <select
            name="targetClass"
            required
            value={formData.targetClass}
            onChange={handleChange}
            className={inputClassName}
          >
            {['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'].map(cls => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>
        </div>

        <div className="col-span-2">
          <label className={labelClassName}>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className={inputClassName}
          />
        </div>

        <div>
          <label className={labelClassName}>Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            className={inputClassName}
          />
        </div>

        <div>
          <label className={labelClassName}>Time</label>
          <input
            type="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            required
            className={inputClassName}
          />
        </div>

        <div>
          <label className={labelClassName}>Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className={inputClassName}
          >
            <option value="upcoming">Upcoming</option>
            <option value="live">Live</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div>
          <label className={labelClassName}>Meeting Link</label>
          <input
            type="url"
            name="meetingLink"
            value={formData.meetingLink}
            onChange={handleChange}
            required
            className={inputClassName}
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:space-x-4 pt-4 sm:pt-6">
        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`${buttonClassName} w-full sm:w-auto`}
        >
          Save Changes
        </motion.button>
        <motion.button
          type="button"
          onClick={onCancel}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full sm:w-auto px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-300"
        >
          Cancel
        </motion.button>
      </div>
    </form>
  );
}

export default function ManageClasses() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingClass, setEditingClass] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    const liveClassesRef = ref(database, 'liveClasses');

    const handleData = (snapshot) => {
      setLoading(true);
      try {
        const data = snapshot.val();
        if (data) {
          // Convert object to array and add ID to each item
          const classesArray = Object.entries(data).map(([id, values]) => ({
            id,
            ...values,
          }));
          setClasses(classesArray);
        } else {
          setClasses([]);
        }
      } catch (err) {
        setError('Failed to load live classes');
        console.error('Error loading live classes:', err);
      } finally {
        setLoading(false);
      }
    };

    // Set up realtime listener
    onValue(liveClassesRef, handleData, (err) => {
      setError('Failed to load live classes');
      console.error('Error setting up live classes listener:', err);
      setLoading(false);
    });

    // Cleanup listener on unmount
    return () => off(liveClassesRef);
  }, []);

  const handleDelete = async (classId) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      try {
        await remove(ref(database, `liveClasses/${classId}`));
        toast.success('Class deleted successfully!');
      } catch (err) {
        toast.error('Failed to delete class');
        console.error('Error deleting class:', err);
      }
    }
  };

  const handleUpdate = async (classId, updatedData) => {
    try {
      await update(ref(database, `liveClasses/${classId}`), updatedData);
      setEditingClass(null);
      toast.success('Class updated successfully!');
    } catch (err) {
      toast.error('Failed to update class');
      console.error('Error updating class:', err);
    }
  };

  const filterAndSortClasses = () => {
    return classes
      .filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.subject.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        const order = sortOrder === 'asc' ? 1 : -1;
        switch (sortBy) {
          case 'date':
            return (new Date(a.date) - new Date(b.date)) * order;
          case 'title':
            return a.title.localeCompare(b.title) * order;
          case 'status':
            return a.status.localeCompare(b.status) * order;
          default:
            return 0;
        }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 py-6 sm:py-12 px-2 sm:px-4">
      <ToastContainer position="top-right" theme="colored" />
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/90 rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl p-4 sm:p-6"
        >
          {/* Add Search, Filter, and Sort Controls */}
          <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="w-full">
              <input
                type="text"
                placeholder="Search classes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={inputClassName}
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`${inputClassName}`}
              >
                <option value="all">All Status</option>
                <option value="upcoming">Upcoming</option>
                <option value="live">Live</option>
                <option value="completed">Completed</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`${inputClassName}`}
              >
                <option value="date">Sort by Date</option>
                <option value="title">Sort by Title</option>
                <option value="status">Sort by Status</option>
              </select>
              <button
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="px-3 sm:px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors col-span-2 sm:col-span-1"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div layout className="grid grid-cols-1 gap-4 sm:gap-6">
              {filterAndSortClasses().map((classItem) => (
                <motion.div
                  key={classItem.id}
                  layout
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 hover:shadow-xl transition-all duration-300"
                >
                  {editingClass === classItem.id ? (
                    <EditClassForm
                      classData={classItem}
                      onSave={(updatedData) => handleUpdate(classItem.id, updatedData)}
                      onCancel={() => setEditingClass(null)}
                    />
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                      <div className="flex-1 flex flex-col sm:flex-row gap-4 sm:gap-6">
                        <div className="relative h-32 w-full sm:w-32 rounded-lg overflow-hidden">
                          <Image
                            src={classItem.thumbnail || '/images/default-class-thumbnail.jpg'}
                            alt={classItem.title}
                            layout="fill"
                            objectFit="cover"
                            className="transition-transform hover:scale-110 duration-300"
                          />
                        </div>
                        <div className="flex-1 space-y-2">
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            {classItem.title}
                          </h3>
                          <div className="flex flex-wrap gap-2 text-sm">
                            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                              {classItem.targetClass}
                            </span>
                            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                              {classItem.subject}
                            </span>
                            <span className={`px-3 py-1 rounded-full ${classItem.status === 'live' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' :
                                classItem.status === 'completed' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100' :
                                  'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                              }`}>
                              {classItem.status}
                            </span>
                          </div>
                          <p className="text-gray-600 dark:text-gray-300">
                            {new Date(classItem.date).toLocaleDateString()} at {classItem.time}
                          </p>
                          <p className="text-gray-500 dark:text-gray-400">
                            By {classItem.teacher}
                          </p>
                        </div>
                      </div>
                      <div className="flex sm:flex-col gap-2 sm:gap-3 mt-2 sm:mt-0">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setEditingClass(classItem.id)}
                          className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Edit
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDelete(classItem.id)}
                          className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-sm sm:text-base bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Delete
                        </motion.button>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}