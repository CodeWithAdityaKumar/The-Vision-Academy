import React, { useState, useEffect } from 'react';
import { Card, Grid, Typography, Button } from '@mui/material';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db, auth, database } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';
import { useAuthState } from 'react-firebase-hooks/auth';

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
                    if (data) {
                        const filteredClasses = Object.entries(data)
                            .map(([id, values]) => ({
                                id,
                                ...values,
                            }))
                            .filter(classItem => 
                                classItem.targetClass === studentClass || 
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
            <Typography variant="h4" gutterBottom>
                Live Classes for {studentClass}
            </Typography>
            {classes.length === 0 ? (
                <Typography align="center" color="textSecondary">
                    No live classes available for your class at the moment.
                </Typography>
            ) : (
                <Grid container spacing={3}>
                    {classes.map((classItem) => (
                        <Grid item xs={12} sm={6} md={4} key={classItem.id}>
                            <Card sx={{ 
                                p: 2, 
                                position: 'relative',
                                '&:hover': { transform: 'scale(1.02)', transition: 'transform 0.2s' }
                            }}>
                                {classItem.status === 'live' && (
                                    <div style={{
                                        position: 'absolute',
                                        top: 10,
                                        right: 10,
                                        backgroundColor: '#ef4444',
                                        color: 'white',
                                        padding: '4px 8px',
                                        borderRadius: '9999px',
                                        fontSize: '0.75rem'
                                    }}>
                                        LIVE
                                    </div>
                                )}
                                <Typography variant="h6">{classItem.title}</Typography>
                                <Typography variant="body1" color="text.secondary">
                                    {classItem.description}
                                </Typography>
                                <Typography variant="body2" sx={{ mt: 1 }}>
                                    Subject: {classItem.subject}
                                </Typography>
                                <Typography variant="body2">
                                    Time: {classItem.time}
                                </Typography>
                                <Typography variant="body2">
                                    Teacher: {classItem.teacher}
                                </Typography>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    sx={{ 
                                        mt: 2,
                                        bgcolor: '#ef4444',
                                        '&:hover': { bgcolor: '#dc2626' }
                                    }}
                                    href={`/pages/live-classes/${classItem.id}`}
                                >
                                    Join Class
                                </Button>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </div>
    );
};

export default ViewClasses;
