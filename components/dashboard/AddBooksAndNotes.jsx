"use client"
import { useState } from 'react';
import { motion } from 'framer-motion';
import { database, storage } from '@/lib/firebase';
import { ref, push } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '@/components/AuthProvider';

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

  const handleFileUpload = async (file, path) => {
    const fileRef = storageRef(storage, `${path}/${Date.now()}-${file.name}`);
    await uploadBytes(fileRef, file);
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
      alert('Notes uploaded successfully!');
    } catch (error) {
      console.error('Error uploading notes:', error);
      alert('Failed to upload notes. Please try again.');
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
      alert('Book uploaded successfully!');
    } catch (error) {
      console.error('Error uploading book:', error);
      alert('Failed to upload book. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNotesFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setNotesForm({ ...notesForm, file });
    } else {
      alert('Please select a PDF file');
      e.target.value = '';
    }
  };

  const handleBooksFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setBooksForm({ ...booksForm, file });
    } else {
      alert('Please select a PDF file');
      e.target.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden"
        >
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('notes')}
                className={`${
                  activeTab === 'notes'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
              >
                Add Notes
              </button>
              <button
                onClick={() => setActiveTab('books')}
                className={`${
                  activeTab === 'books'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
              >
                Add Books
              </button>
            </nav>
          </div>

          <div className="p-6">
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
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                    <textarea 
                      value={notesForm.description}
                      onChange={(e) => setNotesForm({ ...notesForm, description: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500" 
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
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Class</label>
                    <select 
                      value={notesForm.class}
                      onChange={(e) => setNotesForm({ ...notesForm, class: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
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
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Author</label>
                    <input 
                      type="text" 
                      value={booksForm.author}
                      onChange={(e) => setBooksForm({ ...booksForm, author: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Subject</label>
                    <input 
                      type="text" 
                      value={booksForm.subject}
                      onChange={(e) => setBooksForm({ ...booksForm, subject: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Class</label>
                    <select 
                      value={booksForm.class}
                      onChange={(e) => setBooksForm({ ...booksForm, class: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
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
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AddBooksAndNotes;
