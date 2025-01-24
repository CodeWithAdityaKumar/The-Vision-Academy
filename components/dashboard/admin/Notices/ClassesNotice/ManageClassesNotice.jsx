'use client';

import { useState, useEffect } from 'react';
import { database } from '@/lib/firebase';
import { ref, onValue, update, remove } from 'firebase/database';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import EditClassesNotice from './EditClassesNotice';

export default function ManageClassesNotice() {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingNotice, setEditingNotice] = useState(null);

    useEffect(() => {
        const noticesRef = ref(database, 'classNotices');
        const unsubscribe = onValue(noticesRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const noticesList = Object.entries(data).map(([id, notice]) => ({
                    id,
                    ...notice,
                })).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                setNotices(noticesList);
            } else {
                setNotices([]);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const deleteNotice = async (id) => {
        if (window.confirm('Are you sure you want to delete this notice?')) {
            try {
                await remove(ref(database, `classNotices/${id}`));
                toast.success('Notice deleted successfully');
            } catch (error) {
                toast.error('Error deleting notice');
                console.error(error);
            }
        }
    };

    const openEditModal = (notice) => {
        setEditingNotice(notice);
        setIsEditModalOpen(true);
    };

    const handleEdit = async (updatedNotice) => {
        try {
            await update(ref(database, `classNotices/${updatedNotice.id}`), {
                title: updatedNotice.title,
                content: updatedNotice.content,
                type: updatedNotice.type,
                targetClasses: updatedNotice.targetClasses,
            });
            setIsEditModalOpen(false);
            setEditingNotice(null);
            toast.success('Notice updated successfully');
        } catch (error) {
            toast.error('Error updating notice');
            console.error(error);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    const getTypeStyle = (type) => {
        const styles = {
            urgent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
            homework: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
            exam: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
            general: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
        };
        return styles[type] || styles.general;
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Manage Class Notices
                        </h2>
                    </div>

                    {notices.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
                        >
                            <p className="text-gray-500 dark:text-gray-400">
                                No notices found
                            </p>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {notices.map((notice) => (
                                <motion.div
                                    key={notice.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeStyle(notice.type)}`}>
                                            {notice.type.toUpperCase()}
                                        </span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {notice.targetClasses?.includes('all') 
                                                ? 'All Classes' 
                                                : `Classes: ${notice.targetClasses?.join(', ')}`}
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                        {notice.title}
                                    </h3>

                                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                        {notice.content}
                                    </p>

                                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(notice.timestamp).toLocaleDateString()}
                                        </span>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => openEditModal(notice)}
                                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-full dark:text-blue-400 dark:hover:bg-blue-900/50"
                                            >
                                                <FiEdit className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => deleteNotice(notice.id)}
                                                className="p-2 text-red-600 hover:bg-red-100 rounded-full dark:text-red-400 dark:hover:bg-red-900/50"
                                            >
                                                <FiTrash2 className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>

            {isEditModalOpen && editingNotice && (
                <EditClassesNotice
                    notice={editingNotice}
                    onClose={() => {
                        setIsEditModalOpen(false);
                        setEditingNotice(null);
                    }}
                    onSave={handleEdit}
                />
            )}
        </div>
    );
}