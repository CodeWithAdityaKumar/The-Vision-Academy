"use client"
import React, { useState, useEffect } from 'react';
import { ref, get, set, getDatabase } from 'firebase/database';
import { format } from 'date-fns';
import { FaCheck, FaEye, FaEyeSlash, FaTimes } from 'react-icons/fa';
import { onValue } from 'firebase/database';
// Add theme import
import { useTheme } from 'next-themes';
import PasswordModal from './PasswordModal';
import { useRouter } from 'next/navigation';  // Change this line


const Attendance = ({ isAdmin }) => {

    const router = useRouter();  // Add this line

    // Add theme hook
    const { theme } = useTheme();
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [loading, setLoading] = useState(false);
    const [existingAttendance, setExistingAttendance] = useState(null);
    const [loadingExisting, setLoadingExisting] = useState(false);
    // Add new states
    const [isVerified, setIsVerified] = useState(isAdmin ? true : false);
    const [showModal, setShowModal] = useState(isAdmin ? false : true);

    // Add new states after existing states
    const [newPassword, setNewPassword] = useState('');
    const [passwordUpdateSuccess, setPasswordUpdateSuccess] = useState(false);
    const [passwordError, setPasswordError] = useState('');

    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);




    const classes = ['Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];

    console.log('isAdmin:', isAdmin);
    

    useEffect(() => {
        const db = getDatabase();
        const passwordRef = ref(db, 'settings/attendancePassword');
        
        onValue(passwordRef, (snapshot) => {
            if (snapshot.exists()) {
                setNewPassword(snapshot.val());
            }
        });
    }, []);
    

    useEffect(() => {
        if (selectedClass) {
            fetchStudents();
        }
    }, [selectedClass]);

    useEffect(() => {
        if (selectedClass && selectedDate) {
            fetchExistingAttendance();
        }
    }, [selectedClass, selectedDate]);

    const fetchStudents = async () => {
        setLoading(true);
        const db = getDatabase();
        const studentsRef = ref(db, 'users');
        
        try {
            const snapshot = await get(studentsRef);
            if (snapshot.exists()) {
                const allUsers = Object.entries(snapshot.val()).map(([id, data]) => ({
                    id,
                    ...data
                }));
                
                // Filter students by role and class
                const filteredStudents = allUsers.filter(user => 
                    user.role === 'student' && 
                    user.class === selectedClass.replace('Class ', '')
                );
                
                setStudents(filteredStudents);
                initializeAttendance(filteredStudents);
            }
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchExistingAttendance = async () => {
        setLoadingExisting(true);
        const db = getDatabase();
        const formattedDate = format(new Date(selectedDate), 'yyyy-MM-dd');
        const attendanceRef = ref(db, `attendance/${selectedClass}/${formattedDate}`);

        try {
            const snapshot = await get(attendanceRef);
            if (snapshot.exists()) {
                const existingData = snapshot.val();
                setAttendance(existingData);
                setExistingAttendance(true);
            } else {
                setExistingAttendance(false);
                initializeAttendance(students);
            }
        } catch (error) {
            console.error('Error fetching existing attendance:', error);
        } finally {
            setLoadingExisting(false);
        }
    };

    const initializeAttendance = (studentsData) => {
        const initialAttendance = {};
        studentsData.forEach(student => {
            initialAttendance[student.id] = false;
        });
        setAttendance(initialAttendance);
    };

    const handleAttendance = (studentId) => {
        setAttendance(prev => ({
            ...prev,
            [studentId]: !prev[studentId]
        }));
    };

    const saveAttendance = async () => {
        if (!selectedClass || !selectedDate) {
            alert('Please select both class and date');
            return;
        }

        const db = getDatabase();
        const formattedDate = format(new Date(selectedDate), 'yyyy-MM-dd');
        const attendanceRef = ref(db, `attendance/${selectedClass}/${formattedDate}`);

        try {
            await set(attendanceRef, attendance);
            alert('Attendance saved successfully!');
        } catch (error) {
            console.error('Error saving attendance:', error);
            alert('Error saving attendance');
        }
    };



    // Add password update function after existing functions
    const handlePasswordChange = async () => {
        if (!newPassword) {
            setPasswordError('Password cannot be empty');
            return;
        }

        const db = getDatabase();
        const passwordRef = ref(db, 'settings/attendancePassword');

        try {
            await set(passwordRef, newPassword);
            setPasswordUpdateSuccess(true);
            setShowPassword(false);
            setTimeout(() => setPasswordUpdateSuccess(false), 3000);
        } catch (error) {
            console.error('Error updating password:', error);
            setPasswordError('Failed to update password');
        }
    };


    // Add password verification function
    const verifyPassword = async (enteredPassword) => {
        const db = getDatabase();
        const passwordRef = ref(db, 'settings/attendancePassword');
        
        try {
            const snapshot = await get(passwordRef);
            if (snapshot.exists()) {
                const correctPassword = snapshot.val();
                if (enteredPassword === correctPassword) {
                    setIsVerified(true);
                    setShowModal(false);
                } else {
                    setError('Incorrect password');
                }
            }
        } catch (error) {
            console.error('Error verifying password:', error);
            setError('Failed to verify password');
        }
    };

    // Update return statement to show modal or attendance
    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
            {!isAdmin && showModal && !isVerified? (
                <PasswordModal 
                    onVerify={verifyPassword}
                    onClose={() => {
                        setLoading(true);
                        setShowModal(false)
                        router.push('/pages/account/dashboard/')
                    }}
                    error={error}
                />
            ) : isVerified ? (
                    <div className="max-w-6xl mx-auto">
                        {isAdmin && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                    Update Attendance Password
                                </h2>
                                <div className="flex items-center space-x-4">
                                    <div className="flex-1 relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={newPassword}
                                            onChange={(e) => {
                                                setNewPassword(e.target.value);
                                                setPasswordError('');
                                            }}
                                            placeholder="Enter new password"
                                            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
                                        >
                                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                    </div>
                                    <button
                                        onClick={handlePasswordChange}
                                        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                                    >
                                        Update Password
                                    </button>
                                </div>
                                {passwordError && (
                                    <p className="mt-2 text-red-500 text-sm">{passwordError}</p>
                                )}
                                {passwordUpdateSuccess && (
                                    <p className="mt-2 text-green-500 text-sm">
                                        Password updated successfully!
                                    </p>
                                )}
                            </div>
                        )}

                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Take Attendance</h1>
                    
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <select
                                value={selectedClass}
                                onChange={(e) => setSelectedClass(e.target.value)}
                                className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select Class</option>
                                {classes.map(className => (
                                    <option key={className} value={className}>{className}</option>
                                ))}
                            </select>

                            <input
                                type="date"
                                    className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    
                            />
                        </div>

                        {(loading || loadingExisting) ? (
                            <div className="text-center py-4">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                <p className="mt-2 text-gray-600 dark:text-gray-400">
                                    {loading ? 'Loading students...' : 'Loading existing attendance...'}
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead>
                                            <tr>
                                                <th className="px-6 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Roll No
                                                </th>
                                                <th className="px-6 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Name
                                                </th>
                                                <th className="px-6 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Attendance
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                            {students.length === 0 ? (
                                                <tr>
                                                    <td colSpan="3" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                                        No students found in {selectedClass}
                                                    </td>
                                                </tr>
                                            ) : (
                                                students.map(student => (
                                                    <tr key={student.id}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">{student.rollNumber}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">{student.name}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <button
                                                                onClick={() => handleAttendance(student.id)}
                                                                className={`p-2 rounded-full ${
                                                                    attendance[student.id]
                                                                        ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400'
                                                                        : 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400'
                                                                }`}
                                                            >
                                                                {attendance[student.id] ? <FaCheck /> : <FaTimes />}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="mt-6 flex justify-between items-center">
                                    {existingAttendance && (
                                        <span className="text-amber-600 dark:text-amber-400 font-medium">
                                            Editing existing attendance for {format(new Date(selectedDate), 'dd MMM yyyy')}
                                        </span>
                                    )}
                                    <button
                                        onClick={saveAttendance}
                                        className="bg-blue-600 dark:bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                                    >
                                        {existingAttendance ? 'Update Attendance' : 'Save Attendance'}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default Attendance;