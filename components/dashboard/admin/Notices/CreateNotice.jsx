"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { database } from "@/lib/firebase";
import { ref as dbRef, push, set } from "firebase/database";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function CreateNotice() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "general",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const noticeRef = push(dbRef(database, "notices"));
      
      // Save notice data
      await set(noticeRef, {
        ...formData,
        timestamp: new Date().toISOString(),
        status: "active",
      });

      toast.success("Notice created successfully!");
    } catch (error) {
      console.error("Error creating notice:", error);
      toast.error("Failed to create notice");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Create Notice
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                  focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter notice title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, type: e.target.value }))
                }
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                  focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="general">General</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Content
              </label>
              <textarea
                required
                value={formData.content}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    content: e.target.value,
                  }))
                }
                rows={6}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                  focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter notice content"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 
                  transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating..." : "Create Notice"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
