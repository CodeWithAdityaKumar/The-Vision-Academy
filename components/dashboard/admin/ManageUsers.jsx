"use client"
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { database } from '@/lib/firebase';
import { ref, onValue, remove, update, off } from 'firebase/database';
import { FaEdit, FaTrash } from 'react-icons/fa';
import UpdateUserModal from './UpdateUserModal'; 

export default function ManageUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        role: 'all'
    });
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        setupRealtimeListeners();
        return () => {
            const usersRef = ref(database, 'users');
            off(usersRef);
        };
    }, []);

    const setupRealtimeListeners = () => {
        setLoading(true);
        const usersRef = ref(database, 'users');

        onValue(usersRef, async (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const usersArray = await Promise.all(
                    Object.entries(data).map(async ([id, values]) => {
                        return {
                            id,
                            ...values
                        };
                    })
                );
                setUsers(usersArray);
            } else {
                setUsers([]);
            }
            setLoading(false);
        });
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            setLoading(true);
            try {
                const dbRef = ref(database, `users/${id}`);
                await remove(dbRef);
            } catch (error) {
                setError('Failed to delete user');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleUpdateClick = (user) => {
        setSelectedUser(user);
        setIsUpdateModalOpen(true);
    };

    const handleUpdateComplete = () => {
        setIsUpdateModalOpen(false);
        setSelectedUser(null);
    };

    const filterUsers = () => {
        return users.filter(user => {
            const matchesSearch =
                user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesRole =
                filters.role === 'all' ? true :
                    user.role === filters.role;

            return matchesSearch && matchesRole;
        });
    };

    return (
        <div className="max-w-7xl mx-auto p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6"
            >
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                    Manage Users
                </h2>

                {error && (
                    <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
                        {error}
                    </div>
                )}

                <div className="mb-6 space-y-4">
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500"
                    />

                    <select
                        value={filters.role}
                        onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                        className="px-4 py-2 rounded-lg border border-gray-300"
                    >
                        <option value="all">All Roles</option>
                        <option value="teacher">Teachers</option>
                        <option value="student">Students</option>
                        <option value="admin">Admins</option>
                    </select>
                </div>

                {loading ? (
                    <div className="text-center py-4">Loading...</div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filterUsers().map((user) => (
                            <motion.div
                                key={user.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-white dark:bg-gray-700 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-600 overflow-hidden"
                            >
                                <div className="flex items-center space-x-4">
                                    <img
                                        src={user.photoURL || '/default-avatar.png'}
                                        alt={user.name}
                                        className="h-16 w-16 rounded-full object-cover"
                                    />
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {user.name}
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-300">
                                            {user.email}
                                        </p>
                                        <div className="mt-2">
                                            <span className={`px-3 py-1 rounded-full text-xs ${user.role === 'admin'
                                                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                    : user.role === 'teacher'
                                                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                                        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 flex justify-end space-x-3">
                                    <button
                                        onClick={() => handleUpdateClick(user)}
                                        className="flex items-center px-3 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                                    >
                                        <FaEdit className="h-4 w-4 mr-1" />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(user.id)}
                                        className="flex items-center px-3 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                                    >
                                        <FaTrash className="h-4 w-4 mr-1" />
                                        Delete
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>

            {isUpdateModalOpen && (
                <UpdateUserModal
                    user={selectedUser}
                    onClose={() => setIsUpdateModalOpen(false)}
                    onUpdate={handleUpdateComplete}
                />
            )}
        </div>
    );
}
