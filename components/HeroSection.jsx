"use client"
import { useEffect, useRef } from 'react';
import Typed from 'typed.js';
import Image from 'next/image';
import Link from 'next/link';

export default function HeroSection() {
  const el = useRef(null);

  useEffect(() => {
    const typed = new Typed(el.current, {
      strings: ['The Clear Vision to Success...!'],
      typeSpeed: 50,
      backSpeed: 50,
      loop: true,
    });

    return () => {
      typed.destroy();
    };
  }, []);

  return (
    <div className="relative bg-gradient-to-r from-blue-100 to-blue-50 dark:from-gray-800 dark:to-gray-900 overflow-hidden min-h-screen flex items-center">

      

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:pb-20 md:pt-[1rem] lg:pb-20 lg:pt-[1rem] w-full ">
      {/* <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 lg:py-24 w-full"> */}
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="w-full md:w-1/2 mb-8 md:mb-0 z-10">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4 animate-fade-in-up">
              Hello, Welcome To
            </h1>
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-blue-600 dark:text-blue-400 mb-6 animate-fade-in-up animation-delay-300">
              The Vision Academy
            </h2>
            <p className="text-xl md:text-2xl lg:text-3xl text-red-600 dark:text-red-400 font-semibold mb-8 animate-fade-in-up animation-delay-600">
              <span ref={el}></span>
            </p>
            <Link href="/pages/contact" className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-full text-lg transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg animate-fade-in-up animation-delay-900">
              Join Us
            </Link>
          </div>
          <div className="hidden md:block md:w-1/2">
            <div className="relative w-80 h-80 md:w-[45rem] md:h-[34.5rem]">
            {/* <div className="relative w-80 h-80 md:w-96 md:h-96 animate-fade-in-up animation-delay-1200"> */}
              <Image
                src="/images/hero2.png"
                alt="The Vision Academy Logo"
                layout="fill"
                objectFit="contain"
                className="transition-all duration-300 ease-in-out transform rounded-lg z-10"
              />
              {/* <Image
                src="/images/logos/transparent/3.png"
                alt="The Vision Academy Logo"
                layout="fill"
                objectFit="contain"
                className="transition-all duration-300 ease-in-out transform hover:scale-110 hover:rotate-3 hover:shadow-2xl rounded-lg"
              /> */}
            </div>
          </div>
        </div>
      </div>
      <div className="absolute top-0 right-0 -mt-20 -mr-20 lg:mt-0 lg:mr-0 z-0 h-[100vh]">
        <svg width="404" height="404" fill="none" viewBox="0 0 404 404" aria-hidden="true" className="text-blue-200 dark:text-blue-900 opacity-25 h-[100%] w-[100%]">
          <defs>
            <pattern id="85737c0e-0916-41d7-917f-596dc7edfa27" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <rect x="0" y="0" width="4" height="4" className="text-blue-200 dark:text-blue-900" fill="currentColor" />
            </pattern>
          </defs>
          <rect className=' h-[130%] w-[145%]' width="404" height="404" fill="url(#85737c0e-0916-41d7-917f-596dc7edfa27)" />
        </svg>
      </div>
    </div>
  );
}