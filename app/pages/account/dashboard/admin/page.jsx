"use client"
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { auth, database } from '@/lib/firebase.js';
import { ref, onValue, push, remove, update, off } from 'firebase/database';
import { useRouter } from 'next/navigation';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import {sendEmailVerification, createUserWithEmailAndPassword} from 'firebase/auth';

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('teachers');
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    isVerified: 'all',
    subject: 'all', 
    class: 'all'
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    subject: '',
    class: '',
    phone: '',
    whatsapp: '',
    about: '',
    photoURL: '',
    socialLinks: {
      facebook: '',
      instagram: '',
      linkedin: ''
    }
  });
  const [emailVerificationStatus, setEmailVerificationStatus] = useState({});

  useEffect(() => {
    // Check if user is admin
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user || user.email !== 'ak6414119@gmail.com') {
        router.push('/pages/account/login');
      } else {
        setupRealtimeListeners();
      }
    });

    return () => {
      unsubscribe();
      const teachersRef = ref(database, 'teachers');
      const studentsRef = ref(database, 'students');
      off(teachersRef);
      off(studentsRef);
    };
  }, []);

  const setupRealtimeListeners = () => {
    setLoading(true);
    
    // Listen for teachers data
    const teachersRef = ref(database, 'teachers');
    onValue(teachersRef, async (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const teachersArray = await Promise.all(
          Object.entries(data).map(async ([id, values]) => {
            if (auth.currentUser?.email === values.email) {
              await auth.currentUser.reload();
            }
            const isVerified = auth.currentUser?.email === values.email ? 
              auth.currentUser.emailVerified : false;
            
            return {
              id,
              ...values,
              isEmailVerified: isVerified
            };
          })
        );
        setTeachers(teachersArray);
      } else {
        setTeachers([]);
      }
      setLoading(false);
    });

    // Listen for students data
    const studentsRef = ref(database, 'students');
    onValue(studentsRef, async (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const studentsArray = await Promise.all(
          Object.entries(data).map(async ([id, values]) => {
            if (auth.currentUser?.email === values.email) {
              await auth.currentUser.reload();
            }
            const isVerified = auth.currentUser?.email === values.email ? 
              auth.currentUser.emailVerified : false;
            
            return {
              id,
              ...values,
              isEmailVerified: isVerified
            };
          })
        );
        setStudents(studentsArray);
      } else {
        setStudents([]);
      }
      setLoading(false);
    });
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const dbRef = ref(database, activeTab);
      await push(dbRef, formData);
      sendVerificationEmail(formData.email);
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      setError('Failed to add item');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const dbRef = ref(database, `${activeTab}/${selectedItem.id}`);
      await update(dbRef, formData);
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      setError('Failed to update item');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      setLoading(true);
      try {
        const dbRef = ref(database, `${activeTab}/${id}`);
        await remove(dbRef);
      } catch (error) {
        setError('Failed to delete item');
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      role: '',
      subject: '',
      class: '',
      phone: '',
      whatsapp: '',
      about: '',
      photoURL: '',
      socialLinks: {
        facebook: '',
        instagram: '',
        linkedin: ''
      }
    });
    setSelectedItem(null);
  };

  const openAddModal = () => {
    resetForm();
    setModalMode('add');
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setFormData(item);
    setSelectedItem(item);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setLoading(true);
      try {
        const storageReference = storageRef(storage, `profile-photos/${Date.now()}-${file.name}`);
        await uploadBytes(storageReference, file);
        const downloadURL = await getDownloadURL(storageReference);
        setFormData({ ...formData, photoURL: downloadURL });
      } catch (error) {
        setError('Failed to upload image');
      } finally {
        setLoading(false);
      }
    }
  };

  const filterData = (data) => {
    return data.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.phone.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesVerified = filters.isVerified === 'all' ? true : 
                             filters.isVerified === 'verified' ? item.isVerified : !item.isVerified;
      const matchesSubject = filters.subject === 'all' ? true : item.subject === filters.subject;
      const matchesClass = filters.class === 'all' ? true : item.class === filters.class;
      
      return matchesSearch && matchesVerified && 
             (activeTab === 'teachers' ? matchesSubject : matchesClass);
    });
  };

  const sendVerificationEmail = async (email) => {
    try {
      let userCredential;
      try {
        const tempPassword = generateTempPassword();
        userCredential = await createUserWithEmailAndPassword(auth, email, tempPassword);
      } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
          setError('User already exists. Ask them to verify through their account.');
          return;
        } else {
          throw error;
        }
      }

      await sendEmailVerification(userCredential.user);
      alert('Verification email sent successfully!');

    } catch (error) {
      console.error('Error:', error);
      setError(
        error.code === 'auth/invalid-email' 
          ? 'Invalid email address' 
          : 'Failed to send verification email: ' + error.message
      );
    }
  };

  const generateTempPassword = () => {
    return Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
  };

  useEffect(() => {
    const refreshVerificationStatus = async () => {
      if (auth.currentUser) {
        await auth.currentUser.reload();
        setupRealtimeListeners();
      }
    };

    refreshVerificationStatus();

    const interval = setInterval(refreshVerificationStatus, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin Dashboard
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Manage teachers and students
          </p>
        </motion.div>

        {error && (
          <div className="mb-4 text-red-500 text-center">{error}</div>
        )}

        <div className="mb-6 flex justify-center space-x-4">
          <button
            onClick={() => setActiveTab('teachers')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'teachers'
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Teachers
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'students'
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Students
          </button>
        </div>

        <div className="mb-6 space-y-4">
          <div className="max-w-md mx-auto">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="flex flex-wrap gap-4 justify-center">
            <select
              value={filters.isVerified}
              onChange={(e) => setFilters({ ...filters, isVerified: e.target.value })}
              className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Verification Status</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
            </select>

            {activeTab === 'teachers' ? (
              <select
                value={filters.subject}
                onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
                className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Subjects</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
              </select>
            ) : (
              <select
                value={filters.class}
                onChange={(e) => setFilters({ ...filters, class: e.target.value })}
                className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Classes</option>
                <option value="Class 6">Class 6</option>
                <option value="Class 7">Class 7</option>
                <option value="Class 8">Class 8</option>
              </select>
            )}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
        >
          <div className="flex justify-end mb-4">
            <button
              onClick={openAddModal}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-300"
            >
              Add {activeTab === 'teachers' ? 'Teacher' : 'Student'}
            </button>
          </div>

          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Profile
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Email Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filterData(activeTab === 'teachers' ? teachers : students).map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={item.photoURL || '/default-avatar.png'}
                              alt={item.name}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {item.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {item.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
                        {item.role}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
                        {item.phone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            item.email === auth.currentUser?.email && auth.currentUser?.emailVerified
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {item.email === auth.currentUser?.email && auth.currentUser?.emailVerified 
                              ? 'Verified' 
                              : 'Not Verified'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={() => openEditModal(item)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {modalMode === 'add' ? `Add New ${activeTab === 'teachers' ? 'Teacher' : 'Student'}` : 'Edit Details'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={modalMode === 'add' ? handleAdd : handleUpdate} className="space-y-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <img
                    src={formData.photoURL || '/default-avatar.png'}
                    alt="Profile Preview"
                    className="h-32 w-32 rounded-full object-cover border-4 border-gray-200 dark:border-gray-700"
                  />
                  <label
                    htmlFor="photo-upload"
                    className="absolute bottom-0 right-0 bg-red-600 text-white p-2 rounded-full cursor-pointer hover:bg-red-700 transition-colors"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </label>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
                {loading && <p className="text-sm text-gray-500">Uploading image...</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                      required
                    />
                  </div>
                  {activeTab === 'teachers' ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Subject
                      </label>
                      <input
                        type="text"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                        required
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Class
                      </label>
                      <input
                        type="text"
                        value={formData.class}
                        onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                        required
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      WhatsApp Number
                    </label>
                    <input
                      type="tel"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Social Media Links</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Facebook
                      </label>
                      <input
                        type="text"
                        value={formData.socialLinks.facebook}
                        onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, facebook: e.target.value }})}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Instagram
                      </label>
                      <input
                        type="text"
                        value={formData.socialLinks.instagram}
                        onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, instagram: e.target.value }})}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        LinkedIn
                      </label>
                      <input
                        type="text"
                        value={formData.socialLinks.linkedin}
                        onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, linkedin: e.target.value }})}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-6">
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    auth.currentUser?.email === formData.email && auth.currentUser?.emailVerified
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {auth.currentUser?.email === formData.email && auth.currentUser?.emailVerified 
                      ? 'Email Verified' 
                      : 'Email Verification Status Unknown'}
                  </span>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Processing...' : modalMode === 'add' ? 'Add' : 'Update'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
