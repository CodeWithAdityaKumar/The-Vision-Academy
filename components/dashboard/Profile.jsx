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

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 relative"
            >
                {!editMode ? (
                    <button
                        onClick={handleEdit}
                        className="absolute top-4 right-4 p-2 text-gray-600 hover:text-red-500"
                    >
                        <FiEdit size={20} />
                    </button>
                ) : (
                    <div className="absolute top-4 right-4 flex space-x-2">
                        <button onClick={handleSave} className="p-2 text-green-600 hover:text-green-700">
                            <FiSave size={20} />
                        </button>
                        <button onClick={handleCancel} className="p-2 text-red-600 hover:text-red-700">
                            <FiX size={20} />
                        </button>
                    </div>
                )}

                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Profile Information
                </h2>

                
                <div className="flex flex-col items-center mb-8">
                    <div className="relative">
                        <img
                            src={editedData?.photoURL || '/images/default-profile-picture-png.png'}
                            alt="Profile"
                            className="h-32 w-32 rounded-full object-cover border-4 border-gray-200"
                        />
                        {editMode && (
                            <label
                                htmlFor="photo-upload"
                                className="absolute bottom-0 right-0 bg-red-600 text-white p-2 rounded-full cursor-pointer hover:bg-red-700"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </label>
                        )}
                        <input
                            id="photo-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                        />
                    </div>
                    <h2 className="mt-4 text-2xl font-bold text-gray-800 dark:text-white">{profileData?.name}</h2>
                    <p className="text-red-600 font-medium">{profileData?.role.toUpperCase()}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Email - Read only */}
                    <div className="flex items-center space-x-3">
                        <FiMail className="text-red-500 text-xl" />
                        <div>
                            <p className="text-gray-600 text-sm">Email</p>
                            <p className="font-medium">{profileData?.email}</p>
                        </div>
                    </div>

                    {/* Phone */}
                    <div className="flex items-center space-x-3">
                        <FiPhone className="text-red-500 text-xl" />
                        <div>
                            <p className="text-gray-600 text-sm">Phone</p>
                            {editMode ? (
                                <input
                                    type="text"
                                    value={editedData?.phone || ''}
                                    onChange={(e) => handleChange('phone', e.target.value)}
                                    className="w-full px-2 py-1 font-medium border-b border-gray-300 focus:border-red-500 focus:outline-none bg-transparent"
                                />
                            ) : (
                                <p className="font-medium">{profileData?.phone || 'Not provided'}</p>
                            )}
                        </div>
                    </div>

                    {/* WhatsApp */}
                    <div className="flex items-center space-x-3">
                        <FiMessageSquare className="text-red-500 text-xl" />
                        <div>
                            <p className="text-gray-600 text-sm">WhatsApp</p>
                            {editMode ? (
                                <input
                                    type="text"
                                    value={editedData?.whatsapp || ''}
                                    onChange={(e) => handleChange('whatsapp', e.target.value)}
                                    className="w-full px-2 py-1 font-medium border-b border-gray-300 focus:border-red-500 focus:outline-none bg-transparent"
                                />
                            ) : (
                                <p className="font-medium">{profileData?.whatsapp || 'Not provided'}</p>
                            )}
                        </div>
                    </div>

                    {/* Subject/Class - Read only */}
                    {profileData?.role === 'teacher' && (
                        <div className="flex items-center space-x-3">
                            <span className="text-red-500 text-xl">📚</span>
                            <div>
                                <p className="text-gray-600 text-sm">Subject</p>
                                <p className="font-medium">{profileData?.subject || 'Not provided'}</p>
                            </div>
                        </div>
                    )}

                    {profileData?.role === 'student' && (
                        <div className="flex items-center space-x-3">
                            <span className="text-red-500 text-xl">🎓</span>
                            <div>
                                <p className="text-gray-600 text-sm">Class</p>
                                <p className="font-medium">{profileData?.class || 'Not provided'}</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <h4 className="text-lg font-medium text-gray-800">Social Media Links</h4>
                    <div className="flex items-center space-x-6 mt-6">
                        {editMode ? (
                            <>
                                <div className="flex items-center space-x-2">
                                    <FiFacebook className="text-red-500 text-xl" />
                                    <input
                                        type="text"
                                        value={editedData?.socialLinks?.facebook || ''}
                                        onChange={(e) => handleSocialLinkChange('facebook', e.target.value)}
                                        className="w-full px-2 py-1 font-medium border-b border-gray-300 focus:border-red-500 focus:outline-none bg-transparent"
                                        placeholder="Facebook URL"
                                    />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <FiInstagram className="text-red-500 text-xl" />
                                    <input
                                        type="text"
                                        value={editedData?.socialLinks?.instagram || ''}
                                        onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
                                        className="w-full px-2 py-1 font-medium border-b border-gray-300 focus:border-red-500 focus:outline-none bg-transparent"
                                        placeholder="Instagram URL"
                                    />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <FiLinkedin className="text-red-500 text-xl" />
                                    <input
                                        type="text"
                                        value={editedData?.socialLinks?.linkedin || ''}
                                        onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)}
                                        className="w-full px-2 py-1 font-medium border-b border-gray-300 focus:border-red-500 focus:outline-none bg-transparent"
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
                                        className="text-gray-600 hover:text-red-500 transition-colors duration-200"
                                    >
                                        <FiFacebook className="text-xl" />
                                    </a>
                                )}
                                {profileData?.socialLinks?.instagram && (
                                    <a
                                        href={profileData.socialLinks.instagram}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-gray-600 hover:text-red-500 transition-colors duration-200"
                                    >
                                        <FiInstagram className="text-xl" />
                                    </a>
                                )}
                                {profileData?.socialLinks?.linkedin && (
                                    <a
                                        href={profileData.socialLinks.linkedin}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-gray-600 hover:text-red-500 transition-colors duration-200"
                                    >
                                        <FiLinkedin className="text-xl" />
                                    </a>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Profile;