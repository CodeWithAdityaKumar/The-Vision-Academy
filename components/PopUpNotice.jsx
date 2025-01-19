'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { FiX } from 'react-icons/fi';

const PopUpNotice = ({ 
    // Props with default values
    showDelay = 2000,          // Delay before showing popup 
    autoHideDuration = null,   // Auto hide duration (null for no auto-hide)
    storageKey = 'popupNoticeHidden', // Local storage key
    resetAfterHours = 1,      // Hours before showing again
    content = {
        title: 'demo title',
        text: 'demo text',
        link: '/images/about.png',
        linkText: 'demo link',
        image: '/images/about.png',
        imageAlt: 'demo alt'
    }
}) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if popup should be hidden based on localStorage
        const checkPopupStatus = () => {
            const hiddenTimestamp = localStorage.getItem(storageKey);
            if (hiddenTimestamp) {
                const hours = (Date.now() - parseInt(hiddenTimestamp)) / (1000 * 60 * 60);
                return hours < resetAfterHours;
            }
            return false;
        };

        // Show popup after delay if not hidden
        const timer = setTimeout(() => {
            if (!checkPopupStatus()) {
                setIsVisible(true);
            }
        }, showDelay);

        // Auto-hide timer if duration is set
        let autoHideTimer;
        if (autoHideDuration && isVisible) {
            autoHideTimer = setTimeout(() => {
                hidePopup();
            }, autoHideDuration);
        }

        return () => {
            clearTimeout(timer);
            if (autoHideTimer) clearTimeout(autoHideTimer);
        };
    }, [showDelay, autoHideDuration, storageKey, resetAfterHours]);

    const hidePopup = () => {
        setIsVisible(false);
        localStorage.setItem(storageKey, Date.now().toString());
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/50"
                    onClick={(e) => e.target === e.currentTarget && hidePopup()}
                >
                    <motion.div 
                        className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
                        initial={{ y: 50 }}
                        animate={{ y: 0 }}
                        exit={{ y: 50 }}
                    >
                        {/* Close Button */}
                        <button
                            onClick={hidePopup}
                            className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 dark:bg-gray-700 
                                hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors z-10"
                        >
                            <FiX className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                        </button>

                        {/* Image (if provided) */}
                        {content.image && (
                            <div className="relative w-full h-48 sm:h-64">
                                <Image
                                    src={content.image}
                                    alt={content.imageAlt || 'Notice Image'}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        )}

                        {/* Content */}
                        <div className="p-6">
                            {/* Title */}
                            {content.title && (
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                                    {content.title}
                                </h2>
                            )}

                            {/* Text */}
                            {content.text && (
                                <p className="text-gray-600 dark:text-gray-300 mb-6 whitespace-pre-wrap">
                                    {content.text}
                                </p>
                            )}

                            {/* Link */}
                            {content.link && (
                                <Link
                                    href={content.link}
                                    className="inline-block bg-gradient-to-r from-red-600 to-red-700 text-white 
                                        px-6 py-2 rounded-full font-medium hover:from-red-700 hover:to-red-800 
                                        transform transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                                >
                                    {content.linkText || 'Learn More'}
                                </Link>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default PopUpNotice;