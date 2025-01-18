"use client";
import { CircularProgress, Tooltip, Collapse, IconButton } from "@mui/material";
import { AnimatePresence, motion as m } from "framer-motion";
import { useState } from "react";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip as ChartTooltip,
} from "chart.js";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ChartTooltip
);

const Progress = () => {
    const [expandedStat, setExpandedStat] = useState(null);
    const [showMotivation, setShowMotivation] = useState(false);

    const stats = [
        {
            title: "Last Test Score",
            value: 90,
            total: "%",
            color: "#F59E0B",
            icon: "📝",
            trend: [20, 72, 78, 80, 100],
            badge: "🏆 Top Performer",
            details: "Ranked in top 10% of your class",
            tip: "Focus on chapters 5-7 to improve further",
        },
        {
            title: "Attendance",
            value: 90,
            total: "%",
            color: "#10B981",
            icon: "📅",
            trend: [75, 80, 82, 84, 85],
            badge: "📅 Consistent Attendee",
            details: "Maintained consistent attendance",
            tip: "Keep attending regularly for better understanding",
        },
        {
            title: "Assignments",
            value: 90,
            total: "%",
            color: "#6366F1",
            icon: "📚",
            trend: [85, 88, 90, 91, 92],
            badge: "📚 Assignment Master",
            details: "Completed all assignments on time",
            tip: "Continue submitting assignments on time",
        },
        {
            title: "Overall Grade",
            value: 90,
            total: "%",
            color: "#EC4899",
            icon: "🎯",
            trend: [80, 82, 85, 87, 88],
            badge: "🎯 High Achiever",
            details: "Overall grade is excellent",
            tip: "Keep up the good work",
        },
    ];

    const getMotivationalMessage = (value) => {
        if (value >= 90) return "Outstanding! Keep up the excellent work! 🌟";
        if (value >= 80) return "Great progress! You're almost there! 💪";
        if (value >= 70) return "Good effort! Keep pushing forward! 🎯";
        return "You've got this! Let's aim higher! 🚀";
    };

    const chartOptions = {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
            },
        },
    };

    return (
        <AnimatePresence>
            <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg transition-all duration-300"
            >
                <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800 dark:text-white flex items-center gap-2">
                    <span className="text-amber-500">📊</span>
                    Your Progress
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {stats.map((stat, index) => (
                        <m.div
                            key={stat.title}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            whileHover={{ scale: 1.05 }}
                            className="relative bg-gray-50 dark:bg-gray-700 p-4 rounded-xl hover:shadow-xl transition-all duration-300 cursor-pointer"
                            onClick={() =>
                                setExpandedStat(expandedStat === index ? null : index)
                            }
                        >
                            <div className="flex flex-col items-center space-y-3">
                                <div className="relative">
                                    <CircularProgress
                                        variant="determinate"
                                        value={stat.value}
                                        size={80}
                                        thickness={4}
                                        sx={{ color: stat.color }}
                                    />
                                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                        <span className="text-2xl">{stat.icon}</span>
                                    </div>
                                </div>

                                <div className="text-center">
                                    <Tooltip title={`${stat.value}/${stat.total}`} arrow>
                                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                                            {stat.title}
                                        </h3>
                                    </Tooltip>
                                    <p
                                        className="text-2xl font-bold"
                                        style={{ color: stat.color }}
                                    >
                                        {stat.value}
                                        {stat.total}
                                    </p>
                                </div>
                            </div>

                            {/* Progress indicator line */}
                            <div className="absolute bottom-0 left-0 w-full h-1 rounded-b-xl overflow-hidden">
                                <m.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${stat.value}%` }}
                                    transition={{ duration: 1, delay: index * 0.2 }}
                                    style={{ backgroundColor: stat.color }}
                                    className="h-full"
                                />
                            </div>

                            <Collapse in={expandedStat === index}>
                                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                                    <div className="h-32">
                                        <Line
                                            data={{
                                                labels: [
                                                    "Week 1",
                                                    "Week 2",
                                                    "Week 3",
                                                    "Week 4",
                                                    "Current",
                                                ],
                                                datasets: [
                                                    {
                                                        label: "Progress",
                                                        data: stat.trend,
                                                        borderColor: stat.color,
                                                        tension: 0.4,
                                                    },
                                                ],
                                            }}
                                            options={chartOptions}
                                        />
                                    </div>

                                    <div className="mt-3 space-y-2">
                                        <m.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="flex items-center gap-2 text-sm font-medium"
                                        >
                                            <span
                                                className="px-2 py-1 bg-opacity-20 rounded"
                                                style={{ backgroundColor: stat.color }}
                                            >
                                                {stat.badge}
                                            </span>
                                        </m.div>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">
                                            {stat.details}
                                        </p>
                                        <p className="text-sm text-blue-500 dark:text-blue-400">
                                            💡 {stat.tip}
                                        </p>
                                    </div>
                                </div>
                            </Collapse>
                        </m.div>
                    ))}
                </div>

                <m.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-6"
                >
                    <m.div
                        whileHover={{ scale: 1.01 }}
                        onClick={() => setShowMotivation(!showMotivation)}
                        className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-gray-700 
                                 dark:to-gray-600 rounded-lg cursor-pointer"
                    >
                        <h3 className="text-lg font-semibold text-amber-700 dark:text-amber-400 mb-2 flex items-center gap-2">
                            💡 Performance Insights
                            <m.span
                                animate={{ rotate: showMotivation ? 180 : 0 }}
                                className="text-sm"
                            >
                                ▼
                            </m.span>
                        </h3>

                        <Collapse in={showMotivation}>
                            <div className="space-y-3">
                                <m.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="mt-4 p-3 bg-white dark:bg-gray-800 rounded-md shadow-sm"
                                >
                                    <p className="text-lg text-center font-medium text-amber-600 dark:text-amber-400">
                                        {getMotivationalMessage(stats[0].value)}
                                    </p>
                                </m.div>
                            </div>
                        </Collapse>
                    </m.div>
                </m.div>
            </m.div>
        </AnimatePresence>
    );
};

export default Progress;
