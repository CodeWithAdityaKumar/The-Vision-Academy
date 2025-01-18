"use client"

import FloatingPlusIcon from "@/components/dashboard/student/FloatingPlusIcon"
import SideBarMenu from "@/components/dashboard/student/SideBarMenu"

export default function AdminLayout({ children }) {

    return (
        <>
            <div className="flex">

                <SideBarMenu />
                <FloatingPlusIcon />
                <div className="w-full">

                    {children}
                </div>
            </div>
        </>
    )
}