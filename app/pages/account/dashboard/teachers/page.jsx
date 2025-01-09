"use client"
import { useState } from 'react';
import CreateLiveClass from '@/components/CreateLiveClass';
import ManageClasses from '@/components/ManageClasses';
import { motion } from 'framer-motion';

const TeacherDashboard = () => {
  const [activeTab, setActiveTab] = useState('create');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden"
        >
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('create')}
                className={`${
                  activeTab === 'create'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
              >
                Create Class
              </button>
              <button
                onClick={() => setActiveTab('manage')}
                className={`${
                  activeTab === 'manage'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
              >
                Manage Classes
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'create' ? (
              <CreateLiveClass />
            ) : (
              <ManageClasses />
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
