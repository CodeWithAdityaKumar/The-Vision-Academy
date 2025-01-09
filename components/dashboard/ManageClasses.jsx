"use client"
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { database } from '@/lib/firebase';
import { ref, remove, update, onValue, off } from 'firebase/database';
import Image from 'next/image';

// Add EditClassForm component
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
    teacherQualification: classData.teacherQualification || '',
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Title
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="mt-1 p-3 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Subject
          </label>
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
            className="mt-1 p-3 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="mt-1 p-3 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Date
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            className="mt-1 p-3 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Time
          </label>
          <input
            type="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            required
            className="mt-1 p-3 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="mt-1 p-3 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="upcoming">Upcoming</option>
            <option value="live">Live</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Meeting Link
          </label>
          <input
            type="url"
            name="meetingLink"
            value={formData.meetingLink}
            onChange={handleChange}
            required
            className="mt-1 p-3 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
}

export default function ManageClasses() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingClass, setEditingClass] = useState(null);

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
      } catch (err) {
        setError('Failed to delete class');
        console.error('Error deleting class:', err);
      }
    }
  };

  const handleUpdate = async (classId, updatedData) => {
    try {
      await update(ref(database, `liveClasses/${classId}`), updatedData);
      setEditingClass(null);
    } catch (err) {
      setError('Failed to update class');
      console.error('Error updating class:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {classes.map((classItem) => (
          <motion.div
            key={classItem.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
          >
            {editingClass === classItem.id ? (
              <EditClassForm
                classData={classItem}
                onSave={(updatedData) => handleUpdate(classItem.id, updatedData)}
                onCancel={() => setEditingClass(null)}
              />
            ) : (
              <div className="flex items-start justify-between">
                <div className="flex space-x-4">
                  <div className="relative h-24 w-24">
                    <Image
                      src={classItem.thumbnail || '/images/default-class-thumbnail.jpg'}
                      alt={classItem.title}
                      layout="fill"
                      objectFit="cover"
                      className="rounded-lg"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {classItem.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {classItem.date} at {classItem.time}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      By {classItem.teacher}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Status: {classItem.status}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setEditingClass(classItem.id)}
                    className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(classItem.id)}
                    className="px-3 py-1 text-sm text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
} 