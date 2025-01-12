"use client"

import { useState, useEffect } from 'react';
import { ref, onValue, get } from 'firebase/database';
import { database } from '@/lib/firebase';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import PaymentReceipt from '@/components/dashboard/admin/PaymentReceipt';

const Page = ({ params }) => {
    const { studentID, month } = params;
    const router = useRouter();
    const [studentData, setStudentData] = useState(null);
    const [classFees, setClassFees] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        // Check authorization
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (!user) {
                router.push('/pages/account/login');
                return;
            }

            const userRef = ref(database, `users/${user.uid}`);
            const snapshot = await get(userRef);
            const userData = snapshot.val();

            // Check authorization
            if (userData.role === 'admin' || 
                userData.role === 'teacher' || 
                (userData.role === 'student' && user.uid === studentID)) {
                setAuthorized(true);
            } else {
                router.push('/pages/account/login');
            }
        });

        return () => unsubscribe();
    }, [studentID, router]);

    useEffect(() => {
        if (!authorized) return;

        // Fetch data only if authorized
        const classFeesRef = ref(database, 'classFees');
        onValue(classFeesRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setClassFees(data);
            }
        });

        const studentRef = ref(database, `users/${studentID}`);
        onValue(studentRef, (snapshot) => {
            try {
                const data = snapshot.val();
                if (data) {
                    const monthlyFee = classFees[data.class]?.monthlyFee || 0;
                    setStudentData({
                        name: data.name || '',
                        class: data.class || '',
                        rollNo: data.rollNo || '',
                        address: data.address || '',
                        monthlyFee: monthlyFee,
                        otherCharges: data.fees?.[month]?.otherCharges || 0,
                        paidAmount: data.fees?.[month]?.paidAmount || 0,
                        status: data.fees?.[month]?.status || 'Unpaid'
                    });
                } else {
                    setError('Student not found');
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        });
    }, [studentID, month, classFees, authorized]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
        );
    }

    if (!authorized) {
        return <div className="text-red-600 text-center p-4">Unauthorized access</div>;
    }

    if (error) {
        return <div className="text-red-600 text-center p-4">{error}</div>;
    }

    if (!studentData) {
        return <div className="text-center p-4">Student not found</div>;
    }

    return <PaymentReceipt student={studentData} selectedMonth={month} />;
};

export default Page;