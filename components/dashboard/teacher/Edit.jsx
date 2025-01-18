"use client"
import React, { useState, useEffect } from 'react';
import { ref, get, getDatabase, onValue } from 'firebase/database';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';
import { FaCheck, FaTimes, FaCalendarAlt, FaChartBar, FaUmbrella } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js/auto';
import { useTheme } from 'next-themes';
import { auth, database } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';

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
    const [viewMode, setViewMode] = useState('table'); // 'table' or 'chart'

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

    // Prepare chart data
    const prepareChartData = () => {
        const months = {};
        attendanceData.forEach(({ date, status }) => {
            const month = format(new Date(date), 'MMM yyyy');
            if (!months[month]) {
                months[month] = { total: 0, present: 0 };
            }
            months[month].total++;
            if (status) months[month].present++;
        });

        return {
            labels: Object.keys(months),
            datasets: [
                {
                    label: 'Attendance %',
                    data: Object.values(months).map(m => (m.present / m.total) * 100),
                    borderColor: theme === 'dark' ? '#60A5FA' : '#2563EB',
                    tension: 0.4,
                    fill: true,
                    backgroundColor: theme === 'dark' ? 'rgba(96, 165, 250, 0.1)' : 'rgba(37, 99, 235, 0.1)',
                }
            ]
        };
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                labels: {
                    color: theme === 'dark' ? '#E5E7EB' : '#1F2937'
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
                grid: {
                    color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                },
                ticks: {
                    color: theme === 'dark' ? '#E5E7EB' : '#1F2937'
                }
            },
            x: {
                grid: {
                    color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                },
                ticks: {
                    color: theme === 'dark' ? '#E5E7EB' : '#1F2937'
                }
            }
        }
    };

    const getMonthDates = (date) => {
        const start = startOfMonth(date);
        const end = endOfMonth(date);
        return eachDayOfInterval({ start, end });
    };

    const getAttendanceStatus = (date) => {
        const formattedDate = format(date, 'yyyy-MM-dd');
        const attendance = attendanceData.find(a => a.date === formattedDate);
        return attendance ? attendance.status : null;
    };

    const getStatusColor = (status) => {
        if (status === null) return 'bg-gray-200 dark:bg-gray-700';
        if (status === 'holiday') return 'bg-amber-200 dark:bg-amber-700';
        return status ? 'bg-green-200 dark:bg-green-800' : 'bg-red-200 dark:bg-red-800';
    };

    const renderCalendar = () => {
        const currentDate = selectedMonth ? 
            new Date(selectedMonth) : 
            new Date();
        const dates = getMonthDates(currentDate);
        const weeks = [];
        let week = [];

        // Get the starting day of the month
        const firstDay = startOfMonth(currentDate).getDay();
        
        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDay; i++) {
            week.push(null);
        }

        // Add the actual dates
        dates.forEach((date) => {
            week.push(date);
            if (week.length === 7) {
                weeks.push(week);
                week = [];
            }
        });

        // Add empty cells for the remaining days
        if (week.length > 0) {
            while (week.length < 7) {
                week.push(null);
            }
            weeks.push(week);
        }

        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 max-w-2xl mx-auto">
                {/* Calendar Header */}
                <div className="grid grid-cols-7 gap-1 mb-4">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                        <div key={day} className="text-center text-xs font-medium text-gray-600 dark:text-gray-300 py-2">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 place-items-center">
                    {weeks.map((week, weekIndex) => (
                        week.map((date, dateIndex) => {
                            if (!date) {
                                return (
                                    <div 
                                        key={`empty-${weekIndex}-${dateIndex}`} 
                                        className="w-8 h-8 sm:w-10 sm:h-10"
                                    />
                                );
                            }

                            const status = getAttendanceStatus(date);
                            const isCurrentMonth = isSameMonth(date, currentDate);
                            
                            return (
                                <motion.div
                                    key={date.toString()}
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: (weekIndex * 7 + dateIndex) * 0.02 }}
                                    className={`
                                        w-8 h-8 sm:w-10 sm:h-10
                                        flex items-center justify-center
                                        rounded-md transition-all duration-200
                                        ${getStatusColor(status)}
                                        ${!isCurrentMonth ? 'opacity-30' : ''}
                                        ${isToday(date) ? 'ring-2 ring-blue-500' : ''}
                                        hover:scale-105 cursor-pointer
                                        text-gray-800 dark:text-gray-200
                                    `}
                                    data-tooltip-id="date-tooltip"
                                    data-tooltip-content={`${format(date, 'dd MMM yyyy')} - ${
                                        status === null ? 'No Record' :
                                        status === 'holiday' ? 'Holiday' :
                                        status ? 'Present' : 'Absent'
                                    }`}
                                >
                                    <span className="text-xs sm:text-sm font-medium">
                                        {format(date, 'd')}
                                    </span>
                                </motion.div>
                            );
                        })
                    ))}
                </div>
            </div>
        );
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6 lg:p-8"
        >
            <div className="max-w-7xl mx-auto">
                <motion.div 
                    initial={{ y: -20 }}
                    animate={{ y: 0 }}
                    className="backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8"
                >
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">
                            Your Attendance Report
                        </h1>
                        <div className="flex items-center gap-4">
                            <input
                                type="month"
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <div className="flex gap-2">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setViewMode('table')}
                                    className={`p-2 rounded-lg ${viewMode === 'table' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
                                >
                                    <FaCalendarAlt className="w-5 h-5" />
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setViewMode('chart')}
                                    className={`p-2 rounded-lg ${viewMode === 'chart' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
                                >
                                    <FaChartBar className="w-5 h-5" />
                                </motion.button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                        {[
                            { title: 'Total Days', value: statistics.total, color: 'blue' },
                            { title: 'Present', value: statistics.present, color: 'green' },
                            { title: 'Absent', value: statistics.absent, color: 'red' },
                            { title: 'Percentage', value: `${statistics.percentage}%`, color: 'purple' }
                        ].map((stat, index) => (
                            <motion.div
                                key={stat.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`bg-${stat.color}-100 dark:bg-${stat.color}-900 p-4 rounded-xl shadow-lg hover:shadow-xl transition-shadow`}
                            >
                                <h3 className={`text-${stat.color}-800 dark:text-${stat.color}-200 font-semibold text-sm sm:text-base`}>
                                    {stat.title}
                                </h3>
                                <p className={`text-xl sm:text-2xl font-bold text-${stat.color}-900 dark:text-${stat.color}-100 mt-2`}>
                                    {stat.value}
                                </p>
                            </motion.div>
                        ))}
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
                            />
                            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading attendance data...</p>
                        </div>
                    ) : (
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={viewMode}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                {viewMode === 'table' ? (
                                    renderCalendar()
                                ) : (
                                    // Chart view
                                    <div className="mt-6 h-[400px]">
                                        <Line data={prepareChartData()} options={chartOptions} />
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    )}
                </motion.div>
            </div>
            <Tooltip id="date-tooltip" />
        </motion.div>
    );
};

export default ViewTotalAttendance;