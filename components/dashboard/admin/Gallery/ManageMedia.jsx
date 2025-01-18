'use client';
import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

const ManageMedia = () => {
    const [activeTab, setActiveTab] = useState('photos');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [editingMedia, setEditingMedia] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [searchTags, setSearchTags] = useState('');
    const thumbnailInputRef = useRef(null);
    const [isExiting, setIsExiting] = useState(false);

    // Updated dummy data with tags
    const mediaItems = [
        {
            id: 1,
            type: 'photo',
            src: '/images/logos/1.jpg',
            title: 'Academy Logo 1',
            category: 'logos',
            uploadDate: '2024-01-15',
        },
        {
            id: 2,
            type: 'youtube',
            url: 'dQw4w9WgXcQ',
            thumbnail: '/images/default-video-thumbnail.jpg',
            title: 'Academy Overview',
            category: 'overview',
            uploadDate: '2024-01-14',
        },
        {
            id: 3,
            type: 'youtube',
            url: 'dQw4w9WgXcQ',
            thumbnail: '/images/default-video-thumbnail.jpg',
            title: 'Academy Overview',
            category: 'overview',
            uploadDate: '2024-01-14',
        },
        {
            id: 4,
            type: 'youtube',
            url: 'dQw4w9WgXcQ',
            thumbnail: '/images/default-video-thumbnail.jpg',
            title: 'Academy Overview',
            category: 'overview',
            uploadDate: '2024-01-14',
        },
        // Add more items as needed
    ];

    const categories = ['all', 'logos', 'events', 'students', 'overview'];

    // Update the filter function to properly handle tag search
    const getFilteredItems = () => {
        const searchTerm = searchQuery.toLowerCase();
        return mediaItems.filter(item => {
            const matchesSearch =
                item.title.toLowerCase().includes(searchTerm) ||
                (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchTerm)));
            const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
            const matchesType = activeTab === 'photos' ? item.type === 'photo' : item.type !== 'photo';
            return matchesSearch && matchesCategory && matchesType;
        });
    };

    const handleEdit = (item) => {
        setEditingMedia({ ...item });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            // Implement your update logic here
            console.log('Updating media:', editingMedia);
            // After successful update
            alert('Media updated successfully!');
            setEditingMedia(null);
        } catch (error) {
            console.error('Update failed:', error);
            alert('Update failed. Please try again.');
        }
    };

    const handleDelete = async () => {
        try {
            // Implement your delete logic here
            console.log('Deleting media:', selectedItem);
            // After successful deletion
            alert('Media deleted successfully!');
            setShowDeleteModal(false);
            setSelectedItem(null);
        } catch (error) {
            console.error('Delete failed:', error);
            alert('Delete failed. Please try again.');
        }
    };

    // Add thumbnail change handler
    const handleThumbnailChange = async (e, media) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            // Here you would typically:
            // 1. Upload the new thumbnail
            // 2. Get the new URL
            // 3. Update the media item
            console.log('Updating thumbnail for:', media.title, 'with file:', file);
            alert('Thumbnail updated successfully!');
        } catch (error) {
            console.error('Failed to update thumbnail:', error);
            alert('Failed to update thumbnail');
        }
    };

    // Update the MediaCard component to remove tags
    const MediaCard = ({ item }) => (
        <motion.div
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
            style={{
                height: 'fit-content',
                display: ((activeTab === 'photos' && item.type === 'photo') ||
                    (activeTab === 'videos' && item.type !== 'photo')) ? 'block' : 'none'
            }}
        >
            <div className="relative w-full" style={{ paddingTop: '75%' }}>
                <div className="absolute top-0 left-0 w-full h-full">
                    <Image
                        src={item.type === 'photo' ? item.src : item.thumbnail}
                        alt={item.title}
                        fill
                        className="object-cover"
                    />
                    {item.type !== 'photo' && (
                        <>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-12 h-12 bg-red-600/90 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                </div>
                            </div>
                            <button
                                onClick={() => thumbnailInputRef.current?.click()}
                                className="absolute bottom-2 right-2 px-2 py-1 bg-black/50 text-white text-xs rounded hover:bg-black/70"
                            >
                                Change Thumbnail
                                <input
                                    type="file"
                                    ref={thumbnailInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => handleThumbnailChange(e, item)}
                                />
                            </button>
                        </>
                    )}
                </div>
            </div>
            <div className="p-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">{item.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 capitalize mt-1">
                    {item.category} • {new Date(item.uploadDate).toLocaleDateString()}
                </p>
                <div className="mt-4 flex gap-2">
                    <button
                        onClick={() => handleEdit(item)}
                        className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition duration-300"
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => {
                            setSelectedItem(item);
                            setShowDeleteModal(true);
                        }}
                        className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition duration-300"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </motion.div>
    );

    // Update search section to fix input issues
    const SearchSection = () => (
        <div className="w-full md:w-64 relative">
            <input
                type="search" // Changed to search type
                placeholder="Search by title or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                autoComplete="off"
                spellCheck="false" // Added to prevent browser interference
            />
            <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
        </div>
    );

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Manage Media
                </h2>

                {/* Updated Filter Controls */}
                <div className="flex flex-col md:flex-row gap-4 items-center mb-6">
                    <SearchSection />
                    <div className="flex gap-2 flex-wrap">
                        {categories.map(category => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-4 py-2 rounded-full text-sm capitalize
                                    ${selectedCategory === category
                                        ? 'bg-red-600 text-white'
                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                    } transition duration-300`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-4 mb-6">
                    {['photos', 'videos'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => handleTabChange(tab)}
                            className={`px-4 py-2 rounded-full text-sm font-medium capitalize
                                ${activeTab === tab
                                    ? 'bg-red-600 text-white'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                } transition duration-300`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Updated Media Grid */}
            <motion.div
                layout
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                style={{
                    alignItems: 'start',
                    gridAutoFlow: 'dense'
                }}
            >
                {getFilteredItems().map((item) => (
                    <MediaCard key={item.id} item={item} />
                ))}
            </motion.div>

            {/* Edit Modal */}
            <AnimatePresence>
                {editingMedia && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full max-w-lg"
                        >
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                Edit Media
                            </h3>
                            <form onSubmit={handleUpdate} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                                        Title
                                    </label>
                                    <input
                                        type="text"
                                        value={editingMedia.title}
                                        onChange={(e) => setEditingMedia({ ...editingMedia, title: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                                        Category
                                    </label>
                                    <select
                                        value={editingMedia.category}
                                        onChange={(e) => setEditingMedia({ ...editingMedia, category: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    >
                                        {categories.filter(cat => cat !== 'all').map(cat => (
                                            <option key={cat} value={cat}>
                                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex justify-end gap-4 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setEditingMedia(null)}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                                    >
                                        Update
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {showDeleteModal && selectedItem && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full max-w-md"
                        >
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                Delete Media
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Are you sure you want to delete "{selectedItem.title}"? This action cannot be undone.
                            </p>
                            <div className="flex justify-end gap-4 mt-6">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                                >
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ManageMedia;
