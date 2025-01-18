import React, { useState } from 'react'

const EditNoticeModel = ({ notice, onClose, onSave }) => {

    const [formData, setFormData] = useState({
        id: notice.id,
        title: notice.title,
        content: notice.content,
        type: notice.type,
    });

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full p-6">
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Edit Notice</h3>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    onSave(formData);
                }}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="mt-1 block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm 
                    focus:border-blue-500 focus:ring-blue-500 
                    dark:bg-gray-700 dark:border-gray-600 dark:text-white
                    transition-colors duration-200"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Content</label>
                            <textarea
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                rows="4"
                                className="mt-1 block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm 
                    focus:border-blue-500 focus:ring-blue-500 
                    dark:bg-gray-700 dark:border-gray-600 dark:text-white
                    transition-colors duration-200 resize-none"
                            ></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="mt-1 block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm 
                    focus:border-blue-500 focus:ring-blue-500 
                    dark:bg-gray-700 dark:border-gray-600 dark:text-white
                    transition-colors duration-200"
                            >
                                <option value="general">General</option>
                                <option value="urgent">Urgent</option>
                            </select>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditNoticeModel
