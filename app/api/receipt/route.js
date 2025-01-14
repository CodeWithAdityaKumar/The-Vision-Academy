import { database } from "@/lib/firebase";
import { ref, get, child } from "firebase/database";

export async function POST(request) {
  const { userId, receiptNumber } = await request.json();

  if (!userId || !receiptNumber) {
    return new Response(
      JSON.stringify({ error: "userId and receiptNumber are required" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    const userSnapshot = await get(child(ref(database), `users/${userId}`));
    if (!userSnapshot.exists()) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const user = userSnapshot.val();
    let feeDetails;
    let foundMonth;
    let previousPaymentDue = 0;

    if (user.feeHistory) {
      // Sort months chronologically
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

      let currentReceipt = null;
      let previousReceipt = null;
      let currentMonth = null;

      // Find current receipt and its month
      for (const month in user.feeHistory) {
        for (const rNumber in user.feeHistory[month]) {
          if (rNumber === receiptNumber) {
            currentReceipt = user.feeHistory[month][rNumber];
            currentMonth = month;
            foundMonth = month;
            feeDetails = currentReceipt;
            break;
          }
        }
        if (currentReceipt) break;
      }

      if (currentReceipt) {
        // Find the previous receipt's due amount
        const monthIndex = months.indexOf(currentMonth);

        // Check previous months first
        for (let i = monthIndex; i >= 0; i--) {
          const month = months[i];
          if (user.feeHistory[month]) {
            const receipts = Object.entries(user.feeHistory[month]);
            for (let j = receipts.length - 1; j >= 0; j--) {
              const [rNumber, rData] = receipts[j];
              if (rNumber !== receiptNumber) {
                const totalFee = rData.monthlyFee + (rData.otherCharges || 0);
                const due = totalFee - rData.paidAmount;
                if (due > 0) {
                  previousPaymentDue = due;
                  break;
                }
              } else {
                break;
              }
            }
            if (previousPaymentDue > 0) break;
          }
        }
      }
    }

    if (!feeDetails) {
      return new Response(JSON.stringify({ error: "Receipt not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const receiptData = {
      studentName: user.name,
      class: user.class,
      rollNo: user.rollNumber || "N/A",
      address: user.address || "N/A",
      receiptNo: feeDetails.receiptNumber,
      date: feeDetails.updatedAt,
      month: foundMonth,
      monthlyFee: feeDetails.monthlyFee,
      otherCharges: feeDetails.otherCharges,
      previousMonthDue: previousPaymentDue,
      total:
        feeDetails.monthlyFee + feeDetails.otherCharges + previousPaymentDue,
      paidAmount: feeDetails.paidAmount,
      balanceDue:
        feeDetails.monthlyFee +
        feeDetails.otherCharges +
        previousPaymentDue -
        feeDetails.paidAmount,
    };

    // console.log("Receipt Data:", receiptData);

    return new Response(JSON.stringify(receiptData), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        details: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
