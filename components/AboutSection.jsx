"use client"
import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Typed from 'typed.js';
import { motion } from 'framer-motion';

export default function AboutSection() {
  const el = useRef(null);

  useEffect(() => {
    const typed = new Typed(el.current, {
      strings: ['The Clear Vision to Success...!','The Vision Academy'],
      typeSpeed: 50,
      backSpeed: 50,
      loop: true,
    });

    return () => {
      typed.destroy();
    };
  }, []);

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">ABOUT US</h2>
          <p className="text-xl text-red-600 dark:text-red-400">Who Are We</p>
        </motion.div>
        <div className="flex flex-col md:flex-row items-center justify-between">
          <motion.div 
            className="md:w-1/2 mb-8 md:mb-0"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Image
              src="/images/logo.png"
              alt="The Vision Academy Logo"
              width={400}
              height={400}
              className="rounded-lg shadow-xl"
            />
          </motion.div>
          <motion.div 
            className="md:w-1/2 md:pl-12"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                We Are From <span className="text-red-600 dark:text-red-400" ref={el}></span>
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Quasi ut voluptatum
                eveniet doloremque autem excepturi eaque, sit laboriosam voluptatem nisi
                delectus. Facere explicabo hic minus accusamus alias fuga nihil dolorum quae.
                Explicabo illo unde, odio consequatur ipsam possimus veritatis, placeat, ab
                molestiae velit inventore exercitationem consequuntur blanditiis omnis beatae.
                Dolor iste excepturi ratione soluta quas culpa voluptatum repudiandae harum non.
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href="/about" className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out">
                  Read more..
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}