"use client"
import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '@/lib/firebase';
import { useAuth } from '@/components/AuthProvider';

import { useRouter, redirect } from 'next/navigation';
import Link from 'next/link';

const ViewPaymentDetails = () => {


    const router = useRouter();

    const { user } = useAuth();
    const [paymentDetails, setPaymentDetails] = useState(null);
    const [classFees, setClassFees] = useState({});
    const [userUid, setUserUid] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedMonth, setSelectedMonth] = useState(new Date().toLocaleString('default', { month: 'long' }));
    const [paymentHistory, setPaymentHistory] = useState([]);


    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    useEffect(() => {
        // Fetch class fees first
        const classFeesRef = ref(database, 'classFees');
        onValue(classFeesRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setClassFees(data);
            }
        });

        // Then fetch student data
        if (user?.uid) {
            setUserUid(user.uid);
            const studentRef = ref(database, `users/${user.uid}`);
            onValue(studentRef, (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    const previousPayment = paymentHistory.length > 0 ? paymentHistory[0] : null;
                    const previousDue = previousPayment ? previousPayment.balanceDue : 0;

                    setPaymentDetails({
                        name: data.name,
                        class: data.class,
                        rollNo: data.rollNo,
                        address: data.address,
                        monthlyFee: classFees[data.class]?.monthlyFee || 0,
                        otherCharges: data.fees?.[selectedMonth]?.otherCharges || 0,
                        paidAmount: data.fees?.[selectedMonth]?.paidAmount || 0,
                        feeStatus: data.fees?.[selectedMonth]?.status || 'Unpaid',
                        previousDue: previousDue > 0 ? previousDue : 0
                    });
                }
                setLoading(false);
            });

            // Fetch all payment history
            const paymentHistoryRef = ref(database, `users/${user.uid}/feeHistory`);
            onValue(paymentHistoryRef, (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    const history = Object.keys(data).flatMap(month => 
                        Object.keys(data[month]).map((receiptNumber, index) => {
                            const previousPayment = index > 0 ? data[month][Object.keys(data[month])[index - 1]] : null;
                            const previousDue = previousPayment ? previousPayment.balanceDue : 0;
                            const balanceDue = (data[month][receiptNumber].monthlyFee + data[month][receiptNumber].otherCharges + previousDue) - data[month][receiptNumber].paidAmount;
                            return {
                                month,
                                ...data[month][receiptNumber],
                                sNo: index + 1,
                                balanceDue: balanceDue > 0 ? balanceDue : 0
                            };
                        })
                    ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
                    setPaymentHistory(history);
                }
            });
        }
    }, [user, selectedMonth, classFees, paymentHistory]);


    const handleViewReceipt = (studentId, month) => {
        setLoading(true);

        // router.push(`/pages/account/dashboard/students/paymentReceipt/${studentId}/${month}`)

        window.location.pathname = `/pages/account/dashboard/students/paymentReceipt/${studentId}/${month}`
        
    };


    if (loading) return <div className="text-center p-4">Loading...</div>;
    if (error) return <div className="text-red-500 p-4">{error}</div>;
    if (!paymentDetails) return <div className="text-center p-4">No payment details found</div>;

    const totalAmount = (paymentDetails.monthlyFee + paymentDetails.otherCharges + paymentDetails.previousDue);
    const balanceDue = totalAmount - paymentDetails.paidAmount > 0 ? totalAmount - paymentDetails.paidAmount : 0;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Payment Details</h2>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Select Month:
                    </label>
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                    >
                        {months.map((month) => (
                            <option key={month} value={month}>{month}</option>
                        ))}
                    </select>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-4">
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                            <h3 className="font-semibold mb-2">Student Information</h3>
                            <p>Name: {paymentDetails.name}</p>
                            <p>Class: {paymentDetails.class}</p>
                            <p>Roll No: {paymentDetails.rollNo}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                            <h3 className="font-semibold mb-2">Fee Details</h3>
                            <p>Monthly Fee: ₹{paymentDetails.monthlyFee}</p>
                            <p>Other Charges: ₹{paymentDetails.otherCharges}</p>
                            <p>Previous Due: ₹{paymentDetails.previousDue}</p>
                            <p>Total Amount: ₹{totalAmount}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6">
                    <h3 className="font-semibold mb-2">Payment Status</h3>
                    <div className="flex justify-between items-center">
                        <div>
                            <p>Paid Amount: ₹{paymentDetails.paidAmount}</p>
                            <p>Balance Due: ₹{balanceDue}</p>
                        </div>
                        <div className={`px-4 py-2 rounded-full ${
                            paymentDetails.feeStatus === 'Paid' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                            {paymentDetails.feeStatus}
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6">
                    <h3 className="font-semibold mb-2">Payment History</h3>
                    <table className="min-w-full bg-white dark:bg-gray-800">
                        <thead>
                            <tr>
                                <th className="py-2">S. No.</th>
                                <th className="py-2">Paid Amount</th>
                                <th className="py-2">Balance Due</th>
                                <th className="py-2">Date and Time of Payment</th>
                                <th className="py-2">Receipt</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paymentHistory.map((payment, index) => (
                                <tr key={index} className="text-center">
                                    <td className="py-2">{index + 1}</td>
                                    <td className="py-2">₹{payment.paidAmount}</td>
                                    <td className="py-2">₹{payment.balanceDue > 0 ? payment.balanceDue : 0}</td>
                                    <td className="py-2">{new Date(payment.updatedAt).toLocaleString()}</td>
                                    <td className="py-2">
                                        {/* <Link href={`/pages/account/dashboard/students/paymentReceipt/${userUid}/${payment.month}`}
                                            className="bg-blue-600 text-white px-4 py-1 rounded-md hover:bg-blue-700 transition-colors"
                                        >
                                            Download Receipt
                                        </Link> */}

                                        <button className="bg-blue-600 text-white px-4 py-1 rounded-md hover:bg-blue-700 transition-colors" onClick={() => handleViewReceipt(userUid, payment.month)}>View Receipt</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-center">
                    {/* <Link href={`/pages/account/dashboard/students/paymentReceipt/${userUid}/${selectedMonth}`}
                        className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                        View Receipt
                    </Link> */}

                    <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors" onClick={() => handleViewReceipt(userUid, selectedMonth)}>View Receipt</button>
                </div>
            </div>
        </div>
    );
};

export default ViewPaymentDetails;