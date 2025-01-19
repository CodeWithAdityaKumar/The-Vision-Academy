"use client"
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaTimes, FaChevronDown, FaFilePdf, FaDownload, FaImage } from 'react-icons/fa';

const AskDoubt = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [subject, setSubject] = useState('');
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [solutions, setSolutions] = useState([]);
  const [showSolutions, setShowSolutions] = useState(false);
  const [selectedSolution, setSelectedSolution] = useState(null);
  const [activeTab, setActiveTab] = useState('ask'); // Add this new state

  const subjects = [
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'English',
    'Computer Science'
  ];

  useEffect(() => {
    // Simulate fetching solutions - replace with actual API call
    const fetchSolutions = async () => {
      const dummySolutions = [
        {
          id: 1,
          question: "What is Newton's First Law?",
          subject: "Physics",
          solution: "Newton's First Law states that an object will remain at rest or in uniform motion in a straight line unless acted upon by an external force.",
          solutionFile: "/images/about.png",
          fileType: "image",
          solvedBy: "Dr. Smith",
          solvedAt: new Date().toISOString(),
        },
        // Add more dummy solutions...
      ];
      setSolutions(dummySolutions);
    };
    fetchSolutions();
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5000000) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      setSelectedImage(URL.createObjectURL(file));
      toast.success('Image uploaded successfully!');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Add your API call here
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      setSelectedImage(null);
      setSubject('');
      setQuestion('');
      toast.success('Doubt submitted successfully!');
    } catch (error) {
      toast.error('Error submitting doubt. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      toast.success('Download started successfully!');
    } catch (error) {
      toast.error('Error downloading file');
      console.error('Download error:', error);
    }
  };

  const renderImagePreview = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mt-4 relative h-[200px] sm:h-[300px] w-full rounded-lg overflow-hidden border-2 border-red-500 group hover:border-red-600 transition-colors"
    >
      <Image
        src={selectedImage}
        alt="Selected question"
        fill
        className="object-contain"
      />
      <button
        onClick={() => setSelectedImage(null)}
        className="absolute top-2 right-2 p-2 bg-red-500/50 hover:bg-red-600/50 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"
      >
        <FaTimes className="text-white" />
      </button>
    </motion.div>
  );

  const SolutionViewer = ({ solution, onClose }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto mt-10">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold">{solution.question}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <FaTimes />
          </button>
        </div>
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">{solution.solution}</p>
          {solution.solutionFile && (
            <div className="relative">
              <div className="relative h-[300px] w-full rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                {solution.fileType === 'image' ? (
                  <Image
                    src={solution.solutionFile}
                    alt="Solution"
                    fill
                    className="object-contain"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <FaFilePdf className="text-red-500 text-5xl" />
                  </div>
                )}
              </div>
              <button
                onClick={() => handleDownload(
                  solution.solutionFile, 
                  `solution-${solution.id}.${solution.fileType === 'image' ? 'png' : 'pdf'}`
                )}
                className="absolute bottom-4 right-4 p-3 bg-red-500 hover:bg-red-600 
                  text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300
                  flex items-center gap-2 group"
              >
                <FaDownload className="group-hover:animate-bounce" />
                <span className="hidden group-hover:inline">Download</span>
              </button>
            </div>
          )}
          <div className="text-sm text-gray-500 dark:text-gray-400 flex justify-between items-center">
            <span>Solved by {solution.solvedBy}</span>
            <span>{new Date(solution.solvedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const SolutionCard = ({ solution }) => (
    <motion.div
      layoutId={`solution-${solution.id}`}
      className="border dark:border-gray-700 rounded-lg p-4 hover:border-red-200 
        dark:hover:border-red-900/30 transition-colors cursor-pointer
        hover:shadow-lg hover:shadow-red-500/10"
      onClick={() => setSelectedSolution(solution)}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h4 className="font-medium mb-1">{solution.question}</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
            {solution.subject} • Solved by {solution.solvedBy}
            {solution.fileType === 'pdf' ? (
              <FaFilePdf className="text-red-500" />
            ) : (
              <FaImage className="text-blue-500" />
            )}
          </p>
        </div>
        <span className="text-xs text-gray-400">
          {new Date(solution.solvedAt).toLocaleDateString()}
        </span>
      </div>
    </motion.div>
  );

  const SolutionsSection = () => (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-8"
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg
        border border-gray-100 dark:border-gray-700">
        <h3 className="text-xl font-bold mb-4">Your Solutions</h3>
        {solutions.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">
            No solutions yet
          </p>
        ) : (
          <div className="space-y-4">
            {solutions.map((solution) => (
              <SolutionCard key={solution.id} solution={solution} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 py-12">
      <ToastContainer position="top-right" theme="colored" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/90 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex justify-center space-x-4 p-4">
              {[
                { id: 'ask', label: 'Ask Doubt' },
                { id: 'solutions', label: 'My Solutions' }
              ].map((tab) => (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                    } px-6 py-3 rounded-full font-medium text-sm transition-colors`}
                >
                  {tab.label}
                </motion.button>
              ))}
            </nav>
          </div>

          {/* Form Content - Remove AnimatePresence and motion animations */}
          <div className="p-6 md:p-8">
            {activeTab === 'ask' ? (
              <div>
                <motion.h2 
                  whileHover={{ scale: 1.02 }}
                  className="text-2xl md:text-3xl font-bold mb-6 text-center bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent"
                >
                  Ask Your Doubt
                </motion.h2>
                
                <form onSubmit={handleSubmit} 
                  className="space-y-6"
                >
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6"
                  >
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                        Select Subject
                      </label>
                      <select
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full p-3 border rounded-lg transition-all duration-200 
                          bg-gray-50 dark:bg-gray-700
                          focus:ring-2 focus:ring-red-500 focus:border-red-500
                          hover:border-red-300 dark:hover:border-red-700"
                        required
                      >
                        <option value="">Choose a subject</option>
                        {subjects.map((sub) => (
                          <option key={sub} value={sub}>{sub}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                        Upload Question Image
                      </label>
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="w-full p-3 border rounded-lg transition-all duration-200
                            bg-gray-50 dark:bg-gray-700
                            file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0
                            file:text-sm file:font-medium
                            file:bg-red-50 file:text-red-700
                            hover:file:bg-red-100
                            dark:file:bg-red-900/30 dark:file:text-red-400
                            dark:hover:file:bg-red-900/50
                            focus:ring-2 focus:ring-red-500 focus:border-red-500
                            hover:border-red-300 dark:hover:border-red-700"
                          required
                        />
                      </div>
                    </div>
                  </motion.div>

                  {selectedImage && renderImagePreview()}

                  <motion.div whileHover={{ scale: 1.01 }} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Describe Your Doubt
                    </label>
                    <textarea
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      className="w-full p-3 border rounded-lg transition-all duration-200 
                        min-h-[120px] bg-gray-50 dark:bg-gray-700
                        focus:ring-2 focus:ring-red-500 focus:border-red-500
                        hover:border-red-300 dark:hover:border-red-700
                        resize-y"
                      placeholder="Provide additional details about your doubt..."
                    />
                  </motion.div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-3 px-4 rounded-lg text-white font-medium 
                      transition-all duration-300 shadow-lg
                      ${isLoading 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800'
                      }
                      hover:shadow-red-500/25 hover:shadow-xl
                      disabled:hover:shadow-none disabled:hover:scale-100`}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                        Submitting...
                      </div>
                    ) : 'Submit Doubt'}
                  </motion.button>

                  <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
                    Make sure to provide clear images and detailed descriptions for better assistance
                  </p>
                </form>
              </div>
            ) : (
              <div>
                <motion.h2 
                  whileHover={{ scale: 1.02 }}
                  className="text-2xl md:text-3xl font-bold mb-6 text-center bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent"
                >
                  My Solutions
                </motion.h2>
                
                {solutions.length === 0 ? (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                    No solutions yet. Ask a doubt to get started!
                  </p>
                ) : (
                  <div className="space-y-4">
                    {solutions.map((solution) => (
                      <SolutionCard
                        key={solution.id}
                        solution={solution}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Solution Viewer Modal */}
      <AnimatePresence>
        {selectedSolution && (
          <SolutionViewer
            solution={selectedSolution}
            onClose={() => setSelectedSolution(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AskDoubt;
