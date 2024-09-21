"use client"
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log(formData);
  };

  return (
    <section className="py-16 bg-gray-100 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">Contact me</h2>
          <p className="text-xl text-red-600 dark:text-red-400">Get In Touch</p>
        </motion.div>
        <div className="flex flex-col lg:flex-row gap-8">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:w-1/2"
          >
            <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md h-full flex flex-col">
              <h3 className="text-xl font-semibold mb-4">Get in Touch</h3>
              <div className="flex-grow mb-4 h-64 lg:h-auto">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d530.7241259897905!2d85.29760979663457!3d26.511371331625195!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39ece7c7205dd2f9%3A0x1c892494c257f0be!2sSwami%20Vivekanand%20Public%20School%20Sheohar!5e0!3m2!1sen!2sin!4v1690037879363!5m2!1sen!2sin" 
                  width="100%" 
                  height="100%" 
                  style={{border:0}} 
                  allowFullScreen="" 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  className="rounded-lg"
                ></iframe>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Swami Vivekanand Public Sch...
                Sheohar - Minapur Rd, Belahi Dullha, Sheohar, Bihar 843329
              </p>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="lg:w-1/2"
          >
            <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md h-full" style={{
                paddingBottom:"4rem"
            }} >
              <h3 className="text-xl font-semibold mb-4">Message me</h3>
              <form onSubmit={handleSubmit} className="h-full flex flex-col">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    name="name"
                    placeholder="Name...."
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"
                    required
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email..."
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"
                    required
                  />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="+97798624*****"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"
                    required
                  />
                  <input
                    type="text"
                    name="address"
                    placeholder="Address..."
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"
                    required
                  />
                </div>
                <input
                  type="text"
                  name="subject"
                  placeholder="Subject...."
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md mb-4 dark:bg-gray-800 dark:border-gray-600"
                  required
                />
                <textarea
                  name="message"
                  placeholder="Message....."
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md mb-4 flex-grow dark:bg-gray-800 dark:border-gray-600"
                  required
                ></textarea>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition duration-300"
                >
                  Send message
                </motion.button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}