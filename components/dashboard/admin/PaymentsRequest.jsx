"use client"
import { useState, useEffect } from 'react';
import { ref, onValue, update } from 'firebase/database';
import { database } from '@/lib/firebase';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

const PaymentsRequest = () => {
    const router = useRouter();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editFee, setEditFee] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterClass, setFilterClass] = useState('all');
    const [selectedMonth, setSelectedMonth] = useState(new Date().toLocaleString('default', { month: 'long' }));

    const [editMonthlyFee, setEditMonthlyFee] = useState('');
    const [editOtherCharges, setEditOtherCharges] = useState('');
    const [editPaidAmount, setEditPaidAmount] = useState('');

    const [classFees, setClassFees] = useState({});
    const [editingClassFee, setEditingClassFee] = useState(null);
    const [newClassFee, setNewClassFee] = useState('');

    const [activeSection, setActiveSection] = useState('students'); // 'students' or 'classFees'

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    useEffect(() => {
        const studentsRef = ref(database, 'users');
        onValue(studentsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const studentsList = Object.entries(data)
                    .filter(([_, user]) => user.role === 'student')
                    .map(([id, user]) => ({
                        id,
                        name: user.name,
                        class: user.class,
                        monthlyFee: classFees[user.class]?.monthlyFee || 0,
                        otherCharges: user.fees?.[selectedMonth]?.otherCharges || 0,
                        paidAmount: user.fees?.[selectedMonth]?.paidAmount || 0,
                        feeStatus: user.fees?.[selectedMonth]?.status || 'Unpaid'

                    }));
                setStudents(studentsList);
            }
            setLoading(false);
        });
    }, [selectedMonth, classFees]);

    useEffect(() => {
        const classFeesRef = ref(database, 'classFees');
        onValue(classFeesRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setClassFees(data);
            }
        });
    }, []);

    const handleUpdateFee = async (id) => {
        try {
            const student = students.find(s => s.id === id);
            const monthlyFee = classFees[student.class]?.monthlyFee || 0;
            const otherCharges = parseInt(editOtherCharges) || 0;
            const paidAmount = parseInt(editPaidAmount) || 0;
            const totalDue = monthlyFee + otherCharges - paidAmount;

            const userRef = ref(database, `users/${id}/fees/${selectedMonth}`);
            await update(userRef, {
                monthlyFee,
                otherCharges,
                paidAmount,
                status: totalDue <= 0 ? 'Paid' : 'Unpaid',
                updatedAt: new Date().toISOString()
            });
            setEditingId(null);
            resetEditFields();
        } catch (error) {
            setError('Failed to update fee');
        }
    };

    const handleUpdateClassFee = async (classNum) => {
        try {
            const feeAmount = parseInt(newClassFee) || 0;
            const classFeesRef = ref(database, `classFees/${classNum}`);
            await update(classFeesRef, { monthlyFee: feeAmount });
            setEditingClassFee(null);
            setNewClassFee('');
        } catch (error) {
            setError('Failed to update class fee');
        }
    };

    const resetEditFields = () => {
        setEditMonthlyFee('');
        setEditOtherCharges('');
        setEditPaidAmount('');
    };

    const handleViewReceipt = (studentId, month) => {
        setLoading(true);
        router.push(`/pages/account/dashboard/students/paymentReceipt/${studentId}/${month}`);
    };

    const filteredStudents = students.filter(student => {
        const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || student.feeStatus === filterStatus;
        const matchesClass = filterClass === 'all' || student.class === filterClass;
        return matchesSearch && matchesStatus && matchesClass;
    });

    if (loading) {
        return <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>;
    }

    return (
        <div className="p-2 pt-4 sm:p-4 md:p-6">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-900 dark:text-white">
                Student Fees Management
            </h2>

            {/* Toggle Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
                <button
                    onClick={() => setActiveSection('students')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                        ${activeSection === 'students' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200'}
                    `}
                >
                    Edit Student Fees
                </button>
                <button
                    onClick={() => setActiveSection('classFees')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                        ${activeSection === 'classFees' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200'}
                    `}
                >
                    Edit Class Fees
                </button>
            </div>

            {/* Conditional Rendering */}
            {activeSection === 'classFees' ? (
                <div className="mb-6 sm:mb-8">
                    <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-gray-900 dark:text-white">
                        Class-wise Monthly Fees
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                        {[5,6,7,8,9,10,11,12].map(classNum => (
                            <div key={classNum} className="p-4 border rounded-lg dark:border-gray-700">
                                <h4 className="font-semibold mb-2">Class {classNum}</h4>
                                {editingClassFee === classNum ? (
                                    <div className="flex space-x-2">
                                        <input
                                            type="number"
                                            value={newClassFee}
                                            onChange={(e) => setNewClassFee(e.target.value)}
                                            className="w-24 border rounded px-2 py-1 dark:bg-gray-700 dark:text-white"
                                        />
                                        <button
                                            onClick={() => handleUpdateClassFee(classNum)}
                                            className="text-green-600 hover:text-green-900"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={() => {
                                                setEditingClassFee(null);
                                                setNewClassFee('');
                                            }}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex justify-between items-center">
                                        <span>₹{classFees[classNum]?.monthlyFee || 0}</span>
                                        <button
                                            onClick={() => {
                                                setEditingClassFee(classNum);
                                                setNewClassFee((classFees[classNum]?.monthlyFee || 0).toString());
                                            }}
                                            className="text-blue-600 hover:text-blue-900"
                                        >
                                            Edit
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <>
                    {/* Search and Filter Controls */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="w-full sm:w-auto px-3 sm:px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                        >
                            {months.map(month => (
                                <option key={month} value={month}>{month}</option>
                            ))}
                        </select>
                        <input
                            type="text"
                            placeholder="Search by name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full sm:w-auto px-3 sm:px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                        />
                        <select
                            value={filterClass}
                            onChange={(e) => setFilterClass(e.target.value)}
                            className="w-full sm:w-auto px-3 sm:px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                        >
                            <option value="all">All Classes</option>
                            {[5,6,7,8,9,10,11,12].map(classNum => (
                                <option key={classNum} value={`${classNum}`}>Class {classNum}</option>
                            ))}
                        </select>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full sm:w-auto px-3 sm:px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                        >
                            <option value="all">All Status</option>
                            <option value="Paid">Paid</option>
                            <option value="Unpaid">Unpaid</option>
                        </select>
                    </div>

                    {/* Students Table */}
                    <div className="overflow-x-auto -mx-4 sm:mx-0">
                        <div className="inline-block min-w-full align-middle">
                            <div className="overflow-hidden border border-gray-200 dark:border-gray-700 sm:rounded-lg">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Class</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Monthly Fee</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Other Charges</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Paid Amount</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total Due</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Receipt
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {filteredStudents.map((student) => {
                                            const totalDue = student.monthlyFee + student.otherCharges - student.paidAmount;
                                            return (
                                                <tr key={student.id}>
                                                    {/* Make cells more compact on mobile */}
                                                    <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                        {student.name}
                                                    </td>
                                                    <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                        {student.class}
                                                    </td>
                                                    <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                                                        {editingId === student.id ? (
                                                            <input
                                                                type="number"
                                                                value={editMonthlyFee}
                                                                onChange={(e) => setEditMonthlyFee(e.target.value)}
                                                                className="border rounded px-2 py-1 w-24 dark:bg-gray-700 dark:text-white"
                                                            />
                                                        ) : (
                                                            <span className="text-gray-900 dark:text-white">₹{student.monthlyFee}</span>
                                                        )}
                                                    </td>
                                                    <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                                                        {editingId === student.id ? (
                                                            <input
                                                                type="number"
                                                                value={editOtherCharges}
                                                                onChange={(e) => setEditOtherCharges(e.target.value)}
                                                                className="border rounded px-2 py-1 w-24 dark:bg-gray-700 dark:text-white"
                                                            />
                                                        ) : (
                                                            <span className="text-gray-900 dark:text-white">₹{student.otherCharges}</span>
                                                        )}
                                                    </td>
                                                    <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                                                        {editingId === student.id ? (
                                                            <input
                                                                type="number"
                                                                value={editPaidAmount}
                                                                onChange={(e) => setEditPaidAmount(e.target.value)}
                                                                className="border rounded px-2 py-1 w-24 dark:bg-gray-700 dark:text-white"
                                                            />
                                                        ) : (
                                                            <span className="text-gray-900 dark:text-white">₹{student.paidAmount}</span>
                                                        )}
                                                    </td>
                                                    <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap">₹{totalDue}</td>
                                                    <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                                                        <span className={`px-2 py-1 rounded-full text-xs ${totalDue <= 0
                                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                            }`}>
                                                            {totalDue <= 0 ? 'Paid' : 'Unpaid'}
                                                        </span>
                                                    </td>
                                                    <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                                                        <div className="flex flex-col sm:flex-row gap-2">
                                                            {editingId === student.id ? (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleUpdateFee(student.id)}
                                                                        className="text-xs sm:text-sm text-green-600 hover:text-green-900"
                                                                    >
                                                                        Save
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            setEditingId(null);
                                                                            resetEditFields();
                                                                        }}
                                                                        className="text-xs sm:text-sm text-red-600 hover:text-red-900"
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <button
                                                                    onClick={() => {
                                                                        setEditingId(student.id);
                                                                        setEditMonthlyFee(student.monthlyFee.toString());
                                                                        setEditOtherCharges(student.otherCharges.toString());
                                                                        setEditPaidAmount(student.paidAmount.toString());
                                                                    }}
                                                                    className="text-xs sm:text-sm text-blue-600 hover:text-blue-900"
                                                                >
                                                                    Edit Fee
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                                                        <button
                                                            onClick={() => handleViewReceipt(student.id, selectedMonth)}
                                                            className="text-xs sm:text-sm bg-purple-600 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-lg hover:bg-purple-700 transition-colors w-full sm:w-auto"
                                                        >
                                                            View Receipt
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </>
            )}
            {error && (
                <p className="mt-4 text-red-600">{error}</p>
            )}
        </div>
    );
};

export default PaymentsRequest;