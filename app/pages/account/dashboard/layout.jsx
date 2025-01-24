"use client"
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getDatabase, ref, onValue } from 'firebase/database'
import { getAuth, onAuthStateChanged } from 'firebase/auth'

const DashboardLayout = ({ children }) => {
    const router = useRouter()
    const auth = getAuth()
    const db = getDatabase()

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                // User is signed in, check their role
                const userRef = ref(db, 'users/' + user.uid)
                onValue(userRef, (snapshot) => {
                    const userData = snapshot.val()
                    
                    if (userData) {
                        // Get the current path
                        const currentPath = window.location.pathname
                        
                        // Verify user has access to current path
                        const isAdminPath = currentPath.includes('/admin')
                        const isTeacherPath = currentPath.includes('/teacher')
                        const isStudentPath = currentPath.includes('/student')

                        // Redirect if user doesn't have appropriate role
                        if (isAdminPath && userData.role !== 'admin') {
                            router.push('/pages/account/dashboard/' + userData.role)
                        } else if (isTeacherPath && userData.role !== 'teacher') {
                            router.push('/pages/account/dashboard/' + userData.role)
                        } else if (isStudentPath && userData.role !== 'student') {
                            router.push('/pages/account/dashboard/' + userData.role)
                        }
                    } else {
                        router.push('/')
                    }
                })
            } else {
                // No user is signed in, redirect to login
                router.push('/pages/account/login')
            }
        })

        return () => unsubscribe()
    }, [router])

    return (
        <div>
            {children}
        </div>
    )
}

export default DashboardLayout