"use client"
import FloatingPlusIcon from "@/components/dashboard/admin/FloatingPlusIcon"
import SideBarMenu from "@/components/dashboard/admin/SideBarMenu"
// import { useState, useEffect } from 'react'
// import { useRouter } from 'next/navigation'
// import { auth, db } from '@/lib/firebase'
// import { onAuthStateChanged } from 'firebase/auth'
// import { doc, getDoc } from 'firebase/firestore'

export default function AdminLayout({ children }) {
    // const [user, setUser] = useState(null)
    // const [loading, setLoading] = useState(true)
    // const router = useRouter()

    // useEffect(() => {
    //     const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
    //         if (firebaseUser) {
    //             // Get additional user data from Firestore
    //             const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
    //             if (userDoc.exists()) {
    //                 setUser({ ...firebaseUser, ...userDoc.data() })
    //             }
    //         } else {
    //             setUser(null)
    //         }
    //         setLoading(false)
    //     })

    //     // Cleanup subscription
    //     return () => unsubscribe()
    // }, [])

    // useEffect(() => {
    //     if (!loading && (!user || user.role !== 'admin')) {
    //         router.push('/pages/account/login')
    //     }
    // }, [user, loading, router])

    // if (loading) {
    //     return <div className="flex items-center justify-center min-h-screen">
    //         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    //     </div>
    // }

    // if (!user || user.role !== 'admin') {
    //     return null
    // }

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