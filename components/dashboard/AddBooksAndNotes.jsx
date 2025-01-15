"use client"
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { database, storage } from '@/lib/firebase';
import { ref, push } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '@/components/AuthProvider';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AddBooksAndNotes = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('notes');
  const [loading, setLoading] = useState(false);
  const [notesForm, setNotesForm] = useState({
    title: '',
    description: '',
    subject: '',
    class: 'Class 6',
    file: null
  });
  const [booksForm, setBooksForm] = useState({
    title: '',
    author: '',
    subject: '',
    class: 'Class 6',
    file: null
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const inputClassName = "mt-1 block w-full px-4 py-3 rounded-lg border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 transition-all duration-200 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white hover:shadow-md focus:shadow-lg";
  const textareaClassName = "mt-1 block w-full px-4 py-3 rounded-lg border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 transition-all duration-200 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white hover:shadow-md focus:shadow-lg";
  const selectClassName = "mt-1 block w-full px-4 py-3 rounded-lg border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 transition-all duration-200 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white hover:shadow-md focus:shadow-lg";

  const handleFileUpload = async (file, path) => {
    const fileRef = storageRef(storage, `${path}/${Date.now()}-${file.name}`);

    // Simulating upload progress
    const uploadTask = uploadBytes(fileRef, file);
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 10;
      if (progress <= 90) setUploadProgress(progress);
    }, 200);

    await uploadTask;
    clearInterval(progressInterval);
    setUploadProgress(100);
    return getDownloadURL(fileRef);
  };

  const handleNotesSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fileUrl = await handleFileUpload(notesForm.file, 'notes');
      const notesRef = ref(database, 'notes');
      await push(notesRef, {
        ...notesForm,
        downloadUrl: fileUrl,
        uploadedBy: user.email,
        uploadedAt: new Date().toISOString()
      });
      setNotesForm({
        title: '',
        description: '',
        subject: '',
        class: 'Class 6',
        file: null
      });
      toast.success('Notes uploaded successfully!');
    } catch (error) {
      console.error('Error uploading notes:', error);
      toast.error('Failed to upload notes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBooksSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fileUrl = await handleFileUpload(booksForm.file, 'books');
      const booksRef = ref(database, 'books');
      await push(booksRef, {
        ...booksForm,
        downloadUrl: fileUrl,
        uploadedBy: user.email,
        uploadedAt: new Date().toISOString()
      });
      setBooksForm({
        title: '',
        author: '',
        subject: '',
        class: 'Class 6',
        file: null
      });
      toast.success('Book uploaded successfully!');
    } catch (error) {
      console.error('Error uploading book:', error);
      toast.error('Failed to upload book. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNotesFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setNotesForm({ ...notesForm, file });
    } else {
      toast.error('Please select a PDF file');
      e.target.value = '';
    }
  };

  const handleBooksFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setBooksForm({ ...booksForm, file });
    } else {
      toast.error('Please select a PDF file');
      e.target.value = '';
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e, formType) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      if (formType === 'notes') {
        setNotesForm({ ...notesForm, file });
      } else {
        setBooksForm({ ...booksForm, file });
      }
    } else {
      toast.error('Please select a PDF file');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 py-12">
      <ToastContainer position="top-right" theme="colored" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/90 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex justify-center space-x-4 p-4">
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
                  Add {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </motion.button>
              ))}
            </nav>
          </div>

          {/* Form Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="p-6 md:p-8"
            >
              {/* File Upload Area */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, activeTab)}
                className={`mb-8 p-8 border-2 border-dashed rounded-lg text-center transition-all duration-300 ${isDragging
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    : 'border-gray-300 dark:border-gray-600'
                  }`}
              >
                <div className="flex flex-col items-center space-y-4">
                  <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Drag and drop your PDF file here, or click to select
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6"
                >
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-red-600 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">
                    Uploading... {uploadProgress}%
                  </p>
                </motion.div>
              )}

              {/* Rest of the form fields with enhanced styling */}
              {activeTab === 'notes' ? (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Notes</h2>
                  <form onSubmit={handleNotesSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
                      <input
                        type="text"
                        value={notesForm.title}
                        onChange={(e) => setNotesForm({ ...notesForm, title: e.target.value })}
                        className={inputClassName}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                      <textarea
                        value={notesForm.description}
                        onChange={(e) => setNotesForm({ ...notesForm, description: e.target.value })}
                        className={textareaClassName}
                        rows={3}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Subject</label>
                      <input
                        type="text"
                        value={notesForm.subject}
                        onChange={(e) => setNotesForm({ ...notesForm, subject: e.target.value })}
                        className={inputClassName}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Class</label>
                      <select
                        value={notesForm.class}
                        onChange={(e) => setNotesForm({ ...notesForm, class: e.target.value })}
                        className={selectClassName}
                        required
                      >
                        <option>Class 6</option>
                        <option>Class 7</option>
                        <option>Class 8</option>
                        <option>Class 9</option>
                        <option>Class 10</option>
                        <option>Class 11</option>
                        <option>Class 12</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Upload Notes (PDF)</label>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleNotesFileChange}
                        className="mt-1 block w-full"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading || !notesForm.file}
                      className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                      {loading ? 'Uploading...' : 'Upload Notes'}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Book</h2>
                  <form onSubmit={handleBooksSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
                      <input
                        type="text"
                        value={booksForm.title}
                        onChange={(e) => setBooksForm({ ...booksForm, title: e.target.value })}
                        className={inputClassName}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Author</label>
                      <input
                        type="text"
                        value={booksForm.author}
                        onChange={(e) => setBooksForm({ ...booksForm, author: e.target.value })}
                        className={inputClassName}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Subject</label>
                      <input
                        type="text"
                        value={booksForm.subject}
                        onChange={(e) => setBooksForm({ ...booksForm, subject: e.target.value })}
                        className={inputClassName}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Class</label>
                      <select
                        value={booksForm.class}
                        onChange={(e) => setBooksForm({ ...booksForm, class: e.target.value })}
                        className={selectClassName}
                        required
                      >
                        <option>Class 6</option>
                        <option>Class 7</option>
                        <option>Class 8</option>
                        <option>Class 9</option>
                        <option>Class 10</option>
                        <option>Class 11</option>
                        <option>Class 12</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Upload Book (PDF)</label>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleBooksFileChange}
                        className="mt-1 block w-full"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading || !booksForm.file}
                      className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                      {loading ? 'Uploading...' : 'Upload Book'}
                    </button>
                  </form>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default AddBooksAndNotes;
