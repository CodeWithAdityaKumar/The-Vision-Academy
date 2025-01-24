'use client'
import CreateTeachersNotice from '@/components/dashboard/admin/Notices/TeachersNotice/CreateTeachersNotice'
import ManageTeachersNotice from '@/components/dashboard/admin/Notices/TeachersNotice/ManageTeachersNotice'
import React, { useState } from 'react'

const Page = () => {
    const [showCreateNotice, setShowCreateNotice] = useState(false)

    return (
        <div className="container mx-auto px-4">
            <div className="flex justify-end my-4">
                <button
                    onClick={() => setShowCreateNotice(!showCreateNotice)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md shadow-sm transition-all duration-300 flex items-center justify-center gap-2 group"
                >
                    {showCreateNotice ? (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:-translate-y-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                            Hide Create Notice
                        </>
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-y-[-2px] transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Create New Notice
                        </>
                    )}
                </button>
            </div>
            
            {showCreateNotice && (
                <div className="mb-6">
                    <CreateTeachersNotice />
                </div>
            )}
            
            <ManageTeachersNotice />
        </div>
    )
}

export default Page
