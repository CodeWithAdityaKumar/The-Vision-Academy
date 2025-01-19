"use client"
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaFileUpload, FaFilePdf, FaImage, FaExpand, FaTimes, FaSearch, FaFilter, FaSortAmountDown } from 'react-icons/fa';

const SolveDoubt = ({ teacherSubject, teacherId }) => {
  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoubt, setSelectedDoubt] = useState(null);
  const [solution, setSolution] = useState('');
  const [filter, setFilter] = useState('pending'); // pending, solved, all
  const [solutionFile, setSolutionFile] = useState(null);
  const [solutionFilePreview, setSolutionFilePreview] = useState(null);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('latest');


  const truncateText = (text, maxLength = 30) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  // Dummy data - replace with actual API call
  useEffect(() => {
    const fetchDoubts = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        const dummyDoubts = [
          {
            id: 1,
            subject: 'Physics',
            question: 'Need help with Newton\'s jahbdjvhabdhvahsdvhadfhsdhfvagdsf laws',
            imageUrl: '/images/about.png',
            status: 'pending',
            studentName: 'John Doe',
            timestamp: new Date().toISOString(),
          },
          // Add more dummy doubts...
        ];
        
        // Filter doubts based on teacher's subject
        const filteredDoubts = dummyDoubts.filter(
          doubt => doubt.subject === teacherSubject
        );
        setDoubts(filteredDoubts);
      } catch (error) {
        toast.error('Error fetching doubts');
      } finally {
        setLoading(false);
      }
    };

    fetchDoubts();
  }, [teacherSubject]);

  const handleSolutionFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10000000) {
        toast.error('File size should be less than 10MB');
        return;
      }

      const isValidType = file.type.startsWith('image/') || file.type === 'application/pdf';
      if (!isValidType) {
        toast.error('Please upload only images or PDF files');
        return;
      }

      setSolutionFile(file);
      if (file.type.startsWith('image/')) {
        setSolutionFilePreview(URL.createObjectURL(file));
      } else {
        setSolutionFilePreview('pdf');
      }
      toast.success('Solution file uploaded successfully!');
    }
  };

  const handleSolve = async (doubtId) => {
    if (!solution.trim() && !solutionFile) {
      toast.error('Please provide a solution text or file');
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update doubts list
      setDoubts(prevDoubts =>
        prevDoubts.map(doubt =>
          doubt.id === doubtId
            ? { 
                ...doubt, 
                status: 'solved', 
                solution,
                solutionFile: solutionFilePreview 
              }
            : doubt
        )
      );
      
      setSelectedDoubt(null);
      setSolution('');
      setSolutionFile(null);
      setSolutionFilePreview(null);
      toast.success('Doubt resolved successfully!');
    } catch (error) {
      toast.error('Error resolving doubt');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600" />
      </div>
    );
  }

  const renderSolutionPreview = (doubt) => {
    if (!doubt.solutionFile) return null;
    
    return doubt.solutionFile === 'pdf' ? (
      <div className="flex items-center text-blue-600 mt-2">
        <FaFilePdf className="mr-2" />
        <span>View PDF Solution</span>
      </div>
    ) : (
      <div className="mt-2 relative h-32 w-full">
        <Image
          src={doubt.solutionFile}
          alt="Solution"
          fill
          className="object-contain"
        />
      </div>
    );
  };

  // Loading skeleton component
  const DoubtCardSkeleton = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden animate-pulse">
      <div className="h-48 bg-gray-200 dark:bg-gray-700" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    </div>
  );

  // Enhanced modal with gesture support
  const renderModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto mt-28 mb-10
          border border-gray-100 dark:border-gray-700 hover:border-red-100 dark:hover:border-red-900/30"
      >
        <div className="flex justify-between items-start mb-6">
          <h3 className="text-xl font-bold break-words w-[80%]">{selectedDoubt.question}</h3>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => setFullscreenImage(selectedDoubt.imageUrl)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FaExpand className="text-gray-600" />
            </button>
            <button
              onClick={() => setSelectedDoubt(null)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FaTimes className="text-gray-600" />
            </button>
          </div>
        </div>

        <div className="relative h-[200px] w-full mb-6 rounded-lg overflow-hidden group">
          <Image
            src={selectedDoubt.imageUrl}
            alt="Question"
            fill
            className="object-contain"
          />
          <button
            onClick={() => setSelectedDoubt(null)}
            className="absolute top-2 right-2 p-2 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <FaTimes className="text-white" />
          </button>
        </div>
        
        <div className="space-y-4">
          <textarea
            value={solution}
            onChange={(e) => setSolution(e.target.value)}
            className="w-full p-3 border rounded-lg min-h-[150px] mb-4
              focus:ring-2 focus:ring-red-500 focus:border-red-500
              hover:border-red-300 dark:hover:border-red-700
              bg-gray-50 dark:bg-gray-700 transition-all duration-200"
            placeholder="Write your solution here..."
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Upload Solution (Image/PDF)
            </label>
            <div className="relative">
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleSolutionFileUpload}
                className="hidden"
                id="solution-file"
              />
              <label
                htmlFor="solution-file"
                className="flex items-center justify-center w-full p-3 border-2 border-dashed rounded-lg cursor-pointer
                  hover:border-red-500 transition-colors
                  bg-gray-50 dark:bg-gray-700"
              >
                <FaFileUpload className="mr-2 text-red-500" />
                Choose File
              </label>
            </div>

            {solutionFilePreview && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-2"
              >
                {solutionFilePreview === 'pdf' ? (
                  <div className="flex items-center text-blue-600">
                    <FaFilePdf className="mr-2" />
                    <span>PDF Selected</span>
                  </div>
                ) : (
                  <div className="relative h-40 w-full">
                    <Image
                      src={solutionFilePreview}
                      alt="Solution preview"
                      fill
                      className="object-contain"
                    />
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-4 mt-6">
          <button
            onClick={() => {
              setSelectedDoubt(null);
              setSolutionFile(null);
              setSolutionFilePreview(null);
            }}
            className="px-4 py-2 text-gray-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => handleSolve(selectedDoubt.id)}
            className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800
              text-white rounded-lg transition-all duration-300 shadow-lg
              hover:shadow-red-500/25 hover:shadow-xl"
          >
            Submit Solution
          </button>
        </div>
      </motion.div>
    </div>
  );

  const ImageViewer = ({ src, onClose }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black bg-opacity-90 backdrop-blur-sm flex flex-col py-20"
    >
      <div className="flex justify-end p-4">
        <button
          onClick={onClose}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
        >
          <FaTimes size={24} className="text-white" />
        </button>
      </div>
      <div className="flex-1 relative">
        <Image
          src={src}
          alt="Full screen image"
          fill
          className="object-contain"
          quality={100}
        />
      </div>
    </motion.div>
  );

  const renderDoubtImage = (doubt) => (
    <div className="relative h-48 w-full group">
      <Image
        src={doubt.imageUrl}
        alt="Question"
        fill
        className="object-cover"
      />
      <div className="absolute bottom-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => setFullscreenImage(doubt.imageUrl)}
          className="p-2 bg-black/50 rounded-full"
        >
          <FaExpand className="text-white" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedDoubt(null);
          }}
          className="p-2 bg-black/50 rounded-full"
        >
          <FaTimes className="text-white" />
        </button>
      </div>
    </div>
  );

  // Enhanced search and filter section
  const renderControls = () => (
    <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm py-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="relative w-full sm:w-64"
        >
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-400" />
          <input
            type="text"
            placeholder="Search doubts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border
              focus:ring-2 focus:ring-red-500 focus:border-red-500
              hover:border-red-300 dark:hover:border-red-700
              transition-all duration-200"
          />
        </motion.div>

        <div className="flex gap-2 w-full sm:w-auto">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="p-2 rounded-lg border flex-1 sm:flex-none
              focus:ring-2 focus:ring-red-500 focus:border-red-500
              hover:border-red-300 dark:hover:border-red-700
              transition-all duration-200"
          >
            <option value="pending">Pending</option>
            <option value="solved">Solved</option>
            <option value="all">All</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="p-2 rounded-lg border flex-1 sm:flex-none
              focus:ring-2 focus:ring-red-500 focus:border-red-500
              hover:border-red-300 dark:hover:border-red-700
              transition-all duration-200"
          >
            <option value="latest">Latest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>
    </div>
  );

  // Enhanced doubt card with animations
  const renderDoubtCard = (doubt) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden relative group
        border border-gray-100 dark:border-gray-700 
        hover:border-red-100 dark:hover:border-red-900/30
        hover:shadow-xl hover:shadow-red-500/10
        transition-all duration-300"
    >
      <div className="relative h-48 w-full">
        <Image
          src={doubt.imageUrl}
          alt="Question"
          fill
          className="object-cover"
        />
        <button
          onClick={() => setFullscreenImage(doubt.imageUrl)}
          className="absolute bottom-2 right-2 p-2 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <FaExpand className="text-white" />
        </button>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-500">
            {new Date(doubt.timestamp).toLocaleDateString()}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs ${
            doubt.status === 'pending'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-green-100 text-green-800'
          }`}>
            {doubt.status}
          </span>
        </div>
        
        <div className="relative group/text mb-2">
          <h3 className="font-semibold line-clamp-2 group-hover/text:line-clamp-none transition-all duration-300">
            {truncateText(doubt.question)}
          </h3>
          
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          By: {doubt.studentName}
        </p>
        
        {doubt.status === 'pending' && (
          <button
            onClick={() => setSelectedDoubt(doubt)}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800
              text-white py-2 rounded-lg transition-all duration-300
              hover:shadow-lg hover:shadow-red-500/25"
          >
            Solve Doubt
          </button>
        )}
        
        {doubt.status === 'solved' && (
          <div className="text-sm text-gray-600 dark:text-gray-300">
            <strong>Solution:</strong> 
            <div className="relative group/solution">
              <p className="line-clamp-3 group-hover/solution:line-clamp-none transition-all duration-300">
                {doubt.solution}
              </p>
              {doubt.solution?.length > 150 && (
                <button 
                  className="text-xs text-blue-600 hover:text-blue-800 mt-1 opacity-0 group-hover/solution:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedDoubt(doubt);
                  }}
                >
                  Show full solution
                </button>
              )}
            </div>
            {renderSolutionPreview(doubt)}
          </div>
        )}
      </div>

      <div className="absolute top-2 right-2 z-10">
        <motion.span
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className={`px-2 py-1 rounded-full text-xs ${
            doubt.status === 'pending'
              ? 'bg-red-100 text-red-800'
              : 'bg-green-100 text-green-800'
          }`}
        >
          {doubt.status}
        </motion.span>
      </div>
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8"
    >
      <ToastContainer position="top-right" />
      
      {renderControls()}

      <motion.div
        layout
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
      >
        {loading ? (
          Array(6).fill(0).map((_, i) => (
            <DoubtCardSkeleton key={i} />
          ))
        ) : (
          doubts
            .filter(doubt => {
              const matchesFilter = filter === 'all' || doubt.status === filter;
              const matchesSearch = doubt.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  doubt.studentName.toLowerCase().includes(searchTerm.toLowerCase());
              return matchesFilter && matchesSearch;
            })
            .sort((a, b) => {
              if (sortBy === 'latest') {
                return new Date(b.timestamp) - new Date(a.timestamp);
              }
              return new Date(a.timestamp) - new Date(b.timestamp);
            })
            .map(doubt => renderDoubtCard(doubt))
        )}
      </motion.div>

      {doubts.length === 0 && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-10"
        >
          <p className="text-xl text-gray-600 dark:text-gray-400">
            No doubts found for {teacherSubject}
          </p>
        </motion.div>
      )}

      {selectedDoubt && renderModal()}
      {fullscreenImage && (
        <ImageViewer
          src={fullscreenImage}
          onClose={() => setFullscreenImage(null)}
        />
      )}
    </motion.div>
  );
};

export default SolveDoubt;
