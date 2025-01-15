"use client"
import { useState } from 'react';
import { motion } from 'framer-motion';
import { storage } from '@/lib/firebase';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import axios from 'axios';

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
        },
        rollNumber: '',
        dateOfJoining: new Date().toISOString().split('T')[0],
        fatherName: '',
        motherName: '',
        addressPermanent: '',
        pincodePermanent: '',
        addressCurrent: '',
        pincodeCurrent: '',
        sameAsPermament: false,
        session: new Date().getFullYear(),
        nationality: 'India',
        dateOfBirth: '',
        board: 'CBSE',
        aadharNumber: '',
        bloodGroup: '',
        category: 'General',
        religion: '',
        gender: 'Male',
        contactPersonal: '',
        contactParents: '',
        schoolName: ''
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Send data to API route
            const response = await axios.post('/api/account/dashboard/admin/users/addUsers', formData);
            
            if (response.status === 201) {
                setUid(response.data.uid);
                // Reset form
                setFormData({
                    name: '',
                    email: '',
                    role: 'teacher',
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
                    },
                    rollNumber: '',
                    dateOfJoining: new Date().toISOString().split('T')[0],
                    fatherName: '',
                    motherName: '',
                    addressPermanent: '',
                    pincodePermanent: '',
                    addressCurrent: '',
                    pincodeCurrent: '',
                    sameAsPermament: false,
                    session: new Date().getFullYear(),
                    nationality: 'India',
                    dateOfBirth: '',
                    board: 'CBSE',
                    aadharNumber: '',
                    bloodGroup: '',
                    category: 'General',
                    religion: '',
                    gender: 'Male',
                    contactPersonal: '',
                    contactParents: '',
                    schoolName: ''
                });
                alert('User added successfully and verification email sent!');
            }
        } catch (error) {
            setError(error.response?.data?.error || 'Failed to add user');
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

    // Add handler for same as permanent address
    const handleSameAddress = (e) => {
        if (e.target.checked) {
            setFormData(prev => ({
                ...prev,
                sameAsPermament: true,
                addressCurrent: prev.addressPermanent,
                pincodeCurrent: prev.pincodePermanent
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                sameAsPermament: false,
                addressCurrent: '',
                pincodeCurrent: ''
            }));
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-[1rem]"
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
                            <>
                                <input
                                    type="text"
                                    placeholder="Class"
                                    value={formData.class}
                                    onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500"
                                    required
                                />

                                <input
                                    type="date"
                                    value={formData.dateOfJoining}
                                    onChange={(e) => setFormData({ ...formData, dateOfJoining: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300"
                                    required
                                />

                                <input
                                    type="number"
                                    placeholder="Roll Number"
                                    value={formData.rollNumber}
                                    onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300"
                                    required
                                />

                                <input
                                    type="text"
                                    placeholder="Father's Name"
                                    value={formData.fatherName}
                                    onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300"
                                    required
                                />

                                <input
                                    type="text"
                                    placeholder="Mother's Name (Optional)"
                                    value={formData.motherName}
                                    onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300"
                                />

                                <textarea
                                    placeholder="Permanent Address"
                                    value={formData.addressPermanent}
                                    onChange={(e) => setFormData({ ...formData, addressPermanent: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300"
                                    required
                                    rows={3}
                                />

                                <input
                                    type="number"
                                    placeholder="Permanent Address Pincode"
                                    value={formData.pincodePermanent}
                                    onChange={(e) => setFormData({ ...formData, pincodePermanent: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300"
                                    required
                                />

                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="sameAddress"
                                        checked={formData.sameAsPermament}
                                        onChange={handleSameAddress}
                                        className="rounded border-gray-300"
                                    />
                                    <label htmlFor="sameAddress">Same as Permanent Address</label>
                                </div>

                                {!formData.sameAsPermament && (
                                    <>
                                        <textarea
                                            placeholder="Current Address"
                                            value={formData.addressCurrent}
                                            onChange={(e) => setFormData({ ...formData, addressCurrent: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300"
                                            required
                                            rows={3}
                                        />

                                        <input
                                            type="number"
                                            placeholder="Current Address Pincode"
                                            value={formData.pincodeCurrent}
                                            onChange={(e) => setFormData({ ...formData, pincodeCurrent: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300"
                                            required
                                        />
                                    </>
                                )}

                                {/* Additional Fields */}
                                <input
                                    type="number"
                                    placeholder="Session Year"
                                    value={formData.session}
                                    onChange={(e) => setFormData({ ...formData, session: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300"
                                    required
                                />

                                <input
                                    type="date"
                                    placeholder="Date of Birth"
                                    value={formData.dateOfBirth}
                                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300"
                                    required
                                />

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium">Board</label>
                                    <div className="space-x-4">
                                        {['CBSE', 'BSEB', 'OTHER'].map((board) => (
                                            <label key={board} className="inline-flex items-center">
                                                <input
                                                    type="radio"
                                                    value={board}
                                                    checked={formData.board === board}
                                                    onChange={(e) => setFormData({ ...formData, board: e.target.value })}
                                                    className="form-radio"
                                                />
                                                <span className="ml-2">{board}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <input
                                    type="number"
                                    placeholder="Aadhar Number"
                                    value={formData.aadharNumber}
                                    onChange={(e) => setFormData({ ...formData, aadharNumber: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300"
                                    minLength={12}
                                    maxLength={12}
                                    required
                                />

                                <input
                                    type="text"
                                    placeholder="Blood Group (Optional)"
                                    value={formData.bloodGroup}
                                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300"
                                />

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium">Category</label>
                                    <div className="space-x-4">
                                        {['General', 'OBC', 'SC/ST'].map((cat) => (
                                            <label key={cat} className="inline-flex items-center">
                                                <input
                                                    type="radio"
                                                    value={cat}
                                                    checked={formData.category === cat}
                                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                                    className="form-radio"
                                                />
                                                <span className="ml-2">{cat}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <input
                                    type="text"
                                    placeholder="Religion"
                                    value={formData.religion}
                                    onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300"
                                    required
                                />

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium">Gender</label>
                                    <div className="space-x-4">
                                        {['Male', 'Female', 'Other'].map((gender) => (
                                            <label key={gender} className="inline-flex items-center">
                                                <input
                                                    type="radio"
                                                    value={gender}
                                                    checked={formData.gender === gender}
                                                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                                    className="form-radio"
                                                />
                                                <span className="ml-2">{gender}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <input
                                    type="tel"
                                    placeholder="Personal Contact"
                                    value={formData.contactPersonal}
                                    onChange={(e) => setFormData({ ...formData, contactPersonal: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300"
                                    required
                                />

                                <input
                                    type="tel"
                                    placeholder="Parents Contact"
                                    value={formData.contactParents}
                                    onChange={(e) => setFormData({ ...formData, contactParents: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300"
                                    required
                                />

                                <input
                                    type="text"
                                    placeholder="School Name"
                                    value={formData.schoolName}
                                    onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300"
                                    required
                                />
                            </>
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
                                },
                                rollNumber: '',
                                dateOfJoining: new Date().toISOString().split('T')[0],
                                fatherName: '',
                                motherName: '',
                                addressPermanent: '',
                                pincodePermanent: '',
                                addressCurrent: '',
                                pincodeCurrent: '',
                                sameAsPermament: false,
                                session: new Date().getFullYear(),
                                nationality: 'India',
                                dateOfBirth: '',
                                board: 'CBSE',
                                aadharNumber: '',
                                bloodGroup: '',
                                category: 'General',
                                religion: '',
                                gender: 'Male',
                                contactPersonal: '',
                                contactParents: '',
                                schoolName: ''
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