"use client"
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/components/AuthProvider'
import { useRouter } from 'next/navigation'
import { database } from '@/lib/firebase'
import { ref, onValue } from 'firebase/database'
import Link from 'next/link'

const Page = () => {
  const router = useRouter()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('notes')
  const [searchQuery, setSearchQuery] = useState('')
  const [classFilter, setClassFilter] = useState('all')
  const [notes, setNotes] = useState([])
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const notesRef = ref(database, 'notes')
        const booksRef = ref(database, 'books')

        // Set up realtime listeners
        onValue(notesRef, (snapshot) => {
          const notesData = []
          snapshot.forEach((child) => {
            notesData.push({ id: child.key, ...child.val() })
          })
          setNotes(notesData)
        })

        onValue(booksRef, (snapshot) => {
          const booksData = []
          snapshot.forEach((child) => {
            booksData.push({ id: child.key, ...child.val() })
          })
          setBooks(booksData)
        })

        setLoading(false)
      } catch (error) {
        console.error("Error fetching data:", error)
        setLoading(false)
      }
    }

    if (user) {
      fetchData()
    }
  }, [user])

  if (!user) {
    router.push('/pages/account/login')
    return null
  }

  if (loading) {
    return <div className="text-center py-4">Loading...</div>
  }

  const classes = ['all', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12']

  const filterItems = (items) => {
    return items.filter(item => {
      const matchesClass = classFilter === 'all' || item.class === classFilter
      const searchLower = searchQuery.toLowerCase()
      const matchesSearch = item.title.toLowerCase().includes(searchLower) ||
                          item.subject.toLowerCase().includes(searchLower) ||
                          (item.description?.toLowerCase().includes(searchLower) || '') ||
                          (item.author?.toLowerCase().includes(searchLower) || '')
      return matchesClass && matchesSearch
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Study Resources
          </h1>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center mb-8 space-y-4 md:space-y-0">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('notes')}
              className={`px-6 py-2 rounded-lg transition duration-300 ${
                activeTab === 'notes'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Notes
            </button>
            <button
              onClick={() => setActiveTab('books')}
              className={`px-6 py-2 rounded-lg transition duration-300 ${
                activeTab === 'books'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Books
            </button>
          </div>

          <div className="flex space-x-4">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              {classes.map(classLevel => (
                <option key={classLevel} value={classLevel}>
                  {classLevel === 'all' ? 'All Classes' : classLevel}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeTab === 'notes' &&
            filterItems(notes).map((note) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition duration-300"
              >
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {note.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  {note.description}
                </p>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {note.class} • {note.subject}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Uploaded by: {note.uploadedBy}
                </p>
                <a
                  href={note.downloadUrl}
                  className="inline-block bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-300"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Download Notes
                </a>
              </motion.div>
            ))}

          {activeTab === 'books' &&
            filterItems(books).map((book) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition duration-300"
              >
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {book.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  By {book.author}
                </p>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {book.class} • {book.subject}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Uploaded by: {book.uploadedBy}
                </p>
                <a
                  href={book.downloadUrl}
                  className="inline-block bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-300"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Download Book
                </a>
              </motion.div>
            ))}
        </div>
      </motion.div>
    </div>
  )
}

export default Page
