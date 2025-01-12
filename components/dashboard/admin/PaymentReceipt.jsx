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
            
            // First capture the content
            const canvas = await html2canvas(element, {
                scale: 2, // Higher scale for better quality
                useCORS: true,
                allowTaint: true,
                scrollY: -window.scrollY,
                backgroundColor: '#FFFFFF',
                onclone: (document) => {
                    // Adjust clone document if needed
                    const receipt = document.querySelector('#receipt');
                    if (receipt) {
                        receipt.style.transform = 'none';
                    }
                }
            });

            // Create PDF with proper dimensions
            const imgWidth = 210; // A4 width in mm
            const pageHeight = 297; // A4 height in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            // Add image to PDF
            pdf.addImage(
                canvas.toDataURL('image/jpeg', 1.0),
                'JPEG',
                0,
                0,
                imgWidth,
                imgHeight,
                '',
                'FAST'
            );

            // Save PDF
            pdf.save(`receipt-${receiptNumber}.pdf`);

        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF. Please try again.');
        }
    };


    return (
        <div className="min-h-screen">
            {/* Mobile Warning */}
            <div className="lg:hidden p-4 flex flex-col items-center justify-center min-h-[50vh]">
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg max-w-md">
                    <div className="flex flex-col space-y-4">
                        <h3 className="text-xl font-bold text-yellow-800">
                            Desktop View Required
                        </h3>
                        <div className="text-yellow-700 space-y-2">
                            <p className="font-medium">For the best experience, please:</p>
                            <ol className="list-decimal ml-5 space-y-2">
                                <li>Open your browser settings</li>
                                <li>Enable "Desktop Mode" or "Request Desktop Site"</li>
                                <li>Refresh the page</li>
                            </ol>
                            <p className="mt-4 text-sm">
                                Alternatively, access this page from a desktop or laptop computer.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Desktop Receipt */}
            <div className="hidden lg:block">
                <div ref={receiptRef} id="receipt" className="bg-white p-8 max-w-[21cm] mx-auto print:shadow-none relative">
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
        </div>
    );
};

export default PaymentReceipt;