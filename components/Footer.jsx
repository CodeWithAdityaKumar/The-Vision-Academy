"use client"
import Link from 'next/link';
import { motion } from 'framer-motion';

const socialLinks = [
  { name: 'Facebook', href: '#', icon: 'fab fa-facebook-f' },
  { name: 'Twitter', href: '#', icon: 'fab fa-twitter' },
  { name: 'Instagram', href: '#', icon: 'fab fa-instagram' },
  { name: 'LinkedIn', href: '#', icon: 'fab fa-linkedin-in' },
  { name: 'YouTube', href: '#', icon: 'fab fa-youtube' },
  { name: 'WhatsApp', href: '#', icon: 'fab fa-whatsapp' },
];

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="col-span-2">
            <h2 className="text-2xl font-bold mb-4">The Vision Academy.</h2>
            <p className="mb-4">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean consectetur ut lorem in ultricies.</p>
            <div className="flex space-x-4">
              {socialLinks.map((link) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  whileHover={{ scale: 1.2 }}
                  className="text-gray-400 hover:text-white transition duration-300"
                >
                  <i className={link.icon}></i>
                </motion.a>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="hover:text-gray-300 transition duration-300">Home</Link></li>
              <li><Link href="/contact" className="hover:text-gray-300 transition duration-300">Contact us</Link></li>
              <li><Link href="/about" className="hover:text-gray-300 transition duration-300">About us</Link></li>
              <li><Link href="/get-started" className="hover:text-gray-300 transition duration-300">Get started</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              <li><Link href="/services/app-design" className="hover:text-gray-300 transition duration-300">App design</Link></li>
              <li><Link href="/services/web-design" className="hover:text-gray-300 transition duration-300">Web design</Link></li>
              <li><Link href="/services/logo-design" className="hover:text-gray-300 transition duration-300">Logo design</Link></li>
              <li><Link href="/services/banner-design" className="hover:text-gray-300 transition duration-300">Banner design</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Account</h3>
            <ul className="space-y-2">
              <li><Link href="/profile" className="hover:text-gray-300 transition duration-300">Profile</Link></li>
              <li><Link href="/my-account" className="hover:text-gray-300 transition duration-300">My account</Link></li>
              <li><Link href="/preferences" className="hover:text-gray-300 transition duration-300">Preferences</Link></li>
              <li><Link href="/purchase" className="hover:text-gray-300 transition duration-300">Purchase</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">Created By Aditya Kumar</p>
            <div className="mt-4 md:mt-0">
              <input
                type="email"
                placeholder="Enter your email"
                className="bg-gray-700 text-white px-4 py-2 rounded-l-md focus:outline-none"
              />
              <button className="bg-red-600 text-white px-4 py-2 rounded-r-md hover:bg-red-700 transition duration-300">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}