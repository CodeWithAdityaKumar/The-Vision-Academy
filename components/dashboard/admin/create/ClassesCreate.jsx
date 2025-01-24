"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import { FaEdit, FaTrash, FaSave, FaTimes, FaPlus } from "react-icons/fa";

const ClassesCreate = () => {
  const [classes, setClasses] = useState([]);
  const [newClass, setNewClass] = useState({
    className: "",
    description: "",
    startDate: "",
  });
  const [editingClass, setEditingClass] = useState(null);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      // For testing, using sample data instead of API call
      const sampleData = [
        {
          _id: "1",
          className: "Class 10th",
          description: "Advanced Level Class",
          startDate: "2024-01-01",
        },
        {
          _id: "2",
          className: "Class 12th",
          description: "JEE Preparation",
          startDate: "2024-01-15",
        },
      ];
      setClasses(sampleData);
      // Uncomment for actual API integration
      // const response = await axios.get('/api/classes');
      // setClasses(response.data);
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast.error("Failed to load classes");
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/classes", newClass);
      setClasses([...classes, response.data]);
      setNewClass({
        className: "",
        description: "",
        startDate: "",
      });
      toast.success("Class created successfully");
    } catch (error) {
      console.error("Error creating class:", error);
      toast.error("Failed to create class");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `/api/classes/${editingClass._id}`,
        editingClass
      );
      setClasses(
        classes.map((cls) =>
          cls._id === editingClass._id ? response.data : cls
        )
      );
      setEditingClass(null);
      toast.success("Class updated successfully");
    } catch (error) {
      console.error("Error updating class:", error);
      toast.error("Failed to update class");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this class?")) {
      try {
        await axios.delete(`/api/classes/${id}`);
        setClasses(classes.filter((cls) => cls._id !== id));
        toast.success("Class deleted successfully");
      } catch (error) {
        console.error("Error deleting class:", error);
        toast.error("Failed to delete class");
      }
    }
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">
        Manage Classes
      </h2>

      {/* Create Form */}
      <form onSubmit={handleCreate} className="mb-8 space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <input
            type="text"
            placeholder="Class Name"
            value={newClass.className}
            onChange={(e) =>
              setNewClass({ ...newClass, className: e.target.value })
            }
            className="border p-2 rounded w-full"
            required
          />
          <input
            type="text"
            placeholder="Description"
            value={newClass.description}
            onChange={(e) =>
              setNewClass({ ...newClass, description: e.target.value })
            }
            className="border p-2 rounded w-full"
          />
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="date"
              value={newClass.startDate}
              onChange={(e) =>
                setNewClass({ ...newClass, startDate: e.target.value })
              }
              className="border p-2 rounded flex-1"
              required
            />
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded flex items-center justify-center gap-2"
            >
              <FaPlus className="text-sm" />
              <span>Create Class</span>
            </button>
          </div>
        </div>
      </form>

      {/* Classes List */}
      <div className="space-y-4">
        {classes.map((cls) => (
          <div
            key={cls._id}
            className="border p-4 rounded shadow-sm hover:shadow-md transition-shadow"
          >
            {editingClass?._id === cls._id ? (
              <form onSubmit={handleUpdate} className="space-y-4">
                <input
                  type="text"
                  value={editingClass.className}
                  onChange={(e) =>
                    setEditingClass({
                      ...editingClass,
                      className: e.target.value,
                    })
                  }
                  className="border p-2 rounded w-full"
                  required
                />
                <input
                  type="text"
                  value={editingClass.description}
                  onChange={(e) =>
                    setEditingClass({
                      ...editingClass,
                      description: e.target.value,
                    })
                  }
                  className="border p-2 rounded w-full"
                />
                <div className="flex gap-2 justify-end">
                  <button
                    type="submit"
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2"
                  >
                    <FaSave />
                    <span className="hidden md:inline">Save</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingClass(null)}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded flex items-center gap-2"
                  >
                    <FaTimes />
                    <span className="hidden md:inline">Cancel</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-lg">{cls.className}</h3>
                  <p className="text-gray-600">{cls.description}</p>
                  <p className="text-gray-600">
                    Start Date: {new Date(cls.startDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setEditingClass(cls)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded flex items-center gap-2"
                  >
                    <FaEdit />
                    <span className="hidden md:inline">Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(cls._id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded flex items-center gap-2"
                  >
                    <FaTrash />
                    <span className="hidden md:inline">Delete</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClassesCreate;
