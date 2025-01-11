"use client"
import React, { useState, useEffect } from 'react';
import { ref, get, getDatabase, onValue } from 'firebase/database';
import { format } from 'date-fns';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { useTheme } from 'next-themes';
import { auth, database } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';



const ViewTotalAttendance = () => {
    const { theme } = useTheme();
    const [attendanceData, setAttendanceData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState('');
    const [statistics, setStatistics] = useState({
        total: 0,
        present: 0,
        absent: 0,
        percentage: 0
    });

    const [user] = useAuthState(auth);
    const [userId, setUserId] = useState(null);
    const [userClass, setUserClass] = useState(null);

    useEffect(() => {
        if (user) {

            setUserId(user.uid);

            const userRef = ref(database, `users/${user.uid}`);
            onValue(userRef, (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    setUserClass(data.class);
                }
                setLoading(false);
            });
        }
    }, [user]);

    useEffect(() => {
        if (userClass) {
            fetchAttendance();
        }
    }, [userClass, selectedMonth]);

    const fetchAttendance = async () => {
        setLoading(true);
        const db = getDatabase();
        const className = `Class ${userClass}`;
        const attendanceRef = ref(db, `attendance/${className}`);

        try {
            const snapshot = await get(attendanceRef);
            if (snapshot.exists()) {
                const data = snapshot.val();
                const formattedData = Object.entries(data).map(([date, attendance]) => ({
                    date,
                    status: attendance[userId] || false
                }))
                .filter(item => {
                    if (!selectedMonth) return true;
                    return item.date.startsWith(selectedMonth);
                })
                .sort((a, b) => new Date(b.date) - new Date(a.date));

                setAttendanceData(formattedData);
                calculateStatistics(formattedData);
            }
        } catch (error) {
            console.error('Error fetching attendance:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateStatistics = (data) => {
        const total = data.length;
        const present = data.filter(item => item.status).length;
        const absent = total - present;
        const percentage = total ? ((present / total) * 100).toFixed(2) : 0;

        setStatistics({ total, present, absent, percentage });
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                        Your Attendance Report
                    </h1>

                    <div className="mb-6">
                        <input
                            type="month"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-lg">
                            <h3 className="text-blue-800 dark:text-blue-200 font-semibold">Total Days</h3>
                            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{statistics.total}</p>
                        </div>
                        <div className="bg-green-100 dark:bg-green-900 p-4 rounded-lg">
                            <h3 className="text-green-800 dark:text-green-200 font-semibold">Present</h3>
                            <p className="text-2xl font-bold text-green-900 dark:text-green-100">{statistics.present}</p>
                        </div>
                        <div className="bg-red-100 dark:bg-red-900 p-4 rounded-lg">
                            <h3 className="text-red-800 dark:text-red-200 font-semibold">Absent</h3>
                            <p className="text-2xl font-bold text-red-900 dark:text-red-100">{statistics.absent}</p>
                        </div>
                        <div className="bg-purple-100 dark:bg-purple-900 p-4 rounded-lg">
                            <h3 className="text-purple-800 dark:text-purple-200 font-semibold">Percentage</h3>
                            <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{statistics.percentage}%</p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading attendance data...</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead>
                                    <tr>
                                        <th className="px-6 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-6 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {attendanceData.length === 0 ? (
                                        <tr>
                                            <td colSpan="2" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                                No attendance records found
                                            </td>
                                        </tr>
                                    ) : (
                                        attendanceData.map(({ date, status }) => (
                                            <tr key={date}>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
                                                    {format(new Date(date), 'dd MMM yyyy')}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center justify-center p-2 rounded-full ${
                                                        status
                                                            ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400'
                                                            : 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400'
                                                    }`}>
                                                        {status ? <FaCheck /> : <FaTimes />}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ViewTotalAttendance;