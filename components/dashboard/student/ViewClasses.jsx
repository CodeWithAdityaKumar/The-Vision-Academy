"use client";
import React, { useState, useEffect } from "react";
import { Card, Grid, Typography, Button } from "@mui/material";
import { collection, getDocs, query, where } from "firebase/firestore";
import { motion } from "framer-motion";
import { db, auth, database } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import { useAuthState } from "react-firebase-hooks/auth";
import Link from "next/link";
import Image from "next/image";
import {
    CalendarIcon,
    ClockIcon,
    UserCircleIcon,
    VideoCameraIcon,
    AcademicCapIcon,
    BookOpenIcon,
    ExclamationCircleIcon,
    ArrowPathIcon
} from "@heroicons/react/24/outline";

const ViewClasses = () => {
    const [user] = useAuthState(auth);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [studentClass, setStudentClass] = useState(null);
    const [error, setError] = useState(null);

    // Fetch student data
    useEffect(() => {
        if (!user) return;

        const studentRef = ref(database, `users/${user.uid}`);
        onValue(studentRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setStudentClass(data.class);
            }
        });
    }, [user]);

    // Fetch filtered classes
    useEffect(() => {
        const fetchClasses = async () => {
            if (!studentClass) return;

            try {
                const liveClassesRef = ref(database, "liveClasses");
                onValue(liveClassesRef, (snapshot) => {
                    const data = snapshot.val();
                    console.log(studentClass);

                    if (data) {
                        const filteredClasses = Object.entries(data)
                            .map(([id, values]) => ({
                                id,
                                ...values,
                            }))
                            .filter(
                                (classItem) =>
                                    classItem.targetClass === "Class " + studentClass ||
                                    classItem.targetClass === "all"
                            );
                        setClasses(filteredClasses);
                    }
                    setLoading(false);
                });
            } catch (error) {
                console.error("Error fetching classes:", error);
                setError("Failed to load classes");
                setLoading(false);
            }
        };

        fetchClasses();
    }, [studentClass]);

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl"
                >
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-600 border-t-transparent"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400 flex items-center">
                        <VideoCameraIcon className="w-5 h-5 mr-2 animate-pulse" />
                        Loading your classes...
                    </p>
                </motion.div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl"
                >
                    <ExclamationCircleIcon className="w-16 h-16 text-red-600 mx-auto mb-4" />
                    <p className="text-red-600 text-xl mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all flex items-center justify-center space-x-2 mx-auto"
                    >
                        <ArrowPathIcon className="w-5 h-5" />
                        <span>Try Again</span>
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-6 px-4 sm:py-8 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8 sm:mb-12"
                >
                    <div className="flex items-center justify-center mb-4">
                        <AcademicCapIcon className="w-8 h-8 sm:w-10 sm:h-10 text-red-600 mr-3" />
                        <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                            Your Live Classes
                        </h1>
                    </div>
                    <p className="text-lg text-gray-600 dark:text-gray-400 flex items-center justify-center">
                        <BookOpenIcon className="w-5 h-5 mr-2" />
                        Class {studentClass}<sup>th</sup> Learning Hub
                    </p>
                </motion.div>

                {classes.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-12"
                    >
                        <div className="max-w-md mx-auto">
                            <Image
                                src="/images/no-classes.svg"
                                alt="No classes"
                                width={200}
                                height={200}
                                className="mx-auto mb-6"
                            />
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                No Classes Available
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                There are no live classes scheduled for your class at the moment.
                                Check back later!
                            </p>
                        </div>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {classes.map((classItem, index) => (
                            <motion.div
                                key={classItem.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                                whileHover={{ y: -5 }}
                                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-2xl"
                            >
                                <Link href={`/pages/live-classes/${classItem.id}`} className="block h-full">
                                    <div className="relative h-40 sm:h-48 lg:h-56">
                                        <Image
                                            src={classItem.thumbnail}
                                            alt={classItem.title}
                                            layout="fill"
                                            objectFit="cover"
                                            className="transition-transform duration-300 hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                                        {classItem.status === "live" && (
                                            <div className="absolute top-4 right-4 flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold animate-pulse">
                                                <span className="h-2 w-2 bg-white rounded-full animate-ping" />
                                                <VideoCameraIcon className="w-4 h-4" />
                                                <span className="hidden sm:inline">LIVE NOW</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4 sm:p-6">
                                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                                            {classItem.title}
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                                            {classItem.description}
                                        </p>
                                        <div className="space-y-3">
                                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                                <UserCircleIcon className="w-5 h-5 mr-2" />
                                                <span>{classItem.teacher}</span>
                                            </div>
                                            <div className="flex flex-wrap gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                                <div className="flex items-center">
                                                    <CalendarIcon className="w-4 h-4 mr-1" />
                                                    <span>{classItem.date}</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <ClockIcon className="w-4 h-4 mr-1" />
                                                    <span>{classItem.time}</span>
                                                </div>
                                            </div>
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className="w-full sm:w-auto bg-red-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-red-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                                            >
                                                <VideoCameraIcon className="w-5 h-5" />
                                                <span>Join Class</span>
                                            </motion.button>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ViewClasses;
