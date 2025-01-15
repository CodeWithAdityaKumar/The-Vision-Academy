"use client"
import React, { useEffect, useState } from 'react';
import { auth, database, storage } from '@/lib/firebase';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { ref, onValue, update } from 'firebase/database';
import { useAuthState } from 'react-firebase-hooks/auth';
import { FiMail, FiPhone, FiMessageSquare, FiFacebook, FiInstagram, FiLinkedin, FiEdit, FiSave, FiX } from 'react-icons/fi';
import { motion } from 'framer-motion';

const Profile = () => {
  const [user] = useAuthState(auth);
  const [profileData, setProfileData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedData, setEditedData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const userRef = ref(database, `users/${user.uid}`);
      onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        setProfileData(data);
        setEditedData(data);
        setLoading(false);
      });
    }
  }, [user]);

  // Add handleImageUpload function
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setLoading(true);
      try {
        const storageReference = storageRef(storage, `profile-photos/${user.uid}-${Date.now()}-${file.name}`);
        await uploadBytes(storageReference, file);
        const downloadURL = await getDownloadURL(storageReference);

        // Update both local state and database
        const userRef = ref(database, `users/${user.uid}`);
        await update(userRef, { ...editedData, photoURL: downloadURL });
        setEditedData(prev => ({ ...prev, photoURL: downloadURL }));
        setProfileData(prev => ({ ...prev, photoURL: downloadURL }));
      } catch (error) {
        console.error("Error uploading image:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleCancel = () => {
    setEditedData(profileData);
    setEditMode(false);
  };

  const handleSave = async () => {
    try {
      const userRef = ref(database, `users/${user.uid}`);
      await update(userRef, editedData);
      setProfileData(editedData);
      setEditMode(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleChange = (field, value) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSocialLinkChange = (platform, value) => {
    setEditedData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value
      }
    }));
  };

  return (
    <div className="min-h-screen  py-12 px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <div className="backdrop-blur-md bg-white-900 dark:bg-black-800 rounded-2xl shadow-xl dark:shadow-blue-500-10 p-6 md:p-8 relative border border-gray-100 dark:border-gray-800">
          {!editMode ? (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleEdit}
              className="absolute top-4 right-4 p-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-all duration-300"
            >
              <FiEdit size={20} />
            </motion.button>
          ) : (
            <div className="absolute top-4 right-4 flex space-x-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                className="p-2 text-green-500 dark:text-green-400 hover:text-green-600 dark:hover:text-green-300 transition-all duration-300"
              >
                <FiSave size={20} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCancel}
                className="p-2 text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-all duration-300"
              >
                <FiX size={20} />
              </motion.button>
            </div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center mb-8"
          >
            <div className="relative group">
              <motion.img
                whileHover={{ scale: 1.05 }}
                src={editedData?.photoURL || '/images/default-profile-picture-png.png'}
                alt="Profile"
                className="h-32 w-32 md:h-40 md:w-40 rounded-full object-cover border-4 border-gray-200 dark:border-gray-800 transition-all duration-300 group-hover:border-blue-500 dark:group-hover:border-blue-400"
              />
              {editMode && (
                <motion.label
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  htmlFor="photo-upload"
                  className="absolute bottom-0 right-0 bg-blue-500 dark:bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-600 dark:hover:bg-blue-700 transition-all duration-300 shadow-lg"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </motion.label>
              )}
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-4 text-2xl md:text-3xl font-bold text-gray-800 dark:text-white"
            >
              {profileData?.name}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-blue-600 font-medium tracking-wide"
            >
              {profileData?.role.toUpperCase()}
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center space-x-3 p-4 rounded-lg bg-gray-50/30 dark:bg-black/50 backdrop-blur-sm transition-all duration-300 hover:shadow-lg dark:hover:bg-gray-900/50 border border-gray-100 dark:border-gray-800"
            >
              <FiMail className="text-blue-500 dark:text-blue-400 text-xl" />
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Email</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{profileData?.email}</p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center space-x-3 p-4 rounded-lg bg-gray-50/30 dark:bg-black/50 backdrop-blur-sm transition-all duration-300 hover:shadow-lg dark:hover:bg-gray-900/50 border border-gray-100 dark:border-gray-800"
            >
              <FiPhone className="text-blue-500 dark:text-blue-400 text-xl" />
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Phone</p>
                {editMode ? (
                  <input
                    type="text"
                    value={editedData?.phone || ''}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className="w-full px-2 py-1 font-medium border-b border-gray-200 dark:border-gray-800 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none bg-transparent dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600"
                  />
                ) : (
                  <p className="font-medium text-gray-900 dark:text-gray-100">{profileData?.phone || 'Not provided'}</p>
                )}
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center space-x-3 p-4 rounded-lg bg-gray-50/30 dark:bg-black/50 backdrop-blur-sm transition-all duration-300 hover:shadow-lg dark:hover:bg-gray-900/50 border border-gray-100 dark:border-gray-800"
            >
              <FiMessageSquare className="text-blue-500 dark:text-blue-400 text-xl" />
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">WhatsApp</p>
                {editMode ? (
                  <input
                    type="text"
                    value={editedData?.whatsapp || ''}
                    onChange={(e) => handleChange('whatsapp', e.target.value)}
                    className="w-full px-2 py-1 font-medium border-b border-gray-200 dark:border-gray-800 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none bg-transparent dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600"
                  />
                ) : (
                  <p className="font-medium text-gray-900 dark:text-gray-100">{profileData?.whatsapp || 'Not provided'}</p>
                )}
              </div>
            </motion.div>

            {profileData?.role === 'teacher' && (
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex items-center space-x-3 p-4 rounded-lg bg-gray-50/30 dark:bg-black/50 backdrop-blur-sm transition-all duration-300 hover:shadow-lg dark:hover:bg-gray-900/50 border border-gray-100 dark:border-gray-800"
              >
                <span className="text-blue-500 text-xl">📚</span>
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Subject</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{profileData?.subject || 'Not provided'}</p>
                </div>
              </motion.div>
            )}

            {profileData?.role === 'student' && (
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex items-center space-x-3 p-4 rounded-lg bg-gray-50/30 dark:bg-black/50 backdrop-blur-sm transition-all duration-300 hover:shadow-lg dark:hover:bg-gray-900/50 border border-gray-100 dark:border-gray-800"
              >
                <span className="text-blue-500 text-xl">🎓</span>
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Class</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{profileData?.class || 'Not provided'}</p>
                </div>
              </motion.div>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-4 mt-8"
          >
            <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-800 pb-2">
              Social Media Links
            </h4>
            <div className="flex flex-wrap items-center gap-4 mt-6">
              {editMode ? (
                <>
                  <div className="flex items-center space-x-2">
                    <FiFacebook className="text-blue-500 text-xl" />
                    <input
                      type="text"
                      value={editedData?.socialLinks?.facebook || ''}
                      onChange={(e) => handleSocialLinkChange('facebook', e.target.value)}
                      className="w-full px-2 py-1 font-medium border-b border-gray-200 dark:border-gray-800 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none bg-transparent dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600"
                      placeholder="Facebook URL"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <FiInstagram className="text-blue-500 text-xl" />
                    <input
                      type="text"
                      value={editedData?.socialLinks?.instagram || ''}
                      onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
                      className="w-full px-2 py-1 font-medium border-b border-gray-200 dark:border-gray-800 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none bg-transparent dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600"
                      placeholder="Instagram URL"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <FiLinkedin className="text-blue-500 text-xl" />
                    <input
                      type="text"
                      value={editedData?.socialLinks?.linkedin || ''}
                      onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)}
                      className="w-full px-2 py-1 font-medium border-b border-gray-200 dark:border-gray-800 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none bg-transparent dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600"
                      placeholder="LinkedIn URL"
                    />
                  </div>
                </>
              ) : (
                <>
                  {profileData?.socialLinks?.facebook && (
                    <a
                      href={profileData.socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-all duration-300"
                    >
                      <FiFacebook className="text-xl" />
                    </a>
                  )}
                  {profileData?.socialLinks?.instagram && (
                    <a
                      href={profileData.socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-all duration-300"
                    >
                      <FiInstagram className="text-xl" />
                    </a>
                  )}
                  {profileData?.socialLinks?.linkedin && (
                    <a
                      href={profileData.socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-all duration-300"
                    >
                      <FiLinkedin className="text-xl" />
                    </a>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {loading && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/90 flex items-center justify-center backdrop-blur-sm">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-blue-500 dark:border-blue-400 border-t-transparent rounded-full shadow-lg"
          />
        </div>
      )}
    </div>
  );
};

export default Profile;