"use client"
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getDatabase, ref, onValue } from 'firebase/database'
import { getAuth, onAuthStateChanged } from 'firebase/auth'

let userC;

const Page = () => {
  const router = useRouter()
  const auth = getAuth()
  const db = getDatabase()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in
        const userRef = ref(db, 'users/' + user.uid)
        onValue(userRef, (snapshot) => {
          const userData = snapshot.val()
          userC = userData
          console.log(userData);
          
          if (userData) {
            switch(userData.role) {
              case 'admin':
                router.push('/pages/account/dashboard/admin')
                break
              case 'teacher': 
                router.push('/pages/account/dashboard/teachers')
                break
              case 'student':
                router.push('/pages/account/dashboard/student')
                break
                default:
                  router.push('/')
            }
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
    <div className="min-h-screen flex items-center justify-center">
        {console.log(userC)}
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
    </div>
  )
}

export default Page
