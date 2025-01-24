"use client"
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { FaEdit, FaTrash, FaSave, FaTimes, FaPlus } from 'react-icons/fa';

const SubjectCreate = () => {
    const [subjects, setSubjects] = useState([]);
    const [newSubject, setNewSubject] = useState({ name: '', description: '' });
    const [editingSubject, setEditingSubject] = useState(null);

    useEffect(() => {
        fetchSubjects();
    }, []);

    const fetchSubjects = async () => {
        try {
            // const response = await axios.get('/api/subjects');
            // setSubjects(response.data);
            
            // For testing, using sample data instead of API call
            const sampleData = [
                { _id: '1', name: 'Mathematics', description: 'Advanced calculus and algebra' },
                { _id: '2', name: 'Physics', description: 'Classical mechanics and thermodynamics' },
                { _id: '3', name: 'Chemistry', description: 'Organic and inorganic chemistry' },
                { _id: '4', name: 'Biology', description: 'Cell biology and genetics' }
            ];
            setSubjects(sampleData);
            // Comment out the actual API call for testing
            // const response = await axios.get('/api/subjects');
            // setSubjects(response.data);
        } catch (error) {
            console.error('Error fetching subjects:', error);
            toast.error('Failed to load subjects');
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/subjects', newSubject);
            setSubjects([...subjects, response.data]);
            setNewSubject({ name: '', description: '' });
            toast.success('Subject created successfully');
        } catch (error) {
            console.error('Error creating subject:', error);
            toast.error('Failed to create subject');
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put(`/api/subjects/${editingSubject._id}`, editingSubject);
            setSubjects(subjects.map(subject => 
                subject._id === editingSubject._id ? response.data : subject
            ));
            setEditingSubject(null);
            toast.success('Subject updated successfully');
        } catch (error) {
            console.error('Error updating subject:', error);
            toast.error('Failed to update subject');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this subject?')) {
            try {
                await axios.delete(`/api/subjects/${id}`);
                setSubjects(subjects.filter(subject => subject._id !== id));
                toast.success('Subject deleted successfully');
            } catch (error) {
                console.error('Error deleting subject:', error);
                toast.error('Failed to delete subject');
            }
        }
    };

    return (
        <div className="p-4 max-w-7xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">Manage Subjects</h2>

            {/* Create Form */}
            <form onSubmit={handleCreate} className="mb-8">
                <div className="flex flex-col md:flex-row gap-4">
                    <input
                        type="text"
                        placeholder="Subject Name"
                        value={newSubject.name}
                        onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                        className="border p-2 rounded flex-1 w-full"
                        required
                    />
                    <input
                        type="text"
                        placeholder="Description"
                        value={newSubject.description}
                        onChange={(e) => setNewSubject({ ...newSubject, description: e.target.value })}
                        className="border p-2 rounded flex-1 w-full"
                    />
                    <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded flex items-center justify-center gap-2 w-full md:w-auto">
                        <FaPlus className="text-sm" />
                        <span>Create Subject</span>
                    </button>
                </div>
            </form>

            {/* Subjects List */}
            <div className="space-y-4">
                {subjects.map((subject) => (
                    <div key={subject._id} className="border p-4 rounded shadow-sm hover:shadow-md transition-shadow">
                        {editingSubject?._id === subject._id ? (
                            <form onSubmit={handleUpdate} className="flex flex-col md:flex-row gap-4">
                                <input
                                    type="text"
                                    value={editingSubject.name}
                                    onChange={(e) => setEditingSubject({ ...editingSubject, name: e.target.value })}
                                    className="border p-2 rounded flex-1"
                                    required
                                />
                                <input
                                    type="text"
                                    value={editingSubject.description}
                                    onChange={(e) => setEditingSubject({ ...editingSubject, description: e.target.value })}
                                    className="border p-2 rounded flex-1"
                                />
                                <div className="flex gap-2 justify-end">
                                    <button type="submit" className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2">
                                        <FaSave />
                                        <span className="hidden md:inline">Save</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setEditingSubject(null)}
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
                                    <h3 className="font-bold text-lg">{subject.name}</h3>
                                    <p className="text-gray-600">{subject.description}</p>
                                </div>
                                <div className="flex gap-2 justify-end">
                                    <button
                                        onClick={() => setEditingSubject(subject)}
                                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded flex items-center gap-2"
                                    >
                                        <FaEdit />
                                        <span className="hidden md:inline">Edit</span>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(subject._id)}
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

export default SubjectCreate;
