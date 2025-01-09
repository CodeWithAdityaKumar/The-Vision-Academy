"use client"
import { useState } from 'react';
import { motion } from 'framer-motion';
import CreateLiveClass from '@/components/dashboard/CreateLiveClass';
import ManageClasses from '@/components/dashboard/ManageClasses';
import AddBooksAndNotes from '@/components/dashboard/AddBooksAndNotes';
import ManageBooksAndNotes from '@/components/dashboard/ManageBooksAndNotes';

const TeacherDashboard = () => {
  const [activeTab, setActiveTab] = useState('create');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex flex-col md:flex-row relative overflow-hidden">
      {/* Hamburger Menu Button - Only visible on smaller screens */}
      <button
        onClick={toggleSidebar}
        className="md:hidden w-[40px] fixed top-[4.5rem] left-4 z-50 p-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600"
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
          z-40
          overflow-y-auto
          scrollbar-hide
        `}
      >
        <nav className="mt-[8rem] md:mt-8 space-y-3 px-4">
          {[
            { id: 'create', label: 'Create Class' },
            { id: 'manage', label: 'Manage Classes' },
            { id: 'add', label: 'Add Books & Notes' },
            { id: 'manage-resources', label: 'Manage Books & Notes' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsSidebarOpen(false);
              }}
              className={`
                ${activeTab === item.id
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
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Overlay for mobile when sidebar is open */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="p-4 sm:p-6 md:p-8 lg:p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto"
          >
            {activeTab === 'create' && <CreateLiveClass />}
            {activeTab === 'manage' && <ManageClasses />}
            {activeTab === 'add' && <AddBooksAndNotes />}
            {activeTab === 'manage-resources' && <ManageBooksAndNotes />}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default TeacherDashboard;
