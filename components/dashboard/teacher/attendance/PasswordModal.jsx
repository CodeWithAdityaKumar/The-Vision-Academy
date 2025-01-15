import { useState } from 'react';
import { motion } from 'framer-motion';

const PasswordModal = ({ onVerify, onClose, error }) => {
    const [password, setPassword] = useState('');
    // const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        onVerify(password);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96 mx-[1.5rem]">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    Enter Attendance Password
                </h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-2 border rounded-md mb-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="Enter password"
                        required
                    />
                    {error && (
                        <p className="text-red-500 text-sm mb-4">{error}</p>
                    )}
                    <div className="flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 dark:text-gray-300"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                        >
                            Verify
                        </button>
                    </div>
                </form>
            </div>
        </motion.div>
    );
};

export default PasswordModal;