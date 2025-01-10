"use client"
import { useState } from 'react';
import { motion } from 'framer-motion';
import { auth, database, storage } from '@/lib/firebase';
import { ref, push, set } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';

export default function AddUsers() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [uid, setUid] = useState('None');
    const [userType, setUserType] = useState('teachers'); // default value
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'teacher', // default role
        subject: '',
        class: '',
        phone: '',
        whatsapp: '',
        about: '',
        photoURL: '/images/default-profile-picture-png.png',
        socialLinks: {
            facebook: '',
            instagram: '',
            linkedin: ''
        }
    });

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

    const generateTempPassword = () => {
        return Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Create authentication account
            const tempPassword = generateTempPassword();
            let userCredential;
            try {
                userCredential = await createUserWithEmailAndPassword(auth, formData.email, tempPassword);
            } catch (error) {
                if (error.code === 'auth/email-already-in-use') {
                    throw new Error('User already exists');
                }
                throw error;
            }

            // Send verification email
            await sendEmailVerification(userCredential.user);
            setUid(userCredential.user.uid);
            

            // Add user data to database
            const dbRef = ref(database, "users/" + userCredential.user.uid);
            await set(dbRef, formData);

            // Reset form
            setFormData({
                name: '',
                email: '',
                role: 'teacher', // default role
                subject: '',
                class: '',
                phone: '',
                whatsapp: '',
                about: '',
                photoURL: '/images/default-profile-picture-png.png',
                socialLinks: {
                    facebook: '',
                    instagram: '',
                    linkedin: ''
                }
            });

            alert('User added successfully and verification email sent!');
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Add this function to handle user type change
    const handleUserTypeChange = (type) => {
        setUserType(type);
        // Update role based on type
        const role = type === 'teachers' ? 'teacher' : type === 'students' ? 'student' : 'admin';
        setFormData(prev => ({ ...prev, role: role }));
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl"
            >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Add New User
                </h2>

                {error && (
                    <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
                        {error}
                    </div>
                )}

                <div className="mb-6">
                    <div className="flex space-x-4">
                        <button
                            onClick={() => handleUserTypeChange('teachers')}
                            className={`px-4 py-2 rounded-lg ${
                                userType === 'teachers'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-gray-200 text-gray-700'
                            }`}
                        >
                            Teacher
                        </button>
                        <button
                            onClick={() => handleUserTypeChange('students')}
                            className={`px-4 py-2 rounded-lg ${
                                userType === 'students'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-gray-200 text-gray-700'
                            }`}
                        >
                            Student
                        </button>
                        <button
                            onClick={() => handleUserTypeChange('admin')}
                            className={`px-4 py-2 rounded-lg ${
                                userType === 'admin'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-gray-200 text-gray-700'
                            }`}
                        >
                            Admin
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="relative">
                            <img
                                src={formData.photoURL || '/images/default-profile-picture-png.png'}
                                alt="Profile Preview"
                                className="h-32 w-32 rounded-full object-cover border-4 border-gray-200"
                            />
                            <label
                                htmlFor="photo-upload"
                                className="absolute bottom-0 right-0 bg-red-600 text-white p-2 rounded-full cursor-pointer hover:bg-red-700"
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
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500"
                            required
                        />

                        <input
                            type="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500"
                            required
                        />

                        {userType === 'teachers' ? (
                            <input
                                type="text"
                                placeholder="Subject"
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500"
                                required
                            />
                        ) : userType === 'students' ? (
                            <input
                                type="text"
                                placeholder="Class"
                                value={formData.class}
                                onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500"
                                required
                            />
                        ) : null}

                        <input
                            type="tel"
                            placeholder="Phone Number"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500"
                            required
                        />

                        <input
                            type="tel"
                            placeholder="WhatsApp Number"
                            value={formData.whatsapp}
                            onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500"
                        />
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-lg font-medium">Social Media Links</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input
                                type="url"
                                placeholder="Facebook URL"
                                value={formData.socialLinks.facebook}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    socialLinks: { ...formData.socialLinks, facebook: e.target.value }
                                })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500"
                            />

                            <input
                                type="url"
                                placeholder="Instagram URL"
                                value={formData.socialLinks.instagram}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    socialLinks: { ...formData.socialLinks, instagram: e.target.value }
                                })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500"
                            />

                            <input
                                type="url"
                                placeholder="LinkedIn URL"
                                value={formData.socialLinks.linkedin}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    socialLinks: { ...formData.socialLinks, linkedin: e.target.value }
                                })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={() => setFormData({
                                name: '',
                                email: '',
                                role: 'teacher', // default role
                                subject: '',
                                class: '',
                                phone: '',
                                whatsapp: '',
                                about: '',
                                photoURL: '/images/default-profile-picture-png.png',
                                socialLinks: {
                                    facebook: '',
                                    instagram: '',
                                    linkedin: ''
                                }
                            })}
                            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                        >
                            Clear
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                        >
                            {loading ? 'Adding...' : 'Add User'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}