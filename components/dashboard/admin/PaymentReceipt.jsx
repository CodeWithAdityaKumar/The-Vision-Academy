"use client"

import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import Image from 'next/image';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const PaymentReceipt = ({ student, selectedMonth }) => {
    const receiptRef = useRef();
    const today = new Date().toLocaleDateString();
    const receiptNumber = `TVA${Date.now().toString().slice(-6)}`;

    const handlePrint = useReactToPrint({
        content: () => receiptRef.current
    });



    const downloadPDF = async () => {
        try {
            const element = receiptRef.current;
            const canvas = await html2canvas(element, {
                scale: 15, 
                useCORS: true,
                logging: false,
                scrollY: -window.scrollY,
                windowWidth: element.scrollWidth,
                windowHeight: element.scrollHeight,
                // Better quality settings
                backgroundColor: '#ffffff',
                imageTimeout: 0,
                removeContainer: true,
                letterRendering: true,
                allowTaint: true
            });

            const imgData = canvas.toDataURL('image/jpeg', 1.0);
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'px',
                format: 'a4',
                hotfixes: ['px_scaling']
            });

            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const widthRatio = pageWidth / canvas.width;
            const heightRatio = pageHeight / canvas.height;
            const ratio = Math.min(widthRatio, heightRatio);

            const canvasWidth = canvas.width * ratio;
            const canvasHeight = canvas.height * ratio;
            const marginX = (pageWidth - canvasWidth) / 2;
            const marginY = (pageHeight - canvasHeight) / 2;

            pdf.addImage(imgData, 'JPEG', marginX, marginY, canvasWidth, canvasHeight, '', 'FAST');
            pdf.save(`receipt-${receiptNumber}.pdf`);
            
        } catch (error) {
            console.error('Error generating PDF:', error);
        }
    };


    return (
        <div className="p-4">
            <div ref={receiptRef} className="bg-white p-8 max-w-[21cm] mx-auto print:shadow-none relative">
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

                <div className="border-2 border-gray-800 p-6 relative z-10">
                    {/* Header */}
                    <div className="flex items-center text-center border-b-2 border-gray-800 pb-4">
                        <div className="flex items-center mb-4 w-[30%] h-[100%]">
                            <Image 
                                src="/images/logos/1.jpg" 
                                alt="The Vision Academy Logo" 
                                width={150} 
                                height={150}
                            />
                        </div>
                        <div className='w-[45%] mt-[-1rem]'>
                        {/* <h1 className="text-5xl font-bold text-black">THE VISION ACADEMY</h1> */}
                        <h1 className="text-5xl font-bold text-black">FEE RECEIPT</h1>
                        {/* <p className="text-sm italic text-black mt-2 mb-2">"The Clear Vision to Success..."</p> */}
                            <p className="text-lg text-black font-bold mt-1">Academic Session : <span className='underline decoration-1'>2025-26</span></p>
                        {/* <p className="text-lg text-black">Behind UCO Bank, SVPS School Campus</p> */}
                        {/* <p className="text-black">Sheohar, Bihar-IN</p>
                        <p className="text-black">843329</p>
                        <div className="mt-2 text-black">
                            <p>Contact: +91 8210682466</p>
                            <p>Email: officialthevision1@gmail.com</p>
                            </div> */}
                        </div>

                        {/* <div className="flex justify-center items-center mb-4 w-[20%] h-[100%]">
                            <Image
                                src="/images/logos/transparent/3.png"
                                alt="The Vision Academy Logo"
                                width={80}
                                height={80}
                            />
                        </div> */}
                    </div>

                    {/* Receipt Details */}
                    <div className="grid grid-cols-2 gap-8 mt-4 text-sm">
                        <div className="text-black">
                            <p><strong>Student Name:</strong> {student?.name || 'N/A'}</p>
                            <p><strong>Class:</strong> {student?.class || 'N/A'}</p>
                            <p><strong>Roll No:</strong> {student?.rollNo || 'N/A'}</p>
                            <p><strong>Address:</strong> {student?.address || 'N/A'}</p>

                        </div>
                        <div className="text-black">
                            <p><strong>Receipt No:</strong> {receiptNumber}</p>
                            <p><strong>Date:</strong> {today}</p>
                            <p><strong>Month:</strong> {selectedMonth}</p>
                            {/* <p><strong>Academic Year:</strong> 2024-25</p> */}
                        </div>
                    </div>

                    {/* Fee Table */}
                    <table className="w-full mt-6 border-collapse text-black">
                        <thead>
                            <tr>
                                <th className="border border-gray-800 px-4 py-2 text-left">Particulars</th>
                                <th className="border border-gray-800 px-4 py-2 text-right">Amount (₹)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border border-gray-800 px-4 py-2">Monthly Fee</td>
                                <td className="border border-gray-800 px-4 py-2 text-right font-bold">{student?.monthlyFee}</td>
                            </tr>
                            <tr>
                                <td className="border border-gray-800 px-4 py-2">Other Charges</td>
                                <td className="border border-gray-800 px-4 py-2 text-right font-bold">{student?.otherCharges}</td>
                            </tr>
                            <tr>
                                <td className="border border-gray-800 px-4 py-2 font-bold">Total</td>
                                <td className="border border-gray-800 px-4 py-2 text-right font-bold">
                                    {(student?.monthlyFee || 0) + (student?.otherCharges || 0)}
                                </td>
                            </tr>
                            <tr>
                                <td className="border border-gray-800 px-4 py-2">Paid Amount</td>
                                <td className="border border-gray-800 px-4 py-2 text-right font-bold text-green-700">{student?.paidAmount}</td>
                            </tr>
                            <tr>
                                <td className="border border-gray-800 px-4 py-2 font-bold">Balance Due</td>
                                <td className="border border-gray-800 px-4 py-2 text-right font-bold text-red-700">
                                    {((student?.monthlyFee || 0) + (student?.otherCharges || 0)) - (student?.paidAmount || 0)}
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    {/* Signature */}
                    <div className="mt-8 flex justify-between text-black">
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
                    <div className="mt-8 text-center text-sm text-black">
                        <p>This is a computer generated receipt, no signature required.</p>
                    </div>
                </div>
            </div>

            <div className="mt-4 text-center print:hidden flex justify-center gap-4">
                <button
                    onClick={handlePrint}
                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                >
                    Print Receipt
                </button>
                <button
                    onClick={downloadPDF}
                    className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                >
                    Download PDF
                </button>
            </div>
        </div>
    );
};

export default PaymentReceipt;