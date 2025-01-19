import React, { useState, useEffect, useRef } from "react";

import { useRouter } from "next/navigation";

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

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
      url: "/pages/account/dashboard/admin",
    },
    {
      title: "Attendance",
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
      url: "/pages/account/dashboard/admin/attendance/students",
    },
    {
      title: 'Solve Doubts',
      icon: <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path d="M0 0h24v24H0V0z" fill="none" />
        <path d="M15 4v7H5.17l-.59.59-.58.58V4h11m1-2H3c-.55 0-1 .45-1 1v14l4-4h10c.55 0 1-.45 1-1V3c0-.55-.45-1-1-1zm5 4h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7c0-.55-.45-1-1-1z" />
      </svg>,
      url: '/pages/account/dashboard/admin/solveDoubts'
    },
    {
      title: "Student Payment",
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
      url: "/pages/account/dashboard/admin/payments/students",
    },
    {
      title: "Users",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
        </svg>
      ),
      subItems: [
        { title: "Add", url: "/pages/account/dashboard/admin/users/addUser" },
        {
          title: "Manage",
          url: "/pages/account/dashboard/admin/users/manageUsers",
        },
      ],
    },
    {
      title: "Classes",
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
      subItems: [
        {
          title: "Create",
          url: "/pages/account/dashboard/admin/classes/create",
        },
        {
          title: "Manage",
          url: "/pages/account/dashboard/admin/classes/manage",
        },
      ],
    },
    {
      title: "Notes And Books",
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
      subItems: [
        {
          title: "Add",
          url: "/pages/account/dashboard/admin/notesAndBooks/add",
        },
        {
          title: "Manage",
          url: "/pages/account/dashboard/admin/notesAndBooks/manage",
        },
      ],
    },
    {
      title: "Gallery",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M0 0h24v24H0V0z" fill="none" />
          <path d="M20 4v12H8V4h12m0-2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 9.67l1.69 2.26 2.48-3.1L19 15H9zM2 6v14c0 1.1.9 2 2 2h14v-2H4V6H2z" />
        </svg>
      ),
      subItems: [
        {
          title: "Add",
          url: "/pages/account/dashboard/admin/gallery/addMedia",
        },
        {
          title: "Manage",
          url: "/pages/account/dashboard/admin/gallery/manageMedia",
        },
      ],
    },

    {
      title: "Notices",
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
              <path d="M11,8v5l4.25,2.52l0.77-1.28l-3.52-2.09V8H11z M21,10V3l-2.64,2.64C16.74,4.01,14.49,3,12,3c-4.97,0-9,4.03-9,9 s4.03,9,9,9s9-4.03,9-9h-2c0,3.86-3.14,7-7,7s-7-3.14-7-7s3.14-7,7-7c1.93,0,3.68,0.79,4.95,2.05L14,10H21z" />
            </g>
          </g>
        </svg>
      ),
      subItems: [
        {
          title: "Create",
          url: "/pages/account/dashboard/admin/notices/create",
        },
        {
          title: "Manage",
          url: "/pages/account/dashboard/admin/notices/manage",
        },
      ],
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          )}
        </button>
        {isOpen && (
          <div
            className="absolute bottom-16 right-0 transition-all duration-300 transform animate-fade-in-up"
            style={{ width: "235px" }}
          >
            <div className="bg-white rounded-lg shadow-lg p-2 space-y-1 min-w-[220px]">
              {menuItems.map((item, index) => (
                <div key={index} className="relative">
                  <button
                    onClick={() =>
                      item.subItems
                        ? toggleSubmenu(index)
                        : handleMenuItemClick(item.url)
                    }
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-md transition-colors flex items-center justify-between space-x-3 active:bg-blue-100"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-blue-500">{item.icon}</span>
                      <span className="font-medium">{item.title}</span>
                    </div>
                    {item.subItems && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-4 w-4 transition-transform ${
                          expandedItem === index ? "rotate-180" : ""
                        }`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
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
  );
};

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

export default FloatingPlusIcon;
