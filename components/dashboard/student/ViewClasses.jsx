import React, { useState, useEffect } from 'react';
import { Card, Grid, Typography, Button } from '@mui/material';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { db, auth, database } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';
import { useAuthState } from 'react-firebase-hooks/auth';
import Link from 'next/link';
import Image from 'next/image';

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
                const liveClassesRef = ref(database, 'liveClasses');
                onValue(liveClassesRef, (snapshot) => {
                    const data = snapshot.val();
                    console.log(studentClass);
                    
                    if (data) {
                        const filteredClasses = Object.entries(data)
                            .map(([id, values]) => ({
                                id,
                                ...values,
                            }))
                            .filter(classItem => 
                                classItem.targetClass === "Class " + studentClass || 
                                classItem.targetClass === 'all'
                            );
                        setClasses(filteredClasses);
                    }
                    setLoading(false);
                });
            } catch (error) {
                console.error('Error fetching classes:', error);
                setError('Failed to load classes');
                setLoading(false);
            }
        };

        fetchClasses();
    }, [studentClass]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <Typography color="error" align="center">
                {error}
            </Typography>
        );
    }

    return (
        <div style={{ padding: '20px' }}>
            <Typography variant="h6" gutterBottom>
                Live Classes for Class {studentClass}<sup>th</sup>
            </Typography>
            {classes.length === 0 ? (
                <Typography align="center" color="textSecondary">
                    No live classes available for your class at the moment.
                </Typography>
            ) : (
                <Grid container spacing={3} className='py-8'>
                    {classes.map((classItem) => (
                        <motion.div
                            key={classItem.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
                        >
                            <Link href={`/pages/live-classes/${classItem.id}`}>
                                <div className="relative h-48">
                                    <Image
                                        src={classItem.thumbnail}
                                        alt={classItem.title}
                                        layout="fill"
                                        objectFit="cover"
                                    />
                                    {classItem.status === 'live' && (
                                        <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold animate-pulse">
                                            LIVE
                                        </div>
                                    )}
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                        {classItem.title}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                                        {classItem.description}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            <p>By {classItem.teacher}</p>
                                            <p>{classItem.time}</p>
                                            <p>{classItem.date}</p>
                                        </div>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-300"
                                        >
                                            Join Class
                                        </motion.button>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </Grid>
            )}
        </div>
    );
};

export default ViewClasses;
