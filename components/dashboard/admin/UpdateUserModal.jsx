"use client"
import { useState, useEffect } from 'react';
import { storage } from '@/lib/firebase';
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import axios from 'axios';
import { FaTimes } from 'react-icons/fa';
import Image from 'next/image';

export default function UpdateUserModal({ user, onClose, onUpdate }) {
    const [formData, setFormData] = useState(user);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.put(`/api/account/dashboard/admin/users/${user.id}`, formData);
            if (response.status === 200) {
                onUpdate();
                onClose();
            }
        } catch (error) {
            setError(error.response?.data?.error || 'Failed to update user');
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setLoading(true);
            try {
                // Delete old image if it exists and is not the default image
                if (formData.photoURL && !formData.photoURL.includes('default-profile-picture-png')) {
                    try {
                        // Get the old image reference from the URL
                        const oldImageRef = storageRef(storage, formData.photoURL);
                        await deleteObject(oldImageRef);
                    } catch (deleteError) {
                        console.error('Error deleting old image:', deleteError);
                        // Continue with upload even if delete fails
                    }
                }

                // Upload new image
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 mt-40">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white dark:bg-gray-800 p-4 border-b dark:border-gray-700 flex justify-between items-center z-40">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Update User</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <FaTimes className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-6">
                    {error && (
                        <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="flex flex-col items-center space-y-4">
                            <div className="relative">
                                {/* <img
                                    src={formData.photoURL || '/images/default-profile-picture-png.png'}
                                    alt="Profile Preview"
                                    className="h-32 w-32 rounded-full object-cover border-4 border-gray-200"
                                /> */}

                                <Image src={formData.photoURL || '/images/default-profile-picture-png.png'}
                                alt="Profile Preview"
                                    className="h-32 w-32 rounded-full object-cover border-4 border-gray-200" width={100} height={100}/>
                                <label
                                    htmlFor="photo-upload-update"
                                    className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700"
                                >
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                </label>
                                <input
                                    id="photo-upload-update"
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
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                                required
                            />

                            <input
                                type="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-gray-800"
                                required
                                disabled
                            />

                            {formData.role === 'teacher' && (
                                <input
                                    type="text"
                                    placeholder="Subject"
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            )}

                            {formData.role === 'student' && (
                                <>
                                    <input
                                        type="text"
                                        placeholder="Class"
                                        value={formData.class}
                                        onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                                        required
                                    />

                                    <input
                                        type="date"
                                        value={formData.dateOfJoining}
                                        onChange={(e) => setFormData({ ...formData, dateOfJoining: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                                        required
                                    />

                                    <input
                                        type="number"
                                        placeholder="Roll Number"
                                        value={formData.rollNumber}
                                        onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                                        required
                                    />

                                    <input
                                        type="text"
                                        placeholder="Father's Name"
                                        value={formData.fatherName}
                                        onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                                        required
                                    />

                                    <input
                                        type="text"
                                        placeholder="Mother's Name (Optional)"
                                        value={formData.motherName}
                                        onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                                    />

                                    <textarea
                                        placeholder="Permanent Address"
                                        value={formData.addressPermanent}
                                        onChange={(e) => setFormData({ ...formData, addressPermanent: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                                        required
                                        rows={3}
                                    />

                                    <input
                                        type="number"
                                        placeholder="Permanent Address Pincode"
                                        value={formData.pincodePermanent}
                                        onChange={(e) => setFormData({ ...formData, pincodePermanent: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                                        required
                                    />

                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="sameAddress"
                                            checked={formData.sameAsPermament}
                                            onChange={handleSameAddress}
                                            className="rounded border-gray-300 dark:border-gray-600"
                                        />
                                        <label htmlFor="sameAddress" className="dark:text-white">Same as Permanent Address</label>
                                    </div>

                                    {!formData.sameAsPermament && (
                                        <>
                                            <textarea
                                                placeholder="Current Address"
                                                value={formData.addressCurrent}
                                                onChange={(e) => setFormData({ ...formData, addressCurrent: e.target.value })}
                                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                                                required
                                                rows={3}
                                            />

                                            <input
                                                type="number"
                                                placeholder="Current Address Pincode"
                                                value={formData.pincodeCurrent}
                                                onChange={(e) => setFormData({ ...formData, pincodeCurrent: e.target.value })}
                                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                                                required
                                            />
                                        </>
                                    )}

                                    <input
                                        type="number"
                                        placeholder="Session Year"
                                        value={formData.session}
                                        onChange={(e) => setFormData({ ...formData, session: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                                        required
                                    />

                                    <input
                                        type="date"
                                        placeholder="Date of Birth"
                                        value={formData.dateOfBirth}
                                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                                        required
                                    />

                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium dark:text-white">Board</label>
                                        <div className="space-x-4">
                                            {['CBSE', 'BSEB', 'OTHER'].map((board) => (
                                                <label key={board} className="inline-flex items-center">
                                                    <input
                                                        type="radio"
                                                        value={board}
                                                        checked={formData.board === board}
                                                        onChange={(e) => setFormData({ ...formData, board: e.target.value })}
                                                        className="form-radio dark:border-gray-600"
                                                    />
                                                    <span className="ml-2 dark:text-white">{board}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <input
                                        type="number"
                                        placeholder="Aadhar Number"
                                        value={formData.aadharNumber}
                                        onChange={(e) => setFormData({ ...formData, aadharNumber: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                                        minLength={12}
                                        maxLength={12}
                                        required
                                    />

                                    <input
                                        type="text"
                                        placeholder="Blood Group (Optional)"
                                        value={formData.bloodGroup}
                                        onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                                    />

                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium dark:text-white">Category</label>
                                        <div className="space-x-4">
                                            {['General', 'OBC', 'SC/ST'].map((cat) => (
                                                <label key={cat} className="inline-flex items-center">
                                                    <input
                                                        type="radio"
                                                        value={cat}
                                                        checked={formData.category === cat}
                                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                                        className="form-radio dark:border-gray-600"
                                                    />
                                                    <span className="ml-2 dark:text-white">{cat}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <input
                                        type="text"
                                        placeholder="Religion"
                                        value={formData.religion}
                                        onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                                        required
                                    />

                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium dark:text-white">Gender</label>
                                        <div className="space-x-4">
                                            {['Male', 'Female', 'Other'].map((gender) => (
                                                <label key={gender} className="inline-flex items-center">
                                                    <input
                                                        type="radio"
                                                        value={gender}
                                                        checked={formData.gender === gender}
                                                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                                        className="form-radio dark:border-gray-600"
                                                    />
                                                    <span className="ml-2 dark:text-white">{gender}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <input
                                        type="tel"
                                        placeholder="Personal Contact"
                                        value={formData.contactPersonal}
                                        onChange={(e) => setFormData({ ...formData, contactPersonal: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                                        required
                                    />

                                    <input
                                        type="tel"
                                        placeholder="Parents Contact"
                                        value={formData.contactParents}
                                        onChange={(e) => setFormData({ ...formData, contactParents: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                                        required
                                    />

                                    <input
                                        type="text"
                                        placeholder="School Name"
                                        value={formData.schoolName}
                                        onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </>
                            )}

                            <input
                                type="tel"
                                placeholder="Phone Number"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                                required
                            />

                            <input
                                type="tel"
                                placeholder="WhatsApp Number"
                                value={formData.whatsapp}
                                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-lg font-medium text-gray-900 dark:text-white">Social Media Links</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <input
                                    type="url"
                                    placeholder="Facebook URL"
                                    value={formData.socialLinks?.facebook}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        socialLinks: { ...formData.socialLinks, facebook: e.target.value }
                                    })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                                />

                                <input
                                    type="url"
                                    placeholder="Instagram URL"
                                    value={formData.socialLinks?.instagram}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        socialLinks: { ...formData.socialLinks, instagram: e.target.value }
                                    })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                                />

                                <input
                                    type="url"
                                    placeholder="LinkedIn URL"
                                    value={formData.socialLinks?.linkedin}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        socialLinks: { ...formData.socialLinks, linkedin: e.target.value }
                                    })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                {loading ? 'Updating...' : 'Update User'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
