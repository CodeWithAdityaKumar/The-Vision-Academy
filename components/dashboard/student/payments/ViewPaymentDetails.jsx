"use client";
import { useState, useEffect, useRef } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "@/lib/firebase";
import { useAuth } from "@/components/AuthProvider";
import { motion } from "framer-motion";
import {
    CircularProgress,
    Tooltip,
    TextField,
    IconButton,
} from "@mui/material";
import { Search, Sort, ExpandMore, ExpandLess } from "@mui/icons-material";

const ViewPaymentDetails = () => {
    const { user } = useAuth();
    const iframeRef = useRef();
    const [paymentDetails, setPaymentDetails] = useState(null);
    const [classFees, setClassFees] = useState({});
    const [userUid, setUserUid] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedMonth, setSelectedMonth] = useState(
        new Date().toLocaleString("default", { month: "long" })
    );
    const [paymentHistory, setPaymentHistory] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortConfig, setSortConfig] = useState({
        key: "updatedAt",
        direction: "desc",
    });
    const [expandedRow, setExpandedRow] = useState(null);

    const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];

    useEffect(() => {
        // Fetch class fees first
        const classFeesRef = ref(database, "classFees");
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
                    const previousPayment =
                        paymentHistory.length > 0 ? paymentHistory[0] : null;
                    const previousDue = previousPayment ? previousPayment.balanceDue : 0;

                    setPaymentDetails({
                        name: data.name,
                        class: data.class,
                        rollNo: data.rollNo,
                        address: data.address,
                        monthlyFee: classFees[data.class]?.monthlyFee || 0,
                        otherCharges: data.fees?.[selectedMonth]?.otherCharges || 0,
                        paidAmount: data.fees?.[selectedMonth]?.paidAmount || 0,
                        feeStatus: data.fees?.[selectedMonth]?.status || "Unpaid",
                        previousDue: previousDue > 0 ? previousDue : 0,
                    });
                }
                setLoading(false);
            });

            // Fetch all payment history
            const paymentHistoryRef = ref(database, `users/${user.uid}/feeHistory`);
            onValue(paymentHistoryRef, (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    const history = Object.keys(data)
                        .flatMap((month) =>
                            Object.keys(data[month]).map((receiptNumber, index) => {
                                const previousPayment =
                                    index > 0
                                        ? data[month][Object.keys(data[month])[index - 1]]
                                        : null;
                                const previousDue = previousPayment
                                    ? previousPayment.balanceDue
                                    : 0;
                                const balanceDue =
                                    data[month][receiptNumber].monthlyFee +
                                    data[month][receiptNumber].otherCharges +
                                    previousDue -
                                    data[month][receiptNumber].paidAmount;
                                return {
                                    month,
                                    ...data[month][receiptNumber],
                                    sNo: index + 1,
                                    balanceDue: balanceDue > 0 ? balanceDue : 0,
                                };
                            })
                        )
                        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
                    setPaymentHistory(history);
                }
            });
        }
    }, [user, selectedMonth, classFees, paymentHistory]);

    const handleViewReceipt = (studentId, receiptNumber) => {
        if (iframeRef.current) {
            alert("Printing receipt Please Wait...");
            iframeRef.current.src = `/receipt/receipt.html?userId=${studentId}&receiptNumber=${receiptNumber}`;
        }
    };

    const fadeIn = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5 },
    };

    if (loading)
        return (
            <div className="flex justify-center items-center min-h-screen">
                <CircularProgress />
            </div>
        );

    if (error) return <div className="text-red-500 p-4">{error}</div>;
    if (!paymentDetails)
        return <div className="text-center p-4">No payment details found</div>;

    const totalAmount =
        paymentDetails.monthlyFee +
        paymentDetails.otherCharges +
        paymentDetails.previousDue;
    const balanceDue =
        totalAmount - paymentDetails.paidAmount > 0
            ? totalAmount - paymentDetails.paidAmount
            : 0;

    // Add sorting function
    const sortedHistory = [...paymentHistory].sort((a, b) => {
        if (sortConfig.key === "updatedAt") {
            return sortConfig.direction === "asc"
                ? new Date(a.updatedAt) - new Date(b.updatedAt)
                : new Date(b.updatedAt) - new Date(a.updatedAt);
        }
        return sortConfig.direction === "asc"
            ? a[sortConfig.key] - b[sortConfig.key]
            : b[sortConfig.key] - a[sortConfig.key];
    });

    // Filter function
    const filteredHistory = sortedHistory.filter(
        (payment) =>
            payment.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            new Date(payment.updatedAt)
                .toLocaleString()
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
    );


    const renderPaymentHistory = () => (
        <motion.div className="mb-6" variants={fadeIn}>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
                {/* Stats Overview */}
                <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
                    Stats Overview
                </h3>
                <div className="mb-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                        <h4 className="text-blue-600 dark:text-blue-400 text-sm font-medium">
                            Total Paid
                        </h4>
                        <p className="text-2xl font-bold mt-2">
                            ₹{filteredHistory.reduce((sum, p) => sum + p.paidAmount, 0)}
                        </p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                        <h4 className="text-green-600 dark:text-green-400 text-sm font-medium">
                            Paid Receipts
                        </h4>
                        <p className="text-2xl font-bold mt-2">
                            {filteredHistory.filter((p) => p.balanceDue === 0).length}
                        </p>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                        <h4 className="text-yellow-600 dark:text-yellow-400 text-sm font-medium">
                            Partial Payments
                        </h4>
                        <p className="text-2xl font-bold mt-2">
                            {filteredHistory.filter((p) => p.balanceDue > 0).length}
                        </p>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                        <h4 className="text-purple-600 dark:text-purple-400 text-sm font-medium">
                            Last Payment
                        </h4>
                        <p className="text-lg font-bold mt-2">
                            {filteredHistory.length > 0
                                ? new Date(filteredHistory[0].updatedAt).toLocaleDateString(
                                    "en-IN",
                                    {
                                        month: "short",
                                        day: "numeric",
                                    }
                                )
                                : "N/A"}
                        </p>
                    </div>
                </div>

                {/* Search and Controls */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                    <h3 className="text-2xl font-semibold text-gray-800 dark:text-white">
                        Payment History
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
                        <div className="relative w-full sm:w-64">
                            <input
                                type="text"
                                placeholder="Search payments..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 pl-10 pr-4 rounded-lg border border-gray-300 dark:border-gray-600 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-red-500 focus:border-transparent
                       transition-all duration-300"
                            />
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        </div>
                        <div className="flex items-center gap-2">
                            <select
                                onChange={(e) =>
                                    setSortConfig({
                                        key: e.target.value,
                                        direction: sortConfig.direction,
                                    })
                                }
                                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                                <option value="updatedAt">Sort by Date</option>
                                <option value="paidAmount">Sort by Amount</option>
                                <option value="balanceDue">Sort by Balance</option>
                            </select>
                            <button
                                onClick={() =>
                                    setSortConfig({
                                        ...sortConfig,
                                        direction: sortConfig.direction === "asc" ? "desc" : "asc",
                                    })
                                }
                                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500
                       transition-all duration-300"
                            >
                                {sortConfig.direction === "asc" ? "↑" : "↓"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Payment Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {filteredHistory.map((payment, index) => (
                        <motion.div
                            key={payment.receiptNumber}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            className="group relative bg-gradient-to-br from-gray-50 to-gray-100 
                     dark:from-gray-700 dark:to-gray-600 rounded-xl overflow-hidden
                     hover:shadow-xl transition-all duration-300"
                        >
                            {/* Status Badge  */}
                            <div className="absolute top-4 right-4">
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-medium
                              ${payment.balanceDue > 0
                                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                                            : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                                        }`}
                                >
                                    {payment.balanceDue > 0 ? "Partial" : "Paid"}
                                </span>
                            </div>

                            <div className="p-5">
                                {/* Receipt Header */}
                                <div className="mb-4">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                        Receipt No.
                                    </span>
                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {payment.receiptNumber}
                                    </h4>
                                </div>

                                {/* Amount Info */}
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 dark:text-gray-300">
                                            Paid:
                                        </span>
                                        <span className="text-green-600 dark:text-green-400 font-semibold text-lg">
                                            ₹{payment.paidAmount}
                                        </span>
                                    </div>
                                    {payment.balanceDue > 0 && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600 dark:text-gray-300">
                                                Due:
                                            </span>
                                            <span className="text-red-600 dark:text-red-400 font-semibold">
                                                ₹{payment.balanceDue}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-600 dark:text-gray-300">
                                            Date:
                                        </span>
                                        <span className="text-gray-800 dark:text-gray-200">
                                            {new Date(payment.updatedAt).toLocaleDateString("en-IN", {
                                                year: "numeric",
                                                month: "short",
                                                day: "numeric",
                                            })}
                                        </span>
                                    </div>
                                </div>

                                {/* Expandable Details */}
                                <motion.div
                                    initial={false}
                                    animate={{ height: expandedRow === index ? "auto" : 0 }}
                                    className="overflow-hidden"
                                >
                                    {expandedRow === index && (
                                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600 space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600 dark:text-gray-300">
                                                    Month:
                                                </span>
                                                <span className="text-gray-800 dark:text-gray-200">
                                                    {payment.month}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600 dark:text-gray-300">
                                                    Monthly Fee:
                                                </span>
                                                <span className="text-gray-800 dark:text-gray-200">
                                                    ₹{payment.monthlyFee}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600 dark:text-gray-300">
                                                    Other Charges:
                                                </span>
                                                <span className="text-gray-800 dark:text-gray-200">
                                                    ₹{payment.otherCharges}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>

                                {/* Card Actions */}
                                <div className="mt-4 flex items-center justify-between">
                                    <button
                                        onClick={() =>
                                            setExpandedRow(expandedRow === index ? null : index)
                                        }
                                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 
                           dark:hover:text-blue-300 transition-colors duration-200
                           flex items-center gap-1 text-sm"
                                    >
                                        {expandedRow === index ? (
                                            <>
                                                <ExpandLess className="w-4 h-4" />
                                                Less
                                            </>
                                        ) : (
                                            <>
                                                <ExpandMore className="w-4 h-4" />
                                                More
                                            </>
                                        )}
                                    </button>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() =>
                                            handleViewReceipt(userUid, payment.receiptNumber)
                                        }
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg 
                           hover:bg-blue-700 transition-colors duration-300 text-sm font-medium"
                                    >
                                        <span>Print</span>
                                        <svg
                                            className="w-4 h-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2z"
                                            />
                                        </svg>
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Empty State */}
                {filteredHistory.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-12"
                    >
                        <div className="flex flex-col items-center gap-4">
                            <svg
                                className="w-16 h-16 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                            <p className="text-gray-500 dark:text-gray-400 text-lg">
                                No payment records found
                            </p>
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );

    return (
        <div className="p-3 md:p-6 max-w-7xl mx-auto">
            <iframe
                ref={iframeRef}
                style={{ display: "none" }}
                title="Print Receipt"
            />

            <motion.div
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 md:p-6"
                initial="initial"
                animate="animate"
                variants={fadeIn}
            >
                <h2 className="text-xl md:text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                    Payment Details
                </h2>

                <motion.div className="mb-6" variants={fadeIn}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Select Month:
                    </label>
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="w-full md:w-1/3 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 
                                 focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                    >
                        {months.map((month) => (
                            <option key={month} value={month}>
                                {month}
                            </option>
                        ))}
                    </select>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
                    <motion.div className="space-y-4" variants={fadeIn}>
                        <div
                            className="bg-gradient-to-r from-blue-50 to-blue-100 
                                      dark:from-gray-700 dark:to-gray-600 
                                      p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
                        >
                            <h3 className="font-semibold mb-3 text-blue-800 dark:text-blue-200">
                                Student Information
                            </h3>
                            <div className="space-y-2">
                                <p className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-300">
                                        Name:
                                    </span>
                                    <span className="font-medium">{paymentDetails.name}</span>
                                </p>
                                <p className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-300">
                                        Class:
                                    </span>
                                    <span className="font-medium">{paymentDetails.class}</span>
                                </p>
                                <p className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-300">
                                        Roll No:
                                    </span>
                                    <span className="font-medium">{paymentDetails.rollNo}</span>
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div className="space-y-4" variants={fadeIn}>
                        <div
                            className="bg-gradient-to-r from-green-50 to-green-100 
                                      dark:from-gray-700 dark:to-gray-600 
                                      p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
                        >
                            <h3 className="font-semibold mb-3 text-green-800 dark:text-green-200">
                                Fee Details
                            </h3>
                            <div className="space-y-2">
                                <p className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-300">
                                        Monthly Fee:
                                    </span>
                                    <span className="font-medium">
                                        ₹{paymentDetails.monthlyFee}
                                    </span>
                                </p>
                                <p className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-300">
                                        Other Charges:
                                    </span>
                                    <span className="font-medium">
                                        ₹{paymentDetails.otherCharges}
                                    </span>
                                </p>
                                <p className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-300">
                                        Previous Due:
                                    </span>
                                    <span className="font-medium">
                                        ₹{paymentDetails.previousDue}
                                    </span>
                                </p>
                                <div className="border-t pt-2 mt-2">
                                    <p className="flex justify-between font-semibold">
                                        <span>Total Amount:</span>
                                        <span>₹{totalAmount}</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                <motion.div className="mb-6" variants={fadeIn}>
                    <div
                        className="bg-gradient-to-r from-purple-50 to-purple-100 
                                  dark:from-gray-700 dark:to-gray-600 
                                  p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
                    >
                        <h3 className="font-semibold mb-3 text-purple-800 dark:text-purple-200">
                            Payment Status
                        </h3>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="space-y-2 w-full sm:w-auto">
                                <p className="flex justify-between sm:block">
                                    <span className="text-gray-600 dark:text-gray-300">
                                        Paid Amount:
                                    </span>
                                    <span className="font-medium ml-2">
                                        ₹{paymentDetails.paidAmount}
                                    </span>
                                </p>
                                <p className="flex justify-between sm:block">
                                    <span className="text-gray-600 dark:text-gray-300">
                                        Balance Due:
                                    </span>
                                    <span className="font-medium ml-2">₹{balanceDue}</span>
                                </p>
                            </div>
                            <Tooltip title={`Status: ${paymentDetails.feeStatus}`}>
                                <div
                                    className={`px-4 py-2 rounded-full text-center w-full sm:w-auto
                                    ${paymentDetails.feeStatus === "Paid"
                                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                        }`}
                                >
                                    {paymentDetails.feeStatus}
                                </div>
                            </Tooltip>
                        </div>
                    </div>
                </motion.div>

                {renderPaymentHistory()}

                {paymentDetails.feeStatus !== "Unpaid" && (
                    <motion.div className="flex justify-center" variants={fadeIn}>
                        <button
                            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 
                                     transition-all duration-300 transform hover:scale-105 
                                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            onClick={() =>
                                handleViewReceipt(userUid, paymentDetails.receiptNumber)
                            }
                        >
                            Print Current Month Receipt
                        </button>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};

export default ViewPaymentDetails;
