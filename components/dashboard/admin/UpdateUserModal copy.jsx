"use client";
import { useState } from "react";
import { ref, update } from "firebase/database";
import { storage, database } from "@/lib/firebase";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { motion } from "framer-motion";

export default function UpdateUserModal({ user, onClose, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: user.name || "",
    email: user.email || "",
    role: user.role || "student",
    subject: user.subject || "",
    class: user.class || "",
    phone: user.phone || "",
    whatsapp: user.whatsapp || "",
    about: user.about || "",
    photoURL: user.photoURL || "/images/default-profile-picture-png.png",
    socialLinks: {
      facebook: user.socialLinks?.facebook || "",
      instagram: user.socialLinks?.instagram || "",
      linkedin: user.socialLinks?.linkedin || "",
    },
    rollNumber: user.rollNumber || "",
    dateOfJoining: user.dateOfJoining || new Date().toISOString().split("T")[0],
    fatherName: user.fatherName || "",
    motherName: user.motherName || "",
    addressPermanent: user.addressPermanent || "",
    pincodePermanent: user.pincodePermanent || "",
    addressCurrent: user.addressCurrent || "",
    pincodeCurrent: user.pincodeCurrent || "",
    sameAsPermament: user.sameAsPermament || false,
    session: user.session || new Date().getFullYear(),
    nationality: user.nationality || "India",
    dateOfBirth: user.dateOfBirth || "",
    board: user.board || "CBSE",
    aadharNumber: user.aadharNumber || "",
    bloodGroup: user.bloodGroup || "",
    category: user.category || "General",
    religion: user.religion || "",
    gender: user.gender || "Male",
    contactPersonal: user.contactPersonal || "",
    contactParents: user.contactParents || "",
    schoolName: user.schoolName || "",
  });

  const [userType, setUserType] = useState(() => {
    if (user.role === 'teacher') return 'teachers';
    if (user.role === 'student') return 'students';
    return 'admin';
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setLoading(true);
      try {
        const storageReference = storageRef(
          storage,
          `profile-photos/${Date.now()}-${file.name}`
        );
        await uploadBytes(storageReference, file);
        const downloadURL = await getDownloadURL(storageReference);
        setFormData({ ...formData, photoURL: downloadURL });
      } catch (error) {
        setError("Failed to upload image");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSameAddress = (e) => {
    if (e.target.checked) {
      setFormData((prev) => ({
        ...prev,
        sameAsPermament: true,
        addressCurrent: prev.addressPermanent,
        pincodeCurrent: prev.pincodePermanent,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        sameAsPermament: false,
        addressCurrent: "",
        pincodeCurrent: "",
      }));
    }
  };

  const handleUserTypeChange = (type) => {
    setUserType(type);
    const role = type === 'teachers' ? 'teacher' : type === 'students' ? 'student' : 'admin';
    setFormData(prev => ({ ...prev, role }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const userRef = ref(database, `users/${user.id}`);
      await update(userRef, formData);
      onUpdate();
    } catch (error) {
      setError("Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 overflow-y-auto min-h-screen" style={{margin: "4rem 1rem 0rem 1rem", paddingBottom: "4rem"}}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-[95%] sm:max-w-[85%] md:max-w-3xl lg:max-w-4xl my-4 sm:my-8 mx-auto relative"
      >
        {/* Header Section */}
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            Update User
          </h2>

          {error && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* User Type Selection */}
          <div className="mt-4 sm:mt-6 flex flex-wrap gap-2 sm:gap-4">
            {[
              { type: 'teachers', label: 'Teacher' },
              { type: 'students', label: 'Student' },
              { type: 'admin', label: 'Admin' }
            ].map(({ type, label }) => (
              <button
                key={type}
                onClick={() => handleUserTypeChange(type)}
                className={`px-4 py-2 rounded-lg ${
                  userType === type
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Profile Image Section */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <img
                src={formData.photoURL}
                alt="Profile Preview"
                className="h-24 w-24 sm:h-32 sm:w-32 rounded-full object-cover border-4 border-gray-200"
              />
              <label
                htmlFor="photo-upload"
                className="absolute bottom-0 right-0 bg-red-600 text-white p-1.5 sm:p-2 rounded-full cursor-pointer hover:bg-red-700"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </label>
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </div>

          <div className="space-y-4 sm:space-y-6">
            {/* Basic Information */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 flex-wrap">
              <div className="w-full sm:w-[calc(50%-12px)]">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
              <div className="w-full sm:w-[calc(50%-12px)]">
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
              {userType === 'teachers' && (
                <div className="w-full sm:w-[calc(50%-12px)]">
                  <input
                    type="text"
                    placeholder="Subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300"
                    required
                  />
                </div>
              )}
            </div>

            {userType === 'students' && (
              <>
                {/* Student Information */}
                <div className="flex flex-wrap gap-4 sm:gap-6">
                  <div className="w-full sm:w-[calc(50%-12px)]">
                    <input
                      type="text"
                      placeholder="Class"
                      value={formData.class}
                      onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300"
                      required
                    />
                  </div>
                  <div className="w-full sm:w-[calc(50%-12px)]">
                    <input
                      type="date"
                      value={formData.dateOfJoining}
                      onChange={(e) => setFormData({ ...formData, dateOfJoining: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300"
                      required
                    />
                  </div>
                  <div className="w-full sm:w-[calc(50%-12px)]">
                    <input
                      type="number"
                      placeholder="Roll Number"
                      value={formData.rollNumber}
                      onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300"
                      required
                    />
                  </div>
                  <div className="w-full sm:w-[calc(50%-12px)]">
                    <input
                      type="text"
                      placeholder="Father's Name"
                      value={formData.fatherName}
                      onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300"
                      required
                    />
                  </div>
                  <div className="w-full sm:w-[calc(50%-12px)]">
                    <input
                      type="text"
                      placeholder="Mother's Name (Optional)"
                      value={formData.motherName}
                      onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300"
                    />
                  </div>
                  <div className="w-full">
                    <textarea
                      placeholder="Permanent Address"
                      value={formData.addressPermanent}
                      onChange={(e) => setFormData({ ...formData, addressPermanent: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300"
                      rows={3}
                      required
                    />
                  </div>
                  <div className="w-full sm:w-[calc(50%-12px)]">
                    <input
                      type="number"
                      placeholder="Permanent Address Pincode"
                      value={formData.pincodePermanent}
                      onChange={(e) => setFormData({ ...formData, pincodePermanent: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300"
                      required
                    />
                  </div>
                  <div className="w-full">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.sameAsPermament}
                        onChange={handleSameAddress}
                        className="rounded border-gray-300"
                      />
                      <span className="text-base">Same as Permanent Address</span>
                    </label>
                  </div>
                  {!formData.sameAsPermament && (
                    <>
                      <div className="w-full">
                        <textarea
                          placeholder="Current Address"
                          value={formData.addressCurrent}
                          onChange={(e) => setFormData({ ...formData, addressCurrent: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300"
                          rows={3}
                          required
                        />
                      </div>
                      <div className="w-full sm:w-[calc(50%-12px)]">
                        <input
                          type="number"
                          placeholder="Current Address Pincode"
                          value={formData.pincodeCurrent}
                          onChange={(e) => setFormData({ ...formData, pincodeCurrent: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300"
                          required
                        />
                      </div>
                    </>
                  )}
                  <div className="w-full sm:w-[calc(50%-12px)]">
                    <input
                      type="number"
                      placeholder="Session Year"
                      value={formData.session}
                      onChange={(e) => setFormData({ ...formData, session: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300"
                      required
                    />
                  </div>
                  <div className="w-full sm:w-[calc(50%-12px)]">
                    <input
                      type="date"
                      placeholder="Date of Birth"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300"
                      required
                    />
                  </div>
                </div>

                {/* Address and Additional Info Section */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 sm:p-6">
                  <div className="flex flex-col gap-4 sm:gap-6">
                    {/* Radio Groups */}
                    <div className="w-full space-y-4">
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                        <label className="block text-sm font-medium mb-2">Board</label>
                        <div className="flex flex-wrap gap-4">
                          {['CBSE', 'BSEB', 'OTHER'].map((board) => (
                            <label key={board} className="inline-flex items-center">
                              <input
                                type="radio"
                                value={board}
                                checked={formData.board === board}
                                onChange={(e) => setFormData({ ...formData, board: e.target.value })}
                                className="form-radio text-red-600"
                              />
                              <span className="ml-2 text-base">{board}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Category Selection */}
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                        <label className="block text-sm font-medium mb-2">Category</label>
                        <div className="flex flex-wrap gap-4">
                          {['General', 'OBC', 'SC/ST'].map((cat) => (
                            <label key={cat} className="inline-flex items-center">
                              <input
                                type="radio"
                                value={cat}
                                checked={formData.category === cat}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="form-radio text-red-600"
                              />
                              <span className="ml-2 text-base">{cat}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Gender Selection */}
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                        <label className="block text-sm font-medium mb-2">Gender</label>
                        <div className="flex flex-wrap gap-4">
                          {['Male', 'Female', 'Other'].map((gender) => (
                            <label key={gender} className="inline-flex items-center">
                              <input
                                type="radio"
                                value={gender}
                                checked={formData.gender === gender}
                                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                className="form-radio text-red-600"
                              />
                              <span className="ml-2 text-base">{gender}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Additional Fields */}
                    <div className="flex flex-wrap gap-4 sm:gap-6">
                      <div className="w-full sm:w-[calc(50%-12px)]">
                        <input
                          type="text"
                          placeholder="Aadhar Number"
                          value={formData.aadharNumber}
                          onChange={(e) => setFormData({ ...formData, aadharNumber: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300"
                          minLength={12}
                          maxLength={12}
                          required
                        />
                      </div>
                      <div className="w-full sm:w-[calc(50%-12px)]">
                        <input
                          type="text"
                          placeholder="Blood Group (Optional)"
                          value={formData.bloodGroup}
                          onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300"
                        />
                      </div>
                      <div className="w-full sm:w-[calc(50%-12px)]">
                        <input
                          type="text"
                          placeholder="Religion"
                          value={formData.religion}
                          onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300"
                          required
                        />
                      </div>
                      <div className="w-full sm:w-[calc(50%-12px)]">
                        <input
                          type="tel"
                          placeholder="Personal Contact"
                          value={formData.contactPersonal}
                          onChange={(e) => setFormData({ ...formData, contactPersonal: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300"
                          required
                        />
                      </div>
                      <div className="w-full sm:w-[calc(50%-12px)]">
                        <input
                          type="tel"
                          placeholder="Parents Contact"
                          value={formData.contactParents}
                          onChange={(e) => setFormData({ ...formData, contactParents: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300"
                          required
                        />
                      </div>
                      <div className="w-full sm:w-[calc(50%-12px)]">
                        <input
                          type="text"
                          placeholder="School Name"
                          value={formData.schoolName}
                          onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Contact Information */}
            <div className="flex flex-wrap gap-4 sm:gap-6">
              <div className="w-full sm:w-[calc(50%-12px)]">
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300"
                  required
                />
              </div>
              <div className="w-full sm:w-[calc(50%-12px)]">
                <input
                  type="tel"
                  placeholder="WhatsApp Number"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300"
                />
              </div>
            </div>

            {/* Social Media Section */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 sm:pt-6">
              <h4 className="text-lg font-medium mb-4">Social Media Links</h4>
              <div className="flex flex-wrap gap-4 sm:gap-6">
                <div className="w-full sm:w-[calc(33.333%-16px)]">
                  <input
                    type="url"
                    placeholder="Facebook URL"
                    value={formData.socialLinks.facebook}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialLinks: { ...formData.socialLinks, facebook: e.target.value },
                      })
                    }
                    className="w-full px-4 py-2 rounded-lg border border-gray-300"
                  />
                </div>
                <div className="w-full sm:w-[calc(33.333%-16px)]">
                  <input
                    type="url"
                    placeholder="Instagram URL"
                    value={formData.socialLinks.instagram}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialLinks: { ...formData.socialLinks, instagram: e.target.value },
                      })
                    }
                    className="w-full px-4 py-2 rounded-lg border border-gray-300"
                  />
                </div>
                <div className="w-full sm:w-[calc(33.333%-16px)]">
                  <input
                    type="url"
                    placeholder="LinkedIn URL"
                    value={formData.socialLinks.linkedin}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialLinks: { ...formData.socialLinks, linkedin: e.target.value },
                      })
                    }
                    className="w-full px-4 py-2 rounded-lg border border-gray-300"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 text-sm sm:text-base rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-4 sm:px-6 py-2 text-sm sm:text-base rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update User"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
