import React, { useState, useEffect, useRef } from 'react'

import { useRouter } from 'next/navigation';

const FloatingPlusIcon = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [expandedItem, setExpandedItem] = useState(null);
    const menuRef = useRef(null);
    const router = useRouter();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleMenu = (e) => {
        e.stopPropagation();
        setIsOpen(!isOpen);
    };

    const handleMenuItemClick = (url) => {
        if (!url) return;

        setIsOpen(false);
        router.push(url);
        return;
    };

    const toggleSubmenu = (item) => {
        setExpandedItem(expandedItem === item ? null : item);
    };

    const menuItems = [
        {
            id: "profile",
            title: "Profile",
            icon: (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                >
                    <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                    />
                </svg>
            ),
            url: "/pages/account/dashboard/students",
        },
        {
            title: "My Classes",
            icon: (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                >
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
            ),
            url: "/pages/account/dashboard/students/classes",
        },
        {
            title: "Study Materials",
            icon: (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                >
                    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                </svg>
            ),
            url: "/pages/account/dashboard/students/studiesMaterial",
        },
        {
            title: "Ask Doubts",
            icon: (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                >
                    <path d="M0 0h24v24H0V0z" fill="none" />
                    <path d="M15 4v7H5.17l-.59.59-.58.58V4h11m1-2H3c-.55 0-1 .45-1 1v14l4-4h10c.55 0 1-.45 1-1V3c0-.55-.45-1-1-1zm5 4h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7c0-.55-.45-1-1-1z" />
                </svg>
            ),
            url: "/pages/account/dashboard/students/askDoubt",
        },
        {
            title: "My Attendance",
            icon: (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                >
                    <path
                        fillRule="evenodd"
                        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                        clipRule="evenodd"
                    />
                </svg>
            ),
            url: "/pages/account/dashboard/students/attendance",
        },
        {
            title: "My Progress",
            icon: (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                >
                    <g>
                        <rect fill="none" height="24" width="24" />
                    </g>
                    <g>
                        <g>
                            <path d="M21,8c-1.45,0-2.26,1.44-1.93,2.51l-3.55,3.56c-0.3-0.09-0.74-0.09-1.04,0l-2.55-2.55C12.27,10.45,11.46,9,10,9 c-1.45,0-2.27,1.44-1.93,2.52l-4.56,4.55C2.44,15.74,1,16.55,1,18c0,1.1,0.9,2,2,2c1.45,0,2.26-1.44,1.93-2.51l4.55-4.56 c0.3,0.09,0.74,0.09,1.04,0l2.55,2.55C12.73,16.55,13.54,18,15,18c1.45,0,2.27-1.44,1.93-2.52l3.56-3.55 C21.56,12.26,23,11.45,23,10C23,8.9,22.1,8,21,8z" />
                            <polygon points="15,9 15.94,6.93 18,6 15.94,5.07 15,3 14.08,5.07 12,6 14.08,6.93" />
                            <polygon points="3.5,11 4,9 6,8.5 4,8 3.5,6 3,8 1,8.5 3,9" />
                        </g>
                    </g>
                </svg>
            ),
            url: "/pages/account/dashboard/students/progress",
        },
        {
            title: "Payment Details",
            icon: (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                >
                    <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                    <path
                        fillRule="evenodd"
                        d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                        clipRule="evenodd"
                    />
                </svg>
            ),
            url: "/pages/account/dashboard/students/payments",
        },
    ];

    return (
        <div className="lg:hidden fixed bottom-8 right-8 z-50">
            <div className="relative" ref={menuRef}>
                <button
                    onClick={toggleMenu}
                    className="bg-blue-500 hover:bg-blue-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-all duration-300 transform hover:scale-110"
                >
                    {!isOpen ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    )}
                </button>
                {isOpen && (
                    <div className="absolute bottom-16 right-0 transition-all duration-300 transform animate-fade-in-up" style={{ width: '235px' }}>
                        <div className="bg-white rounded-lg shadow-lg p-2 space-y-1 min-w-[220px]">
                            {menuItems.map((item, index) => (
                                <div key={index} className="relative">
                                    <button
                                        onClick={() => item.subItems ? toggleSubmenu(index) : handleMenuItemClick(item.url)}
                                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-md transition-colors flex items-center justify-between space-x-3 active:bg-blue-100"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <span className="text-blue-500">{item.icon}</span>
                                            <span className="font-medium">{item.title}</span>
                                        </div>
                                        {item.subItems && (
                                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${expandedItem === index ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </button>
                                    {item.subItems && expandedItem === index && (
                                        <div className="pl-4 py-1 space-y-1">
                                            {item.subItems.map((subItem, subIndex) => (
                                                <button
                                                    key={subIndex}
                                                    onClick={() => handleMenuItemClick(subItem.url)}
                                                    className="w-full text-left px-4 py-2 text-gray-600 hover:bg-blue-50 rounded-md transition-colors flex items-center space-x-3 active:bg-blue-100"
                                                >
                                                    <span className="font-medium">{subItem.title}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

// Add this at the beginning of your file or in your global CSS
// const style = document.createElement('style');
// style.textContent = `
//   @keyframes fadeInUp {
//     from {
//       opacity: 0;
//       transform: translateY(20px);
//     }
//     to {
//       opacity: 1;
//       transform: translateY(0);
//     }
//   }
//   .animate-fade-in-up {
//     animation: fadeInUp 0.3s ease-out;
//   }
// `;
// document.head.appendChild(style);

export default FloatingPlusIcon
