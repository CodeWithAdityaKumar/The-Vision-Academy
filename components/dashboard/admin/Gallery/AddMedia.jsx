'use client';
import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

const AddMedia = () => {
    const [mediaType, setMediaType] = useState('photo');
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef(null);
    const [thumbnail, setThumbnail] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState(null);
    const [newCategory, setNewCategory] = useState('');
    const [categories, setCategories] = useState(['logos', 'events', 'students', 'overview']);
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const thumbnailInputRef = useRef(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        setFile(selectedFile);

        // Create preview URL
        const objectUrl = URL.createObjectURL(selectedFile);
        setPreview(objectUrl);

        // Set default title from filename
        const fileName = selectedFile.name.replace(/\.[^/.]+$/, '');
        setTitle(fileName);
    };

    const handleYoutubeUrlChange = (e) => {
        const url = e.target.value;
        setYoutubeUrl(url);
        // Extract video ID from YouTube URL
        const videoId = extractYoutubeId(url);
        if (videoId) {
            setPreview(`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`);
        }
    };

    const extractYoutubeId = (url) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const handleThumbnailChange = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        setThumbnail(selectedFile);
        const objectUrl = URL.createObjectURL(selectedFile);
        setThumbnailPreview(objectUrl);
    };

    const handleAddCategory = () => {
        if (newCategory.trim()) {
            setCategories(prev => [...prev, newCategory.trim().toLowerCase()]);
            setCategory(newCategory.trim().toLowerCase());
            setNewCategory('');
            setIsAddingCategory(false);
        }
    };

    const resetForm = () => {
        setFile(null);
        setPreview(null);
        setTitle('');
        setCategory('');
        setYoutubeUrl('');
        setUploadProgress(0);
        setThumbnail(null);
        setThumbnailPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        if (thumbnailInputRef.current) {
            thumbnailInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);

        try {
            // Simulate upload progress
            for (let i = 0; i <= 100; i += 10) {
                await new Promise(resolve => setTimeout(resolve, 200));
                setUploadProgress(i);
            }

            // Here you would typically:
            // 1. Create a FormData object
            // 2. Upload to your backend/storage
            // 3. Save metadata to your database

            console.log('Upload data:', {
                type: mediaType,
                title,
                category,
                file: file ? file.name : 'YouTube video',
                youtubeUrl: mediaType === 'youtube' ? youtubeUrl : null,
                thumbnail: thumbnail ? thumbnail.name : null
            });

            // Success message
            alert('Media uploaded successfully!');
            resetForm();
        } catch (error) {
            console.error('Upload error:', error);
            alert('Upload failed. Please try again.');
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
            >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Add New Media
                </h2>

                {/* Media Type Selection */}
                <div className="flex gap-4 mb-6">
                    {['photo', 'video', 'youtube'].map((type) => (
                        <button
                            key={type}
                            onClick={() => setMediaType(type)}
                            className={`px-4 py-2 rounded-full text-sm font-medium capitalize
                                ${mediaType === type
                                    ? 'bg-red-600 text-white'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                } transition duration-300`}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* File Upload */}
                    {mediaType !== 'youtube' && (
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                Upload {mediaType}
                            </label>
                            <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                                <div className="space-y-1 text-center">
                                    <svg
                                        className="mx-auto h-12 w-12 text-gray-400"
                                        stroke="currentColor"
                                        fill="none"
                                        viewBox="0 0 48 48"
                                    >
                                        <path
                                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                            strokeWidth={2}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                    <div className="flex text-sm text-gray-600 dark:text-gray-400">
                                        <label className="relative cursor-pointer bg-white dark:bg-gray-700 rounded-md font-medium text-red-600 dark:text-red-400 hover:text-red-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-red-500">
                                            <span>Upload a file</span>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                className="sr-only"
                                                accept={mediaType === 'photo' ? 'image/*' : 'video/*'}
                                                onChange={handleFileChange}
                                            />
                                        </label>
                                        <p className="pl-1">or drag and drop</p>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {mediaType === 'photo' ? 'PNG, JPG, GIF up to 10MB' : 'MP4, WebM up to 50MB'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* YouTube URL Input */}
                    {mediaType === 'youtube' && (
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                YouTube Video URL
                            </label>
                            <input
                                type="text"
                                value={youtubeUrl}
                                onChange={handleYoutubeUrlChange}
                                placeholder="https://youtube.com/watch?v=..."
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                        </div>
                    )}

                    {/* Thumbnail Upload for Video/YouTube */}
                    {(mediaType === 'video' || mediaType === 'youtube') && (
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                Custom Thumbnail (Optional)
                            </label>
                            <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                                <div className="space-y-1 text-center">
                                    <svg
                                        className="mx-auto h-12 w-12 text-gray-400"
                                        stroke="currentColor"
                                        fill="none"
                                        viewBox="0 0 48 48"
                                    >
                                        <path
                                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                            strokeWidth={2}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                    <div className="flex text-sm text-gray-600 dark:text-gray-400">
                                        <label className="relative cursor-pointer bg-white dark:bg-gray-700 rounded-md font-medium text-red-600 dark:text-red-400 hover:text-red-500">
                                            <span>Upload thumbnail</span>
                                            <input
                                                ref={thumbnailInputRef}
                                                type="file"
                                                className="sr-only"
                                                accept="image/*"
                                                onChange={handleThumbnailChange}
                                            />
                                        </label>
                                    </div>
                                </div>
                            </div>
                            {thumbnailPreview && (
                                <div className="relative aspect-video w-full max-w-sm mx-auto rounded-lg overflow-hidden mt-4">
                                    <Image
                                        src={thumbnailPreview}
                                        alt="Thumbnail Preview"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Preview */}
                    {preview && (
                        <div className="relative aspect-video w-full rounded-lg overflow-hidden">
                            <Image
                                src={preview}
                                alt="Preview"
                                fill
                                className="object-cover"
                            />
                        </div>
                    )}

                    {/* Title Input */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                            Title
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            required
                        />
                    </div>

                    {/* Updated Category Selection */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                            Category
                        </label>
                        {!isAddingCategory ? (
                            <div className="flex gap-2 items-center">
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    required
                                >
                                    <option value="">Select a category</option>
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    onClick={() => setIsAddingCategory(true)}
                                    className="px-4 py-2 text-sm font-medium text-red-600 border border-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition duration-300"
                                >
                                    New
                                </button>
                            </div>
                        ) : (
                            <div className="flex gap-2 items-center">
                                <input
                                    type="text"
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                    placeholder="Enter new category"
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddCategory}
                                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition duration-300"
                                >
                                    Add
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsAddingCategory(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition duration-300"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Upload Progress */}
                    {uploading && (
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                            <div
                                className="bg-red-600 h-2.5 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                            ></div>
                        </div>
                    )}

                    {/* Submit Button */}
                    <div className="flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={resetForm}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition duration-300"
                        >
                            Reset
                        </button>
                        <button
                            type="submit"
                            disabled={uploading}
                            className={`px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg
                                ${uploading
                                    ? 'opacity-50 cursor-not-allowed'
                                    : 'hover:bg-red-700 transition duration-300'
                                }`}
                        >
                            {uploading ? 'Uploading...' : 'Upload Media'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default AddMedia;
