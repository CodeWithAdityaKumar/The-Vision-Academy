"use client"
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { database, storage } from '@/lib/firebase';
import { ref as dbRef, push, set, onValue } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/navigation';

export default function CreateLiveClass() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [topics, setTopics] = useState(['']);
  const [requirements, setRequirements] = useState(['']);
  const [thumbnail, setThumbnail] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    description: '',
    date: '',
    time: '',
    status: 'upcoming',
    teacher: '',
    teacherImage: '',
    teacherEmail: '',
    teacherPhone: '',
    meetingLink: '',
    targetClass: 'Class 6',

  });

  const [user] = useAuthState(auth);

  useEffect(() => {
    if (!user) return;

    const teacherRef = dbRef(database, `users/${user.uid}`);
    onValue(teacherRef, (snapshot) => {
      const teacherData = snapshot.val();
      if (teacherData) {
        setFormData(prev => ({
          ...prev,
          teacher: teacherData.name || '',
          teacherEmail: teacherData.email || '',
          teacherPhone: teacherData.phone || '',
          teacherImage: teacherData.photoURL || ''
        }));
      }
    });
  }, [user]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTopicChange = (index, value) => {
    const newTopics = [...topics];
    newTopics[index] = value;
    setTopics(newTopics);
  };

  const handleRequirementChange = (index, value) => {
    const newRequirements = [...requirements];
    newRequirements[index] = value;
    setRequirements(newRequirements);
  };

  const addTopic = () => setTopics([...topics, '']);
  const removeTopic = (index) => {
    const newTopics = topics.filter((_, i) => i !== index);
    setTopics(newTopics);
  };

  const addRequirement = () => setRequirements([...requirements, '']);
  const removeRequirement = (index) => {
    const newRequirements = requirements.filter((_, i) => i !== index);
    setRequirements(newRequirements);
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setThumbnail(file);
    } else {
      setError('Please select a valid image file');
    }
  };

  const showError = (message) => toast.error(message);
  const showSuccess = (message) => toast.success(message);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Upload thumbnail if selected
      let thumbnailUrl = '';
      if (thumbnail) {
        const fileRef = storageRef(storage, `class-thumbnails/${Date.now()}-${thumbnail.name}`);
        await uploadBytes(fileRef, thumbnail);
        thumbnailUrl = await getDownloadURL(fileRef);
      }

      // Create new class entry in database
      const newClassRef = push(dbRef(database, 'liveClasses'));
      await set(newClassRef, {
        ...formData,
        topics: topics.filter(topic => topic.trim() !== ''),
        requirements: requirements.filter(req => req.trim() !== ''),
        thumbnail: thumbnailUrl || '/images/default-class-thumbnail.jpg',
        createdAt: Date.now(),
      });

      showSuccess('Class created successfully!');
      router.push('/pages/live-classes');
    } catch (err) {
      showError('Failed to create class. Please try again.');
      console.error('Error creating class:', err);
    } finally {
      setLoading(false);
    }
  };

  const inputClassName = "mt-1 block w-full px-4 py-3 rounded-lg border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 transition-all duration-200 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white hover:shadow-md focus:shadow-lg";
  const labelClassName = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";
  const buttonClassName = "px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <ToastContainer position="top-right" theme="colored" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto backdrop-blur-sm bg-white/80 dark:bg-gray-800/90 rounded-2xl shadow-2xl p-6 md:p-8"
      >
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Create New Live Class</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClassName}>Class Title</label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className={inputClassName}
              />
            </div>

            <div>
              <label className={labelClassName}>Subject</label>
              <input
                type="text"
                name="subject"
                required
                value={formData.subject}
                onChange={handleChange}
                className={inputClassName}
              />
            </div>
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

          <div>
            <label className={labelClassName}>Description</label>
            <textarea
              name="description"
              required
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className={inputClassName}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClassName}>Date</label>
              <input
                type="date"
                name="date"
                required
                value={formData.date}
                onChange={handleChange}
                className={inputClassName}
              />
            </div>

            <div>
              <label className={labelClassName}>Time</label>
              <input
                type="time"
                name="time"
                required
                value={formData.time}
                onChange={handleChange}
                className={inputClassName}
              />
            </div>
          </div>

          <div>
            <label className={labelClassName}>Thumbnail</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleThumbnailChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
            />
          </div>

          <div>
            <label className={labelClassName}>Topics Covered</label>
            {topics.map((topic, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => handleTopicChange(index, e.target.value)}
                  className={inputClassName}
                />
                <button
                  type="button"
                  onClick={() => removeTopic(index)}
                  className="px-2 py-1 text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addTopic}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              + Add Topic
            </button>
          </div>

          <div>
            <label className={labelClassName}>Requirements</label>
            {requirements.map((req, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={req}
                  onChange={(e) => handleRequirementChange(index, e.target.value)}
                  className={inputClassName}
                />
                <button
                  type="button"
                  onClick={() => removeRequirement(index)}
                  className="px-2 py-1 text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addRequirement}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              + Add Requirement
            </button>
          </div>

          <div className="space-y-6 border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Teacher Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClassName}>Teacher Name</label>
                <input
                  type="text"
                  name="teacher"
                  value={formData.teacher}
                  readOnly
                  className="mt-2 p-3 block w-full rounded-md border-gray-300 bg-gray-100 dark:bg-gray-600 shadow-sm dark:text-white cursor-not-allowed"
                />
              </div>

              <div>
                <label className={labelClassName}>Email</label>
                <input
                  type="email"
                  name="teacherEmail"
                  value={formData.teacherEmail}
                  readOnly
                  className="mt-2 p-3 block w-full rounded-md border-gray-300 bg-gray-100 dark:bg-gray-600 shadow-sm dark:text-white cursor-not-allowed"
                />
              </div>

              <div>
                <label className={labelClassName}>Phone</label>
                <input
                  type="tel"
                  name="teacherPhone"
                  value={formData.teacherPhone}
                  readOnly
                  className="mt-2 p-3 block w-full rounded-md border-gray-300 bg-gray-100 dark:bg-gray-600 shadow-sm dark:text-white cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className={labelClassName}>Meeting Link</label>
              <input
                type="url"
                name="meetingLink"
                required
                value={formData.meetingLink}
                onChange={handleChange}
                placeholder="https://meet.google.com/..."
                className={inputClassName}
              />
            </div>
          </div>

          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center"
              >
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
                  <p className="text-center mt-4 text-gray-600 dark:text-gray-300">Creating class...</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full ${buttonClassName}`}
          >
            {loading ? 'Creating...' : 'Create Class'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}