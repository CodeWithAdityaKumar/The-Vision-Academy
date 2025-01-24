import { useState } from 'react';
import { useRouter } from 'next/navigation';

const SideBarMenu = () => {
  const router = useRouter();
  const [expandedItem, setExpandedItem] = useState(null);

  const menuItems = [
    {
      id: 'profile',
      title: 'Profile',
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
      </svg>,
      url: '/pages/account/dashboard/teacher'
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
      url: '/pages/account/dashboard/teacher/solveDoubts'
    },
    {
      title: 'Attendance',
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
      </svg>,
      url: '/pages/account/dashboard/teacher/attendance/students'
    },
    {
      title: 'Classes',
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
      </svg>,
      subItems: [
        { title: 'Create Class', url: '/pages/account/dashboard/teacher/classes/create' },
        { title: 'Manage Class', url: '/pages/account/dashboard/teacher/classes/manage' }
      ]
    },
    {
      title: 'Notes And Books',
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
      </svg>,
      subItems: [
        { title: 'Add Notes And Books', url: '/pages/account/dashboard/teacher/notesAndBooks/add' },
        { title: 'Manage Notes And Books', url: '/pages/account/dashboard/teacher/notesAndBooks/manage' }
      ]
    },
    {
      title: "Notices",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="24px"
          width="24px"
          viewBox="0 0 24 24"
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
          title: "Your Notice",
          url: "/pages/account/dashboard/teacher/notices",
        },
        {
          title: "Class Notice",
          url: "/pages/account/dashboard/teacher/notices/classesNotice",
        },
      ],
    },
  ];

  const handleMenuItemClick = (url) => {
    if (!url) return;
    router.push(url);
  };

  const toggleSubmenu = (index) => {
    setExpandedItem(expandedItem === index ? null : index);
  };

//   ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
    return (
        <aside
            className={`
        hidden md:block
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
        `}
        >
    <nav className="space-y-3 px-4 mt-[2rem]">
      {menuItems.map((item, index) => (
        <div key={index} className="relative">
          <button
            onClick={() => item.subItems ? toggleSubmenu(index) : handleMenuItemClick(item.url)}
            className={`
              w-full text-left px-4 py-3 text-sm font-medium rounded-lg 
              transition-colors duration-150 flex items-center justify-between
              ${item.url === router.pathname ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-blue-50 dark:text-gray-300 dark:hover:bg-gray-700'}
              focus:outline-none focus:ring-2 focus:ring-blue-500
            `}
          >
            <div className="flex items-center space-x-3">
              <span className={item.url === router.pathname ? 'text-white' : 'text-blue-500'}>
                {item.icon}
              </span>
              <span>{item.title}</span>
            </div>
            {item.subItems && (
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={`h-4 w-4 transition-transform ${expandedItem === index ? 'rotate-180' : ''}`} 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
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
                  className="w-full text-left px-4 py-2 text-gray-600 hover:bg-blue-50 
                    rounded-md transition-colors flex items-center space-x-3 
                    dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <span className="font-medium">{subItem.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
            </nav>
        </aside>

  );
};

export default SideBarMenu;
