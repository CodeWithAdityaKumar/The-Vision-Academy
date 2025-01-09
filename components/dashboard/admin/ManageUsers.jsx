"use client"
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { auth, database } from '@/lib/firebase';
import { ref, onValue, remove, update, off } from 'firebase/database';
import { sendEmailVerification } from 'firebase/auth';

export default function ManageUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        isVerified: 'all',
        role: 'all'
    });

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

    const handleUpdateRole = async (id, newRole) => {
        setLoading(true);
        try {
            const dbRef = ref(database, `users/${id}`);
            await update(dbRef, { role: newRole });
        } catch (error) {
            setError('Failed to update user role');
        } finally {
            setLoading(false);
        }
    };

    const filterUsers = () => {
        return users.filter(user => {
            const matchesSearch =
                user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesVerification =
                filters.isVerified === 'all' ? true :
                    filters.isVerified === 'verified' ? user.emailVerified :
                        !user.emailVerified;

            const matchesRole =
                filters.role === 'all' ? true :
                    user.role === filters.role;

            return matchesSearch && matchesVerification && matchesRole;
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

                    <div className="flex flex-wrap gap-4">
                        <select
                            value={filters.isVerified}
                            onChange={(e) => setFilters({ ...filters, isVerified: e.target.value })}
                            className="px-4 py-2 rounded-lg border border-gray-300"
                        >
                            <option value="all">All Verification Status</option>
                            <option value="verified">Verified</option>
                            <option value="unverified">Unverified</option>
                        </select>

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
                </div>

                {loading ? (
                    <div className="text-center py-4">Loading...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        User
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Role
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Verification
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filterUsers().map((user) => (
                                    <tr key={user.id}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <img
                                                    src={user.photoURL || '/default-avatar.png'}
                                                    alt={user.name}
                                                    className="h-10 w-10 rounded-full"
                                                />
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {user.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {user.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={user.role}
                                                onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                                                className="px-3 py-1 rounded border border-gray-300"
                                            >
                                                <option value="teacher">Teacher</option>
                                                <option value="student">Student</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs ${user.emailVerified
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {user.emailVerified ? 'Verified' : 'Not Verified'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
