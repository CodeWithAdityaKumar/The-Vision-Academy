"use client";

import { useState, useEffect } from "react";
import { ref, get } from "firebase/database";
import { database } from "@/lib/firebase";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import PaymentReceipt from "@/components/dashboard/admin/PaymentReceipt";

const Page = ({ params }) => {
    const { studentID, receiptNumber } = params; // Get receiptNumber directly from params
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        // Check authorization
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (!user) {
                router.push("/pages/account/login");
                return;
            }

            try {
                const userRef = ref(database, `users/${user.uid}`);
                const snapshot = await get(userRef);
                const userData = snapshot.val();

                if (
                    userData.role === "admin" ||
                    userData.role === "teacher" ||
                    (userData.role === "student" && user.uid === studentID)
                ) {
                    setAuthorized(true);
                } else {
                    router.push("/pages/account/login");
                }
            } catch (error) {
                console.error("Authorization check error:", error);
                setError("Authorization failed");
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [studentID, router]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
        );
    }

    if (!authorized) {
        return (
            <div className="text-red-600 text-center p-4">Unauthorized access</div>
        );
    }

    if (error) {
        return <div className="text-red-600 text-center p-4">{error}</div>;
    }

    return <PaymentReceipt userId={studentID} receiptNumber={receiptNumber} />;
};

export default Page;