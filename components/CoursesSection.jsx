"use client"
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import ScholarIcon from '../public/images/icons/scholar.svg';
import IITIcon from '../public/images/icons/IIT.svg';
import MedicalIcon from '../public/images/icons/Medical.svg';

const courseData = [
  {
    Icon: ScholarIcon,
    title: 'Class 6th-10th',
    description: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Rem quia sunt, quasi quo illo enim.'
  },
  {
    Icon: IITIcon,
    title: 'IIT',
    description: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Rem quia sunt, quasi quo illo enim.'
  },
  {
    Icon: MedicalIcon,
    title: 'NEET',
    description: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Rem quia sunt, quasi quo illo enim.'
  }
];

export default function CoursesSection() {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <section className="py-16 bg-white dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">Our Courses</h2>
          <p className="text-xl text-red-600 dark:text-red-400">What We Provide</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {courseData.map((course, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-gray-100 dark:bg-gray-700 p-6 rounded-lg shadow-md text-center transform transition duration-300 ease-in-out hover:scale-105 hover:shadow-xl"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <motion.div 
                className="flex justify-center mb-4"
                animate={hoveredIndex === index ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                <course.Icon className="w-16 h-16 text-red-500 dark:text-red-400" />
              </motion.div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{course.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{course.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}