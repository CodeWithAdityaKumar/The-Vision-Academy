"use client"
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { auth, database } from '@/lib/firebase.js';
import { ref, onValue, push, remove, update, off } from 'firebase/database';
import { useRouter } from 'next/navigation';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import {sendEmailVerification, createUserWithEmailAndPassword} from 'firebase/auth';
import CreateLiveClass from '@/components/dashboard/CreateLiveClass';
import ManageClasses from '@/components/dashboard/ManageClasses';
import AddBooksAndNotes from '@/components/dashboard/AddBooksAndNotes';
import ManageBooksAndNotes from '@/components/dashboard/ManageBooksAndNotes';
import AddUsers from '@/components/dashboard/admin/AddUsers';
import ManageUsers from '@/components/dashboard/admin/ManageUsers';
import Profile from '@/components/dashboard/Profile';


export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // useEffect(() => {
  //   // Check if user is admin
  //   const unsubscribe = auth.onAuthStateChanged((user) => {
  //     if (!user || user.email !== 'ak6414119@gmail.com') {
  //       router.push('/pages/account/login');
  //     } else {
  //       setLoading(false);
  //     }
  //   });

  //   return () => {
  //     unsubscribe();
  //   };
  // }, []);


  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push('/pages/account/login');
        return;
      }

      // Check user role from database
      const userRef = ref(database, `users/${user.uid}`);
      onValue(userRef, (snapshot) => {
        const userData = snapshot.val();
        if (!userData || userData.role !== 'admin') {
          router.push('/pages/account/dashboard/teachers');
          return;
        }
        setLoading(false);
      });
    });

    return () => unsubscribe();
  }, [router]);

  // Add loading state check
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }




  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex flex-col md:flex-row relative overflow-hidden">
      {/* Hamburger Menu Button */}
      <button
        onClick={toggleSidebar}
        className="md:hidden fixed top-[5.5rem] left-4 z-[0] p-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600"
        aria-label="Toggle Menu"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={isSidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
          />
        </svg>
      </button>

      

      {/* Sidebar */}
      <aside 
        className={`
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 
          fixed md:sticky
          top-0
          w-[280px] sm:w-64 
          h-screen 
          bg-white dark:bg-gray-800 
          shadow-xl 
          transition-transform duration-300 ease-in-out 
          z-50
          overflow-y-auto
          scrollbar-hide
          pt-16 md:pt-8
        `}
      >

<button
        onClick={toggleSidebar}
        className="md:hidden fixed top-[5rem] left-4 z-[60] p-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-700"
        aria-label="Toggle Menu"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={isSidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
          />
        </svg>
      </button>
        <nav className="space-y-3 px-4 mt-[4rem]">

          <button
            onClick={() => {
              setActiveTab('profile');
              setIsSidebarOpen(false);
            }}
            className={`
      ${activeTab === 'profile'
                ? 'bg-red-500 text-white'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              } 
      flex items-center 
      w-full 
      px-4 py-3 
      text-sm font-medium 
      rounded-lg 
      transition-colors duration-150
      focus:outline-none focus:ring-2 focus:ring-red-500
    `}
          >
            Profile
          </button>

          <button
            onClick={() => {
              setActiveTab('manage-users');
              setIsSidebarOpen(false);
            }}
            className={`
              ${activeTab === 'manage-users'
                ? 'bg-red-500 text-white'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              } 
              flex items-center 
              w-full 
              px-4 py-3 
              text-sm font-medium 
              rounded-lg 
              transition-colors duration-150
              focus:outline-none focus:ring-2 focus:ring-red-500
            `}
          >
            Manage Users
          </button>
          <button
            onClick={() => {
              setActiveTab('add-users');
              setIsSidebarOpen(false);
            }}
            className={`
              ${activeTab === 'add-users'
                ? 'bg-red-500 text-white'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              } 
              flex items-center 
              w-full 
              px-4 py-3 
              text-sm font-medium 
              rounded-lg 
              transition-colors duration-150
              focus:outline-none focus:ring-2 focus:ring-red-500
            `}
          >
            Add Users
          </button>
          <button
            onClick={() => {
              setActiveTab('create-class');
              setIsSidebarOpen(false);
            }}
            className={`
              ${activeTab === 'create-class'
                ? 'bg-red-500 text-white'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              } 
              flex items-center 
              w-full 
              px-4 py-3 
              text-sm font-medium 
              rounded-lg 
              transition-colors duration-150
              focus:outline-none focus:ring-2 focus:ring-red-500
            `}
          >
            Create Class
          </button>
          <button
            onClick={() => {
              setActiveTab('manage-classes');
              setIsSidebarOpen(false);
            }}
            className={`
              ${activeTab === 'manage-classes'
                ? 'bg-red-500 text-white'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              } 
              flex items-center 
              w-full 
              px-4 py-3 
              text-sm font-medium 
              rounded-lg 
              transition-colors duration-150
              focus:outline-none focus:ring-2 focus:ring-red-500
            `}
          >
            Manage Classes
          </button>
          <button
            onClick={() => {
              setActiveTab('add-books');
              setIsSidebarOpen(false);
            }}
            className={`
              ${activeTab === 'add-books'
                ? 'bg-red-500 text-white'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              } 
              flex items-center 
              w-full 
              px-4 py-3 
              text-sm font-medium 
              rounded-lg 
              transition-colors duration-150
              focus:outline-none focus:ring-2 focus:ring-red-500
            `}
          >
            Add Books & Notes
          </button>
          <button
            onClick={() => {
              setActiveTab('manage-books');
              setIsSidebarOpen(false);
            }}
            className={`
              ${activeTab === 'manage-books'
                ? 'bg-red-500 text-white'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              } 
              flex items-center 
              w-full 
              px-4 py-3 
              text-sm font-medium 
              rounded-lg 
              transition-colors duration-150
              focus:outline-none focus:ring-2 focus:ring-red-500
            `}
          >
            Manage Books & Notes
          </button>
        </nav>
      </aside>

      {/* Overlay for mobile when sidebar is open */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto scrollbar-hide pt-2">
        <div className="p-4 sm:p-6 md:p-8 lg:p-12">
        {/* <div> */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 sm:p-6 lg:p-8"
          >
            {activeTab === 'profile' && <Profile />}
            {activeTab === 'manage-users' && <ManageUsers />}
            {activeTab === 'add-users' && <AddUsers />}
            {activeTab === 'create-class' && <CreateLiveClass />}
            {activeTab === 'manage-classes' && <ManageClasses />}
            {activeTab === 'add-books' && <AddBooksAndNotes />}
            {activeTab === 'manage-books' && <ManageBooksAndNotes />}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
