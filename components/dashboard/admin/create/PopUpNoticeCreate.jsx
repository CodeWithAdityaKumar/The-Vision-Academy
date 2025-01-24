'use client';

import { useState } from 'react';
import { FiUpload } from 'react-icons/fi';
import Image from 'next/image';

const PopUpNoticeCreate = () => {
    const [formData, setFormData] = useState({
        title: '',
        text: '',
        link: '',
        linkText: '',
        image: null,
        imageUrl: '',
        imageAlt: '',
        showDelay: 2000,
        autoHideDuration: null,
        resetAfterHours: 1
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                image: file,
                imageUrl: URL.createObjectURL(file)
            }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission here
        console.log(formData);
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
                Create Pop-up Notice
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                        Title
                    </label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Enter title"
                    />
                </div>

                {/* Text Content */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                        Text Content
                    </label>
                    <textarea
                        name="text"
                        value={formData.text}
                        onChange={handleInputChange}
                        rows="4"
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Enter text content"
                    />
                </div>

                {/* Link */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                        Link URL
                    </label>
                    <input
                        type="url"
                        name="link"
                        value={formData.link}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Enter link URL"
                    />
                </div>

                {/* Link Text */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                        Link Text
                    </label>
                    <input
                        type="text"
                        name="linkText"
                        value={formData.linkText}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Enter link text"
                    />
                </div>

                {/* Image Upload */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                        Image
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                        <div className="space-y-1 text-center">
                            {formData.imageUrl ? (
                                <div className="relative w-full h-48">
                                    <Image
                                        src={formData.imageUrl}
                                        alt="Preview"
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                            ) : (
                                <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
                            )}
                            <div className="flex text-sm text-gray-600">
                                <label className="relative cursor-pointer bg-white rounded-md font-medium text-red-600 hover:text-red-500">
                                    <span>Upload a file</span>
                                    <input
                                        type="file"
                                        name="image"
                                        className="sr-only"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                    />
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Image Alt Text */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                        Image Alt Text
                    </label>
                    <input
                        type="text"
                        name="imageAlt"
                        value={formData.imageAlt}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Enter image alt text"
                    />
                </div>

                {/* Timing Controls */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                            Show Delay (ms)
                        </label>
                        <input
                            type="number"
                            name="showDelay"
                            value={formData.showDelay}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            min="0"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                            Auto Hide Duration (ms)
                        </label>
                        <input
                            type="number"
                            name="autoHideDuration"
                            value={formData.autoHideDuration}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            min="0"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                            Reset After (hours)
                        </label>
                        <input
                            type="number"
                            name="resetAfterHours"
                            value={formData.resetAfterHours}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            min="0"
                        />
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-lg font-medium hover:from-red-700 hover:to-red-800 transform transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                >
                    Create Pop-up Notice
                </button>
            </form>
        </div>
    );
};

export default PopUpNoticeCreate;