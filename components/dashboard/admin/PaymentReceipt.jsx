"use client"

import { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import axios from 'axios';

const PaymentReceipt = ({ userId, receiptNumber }) => {
    const receiptRef = useRef();
    const iframeRef = useRef();
    const [receiptData, setReceiptData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReceiptData = async () => {
            try {
                const response = await axios.post('/api/receipt', {
                    userId,
                    receiptNumber
                });
                setReceiptData(response.data);
            } catch (error) {
                console.error('Error fetching receipt data:', error);
                alert('Failed to fetch receipt data');
            } finally {
                setLoading(false);
            }
        };

        if (userId && receiptNumber) {
            fetchReceiptData();
        }
    }, [userId, receiptNumber]);

    const handlePrint = () => {
        if (iframeRef.current) {
            alert('Printing receipt Please Wait...');
            iframeRef.current.src = `/receipt/receipt.html?userId=${userId}&receiptNumber=${receiptNumber}`;
        }
        
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
        );
    }

    if (!receiptData) {
        return <div className="flex justify-center items-center min-h-screen">No receipt data found</div>;
    }

    return (
        <div className="min-h-screen p-2 sm:p-4 md:p-6">
            <iframe 
                ref={iframeRef}
                style={{ display: 'none' }}
                title="Print Receipt"
            />

            

            <div className="block">
                <div ref={receiptRef} id="receipt" className="bg-white p-4 sm:p-6 md:p-8 w-full max-w-[21cm] mx-auto print:shadow-none relative">
                    {/* Add Watermark */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="relative w-[80%] h-[80%]">
                            <Image
                                src="/images/logos/transparent/3.png"
                                alt="Watermark"
                                fill
                                style={{ opacity: 0.1 }}
                                className="object-contain"
                                priority
                            />
                        </div>
                    </div>

                    <div className="border-2 border-gray-800 p-3 sm:p-4 md:p-6 relative z-10">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row items-center text-center border-b-2 border-gray-800 pb-4">
                            <div className="flex items-center mb-4 w-full sm:w-[30%] h-[100%]">
                                <Image
                                    src="/images/logos/1.jpg"
                                    alt="The Vision Academy Logo"
                                    width={150}
                                    height={150}
                                    className="w-24 sm:w-32 md:w-36 lg:w-40"
                                />
                            </div>
                            <div className='w-full sm:w-[45%] mt-[-1rem]'>
                                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-black">FEE RECEIPT</h1>
                                <p className="text-base sm:text-lg text-black font-bold mt-1">
                                    Academic Session : <span className='underline decoration-1'>2025-26</span>
                                </p>
                            </div>
                        </div>

                        {/* Receipt Details */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 mt-4 text-xs sm:text-sm">
                            <div className="text-black">
                                <p><strong>Student Name:</strong> {receiptData.studentName}</p>
                                <p><strong>Class:</strong> {receiptData.class}</p>
                                <p><strong>Roll No:</strong> {receiptData.rollNo}</p>
                                <p><strong>Address:</strong> {receiptData.address}</p>

                            </div>
                            <div className="text-black">
                                <p><strong>Receipt No:</strong> {receiptData.receiptNo}</p>
                                <p><strong>Date:</strong> {new Date(receiptData.date).toLocaleDateString()}</p>
                                <p><strong>Month:</strong> {receiptData.month}</p>
                                {/* <p><strong>Academic Year:</strong> 2024-25</p> */}
                            </div>
                        </div>

                        {/* Fee Table */}
                        <div className="overflow-x-auto mt-4 sm:mt-6">
                            <table className="w-full text-xs sm:text-sm border-collapse text-black">
                                <thead>
                                    <tr>
                                        <th className="border border-gray-800 px-4 py-2 text-left">Particulars</th>
                                        <th className="border border-gray-800 px-4 py-2 text-right">Amount (₹)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="border border-gray-800 px-4 py-2">Monthly Fee</td>
                                        <td className="border border-gray-800 px-4 py-2 text-right font-bold">{receiptData.monthlyFee}</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-gray-800 px-4 py-2">Other Charges</td>
                                        <td className="border border-gray-800 px-4 py-2 text-right font-bold">{receiptData.otherCharges}</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-gray-800 px-4 py-2">Previous Month Due</td>
                                        <td className="border border-gray-800 px-4 py-2 text-right font-bold text-red-700">{receiptData.previousMonthDue}</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-gray-800 px-4 py-2 font-bold">Total</td>
                                        <td className="border border-gray-800 px-4 py-2 text-right font-bold">
                                            {receiptData.total}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="border border-gray-800 px-4 py-2">Paid Amount</td>
                                        <td className="border border-gray-800 px-4 py-2 text-right font-bold text-green-700">{receiptData.paidAmount}</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-gray-800 px-4 py-2 font-bold">Balance Due</td>
                                        <td className="border border-gray-800 px-4 py-2 text-right font-bold text-red-700">
                                            {receiptData.balanceDue}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Signature */}
                        <div className="mt-4 sm:mt-8 flex justify-between text-black text-xs sm:text-sm">
                            <div>
                                <p>Student's Signature</p>
                                <div className="mt-8 border-t border-gray-800 w-32"></div>
                            </div>
                            <div>
                                <p>Authorized Signature</p>
                                <div className="mt-8 border-t border-gray-800 w-32"></div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-4 sm:mt-8 text-center text-xs sm:text-sm text-black">
                            <p>This is a computer generated receipt, no signature required.</p>
                        </div>
                    </div>
                </div>

                <div className="mt-4 text-center print:hidden flex justify-center gap-4">
                    <button
                        onClick={handlePrint}
                        className="bg-blue-600 text-white px-4 sm:px-6 py-2 text-sm sm:text-base rounded hover:bg-blue-700"
                    >
                        Print Receipt
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentReceipt;