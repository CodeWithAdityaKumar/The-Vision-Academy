"use client"
import { useState, useEffect } from 'react';
import { database } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';
import { useAuth } from '@/components/AuthProvider';
import QRCode from 'react-qr-code';
import { motion } from 'framer-motion';

const EntryExit = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const userRef = ref(database, `users/${user.uid}`);
    const unsubscribe = onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setUserData({
          ...data,
          uid: user.uid,
          timestamp: new Date().toISOString()
        });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const qrCodeData = userData && user ? JSON.stringify({
    uid: user.uid,
    name: userData.name ? userData.name : '',
    rollNumber: userData.rollNumber ? userData.rollNumber : '',
    timestamp: new Date().toISOString()
  }) : '';
  

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">Please log in to access your QR code</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-lg bg-white dark:bg-gray-800 shadow-md"
    >
      <h2 className="text-2xl font-bold mb-4 text-center dark:text-white">Entry/Exit Pass</h2>
      
      <div className="flex flex-col items-center">
        {userData && (
          <>
            <div className="bg-white p-4 rounded-lg mb-4">
              <QRCode 
                value={qrCodeData}
                size={256}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                viewBox={`0 0 256 256`}
              />
            </div>
            
            <div className="text-center">
              <h3 className="font-semibold text-xl">{userData.name}</h3>
              {userData.class && (
                <p className="text-gray-600 dark:text-gray-300">Class {userData.class}</p>
              )}
              {userData.rollNumber && (
                <p className="text-gray-600 dark:text-gray-300">Roll Number: {userData.rollNumber}</p>
              )}
              <p className="mt-4 text-sm text-gray-500">
                Scan this QR code for entry and exit tracking
              </p>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default EntryExit;