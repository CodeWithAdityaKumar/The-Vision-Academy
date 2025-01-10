import { CircularProgress } from '@mui/material';

const Progress = () => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md transition-all duration-300">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Your Progress</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-4 bg-amber-50 dark:bg-gray-700 p-4 rounded-lg hover:shadow-lg transition-all duration-300">
                    <CircularProgress variant="determinate" value={85} size={60} sx={{ color: '#F59E0B' }} />
                    <div>
                        <p className="text-gray-600 dark:text-gray-300">Last Test Score</p>
                        <p className="text-xl font-semibold text-gray-800 dark:text-amber-400">85/100</p>
                    </div>
                </div>
                <div className="flex items-center space-x-4 bg-amber-50 dark:bg-gray-700 p-4 rounded-lg hover:shadow-lg transition-all duration-300">
                    <CircularProgress variant="determinate" value={85} size={60} sx={{ color: '#F59E0B' }} />
                    <div>
                        <p className="text-gray-600 dark:text-gray-300">Attendance</p>
                        <p className="text-xl font-semibold text-gray-800 dark:text-amber-400">85%</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Progress
