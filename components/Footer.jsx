import React from 'react';
import Link from 'next/link';
import { FaFacebookF, FaTwitter, FaInstagram, FaWhatsapp, FaLinkedinIn } from 'react-icons/fa';

const Footer = () => {
  const socialLinks = [
    { icon: <FaFacebookF />, href: 'https://facebook.com', color: 'hover:bg-blue-600' },
    { icon: <FaTwitter />, href: 'https://twitter.com', color: 'hover:bg-blue-400' },
    { icon: <FaInstagram />, href: 'https://instagram.com', color: 'hover:bg-pink-600' },
    { icon: <FaWhatsapp />, href: 'https://wa.me/+911234567890', color: 'hover:bg-green-500' },
    { icon: <FaLinkedinIn />, href: 'https://linkedin.com', color: 'hover:bg-blue-700' },
  ];

  return (
    <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              The Vision Academy
            </h2>
            <p className="text-gray-300 text-sm leading-relaxed">
              Empowering minds, shaping futures through quality education.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-10 h-10 rounded-full flex items-center justify-center bg-gray-700 
                    ${social.color} transition-all duration-300 transform hover:scale-110`}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Quick Links
            </h3>
            <nav className="flex flex-col space-y-3">
              {['Home', 'About', 'Courses', 'Contact'].map((link) => (
                <Link
                  key={link}
                  href={`/${link.toLowerCase()}`}
                  className="text-gray-300 hover:text-blue-400 transition-colors duration-300 
                    transform hover:translate-x-2 inline-block"
                >
                  {link}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Contact Us
            </h3>
            <div className="space-y-4 text-gray-300">
              <p className="flex items-center hover:text-blue-400 transition-colors duration-300">
                <span className="mr-3 text-blue-400">📧</span>
                officialthevision1@gmail.com
              </p>
              <p className="flex items-center hover:text-blue-400 transition-colors duration-300">
                <span className="mr-3 text-blue-400">📱</span>
                +91 8210682466
              </p>
              <p className="flex items-center hover:text-blue-400 transition-colors duration-300">
                <span className="mr-3 text-blue-400">📍</span>
                Behind UCO Bank, SVPS School Campus, Sheohar, Bihar-843329
              </p>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Newsletter
            </h3>
            <div className="space-y-4">
              <p className="text-gray-300 text-sm">Stay updated with our latest news and updates!</p>
              <div className="flex flex-col space-y-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none 
                    focus:ring-2 focus:ring-blue-400 transition-all duration-300"
                />
                <button className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg 
                  transition-colors duration-300 text-white font-medium">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-700 text-center space-y-2">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} The Vision Academy. All rights reserved.
          </p>
          <p className="text-gray-400 text-sm">
            Developed by{' '}
            <a 
              href="https://adityakumarportfolio.vercel.app" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent 
                hover:from-purple-500 hover:to-blue-400 transition-all duration-300"
            >
              Aditya Kumar
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;