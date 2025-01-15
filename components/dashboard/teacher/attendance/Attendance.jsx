"use client";
import React, { useState, useEffect } from "react";
import { ref, get, set, getDatabase } from "firebase/database";
import { format } from "date-fns";
import {
  FaCheck,
  FaEye,
  FaEyeSlash,
  FaTimes,
  FaUmbrella,
} from "react-icons/fa";
import { onValue } from "firebase/database";
import { useTheme } from "next-themes";
import PasswordModal from "./PasswordModal";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const Attendance = ({ isAdmin }) => {
  const router = useRouter();

  const { theme } = useTheme();
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [existingAttendance, setExistingAttendance] = useState(null);
  const [loadingExisting, setLoadingExisting] = useState(false);
  const [isVerified, setIsVerified] = useState(isAdmin ? true : false);
  const [showModal, setShowModal] = useState(isAdmin ? false : true);
  const [newPassword, setNewPassword] = useState("");
  const [passwordUpdateSuccess, setPasswordUpdateSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const classes = [
    "Class 5",
    "Class 6",
    "Class 7",
    "Class 8",
    "Class 9",
    "Class 10",
    "Class 11",
    "Class 12",
  ];

  console.log("isAdmin:", isAdmin);

  useEffect(() => {
    const db = getDatabase();
    const passwordRef = ref(db, "settings/attendancePassword");

    onValue(passwordRef, (snapshot) => {
      if (snapshot.exists()) {
        setNewPassword(snapshot.val());
      }
    });
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchStudents();
    }
  }, [selectedClass]);

  useEffect(() => {
    if (selectedClass && selectedDate) {
      fetchExistingAttendance();
    }
  }, [selectedClass, selectedDate]);

  const fetchStudents = async () => {
    setLoading(true);
    const db = getDatabase();
    const studentsRef = ref(db, "users");

    try {
      const snapshot = await get(studentsRef);
      if (snapshot.exists()) {
        const allUsers = Object.entries(snapshot.val()).map(([id, data]) => ({
          id,
          ...data,
        }));

        const filteredStudents = allUsers.filter(
          (user) =>
            user.role === "student" &&
            user.class === selectedClass.replace("Class ", "")
        );

        setStudents(filteredStudents);
        initializeAttendance(filteredStudents);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingAttendance = async () => {
    setLoadingExisting(true);
    const db = getDatabase();
    const formattedDate = format(new Date(selectedDate), "yyyy-MM-dd");
    const attendanceRef = ref(
      db,
      `attendance/${selectedClass}/${formattedDate}`
    );

    try {
      const snapshot = await get(attendanceRef);
      if (snapshot.exists()) {
        const existingData = snapshot.val();
        setAttendance(existingData);
        setExistingAttendance(true);
      } else {
        setExistingAttendance(false);
        initializeAttendance(students);
      }
    } catch (error) {
      console.error("Error fetching existing attendance:", error);
    } finally {
      setLoadingExisting(false);
    }
  };

  const initializeAttendance = (studentsData) => {
    const initialAttendance = {};
    studentsData.forEach((student) => {
      initialAttendance[student.id] = "absent"; // Default to absent
    });
    setAttendance(initialAttendance);
  };

  const handleAttendance = (studentId, status) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const saveAttendance = async () => {
    if (!selectedClass || !selectedDate) {
      alert("Please select both class and date");
      return;
    }

    const db = getDatabase();
    const formattedDate = format(new Date(selectedDate), "yyyy-MM-dd");
    const attendanceRef = ref(
      db,
      `attendance/${selectedClass}/${formattedDate}`
    );

    try {
      await set(attendanceRef, attendance);
      alert("Attendance saved successfully!");
    } catch (error) {
      console.error("Error saving attendance:", error);
      alert("Error saving attendance");
    }
  };

  const handlePasswordChange = async () => {
    if (!newPassword) {
      setPasswordError("Password cannot be empty");
      return;
    }

    const db = getDatabase();
    const passwordRef = ref(db, "settings/attendancePassword");

    try {
      await set(passwordRef, newPassword);
      setPasswordUpdateSuccess(true);
      setShowPassword(false);
      setTimeout(() => setPasswordUpdateSuccess(false), 3000);
    } catch (error) {
      console.error("Error updating password:", error);
      setPasswordError("Failed to update password");
    }
  };

  const verifyPassword = async (enteredPassword) => {
    const db = getDatabase();
    const passwordRef = ref(db, "settings/attendancePassword");

    try {
      const snapshot = await get(passwordRef);
      if (snapshot.exists()) {
        const correctPassword = snapshot.val();
        if (enteredPassword === correctPassword) {
          setIsVerified(true);
          setShowModal(false);
        } else {
          setError("Incorrect password");
        }
      }
    } catch (error) {
      console.error("Error verifying password:", error);
      setError("Failed to verify password");
    }
  };

  const markAllHoliday = () => {
    const updatedAttendance = {};
    students.forEach((student) => {
      updatedAttendance[student.id] = "holiday";
    });
    setAttendance(updatedAttendance);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6"
    >
      {!isAdmin && showModal && !isVerified ? (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
        >
          <PasswordModal
            onVerify={verifyPassword}
            onClose={() => {
              setLoading(true);
              setShowModal(false);
              router.push("/pages/account/dashboard/");
            }}
            error={error}
          />
        </motion.div>
      ) : isVerified ? (
        <div className="max-w-7xl mx-auto">
          {isAdmin && (
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 rounded-xl shadow-xl p-6 mb-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Update Attendance Password
              </h2>
              <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setPasswordError("");
                    }}
                    placeholder="Enter new password"
                    className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                <button
                  onClick={handlePasswordChange}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Update Password
                </button>
              </div>
              {passwordError && (
                <p className="mt-2 text-red-500 text-sm">{passwordError}</p>
              )}
              {passwordUpdateSuccess && (
                <p className="mt-2 text-green-500 text-sm">
                  Password updated successfully!
                </p>
              )}
            </motion.div>
          )}

          <div className="flex justify-between items-center mb-6">
            <motion.h1
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="text-3xl font-bold text-gray-800 dark:text-white"
            >
              Take Attendance
            </motion.h1>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={markAllHoliday}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg transition-all duration-200"
            >
              <FaUmbrella />
              Mark All Holiday
            </motion.button>
          </div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 rounded-xl shadow-xl p-4 sm:p-6"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <motion.select
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-red-500 focus:ring-red-500 transition-all duration-200"
              >
                <option value="">Select Class</option>
                {classes.map((className) => (
                  <option key={className} value={className}>
                    {className}
                  </option>
                ))}
              </motion.select>

              <motion.input
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="date"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-red-500 focus:ring-red-500 transition-all duration-200"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            {loading || loadingExisting ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8"
              >
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                  {loading
                    ? "Loading students..."
                    : "Loading existing attendance..."}
                </p>
              </motion.div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="overflow-x-auto"
                >
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Roll No
                        </th>
                        <th className="px-6 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Attendance
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {students.length === 0 ? (
                        <tr>
                          <td
                            colSpan="3"
                            className="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
                          >
                            No students found in {selectedClass}
                          </td>
                        </tr>
                      ) : (
                        students.map((student) => (
                          <tr key={student.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
                              {student.rollNumber}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
                              {student.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex space-x-2">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() =>
                                    handleAttendance(student.id, "present")
                                  }
                                  className={`p-2 rounded-full transition-colors duration-200 ${
                                    attendance[student.id] === "present"
                                      ? "bg-green-500 text-white"
                                      : "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                                  }`}
                                  title="Present"
                                >
                                  <FaCheck />
                                </motion.button>

                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() =>
                                    handleAttendance(student.id, "absent")
                                  }
                                  className={`p-2 rounded-full transition-colors duration-200 ${
                                    attendance[student.id] === "absent"
                                      ? "bg-red-500 text-white"
                                      : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                                  }`}
                                  title="Absent"
                                >
                                  <FaTimes />
                                </motion.button>

                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() =>
                                    handleAttendance(student.id, "holiday")
                                  }
                                  className={`p-2 rounded-full transition-colors duration-200 ${
                                    attendance[student.id] === "holiday"
                                      ? "bg-amber-500 text-white"
                                      : "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                                  }`}
                                  title="Holiday"
                                >
                                  <FaUmbrella />
                                </motion.button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4"
                >
                  {existingAttendance && (
                    <span className="text-amber-600 dark:text-amber-400 font-medium text-center sm:text-left">
                      Editing existing attendance for{" "}
                      {format(new Date(selectedDate), "dd MMM yyyy")}
                    </span>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={saveAttendance}
                    className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-3 rounded-lg hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200"
                  >
                    {existingAttendance
                      ? "Update Attendance"
                      : "Save Attendance"}
                  </motion.button>
                </motion.div>
              </AnimatePresence>
            )}
          </motion.div>
        </div>
      ) : null}
    </motion.div>
  );
};

export default Attendance;
