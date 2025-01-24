'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { database } from '@/lib/firebase';
import { ref as dbRef, push, set, get } from 'firebase/database';
import { toast } from 'react-toastify';

export default function CreateClassesNotice() {
    const [loading, setLoading] = useState(false);
    const [classes, setClasses] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        type: 'general',
        targetClasses: [], // Array of selected class IDs
        isForAllClasses: false
    });

    // Use sample classes for testing
    useEffect(() => {
        const sampleClasses = [
            { id: "class1", name: "Class 6" },
            { id: "class2", name: "Class 7" },
            { id: "class3", name: "Class 8" },
            { id: "class4", name: "Class 9" },
            { id: "class5", name: "Class 10" },
            { id: "class6", name: "Class 11" },
            { id: "class7", name: "Class 12" }
        ];
        setClasses(sampleClasses);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const noticeRef = push(dbRef(database, 'classNotices'));
            
            await set(noticeRef, {
                ...formData,
                timestamp: new Date().toISOString(),
                status: 'active',
                targetClasses: formData.isForAllClasses ? ['all'] : formData.targetClasses
            });

            setFormData({
                title: '',
                content: '',
                type: 'general',
                targetClasses: [],
                isForAllClasses: false
            });

            toast.success('Class notice created successfully!');
        } catch (error) {
            console.error('Error creating class notice:', error);
            toast.error('Failed to create class notice');
        } finally {
            setLoading(false);
        }
    };

    const handleClassSelect = (classId) => {
        setFormData(prev => ({
            ...prev,
            targetClasses: prev.targetClasses.includes(classId)
                ? prev.targetClasses.filter(id => id !== classId)
                : [...prev.targetClasses, classId]
        }));
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8"
                >
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                        Create Class Notice
                    </h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Title
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                                    focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                placeholder="Enter notice title"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Type
                            </label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                                    focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            >
                                <option value="general">General</option>
                                <option value="urgent">Urgent</option>
                                <option value="homework">Homework</option>
                                <option value="exam">Exam</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Target Classes
                            </label>
                            <div className="space-y-2">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={formData.isForAllClasses}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            isForAllClasses: e.target.checked,
                                            targetClasses: []
                                        }))}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                        Send to all classes
                                    </label>
                                </div>

                                {!formData.isForAllClasses && (
                                    <div className="grid grid-cols-2 gap-2">
                                        {classes.map((classItem) => (
                                            <div key={classItem.id} className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.targetClasses.includes(classItem.id)}
                                                    onChange={() => handleClassSelect(classItem.id)}
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                />
                                                <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                                    {classItem.name}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Content
                            </label>
                            <textarea
                                required
                                value={formData.content}
                                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                                rows={6}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                                    focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                placeholder="Enter notice content"
                            />
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={loading || (!formData.isForAllClasses && formData.targetClasses.length === 0)}
                                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 
                                    transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? "Creating..." : "Create Notice"}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}