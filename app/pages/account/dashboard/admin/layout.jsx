"use client"
import FloatingPlusIcon from "@/components/dashboard/admin/FloatingPlusIcon"
import SideBarMenu from "@/components/dashboard/admin/SideBarMenu"
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '@/lib/firebase';

export default function AdminLayout({ children }) {
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            router.push('/pages/account/login');
            return;
        }

        const userRef = ref(database, `users/${user.uid}`);
        const unsubscribe = onValue(userRef, (snapshot) => {
            const userData = snapshot.val();
            if (!userData || userData.role !== 'admin') {
                router.push('/');
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, router]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
        );
    }

    return (
        <>
            <div className="flex">
                <SideBarMenu />
                <FloatingPlusIcon />
                <div className="w-full">
                    {children}
                </div>
            </div>
        </>
    )
}