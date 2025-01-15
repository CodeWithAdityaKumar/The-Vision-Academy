"use client";
import { useState, useEffect } from "react";
import { ref, onValue, update } from "firebase/database";
import { database } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  EyeIcon,
  PencilIcon,
  DocumentTextIcon,
  UserCircleIcon,
  XMarkIcon,
  CheckIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const generateReceiptNumber = () => {
  const date = new Date();
  return `TVA${date.getFullYear()}${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}${String(date.getDate()).padStart(2, "0")}${String(
    date.getHours()
  ).padStart(2, "0")}${String(date.getMinutes()).padStart(2, "0")}${String(
    date.getSeconds()
  ).padStart(2, "0")}`;
};

const getPreviousMonth = (currentMonth) => {
  const monthIndex = months.indexOf(currentMonth);
  return monthIndex === 0 ? null : months[monthIndex - 1];
};

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative bg-gradient-to-br from-red-50 to-orange-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 max-w-md w-full shadow-2xl mt-[3rem]"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <div className="bg-white/90 dark:bg-gray-800/90 rounded-xl p-6 backdrop-blur-sm shadow-inner">
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const PaymentsRequest = () => {
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterClass, setFilterClass] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toLocaleString("default", { month: "long" })
  );

  const [editMonthlyFee, setEditMonthlyFee] = useState("");
  const [editOtherCharges, setEditOtherCharges] = useState("");
  const [editPaidAmount, setEditPaidAmount] = useState("");

  const [classFees, setClassFees] = useState({});
  const [editingClassFee, setEditingClassFee] = useState(null);
  const [newClassFee, setNewClassFee] = useState("");

  const [activeSection, setActiveSection] = useState("students");

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [receipts, setReceipts] = useState({});

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5, staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  const buttonClassName = `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300
        focus:ring-2 focus:ring-offset-2 focus:outline-none`;

  const activeButtonClassName = `${buttonClassName} bg-blue-600 text-white hover:bg-blue-700
        focus:ring-blue-500 shadow-lg`;

  const inactiveButtonClassName = `${buttonClassName} bg-gray-100 text-gray-600
        hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600`;

  useEffect(() => {
    const studentsRef = ref(database, "users");
    onValue(studentsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const studentsList = Object.entries(data)
          .filter(([_, user]) => user.role === "student")
          .map(([id, user]) => {
            const previousMonth = getPreviousMonth(selectedMonth);
            const previousMonthDue = previousMonth
              ? (user.fees?.[previousMonth]?.monthlyFee || 0) +
                (user.fees?.[previousMonth]?.otherCharges || 0) -
                (user.fees?.[previousMonth]?.paidAmount || 0)
              : 0;

            return {
              id,
              name: user.name,
              photoURL: user.photoURL,
              class: user.class,
              monthlyFee: classFees[user.class]?.monthlyFee || 0,
              otherCharges: user.fees?.[selectedMonth]?.otherCharges || 0,
              paidAmount: user.fees?.[selectedMonth]?.paidAmount || 0,
              feeStatus: user.fees?.[selectedMonth]?.status || "Unpaid",
              previousMonthDue,
            };
          });
        setStudents(studentsList);
      }
      setLoading(false);
    });
  }, [selectedMonth, classFees]);

  useEffect(() => {
    const classFeesRef = ref(database, "classFees");
    onValue(classFeesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setClassFees(data);
      }
    });
  }, []);

  useEffect(() => {
    const fetchReceipts = async () => {
      const studentsRef = ref(database, "users");
      onValue(studentsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const receiptData = {};
          Object.entries(data).forEach(([id, user]) => {
            if (user.feeHistory && user.feeHistory[selectedMonth]) {
              const monthReceipts = Object.entries(
                user.feeHistory[selectedMonth]
              );
              if (monthReceipts.length > 0) {
                // Get the last receipt number
                const lastReceipt = monthReceipts[monthReceipts.length - 1][0];
                receiptData[id] = lastReceipt;
              }
            }
          });
          setReceipts(receiptData);
        }
      });
    };

    fetchReceipts();
  }, [selectedMonth]);

  const handleUpdateFee = async (id) => {
    try {
      const student = students.find((s) => s.id === id);
      const monthlyFee = classFees[student.class]?.monthlyFee || 0;
      const otherCharges = parseInt(editOtherCharges) || 0;
      const paidAmount = parseInt(editPaidAmount) || 0;
      const totalDue = monthlyFee + otherCharges - paidAmount;

      const userRef = ref(database, `users/${id}/fees/${selectedMonth}`);
      const receiptNumber = generateReceiptNumber(); // Generate unique receipt number
      await update(userRef, {
        monthlyFee,
        otherCharges,
        paidAmount,
        status: totalDue <= 0 ? "Paid" : "Unpaid",
        updatedAt: new Date().toISOString(),
        receiptNumber, // Add receipt number to the update
      });

      // Create history entry
      const historyRef = ref(
        database,
        `users/${id}/feeHistory/${selectedMonth}/${receiptNumber}`
      );
      await update(historyRef, {
        monthlyFee,
        otherCharges,
        paidAmount,
        status: totalDue <= 0 ? "Paid" : "Unpaid",
        updatedAt: new Date().toISOString(),
        receiptNumber,
      });

      toast.success("Fee updated successfully!");
      setEditingId(null);
      resetEditFields();
    } catch (error) {
      toast.error("Failed to update fee");
      setError("Failed to update fee");
    }
  };

  const handleUpdateClassFee = async (classNum) => {
    try {
      const feeAmount = parseInt(newClassFee) || 0;
      const classFeesRef = ref(database, `classFees/${classNum}`);
      await update(classFeesRef, { monthlyFee: feeAmount });
      toast.success("Class fee updated successfully!");
      setEditingClassFee(null);
      setNewClassFee("");
    } catch (error) {
      toast.error("Failed to update class fee");
      setError("Failed to update class fee");
    }
  };

  const resetEditFields = () => {
    setEditMonthlyFee("");
    setEditOtherCharges("");
    setEditPaidAmount("");
  };

  const handleViewReceipt = (studentId, month) => {
    const receiptNumber = receipts[studentId];
    if (!receiptNumber) {
      toast.error("No receipt found for this month");
      return;
    }
    setLoading(true);
    router.push(
      `/pages/account/dashboard/students/paymentReceipt/${studentId}/${receiptNumber}`
    );
  };

  const handleView = (student) => {
    setSelectedStudent(student);
    setIsViewModalOpen(true);
  };

  const handleEdit = (student) => {
    setSelectedStudent(student);
    setEditMonthlyFee(student.monthlyFee.toString());
    setEditOtherCharges(student.otherCharges.toString());
    setEditPaidAmount(student.paidAmount.toString());
    setIsEditModalOpen(true);
  };

  const handleUpdateFeeModal = async () => {
    await handleUpdateFee(selectedStudent.id);
    setIsEditModalOpen(false);
  };

  const filteredStudents = students.filter((student) => {
    const matchesSearch = student.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || student.feeStatus === filterStatus;
    const matchesClass = filterClass === "all" || student.class === filterClass;
    return matchesSearch && matchesStatus && matchesClass;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6 md:p-8"
    >
      <ToastContainer position="top-right" theme="colored" />

      <motion.div
        variants={itemVariants}
        className="max-w-7xl mx-auto backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-2xl overflow-hidden"
      >
        <h2 className="text-2xl sm:text-3xl font-bold p-6 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700">
          Student Fees Management
        </h2>

        {/* Toggle Buttons */}
        <div className="flex flex-wrap gap-3 p-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveSection("students")}
            className={
              activeSection === "students"
                ? activeButtonClassName
                : inactiveButtonClassName
            }
          >
            Edit Student Fees
          </button>
          <button
            onClick={() => setActiveSection("classFees")}
            className={
              activeSection === "classFees"
                ? activeButtonClassName
                : inactiveButtonClassName
            }
          >
            Edit Class Fees
          </button>
        </div>

        {/* Content Section */}
        <div className="p-6">
          {activeSection === "classFees" ? (
            // Class Fees Section
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Class-wise Monthly Fees
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[5, 6, 7, 8, 9, 10, 11, 12].map((classNum) => (
                  <div
                    key={classNum}
                    className="p-4 border rounded-lg dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-colors bg-white dark:bg-gray-800 shadow-md hover:shadow-lg"
                  >
                    <h4 className="font-semibold mb-2">Class {classNum}</h4>
                    {editingClassFee === classNum ? (
                      <div className="flex space-x-2">
                        <input
                          type="number"
                          value={newClassFee}
                          onChange={(e) => setNewClassFee(e.target.value)}
                          className="w-24 border rounded px-2 py-1 dark:bg-gray-700 dark:text-white"
                        />
                        <button
                          onClick={() => handleUpdateClassFee(classNum)}
                          className="text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300"
                        >
                          <CheckCircleIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingClassFee(null);
                            setNewClassFee("");
                          }}
                          className="text-rose-600 hover:text-rose-800 dark:text-rose-400 dark:hover:text-rose-300"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center">
                        <span>₹{classFees[classNum]?.monthlyFee || 0}</span>
                        <button
                          onClick={() => {
                            setEditingClassFee(classNum);
                            setNewClassFee(
                              (classFees[classNum]?.monthlyFee || 0).toString()
                            );
                          }}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            // Students Section
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Controls Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="form-select rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                >
                  {months.map((month) => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                />
                <select
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                  className="form-select rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="all">All Classes</option>
                  {[5, 6, 7, 8, 9, 10, 11, 12].map((classNum) => (
                    <option key={classNum} value={`${classNum}`}>
                      Class {classNum}
                    </option>
                  ))}
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="form-select rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="all">All Status</option>
                  <option value="Paid">Paid</option>
                  <option value="Unpaid">Unpaid</option>
                </select>
              </div>

              {/* Student Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredStudents.map((student) => (
                  <motion.div
                    key={student.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <div className="p-5">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="relative w-12 h-12">
                            <Image
                              src={
                                student.photoURL ||
                                "/images/default-profile-picture-png.png"
                              }
                              alt={student.name}
                              fill
                              className="rounded-full object-cover"
                              onError={(e) => {
                                e.target.src = "/default-avatar.png";
                              }}
                            />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                            {student.name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Class {student.class}
                          </p>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${
                              student.feeStatus === "Paid"
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200"
                                : "bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-200"
                            }`}
                          >
                            {student.feeStatus}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 flex justify-around border-t pt-4 dark:border-gray-600">
                        <button
                          onClick={() => handleView(student)}
                          className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400"
                        >
                          <EyeIcon className="h-5 w-5 mr-1" />
                          <span className="text-sm">View</span>
                        </button>
                        <button
                          onClick={() => handleEdit(student)}
                          className="flex items-center text-emerald-600 hover:text-emerald-800 dark:text-emerald-400"
                        >
                          <PencilIcon className="h-5 w-5 mr-1" />
                          <span className="text-sm">Edit</span>
                        </button>
                        <button
                          onClick={() =>
                            handleViewReceipt(student.id, selectedMonth)
                          }
                          className={`flex items-center ${
                            receipts[student.id]
                              ? "text-purple-600 hover:text-purple-800 dark:text-purple-400"
                              : "text-gray-400 cursor-not-allowed"
                          }`}
                          disabled={!receipts[student.id]}
                          title={
                            !receipts[student.id]
                              ? "No receipt available"
                              : "View receipt"
                          }
                        >
                          <DocumentTextIcon className="h-5 w-5 mr-1" />
                          <span className="text-sm">Receipt</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Student Details"
      >
        {selectedStudent && (
          <div className="space-y-4 text-gray-800 dark:text-gray-200">
            <div>
              <label className="font-medium text-gray-700 dark:text-gray-300">
                Name:
              </label>
              <p className="mt-1">{selectedStudent.name}</p>
            </div>
            <div>
              <label className="font-medium text-gray-700 dark:text-gray-300">
                Class:
              </label>
              <p className="mt-1">{selectedStudent.class}</p>
            </div>
            <div>
              <label className="font-medium text-gray-700 dark:text-gray-300">
                Monthly Fee:
              </label>
              <p className="mt-1">₹{selectedStudent.monthlyFee}</p>
            </div>
            <div>
              <label className="font-medium text-gray-700 dark:text-gray-300">
                Other Charges:
              </label>
              <p className="mt-1">₹{selectedStudent.otherCharges}</p>
            </div>
            <div>
              <label className="font-medium text-gray-700 dark:text-gray-300">
                Previous Month Due:
              </label>
              <p className="mt-1">₹{selectedStudent.previousMonthDue}</p>
            </div>
            <div>
              <label className="font-medium text-gray-700 dark:text-gray-300">
                Paid Amount:
              </label>
              <p className="mt-1">₹{selectedStudent.paidAmount}</p>
            </div>
            <div>
              <label className="font-medium text-gray-700 dark:text-gray-300">
                Status:
              </label>
              <p className="mt-1">{selectedStudent.feeStatus}</p>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Fee Details"
      >
        {selectedStudent && (
          <>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Monthly Fee
                </label>
                <p className="text-gray-600 dark:text-gray-400">
                  ₹{selectedStudent.monthlyFee}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Other Charges
                </label>
                <input
                  type="number"
                  value={editOtherCharges}
                  onChange={(e) => setEditOtherCharges(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Paid Amount
                </label>
                <input
                  type="number"
                  value={editPaidAmount}
                  onChange={(e) => setEditPaidAmount(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleUpdateFeeModal}
                className="flex items-center justify-center bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white p-2 sm:px-6 sm:py-2 rounded-lg transition-colors"
              >
                <CheckIcon className="h-5 w-5" />
                <span className="hidden sm:inline-block sm:ml-2">
                  Save Changes
                </span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsEditModalOpen(false)}
                className="flex items-center justify-center bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 p-2 sm:px-6 sm:py-2 rounded-lg transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
                <span className="hidden sm:inline-block sm:ml-2">Cancel</span>
              </motion.button>
            </div>
          </>
        )}
      </Modal>

      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 text-rose-600 dark:text-rose-400 text-center font-medium"
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  );
};

export default PaymentsRequest;
