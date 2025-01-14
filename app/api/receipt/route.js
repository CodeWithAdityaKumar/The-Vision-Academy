import { database } from "@/lib/firebase";
import { ref, get, child } from 'firebase/database';

export async function POST(request) {
    const { userId, receiptNumber } = await request.json();

    if (!userId || !receiptNumber) {
        return new Response(JSON.stringify({ error: 'userId and receiptNumber are required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const userSnapshot = await get(child(ref(database), `users/${userId}`));
        if (!userSnapshot.exists()) {
            return new Response(JSON.stringify({ error: 'User not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const user = userSnapshot.val();
        let feeDetails;
        let foundMonth;

        // Search through feeHistory instead of fees
        if (user.feeHistory) {
            for (const month in user.feeHistory) {
                if (user.feeHistory[month][receiptNumber]) {
                    feeDetails = user.feeHistory[month][receiptNumber];
                    foundMonth = month;
                    break;
                }
            }
        }

        if (!feeDetails) {
            return new Response(JSON.stringify({ error: 'Fee details not found for the specified receipt number' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Calculate previous month due
        let previousMonthDue = 0;
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
        
        if (user.feeHistory) {
            const monthIndex = months.indexOf(foundMonth);
            if (monthIndex > 0) {
                const previousMonth = months[monthIndex - 1];
                const previousMonthData = user.feeHistory[previousMonth];
                
                if (previousMonthData) {
                    // Get the last receipt of previous month
                    const lastReceipt = Object.values(previousMonthData)[Object.values(previousMonthData).length - 1];
                    if (lastReceipt) {
                        const totalFee = lastReceipt.monthlyFee + (lastReceipt.otherCharges || 0);
                        previousMonthDue = totalFee - lastReceipt.paidAmount;
                    }
                }
            }
        }

        const receiptData = {
            studentName: user.name,
            class: user.class,
            rollNo: user.rollNumber || 'N/A',
            address: user.address || 'N/A',
            receiptNo: feeDetails.receiptNumber,
            date: feeDetails.updatedAt,
            month: foundMonth, // Use the found month
            monthlyFee: feeDetails.monthlyFee,
            otherCharges: feeDetails.otherCharges,
            previousMonthDue: previousMonthDue, // Add previous month due
            total: feeDetails.monthlyFee + feeDetails.otherCharges + previousMonthDue, // Update total to include previous due
            paidAmount: feeDetails.paidAmount,
            balanceDue: (feeDetails.monthlyFee + feeDetails.otherCharges + previousMonthDue) - feeDetails.paidAmount
        };

        return new Response(JSON.stringify(receiptData), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
