'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { database } from '@/lib/firebase';
import { ref, update } from 'firebase/database';
import { toast } from 'react-toastify';

export default function EditTeachersNotice({ notice, onClose }) {
    const [loading, setLoading] = useState(false);
    const [teachers, setTeachers] = useState([]);
    const [formData, setFormData] = useState({
        title: notice.title || '',
        content: notice.content || '',
        type: notice.type || 'general',
        targetTeachers: notice.targetTeachers || [],
        isForAllTeachers: notice.targetTeachers?.includes('all') || false
    });

    // Sample teachers data - Replace with actual teacher data from your database
    useEffect(() => {
        const sampleTeachers = [
            { id: "teacher1", name: "John Doe" },
            { id: "teacher2", name: "Jane Smith" },
            { id: "teacher3", name: "Robert Johnson" },
            { id: "teacher4", name: "Mary Williams" },
            { id: "teacher5", name: "James Brown" },
        ];
        setTeachers(sampleTeachers);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const noticeRef = ref(database, `teacherNotices/${notice.id}`);
            await update(noticeRef, {
                ...formData,
                targetTeachers: formData.isForAllTeachers ? ['all'] : formData.targetTeachers,
                timestamp: new Date().toISOString(),
            });

            toast.success('Notice updated successfully!');
            onClose();
        } catch (error) {
            console.error('Error updating notice:', error);
            toast.error('Failed to update notice');
        } finally {
            setLoading(false);
        }
    };

    const handleTeacherSelect = (teacherId) => {
        setFormData(prev => ({
            ...prev,
            targetTeachers: prev.targetTeachers.includes(teacherId)
                ? prev.targetTeachers.filter(id => id !== teacherId)
                : [...prev.targetTeachers, teacherId]
        }));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full p-4 md:p-6 mt-[3rem] md:my-4"
            >
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Edit Notice
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Title
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            className="w-full px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 
                                focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Type
                            </label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                                className="w-full px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 
                                    focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            >
                                <option value="general">General</option>
                                <option value="urgent">Urgent</option>
                                <option value="meeting">Meeting</option>
                                <option value="announcement">Announcement</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Target Teachers
                            </label>
                            <div className="space-y-1">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={formData.isForAllTeachers}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            isForAllTeachers: e.target.checked,
                                            targetTeachers: []
                                        }))}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                        Send to all teachers
                                    </label>
                                </div>

                                {!formData.isForAllTeachers && (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                                        {teachers.map((teacher) => (
                                            <div key={teacher.id} className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.targetTeachers.includes(teacher.id)}
                                                    onChange={() => handleTeacherSelect(teacher.id)}
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                />
                                                <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                                    {teacher.name}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
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
                            rows={4}
                            className="w-full px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 
                                focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                    </div>

                    <div className="flex justify-end space-x-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md 
                                hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || (!formData.isForAllTeachers && formData.targetTeachers.length === 0)}
                            className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md 
                                hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
